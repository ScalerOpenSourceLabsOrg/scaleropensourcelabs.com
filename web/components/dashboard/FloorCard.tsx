"use client";

// A student's side of a live Build Day: where they are, a way to get a mentor, and who
// else in the room is where.
//
// JOINING IS AUTOMATIC. Opening this page while a Build Day is on puts you on the floor at
// "Just joined", because the students who would not press a "join" button are the same
// ones who would not raise a hand — and the mentors' quiet list can only notice somebody
// it knows is in the room.
//
// NOTHING IS ANONYMOUS. Everybody sees who is at each phase and who has a hand up, so a
// classmate who just fixed the same error can walk over before a mentor does.

import { useEffect, useState } from "react";
import {
  PHASES,
  isMilestone,
  since,
  watchFloor,
  watchMine,
  writeMine,
  type FloorRow,
  type MyChange,
} from "@/lib/floor";
import type { SessionDoc } from "@/lib/sessions";
import { toDate } from "@/lib/profile";
import { isHttps, isRepo } from "@/lib/buildDays";
import { field } from "@/components/admin/ui";
import { celebrate } from "@/components/fx/celebrate";

export default function FloorCard({
  session,
  uid,
  name,
}: {
  session: SessionDoc;
  uid: string;
  name: string;
}) {
  /** undefined while the first snapshot is in flight; null when they have not joined. */
  const [mine, setMine] = useState<FloorRow | null | undefined>(undefined);
  /** Everybody on the floor, this student included. */
  const [rows, setRows] = useState<FloorRow[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [note, setNote] = useState("");
  const [links, setLinks] = useState({ repo: "", issue_url: "", pr_url: "" });
  const [showLinks, setShowLinks] = useState(false);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    let alive = true;
    const subs: (() => void)[] = [];
    const fail = (e: unknown) => {
      console.error("[osc] floor read failed", e);
      if (alive) setError("Couldn't reach the floor. Reload?");
    };
    void watchMine(session.id, uid, (r) => alive && setMine(r), fail).then((u) =>
      alive ? subs.push(u) : u(),
    );
    void watchFloor(session.id, (r) => alive && setRows(r), fail).then((u) =>
      alive ? subs.push(u) : u(),
    );
    return () => {
      alive = false;
      subs.forEach((u) => u());
    };
  }, [session.id, uid]);

  // Seed the editable fields once, from what is stored.
  const loaded = mine !== undefined;
  useEffect(() => {
    if (!loaded) return;
    setLinks({
      repo: mine?.repo ?? "",
      issue_url: mine?.issue_url ?? "",
      pr_url: mine?.pr_url ?? "",
    });
    // Only on first load — after that the inputs belong to the student.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded]);

  async function save(change: MyChange) {
    setBusy(true);
    setError("");
    try {
      await writeMine(session.id, { uid, name }, mine ?? null, change);
      if (change.phase && isMilestone(change.phase)) void celebrate();
    } catch (e) {
      console.error("[osc] floor write failed", e);
      setError("That didn't save. Try again?");
    } finally {
      setBusy(false);
    }
  }

  // Auto-join: a confirmed "no row" becomes "Just joined".
  useEffect(() => {
    if (mine === null && !busy && !error) void save({});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mine]);

  function saveLinks() {
    if (links.repo.trim() && !isRepo(links.repo)) {
      setError("Repo looks like owner/name.");
      return;
    }
    if (
      (links.issue_url.trim() && !isHttps(links.issue_url)) ||
      (links.pr_url.trim() && !isHttps(links.pr_url))
    ) {
      setError("Links start with https://");
      return;
    }
    void save({ ...links }).then(() => setShowLinks(false));
  }

  const counts: Record<string, number> = {};
  for (const r of rows) counts[r.phase] = (counts[r.phase] ?? 0) + 1;
  const at = (v: unknown) => toDate(v)?.getTime() ?? 0;
  const hands = rows
    .filter((r) => r.help !== "none" && r.uid !== uid)
    .sort((a, b) => at(a.help_at) - at(b.help_at));
  const waiting = rows.filter((r) => r.help === "open").length;

  return (
    <section className="card rounded-panel bg-raise p-6 sm:p-7" aria-labelledby="floor-title">
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
        <div className="min-w-0">
          <p className="font-mono text-label uppercase tracking-wider text-accent">● Live now</p>
          <h2 id="floor-title" className="mt-1 font-display text-display-md font-bold tracking-tight">
            {session.title}
          </h2>
        </div>
        {rows.length > 0 && (
          <p className="font-mono text-sm text-haze">
            {rows.length} building · {waiting} waiting for help
          </p>
        )}
      </div>

      {error && (
        <p className="mt-4 text-sm text-ember" role="alert">
          {error}
        </p>
      )}

      {!mine ? (
        <p className="mt-6 text-sm text-haze" aria-busy="true">
          Getting you a seat…
        </p>
      ) : (
        <>
          {/* --------------------------------------------------------- the hand */}
          <div className="mt-6 rounded-tile bg-sunk p-5">
            {mine.help === "none" && (
              <>
                <p className="label">Stuck?</p>
                <div className="mt-3 flex flex-wrap gap-3">
                  <input
                    className={`${field} min-w-0 flex-1 sm:w-auto`}
                    placeholder="What's up? (optional)"
                    maxLength={280}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    aria-label="What you're stuck on"
                  />
                  <button
                    type="button"
                    className="btn btn-primary btn-compact disabled:opacity-60"
                    disabled={busy}
                    onClick={() =>
                      void save({ help: "open", help_note: note }).then(() => setNote(""))
                    }
                  >
                    Get a mentor
                  </button>
                </div>
                <p className="mt-2 text-sm text-dust">Mentors and classmates can jump in.</p>
              </>
            )}

            {mine.help === "open" && (
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-display text-lg font-bold">✋ Hand&rsquo;s up</p>
                  <p className="mt-1 text-sm text-haze">
                    Waiting {since(mine.help_at, now)}
                    {mine.help_note ? ` · “${mine.help_note}”` : ""}
                  </p>
                </div>
                <button
                  type="button"
                  className="tap font-mono text-label uppercase tracking-wider text-haze underline hover:text-ink"
                  disabled={busy}
                  onClick={() => void save({ help: "none" })}
                >
                  Sorted it myself
                </button>
              </div>
            )}

            {mine.help === "claimed" && (
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="font-display text-lg font-bold">
                  👋 {mine.claimed_name} is on the way
                </p>
                <button
                  type="button"
                  className="tap font-mono text-label uppercase tracking-wider text-haze underline hover:text-ink"
                  disabled={busy}
                  onClick={() => void save({ help: "none" })}
                >
                  Sorted it myself
                </button>
              </div>
            )}
          </div>

          {/* -------------------------------------------------------- the phase */}
          <p className="label mt-8">Where are you at?</p>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {PHASES.map((p) => {
              const on = mine.phase === p.value;
              const n = counts[p.value] ?? 0;
              return (
                <li key={p.value}>
                  <button
                    type="button"
                    aria-pressed={on}
                    disabled={busy || on}
                    onClick={() => void save({ phase: p.value })}
                    className={`flex min-h-[44px] w-full items-center justify-between gap-3 rounded-inline border px-3.5 py-2.5 text-left text-sm transition ${
                      on
                        ? "border-accent bg-accent text-bg"
                        : "border-seam bg-sunk text-ink hover:border-accent"
                    }`}
                  >
                    <span>{p.label}</span>
                    {n > 0 && (
                      <span className={`font-mono text-xs ${on ? "text-bg" : "text-dust"}`}>
                        {on ? (n > 1 ? `+${n - 1}` : "you") : n}
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>

          {/* --------------------------------------------------------- the room */}
          {hands.length > 0 && (
            <>
              <p className="label mt-8">Hands up · know the fix? Go say hi</p>
              <ul className="mt-3 space-y-2">
                {hands.map((r) => (
                  <li key={r.uid} className="rounded-tile bg-sunk px-4 py-3 text-sm">
                    <span className="font-medium text-ink">{r.name}</span>
                    <span className="font-mono text-xs text-dust">
                      {r.seat ? ` · ${r.seat}` : ""} · {since(r.help_at, now)}
                      {r.help === "claimed" ? ` · ${r.claimed_name} is on it` : ""}
                    </span>
                    {r.help_note && <p className="mt-1 text-haze">“{r.help_note}”</p>}
                  </li>
                ))}
              </ul>
            </>
          )}

          <p className="label mt-8">Who&rsquo;s where</p>
          <ul className="mt-3 space-y-1.5 text-sm">
            {PHASES.filter((p) => counts[p.value]).map((p) => (
              <li key={p.value} className="flex flex-wrap gap-x-2">
                <span className="font-mono text-xs uppercase tracking-wider text-dust">
                  {p.label}
                </span>
                <span className="text-ink">
                  {rows
                    .filter((r) => r.phase === p.value)
                    .map((r) => (r.uid === uid ? "you" : r.name))
                    .join(", ")}
                </span>
              </li>
            ))}
          </ul>

          {/* -------------------------------------------------------- the links */}
          <div className="mt-6">
            <button
              type="button"
              aria-expanded={showLinks}
              onClick={() => setShowLinks(!showLinks)}
              className="tap font-mono text-label uppercase tracking-wider text-haze underline hover:text-ink"
            >
              {showLinks ? "Close" : mine.repo || mine.pr_url ? "Your links ●" : "Add your repo / issue / PR"}
            </button>
            {showLinks && (
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <input
                  className={field}
                  placeholder="owner/repo"
                  maxLength={140}
                  value={links.repo}
                  onChange={(e) => setLinks({ ...links, repo: e.target.value })}
                  aria-label="Repository"
                />
                <input
                  className={field}
                  placeholder="Issue link"
                  maxLength={500}
                  value={links.issue_url}
                  onChange={(e) => setLinks({ ...links, issue_url: e.target.value })}
                  aria-label="Issue link"
                />
                <input
                  className={field}
                  placeholder="PR link"
                  maxLength={500}
                  value={links.pr_url}
                  onChange={(e) => setLinks({ ...links, pr_url: e.target.value })}
                  aria-label="Pull request link"
                />
                <div className="sm:col-span-3">
                  <button
                    type="button"
                    className="btn btn-primary btn-compact disabled:opacity-60"
                    disabled={busy}
                    onClick={saveLinks}
                  >
                    Save
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </section>
  );
}
