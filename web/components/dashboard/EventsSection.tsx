"use client";

// EVERYTHING THE CLUB HAS PUT IN THE DIARY, for a member who is signed in.
//
// THE OVERVIEW'S PANEL ANSWERS "WHAT IS NEXT" AND THIS ANSWERS "WHAT IS ON". NextSessions
// shows three and renders nothing at all when the diary is empty, because the overview is
// a page about the week and a fourth session down is not an answer to that question. The
// member who wants to plan a month had nowhere to go — the sessions existed, in a
// collection, three at a time. This is that page, and the panel now links to it.
//
// LIVE, NOT content/events.ts. The public /events route is a hand-kept content file aimed
// at somebody who has not joined: no auth, no spinner, no empty box mid-query, and
// deliberately no clock (see the header of that file). This reads the `sessions`
// collection an organiser actually schedules against, which is audience-gated — some
// sessions are members-only — so it can only exist behind a sign-in. The two will say the
// same thing about a given build day; they are aimed at different people. The link at the
// bottom is how a member gets to the external half, which lives only in the content file.
//
// PAST SESSIONS ARE KEPT, BELOW, AND DIMMED. "Did I miss it, or was it never on?" is a
// real question a fortnight later, and a page that silently drops what has happened
// answers it with nothing. They are collapsed into a second list rather than mixed in.

import { useEffect, useState } from "react";
import Link from "next/link";
import Icon from "@/components/Icon";
import Panel from "@/components/dashboard/Panel";
import RequireProfile from "@/components/dashboard/RequireProfile";
import SectionHead from "@/components/dashboard/SectionHead";
import { useAuth } from "@/lib/auth";
import { isBuildDay } from "@/lib/buildDays";
import { readSessions, sessionWhen, upcoming, type SessionDoc } from "@/lib/sessions";
import { toDate } from "@/lib/profile";

/** How many of the ones already held to keep on screen. A member checking what they
 *  missed is asking about the last fortnight, not about last term — and the whole list
 *  would eventually bury the half of the page that is still actionable. */
const PAST_SHOWN = 5;

function When({ starts_at }: { starts_at: unknown }) {
  const when = sessionWhen(starts_at);
  const d = toDate(starts_at);
  return (
    <span className="w-16 shrink-0 text-center">
      {/* The weekday earns its line here in a way it does not on the overview: a member
          reading a month of dates plans around "Saturday", not around "18 Oct". */}
      <span className="block font-mono text-label uppercase tracking-wider text-dust">
        {d ? d.toLocaleDateString("en-IN", { weekday: "short" }) : ""}
      </span>
      <span className="block font-mono text-xs font-medium uppercase tracking-wider text-accent">
        {when.day}
      </span>
      <span className="block font-mono text-xs text-dust">{when.time}</span>
    </span>
  );
}

function Event({ s, past }: { s: SessionDoc; past?: boolean }) {
  return (
    <li
      className={
        "flex items-start gap-4 rounded-tile bg-sunk px-4 py-3 " + (past ? "opacity-60" : "")
      }
    >
      <When starts_at={s.starts_at} />
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="text-sm font-semibold text-ink">{s.title}</span>
          {/* A BUILD DAY IS MARKED, because it is the one kind of session where turning up
              is recorded and counts towards the mentor cohort. A member deciding which
              Saturday to protect needs to see the difference from the list. */}
          {isBuildDay(s) && (
            <span className="rounded-full bg-accent-soft px-2 py-0.5 font-mono text-label uppercase tracking-wider text-accent">
              Build Day
            </span>
          )}
          {/* Members-only sessions are marked for the same reason an organiser marks them:
              so a member can tell what the club is saying to everybody from what it is
              saying to them. Absent means everyone — see lib/audience.ts. */}
          {s.audience === "members" && (
            <span className="rounded-full bg-sunk px-2 py-0.5 font-mono text-label uppercase tracking-wider text-dust ring-1 ring-seam">
              Members
            </span>
          )}
        </span>
        <span className="mt-0.5 block text-sm text-haze">
          {[s.speaker, s.location].filter(Boolean).join(" · ") || "Details to come"}
        </span>
        {s.notes && <span className="measure mt-1 block text-sm text-haze">{s.notes}</span>}
      </span>
    </li>
  );
}

