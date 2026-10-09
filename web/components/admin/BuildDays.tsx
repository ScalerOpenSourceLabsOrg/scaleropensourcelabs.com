"use client";

// The roll call, and the one screen an organiser has open while a Build Day is running.
//
// EVERY STUDENT WITH A PROFILE IS LISTED, not only club members, and that follows from the
// SOP rather than from laziness: the first three Build Days are open to the whole college,
// and the mentor-supported cohort is selected FROM whoever turns up. A grid that listed
// only members would be empty on exactly the three sessions it exists to record. The
// membership filter is there for later in the term, when the answer changes.
//
// WRITES GO ONE ROW AT A TIME, NOT ON A SAVE BUTTON. A roll call is sixty interruptions —
// somebody arrives late, a laptop shuts, a tab is closed by accident — and a screen that
// holds forty ticks in memory until a button is pressed is a screen that loses forty ticks.
// Each tick is its own write, and the row says so while it is in flight.
//
// THE NOTES ARE BEHIND AN EXPANDER AND THE TICK IS NOT. Repo, issue, blocker and next step
// are what the club actually wants out of a Build Day (SOP §9), but four text fields times
// sixty students inside a two-hour session is a form nobody finishes twice — so the fast
// path is one tick and one select, and the fields are filled in for the students an
// organiser genuinely spoke to.
//
// TRACKS CARRY FORWARD FROM THE PREVIOUS BUILD DAY. Re-selecting a track for forty students
// every week is how a weekly screen stops being used by week three, so the previous Build
// Day's roll is read as well and seeds the default. It is a DEFAULT, not a copy: nothing is
// written for a student until somebody ticks them, and moving tracks is one select.

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Bars, ctl, field, tally } from "@/components/admin/ui";
import { useAuth } from "@/lib/auth";
import {
  TRACKS,
  TRACK_LABEL,
  buildDays,
  held,
  isHttps,
  isRepo,
  markPresent,
  readAttendees,
  readRoll,
  trackOf,
  unmarkPresent,
  type Attendee,
  type AttendeeInput,
  type Roll,
  type Track,
} from "@/lib/buildDays";
import { isClubMember, readAllProfiles, type Profile } from "@/lib/profile";
import { watchFloor } from "@/lib/floor";
import { readSessions, sessionWhen, type SessionDoc } from "@/lib/sessions";

/** The editable half of one row, held locally while somebody types. Kept out of the
 *  Attendee map so a half-typed repo never looks like stored data. */
type Draft = {
  repo: string;
  issue_url: string;
  pr_url: string;
  blocker: string;
  next_step: string;
};

const EMPTY_DRAFT: Draft = { repo: "", issue_url: "", pr_url: "", blocker: "", next_step: "" };

function draftOf(a: Attendee | undefined): Draft {
  return {
    repo: a?.repo ?? "",
    issue_url: a?.issue_url ?? "",
    pr_url: a?.pr_url ?? "",
    blocker: a?.blocker ?? "",
    next_step: a?.next_step ?? "",
  };
}

