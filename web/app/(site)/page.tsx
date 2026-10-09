import Link from "next/link";
import Hero from "@/components/hero/Hero";
import Doodle from "@/components/Doodle";
import LangDot from "@/components/LangDot";
import Duo from "@/components/Duo";
import CommitGraph from "@/components/CommitGraph";
import MemberStory from "@/components/MemberStory";
import MediaSplit from "@/components/MediaSplit";
import MergePlayground from "@/components/MergePlayground";
import CommunityBanner from "@/components/CommunityBanner";
import { Fold, FoldGroup } from "@/components/Fold";
import { PODIUM, WHY_IT_MATTERS } from "@/content/positioning";
import { EVERYDAY, WHAT_IT_IS } from "@/content/essence";

// THE ESSENCE PAGE. What the club is, whether you should care, and one way in.
//
// Fully static. No database, no auth, no API routes on this route — it is HTML and
// a handful of client components, so it renders identically anywhere and there is
// nothing to attack. The one place the site talks to a server is /join.
//
// Everything after the hero is deliberately quiet. The hero only reads as premium
// if what follows it is disciplined; a second spectacle cancels the first.
//
// THE ORDER IS THE FIRST THIRTY SECONDS. A reader who has just arrived is asking
// "what is this and should I care", so the page answers that first — what the club
// is, why it matters, people who did it, what it runs — and only then explains open
// source itself, for the reader who is now interested enough to want it. The
// explainer used to open the page, ahead of any of that, which spent the reader's
// first half-minute on Linux and VS Code before saying what the club was.
//
// WHAT LEFT, and where it went:
//
//   who maintains open source,
//     the vocabulary           → /guide, with the PR loop and the commands
//   the CP / AI-ML / OSC table → one line in #thesis (the table stays in
//                                content/positioning.ts, unmounted)
//   "Beyond the stipend" and
//     "Why it matters"         → merged into one list in #thesis; they were the
//                                same argument made twice
//   the hall, projects, programmes, team, events → their own routes

