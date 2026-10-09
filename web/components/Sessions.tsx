"use client";

// Upcoming sessions, on the organisers' page.
//
// THE TABLE FROM THE DESIGN: date, title, speaker, and one action per row. It is the
// piece the notice board could not do — see lib/sessions.ts for why a session is not a
// notice, in short: a notice has no time and never stops being current.
//
// PAST SESSIONS ARE KEPT AND SHOWN SEPARATELY rather than hidden. An organiser writing
// next term's schedule wants last term's in front of them — it is the only record of what
// the club has actually run, and it is where the titles get reused from.
//
// `datetime-local` RATHER THAN A DATE PICKER COMPONENT. It is one input, it is keyboard
// accessible for free, it gets the platform's own picker on a phone, and it carries no
// dependency. What it costs is a formatting quirk handled in lib/sessions.ts: it wants
// the LOCAL clock with no timezone, so a value built with toISOString() shows an organiser
// in India a time several hours off the one they just chose.

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import AudiencePicker from "@/components/AudiencePicker";
import Icon from "@/components/Icon";
import { DEFAULT_AUDIENCE, audienceOf, type Audience } from "@/lib/audience";
import { useAuth } from "@/lib/auth";
import {
  deleteSession,
  readSessions,
  saveSession,
  sessionWhen,
  toLocalInput,
  upcoming,
  type SessionDoc,
} from "@/lib/sessions";

const ctl =
  "w-full rounded-inline border border-seam bg-sunk px-3.5 py-2.5 text-sm text-ink placeholder:text-dust outline-none transition focus:border-accent";

function Row({
  s,
  onEdit,
  onCancel,
  past,
}: {
  s: SessionDoc;
  onEdit: () => void;
  onCancel: () => void;
  past?: boolean;
}) {
  const when = sessionWhen(s.starts_at);
  return (
    <tr className={`border-t border-seam align-top ${past ? "opacity-60" : ""}`}>
      <td className="py-3 pr-4">
        <span className="block font-mono text-xs font-medium uppercase tracking-wider text-accent">
          {when.day}
        </span>
        <span className="block font-mono text-xs text-dust">{when.time}</span>
      </td>
      <td className="py-3 pr-4">
        <span className="block text-sm font-medium text-ink">
          {s.title}
          {/* MARKED IN THE LIST, because "is this one a Build Day" is otherwise only
              answerable by opening the editor — and it is the field that decides whether a
              roll can be taken at it at all. */}
          {s.kind === "build-day" && (
            <span className="ml-2 font-mono text-label uppercase tracking-wider text-accent">
              build day
            </span>
          )}
        </span>
        {s.location && (
          <span className="block text-sm text-haze">{s.location}</span>
        )}
      </td>
      {/* "TBA" is the design's word for an unbooked speaker, and it is more honest than
          an empty cell — it says the slot exists and nobody is in it yet. */}
      <td className="py-3 pr-4 font-mono text-sm text-haze">{s.speaker || "TBA"}</td>
      <td className="py-3">
        <div className="flex flex-wrap gap-3">
          {/* ONLY ON THE ONES THAT HAVE ALREADY RUN. The roll-call screen offers no session
              that has not started — nobody can be present at a thing that has not happened —
              so a link here on a future Build Day would land on a picker that quietly chose
              a different session. */}
          {s.kind === "build-day" && past && (
            <Link
              href={`/admin/build-days?session=${s.id}`}
              className="tap font-mono text-label uppercase tracking-wider text-accent underline transition-colors hover:text-ink"
            >
              Take the roll
            </Link>
          )}
          <button
            type="button"
            onClick={onEdit}
            className="tap font-mono text-label uppercase tracking-wider text-haze underline transition-colors hover:text-ink"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="tap font-mono text-label uppercase tracking-wider text-haze underline transition-colors hover:text-ember"
          >
            Cancel
          </button>
        </div>
      </td>
    </tr>
  );
}

