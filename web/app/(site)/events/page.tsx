import type { Metadata } from "next";
import Link from "next/link";
import Doodle from "@/components/Doodle";
import Duo from "@/components/Duo";
import Eyebrow from "@/components/Eyebrow";
import NextAction from "@/components/NextAction";
import Glow from "@/components/fx/Glow";
import { DASHBOARD_HREF, JOIN_HREF } from "@/content/site";
import {
  closedExternal,
  internalOfKind,
  openExternal,
  pastInternal,
  type ExternalEvent,
  type InternalEvent,
} from "@/content/events";

// THE EVENTS PAGE. Two halves: what we run, and what is worth entering elsewhere.
//
// WHY BOTH HALVES LIVE ON ONE ROUTE rather than /events and /hackathons. A student
// opening this is asking one question — "is there something I should turn up to or
// sign up for this month" — and the answer crosses the boundary. Splitting it would
// make them ask it twice and give them half an answer each time. The division that
// matters to them is not ours-versus-theirs, it is *can I still enter*, which is why
// closed things sink to the bottom of their section rather than getting a page.
//
// THE HEADINGS NAME WHAT THE BLOCK COSTS, not who runs it. "Walk in" and "Apply" are
// the real difference between the halves, and they are the two words a student is
// scanning for — where the earlier pass ("Ours" / "Somebody else's", under headings
// ending "so we can promise the room" and "we are not the ones enforcing them") spent
// both second clauses on the club's own liability. A heading that is a disclaimer is a
// wasted heading: the caveat is true, it belongs in the standfirst, and it is there.
//
// The club's accuracy about which claims are its own survives in the second section's
// trail — "not ours to move" is the disclaimer earning its place by also being the
// most useful thing a reader can know about an external deadline.
//
// ORDER: internal first. It is the thing a reader can act on this week without an
// application, and it is the only half where turning up is enough.
//
// EVERY LIST RENDERS FROM content/events.ts AND EVERY ONE HAS A HOLDING STATE. The
// file ships empty — the data arrives after this page does — so an empty group has to
// read as "nothing this cycle" rather than as a section that failed to load. Same
// dashed-box pattern as the projects page, for the same reason.

export const metadata: Metadata = {
  title: "Events",
  description:
    "Build days, sessions and hackathons we run — plus outside ones worth entering.",
};

/* ---- One internal event --------------------------------------------------
   A card, not a table row. The fields are mostly optional and a table with four
   empty cells reads as missing data, where a card with three lines reads as a
   short entry. `done` greys it and drops the action: a past event is context, and
   a button on something that already happened is a dead end with a hover state. */
function InternalCard({ e }: { e: InternalEvent }) {
  return (
    <li
      className={`lift flex flex-col rounded-tile border border-seam bg-raise p-7 ${
        e.done ? "opacity-60" : ""
      }`}
    >
      <div className="flex items-baseline justify-between gap-4">
        <h3 className="font-display text-display-md font-bold leading-[1.3] tracking-[-0.02em]">
          {e.name}
        </h3>
        {/* NOT shrink-0, and the projects page learned this the expensive way: a
            long value in a flex row with no min-width forces the row past the
            viewport, and `overflow-x: hidden` on the body hides the evidence. */}
        {e.done && (
          <span className="min-w-0 text-right font-mono text-sm uppercase tracking-[0.16em] text-dust">
            Done
          </span>
        )}
      </div>

      {/* The date is the loudest thing after the name, because it is the only field
          that decides whether the reader can act. Mono and tabular so a column of
          them lines up. */}
      <p className="mt-3 font-mono text-sm tabular-nums text-accent">{e.when}</p>

      {(e.where || e.audience) && (
        <p className="mt-2 text-sm text-dust">
          {[e.where, e.audience].filter(Boolean).join(" · ")}
        </p>
      )}

      {e.what && <p className="measure mt-4 text-body text-haze">{e.what}</p>}

      {/* Each optional row gated on its own data — an empty tag strip under a rule
          reads as a rendering fault. */}
      {e.tags && e.tags.length > 0 && (
        <ul className="mt-5 flex flex-wrap gap-2">
          {e.tags.map((t) => (
            <li
              key={t}
              className="rounded-inline border border-seam bg-sunk px-2.5 py-1 font-mono text-sm text-haze"
            >
              {t}
            </li>
          ))}
        </ul>
      )}

      {e.href && !e.done && (
        <div className="mt-auto pt-6">
          <Link href={e.href} className="link-u text-accent">
            {e.cta ?? "Details"}
          </Link>
        </div>
      )}
    </li>
  );
}

