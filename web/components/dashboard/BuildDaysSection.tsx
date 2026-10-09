"use client";

// A member's own Build Day record: how many they have been to, which track they are on,
// and what they told an organiser they were working on.
//
// THE MEMBER CANNOT EDIT ANY OF IT, and the page has to say so rather than looking like a
// form nobody can submit. Attendance is one of the things the club selects its
// mentor-supported cohort on, so it is written by an organiser at the session — the same
// argument that keeps the GitHub counts out of every client's hands. What a member can do
// about a wrong row is tell an organiser, and the page says that in words.
//
// NO PULL REQUEST FIGURES HERE. They are on the overview, drawn from GitHub by
// Contributions.tsx, and repeating them would put two numbers for the same thing on two
// routes — which is how they come to disagree.
//
// ONE READ PER BUILD DAY rather than a query across all of them. lib/buildDays.ts carries
// the full argument; briefly, a collection-group query would need a rules wildcard and an
// index to save a dozen reads on a page somebody opens once a week.

import { useEffect, useState } from "react";
import RequireProfile from "@/components/dashboard/RequireProfile";
import SectionHead from "@/components/dashboard/SectionHead";
import Panel from "@/components/dashboard/Panel";
import { useAuth } from "@/lib/auth";
import {
  TRACK_LABEL,
  buildDays,
  held,
  readMyAttendance,
  type Attendee,
} from "@/lib/buildDays";
import { readSessions, sessionWhen, type SessionDoc } from "@/lib/sessions";
import { liveBuildDay } from "@/lib/floor";
import FloorCard from "@/components/dashboard/FloorCard";
import FloorDesk from "@/components/floor/FloorDesk";

/** One figure, matching the strip on the overview so the two pages read as one product. */
function Stat({ n, label }: { n: number | string; label: string }) {
  return (
    <div className="card rounded-panel bg-raise px-5 py-4">
      <p className="font-mono text-label font-medium uppercase leading-tight tracking-[0.12em] text-haze">
        {label}
      </p>
      <p className="mt-2 font-display text-display-md font-bold leading-none tabular-nums tracking-tight">
        {n}
      </p>
    </div>
  );
}

/** One line of the record, when there is something to say. */
function Detail({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <p className="mt-1.5 text-sm text-haze">
      <span className="font-mono text-label uppercase tracking-wider text-dust">{label}</span>{" "}
      {children}
    </p>
  );
}

