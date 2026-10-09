"use client";

// The mentors' side of a live Build Day: who wants help, who is quietly stuck, and where
// the room is as a whole.
//
// THREE LISTS, IN THE ORDER A MENTOR SHOULD WORK THEM:
//
//   Hands up   asked for help, oldest first. Claim before walking over, so two mentors
//              never end up at the same desk while somebody else waits.
//   Quiet      has not moved phase or been visited in a while, and has not asked. These
//              are the students who will not put a hand up — "Check in" claims them
//              exactly as if they had.
//   On it      claimed, yours first. Done when sorted; Hand back if you got pulled away.
//
// THE PHASE BOARD IS FOR THE ROOM, NOT THE STUDENT. When twelve people are on "Setting up
// Git & GitHub" the answer is one walkthrough at the front, not twelve one-to-ones.
//
// NOT A PRIVILEGE GATE. isFloorHelper() in firestore.rules decides who may claim a hand;
// this only decides what to paint.

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/lib/auth";
import { readSessions, type SessionDoc } from "@/lib/sessions";
import {
  PHASES,
  PHASE_LABEL,
  claim,
  isQuiet,
  lastMoved,
  liveBuildDay,
  release,
  resolve,
  since,
  watchFloor,
  type FloorRow,
} from "@/lib/floor";
import { toDate } from "@/lib/profile";
import { Bars, Counts, ctl } from "@/components/admin/ui";

const QUIET_OPTIONS = [15, 25, 40, 60];

export function Gate({ children }: { children: React.ReactNode }) {
  const { user, isAdmin, floorMentor } = useAuth();
  if (user === undefined || (user && (isAdmin === undefined || floorMentor === undefined))) {
    return (
      <p className="text-sm text-haze" aria-busy="true">
        Checking your access…
      </p>
    );
  }
  if (!user || (!isAdmin && !floorMentor)) {
    return (
      <div className="card rounded-panel bg-raise p-8">
        <p className="chip">Mentors only</p>
        <p className="measure mt-4 text-body text-haze">
          {user ? "Ask an organiser to add you as a floor mentor." : "Sign in first."}
        </p>
      </div>
    );
  }
  return <>{children}</>;
}

/** The Build Day whose floor is open now: undefined while loading, null when none.
 *
 *  An organiser reads every session; a floor mentor reads what their audience allows,
 *  which is why this waits for a definite membership answer. */
