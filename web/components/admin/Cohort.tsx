"use client";

// Choosing the mentor-supported cohort: every student's Build Days side by side.
//
// THIS IS THE SCREEN THE RECORD EXISTS FOR. Taking the roll is weekly and per-session;
// this is once a term and across all of them, which is why it is not a tab on the roll
// call. SOP §2.4: after the first three Build Days, students who showed consistency and
// initiative are invited into the cohort.
//
// IT DOES NOT SCORE ANYBODY, and that is a decision rather than an omission. Summing these
// columns into one number would decide the weighting on the club's behalf, and would rank
// four trivial pull requests above three sessions spent unpicking a hard bug. The SOP says
// selection is not on technical skill alone. So the columns sit next to each other and an
// organiser reads them.
//
// THE DENOMINATOR IS SESSIONS A ROLL WAS TAKEN AT, not Build Days held. A session nobody
// marked must not count against a student who was there — see cohortRows() in
// lib/buildDays.ts, and the roll header in firestore.rules that makes the distinction
// expressible at all.
//
// WHAT IT COSTS, because this is the one screen here that reads a lot: one query for the
// membership, one for every member's GitHub counts, and then TWO reads per Build Day
// included — the roll header and its rows. The session count is a control rather than a
// constant for exactly that reason, and it defaults to 3 because that is what the SOP
// selects on.

import { useCallback, useEffect, useMemo, useState } from "react";
import { ctl } from "@/components/admin/ui";
import { useAuth } from "@/lib/auth";
import {
  TRACK_LABEL,
  buildDays,
  cohortRows,
  held,
  readAttendees,
  readRolls,
  type Attendee,
  type CohortRow,
  type Roll,
} from "@/lib/buildDays";
import { readAllContributions, type Contributions } from "@/lib/contributions";
import { isClubMember, readAllProfiles, type Profile } from "@/lib/profile";
import { readSessions, sessionWhen, type SessionDoc } from "@/lib/sessions";

/** How many of the most recent Build Days to fold in. Three is the SOP's onboarding
 *  window; the rest are there for later in the term. */
const WINDOWS = [
  { value: 3, label: "Last 3 Build Days" },
  { value: 5, label: "Last 5" },
  { value: 0, label: "All of them" },
];

type Sort = "attended" | "merged" | "name";