function Record({ uid, name }: { uid: string; name: string }) {
  const { isClubMember, isAdmin, floorMentor } = useAuth();
  const [days, setDays] = useState<SessionDoc[] | null>(null);
  /** The Build Day on right now, if any — its live floor goes at the top. */
  const [live, setLive] = useState<SessionDoc | null>(null);
  const [mine, setMine] = useState<Map<string, Attendee>>(new Map());
  const [failed, setFailed] = useState(false);

  // WAIT FOR A DEFINITE ANSWER BEFORE ASKING, the same guard NextSessions carries:
  // `isClubMember` is undefined until the profile read returns, and the query built from it
  // decides which audiences this request may even mention. Asking early asks as the wrong
  // person and is refused outright.
  useEffect(() => {
    if (isClubMember === undefined) return;
    let alive = true;
    (async () => {
      try {
        const all = await readSessions(isClubMember);
        if (alive) setLive(liveBuildDay(all));
        const past = held(buildDays(all));
        // BOTH COMMITTED TOGETHER, and the order is the whole point. Setting `days`
        // first renders the record as "0 of N attended", track "—" and "no record" on
        // every row for as long as the attendance reads take — the same sentence the
        // catch below exists to keep off this page, arriving on a SUCCESSFUL load.
        const record = await readMyAttendance(past.map((s) => s.id), uid);
        if (!alive) return;
        setDays(past);
        setMine(record);
      } catch (e) {
        // A failed read here is not "you have never been to one", and must not render as
        // it — a member who has come to five Build Days seeing "0 attended" would
        // reasonably conclude the club lost their record.
        console.error("[osc] could not read the Build Day record", e);
        if (alive) {
          setDays([]);
          setFailed(true);
        }
      }
    })();
    return () => {
      alive = false;
    };
  }, [isClubMember, uid]);

  if (days === null) {
    return (
      <p className="text-sm text-haze" aria-busy="true">
        Loading…
      </p>
    );
  }

  if (failed) {
    return (
      <p className="measure text-sm leading-relaxed text-ember" role="alert">
        Couldn&apos;t load your Build Days. Reload — or tell an organiser if it sticks.
      </p>
    );
  }

  const attended = days.filter((s) => mine.has(s.id));
  // The most recent Build Day they were actually AT, which is the only honest source for
  // "your track" — a track is recorded per session, and somebody who moved from beginner to
  // intermediate should see the newer one.
  const current = attended.length > 0 ? mine.get(attended[0].id) : undefined;

  // ORGANISERS AND FLOOR MENTORS GET THE DESK, students get the card. Mounting the card
  // auto-joins the floor, so it waits for a definite role — an organiser who flashed
  // through the student view would land in the room's counts as "Just joined".
  const roleKnown = isAdmin !== undefined && floorMentor !== undefined;
  const helper = Boolean(isAdmin || floorMentor);
  const floor =
    live &&
    roleKnown &&
    (helper ? <FloorDesk /> : <FloorCard session={live} uid={uid} name={name} />);

  if (days.length === 0) {
    return (
      floor ?? <p className="measure text-body text-haze">No Build Days have run yet.</p>
    );
  }

  return (
    <>
      {floor && <div className="mb-10">{floor}</div>}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <Stat n={`${attended.length} of ${days.length}`} label="Build Days attended" />
        <Stat n={current ? TRACK_LABEL[current.track] : "—"} label="Your track" />
        <Stat
          n={attended.filter((s) => mine.get(s.id)?.pr_url).length}
          label="Sessions you opened a PR in"
        />
      </div>

      <div className="mt-10 space-y-6">
        <Panel icon="calendar" title="Every Build Day so far">
          <ul className="space-y-2.5">
            {days.map((s) => {
              const row = mine.get(s.id);
              const when = sessionWhen(s.starts_at);
              return (
                <li key={s.id} className="rounded-tile bg-sunk px-4 py-3">
                  <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                    <span className="font-mono text-xs font-medium uppercase tracking-wider text-accent">
                      {when.day}
                    </span>
                    <span className="min-w-0 flex-1 truncate text-sm font-medium text-ink">
                      {s.title}
                    </span>
                    {/* THE ABSENT CASE IS STATED, not left blank. A row with nothing on it
                        reads as a rendering bug; "no record" reads as a fact, and is also
                        the true one — it covers both "you were not there" and "nobody took
                        the roll", which this page cannot tell apart and should not guess
                        between. */}
                    <span
                      className={`shrink-0 font-mono text-label uppercase tracking-wider ${
                        row ? "text-accent" : "text-dust"
                      }`}
                    >
                      {row ? TRACK_LABEL[row.track] : "no record"}
                    </span>
                  </div>

                  {row?.repo && (
                    <Detail label="repo">
                      {row.issue_url ? (
                        <a
                          href={row.issue_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="tap underline transition-colors hover:text-ink"
                        >
                          {row.repo}
                        </a>
                      ) : (
                        row.repo
                      )}
                    </Detail>
                  )}
                  {row?.blocker && <Detail label="stuck on">{row.blocker}</Detail>}
                  {row?.next_step && <Detail label="next">{row.next_step}</Detail>}
                </li>
              );
            })}
          </ul>
        </Panel>

        <p className="measure text-sm leading-relaxed text-dust">
          Organisers fill this in live. Spot a mistake? Tell one.
        </p>
      </div>
    </>
  );
}

export default function BuildDaysSection() {
  return (
    <RequireProfile loading="Loading…">
      {({ user, profile }) => (
        <>
          <SectionHead eyebrow="Your week" title="Build Days.">
            What the club has recorded for you.
          </SectionHead>
          <Record uid={user.uid} name={profile.name} />
        </>
      )}
    </RequireProfile>
  );
}