export default function Home() {
  return (
    <>
      <Hero />

      <main id="main">
        {/* Every section folds, one open at a time — see components/Fold.tsx. The
            thesis is open on arrival so the page opens on what the club is. The
            community banner stays out: it is the way in, not a section to read. */}
        <FoldGroup allOpen>
        {/* ---- 1. What this is, and why it matters ------------------------- */}
        <Fold
          id="thesis"
          className="section py-20 sm:py-28"
          label="What this club is"
          head={
            <>
              <p className="flex items-center gap-2">
                <span className="chip">What this is</span>
                <Doodle kind="squiggle" className="h-5 w-8 text-accent" />
              </p>
              <Duo
                className="mt-6 max-w-4xl text-display-lg"
                lead="A club is easy to start."
                trail="Getting a stranger to merge your code is not."
              />
            </>
          }
        >
          <div className="measure mt-7 space-y-5 text-body-lg text-haze">
            <p>
              Most student clubs count attendance. We count pull requests a stranger
              chose to merge.
            </p>
            <p>
              Nobody reads your college projects. They read your commits — the one
              part of your CV a stranger has{" "}
              <span className="mark">already checked for you</span>.
            </p>
          </div>

          <div className="mt-10 grid gap-x-14 gap-y-10 sm:grid-cols-2" data-reveal-group>
            {WHY_IT_MATTERS.map((w) => (
              <div key={w.title} className="rise border-t border-seam pt-6">
                <h3 className="text-body-lg font-semibold">{w.title}</h3>
                <p className="mt-3 text-body text-haze">{w.body}</p>
              </div>
            ))}
          </div>

          {/* What the six-row comparison table came down to. One sentence, still
              sourced, and no longer a column-by-column case against two other
              clubs on the same campus. */}
          <p className="measure mt-12 border-l-2 border-accent pl-6 text-body-lg text-ink">
            {PODIUM.line}{" "}
            <a
              href={PODIUM.source.url}
              target="_blank"
              rel="noreferrer"
              className="tap font-mono text-xs text-accent link-u hover:brightness-125"
            >
              {PODIUM.source.label} ↗
            </a>
          </p>
        </Fold>

        {/* ---- 1b. Press the button -------------------------------------------
            Bands alternate down the page (try-it, what-we-run) so each section
            has its own ground; two adjacent bands merge into one slab.
            A pull request the reader is allowed to merge. Not folded: it is the
            one thing on the page you do rather than read. See MergePlayground. */}
        <section
          id="try-it"
          className="band section py-20 sm:py-28"
          aria-label="Open and merge a pull request"
          data-reveal-group
        >
          <div className="mx-auto max-w-3xl">
            <p className="chip">try it</p>
            <Duo
              className="mt-5 text-display-lg"
              lead="Go on, press the green button."
              trail="Everyone remembers their first one."
            />
          </div>
          <div className="mt-9">
            <MergePlayground />
          </div>
        </section>

        {/* ---- 2. Members, first person ----------------------------------------
            The heading deliberately does not count them. The rail renders whatever
            has consent, so "six people" would be a claim that goes stale the first
            time somebody adds or pulls a story. */}
        <Fold
          id="story"
          className="section py-20 sm:py-28"
          label="Member stories"
          head={
            <>
              <p className="chip">In their words</p>
              <Duo
                className="mt-6 max-w-4xl text-display-lg"
                lead="Their words, not ours."
                trail="Including the parts where it was confusing."
              />
            </>
          }
        >
          <MemberStory />
        </Fold>

        {/* ---- 3. What the club actually runs ---------------------------------
            The same four names /join uses, so a reader meets one vocabulary. */}
        <MediaSplit />

        {/* ---- 4. What open source actually is ---------------------------------
            Last of the sections, not first: it is for the reader who is already
            interested and wants the ground under it. Opening with the reader's own
            laptop rather than a definition — "the editor you have open on the
            other monitor is one of these, here is its source" does the convincing
            before the definition arrives. */}
        <Fold
          id="what-it-is"
          className="section py-20 sm:py-28"
          label="What open source is"
          head={
            <>
              <p className="flex items-center gap-2">
                <span className="chip">New to open source?</span>
                <Doodle kind="squiggle" className="h-5 w-8 text-accent" />
              </p>
              <Duo
                className="mt-6 max-w-4xl text-display-lg"
                lead="You have been using it all day."
                trail="Nobody told you that you could change it."
              />
            </>
          }
        >
          <p className="measure mt-7 text-body-lg text-haze">
            Software written in public, for everyone. These four run half the planet,
            and you can read every line right now.
          </p>

          {/* A group of its own so the four tiles deal themselves out rather than
              arriving as one slab. */}
          <ul className="mt-10 grid gap-4 sm:grid-cols-2" data-reveal-group>
            {EVERYDAY.map((e) => (
              <li
                key={e.name}
                // .lift and not .card: these tiles carry `border-seam`, and .card
                // would silently beat that utility with its own --edge border.
                className="lift flex flex-col rounded-tile border border-seam bg-raise p-7"
              >
                <div className="flex items-baseline justify-between gap-4">
                  <h3 className="font-display text-display-md font-bold leading-[1.3] tracking-[-0.02em]">
                    {e.name}
                  </h3>
                  {/* min-w-0, not shrink-0: text from a data file is a viewport
                      overflow waiting for a longer value. */}
                  {/* GitHub's language dots, as on a repo card. */}
                  <span className="flex min-w-0 flex-wrap justify-end gap-x-3 font-mono text-sm text-haze">
                    {e.language.split(",").map((l) => (
                      <LangDot key={l} name={l.trim()} />
                    ))}
                  </span>
                </div>
                <p className="mt-4 text-body text-haze">{e.what}</p>
                <p className="mt-4 text-body text-ink">{e.fact}</p>
                {/* Spacing on the wrapper: `.tap` owns the link's margin and
                    padding. See the note on .tap in globals.css. */}
                <div className="mt-auto pt-6">
                <a
                  href={e.repo}
                  target="_blank"
                  rel="noreferrer"
                  className="tap group inline-flex items-baseline gap-2 font-mono text-xs text-accent transition hover:brightness-125"
                >
                  Read the source
                  <span
                    aria-hidden
                    className="transition-transform duration-300 ease-glide group-hover:translate-x-1"
                  >
                    ↗
                  </span>
                </a>
                </div>
              </li>
            ))}
          </ul>

          {/* The definition, arriving after the examples have done the work. */}
          <div className="mt-14 grid gap-x-14 gap-y-9 sm:grid-cols-3" data-reveal-group>
            {WHAT_IT_IS.map((w) => (
              <div key={w.title} className="rise border-t border-seam pt-6">
                <h3 className="text-body-lg font-semibold">{w.title}</h3>
                <p className="mt-3 text-body text-haze">{w.body}</p>
              </div>
            ))}
          </div>

          {/* And the mechanic, drawn. This is the one idea that is genuinely hard to
              say in a sentence, which is the test for whether a diagram earns space. */}
          <div className="lift mt-14 rounded-panel border border-seam bg-raise p-8 sm:p-12">
            <p className="label">How a change actually gets in</p>
            <Duo
              className="mt-5 max-w-2xl text-display-md"
              lead="You do not edit the project."
              trail="You propose a change to it."
            />
            <CommitGraph className="mt-9" />
          </div>

          {/* The rest of the explainer — who reviews your PR, the words nobody
              explains, the commands — lives on /guide. */}
          <p className="mt-10">
            <Link
              href="/guide"
              className="tap link-u inline-block font-mono text-xs text-accent transition hover:brightness-125"
            >
              Who reviews your PR, the jargon, and the commands to make one tonight →
            </Link>
          </p>
        </Fold>
        </FoldGroup>

        {/* ---- The community banner -----------------------------------------
            The way in, under everything. It is the second of only two places the
            join CTA appears outside the form itself — the hero and here — because
            a page that repeats its own call to action every screen reads as
            nagging rather than confident. */}
        <CommunityBanner />
      </main>
    </>
  );
}