/* ---- One external event --------------------------------------------------
   Wider than the internal card and laid out as a field with a sidebar, because it
   carries something the internal ones do not: an outbound link that IS the point of
   the entry. It gets a real button in its own column rather than a text link at the
   end of a paragraph — a reader scanning six of these is scanning for the way in.

   THE HOST IS NAMED ABOVE THE EVENT, not under it. "Ministry of Education" tells a
   student more about whether to enter than the hackathon's name does, and a page of
   external listings with no visible source is indistinguishable from spam. */
function ExternalCard({ e }: { e: ExternalEvent }) {
  return (
    <li
      className={`lift rounded-panel border border-seam bg-raise p-7 sm:p-9 ${
        e.done ? "opacity-60" : ""
      }`}
    >
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_15rem] lg:gap-12">
        <div>
          <Eyebrow tone={e.done ? "neutral" : "merged"}>
            {e.done ? "Closed" : e.host}
          </Eyebrow>

          {/* break-words, min-w-0: an event name from a data file has no bounded
              length, and a long unbroken one at display size overflows a phone. */}
          <h3 className="mt-3 min-w-0 break-words font-display text-display-md font-bold leading-[1.3] tracking-[-0.02em]">
            {e.name}
          </h3>

          <p className="mt-3 font-mono text-sm tabular-nums text-haze">{e.when}</p>

          {e.what && <p className="measure mt-5 text-body text-haze">{e.what}</p>}

          {e.eligibility && (
            <p className="measure mt-4 flex gap-3 text-body text-ink">
              <Doodle
                kind="sparkle"
                className="mt-1 h-4 w-4 shrink-0 text-accent"
              />
              {e.eligibility}
            </p>
          )}

          {((e.tags && e.tags.length > 0) || e.platform) && (
            <ul className="mt-6 flex flex-wrap gap-2">
              {e.platform && (
                <li className="rounded-inline border border-seam bg-sunk px-2.5 py-1 font-mono text-sm text-haze">
                  {e.platform}
                </li>
              )}
              {(e.tags ?? []).map((t) => (
                <li
                  key={t}
                  className="rounded-inline border border-seam bg-sunk px-2.5 py-1 font-mono text-sm text-haze"
                >
                  {t}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex flex-col gap-3 lg:border-l lg:border-seam lg:pl-10">
          {/* THE DEADLINE IS ABOVE THE BUTTON, not beside the dates. It is the one
              fact that expires, and a reader who has already decided to enter is
              looking at this column and nothing else. */}
          {e.registerBy && (
            <div>
              <p className="label">{e.done ? "Closed" : "Register by"}</p>
              <p className="mt-1.5 font-mono text-sm tabular-nums text-ink">
                {e.registerBy}
              </p>
            </div>
          )}
          {e.prize && (
            <div>
              <p className="label">What you get</p>
              <p className="mt-1.5 text-sm text-ink">{e.prize}</p>
            </div>
          )}
          <a
            href={e.url}
            target="_blank"
            rel="noreferrer"
            className={`btn w-full ${e.done ? "btn-secondary" : "btn-primary"}`}
          >
            {e.done ? "Read about it ↗" : "Open the listing ↗"}
          </a>
        </div>
      </div>
    </li>
  );
}

/* The holding state, shared by every group on the page. One sentence saying the
   section is empty and one saying why that is a choice rather than a failure. */
function Nothing({ title, body }: { title: string; body?: string }) {
  return (
    <div className="mt-9 rounded-tile border border-dashed border-seam px-8 py-14 text-center">
      <p className="text-display-md font-semibold">{title}</p>
      {/* The second line is optional. An empty state that only has to say the
          list is empty says it in the title; a paragraph under it explaining why
          is a paragraph the reader did not ask for. */}
      {body && <p className="measure mx-auto mt-4 text-body text-haze">{body}</p>}
    </div>
  );
}

export default function EventsPage() {
  const buildDays = internalOfKind("build-day");
  const sessions = internalOfKind("session");
  const ourHackathons = internalOfKind("hackathon");
  const past = pastInternal();
  const external = openExternal();
  const closed = closedExternal();

  return (
    <main id="main">
      {/* THE CHIP IS THE h1. The headline and the standfirst under it are gone at
          the client's instruction, and a page with no h1 at all is a regression a
          screen reader hits before anybody else does — there is no other heading
          here above the section h2s. Preflight resets heading size and weight to
          inherit, so `.chip` renders it exactly as it rendered as a span; the div
          wrapper is because a heading inside a <p> is invalid. */}
      <header className="section page-top pb-4" data-reveal-group>
        <div className="flex items-center gap-2">
          <h1 className="chip">What&rsquo;s on</h1>
          <Doodle kind="sparkle" className="h-5 w-5 text-accent" />
        </div>
      </header>

      {/* ---- 1. Ours ------------------------------------------------------
          First, because it is the half a reader can act on this week. The three
          groups are separate headings rather than one merged list: a build day and
          a hackathon ask for completely different amounts of a student's weekend,
          and merging them would hide the cheap one behind the expensive one. */}
      <section
        id="internal"
        className="section relative pt-10 sm:pt-14"
        aria-label="Events the club runs"
        data-reveal-group
      >
        <Glow className="right-0 top-16 h-[20rem] w-[20rem] sm:h-[34rem] sm:w-[34rem]" />

        <div className="border-b border-seam pb-5">
          <p className="label">Walk in</p>
          <Duo
            className="mt-4 max-w-3xl text-display-lg"
            lead="Showing up is the entry process."
            trail="There is no second step."
          />
        </div>

        {/* The standfirst no longer restates "no fee, no selection, no form" — the
            heading above now says that, and this paragraph said it again three lines
            later. What it carries instead is the thing the heading cannot: that the
            room is split by level, which is the actual answer to "am I
            too early for this". */}
        <p className="measure mt-7 text-body-lg text-haze">
          Tables are split by level, from first-time git to real issues, so{" "}
          <span className="mark">turning up early is not turning up unprepared</span>.
        </p>

        {/* ---- Build days --------------------------------------------------- */}
        <div className="mt-12" data-reveal-group>
          <div className="flex items-baseline justify-between gap-4 border-b border-seam pb-4">
            <h2 className="font-display text-display-md font-bold tracking-[-0.02em]">
              Build days
            </h2>
            {buildDays.length > 0 && (
              <p className="font-mono text-sm tabular-nums text-dust">
                {buildDays.length} coming up
              </p>
            )}
          </div>

          {buildDays.length === 0 ? (
            <Nothing
              title="The next date is being confirmed."
              body="It goes up once the room and mentors are booked."
            />
          ) : (
            <ul className="mt-9 grid grid-cols-1 gap-4 lg:grid-cols-2" data-reveal-group>
              {buildDays.map((e) => (
                <InternalCard key={e.id} e={e} />
              ))}
            </ul>
          )}

          {/* The members' copy of this list, which is the live one. Named here
              rather than left implicit: somebody who has already joined and wants
              the next four dates should not have to find out that the dashboard
              has them. */}
          <p className="mt-6 text-sm text-dust">
            Already a member?{" "}
            <Link href={`${DASHBOARD_HREF}/build-days`} className="link-u text-accent">
              Build days
            </Link>{" "}
            has the full schedule and your attendance.
          </p>
        </div>

        {/* ---- Sessions ------------------------------------------------------ */}
        <div className="mt-16" data-reveal-group>
          <div className="flex items-baseline justify-between gap-4 border-b border-seam pb-4">
            <h2 className="font-display text-display-md font-bold tracking-[-0.02em]">
              Guest Sessions and talks
            </h2>
            {sessions.length > 0 && (
              <p className="font-mono text-sm tabular-nums text-dust">
                {sessions.length} coming up
              </p>
            )}
          </div>

          {sessions.length === 0 ? (
            <Nothing
              title="Nothing scheduled this cycle."
              body="Announced a week or two out, here and on the board."
            />
          ) : (
            <ul className="mt-9 grid grid-cols-1 gap-4 lg:grid-cols-2" data-reveal-group>
              {sessions.map((e) => (
                <InternalCard key={e.id} e={e} />
              ))}
            </ul>
          )}
        </div>

        {/* ---- Our own hackathons -------------------------------------------- */}
        <div className="mt-16" data-reveal-group>
          <div className="flex items-baseline justify-between gap-4 border-b border-seam pb-4">
            <h2 className="font-display text-display-md font-bold tracking-[-0.02em]">
              Hackathons we run
            </h2>
            {ourHackathons.length > 0 && (
              <p className="font-mono text-sm tabular-nums text-dust">
                {ourHackathons.length} coming up
              </p>
            )}
          </div>

          {ourHackathons.length === 0 ? (
            <Nothing
              title="None announced right now."
              body="We run one when there's something worth a weekend. Live ones are below."
            />
          ) : (
            <ul className="mt-9 space-y-4" data-reveal-group>
              {ourHackathons.map((e) => (
                <InternalCard key={e.id} e={e} />
              ))}
            </ul>
          )}
        </div>

        {/* ---- What already happened ------------------------------------------
            Only when there is one. A club with a visible past is more convincing
            than one that only ever advertises — but an empty "Already happened"
            heading says the opposite of what it is there for. */}
        {past.length > 0 && (
          <div className="mt-16" data-reveal-group>
            <div className="border-b border-seam pb-4">
              <h2 className="font-display text-display-md font-bold tracking-[-0.02em]">
                Already happened
              </h2>
            </div>
            <ul className="mt-9 grid grid-cols-1 gap-4 lg:grid-cols-2">
              {past.map((e) => (
                <InternalCard key={e.id} e={e} />
              ))}
            </ul>
          </div>
        )}
      </section>

      {/* ---- 2. Everyone else's --------------------------------------------
          A band, so the change of who is responsible is visible before it is read.
          The alternation also matters structurally: the section above is plain and
          NextAction below is a band, so this sits between them correctly. */}
      <section
        id="external"
        className="band section pb-16 pt-16 sm:pb-24 sm:pt-24"
        aria-label="External hackathons and competitions"
        data-reveal-group
      >
        <div className="border-b border-seam pb-5">
          <p className="label">Apply</p>
          <Duo
            className="mt-4 max-w-3xl text-display-lg"
            lead="These take a form, a team, or a month."
            trail="And the deadline is not ours to move."
          />
        </div>

        {external.length === 0 ? (
          <Nothing title="Nothing open at the moment." />
        ) : (
          <ul className="mt-9 space-y-4" data-reveal-group>
            {external.map((e) => (
              <ExternalCard key={e.id} e={e} />
            ))}
          </ul>
        )}

        {closed.length > 0 && (
          <div className="mt-16" data-reveal-group>
            <div className="border-b border-seam pb-4">
              <h2 className="font-display text-display-md font-bold tracking-[-0.02em]">
                Closed for this year
              </h2>
            </div>
            <p className="measure mt-5 text-body text-haze">
              Most run yearly — use these to plan for next year&rsquo;s.
            </p>
            <ul className="mt-9 space-y-4">
              {closed.map((e) => (
                <ExternalCard key={e.id} e={e} />
              ))}
            </ul>
          </div>
        )}
      </section>

      <NextAction
        eyebrow="Before the next one"
        lead="You do not have to wait for a date."
        trail="The first pull request can be tonight."
        body="Join, grab a beginner issue, and arrive at the next build day already mid-conversation."
        href={JOIN_HREF}
        cta="Join the club"
      />
    </main>
  );
}
