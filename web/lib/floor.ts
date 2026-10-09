// The live floor at a Build Day: where each student is, and who wants a hand.
//
// THE PROBLEM IT EXISTS FOR. A Build Day is forty students and a handful of mentors, and
// the mentors end up three-deep with whoever asked first while the rest of the room sits
// quietly stuck. Two things go wrong: nobody can see who is waiting, and the students who
// most need help are the ones least likely to stand up and ask.
//
// So each student keeps a row here — their phase, and a raised hand if they want one —
// and the mentors watch all of them live. Three things fall out of that:
//
//   the queue      raised hands, oldest first, with a Claim so two mentors never walk to
//                  the same desk
//   the quiet list students who have not moved phase or been helped in a while and have
//                  not asked — the system raises the hand they did not
//   the board      a count per phase, so twelve people stuck on setup reads as "do it once
//                  at the front" rather than twelve one-to-ones
//
// SELF-REPORTED, AND NOT THE ROLL. lib/buildDays.ts holds attendance, which organisers
// write because the cohort is selected on it. This is the student's own word about where
// they are, and nothing reads it as evidence once the session ends.
//
// NOTHING HERE IS ANONYMOUS. Every signed-in student sees the whole floor — who is at
// which phase, and who has a hand up — so the room can help itself, not just the mentors.

import { FLOOR, FLOOR_MENTORS, FLOOR_STUDENTS, getDb } from "@/lib/firebase";
import { toDate } from "@/lib/profile";
import { isBuildDay } from "@/lib/buildDays";
import type { SessionDoc } from "@/lib/sessions";

// ------------------------------------------------------------------- phases

/** Where a student is. A CLOSED SET, mirrored in firestore.rules — `npm run rules` diffs
 *  the two. Ordered roughly the way an afternoon goes, but nobody has to walk it in order:
 *  somebody arriving with a PR already open jumps straight to "existing-pr". */
export const PHASES = [
  { value: "joined", label: "Just joined" },
  { value: "setup", label: "Setting up Git & GitHub" },
  { value: "finding-repo", label: "Looking for a repo" },
  { value: "found-repo", label: "Found a repo" },
  { value: "running-locally", label: "Got it running locally" },
  { value: "finding-issue", label: "Looking for an issue" },
  { value: "found-issue", label: "Found an issue" },
  { value: "created-issue", label: "Opened an issue" },
  { value: "coding", label: "Writing code" },
  { value: "committed", label: "Made a commit" },
  { value: "pr-opened", label: "Opened a PR" },
  { value: "existing-pr", label: "Working on an existing PR" },
  { value: "review", label: "Fixing review comments" },
  { value: "merged", label: "PR merged" },
] as const;

export type Phase = (typeof PHASES)[number]["value"];

export const PHASE_LABEL = Object.fromEntries(PHASES.map((p) => [p.value, p.label])) as Record<
  Phase,
  string
>;

export function phaseOf(v: unknown): Phase {
  return PHASES.some((p) => p.value === v) ? (v as Phase) : "joined";
}

// ------------------------------------------------------------------- the window

/** Mirrors floorOpen() in firestore.rules. Change one, change both. */
export const FLOOR_OPENS_BEFORE_MS = 60 * 60 * 1000;
export const FLOOR_CLOSES_AFTER_MS = 12 * 60 * 60 * 1000;

export function isFloorOpen(s: SessionDoc, now: Date = new Date()): boolean {
  const start = toDate(s.starts_at);
  if (!isBuildDay(s) || !start) return false;
  const t = now.getTime();
  return t > start.getTime() - FLOOR_OPENS_BEFORE_MS && t < start.getTime() + FLOOR_CLOSES_AFTER_MS;
}

/** The Build Day whose floor is open now, or null. If two overlap — an organiser who
 *  scheduled one twice — the one that started most recently wins. */
export function liveBuildDay(rows: SessionDoc[], now: Date = new Date()): SessionDoc | null {
  const open = rows.filter((s) => isFloorOpen(s, now));
  open.sort((a, b) => (toDate(b.starts_at)?.getTime() ?? 0) - (toDate(a.starts_at)?.getTime() ?? 0));
  return open[0] ?? null;
}

