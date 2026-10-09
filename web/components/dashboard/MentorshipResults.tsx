"use client";

// What an organiser sees on /dashboard/mentorship: the picker's results, per mentor.
//
// NOT A COPY OF /admin/mentorship. That page is the workbench — publishing, the paged
// interest list, CSV export — and it is built around a table because a table is what you
// filter and export. This is the answer to the question an organiser has when they open
// the same page every member opens: "so, who wants whom?" One card per mentor, with the
// students who chose them, which is the shape the pairing conversation actually takes.
//
// IT READS EVERY ENROLLMENT, plus the profiles they name, and that is the cost of putting
// names on the cards — a name lives on the profile, not on the enrollment. Two reads per
// enrolled student, against a cohort measured in dozens. If that stops being true, the
// counts below can come from countDemand() and the names can move behind a button, the
// way the admin page already does it.

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Counts } from "@/components/admin/ui";
import Portrait from "@/components/Portrait";
import { photoFor } from "@/content/lookup";
import { readProfilesByIds, type Profile } from "@/lib/profile";
import {
  readAllEnrollments,
  readMentors,
  type Enrollment,
  type Mentor,
} from "@/lib/mentorship";

type Picked = { uid: string; name: string; email: string };

function Names({ label, people }: { label: string; people: Picked[] }) {
  return (
    <div>
      <p className="label">
        {label} · {people.length}
      </p>
      {people.length === 0 ? (
        <p className="mt-2 text-sm text-dust">Nobody yet.</p>
      ) : (
        <ul className="mt-2 space-y-1">
          {people.map((p) => (
            <li key={p.uid} className="text-sm text-ink" title={p.email}>
              {p.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function MentorshipResults() {
  const [mentors, setMentors] = useState<Mentor[] | null>(null);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [profiles, setProfiles] = useState<Map<string, Profile>>(new Map());
  const [error, setError] = useState("");
  const [reloading, setReloading] = useState(false);

  const load = useCallback(async () => {
    setError("");
    setReloading(true);
    try {
      const [ms, es] = await Promise.all([readMentors(), readAllEnrollments()]);
      setProfiles(await readProfilesByIds(es.map((e) => e.uid)));
      setMentors(ms);
      setEnrollments(es);
    } catch (e) {
      console.error("[osc] could not load mentorship results", e);
      setMentors([]);
      setError("Couldn't load the results. Refresh to try again.");
    } finally {
      setReloading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  /** Per mentor, who put them first and who put them second. Most-wanted first; a hidden
   *  mentor only appears if somebody still has them as a preference. */
  const board = useMemo(() => {
    const person = (e: Enrollment): Picked => ({
      uid: e.uid,
      name: profiles.get(e.uid)?.name ?? e.email,
      email: e.email,
    });
    return (mentors ?? [])
      .map((m) => ({
        mentor: m,
        first: enrollments.filter((e) => e.mentor_1 === m.id).map(person),
        second: enrollments
          .filter((e) => !e.first_only && e.mentor_2 === m.id)
          .map(person),
      }))
      .filter((r) => r.mentor.active || r.first.length + r.second.length > 0)
      .sort(
        (a, b) =>
          b.first.length - a.first.length ||
          b.second.length - a.second.length ||
          a.mentor.name.localeCompare(b.mentor.name),
      );
  }, [mentors, enrollments, profiles]);

  const loading = mentors === null;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="chip">Organiser view</p>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <button
            type="button"
            onClick={() => void load()}
            disabled={reloading}
            className="btn btn-secondary btn-compact disabled:opacity-60"
          >
            {reloading ? "Refreshing…" : "Refresh"}
          </button>
          <Link
            href="/admin/mentorship"
            className="tap font-mono text-label uppercase tracking-wider text-haze underline decoration-seam underline-offset-4 transition-colors hover:text-ink"
          >
            Manage &amp; export
          </Link>
        </div>
      </div>

      {error && (
        <p className="card rounded-panel bg-raise p-6 text-sm text-ember" role="alert">
          {error}
        </p>
      )}

      <Counts
        loading={loading}
        rows={[
          ["Students enrolled", enrollments.length],
          ["Mentors", (mentors ?? []).filter((m) => m.active).length],
          ["No backup", enrollments.filter((e) => e.first_only).length],
        ]}
      />

      {!loading && board.length === 0 && (
        <p className="rounded-tile border border-dashed border-seam p-5 text-sm text-dust">
          No mentors published yet.
        </p>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        {board.map(({ mentor, first, second }) => (
          <article key={mentor.id} className="card rounded-panel bg-raise p-6">
            <div className="flex items-start gap-4">
              <Portrait
                name={mentor.name}
                photo={photoFor(mentor.name)}
                className="h-[4.5rem] w-14 shrink-0 rounded-tile"
              />
              <div className="min-w-0 flex-1">
                <h3 className="text-body-lg font-semibold text-ink">
                  {mentor.name}
                  {!mentor.active && (
                    <span className="ml-2 font-mono text-sm font-normal text-dust">hidden</span>
                  )}
                </h3>
                {mentor.org && (
                  <p className="mt-0.5 font-mono text-sm text-dust">{mentor.org}</p>
                )}
              </div>
              <p className="shrink-0 text-right">
                <span className="block font-display text-display-md font-bold tabular-nums leading-none">
                  {first.length}
                </span>
                <span className="label">first</span>
              </p>
            </div>
            <div className="mt-5 grid gap-5 border-t border-seam pt-5 sm:grid-cols-2">
              <Names label="First choice" people={first} />
              <Names label="As backup" people={second} />
            </div>
          </article>
        ))}
      </div>

      <p className="text-sm text-dust">Preferences, not pairings.</p>
    </div>
  );
}
