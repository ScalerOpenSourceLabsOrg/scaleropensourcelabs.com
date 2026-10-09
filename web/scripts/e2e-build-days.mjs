// Drive the whole Build Day flow in a real browser, against the Auth and Firestore
// emulators: an organiser schedules a Build Day, takes the roll, and the member reads
// their own record back.
//
//   Terminal 1:  npx firebase-tools emulators:start --only firestore,auth --project demo-osc
//   Terminal 2:  npm run dev -- -p 3001
//   Terminal 3:  SITE_URL=http://localhost:3001 npm run e2e:build-days
//
// WHY THIS EXISTS, AND IT IS NOT "the rules tests cover it". The rules suite proves the
// DATABASE refuses the wrong people. It cannot see any of these:
//
//   1. The roll header's `taken_at` is frozen by the rules after the first write. A screen
//      that kept its own optimistic copy would be holding the serverTimestamp() SENTINEL
//      rather than a time, so the FIRST tick of a session would succeed and the SECOND
//      would be refused — which no single-write test catches and every real roll call
//      hits within five seconds. This suite ticks twice for exactly that reason.
//
//   2. `present_count` on the header has to agree with the number of rows underneath it.
//      Nothing in the rules can check that; it is arithmetic in the client.
//
//   3. Optional fields are OMITTED rather than written empty, because the rules' size
//      checks refuse "" — so clearing a blocker by blanking the box has to remove the key
//      rather than send an empty string, or the whole write fails with a permission error
//      that names nothing.
//
// Each of those is a green rules suite and a broken screen.

import pw from "playwright";

const { chromium } = pw;
const BASE = (process.env.SITE_URL ?? "http://localhost:3001").replace(/\/$/, "");
const PROJECT = process.env.FIREBASE_PROJECT ?? "demo-osc";
const DOCS = `http://127.0.0.1:8080/v1/projects/${PROJECT}/databases/(default)/documents`;
const AUTH_CLEAR = `http://127.0.0.1:9099/emulator/v1/projects/${PROJECT}/accounts`;
const FS_CLEAR = `http://127.0.0.1:8080/emulator/v1/projects/${PROJECT}/databases/(default)/documents`;

const STAMP = Date.now().toString(36);
// REAL-SHAPED ADDRESSES, because lib/batch.ts parses batch and branch out of the local
// part. They used to be the dev login's two identities; that control is gone, so this
// suite signs in through the emulator's popup the way e2e-mentorship.mjs does, and seeds
// the organiser's admins row itself.
const ORG = "dev.22bcs10002@sst.scaler.com";
const MEMBER = "dev.23bcs10045@sst.scaler.com";
const TITLE = `Build Day ${STAMP}`;

let pass = 0;
let fail = 0;
const ok = (label, cond, extra = "") => {
  if (cond) {
    pass++;
    console.log(`  PASS  ${label}`);
  } else {
    fail++;
    console.log(`  FAIL  ${label}${extra ? `  ${extra}` : ""}`);
  }
};

async function up(url, what) {
  try {
    await fetch(url);
    return true;
  } catch {
    console.error(
      `\n  No ${what} emulator. Start both from the repo root:\n` +
        `    npx firebase-tools emulators:start --only firestore,auth --project ${PROJECT}\n`,
    );
    process.exit(1);
  }
}

const owner = { Authorization: "Bearer owner" };

async function listDocs(coll) {
  const r = await fetch(`${DOCS}/${coll}`, { headers: owner });
  if (!r.ok) return [];
  return (await r.json()).documents ?? [];
}

async function getDoc(path) {
  const r = await fetch(`${DOCS}/${path}`, { headers: owner });
  return r.ok ? await r.json() : null;
}

async function authAccounts() {
  try {
    const r = await fetch(
      `http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1/projects/${PROJECT}/accounts:query`,
      {
        method: "POST",
        headers: { ...owner, "Content-Type": "application/json" },
        body: "{}",
      },
    );
    return ((await r.json())?.userInfo ?? []).map((u) => (u.email ?? "").toLowerCase());
  } catch {
    return [];
  }
}

/** Seed the organiser's admins row the way a console edit would — the rules only let an
 *  OWNER write that collection, and there is no owner yet on a clean emulator. */