export default function Sessions() {
  const { user, isAdmin } = useAuth();
  const [rows, setRows] = useState<SessionDoc[] | null>(null);
  const [editing, setEditing] = useState<SessionDoc | null>(null);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [speaker, setSpeaker] = useState("");
  const [location, setLocation] = useState("");
  const [when, setWhen] = useState("");
  const [audience, setAudience] = useState<Audience>(DEFAULT_AUDIENCE);
  const [buildDay, setBuildDay] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [note, setNote] = useState("");

  const load = useCallback(async () => {
    try {
      setRows(await readSessions());
    } catch (e) {
      console.error("[osc] could not read sessions", e);
      setError("Couldn't load the schedule. Are the rules deployed?");
      setRows([]);
    }
  }, []);

  useEffect(() => {
    if (isAdmin !== true) return;
    void load();
  }, [isAdmin, load]);

  if (isAdmin !== true || !user?.email) return null;

  function reset() {
    setEditing(null);
    setOpen(false);
    setTitle("");
    setSpeaker("");
    setLocation("");
    setWhen("");
    setAudience(DEFAULT_AUDIENCE);
    setBuildDay(false);
    setError("");
  }

  function edit(s: SessionDoc) {
    setEditing(s);
    setOpen(true);
    setTitle(s.title);
    setSpeaker(s.speaker ?? "");
    setLocation(s.location ?? "");
    setWhen(toLocalInput(s.starts_at));
    // audienceOf() rather than `s.audience ?? "both"`, so a session scheduled before
    // this field existed opens in the editor showing the audience it actually has
    // rather than an empty select that would save as something else.
    setAudience(audienceOf(s.audience));
    setBuildDay(s.kind === "build-day");
    setNote("");
    setError("");
  }

  async function save() {
    setError("");
    setNote("");
    if (!title.trim()) {
      setError("A session needs a title.");
      return;
    }
    const at = new Date(when);
    // Checked before the write so the reason is a sentence rather than a permission
    // error. The rules refuse a non-timestamp too, but they cannot explain themselves.
    if (!when || Number.isNaN(at.getTime())) {
      setError("Add a date and a time.");
      return;
    }
    setBusy(true);
    try {
      await saveSession(
        editing?.id ?? null,
        user!.email!,
        { title, speaker, location, starts_at: at, audience, buildDay },
        editing,
      );
      setNote(
        editing
          ? "Updated."
          : audience === "members"
            ? "Scheduled. Members see it now."
            : audience === "students"
              ? "Scheduled. Non-members only."
              : "Scheduled. Everyone sees it now.",
      );
      reset();
      await load();
    } catch (e) {
      console.error("[osc] could not save the session", e);
      setError(
        "Firestore said no. Check the rules are deployed and you're an admin.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function cancel(s: SessionDoc) {
    // A native confirm, for the same reason the notice board uses one: it is destructive,
    // rare, and the one dialogue on the page that cannot be mis-clicked through.
    if (!window.confirm(`Cancel “${s.title}”? Members will stop seeing it.`)) return;
    setError("");
    try {
      await deleteSession(s.id);
      await load();
    } catch (e) {
      console.error("[osc] could not cancel the session", e);
      setError("Could not cancel that. Reload and try again.");
    }
  }

  const next = rows ? upcoming(rows) : [];
  const past = rows ? rows.filter((r) => !next.includes(r)).reverse() : [];

  return (
    <div className="card rounded-panel bg-raise p-6 sm:p-7">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-accent-soft text-accent">
            <Icon name="calendar" size="1rem" strokeWidth={1.75} />
          </span>
          <h2 className="truncate font-mono text-sm font-medium uppercase tracking-[0.08em] text-ink">
            Upcoming sessions
          </h2>
        </div>
        <button
          type="button"
          onClick={() => (open ? reset() : setOpen(true))}
          className="btn btn-primary btn-compact"
        >
          {open ? "Cancel" : "＋ Schedule"}
        </button>
      </div>

      {open && (
        <div className="mt-5 rounded-tile bg-sunk p-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="se-title" className="label">
                What is it
              </label>
              <input
                id="se-title"
                className={`${ctl} mt-2`}
                value={title}
                maxLength={120}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Introduction to Rust"
              />
            </div>
            <div>
              <label htmlFor="se-when" className="label">
                When
              </label>
              <input
                id="se-when"
                type="datetime-local"
                className={`${ctl} mt-2`}
                value={when}
                onChange={(e) => setWhen(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="se-speaker" className="label">
                Who is running it <span className="text-dust">(optional)</span>
              </label>
              <input
                id="se-speaker"
                className={`${ctl} mt-2`}
                value={speaker}
                maxLength={120}
                onChange={(e) => setSpeaker(e.target.value)}
                placeholder="Leave blank for TBA"
              />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="se-loc" className="label">
                Where <span className="text-dust">(optional)</span>
              </label>
              <input
                id="se-loc"
                className={`${ctl} mt-2`}
                value={location}
                maxLength={120}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Lab 2"
              />
            </div>
            <AudiencePicker
              id="se-audience"
              noun="session"
              value={audience}
              onChange={setAudience}
              controlClassName={ctl}
              className="sm:col-span-2"
            />

            {/* A CHECKBOX RATHER THAN A "TYPE" SELECT, because there are two kinds of
                session and one of them is the ordinary one. A select would make an
                organiser choose between "Session" and "Build Day" every time they schedule
                a talk, to say the thing the empty state already says.

                WHAT IT ACTUALLY TURNS ON is the roll — see /admin/build-days. It is worth
                saying here, because "Build Day" is a word the club uses for a kind of
                event, and a reader could reasonably think this only changes a label. */}
            <div className="sm:col-span-2">
              <label className="flex items-start gap-3">
                <input
                  type="checkbox"
                  className="mt-1"
                  checked={buildDay}
                  onChange={(e) => setBuildDay(e.target.checked)}
                />
                <span className="min-w-0">
                  <span className="block text-sm font-medium text-ink">
                    This is a Build Day
                  </span>
                  <span className="block text-sm text-haze">
                    Adds a roll call for who came and which track.
                  </span>
                </span>
              </label>
            </div>
          </div>

          {error && (
            <p className="mt-4 text-sm leading-relaxed text-ember" role="alert">
              {error}
            </p>
          )}

          <button
            type="button"
            onClick={() => void save()}
            disabled={busy}
            className="btn btn-primary mt-5 disabled:opacity-60"
          >
            {busy ? "Saving…" : editing ? "Save changes" : "Put it on the calendar"}
          </button>
        </div>
      )}

      {note && !error && <p className="mt-4 text-sm text-haze">{note}</p>}
      {error && !open && (
        <p className="mt-4 text-sm leading-relaxed text-ember" role="alert">
          {error}
        </p>
      )}

      <div className="mt-5">
        {rows === null && (
          <p className="text-sm text-haze" aria-busy="true">
            Loading the schedule…
          </p>
        )}

        {rows !== null && next.length === 0 && (
          <p className="text-sm text-haze">
            Nothing scheduled yet.
          </p>
        )}

        {next.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[34rem] text-left">
              <thead>
                <tr>
                  {["Date", "Session", "Speaker", "Action"].map((h) => (
                    <th
                      key={h}
                      className="pb-2 pr-4 font-mono text-label font-medium uppercase tracking-[0.1em] text-haze"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {next.map((s) => (
                  <Row key={s.id} s={s} onEdit={() => edit(s)} onCancel={() => void cancel(s)} />
                ))}
              </tbody>
            </table>
          </div>
        )}

        {past.length > 0 && (
          <details className="mt-5">
            <summary className="tap cursor-pointer font-mono text-label uppercase tracking-wider text-haze hover:text-ink">
              {past.length} already happened
            </summary>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[34rem] text-left">
                <tbody>
                  {past.map((s) => (
                    <Row
                      key={s.id}
                      s={s}
                      past
                      onEdit={() => edit(s)}
                      onCancel={() => void cancel(s)}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </details>
        )}
      </div>
    </div>
  );
}
