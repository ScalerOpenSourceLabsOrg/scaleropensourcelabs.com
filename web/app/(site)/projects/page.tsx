import type { Metadata } from "next";
import Link from "next/link";
import Doodle from "@/components/Doodle";
import Duo from "@/components/Duo";
import Eyebrow from "@/components/Eyebrow";
import LangDot from "@/components/LangDot";
import NextAction from "@/components/NextAction";
import { JOIN_HREF } from "@/content/site";
import { publishedProjects } from "@/content/projects";

// THE PROJECTS PAGE. Where the club's code actually went.
//
// This is the page a maintainer or a sceptical student lands on, and it is the one
// with the least room for adjectives: every card here terminates in a link to a
// merged pull request or a public repository. `published` gates each entry, so an
// unverifiable claim cannot reach the grid even by accident — see the note at the
// head of content/projects.ts.

export const metadata: Metadata = {
  title: "Projects",
  description:
    "The club's own repositories, each with issues sized for a first pull request.",
};

export default function Projects() {
  // ONE list, from content/projects.ts, where `published` gates each entry. Build
  // days and club repositories used to be two sections; the note at the head of
  // projects.ts says why they are not any more. No totals are read here: the page
  // counts what it shows. projectTotals() still exists for the NumbersStrip, which
  // is now the one place the upstream figures are quoted.
  const projects = publishedProjects();

  return (
    <main id="main">
      {/* Every route opens with a title block, which the single-page site did not
          need — there, the hero was the title and everything under it was one
          continuous argument. A route has to say where you are within a screen of
          arriving, and `.page-top` is what clears the floating nav. Do not add a
          pt-* utility beside it; see the note over `.page-top` in globals.css. */}
      <header className="section page-top pb-4" data-reveal-group>
        {/* The header used to read "Where our code went. Every line links
            upstream" over a page that lists the club's OWN repos — the upstream
            sections it described were removed (see the note further down). It
            now says what the page actually is. Selections and their merged PRs
            are on /hall-of-fame. */}
        <p className="chip">Club projects</p>
        <Duo
          as="h1"
          className="mt-6 max-w-4xl text-display-lg"
          lead="Start on one of these."
          trail="The reviewer is down the corridor."
        />
        <p className="measure mt-4 text-body-lg text-haze">
          Club repos with issues sized for your very first PR. Work in other
          people&apos;s projects lives in the{" "}
          <Link href="/hall-of-fame" className="link-u text-accent">
            hall of fame
          </Link>
          .
        </p>
      </header>


      {/* ---- Everything of ours, in one list ------------------------------- */}
      <section
        id="build-days"
        className="section pt-14 sm:pt-20"
        aria-label="Build day projects and club repositories"
        data-reveal-group
      >
        <div className="flex flex-wrap items-end justify-between gap-6 border-b border-seam pb-5">
          <div>
            <p className="label">Running now</p>
            <Duo
              className="mt-4 text-display-lg"
              lead="Build day projects."
              trail="Turn up and pick one."
            />
          </div>
          {projects.length > 0 && (
            <p className="font-mono text-sm tabular-nums text-dust">
              {projects.length} project{projects.length === 1 ? "" : "s"}
            </p>
          )}
        </div>

        <p className="measure mt-7 text-body-lg text-haze">
          What people are building on build days, plus the repos we keep running
          between them &mdash; this site included.
        </p>

        {projects.length === 0 ? (
          <div className="mt-9 rounded-tile border border-dashed border-seam px-8 py-14 text-center">
            <p className="text-display-md font-semibold">
              Nothing listed for this cycle yet.
            </p>
            <p className="measure mx-auto mt-4 text-body text-haze">
              Cards go up once there are real beginner issues waiting.
            </p>
          </div>
        ) : (
          <ul className="mt-9 grid grid-cols-1 gap-4 lg:grid-cols-2" data-reveal-group>
            {projects.map((p) => (
              <li
                key={p.name}
                className="lift flex flex-col rounded-tile border border-seam bg-raise p-7"
              >
                {/* One word, not a section. A reader deciding where to spend a
                    Saturday still wants to know which of these will exist in March
                    — it just never needed its own heading and its own paragraph to
                    say so. */}
                {p.clubMaintained && (
                  <div className="mb-3">
                    <Eyebrow tone="merged">Club maintained</Eyebrow>
                  </div>
                )}

                <div className="flex items-baseline justify-between gap-4">
                  {/* `min-w-0 break-all` IS LORE, NOT TIDINESS. A repo name like
                      "scaleropensourcelabs.com" is one unbreakable token and it
                      overflowed the viewport at 390px — measured at 375px inside a
                      390px viewport, taking the document to 420px. `break-words`
                      does not help: it only breaks BETWEEN words, and a domain name
                      has no space to break at. `min-w-0` is what lets the flex item
                      shrink below its content width, which it will not do by
                      default. It stayed invisible for a while because
                      `body { overflow-x: hidden }` clips the strip rather than
                      showing a scrollbar, and the smoke test measures at desktop
                      width; the QA sweep at 390px is what caught it. */}
                  <h3 className="min-w-0 break-all font-display text-display-md font-bold leading-[1.3] tracking-[-0.02em]">
                    {p.repo ? (
                      <a
                        href={p.repo}
                        target="_blank"
                        rel="noreferrer"
                        className="tap group inline transition-colors duration-300 ease-glide hover:text-accent"
                      >
                        {p.name}
                        <span
                          aria-hidden
                          className="ml-2 inline-block text-dust transition-transform duration-300 ease-glide group-hover:translate-x-1"
                        >
                          &#8599;
                        </span>
                      </a>
                    ) : (
                      p.name
                    )}
                  </h3>
                  {/* NOT shrink-0. It was, and a long value forced this flex row
                      wider than the phone viewport. shrink-0 is only safe on text
                      whose length is bounded, and content from a data file never is. */}
                  {p.size && (
                    <span className="min-w-0 text-right font-mono text-sm uppercase tracking-[0.16em] text-dust">
                      {p.size}
                    </span>
                  )}
                </div>

                {p.problem && (
                  <p className="mt-4 text-body text-ink">{p.problem}</p>
                )}

                {p.whyStartHere && (
                  <p className="mt-4 flex gap-3 text-body text-ink">
                    <Doodle
                      kind="sparkle"
                      className="mt-1 h-4 w-4 shrink-0 text-accent"
                    />
                    {p.whyStartHere}
                  </p>
                )}

                {/* Each optional row is gated on its own data. A holding card with
                    no maintainer and no stack should be a title and nothing else —
                    an empty label under a rule reads as a rendering bug. */}
                {p.stack.length > 0 && (
                  <ul className="mt-5 flex flex-wrap gap-2">
                    {p.stack.map((s) => (
                      <li
                        key={s}
                        className="rounded-inline border border-seam bg-sunk px-2.5 py-1 font-mono text-sm text-haze"
                      >
                        <LangDot name={s} />
                      </li>
                    ))}
                  </ul>
                )}

                {(p.maintainer || p.goodFirstIssue || p.contributing) && (
                  <div className="mt-auto border-t border-seam pt-5">
                    <dl className="grid gap-4 sm:grid-cols-2">
                      {/* A club repo has no one name to print here, and an empty
                          "Maintainer" label is worse than none. */}
                      {p.maintainer && (
                        <div>
                          <dt className="label">Maintainer</dt>
                          <dd className="mt-1.5 text-sm text-ink">
                            {p.maintainerGithub ? (
                              <a
                                href={`https://github.com/${p.maintainerGithub}`}
                                target="_blank"
                                rel="noreferrer"
                                className="tap transition-colors hover:text-accent"
                              >
                                {p.maintainer} &#8599;
                              </a>
                            ) : (
                              p.maintainer
                            )}
                          </dd>
                        </div>
                      )}
                      <div>
                        <dt className="label">Start here</dt>
                        <dd className="mt-1.5 text-sm">
                          {p.goodFirstIssue ? (
                            <a
                              href={p.goodFirstIssue}
                              target="_blank"
                              rel="noreferrer"
                              className="tap font-mono text-xs text-accent transition hover:brightness-125"
                            >
                              Good first issue &#8599;
                            </a>
                          ) : (
                            <span className="font-mono text-xs text-dust">
                              Ask on the day
                            </span>
                          )}
                        </dd>
                      </div>
                    </dl>

                    {p.contributing && (
                      <div className="mt-4">
                        <a
                          href={p.contributing}
                          target="_blank"
                          rel="noreferrer"
                          className="tap inline-block font-mono text-xs text-haze transition-colors hover:text-accent"
                        >
                          Read CONTRIBUTING.md &#8599;
                        </a>
                      </div>
                    )}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Two upstream sections used to sit here — "In the wild" and a second
          "Upstream work / Where our code went" — each with its own ProofPanel
          over the same OWASP/OpenCRE numbers. Both are gone. The per-contribution
          evidence now lives on the hall, and publishedUpstream() still feeds the
          NumbersStrip, so nothing on the site stops linking to the merged PRs. */}

      <NextAction
        eyebrow="Your turn"
        lead="Want your name in this list?"
        trail="It starts with one small pull request."
        body="Bring a laptop and a GitHub account. You don't need to be good yet."
        href={JOIN_HREF}
        cta="Join the club"
      />
    </main>
  );
}
