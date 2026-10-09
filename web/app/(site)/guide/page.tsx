import type { Metadata } from "next";
import Doodle from "@/components/Doodle";
import Duo from "@/components/Duo";
import NextAction from "@/components/NextAction";
import PRTimeline from "@/components/PRTimeline";
import Terminal from "@/components/Terminal";
import { GLOSSARY, MAINTAINERS, MAINTAINERS_SOURCE } from "@/content/essence";
import { JOIN_HREF, LINKS } from "@/content/site";

// THE GUIDE. Everything a first-timer needs explained, for the reader who has
// already decided to care.
//
// It collects the explainers that used to sit in the first screens of other pages:
// the pull-request loop and the real commands (from /how-to-join), and who is on
// the other side of a PR plus the vocabulary (from the home page). All of it is
// good, none of it answers "should I care", which is the only question a stranger
// on the home page is asking. Here it answers "so how does this actually work".
//
// Linked from the home page's open-source explainer and from the footer. Not in the
// nav: it is somewhere a reader is sent, not a choice the bar offers.

export const metadata: Metadata = {
  title: "Guide",
  description:
    "How a pull request gets merged, the commands for your first one, and the jargon, decoded.",
};

export default function Guide() {
  return (
    <main id="main">
      <header className="section page-top pb-4" data-reveal-group>
        <p className="flex items-center gap-2">
          <span className="chip">The guide</span>
          <Doodle kind="squiggle" className="h-5 w-8 text-accent" />
        </p>
        <Duo
          as="h1"
          className="mt-6 max-w-4xl text-display-lg"
          lead="Nobody explains this part."
          trail="So here it is, in one place."
        />
        <p className="measure mt-4 text-body-lg text-haze">
          What happens after you hit submit, the commands, who reads your patch,
          and the words everyone assumes you know.
        </p>
      </header>

      {/* ---- The loop ----------------------------------------------------- */}
      <section
        id="the-loop"
        className="section pt-12 sm:pt-16"
        aria-label="What happens to a pull request"
        data-reveal-group
      >
        <p className="chip">The loop</p>
        <Duo
          className="mt-6 max-w-4xl text-display-lg"
          lead="What happens after you press submit."
          trail="Including the scary step."
        />
        <p className="measure mt-7 text-body-lg text-haze">
          Five steps. One of them is somebody asking for changes, which is{" "}
          <span className="mark">the normal case, not a failure</span>.
        </p>

        {/* Equal columns: the longest command is ~484px of `white-space: pre` that
            must not wrap, so a narrower terminal column clips it. */}
        <div className="mt-10 grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
          <PRTimeline />

          <div>
            <p className="label">And the commands, for real</p>
            <p className="mt-3 text-body text-haze">
              These work on this site&apos;s own repo. Copy away — the prompts stay behind.
            </p>
            <Terminal
              className="mt-6"
              title="your first contribution"
              label="Commands to fork, build and branch the club's website repository"
              lines={[
                { kind: "note", text: "fork it on GitHub first, then:" },
                { kind: "cmd", text: "git clone https://github.com/<you>/scaleropensourcelabs.com.git" },
                { kind: "cmd", text: "cd scaleropensourcelabs.com/web" },
                { kind: "cmd", text: "npm install" },
                { kind: "cmd", text: "npm run dev" },
                { kind: "out", text: "ready on http://localhost:3000" },
                { kind: "note", text: "then, for the change itself:" },
                { kind: "cmd", text: "git checkout -b fix-the-thing" },
                { kind: "cmd", text: "npm run typecheck" },
                { kind: "cmd", text: "git commit -am 'Fix the thing'" },
                { kind: "cmd", text: "git push origin fix-the-thing" },
              ]}
            />
            <div className="mt-5">
              <a
                href={LINKS.contributing}
                target="_blank"
                rel="noreferrer"
                className="tap inline-block font-mono text-xs text-accent transition hover:brightness-125"
              >
                The full CONTRIBUTING.md ↗
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ---- Who is on the other side -------------------------------------
          The counterweight to the career argument on the home page: a reader who
          only ever hears "this is good for your resume" becomes the contributor
          maintainers complain about. */}
      <section
        id="maintainers"
        className="band section pt-12 pb-12 sm:pt-16 sm:pb-16"
        aria-label="Who maintains open source"
        data-reveal-group
      >
        <p className="chip">Who is on the other side</p>
        <Duo
          className="mt-6 max-w-4xl text-display-lg"
          lead="There is a person at the other end of your pull request."
          trail="Usually an unpaid one."
        />
        <p className="measure mt-7 text-body-lg text-haze">
          Knowing this changes how you write a pull request.
        </p>

        <div className="mt-10 grid gap-x-14 gap-y-10 sm:grid-cols-3" data-reveal-group>
          {MAINTAINERS.map((m) => (
            <div key={m.title} className="rise border-t border-seam pt-6">
              <h3 className="text-body-lg font-semibold">{m.title}</h3>
              <p className="mt-3 text-body text-haze">{m.body}</p>
            </div>
          ))}
        </div>

        <div className="mt-8">
          <a
            href={MAINTAINERS_SOURCE.url}
            target="_blank"
            rel="noreferrer"
            className="tap link-u inline-block font-mono text-xs text-accent transition hover:brightness-125"
          >
            {MAINTAINERS_SOURCE.label} ↗
          </a>
        </div>
      </section>

      {/* ---- The vocabulary ------------------------------------------------
          The barrier to a first contribution is very often linguistic: a
          second-year who writes fine Python still stalls at "rebase onto
          upstream/main and squash before we triage". */}
      <section
        id="vocabulary"
        className="section pt-12 sm:pt-16"
        aria-label="The vocabulary of open source"
        data-reveal-group
      >
        <p className="chip">The words</p>
        <Duo
          className="mt-6 max-w-4xl text-display-lg"
          lead="Nobody is going to explain these to you."
          trail="So here they are."
        />
        {/* The count is derived, so a thirteenth term cannot make the prose lie. */}
        <p className="measure mt-7 text-body-lg text-haze">
          {GLOSSARY.length} words used constantly, explained never. We all learned
          them{" "}
          <span className="mark">by being confused in public</span>.
        </p>

        <dl className="mt-10 grid gap-x-14 gap-y-px sm:grid-cols-2 lg:gap-x-20" data-reveal-group>
          {GLOSSARY.map((g) => (
            <div key={g.term} className="rise border-t border-seam py-6">
              <dt className="font-mono text-body-lg text-accent">{g.term}</dt>
              <dd className="mt-2.5 text-body text-haze">{g.meaning}</dd>
            </div>
          ))}
        </dl>
      </section>

      <NextAction
        eyebrow="Now do it with company"
        lead="Reading about it is the slow way."
        trail="A build day is the fast one."
        body="One evening, a senior beside you, and setup sorted before you get stuck."
        href={JOIN_HREF}
        cta="Join the club"
      />
    </main>
  );
}