// ------------------------------------------------------------------- shapes

export type Help = "none" | "open" | "claimed";

/** One student's row, as stored. Timestamps come back as Firestore Timestamps and MUST be
 *  sent back untouched — the rules freeze phase_at and help_at unless they move. */
export type FloorRow = {
  uid: string;
  name: string;
  seat?: string;
  phase: Phase;
  phase_at: unknown;
  help: Help;
  help_note?: string;
  help_at?: unknown;
  claimed_by?: string;
  claimed_name?: string;
  claimed_at?: unknown;
  last_helped_at?: unknown;
  repo?: string;
  issue_url?: string;
  pr_url?: string;
  updated_at?: unknown;
};

// ------------------------------------------------------------------- watching

type Unsub = () => void;

/** Live updates on one document or query.
 *
 *  SNAPSHOTS WITH PENDING WRITES ARE SKIPPED. A local write that carries serverTimestamp()
 *  shows up first with that field still unresolved, and a row holding it would send the
 *  wrong value back on the next write — the rules compare it to what is stored and refuse.
 *  The confirmed snapshot follows a moment later. */
async function watchDoc<T>(
  path: string[],
  onData: (v: T | null) => void,
  onError: (e: unknown) => void,
): Promise<Unsub> {
  const db = await getDb();
  if (!db) throw new Error("Firebase is not configured");
  const { doc, onSnapshot } = await import("firebase/firestore");
  const [first, ...rest] = path;
  return onSnapshot(
    doc(db, first, ...rest),
    { includeMetadataChanges: true },
    (snap) => {
      if (snap.metadata.hasPendingWrites) return;
      onData(snap.exists() ? (snap.data() as T) : null);
    },
    onError,
  );
}

/** The signed-in student's own row. null until they join. */
export function watchMine(
  sessionId: string,
  uid: string,
  onData: (row: FloorRow | null) => void,
  onError: (e: unknown) => void,
): Promise<Unsub> {
  return watchDoc<FloorRow>([FLOOR, sessionId, FLOOR_STUDENTS, uid], (r) => {
    onData(r ? { ...r, uid, phase: phaseOf(r.phase) } : null);
  }, onError);
}

/** Every student on the floor. Any signed-in student may read it. */
export async function watchFloor(
  sessionId: string,
  onData: (rows: FloorRow[]) => void,
  onError: (e: unknown) => void,
): Promise<Unsub> {
  const db = await getDb();
  if (!db) throw new Error("Firebase is not configured");
  const { collection, onSnapshot } = await import("firebase/firestore");
  return onSnapshot(
    collection(db, FLOOR, sessionId, FLOOR_STUDENTS),
    { includeMetadataChanges: true },
    (snap) => {
      if (snap.metadata.hasPendingWrites) return;
      onData(
        snap.docs.map((d) => {
          const r = d.data() as FloorRow;
          return { ...r, uid: d.id, phase: phaseOf(r.phase) };
        }),
      );
    },
    onError,
  );
}

// ------------------------------------------------------------ the student's writes

/** What a student can change in one go. Anything left undefined keeps its current value. */
export type MyChange = {
  phase?: Phase;
  /** "open" raises a hand, "none" puts it down. */
  help?: "open" | "none";
  help_note?: string;
  seat?: string;
  repo?: string;
  issue_url?: string;
  pr_url?: string;
};

/** Write the student's own row — joining the floor on the first call.
 *
 *  A FULL OVERWRITE BUILT FROM WHAT IS STORED, so every frozen field goes back exactly as
 *  it came: phase_at unless the phase moved, help_at and the claim unless the hand did. */
