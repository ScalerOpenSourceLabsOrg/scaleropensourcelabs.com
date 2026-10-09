// Build Days: who was there, on which track, and what they were working on.
//
// A BUILD DAY IS A SESSION, not a thing of its own. It has a time, a room, an audience and
// a place in the schedule, and every one of those already exists in lib/sessions.ts — so a
// Build Day is a session carrying `kind: "build-day"`, and this file is only the roll taken
// at one. A parallel collection would have needed its own editor, its own audience gating
// and its own upcoming/past split, and would have drifted from the real one the first time
// either moved.
//
// WHAT THIS FILE DELIBERATELY DOES NOT HOLD: pull request and merge counts. Those come from
// GitHub via the Cloud Function in functions/github.js and live in contributions/{uid},
// which is write-denied to every client including its owner. Adding a "PRs merged" box to
// the roll-call grid would replace a number nobody can invent with one anybody can, and
// it is the number the club selects its mentor cohort on. See lib/contributions.ts.
//
// TWO DOCUMENTS PER SESSION, AND THE PARENT IS NOT DECORATION:
//
//   attendance/{sessionId}                 the roll was taken, by whom, and how many
//   attendance/{sessionId}/present/{uid}   one row per student who was there
//
// Without the parent, "the roll was never taken" and "nobody came" are the same absence —
// and every Build Day an organiser forgot to mark would report 0% attendance into a
// selection decision. The parent is what makes the zero readable.
//
// PRESENCE IS EXISTENCE. There is no `present: false`; a row exists or it does not, and
// unticking a student deletes theirs. The alternative — a row per enrolled student per
// session — is sixty writes for a session forty people came to, and the first absent row
// nobody wrote would be indistinguishable from a student who was never listed.
//
// THE STUDENT CANNOT WRITE ANY OF THIS, including their own row. firestore.rules has the
// full argument. A self-check-in is a reasonable feature and is not this one: it needs a
// code an organiser holds and a Cloud Function to check it, because a code the rules can
// read is a code the student can read straight out of the session document.

import { ATTENDANCE, PRESENT, getDb } from "@/lib/firebase";
import { toDate } from "@/lib/profile";
import type { SessionDoc } from "@/lib/sessions";

/** The three tracks the club announced.
 *
 *  A CLOSED SET, mirrored in firestore.rules, because the grid and the member's page both
 *  draw one group per known value — an unrecognised track would drop a student off the
 *  screen entirely rather than render oddly, which is the kind of failure nobody notices
 *  until they ask why they are missing. */
export type Track = "beginner" | "intermediate" | "advanced";

export const TRACKS: { value: Track; label: string; hint: string }[] = [
  { value: "beginner", label: "Beginner", hint: "Git, GitHub, and a first contribution" },
  { value: "intermediate", label: "Intermediate", hint: "Finding their way around a codebase" },
  { value: "advanced", label: "Advanced", hint: "Working independently on real issues" },
];

export const TRACK_LABEL: Record<Track, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

/** Read a track off a stored row. Anything unrecognised reads as `beginner` rather than
 *  being dropped: a value this build does not know about came from a newer one, and
 *  putting a student in the wrong group is a smaller failure than removing them. */
export function trackOf(v: unknown): Track {
  return v === "intermediate" || v === "advanced" ? v : "beginner";
}

/** The header on one session's roll. Keyed by the session's own id, so a roll cannot exist
 *  for a session that does not and a session cannot have two. */
export type Roll = {
  session_id: string;
  /** The organiser who FIRST took it. Frozen by the rules, so the second organiser to mark
   *  somebody present does not end up recorded as the person who took the roll. */
  taken_by: string;
  taken_at?: unknown;
  /** A convenience, and the subcollection is the truth — members cannot list the roll, so
   *  this is the only way a count reaches anybody but an organiser. Recomputed from the
   *  rows on every save, so two organisers marking at once correct each other. */
  present_count: number;
  updated_at?: unknown;
};

/** One student, present at one Build Day. */
export type Attendee = {
  uid: string;
  email: string;
  name?: string;
  track: Track;
  /** "owner/name", the form contributions/ already stores repositories in. */
  repo?: string;
  issue_url?: string;
  pr_url?: string;
  blocker?: string;
  next_step?: string;
  /** Whoever LAST marked them, not whoever first did — this answers "who said that", which
   *  is a question about the most recent edit. Contrast `taken_by` above. */
  marked_by: string;
  updated_at?: unknown;
};

