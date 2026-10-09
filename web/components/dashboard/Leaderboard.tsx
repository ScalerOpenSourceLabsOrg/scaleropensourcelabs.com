"use client";

// THE CLUB'S LEADERBOARD, and the reason it took a Cloud Function to build a table.
//
// `contributions/{uid}` is get-only to its owner (firestore.rules), so there is no query
// this component could run that would produce a ranking — and the version of this feature
// that widens that rule to `list` is not a leaderboard, it is every member being able to
// read every member's GitHub record with the ranking as the part that happens to render.
// So the function publishes one derived document and this reads it. See lib/leaderboard.ts.
//
// WHAT THE PAGE HAS TO KEEP SAYING, because a leaderboard says the opposite by default:
//
//   * it counts ONE narrow thing — merged pull requests against the handle a member gave
//     us — and the club's whole pitch is that you do not need to be good yet. The
//     standfirst says so in words rather than leaving the table to imply a ranking of
//     people. The overview deliberately does NOT open on a contribution total for the
//     same reason (see MemberDashboard.tsx); this page is where somebody who WANTS the
//     comparison goes to find it, which is a different act from being shown one.
//   * it is a SNAPSHOT. The board is rebuilt by the 4am sweep, so somebody who merged
//     something this afternoon is not on it at that number yet. "As of ..." sits in the
//     panel header, and it is the line that stops a member refreshing at midnight.
//   * the handle is UNVERIFIED free text. A row is activity for a handle, not a claim
//     about a person — the same sentence Contributions.tsx has to keep making.
//
// AN <ol> RATHER THAN A <table>, which is not a shortcut. A ranking IS an ordered list,
// and at 360px a five-column table is a horizontal scroll container in which the figure
// you came for is off-screen. Each row leads with its rank and its member; repositories
// and issues are a subline, which is where they belong when the column they support is
// merged pull requests.

import { useEffect, useState } from "react";
import Link from "next/link";
import Panel from "@/components/dashboard/Panel";
import RequireProfile from "@/components/dashboard/RequireProfile";
import SectionHead from "@/components/dashboard/SectionHead";
import { ago } from "@/lib/contributions";
import { myRow, ranked, readLeaderboard, type Board, type RankedRow } from "@/lib/leaderboard";
import { toDate, type Profile } from "@/lib/profile";

/** The figures under a name. `null` renders as an em dash rather than a zero — the row
 *  was synced before the function counted issues, and "none filed" is a different
 *  claim. */
function Figure({ n, label }: { n: number | null; label: string }) {
  return (
    <>
      <span className="tabular-nums">{n ?? "—"}</span> {label}
    </>
  );
}

function Row({ row, me }: { row: RankedRow; me: boolean }) {
  return (
    <li
      className={
        // The member's own row is the one thing on this page they came for, so it carries
        // the accent the rest of the dashboard uses for "yours".
        me
          ? "flex items-center gap-4 rounded-tile bg-accent-soft px-4 py-3"
          : "flex items-center gap-4 rounded-tile bg-sunk px-4 py-3"
      }
    >
      {/* The rank is the list's own numbering made visible, so the <ol> marker is off and
          this carries it — ties share a number and an automatic marker cannot. */}
      <span
        className={
          "w-8 shrink-0 text-center font-mono text-sm font-medium tabular-nums " +
          (me ? "text-accent" : "text-dust")
        }
      >
        {row.rank}
      </span>

      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="truncate text-sm font-semibold text-ink">{row.name}</span>
          {me && (
            <span className="rounded-full bg-accent px-2 py-0.5 font-mono text-label uppercase tracking-wider text-raise">
              You
            </span>
          )}
        </span>
        <span className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-haze">
          {/* The handle links out, because "who is this" is the next question and the
              answer is a GitHub profile rather than anything this site holds. */}
          <a
            href={"https://github.com/" + row.github}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-dust underline-offset-4 transition-colors hover:text-ink hover:underline"
          >
            @{row.github}
          </a>
          <span className="text-dust">·</span>
          <span>
            <Figure n={row.repos} label={row.repos === 1 ? "project" : "projects"} />
          </span>
          <span className="text-dust">·</span>
          <span>
            <Figure n={row.issues} label="issues" />
          </span>
        </span>
      </span>

      {/* The one number the board is ordered by, given the size that says so. */}
      <span className="shrink-0 text-right">
        <span className="block font-display text-xl font-bold leading-none tabular-nums tracking-tight">
          {row.merged}
        </span>
        <span className="mt-1 block font-mono text-label uppercase tracking-wider text-haze">
          merged
        </span>
      </span>
    </li>
  );
}