async function seedAdmin(email) {
  const r = await fetch(`${DOCS}/admins/${encodeURIComponent(email)}`, {
    method: "PATCH",
    headers: { ...owner, "Content-Type": "application/json" },
    body: JSON.stringify({
      fields: {
        email: { stringValue: email },
        name: { stringValue: "Test Organiser" },
        role: { stringValue: "owner" },
        active: { booleanValue: true },
        added_by: { stringValue: "console" },
      },
    }),
  });
  return r.ok;
}

/** Sign in through the emulator's popup, and do not return until the account exists.
 *  Ported from e2e-mentorship.mjs, which carries the notes on why it types rather than
 *  fills, presses submit repeatedly, and exits on the account appearing. */
async function signIn(ctx, pg, email, name) {
  // WAIT FOR THE BUTTON, NOT A TIMER: `next dev` can take well over a minute to compile
  // /dashboard the first time it is asked for.
  await pg.goto(`${BASE}/dashboard`, { waitUntil: "domcontentloaded", timeout: 120000 });
  const google = pg.getByRole("button", { name: /continue with google/i });
  await google.waitFor({ timeout: 120000 });
  // The button is server-rendered, so it paints before React attaches the handler.
  await pg.waitForTimeout(3000);
  const popupP = ctx.waitForEvent("page", { timeout: 30000 });
  await google.click();
  const pop = await popupP;
  await pop.waitForLoadState("domcontentloaded");
  await pop.waitForTimeout(800);

  await pop.evaluate(() => {
    const el = [...document.querySelectorAll("button, a, [role=button]")].find((n) =>
      /add new account/i.test(n.innerText || ""),
    );
    el?.scrollIntoView({ block: "center" });
    el?.click();
  });
  await pop.waitForTimeout(900);

  await pop.locator("#email-input").pressSequentially(email, { delay: 8 });
  await pop.locator("#display-name-input").pressSequentially(name, { delay: 8 });
  await pop.waitForTimeout(700);

  const wanted = email.toLowerCase();
  for (let i = 0; i < 10 && !pop.isClosed(); i++) {
    await pop
      .evaluate(() => {
        const b = [...document.querySelectorAll("button")].find((n) =>
          /sign in with google/i.test(n.innerText),
        );
        b?.click();
      })
      .catch(() => {});
    for (let w = 0; w < 8; w++) {
      await new Promise((r) => setTimeout(r, 500));
      if ((await authAccounts()).includes(wanted) || pop.isClosed()) break;
    }
    if ((await authAccounts()).includes(wanted)) break;
  }
  if (!pop.isClosed()) await pop.close().catch(() => {});
  if (!(await authAccounts()).includes(wanted)) {
    throw new Error(`emulator never created an account for ${email} — the popup did not submit`);
  }
  await pg.waitForTimeout(3000);
}

/** Finish the profile. A member with an incomplete one is held at /onboarding and every
 *  dashboard route renders nothing, which would otherwise show up here as "the Build Days
 *  section is missing". */
async function onboard(pg, name) {
  await pg.goto(`${BASE}/dashboard`, { waitUntil: "domcontentloaded", timeout: 60000 });
  await pg.waitForURL(/\/onboarding/, { timeout: 25000 }).catch(() => {});
  if (!/\/onboarding/.test(pg.url())) return false;
  await pg.fill("#pf-name", name).catch(() => {});
  await pg.check('input[name="hostel"][value="uniworld-1"]').catch(() => {});
  await pg.getByRole("button", { name: /finish joining/i }).click().catch(() => {});
  await pg.waitForURL(/\/dashboard/, { timeout: 30000 }).catch(() => {});
  return true;
}

/** A datetime-local value an hour ago. THE SESSION HAS TO BE IN THE PAST: a roll cannot be
 *  taken at a Build Day that has not started, so a future one would never appear in the
 *  picker and every assertion below would fail for a reason that has nothing to do with
 *  the roll. */
function anHourAgo() {
  const d = new Date(Date.now() - 3600_000);
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}

await up(`${DOCS}/sessions`, "Firestore");
await up(AUTH_CLEAR, "Auth");
await fetch(FS_CLEAR, { method: "DELETE" }).catch(() => {});
// AUTH IS CLEARED TOO, so the popup always takes the "new account" path and a rerun is a
// rerun rather than a different scenario.
await fetch(AUTH_CLEAR, { method: "DELETE" }).catch(() => {});