/** What the grid sends. `marked_by` and `updated_at` are the writer's job, not the
 *  caller's — the rules pin both, and a caller that supplied them could only get them
 *  wrong. */
export type AttendeeInput = {
  uid: string;
  email: string;
  name?: string;
  track: Track;
  repo?: string;
  issue_url?: string;
  pr_url?: string;
  blocker?: string;
  next_step?: string;
};

// ---------------------------------------------------------------- the schedule

export function isBuildDay(s: SessionDoc): boolean {
  return s.kind === "build-day";
}

/** The Build Days out of a list of sessions, MOST RECENT FIRST.
 *
 *  The opposite order to readSessions(), and deliberately: that function answers "what is
 *  next", and this one answers "what happened" — an organiser opening the roll wants the
 *  session that just ran at the top, not one in three weeks' time. */
export function buildDays(rows: SessionDoc[]): SessionDoc[] {
  return rows
    .filter(isBuildDay)
    .sort((a, b) => (toDate(b.starts_at)?.getTime() ?? 0) - (toDate(a.starts_at)?.getTime() ?? 0));
}

/** The ones that have already STARTED, which are the only ones a roll can be taken at.
 *
 *  Started rather than finished, matching upcoming() in lib/sessions.ts: nothing here
 *  records a duration, and an organiser takes the roll ten minutes in, not afterwards. */
export function held(rows: SessionDoc[], now: Date = new Date()): SessionDoc[] {
  return rows.filter((r) => {
    const d = toDate(r.starts_at);
    return d !== null && d.getTime() <= now.getTime();
  });
}

// -------------------------------------------------------------------- reading

/** The roll header for one session, or null when nobody has taken it.
 *
 *  NULL IS A REAL ANSWER HERE rather than an empty state to paper over: it means the roll
 *  was never taken, which is different from a roll with nobody on it, and both screens say
 *  so in different words. */
export async function readRoll(sessionId: string): Promise<Roll | null> {
  const db = await getDb();
  if (!db) throw new Error("Firebase is not configured");
  const { doc, getDoc } = await import("firebase/firestore");
  const snap = await getDoc(doc(db, ATTENDANCE, sessionId));
  return snap.exists() ? (snap.data() as Roll) : null;
}

/** Roll headers for several sessions at once, keyed by session id.
 *
 *  ONE GET PER SESSION rather than a query, because there is no query that answers it: the
 *  ids come from the sessions collection and a `where(documentId(), 'in', …)` caps at
 *  thirty and still costs a read each. A term of Build Days is a dozen documents.
 *
 *  A MISSING OR REFUSED ROLL IS OMITTED, not thrown. One unreadable header must not cost
 *  the caller the whole list — the screen renders "roll not taken" for it, which is also
 *  what a genuinely missing one means. */
export async function readRolls(sessionIds: string[]): Promise<Map<string, Roll>> {
  const out = new Map<string, Roll>();
  const rows = await Promise.all(
    sessionIds.map(async (id) => {
      try {
        return [id, await readRoll(id)] as const;
      } catch {
        return [id, null] as const;
      }
    }),
  );
  for (const [id, roll] of rows) if (roll) out.set(id, roll);
  return out;
}

/** Everybody marked present at one session. ADMINS ONLY — the list rule refuses anybody
 *  else, which is what keeps an attributed record from being an enumerable one. */
export async function readAttendees(sessionId: string): Promise<Attendee[]> {
  const db = await getDb();
  if (!db) throw new Error("Firebase is not configured");
  const { collection, getDocs } = await import("firebase/firestore");
  const snap = await getDocs(collection(db, ATTENDANCE, sessionId, PRESENT));
  return snap.docs.map((d) => ({ ...(d.data() as Omit<Attendee, "uid">), uid: d.id }));
}

/** One member's own rows across several Build Days, keyed by session id.
 *
 *  ONE GET PER BUILD DAY, AND NOT A COLLECTION GROUP QUERY. The obvious build is
 *  collectionGroup("present").where("uid", "==", me), and it is the wrong shape here: a
 *  `list` rule is judged against the QUERY rather than the rows it returns — the note
 *  lib/audience.ts carries at length — so it would need a rules wildcard permissive enough
 *  to prove, plus a collection-group index, to save a dozen reads on a page somebody opens
 *  once a week.
 *
 *  If a member ever has more than about thirty of these, the answer is a summary document
 *  maintained by a Cloud Function, the way tallyResponses already maintains form tallies —
 *  not a broader rule. */