function Diary() {
  const { isClubMember } = useAuth();
  const [rows, setRows] = useState<SessionDoc[] | null>(null);
  const [failed, setFailed] = useState(false);

  // WAIT FOR A DEFINITE ANSWER BEFORE ASKING, the same guard NextSessions carries:
  // `isClubMember` is undefined until the profile read returns, and the query built from
  // it decides which audiences this request may even mention. Asking early asks as the
  // wrong person and either misses the members' sessions or is refused outright.
  useEffect(() => {
    if (isClubMember === undefined) return;
    let alive = true;
    void (async () => {
      try {
        const all = await readSessions(isClubMember);
        if (alive) setRows(all);
      } catch (e) {
        // UNLIKE THE OVERVIEW'S PANEL, THIS ONE SAYS SO. There, a failed read costs a
        // card on a page full of other cards and silence is the kind thing; here the
        // diary IS the page, and a member left looking at an empty one would conclude
        // the club has nothing on.
        console.error("[osc] could not read sessions", e);
        if (alive) {
          setFailed(true);
          setRows([]);
        }
      }
    })();
    return () => {
      alive = false;
    };
  }, [isClubMember]);

  const ahead = rows ? upcoming(rows) : [];
  // Newest first: the thing you most likely missed is the thing that happened last.
  const behind = rows
    ? rows.filter((r) => !ahead.includes(r)).reverse().slice(0, PAST_SHOWN)
    : [];

  return (
    <>
      <SectionHead eyebrow="Your week" title="What's on">
        Every session and Build Day on the calendar — some just for members.
      </SectionHead>

      <div className="space-y-6 lg:space-y-8">
        <Panel icon="calendar" title="Coming up">
          {rows === null && (
            <p className="text-body text-haze" aria-busy="true">
              Reading the diary…
            </p>
          )}

          {rows !== null && failed && (
            <p className="measure text-body text-haze">
              Could not load the diary. Reload to try again.
            </p>
          )}

          {rows !== null && !failed && ahead.length === 0 && (
            <p className="measure text-body text-haze">
              Nothing booked yet — keep an eye on the notice board.
            </p>
          )}

          {ahead.length > 0 && (
            <ul className="space-y-2.5">
              {ahead.map((s) => (
                <Event key={s.id} s={s} />
              ))}
            </ul>
          )}
        </Panel>

        {behind.length > 0 && (
          <Panel icon="check" title="Already held">
            <ul className="space-y-2.5">
              {behind.map((s) => (
                <Event key={s.id} s={s} past />
              ))}
            </ul>
            {/* Attendance is the organisers' record, not this list's — a member's own
                Build Day history has a page, and pointing at it beats repeating half of
                it here. */}
            <p className="mt-5 text-sm text-haze">
              Your attendance lives on{" "}
              <Link
                href="/dashboard/build-days"
                className="font-semibold text-accent underline-offset-4 hover:underline"
              >
                Build days
              </Link>
              .
            </p>
          </Panel>
        )}

        {/* THE EXTERNAL HALF IS NOT IN THIS COLLECTION AND MUST NOT BE FAKED INTO IT.
            Hackathons somebody else runs live in content/events.ts, which the public page
            renders; a member who wants the whole calendar needs the link rather than a
            second copy of that file drifting behind a sign-in. */}
        <p className="text-sm text-haze">
          <Link
            href="/events"
            className="inline-flex items-center gap-2 font-semibold text-accent underline-offset-4 hover:underline"
          >
            <Icon name="external" size="1rem" />
            Hackathons and programmes other people run
          </Link>
        </p>
      </div>
    </>
  );
}

export default function EventsSection() {
  // RequireProfile rather than a bare auth check, so the diary is behind the same gate as
  // the rest of the dashboard — somebody mid-onboarding is sent to finish that first.
  return <RequireProfile>{() => <Diary />}</RequireProfile>;
}
