// The club's ranking, as the dashboard reads it.
//
// ONE DOCUMENT, ONE READ. The counts themselves live in `contributions/{uid}`, which is
// get-only to its owner and list-only to an admin — a rule that is the whole reason this
// file is short. A leaderboard built in the browser would need every member's row, and a
// client that can read every member's row does not stop being able to when the page
// renders a ranking. So the Cloud Function derives the board with the Admin SDK and
// publishes the one document members may see; see rebuildLeaderboard() in
// functions/index.js, which is where the shape is decided.
//
// WHAT IT IS A BOARD OF, and the page has to keep saying it: merged pull requests for the
// GitHub handle a member typed into their own profile. That handle is unverified free
// text (see lib/contributions.ts), so a row is "activity for the handle we were given",
// not "this person's work" — and nobody appears until they publish a handle themselves.
//
// IT IS A SNAPSHOT, NOT A LIVE FIGURE. The board is rebuilt by the nightly sweep, so a
// member who merged something an hour ago is not on it yet at that number. `built_at` is
// carried for exactly that reason and the page prints it; a leaderboard that implies it
// is live is a leaderboard somebody refreshes at midnight.

import { LEADERBOARD, LEADERBOARD_DOC, getDb } from "@/lib/firebase";

/** One ranked member. A deliberate subset of the profile and the counts: a name, the
 *  handle they published, and three figures. Nothing else from `users` is in this
 *  document, and whoever adds a field is adding it to a page the whole club reads. */
export type BoardRow = {
  uid: string;
  /** Their name, or the handle when the profile has none. */
  name: string;
  github: string;
  merged: number;
  repos: number;
  /** null when the row was synced before the function counted issues. NOT zero — see the
   *  same distinction in lib/contributions.ts. */
  issues: number | null;
};

export type Board = {
  /** Already sorted by the function, best first, and capped there. Trusted as ordered
   *  rather than re-sorted here: the ranks below are positional, so a second sort with a
   *  different tie-break would renumber the board on the client only. */
  rows: BoardRow[];
  /** How many members were ranked in total, which is ≥ rows.length. Lets the page tell
   *  somebody outside the cap that they were counted rather than missed. */
  counted: number;
  built_at?: unknown;
};

/** Read the board. Returns null when it has never been built — a club whose first sync
 *  has not run yet, which is a different sentence from "nobody has merged anything".
 *
 *  A PERMISSION ERROR IS NOT SWALLOWED, matching readProfile and readContributions: on
 *  this document it means the caller is signed in but not an admitted member, and a page
 *  that quietly renders empty for them is a page that looks broken instead of gated. */
export async function readLeaderboard(): Promise<Board | null> {
  const db = await getDb();
  if (!db) throw new Error("Firebase is not configured");
  const { doc, getDoc } = await import("firebase/firestore");
  const snap = await getDoc(doc(db, LEADERBOARD, LEADERBOARD_DOC));
  if (!snap.exists()) return null;
  const d = snap.data() as Partial<Board>;
  return {
    rows: Array.isArray(d.rows) ? (d.rows as BoardRow[]) : [],
    counted: typeof d.counted === "number" ? d.counted : (d.rows?.length ?? 0),
    built_at: d.built_at,
  };
}

export type RankedRow = BoardRow & { rank: number };

/** Number the rows, with ties sharing a rank: 1, 2, 2, 4.
 *
 *  TIED ON `merged` ALONE, not on the full sort key. The column the rank is about is
 *  merged pull requests, so two people with nine each are both second — even though the
 *  function put one above the other on repositories touched, which is a tie-break for
 *  ordering rather than a claim that one did more. Ranking them 2 and 3 would make the
 *  board assert something it cannot support from the figures it prints. */
export function ranked(rows: BoardRow[]): RankedRow[] {
  let rank = 0;
  let previous: number | null = null;
  return rows.map((row, i) => {
    if (previous === null || row.merged !== previous) {
      rank = i + 1;
      previous = row.merged;
    }
    return { ...row, rank };
  });
}

/** Where the signed-in member sits, or null when they are not on the board at all.
 *
 *  Separate from the render so the "you are not on it" case can say WHY in the page's own
 *  words — no handle, no sync yet, or outside the cap are three different fixes and only
 *  the first one is the member's to make. */
export function myRow(rows: RankedRow[], uid: string): RankedRow | null {
  return rows.find((r) => r.uid === uid) ?? null;
}