export async function readMyAttendance(
  sessionIds: string[],
  uid: string,
): Promise<Map<string, Attendee>> {
  const db = await getDb();
  if (!db) throw new Error("Firebase is not configured");
  const { doc, getDoc } = await import("firebase/firestore");
  const out = new Map<string, Attendee>();
  const rows = await Promise.all(
    sessionIds.map(async (id) => {
      try {
        const snap = await getDoc(doc(db, ATTENDANCE, id, PRESENT, uid));
        return snap.exists()
          ? ([id, { ...(snap.data() as Omit<Attendee, "uid">), uid }] as const)
          : ([id, null] as const);
      } catch {
        // Absent and refused are the same sentence on the member's page — "we have no
        // record of you at this one" — so one failure costs a row rather than the page.
        return [id, null] as const;
      }
    }),
  );
  for (const [id, row] of rows) if (row) out.set(id, row);
  return out;
}

// ------------------------------------------------------------ the cohort view

/** One student, folded across several Build Days. What SOP §2.4 asks the club to select
 *  the mentor-supported cohort on — and pointedly NOT a score: every field here is a
 *  separate fact, and the screen shows them side by side rather than adding them up.
 *
 *  A WEIGHTED TOTAL WOULD BE THE OBVIOUS NEXT STEP AND IS THE WRONG ONE. The SOP says
 *  selection is not on technical skill alone; a single number would quietly decide the
 *  weighting on the club's behalf and would rank a student who opened four trivial pull
 *  requests above one who spent three sessions unpicking a hard bug. Organisers read the
 *  columns. */
export type CohortRow = {
  uid: string;
  /** Build Days this student was marked present at, out of the ones a roll was taken at. */
  attended: number;
  /** The track on their most recent attendance, or null if they were never marked. */
  track: Track | null;
  /** Distinct repositories they worked on ACROSS BUILD DAYS — what an organiser wrote
   *  down in the room, not what GitHub reports. The two answer different questions:
   *  this one is "did they pick something and stay with it". */
  repos: string[];
  /** Build Days at which a pull request was recorded against them. Follow-through, which
   *  the SOP asks for by name. */
  sessionsWithPr: number;
  /** Sessions where somebody wrote down what they were stuck on. Not a negative: it means
   *  an organiser had a real conversation with them, and a student who is never stuck on
   *  anything is usually a student nobody spoke to. */
  sessionsWithBlocker: number;
};

/** Fold the per-session rolls into one row per student.
 *
 *  `rolls` DECIDES THE DENOMINATOR, and that is the reason this takes them at all. A Build
 *  Day nobody took a roll at must not count against anybody: "3 of 3" and "3 of 5, two of
 *  which were never marked" are different facts, and only the first is a reason not to
 *  invite somebody. Sessions with no roll are dropped from the count entirely.
 *
 *  `attendance` is keyed by session id, in the order the sessions should be read —
 *  newest first, matching buildDays() — because the track is taken from the first row
 *  found for each student. */
export function cohortRows(
  sessionIds: string[],
  rolls: Map<string, Roll>,
  attendance: Map<string, Attendee[]>,
): { rows: Map<string, CohortRow>; counted: number } {
  const counted = sessionIds.filter((id) => rolls.has(id));
  const rows = new Map<string, CohortRow>();

  for (const id of counted) {
    for (const a of attendance.get(id) ?? []) {
      const prev = rows.get(a.uid);
      if (!prev) {
        rows.set(a.uid, {
          uid: a.uid,
          attended: 1,
          // The first row seen wins, and `counted` is newest-first, so this is the most
          // recent track rather than the oldest.
          track: trackOf(a.track),
          repos: a.repo ? [a.repo] : [],
          sessionsWithPr: a.pr_url ? 1 : 0,
          sessionsWithBlocker: a.blocker ? 1 : 0,
        });
        continue;
      }
      prev.attended += 1;
      if (a.repo && !prev.repos.includes(a.repo)) prev.repos.push(a.repo);
      if (a.pr_url) prev.sessionsWithPr += 1;
      if (a.blocker) prev.sessionsWithBlocker += 1;
    }
  }

  return { rows, counted: counted.length };
}

// -------------------------------------------------------------------- writing

/** Whether a string is the "owner/name" the rules will accept, so the grid can say why
 *  rather than letting the write fail with a permission error. */
export function isRepo(s: string): boolean {
  return /^[A-Za-z0-9._-]+\/[A-Za-z0-9._-]+$/.test(s.trim());
}

/** Same, for the two link fields. https:// only, as the notice board's `link` is — these
 *  render as anchors on the organisers' screen. */