export default function Cohort() {
  const { isAdmin } = useAuth();

  const [sessions, setSessions] = useState<SessionDoc[] | null>(null);
  const [profiles, setProfiles] = useState<Profile[] | null>(null);
  const [counts, setCounts] = useState<Map<string, Contributions>>(new Map());
  const [rows, setRows] = useState<Map<string, CohortRow>>(new Map());
  const [counted, setCounted] = useState(0);
  const [window_, setWindow] = useState(3);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [q, setQ] = useState("");
  const [membership, setMembership] = useState("");
  const [sort, setSort] = useState<Sort>("attended");

  useEffect(() => {
    if (isAdmin !== true) return;
    let alive = true;
    (async () => {
      try {
        const [all, people, contrib] = await Promise.all([
          readSessions(),
          readAllProfiles(),
          // NOT fatal on its own: the GitHub columns are one part of the picture and the
          // attendance half is readable without them. A club whose sync has never been
          // deployed should still be able to pick a cohort.
          readAllContributions().catch(() => new Map<string, Contributions>()),
        ]);
        if (!alive) return;
        setSessions(all);
        setProfiles(people);
        setCounts(contrib);
      } catch (e) {
        console.error("[osc] could not load the cohort view", e);
        if (alive) {
          setSessions([]);
          setProfiles([]);
          setError("Could not load this. Your address may not be an organiser's.");
        }
      }
    })();
    return () => {
      alive = false;
    };
  }, [isAdmin]);

  /** The Build Days in the window, newest first. */
  const window$ = useMemo(() => {
    if (!sessions) return [] as SessionDoc[];
    const all = held(buildDays(sessions));
    return window_ > 0 ? all.slice(0, window_) : all;
  }, [sessions, window_]);

  const load = useCallback(async (days: SessionDoc[]) => {
    if (days.length === 0) {
      setRows(new Map());
      setCounted(0);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const ids = days.map((s) => s.id);
      const [rolls, lists] = await Promise.all([
        readRolls(ids),
        Promise.all(ids.map((id) => readAttendees(id))),
      ]);
      const attendance = new Map<string, Attendee[]>(
        ids.map((id, i) => [id, lists[i]]),
      );
      const folded = cohortRows(ids, rolls as Map<string, Roll>, attendance);
      setRows(folded.rows);
      setCounted(folded.counted);
    } catch (e) {
      console.error("[osc] could not fold the Build Days", e);
      // CLEARED RATHER THAN LEFT STANDING. A refused or failed roll read must not
      // render as "nobody came" beside a session the header said was counted — that
      // is a 0 of 3 in a selection meeting about somebody who came to all three.
      setRows(new Map());
      setCounted(0);
      setError("Could not read the rolls. Reload and try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAdmin !== true) return;
    void load(window$);
  }, [isAdmin, window$, load]);

  if (isAdmin !== true) return null;

  const list = (profiles ?? [])
    .filter((p) => {
      if (membership === "member" && !isClubMember(p)) return false;
      if (membership === "student" && isClubMember(p)) return false;
      if (!q.trim()) return true;
      const needle = q.trim().toLowerCase();
      return p.name.toLowerCase().includes(needle) || p.email.toLowerCase().includes(needle);
    })
    .sort((a, b) => {
      if (sort === "name") return a.name.localeCompare(b.name);
      if (sort === "merged") {
        return (counts.get(b.uid)?.merged ?? 0) - (counts.get(a.uid)?.merged ?? 0);
      }
      const d = (rows.get(b.uid)?.attended ?? 0) - (rows.get(a.uid)?.attended ?? 0);
      return d !== 0 ? d : a.name.localeCompare(b.name);
    });

  // Anybody who came to every counted session. The SOP's "consistency", stated as a
  // number rather than left for an organiser to eyeball down a column.
  const everyOne = counted > 0
    ? [...rows.values()].filter((r) => r.attended === counted).length
    : 0;

  return (
    <div className="space-y-6">
      <div className="card rounded-panel bg-raise p-6 sm:p-7">
        <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
          <div>
            <label htmlFor="co-window" className="label">
              Which Build Days
            </label>
            <select
              id="co-window"
              className={`${ctl} mt-2`}
              value={window_}
              onChange={(e) => setWindow(Number(e.target.value))}
            >
              {WINDOWS.map((w) => (
                <option key={w.value} value={w.value}>
                  {w.label}
                </option>
              ))}
            </select>
          </div>
          <p className="font-mono text-sm text-haze">
            {counted} of {window$.length} had a roll taken · {everyOne} came to all of them
          </p>
        </div>

        {/* THE GAP BETWEEN "HELD" AND "COUNTED" IS NAMED, because it silently changes
            every denominator on the screen and an organiser comparing two students has to
            know it is there. */}
        {window$.length > counted && (
          <p className="measure mt-4 text-sm leading-relaxed text-haze">
            {window$.length - counted} of these had no roll taken — skipped for everyone, not
            counted as absences.
          </p>
        )}

        {window$.length > 0 && (
          <p className="mt-3 font-mono text-xs text-dust">
            {window$
              .map((s) => `${sessionWhen(s.starts_at).day} ${s.title}`)
              .join("  ·  ")}
          </p>
        )}
      </div>

      {error && (
        <p className="text-sm leading-relaxed text-ember" role="alert">
          {error}
        </p>
      )}

      {sessions !== null && window$.length === 0 && (
        <p className="measure text-body text-haze">
          No Build Days yet — you&apos;ll pick the cohort here once they&apos;ve run.
        </p>
      )}

      {window$.length > 0 && (
        <div className="card rounded-panel bg-raise p-6 sm:p-7">
          <div className="flex flex-wrap gap-3">
            <input
              className={`${ctl} min-w-0 flex-1`}
              placeholder="Search a name or address"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              aria-label="Search students"
            />
            <select
              className={ctl}
              value={membership}
              onChange={(e) => setMembership(e.target.value)}
              aria-label="Membership"
            >
              <option value="">Everyone</option>
              <option value="member">Club members</option>
              <option value="student">Not members</option>
            </select>
            <select
              className={ctl}
              value={sort}
              onChange={(e) => setSort(e.target.value as Sort)}
              aria-label="Sort by"
            >
              <option value="attended">Most Build Days</option>
              <option value="merged">Most merged</option>
              <option value="name">Name</option>
            </select>
          </div>

          <p className="mt-4 font-mono text-sm text-haze">
            {loading ? "Reading the rolls…" : `${list.length} students`}
          </p>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[52rem] text-left">
              <thead>
                <tr>
                  {[
                    "Student",
                    "Build Days",
                    "Track",
                    "Repos in session",
                    "PR in session",
                    "Merged",
                    "Issues",
                  ].map((h) => (
                    <th
                      key={h}
                      scope="col"
                      className="pb-2 pr-4 font-mono text-label font-medium uppercase tracking-[0.1em] text-haze"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {list.map((p) => {
                  const r = rows.get(p.uid);
                  const c = counts.get(p.uid);
                  return (
                    <tr key={p.uid} className="border-t border-seam align-top">
                      <td className="py-3 pr-4">
                        <span className="block text-sm font-medium text-ink">
                          {p.name}
                          {isClubMember(p) && (
                            <span className="ml-2 font-mono text-label uppercase tracking-wider text-accent">
                              member
                            </span>
                          )}
                        </span>
                        <span className="block font-mono text-xs text-dust">{p.email}</span>
                      </td>
                      <td className="py-3 pr-4">
                        <span
                          className={`font-mono text-sm tabular-nums ${
                            r && counted > 0 && r.attended === counted
                              ? "text-accent"
                              : "text-ink"
                          }`}
                        >
                          {r?.attended ?? 0} of {counted}
                        </span>
                        {r && r.sessionsWithBlocker > 0 && (
                          <span className="block font-mono text-xs text-dust">
                            {r.sessionsWithBlocker} logged a blocker
                          </span>
                        )}
                      </td>
                      <td className="py-3 pr-4 text-sm text-haze">
                        {r?.track ? TRACK_LABEL[r.track] : "—"}
                      </td>
                      <td className="py-3 pr-4">
                        {r && r.repos.length > 0 ? (
                          <span className="font-mono text-xs text-haze">
                            {r.repos.join(", ")}
                          </span>
                        ) : (
                          <span className="text-sm text-dust">—</span>
                        )}
                      </td>
                      <td className="py-3 pr-4 font-mono text-sm tabular-nums text-haze">
                        {r?.sessionsWithPr ?? 0}
                      </td>
                      {/* THE GITHUB COLUMNS ARE EM DASHES WHEN THE SYNC HAS NOT REACHED
                          SOMEBODY, never zeroes. A member who joined yesterday has no row
                          in contributions/ at all, and "0 merged" about somebody nobody has
                          counted is the kind of wrong that gets read as a fact in a
                          selection meeting. */}
                      <td className="py-3 pr-4 font-mono text-sm tabular-nums text-haze">
                        {c ? c.merged : "—"}
                      </td>
                      <td className="py-3 pr-4 font-mono text-sm tabular-nums text-haze">
                        {c?.issues ?? "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <p className="measure mt-6 text-sm leading-relaxed text-dust">
            No score, on purpose — weighing initiative and consistency is a conversation, not
            a sort order.
          </p>
        </div>
      )}
    </div>
  );
}