export async function writeMine(
  sessionId: string,
  me: { uid: string; name: string },
  existing: FloorRow | null,
  change: MyChange,
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Firebase is not configured");
  const { doc, serverTimestamp, setDoc } = await import("firebase/firestore");

  const phase = change.phase ?? existing?.phase ?? "joined";
  const body: Record<string, unknown> = {
    uid: me.uid,
    name: (me.name || "A student").slice(0, 120),
    phase,
    phase_at: existing && existing.phase === phase ? existing.phase_at : serverTimestamp(),
    updated_at: serverTimestamp(),
  };

  const was = existing?.help ?? "none";
  if (change.help === "none") {
    body.help = "none";
  } else if (change.help === "open" && was === "none") {
    body.help = "open";
    body.help_at = serverTimestamp();
  } else {
    body.help = was;
    if (was !== "none") body.help_at = existing?.help_at;
    if (was === "claimed") {
      body.claimed_by = existing?.claimed_by;
      body.claimed_name = existing?.claimed_name;
      body.claimed_at = existing?.claimed_at;
    }
  }
  if (body.help !== "none") {
    const note = (change.help_note ?? existing?.help_note ?? "").trim().slice(0, 280);
    if (note) body.help_note = note;
  }
  if (existing?.last_helped_at) body.last_helped_at = existing.last_helped_at;

  for (const k of ["seat", "repo", "issue_url", "pr_url"] as const) {
    const v = (change[k] ?? existing?.[k] ?? "").trim();
    if (v) body[k] = v;
  }

  await setDoc(doc(db, FLOOR, sessionId, FLOOR_STUDENTS, me.uid), body);
}

// ------------------------------------------------------------- the mentor's writes

/** "I'm coming." Also how a mentor checks in on a quiet student who never asked.
 *
 *  IN A TRANSACTION, so two mentors tapping Claim on the same hand at once do not both
 *  walk over: the second one is told who got there first. */
export async function claim(
  sessionId: string,
  uid: string,
  me: { email: string; name: string },
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Firebase is not configured");
  const { doc, runTransaction, serverTimestamp } = await import("firebase/firestore");
  const ref = doc(db, FLOOR, sessionId, FLOOR_STUDENTS, uid);
  await runTransaction(db, async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists()) throw new Error("They've left the floor.");
    const r = snap.data() as FloorRow;
    if (r.help === "claimed" && r.claimed_by !== me.email) {
      throw new Error(`${r.claimed_name ?? "Someone"} is already on it.`);
    }
    tx.update(ref, {
      help: "claimed",
      help_at: r.help_at ?? serverTimestamp(),
      claimed_by: me.email,
      claimed_name: me.name.slice(0, 120) || me.email,
      claimed_at: serverTimestamp(),
      updated_at: serverTimestamp(),
    });
  });
}

/** Put a claimed hand back in the queue, keeping its place. */
export async function release(sessionId: string, uid: string): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Firebase is not configured");
  const { deleteField, doc, serverTimestamp, updateDoc } = await import("firebase/firestore");
  await updateDoc(doc(db, FLOOR, sessionId, FLOOR_STUDENTS, uid), {
    help: "open",
    claimed_by: deleteField(),
    claimed_name: deleteField(),
    claimed_at: deleteField(),
    updated_at: serverTimestamp(),
  });
}

/** Helped. The hand goes down and the quiet clock restarts. */
export async function resolve(sessionId: string, uid: string): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Firebase is not configured");
  const { deleteField, doc, serverTimestamp, updateDoc } = await import("firebase/firestore");
  await updateDoc(doc(db, FLOOR, sessionId, FLOOR_STUDENTS, uid), {
    help: "none",
    help_at: deleteField(),
    help_note: deleteField(),
    claimed_by: deleteField(),
    claimed_name: deleteField(),
    claimed_at: deleteField(),
    last_helped_at: serverTimestamp(),
    updated_at: serverTimestamp(),
  });
}

// ------------------------------------------------------------------ milestones

/** The phases worth a cheer — confetti on the student's card, a line on the big screen.
 *  The verb is how the big screen says it: "Asha opened a PR". */
export const MILESTONES: Partial<Record<Phase, string>> = {
  "created-issue": "opened an issue",
  committed: "made a commit",
  "pr-opened": "opened a PR",
  merged: "got a PR merged",
};