export function isHttps(s: string): boolean {
  return /^https:\/\/[^ ]+$/.test(s.trim());
}

/** Write the roll header, and hand back the one the caller should hold from now on.
 *
 *  Called by the two mutators below and not otherwise — it is the half that is easy to
 *  forget, so nothing outside this file has to remember it.
 *
 *  WHY IT RETURNS A ROLL RATHER THAN void, and it is not a convenience. The rules freeze
 *  `taken_at` on every write after the first, so the second toggle has to send back the
 *  value the first one stored. A caller that kept its own optimistic copy would be holding
 *  the serverTimestamp() SENTINEL — an instruction to the server, not a time — and the
 *  comparison `request.resource.data.taken_at == resource.data.taken_at` would refuse it.
 *  So a roll this function CREATED is re-read once to resolve that timestamp, and one it
 *  merely updated is returned from what the caller already had. One extra read per session
 *  per sitting, on the first tick only. */
async function saveRoll(
  sessionId: string,
  actorEmail: string,
  presentCount: number,
  existing: Roll | null,
): Promise<Roll> {
  const db = await getDb();
  if (!db) throw new Error("Firebase is not configured");
  const { doc, serverTimestamp, setDoc } = await import("firebase/firestore");
  const body: Record<string, unknown> = {
    session_id: sessionId,
    // Frozen by the rules after the first write, so an edit returns the stored value
    // rather than the current organiser — otherwise the last person to tick a box is
    // recorded as the person who took the roll.
    taken_by: existing ? existing.taken_by : actorEmail,
    present_count: presentCount,
    updated_at: serverTimestamp(),
  };
  if (!existing) body.taken_at = serverTimestamp();
  else if (existing.taken_at) body.taken_at = existing.taken_at;
  await setDoc(doc(db, ATTENDANCE, sessionId), body);

  if (existing) return { ...existing, present_count: presentCount };
  return (
    (await readRoll(sessionId)) ?? {
      session_id: sessionId,
      taken_by: actorEmail,
      present_count: presentCount,
    }
  );
}

/** Mark somebody present, or change what they are working on.
 *
 *  THE ROW IS WRITTEN BEFORE THE HEADER, and the order is the error handling. If the header
 *  write fails the student is still on the roll and the next toggle recomputes the count;
 *  if the row write fails nothing happened at all. The other order can leave a count
 *  claiming somebody is on a roll they are not on. */
export async function markPresent(
  sessionId: string,
  actorEmail: string,
  row: AttendeeInput,
  roll: Roll | null,
  presentCount: number,
): Promise<Roll> {
  const db = await getDb();
  if (!db) throw new Error("Firebase is not configured");
  const { doc, serverTimestamp, setDoc } = await import("firebase/firestore");

  const body: Record<string, unknown> = {
    uid: row.uid,
    email: row.email,
    track: row.track,
    // Pinned to the caller on every write, unlike the roll's byline — this answers "who
    // last said this", which is a question about the most recent edit.
    marked_by: actorEmail,
    updated_at: serverTimestamp(),
  };
  // Optional fields are OMITTED rather than written empty, so clearing one is a genuine
  // removal — and the rules' size checks refuse "" anyway, so a blank string would make
  // the whole write fail rather than clearing the field.
  if (row.name?.trim()) body.name = row.name.trim();
  if (row.repo?.trim()) body.repo = row.repo.trim();
  if (row.issue_url?.trim()) body.issue_url = row.issue_url.trim();
  if (row.pr_url?.trim()) body.pr_url = row.pr_url.trim();
  if (row.blocker?.trim()) body.blocker = row.blocker.trim();
  if (row.next_step?.trim()) body.next_step = row.next_step.trim();

  await setDoc(doc(db, ATTENDANCE, sessionId, PRESENT, row.uid), body);
  return saveRoll(sessionId, actorEmail, presentCount, roll);
}

/** Take somebody off the roll. Presence is existence, so this is a real delete — there is
 *  no `present: false` to write instead. */
export async function unmarkPresent(
  sessionId: string,
  actorEmail: string,
  uid: string,
  roll: Roll | null,
  presentCount: number,
): Promise<Roll> {
  const db = await getDb();
  if (!db) throw new Error("Firebase is not configured");
  const { deleteDoc, doc } = await import("firebase/firestore");
  await deleteDoc(doc(db, ATTENDANCE, sessionId, PRESENT, uid));
  return saveRoll(sessionId, actorEmail, presentCount, roll);
}