export function useLiveSession(onError: (msg: string) => void): SessionDoc | null | undefined {
  const { isAdmin, isClubMember } = useAuth();
  const [session, setSession] = useState<SessionDoc | null | undefined>(undefined);
  useEffect(() => {
    if (!isAdmin && isClubMember === undefined) return;
    let alive = true;
    (async () => {
      try {
        const all = await readSessions(isAdmin ? undefined : isClubMember);
        if (alive) setSession(liveBuildDay(all));
      } catch (e) {
        console.error("[osc] could not read sessions", e);
        if (alive) {
          setSession(null);
          onError("Couldn't load the schedule.");
        }
      }
    })();
    return () => {
      alive = false;
    };
    // onError is a setter from the caller; it does not need to re-run the read.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin, isClubMember]);
  return session;
}

function Desk() {
  const { user, floorMentor } = useAuth();
  const [rows, setRows] = useState<FloorRow[] | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [quietMin, setQuietMin] = useState(25);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [q, setQ] = useState("");
  const [phaseFilter, setPhaseFilter] = useState("");
  const session = useLiveSession(setError);

  const me = {
    email: user?.email ?? "",
    name: floorMentor?.name ?? user?.displayName ?? user?.email ?? "A mentor",
  };

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!session) return;
    let alive = true;
    let unsub: (() => void) | undefined;
    void watchFloor(
      session.id,
      (r) => alive && setRows(r),
      (e) => {
        console.error("[osc] could not watch the floor", e);
        if (alive) setError("Couldn't load the floor. Reload?");
      },
    ).then((u) => (alive ? (unsub = u) : u()));
    return () => {
      alive = false;
      unsub?.();
    };
  }, [session]);

  const { hands, quiet, mine, others, board } = useMemo(() => {
    const all = rows ?? [];
    const at = (v: unknown) => toDate(v)?.getTime() ?? 0;
    const hands = all.filter((r) => r.help === "open").sort((a, b) => at(a.help_at) - at(b.help_at));
    const claimed = all.filter((r) => r.help === "claimed");
    const mine = claimed.filter((r) => r.claimed_by === me.email);
    const others = claimed.filter((r) => r.claimed_by !== me.email);
    const quiet = all
      .filter((r) => isQuiet(r, now, quietMin))
      .sort((a, b) => lastMoved(a) - lastMoved(b));
    const board: [string, number][] = PHASES.map((p) => [
      p.label,
      all.filter((r) => r.phase === p.value).length,
    ]).filter(([, n]) => (n as number) > 0) as [string, number][];
    return { hands, quiet, mine, others, board };
  }, [rows, now, quietMin, me.email]);

  async function act(uid: string, fn: () => Promise<void>) {
    setBusy(uid);
    setError("");
    try {
      await fn();
    } catch (e) {
      console.error("[osc] floor action failed", e);
      setError(e instanceof Error && !("code" in e) ? e.message : "That didn't go through. Try again?");
    } finally {
      setBusy("");
    }
  }

  if (session === undefined) {
    return (
      <p className="text-sm text-haze" aria-busy="true">
        Loading…
      </p>
    );
  }
  if (session === null) {
    return (
      <div className="card rounded-panel bg-raise p-8">
        <p className="text-body text-haze">
          No Build Day on right now. The queue opens an hour before one starts.
        </p>
        {error && <p className="mt-3 text-sm text-ember">{error}</p>}
      </div>
    );
  }

  const sid = session.id;
  const everyone = (rows ?? [])
    .filter((r) => !phaseFilter || r.phase === phaseFilter)
    .filter((r) => !q.trim() || r.name.toLowerCase().includes(q.trim().toLowerCase()))
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <p className="font-mono text-sm text-haze">
          <span className="text-accent">● Live</span> · {session.title}
          {session.location ? ` · ${session.location}` : ""}
        </p>
        <a
          href="/dashboard/build-days/screen"
          target="_blank"
          rel="noopener"
          className="tap font-mono text-label uppercase tracking-wider text-haze underline hover:text-ink"
        >
          Big screen ↗
        </a>
      </div>

      {error && (
        <p className="text-sm text-ember" role="alert">
          {error}
        </p>
      )}

      <Counts
        loading={rows === null}
        rows={[
          ["On the floor", rows?.length ?? 0],
          ["Hands up", hands.length],
          ["Being helped", mine.length + others.length],
          ["Quiet", quiet.length],
        ]}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <List title="Hands up" empty="No hands up. 🎉">
            {hands.map((r) => (
              <Student key={r.uid} r={r} now={now} waited={r.help_at}>
                <button
                  type="button"
                  className="btn btn-primary btn-compact disabled:opacity-60"
                  disabled={busy !== ""}
                  onClick={() => void act(r.uid, () => claim(sid, r.uid, me))}
                >
                  {busy === r.uid ? "…" : "Claim"}
                </button>
              </Student>
            ))}
          </List>

          <List
            title="Quiet"
            empty="Everyone's moving."
            action={
              <select
                className={ctl}
                value={quietMin}
                onChange={(e) => setQuietMin(Number(e.target.value))}
                aria-label="Quiet after"
              >
                {QUIET_OPTIONS.map((m) => (
                  <option key={m} value={m}>
                    Still for {m}+ min
                  </option>
                ))}
              </select>
            }
          >
            {quiet.map((r) => (
              <Student key={r.uid} r={r} now={now} waited={lastMoved(r)}>
                <button
                  type="button"
                  className="btn btn-secondary btn-compact disabled:opacity-60"
                  disabled={busy !== ""}
                  onClick={() => void act(r.uid, () => claim(sid, r.uid, me))}
                >
                  {busy === r.uid ? "…" : "Check in"}
                </button>
              </Student>
            ))}
          </List>
        </div>

        <div className="space-y-6">
          <List title="On it" empty="Nobody claimed yet.">
            {[...mine, ...others].map((r) => {
              const yours = r.claimed_by === me.email;
              return (
                <Student
                  key={r.uid}
                  r={r}
                  now={now}
                  waited={r.claimed_at}
                  tag={yours ? "you" : r.claimed_name}
                >
                  {yours && (
                    <div className="flex gap-3">
                      <button
                        type="button"
                        className="btn btn-primary btn-compact disabled:opacity-60"
                        disabled={busy !== ""}
                        onClick={() => void act(r.uid, () => resolve(sid, r.uid))}
                      >
                        Done
                      </button>
                      <button
                        type="button"
                        className="tap font-mono text-label uppercase tracking-wider text-haze underline hover:text-ink"
                        disabled={busy !== ""}
                        onClick={() => void act(r.uid, () => release(sid, r.uid))}
                      >
                        Hand back
                      </button>
                    </div>
                  )}
                </Student>
              );
            })}
          </List>

          <Bars
            title="Where the room is"
            rows={board}
            total={rows?.length ?? 0}
            empty="Nobody on the floor yet."
          />
        </div>
      </div>

      {/* ---------------------------------------------------------------- everyone */}
      <div className="card rounded-panel bg-raise p-6 sm:p-7">
        <h3 className="label">Everyone</h3>
        <div className="mt-4 flex flex-wrap gap-3">
          <input
            className={`${ctl} min-w-0 flex-1`}
            placeholder="Search a name"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            aria-label="Search students"
          />
          <select
            className={ctl}
            value={phaseFilter}
            onChange={(e) => setPhaseFilter(e.target.value)}
            aria-label="Phase"
          >
            <option value="">Any phase</option>
            {PHASES.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        </div>
        <ul className="mt-4 divide-y divide-seam border-t border-seam">
          {everyone.map((r) => (
            <li key={r.uid} className="flex flex-wrap items-baseline gap-x-4 gap-y-1 py-3">
              <span className="min-w-0 flex-1 truncate text-sm font-medium text-ink">
                {r.name}
                {r.seat && <span className="ml-2 font-mono text-xs text-dust">{r.seat}</span>}
              </span>
              <span className="font-mono text-xs text-haze">
                {PHASE_LABEL[r.phase]} · {since(r.phase_at, now)}
              </span>
              {r.help !== "none" && (
                <span className="font-mono text-label uppercase tracking-wider text-accent">
                  {r.help === "open" ? "✋" : `→ ${r.claimed_name}`}
                </span>
              )}
            </li>
          ))}
          {rows !== null && everyone.length === 0 && (
            <li className="py-4 text-sm text-haze">Nobody here.</li>
          )}
        </ul>
      </div>
    </div>
  );
}

