"use client";

// The projector view of a live Build Day: the room's progress, big enough to read from
// the back, and a cheer every time somebody ships something.
//
// RUN FROM AN ORGANISER'S OR FLOOR MENTOR'S LAPTOP. Names are shown — nothing on the
// floor is anonymous.
//
// COVERS THE APP SHELL rather than living outside it: a fixed full-viewport layer is one
// div, where a route outside the (app) group would need its own auth provider and layout.

import { useEffect, useMemo, useRef, useState } from "react";
import {
  PHASES,
  milestoneFeed,
  since,
  watchFloor,
  type FloorRow,
} from "@/lib/floor";
import { celebrate } from "@/components/fx/celebrate";
import { Gate, useLiveSession } from "@/components/floor/FloorDesk";

const SHIPPED = new Set(["pr-opened", "review", "merged"]);

function Screen() {
  const [error, setError] = useState("");
  const session = useLiveSession(setError);
  const [rows, setRows] = useState<FloorRow[] | null>(null);
  const [now, setNow] = useState(() => Date.now());
  /** Feed keys already cheered. null until the first snapshot, which is the backlog —
   *  opening the screen mid-session must not fire twenty bursts at once. */
  const seen = useRef<Set<string> | null>(null);

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 15_000);
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
        if (alive) setError("Couldn't load the floor.");
      },
    ).then((u) => (alive ? (unsub = u) : u()));
    return () => {
      alive = false;
      unsub?.();
    };
  }, [session]);

  const feed = useMemo(() => milestoneFeed(rows ?? []), [rows]);

  // One burst per NEW milestone, after the first snapshot.
  useEffect(() => {
    if (rows === null) return;
    const keys = new Set(feed.map((f) => f.key));
    if (seen.current === null) {
      seen.current = keys;
      return;
    }
    const fresh = feed.filter((f) => !seen.current!.has(f.key));
    fresh.forEach((f) => seen.current!.add(f.key));
    if (fresh.length > 0) void celebrate();
  }, [feed, rows]);

  const all = rows ?? [];
  const max = Math.max(1, ...PHASES.map((p) => all.filter((r) => r.phase === p.value).length));
  const shipped = all.filter((r) => SHIPPED.has(r.phase)).length;
  const merged = all.filter((r) => r.phase === "merged").length;
  const hands = all.filter((r) => r.help === "open").length;

  function fullscreen() {
    void document.documentElement.requestFullscreen?.().catch(() => {});
  }

  return (
    <div className="fixed inset-0 z-[100] overflow-auto bg-bg text-ink">
      <div className="mx-auto flex min-h-full max-w-[1600px] flex-col gap-8 p-6 sm:p-10">
        <header className="flex flex-wrap items-baseline justify-between gap-4">
          <div>
            <p className="font-mono text-sm uppercase tracking-[0.2em] text-accent">● Live</p>
            <h1 className="mt-1 font-display text-4xl font-bold tracking-tight sm:text-6xl">
              {session ? session.title : "Build Day"}
            </h1>
          </div>
          <div className="flex items-center gap-4 font-mono text-sm text-haze">
            <span className="text-2xl tabular-nums text-ink">
              {new Date(now).toLocaleTimeString("en-IN", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
              })}
            </span>
            <button type="button" onClick={fullscreen} className="tap underline hover:text-ink">
              Fullscreen
            </button>
            <a href="/dashboard/build-days/floor" className="tap underline hover:text-ink">
              Exit
            </a>
          </div>
        </header>

        {error && <p className="text-lg text-ember">{error}</p>}

        {session === undefined && <p className="text-2xl text-haze">Loading…</p>}
        {session === null && (
          <p className="text-3xl text-haze">No Build Day on right now. See you at the next one!</p>
        )}

        {session && (
          <>
            {/* -------------------------------------------------------- the numbers */}
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {(
                [
                  ["Building", all.length],
                  ["PRs opened", shipped],
                  ["Merged", merged],
                  ["Hands up", hands],
                ] as const
              ).map(([k, v]) => (
                <div key={k} className="card rounded-panel bg-raise p-6">
                  <p className="font-mono text-sm uppercase tracking-[0.14em] text-haze">{k}</p>
                  <p className="mt-2 font-display text-6xl font-bold tabular-nums tracking-tight sm:text-7xl">
                    {rows === null ? "…" : v}
                  </p>
                </div>
              ))}
            </div>

            <div className="grid flex-1 gap-6 lg:grid-cols-[3fr_2fr]">
              {/* ------------------------------------------------------ the room */}
              <section className="card rounded-panel bg-raise p-6 sm:p-8">
                <h2 className="font-mono text-sm uppercase tracking-[0.14em] text-haze">
                  Where the room is
                </h2>
                <ul className="mt-5 space-y-2.5">
                  {PHASES.map((p) => {
                    const n = all.filter((r) => r.phase === p.value).length;
                    return (
                      <li key={p.value} className="grid grid-cols-[12rem_1fr_2.5rem] items-center gap-4 sm:grid-cols-[16rem_1fr_3rem]">
                        <span className={`truncate text-base sm:text-lg ${n ? "text-ink" : "text-dust"}`}>
                          {p.label}
                        </span>
                        <span className="h-3 overflow-hidden rounded-full bg-sunk">
                          <span
                            className="block h-full rounded-full bg-accent transition-[width] duration-700"
                            style={{ width: `${(n / max) * 100}%` }}
                          />
                        </span>
                        <span className="text-right font-mono text-lg tabular-nums">{n || ""}</span>
                      </li>
                    );
                  })}
                </ul>
              </section>

              {/* ------------------------------------------------------ the feed */}
              <section className="card rounded-panel bg-raise p-6 sm:p-8">
                <h2 className="font-mono text-sm uppercase tracking-[0.14em] text-haze">
                  Just shipped
                </h2>
                <ul className="mt-5 space-y-4">
                  {feed.length === 0 && (
                    <li className="text-xl text-dust">First PR gets the confetti. 👀</li>
                  )}
                  {feed.map((f, i) => (
                    <li
                      key={f.key}
                      className={`rounded-tile bg-sunk px-5 py-4 ${i === 0 ? "ring-2 ring-accent" : ""}`}
                    >
                      <p className="text-xl font-medium sm:text-2xl">
                        🎉 {f.who} {f.did}
                      </p>
                      <p className="mt-1 font-mono text-sm text-haze">{since(f.at, now)} ago</p>
                    </li>
                  ))}
                </ul>
              </section>
            </div>

            <p className="text-center text-lg text-haze">
              Stuck? Hit <span className="font-medium text-ink">Get a mentor</span> on your Build
              Days page.
            </p>
          </>
        )}
      </div>
    </div>
  );
}

export default function BigScreen() {
  return (
    <Gate>
      <Screen />
    </Gate>
  );
}