/** Said when the reader is not in the table, and it has to name WHICH of the three
 *  reasons applies — only the first is theirs to fix, and telling somebody to "add a
 *  handle" when they already have one is how a prompt teaches people to ignore prompts. */
function NotListed({ profile, board }: { profile: Profile; board: Board }) {
  if (!profile.github?.trim()) {
    return (
      <p className="measure mt-5 text-sm text-haze">
        We don&apos;t have your GitHub handle yet.{" "}
        <Link
          href="/dashboard/details"
          className="font-semibold text-accent underline-offset-4 hover:underline"
        >
          Add it to your details
        </Link>{" "}
        and you&apos;ll show up after tonight&apos;s refresh.
      </p>
    );
  }
  if (board.counted > board.rows.length) {
    return (
      <p className="measure mt-5 text-sm text-haze">
        Only the top {board.rows.length} of {board.counted} show here — you&apos;re still counted.
      </p>
    );
  }
  return (
    <p className="measure mt-5 text-sm text-haze">
      Not on it yet — the board refreshes overnight, so check back tomorrow.
    </p>
  );
}

/** "1st", "22nd". Written out because Intl.PluralRules with ordinal suffixes is four
 *  lines of setup to produce the same four cases, and this string appears once. */
function ordinal(n: number): string {
  const rest = n % 100;
  if (rest >= 11 && rest <= 13) return `${n}th`;
  const last = n % 10;
  return `${n}${last === 1 ? "st" : last === 2 ? "nd" : last === 3 ? "rd" : "th"}`;
}

function Standings({ profile, uid }: { profile: Profile; uid: string }) {
  /** `undefined` while the read is in flight, `null` when the board has never been built.
   *  Two different sentences, and collapsing them would make a club whose first sync has
   *  not run look like a club where nobody has merged anything. */
  const [board, setBoard] = useState<Board | null | undefined>(undefined);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    void (async () => {
      try {
        const b = await readLeaderboard();
        if (alive) setBoard(b);
      } catch (e) {
        // NOT SWALLOWED INTO AN EMPTY TABLE. The likeliest failure here is the rules
        // refusing a signed-in student the club has not admitted, and an empty board
        // would read as "nobody has done anything" to the one person who needs to be
        // told something else.
        console.error("[osc] could not read the leaderboard", e);
        if (alive) {
          setError(
            "Couldn't load the board. Just joined? An organiser has to admit you first.",
          );
          setBoard(null);
        }
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const rows = board ? ranked(board.rows) : [];
  const mine = board ? myRow(rows, uid) : null;
  const built = board ? toDate(board.built_at ?? null) : null;

  return (
    <>
      <SectionHead eyebrow="The club" title="Leaderboard">
        Merged pull requests by GitHub handle. One narrow measure — not a ranking of
        people.
      </SectionHead>

      <Panel
        icon="chart"
        title="Merged pull requests"
        action={
          built ? (
            <span className="font-mono text-label uppercase tracking-wider text-dust">
              As of {ago(built)}
            </span>
          ) : undefined
        }
      >
        {board === undefined && (
          <p className="text-body text-haze" aria-busy="true">
            Reading the board…
          </p>
        )}

        {board === null && (
          <p className="measure text-body text-haze">
            {error ||
              "No board yet — the first one lands after tonight's sweep."}
          </p>
        )}

        {board !== null && board !== undefined && board.rows.length === 0 && (
          <p className="measure text-body text-haze">
            Nobody yet. Add a GitHub handle and you&apos;ll appear after the nightly sweep.
          </p>
        )}

        {board !== null && board !== undefined && board.rows.length > 0 && (
          <>
            <ol className="space-y-2.5">
              {rows.map((row) => (
                <Row key={row.uid} row={row} me={row.uid === uid} />
              ))}
            </ol>

            {mine ? (
              <p className="measure mt-5 text-sm text-haze">
                You are {ordinal(mine.rank)} of {board.counted} ranked members.
              </p>
            ) : (
              <NotListed profile={profile} board={board} />
            )}

            {/* THE CAVEAT STAYS ON THE PAGE rather than becoming a tooltip. The handle is
                free text nobody verified, and a table of names and numbers reads as an
                official record unless it says otherwise where the numbers are. */}
            <p className="measure mt-3 text-xs text-dust">
              Handles are self-reported and unverified. Private repos don&rsquo;t count.
            </p>
          </>
        )}
      </Panel>
    </>
  );
}

export default function Leaderboard() {
  return (
    <RequireProfile>
      {({ user, profile }) => <Standings profile={profile} uid={user.uid} />}
    </RequireProfile>
  );
}