function List({
  title,
  empty,
  action,
  children,
}: {
  title: string;
  empty: string;
  action?: React.ReactNode;
  children: React.ReactNode[];
}) {
  return (
    <div className="card rounded-panel bg-raise p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="label">
          {title}
          {children.length > 0 && <span className="ml-2 text-accent">{children.length}</span>}
        </h3>
        {action}
      </div>
      <ul className="mt-4 space-y-3">
        {children.length === 0 ? <li className="text-sm text-dust">{empty}</li> : children}
      </ul>
    </div>
  );
}

function Student({
  r,
  now,
  waited,
  tag,
  children,
}: {
  r: FloorRow;
  now: number;
  /** The clock this list cares about: waiting since, quiet since, claimed since. */
  waited: unknown;
  tag?: string;
  children?: React.ReactNode;
}) {
  const links = [
    r.repo && { href: `https://github.com/${r.repo}`, label: r.repo },
    r.issue_url && { href: r.issue_url, label: "issue" },
    r.pr_url && { href: r.pr_url, label: "PR" },
  ].filter(Boolean) as { href: string; label: string }[];

  return (
    <li className="rounded-tile bg-sunk px-4 py-3">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-ink">
            {r.name}
            {tag && (
              <span className="ml-2 font-mono text-label uppercase tracking-wider text-accent">
                {tag}
              </span>
            )}
          </p>
          <p className="mt-0.5 font-mono text-xs text-haze">
            {r.seat ? `${r.seat} · ` : ""}
            {PHASE_LABEL[r.phase]} · {since(waited, now)}
          </p>
          {r.help_note && <p className="mt-1.5 text-sm text-ink">“{r.help_note}”</p>}
          {links.length > 0 && (
            <p className="mt-1.5 flex flex-wrap gap-x-3 font-mono text-xs">
              {links.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="tap text-haze underline hover:text-ink"
                >
                  {l.label}
                </a>
              ))}
            </p>
          )}
        </div>
        {children}
      </div>
    </li>
  );
}

export default function FloorDesk() {
  return (
    <Gate>
      <Desk />
    </Gate>
  );
}