const browser = await chromium.launch({ args: ["--disable-popup-blocking"] });

console.log("\n-- an organiser schedules a Build Day --");
const ctxA = await browser.newContext({ viewport: { width: 1500, height: 1200 } });
const org = await ctxA.newPage();
const orgErrs = [];
org.on("pageerror", (e) => orgErrs.push(e.message.slice(0, 140)));

ok("the organiser has an admins row", await seedAdmin(ORG));
await signIn(ctxA, org, ORG, "Test Organiser");
await onboard(org, "Test Organiser");

await org.goto(`${BASE}/admin/sessions`, { waitUntil: "domcontentloaded", timeout: 120000 });
await org.waitForSelector("#se-title, button", { timeout: 120000 }).catch(() => {});
await org.waitForTimeout(9000);

const schedule = org.getByRole("button", { name: /schedule/i });
ok("the sessions screen offers a scheduler", (await schedule.count()) > 0);
if (await schedule.count()) {
  await schedule.first().click();
  await org.waitForTimeout(700);
  await org.fill("#se-title", TITLE);
  await org.fill("#se-when", anHourAgo());
  await org.fill("#se-loc", "Uniworld reading room");
  // THE CHECKBOX THIS WHOLE FEATURE HANGS OFF. Without it the session is an ordinary one
  // and never reaches the roll call.
  await org
    .getByText(/this is a build day/i)
    .click()
    .catch(() => {});
  await org.waitForTimeout(400);
  await org.getByRole("button", { name: /put it on the calendar|save changes/i }).click();
  await org.waitForTimeout(3500);
}

const sessions = await listDocs("sessions");
const sid = sessions[0]?.name?.split("/").pop();
ok("a session document exists", sessions.length === 1, `(found ${sessions.length})`);
ok("it is marked as a Build Day", sessions[0]?.fields?.kind?.stringValue === "build-day");

console.log("\n-- a member joins --");
// A SECOND BROWSER PROCESS, not a second context. The Auth emulator's popup handler stops
// responding after the first successful sign-in in a browser — diagnosed at length in
// e2e-auth.mjs and e2e-mentorship.mjs.
const memberBrowser = await chromium.launch({ args: ["--disable-popup-blocking"] });
const ctxB = await memberBrowser.newContext({ viewport: { width: 1500, height: 1200 } });
const mem = await ctxB.newPage();
const memErrs = [];
mem.on("pageerror", (e) => memErrs.push(e.message.slice(0, 140)));

await signIn(ctxB, mem, MEMBER, "Test Member");
ok("a first-time member is sent to finish joining", await onboard(mem, "Test Member"));

console.log("\n-- the organiser takes the roll --");
await org.goto(`${BASE}/admin/build-days`, { waitUntil: "domcontentloaded", timeout: 120000 });
// WAIT FOR THE PICKER, NOT FOR A TIMER. `next dev` compiles a route the first time it is
// asked for, and on this repo that has been measured at over ninety seconds — so a fixed
// five-second wait asserts against a page that has not rendered yet and every check below
// fails for a reason that has nothing to do with the roll.
await org.waitForSelector("#bd-session", { timeout: 180000 }).catch(() => {});
await org.waitForTimeout(2500);

ok("the Build Day is offered in the picker", (await org.getByText(TITLE).count()) > 0);
ok("the member is listed to be marked", (await org.getByText(MEMBER).count()) > 0);

// Tick the member present. The checkbox is inside the row's label, next to their address.
const ticked = await org.evaluate((email) => {
  const row = [...document.querySelectorAll("li")].find((li) => li.innerText.includes(email));
  const box = row?.querySelector('input[type="checkbox"]');
  if (!box) return false;
  box.click();
  return true;
}, MEMBER);
ok("the member can be ticked present", ticked);
await org.waitForTimeout(3500);

let roll = await getDoc(`attendance/${sid}`);
let present = await listDocs(`attendance/${sid}/present`);
ok("a roll header was written", Boolean(roll), "(attendance/<session>)");
ok("the roll is attributed to the organiser", roll?.fields?.taken_by?.stringValue === ORG);
ok("one student is on the roll", present.length === 1, `(found ${present.length})`);
ok("present_count agrees with the rows", Number(roll?.fields?.present_count?.integerValue ?? -1) === 1);
ok("they default to the beginner track", present[0]?.fields?.track?.stringValue === "beginner");