export function isMilestone(p: Phase): boolean {
  return p in MILESTONES;
}

export type FeedItem = { key: string; who: string; did: string; at: number };

/** The big screen's feed: everyone currently sitting on a milestone, newest first.
 *
 *  DERIVED FROM THE ROWS, NOT LOGGED. A student who opens a PR and then moves on to
 *  "Fixing review comments" drops off the feed — which is fine for a screen about the
 *  last half hour, and means there is no event log to write, secure or clean up. */
export function milestoneFeed(rows: FloorRow[], limit = 8): FeedItem[] {
  return rows
    .filter((r) => isMilestone(r.phase))
    .map((r) => {
      const at = toDate(r.phase_at)?.getTime() ?? 0;
      return {
        key: `${r.uid}:${r.phase}:${at}`,
        who: r.name,
        did: MILESTONES[r.phase] ?? "",
        at,
      };
    })
    .sort((a, b) => b.at - a.at)
    .slice(0, limit);
}

// ------------------------------------------------------------------ the quiet list

/** When this student last showed a sign of life: a phase change or a mentor visit. */
export function lastMoved(r: FloorRow): number {
  return Math.max(toDate(r.phase_at)?.getTime() ?? 0, toDate(r.last_helped_at)?.getTime() ?? 0);
}

/** Quiet: no hand up, and nothing has moved for `minutes`. "PR merged" is never quiet —
 *  that student is done, not stuck. */
export function isQuiet(r: FloorRow, now: number, minutes: number): boolean {
  return r.help === "none" && r.phase !== "merged" && now - lastMoved(r) >= minutes * 60_000;
}

/** "4 min", "1 h 10 min". */
export function since(v: unknown, now: number): string {
  const t = typeof v === "number" ? v : toDate(v)?.getTime();
  if (!t) return "";
  const m = Math.max(0, Math.floor((now - t) / 60_000));
  if (m < 60) return `${m} min`;
  return `${Math.floor(m / 60)} h ${m % 60} min`;
}

// ------------------------------------------------------------------ floor mentors

export type FloorMentor = {
  email: string;
  name: string;
  active: boolean;
  added_by: string;
  added_at?: unknown;
};

/** The caller's own floor-mentor row, or null. Used by lib/auth.tsx. */
export async function readMyFloorMentor(email: string): Promise<FloorMentor | null> {
  const db = await getDb();
  if (!db) return null;
  const { doc, getDoc } = await import("firebase/firestore");
  const snap = await getDoc(doc(db, FLOOR_MENTORS, email.toLowerCase()));
  return snap.exists() ? (snap.data() as FloorMentor) : null;
}

/** Every floor mentor. Organisers only. */
export async function readFloorMentors(): Promise<FloorMentor[]> {
  const db = await getDb();
  if (!db) throw new Error("Firebase is not configured");
  const { collection, getDocs } = await import("firebase/firestore");
  const snap = await getDocs(collection(db, FLOOR_MENTORS));
  return snap.docs
    .map((d) => d.data() as FloorMentor)
    .sort((a, b) => a.name.localeCompare(b.name));
}

/** Add a floor mentor, or switch one on or off. Organisers only. */
export async function saveFloorMentor(
  actorEmail: string,
  m: { email: string; name: string; active: boolean },
  existing: FloorMentor | null,
): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Firebase is not configured");
  const { doc, serverTimestamp, setDoc } = await import("firebase/firestore");
  const email = m.email.trim().toLowerCase();
  await setDoc(doc(db, FLOOR_MENTORS, email), {
    email,
    name: m.name.trim(),
    active: m.active,
    added_by: existing ? existing.added_by : actorEmail,
    added_at: existing?.added_at ?? serverTimestamp(),
    updated_at: serverTimestamp(),
  });
}

export async function removeFloorMentor(email: string): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Firebase is not configured");
  const { deleteDoc, doc } = await import("firebase/firestore");
  await deleteDoc(doc(db, FLOOR_MENTORS, email.toLowerCase()));
}