function BuildDaysGrid() {
  const { user, isAdmin } = useAuth();
  const params = useSearchParams();

  const [sessions, setSessions] = useState<SessionDoc[] | null>(null);
  const [profiles, setProfiles] = useState<Profile[] | null>(null);
  const [sessionId, setSessionId] = useState("");
  /** Who is on the roll, keyed by uid. A Map rather than an array because every write here
   *  is about one student and the screen re-renders on each one. */
  const [present, setPresent] = useState<Map<string, Attendee>>(new Map());
  const [roll, setRoll] = useState<Roll | null>(null);
  /** Last week's tracks, used only as a default for a student nobody has ticked yet. */
  const [carried, setCarried] = useState<Map<string, Track>>(new Map());
  const [loadingRoll, setLoadingRoll] = useState(false);
  /** Who put themselves on this Build Day's live floor (lib/floor.ts). Self-reported, so
   *  it SUGGESTS who to tick and never ticks anybody on its own — the roll stays an
   *  organiser's word, for the reason lib/buildDays.ts gives. */
  const [onFloor, setOnFloor] = useState<Set<string>>(new Set());

  const [busy, setBusy] = useState<string>("");
  const [error, setError] = useState("");
  const [note, setNote] = useState("");

  const [q, setQ] = useState("");
  const [membership, setMembership] = useState("");
  const [trackFilter, setTrackFilter] = useState("");
  const [presentOnly, setPresentOnly] = useState(false);
  const [openRow, setOpenRow] = useState("");
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);

  const actor = user?.email ?? "";

  // ---------------------------------------------------------------- the schedule
  useEffect(() => {
    if (isAdmin !== true) return;
    let alive = true;
    (async () => {
      try {
        // No audience argument: an organiser queries without the clause and sees every
        // session, which is the one case readSessions() takes `undefined` for.
        const all = await readSessions();
        if (!alive) return;
        setSessions(all);
      } catch (e) {
        console.error("[osc] could not read sessions", e);
        if (alive) {
          setSessions([]);
          setError("Could not load the schedule. The rules may not be deployed.");
        }
      }
    })();
    return () => {
      alive = false;
    };
  }, [isAdmin]);

  useEffect(() => {
    if (isAdmin !== true) return;
    let alive = true;
    (async () => {
      try {
        const all = await readAllProfiles();
        if (alive) setProfiles(all);
      } catch (e) {
        console.error("[osc] could not read profiles", e);
        if (alive) {
          setProfiles([]);
          setError("Could not load the membership. Your address may not be an organiser's.");
        }
      }
    })();
    return () => {
      alive = false;
    };
  }, [isAdmin]);

  /** Build Days that have already started, newest first. A roll cannot be taken at one
   *  that has not happened, so the picker does not offer them. */
  const rollable = useMemo(
    () => (sessions ? held(buildDays(sessions)) : []),
    [sessions],
  );

  // THE PICKER DEFAULTS TO THE MOST RECENT, and honours ?session= so the "Take the roll"
  // link on the Sessions screen lands on the right one. The query string wins only when it
  // names a session that is actually rollable — a stale link must not leave the screen
  // pointing at nothing.
  useEffect(() => {
    if (sessionId || rollable.length === 0) return;
    const wanted = params.get("session");
    const match = wanted && rollable.find((s) => s.id === wanted);
    setSessionId(match ? match.id : rollable[0].id);
  }, [params, rollable, sessionId]);

  // ------------------------------------------------------------------- the roll
  const loadRoll = useCallback(async (id: string, previousId: string | null) => {
    setLoadingRoll(true);
    setError("");
    try {
      const [rows, header, prev] = await Promise.all([
        readAttendees(id),
        readRoll(id),
        // The previous Build Day, read only for its tracks. Absent on the first one.
        previousId ? readAttendees(previousId) : Promise.resolve([] as Attendee[]),
      ]);
      setPresent(new Map(rows.map((r) => [r.uid, { ...r, track: trackOf(r.track) }])));
      setRoll(header);
      setCarried(new Map(prev.map((r) => [r.uid, trackOf(r.track)])));
    } catch (e) {
      console.error("[osc] could not read the roll", e);
      setPresent(new Map());
      setRoll(null);
      setError("Could not load this roll. Reload the page before marking anybody.");
    } finally {
      setLoadingRoll(false);
    }
  }, []);

  useEffect(() => {
    if (isAdmin !== true || !sessionId) return;
    const i = rollable.findIndex((s) => s.id === sessionId);
    // rollable is newest-first, so the PREVIOUS Build Day is the NEXT index.
    const previousId = i >= 0 && i + 1 < rollable.length ? rollable[i + 1].id : null;
    setOpenRow("");
    void loadRoll(sessionId, previousId);
  }, [isAdmin, sessionId, rollable, loadRoll]);

  // Live, so a student who joins the floor mid-session shows up without a reload.
  useEffect(() => {
    if (isAdmin !== true || !sessionId) return;
    let alive = true;
    let unsub: (() => void) | undefined;
    setOnFloor(new Set());
    void watchFloor(
      sessionId,
      (rows) => alive && setOnFloor(new Set(rows.map((r) => r.uid))),
      // A floor nobody joined is an empty list, not an error; a refused read just means
      // no suggestions, and the roll works exactly as it did without them.
      (e) => console.error("[osc] could not read the floor", e),
    ).then((u) => (alive ? (unsub = u) : u()));
    return () => {
      alive = false;
      unsub?.();
    };
  }, [isAdmin, sessionId]);

  if (isAdmin !== true || !user?.email) return null;

  const session = rollable.find((s) => s.id === sessionId) ?? null;

  /** The track a student should get when they are first ticked. */
  function defaultTrack(uid: string): Track {
    return carried.get(uid) ?? "beginner";
  }

  /** Every write on this screen goes through here, so the roll header and the row can
   *  never disagree about the count and the error is worded once.
   *
   *  `next` is the map AFTER the change, which is what the header's present_count has to
   *  be — computing it from `present` inside the mutator would race with React's state. */
  async function commit(
    uid: string,
    next: Map<string, Attendee>,
    write: (count: number) => Promise<Roll>,
  ) {
    setBusy(uid);
    setError("");
    setNote("");
    try {
      setRoll(await write(next.size));
      setPresent(next);
    } catch (e) {
      console.error("[osc] could not write the roll", e);
      setError(
        "Firestore refused that. Another organiser may be marking this roll — reload and try again.",
      );
    } finally {
      setBusy("");
    }
  }

  async function toggle(p: Profile) {
    const current = present.get(p.uid);
    const next = new Map(present);
    if (current) {
      next.delete(p.uid);
      await commit(p.uid, next, (count) =>
        unmarkPresent(sessionId, actor, p.uid, roll, count),
      );
      if (openRow === p.uid) setOpenRow("");
      return;
    }
    const row: AttendeeInput = {
      uid: p.uid,
      email: p.email,
      name: p.name,
      track: defaultTrack(p.uid),
    };
    next.set(p.uid, { ...row, marked_by: actor });
    await commit(p.uid, next, (count) => markPresent(sessionId, actor, row, roll, count));
  }

  /** Tick everybody on the live floor who is not on the roll yet.
   *
   *  ONE STUDENT AT A TIME, threading the roll header through, for the reason the per-row
   *  lock below gives: each write's present_count and taken_at come from the one before.
   *  If one fails, the ones already written stay written and the screen shows them. */
  async function tickFloor(toTick: Profile[]) {
    setBusy("floor");
    setError("");
    setNote("");
    const next = new Map(present);
    let header = roll;
    try {
      for (const p of toTick) {
        const row: AttendeeInput = {
          uid: p.uid,
          email: p.email,
          name: p.name,
          track: defaultTrack(p.uid),
        };
        next.set(p.uid, { ...row, marked_by: actor });
        try {
          header = await markPresent(sessionId, actor, row, header, next.size);
        } catch (e) {
          next.delete(p.uid);
          throw e;
        }
      }
      setNote(`Ticked ${toTick.length}.`);
    } catch (e) {
      console.error("[osc] could not tick the floor", e);
      setError("Stopped partway — reload and try again.");
    } finally {
      setRoll(header);
      setPresent(next);
      setBusy("");
    }
  }

  async function changeTrack(uid: string, track: Track) {
    const current = present.get(uid);
    if (!current) return;
    const row: AttendeeInput = { ...current, track };
    const next = new Map(present);
    next.set(uid, { ...current, track });
    await commit(uid, next, (count) => markPresent(sessionId, actor, row, roll, count));
  }

  async function saveNotes(uid: string) {
    const current = present.get(uid);
    if (!current) return;

    // CHECKED BEFORE THE WRITE so the reason is a sentence. The rules refuse these shapes
    // too, but a permission error cannot explain which field it objected to.
    if (draft.repo.trim() && !isRepo(draft.repo)) {
      setError("A repository is written owner/name — “facebook/react”, not a URL.");
      return;
    }
    for (const [label, v] of [
      ["issue", draft.issue_url],
      ["pull request", draft.pr_url],
    ] as const) {
      if (v.trim() && !isHttps(v)) {
        setError(`The ${label} link has to start with https://.`);
        return;
      }
    }

    const row: AttendeeInput = {
      uid: current.uid,
      email: current.email,
      name: current.name,
      track: current.track,
      repo: draft.repo,
      issue_url: draft.issue_url,
      pr_url: draft.pr_url,
      blocker: draft.blocker,
      next_step: draft.next_step,
    };
    const next = new Map(present);
    next.set(uid, {
      ...current,
      repo: draft.repo.trim() || undefined,
      issue_url: draft.issue_url.trim() || undefined,
      pr_url: draft.pr_url.trim() || undefined,
      blocker: draft.blocker.trim() || undefined,
      next_step: draft.next_step.trim() || undefined,
    });
    await commit(uid, next, (count) => markPresent(sessionId, actor, row, roll, count));
    setOpenRow("");
    setNote("Saved.");
  }

  function expand(uid: string) {
    if (openRow === uid) {
      setOpenRow("");
      return;
    }
    setDraft(draftOf(present.get(uid)));
    setOpenRow(uid);
    setError("");
  }

  // ------------------------------------------------------------------ the list
  const rows = (profiles ?? [])
    .filter((p) => {
      if (presentOnly && !present.has(p.uid)) return false;
      if (membership === "member" && !isClubMember(p)) return false;
      if (membership === "student" && isClubMember(p)) return false;
      if (trackFilter && present.get(p.uid)?.track !== trackFilter) return false;
      if (!q.trim()) return true;
      const needle = q.trim().toLowerCase();
      return (
        p.name.toLowerCase().includes(needle) || p.email.toLowerCase().includes(needle)
      );
    })
    // Present first, then by name: during a session the interesting half of the list is
    // the people already marked, and after it the list reads as the record of who came.
    .sort((a, b) => {
      const pa = present.has(a.uid);
      const pb = present.has(b.uid);
      if (pa !== pb) return pa ? -1 : 1;
      return a.name.localeCompare(b.name);
    });

  const floorUnticked = (profiles ?? []).filter((p) => onFloor.has(p.uid) && !present.has(p.uid));

  const trackRows = tally([...present.values()].map((a) => TRACK_LABEL[a.track]));
  const when = session ? sessionWhen(session.starts_at) : null;

  return (
    <div className="space-y-6">
      {/* ------------------------------------------------------------ the picker */}
      <div className="card rounded-panel bg-raise p-6 sm:p-7">
        <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
          <div className="min-w-0">
            <label htmlFor="bd-session" className="label">
              Which Build Day
            </label>
            <select
              id="bd-session"
              className={`${ctl} mt-2 w-full sm:w-[26rem]`}
              value={sessionId}
              onChange={(e) => setSessionId(e.target.value)}
              disabled={rollable.length === 0}
            >
              {rollable.length === 0 && <option value="">No Build Days have run yet</option>}
              {rollable.map((s) => {
                const w = sessionWhen(s.starts_at);
                return (
                  <option key={s.id} value={s.id}>
                    {w.day} {w.time} · {s.title}
                  </option>
                );
              })}
            </select>
          </div>

          {session && (
            <p className="font-mono text-sm text-haze">
              {present.size} present
              {roll ? "" : " · roll not taken yet"}
            </p>
          )}
        </div>

        {/* THE EMPTY STATE NAMES THE MISSING STEP rather than saying "no data". A Build Day
            is an ordinary session with a box ticked, and an organiser who has not ticked it
            has no way to guess that from an empty list. */}
        {sessions !== null && rollable.length === 0 && (
          <p className="measure mt-5 text-sm leading-relaxed text-haze">
            Nothing to mark yet. Tick “This is a Build Day” on a session in{" "}
            <a className="tap underline hover:text-ink" href="/admin/sessions">Sessions</a>{" "}
            — its roll appears here once it starts.
          </p>
        )}

        {session?.location && (
          <p className="mt-3 font-mono text-sm text-dust">
            {when?.day} {when?.time} · {session.location}
          </p>
        )}
      </div>

      {error && (
        <p className="text-sm leading-relaxed text-ember" role="alert">
          {error}
        </p>
      )}
      {note && !error && <p className="text-sm text-haze">{note}</p>}

      {session && (
        <>
          <Bars
            title="Tracks on this roll"
            rows={trackRows}
            total={present.size}
            empty="Nobody marked present yet."
          />

          {/* ------------------------------------------------------- the filters */}
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
                value={trackFilter}
                onChange={(e) => setTrackFilter(e.target.value)}
                aria-label="Track"
              >
                <option value="">Any track</option>
                {TRACKS.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
              <label className="flex min-h-[44px] items-center gap-2.5 rounded-inline border border-seam bg-sunk px-3.5 text-sm text-ink">
                <input
                  type="checkbox"
                  checked={presentOnly}
                  onChange={(e) => setPresentOnly(e.target.checked)}
                />
                Present only
              </label>
            </div>

            {floorUnticked.length > 0 && !loadingRoll && (
              <div className="mt-4 flex flex-wrap items-center gap-3 rounded-tile bg-accent-soft px-4 py-3">
                <p className="min-w-0 flex-1 text-sm text-ink">
                  {floorUnticked.length} on the floor, not on the roll.
                </p>
                <button
                  type="button"
                  className="btn btn-primary btn-compact disabled:opacity-60"
                  disabled={busy !== ""}
                  onClick={() => void tickFloor(floorUnticked)}
                >
                  {busy === "floor" ? "Ticking…" : "Tick them all"}
                </button>
              </div>
            )}

            <p className="mt-4 font-mono text-sm text-haze">
              {loadingRoll
                ? "Loading the roll…"
                : `${rows.length} shown · ${present.size} of ${profiles?.length ?? 0} present`}
            </p>

            {/* --------------------------------------------------------- the grid */}
            <ul className="mt-4 divide-y divide-seam border-t border-seam">
              {rows.map((p) => {
                const row = present.get(p.uid);
                const on = Boolean(row);
                const open = openRow === p.uid;
                const working = busy === p.uid;
                // LOCKED WHILE ANY ROW IS IN FLIGHT, not just this one. Every write on this
                // screen is computed from the `present` map and the `roll` header as they were
                // at the last render, so a second tick started before the first came back would
                // send the same present_count twice and hand saveRoll a `roll` it still thinks
                // is null — which writes a fresh taken_at onto a header that already has one,
                // and the rules refuse it.
                const locked = busy !== "";
                return (
                  <li key={p.uid} className="py-3">
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
                      <label className="flex min-w-0 flex-1 items-center gap-3">
                        <input
                          type="checkbox"
                          checked={on}
                          disabled={locked}
                          onChange={() => void toggle(p)}
                        />
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-medium text-ink">
                            {p.name}
                            {isClubMember(p) && (
                              <span className="ml-2 font-mono text-label uppercase tracking-wider text-accent">
                                member
                              </span>
                            )}
                            {onFloor.has(p.uid) && (
                              <span className="ml-2 font-mono text-label uppercase tracking-wider text-haze">
                                on the floor
                              </span>
                            )}
                          </span>
                          <span className="block truncate font-mono text-xs text-dust">
                            {p.email}
                          </span>
                        </span>
                      </label>

                      {/* The track is only meaningful for somebody on the roll, so it is
                          disabled rather than hidden — a control that appears and
                          disappears as you tick down a list of sixty is a list that
                          jumps under the pointer. */}
                      <select
                        className={ctl}
                        value={row?.track ?? defaultTrack(p.uid)}
                        disabled={!on || locked}
                        onChange={(e) => void changeTrack(p.uid, e.target.value as Track)}
                        aria-label={`Track for ${p.name}`}
                      >
                        {TRACKS.map((t) => (
                          <option key={t.value} value={t.value}>
                            {t.label}
                          </option>
                        ))}
                      </select>

                      <button
                        type="button"
                        onClick={() => expand(p.uid)}
                        disabled={!on}
                        aria-expanded={open}
                        className="tap font-mono text-label uppercase tracking-wider text-haze underline transition-colors hover:text-ink disabled:opacity-40 disabled:no-underline"
                      >
                        {/* THE DOT MEANS "THERE IS SOMETHING IN HERE", which is the only
                            thing a collapsed row can usefully say — an organiser scanning
                            forty rows for the three they wrote a blocker on should not have
                            to open forty expanders to find them. */}
                        {open ? "Close" : row?.repo || row?.blocker ? "Notes ●" : "Notes"}
                      </button>
                    </div>

                    {open && row && (
                      <div className="mt-4 grid gap-4 rounded-tile bg-sunk p-5 sm:grid-cols-2">
                        <div>
                          <label htmlFor={`bd-repo-${p.uid}`} className="label">
                            Repository
                          </label>
                          <input
                            id={`bd-repo-${p.uid}`}
                            className={`${field} mt-2`}
                            placeholder="facebook/react"
                            value={draft.repo}
                            maxLength={140}
                            onChange={(e) => setDraft({ ...draft, repo: e.target.value })}
                          />
                        </div>
                        <div>
                          <label htmlFor={`bd-issue-${p.uid}`} className="label">
                            Issue
                          </label>
                          <input
                            id={`bd-issue-${p.uid}`}
                            className={`${field} mt-2`}
                            placeholder="https://github.com/…/issues/123"
                            value={draft.issue_url}
                            maxLength={500}
                            onChange={(e) => setDraft({ ...draft, issue_url: e.target.value })}
                          />
                        </div>
                        <div>
                          <label htmlFor={`bd-pr-${p.uid}`} className="label">
                            Pull request <span className="text-dust">(if opened)</span>
                          </label>
                          <input
                            id={`bd-pr-${p.uid}`}
                            className={`${field} mt-2`}
                            placeholder="https://github.com/…/pull/456"
                            value={draft.pr_url}
                            maxLength={500}
                            onChange={(e) => setDraft({ ...draft, pr_url: e.target.value })}
                          />
                        </div>
                        <div>
                          <label htmlFor={`bd-blocker-${p.uid}`} className="label">
                            Blocker
                          </label>
                          <input
                            id={`bd-blocker-${p.uid}`}
                            className={`${field} mt-2`}
                            placeholder="Tests fail on setup"
                            value={draft.blocker}
                            maxLength={500}
                            onChange={(e) => setDraft({ ...draft, blocker: e.target.value })}
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <label htmlFor={`bd-next-${p.uid}`} className="label">
                            Next step
                          </label>
                          <input
                            id={`bd-next-${p.uid}`}
                            className={`${field} mt-2`}
                            placeholder="Ask the maintainer which node version CI uses"
                            value={draft.next_step}
                            maxLength={500}
                            onChange={(e) => setDraft({ ...draft, next_step: e.target.value })}
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <button
                            type="button"
                            onClick={() => void saveNotes(p.uid)}
                            disabled={locked}
                            className="btn btn-primary btn-compact disabled:opacity-60"
                          >
                            {working ? "Saving…" : "Save"}
                          </button>
                        </div>
                      </div>
                    )}
                  </li>
                );
              })}

              {!loadingRoll && rows.length === 0 && (
                <li className="py-4 text-sm text-haze">
                  Nobody matches those filters.
                </li>
              )}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}

// useSearchParams needs a Suspense boundary, or `next build` refuses to prerender this
// route — the same wrapper JoinGate and ProfileForm carry, for the same reason.
export default function BuildDays() {
  return (
    <Suspense fallback={<div className="h-[32rem]" aria-hidden />}>
      <BuildDaysGrid />
    </Suspense>
  );
}