// THE SECOND WRITE IS THE POINT. taken_at is frozen by the rules after the first, so a
// screen holding a serverTimestamp() sentinel rather than the stored value is refused
// here — and only here. Changing the track is the cheapest second write there is.
const moved = await org.evaluate((email) => {
  const row = [...document.querySelectorAll("li")].find((li) => li.innerText.includes(email));
  const sel = row?.querySelector("select");
  if (!sel) return false;
  sel.value = "advanced";
  sel.dispatchEvent(new Event("change", { bubbles: true }));
  return true;
}, MEMBER);
ok("their track can be changed", moved);
await org.waitForTimeout(3500);

present = await listDocs(`attendance/${sid}/present`);
roll = await getDoc(`attendance/${sid}`);
ok("the second write is not refused by the frozen taken_at", present[0]?.fields?.track?.stringValue === "advanced");
ok("still exactly one row after the edit", present.length === 1, `(found ${present.length})`);
ok("present_count did not drift", Number(roll?.fields?.present_count?.integerValue ?? -1) === 1);

// The notes expander, and the optional-field handling underneath it.
const opened = await org.evaluate((email) => {
  const row = [...document.querySelectorAll("li")].find((li) => li.innerText.includes(email));
  const btn = [...(row?.querySelectorAll("button") ?? [])].find((b) => /notes/i.test(b.innerText));
  if (!btn) return false;
  btn.click();
  return true;
}, MEMBER);
ok("the notes expander opens", opened);
await org.waitForTimeout(900);

if (opened) {
  await org.fill(`#bd-repo-${present[0]?.name?.split("/").pop()}`, "facebook/react").catch(() => {});
  await org.fill(`#bd-blocker-${present[0]?.name?.split("/").pop()}`, "Tests fail on setup").catch(() => {});
  await org.getByRole("button", { name: /^save$/i }).first().click().catch(() => {});
  await org.waitForTimeout(3500);
}

present = await listDocs(`attendance/${sid}/present`);
ok("the repository is stored as owner/name", present[0]?.fields?.repo?.stringValue === "facebook/react");
ok("the blocker is stored", present[0]?.fields?.blocker?.stringValue === "Tests fail on setup");
// Optional fields are omitted rather than written empty — the rules' size checks refuse "".
ok("an untouched optional field is absent, not empty", !("pr_url" in (present[0]?.fields ?? {})));
ok("no uncaught errors while taking the roll", orgErrs.length === 0, orgErrs.join(" | "));

console.log("\n-- the member reads their own record --");
await mem.goto(`${BASE}/dashboard/build-days`, { waitUntil: "domcontentloaded", timeout: 120000 });
await mem.waitForFunction(() => /Build Days attended|No Build Days have run/i.test(document.body.innerText), { timeout: 180000 }).catch(() => {});
await mem.waitForTimeout(2000);

const memText = await mem.innerText("body").catch(() => "");
ok("the section is on the page", /build days/i.test(memText));
ok("it counts the one they came to", /1 of 1/.test(memText), memText.slice(0, 200));
ok("it shows the track the organiser set", /advanced/i.test(memText));
ok("it shows what they were working on", /facebook\/react/.test(memText));
ok("it shows what they were stuck on", /tests fail on setup/i.test(memText));
ok("no uncaught errors on the member's page", memErrs.length === 0, memErrs.join(" | "));

console.log("\n-- the cohort view --");
await org.goto(`${BASE}/admin/cohort`, { waitUntil: "domcontentloaded", timeout: 120000 });
await org.waitForSelector("#co-window", { timeout: 180000 }).catch(() => {});
await org.waitForTimeout(3000);

const cohortText = await org.innerText("body").catch(() => "");
ok("the member appears in the cohort table", cohortText.includes(MEMBER));
ok("their attendance is counted against rolls taken", /1 of 1/.test(cohortText), cohortText.slice(0, 200));
ok("the repository they worked on is shown", /facebook\/react/.test(cohortText));
ok("it refuses to score anybody", /no score here on purpose/i.test(cohortText));

await browser.close();
await memberBrowser.close();

console.log(`\n  ${pass} passed, ${fail} failed.\n`);
process.exit(fail === 0 ? 0 : 1);
