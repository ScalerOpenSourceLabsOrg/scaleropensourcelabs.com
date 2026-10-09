// The footer, on every page.
//
// It carries the two audiences that have no page of their own — faculty and
// sponsors, and maintainers — for the reason given over INSTITUTIONAL in site.ts:
// every route is addressed to a student deciding whether to join, and a
// "for sponsors" band inserted into one of them would compete with that page's
// single next action. Chrome is the right place for an audience that is not the
// page's audience.
//
// It deliberately does NOT repeat the Join button. The nav carries that action at
// every scroll position on every route, so a copy down here would be the third
// thing on screen saying the same word — and the one a reader has already learned
// to skip. Each page's own closing action sits above this.
//
// The page list is derived from PAGES, so a route cannot appear in the nav and be
// missing here.
//
// IT IS AN INVERTED SURFACE — dark on a light page, light on a dark one. Done by
// dropping `.inverse` on the element, which redefines the tokens for the subtree
// rather than setting colours on the children, so everything inside flips
// including the accent and the Console below inherits the flip for free. See the
// block in globals.css for why the accent has to flip too.
//
// THE SECTION THAT USED TO BE #institutional IS NOW THIS. On the single-page site
// the three institutional statements were a card two thirds of the way down, and
// the footer beneath it was a wordmark and a URL. Folding one into the other is
// what the multi-page structure asks for: the statements have to reach a reader
// who lands on /projects from a maintainer's link and never sees the home page,
// and chrome is the only thing that reaches everyone. No content was dropped in
// the merge — the three statements, the email CTA, the page list and the
// trademark note are all still here, laid out as four columns instead of a card.
//
// THE THREE STATEMENTS HAVE SINCE GONE. "What we produce / How we run / What we
// need" restated the home page on every route, under every page's own closing
// action, so a reader who reached the bottom of anything met the club's pitch a
// second time. INSTITUTIONAL stays in site.ts, unmounted; the email link is what a
// faculty member or sponsor actually needs from here, and it stays.

import Link from "next/link";
import Console from "@/components/fx/Console";
import Logo from "@/components/Logo";
import { DASHBOARD_HREF, JOIN_HREF, LINKS, PAGES } from "@/content/site";

export default function Footer() {
  return (
    <footer className="inverse mt-16 sm:mt-20">
      <div className="section pb-16 pt-14">
        {/* THE FOOTER ANIMATES TOO, and until this it was the only large surface on
            the site that did not. That was not a decision — Reveal.tsx observes
            `main > section, header.section` plus anything carrying
            data-reveal-group, and a footer is none of those, so four columns and
            eight links simply appeared. The stagger groups here are the whole fix:
            they are read from the document rather than from main, so marking the
            containers is all it takes. The columns come up in reading order, then
            the route list under them. */}
        <div
          className="grid gap-x-10 gap-y-12 md:grid-cols-2 lg:grid-cols-[1.35fr_1fr_1fr_1fr]"
          data-reveal-group
        >
          {/* The identity column: the full lockup, tagline and all — the one place
              with room for it. */}
          <div>
            <p className="text-ink">
              <Logo size="lg" tagline />
            </p>
            <p className="mt-6 max-w-[22rem] text-body text-ink/85">
              A student-run open source club at Scaler School of Technology.
            </p>

            <ul className="mt-7 space-y-1">
              <li>
                <a
                  href={LINKS.repo}
                  target="_blank"
                  rel="noreferrer"
                  className="tap link-u inline-block font-mono text-label uppercase transition-colors hover:text-accent"
                >
                  This site&apos;s source ↗
                </a>
              </li>
              <li>
                <a
                  href={LINKS.github}
                  target="_blank"
                  rel="noreferrer"
                  className="tap link-u inline-block font-mono text-label uppercase transition-colors hover:text-accent"
                >
                  GitHub ↗
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${LINKS.email}`}
                  className="tap link-u inline-block font-mono text-label uppercase transition-colors hover:text-accent"
                >
                  Email the organisers
                </a>
              </li>
              <li>
                <a
                  href={LINKS.issues}
                  target="_blank"
                  rel="noreferrer"
                  className="tap link-u inline-block font-mono text-label uppercase transition-colors hover:text-accent"
                >
                  Good first issues ↗
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Every route, as one mono row, so it reads as wayfinding rather than as a
            fifth content column. /join is here where it is absent from the nav strip —
            the nav has its button, and this list is the one place that should be able to
            reach the whole site.

            AND SIGN IN IS HERE FOR THE OPPOSITE REASON: the nav only offers it above
            640px, so on a phone this row is where a returning member finds the door.
            Both sit at the end rather than among the pages, because neither is one —
            and side by side they read as the pair they are: ask to join, or come back
            in. */}
        <nav aria-label="All pages" className="mt-12 border-t border-seam pt-7">
          <ul className="flex flex-wrap gap-x-7 gap-y-1" data-reveal-group>
            {/* Home leads the row, and it is written out here because PAGES no longer
                carries it: the bar drops it in favour of the wordmark, which the footer
                does not have. This row is the site's index, so the route it indexes
                first is the one at the root. */}
            <li>
              <Link
                href="/"
                className="tap link-u inline-block font-mono text-label uppercase text-haze transition-colors hover:text-ink"
              >
                Home
              </Link>
            </li>
            {PAGES.map((p) => (
              <li key={p.href}>
                <Link
                  href={p.href}
                  className="tap link-u inline-block font-mono text-label uppercase text-haze transition-colors hover:text-ink"
                >
                  {p.label}
                </Link>
              </li>
            ))}
            {/* Not in the nav: /guide is somewhere a reader is sent from the home
                page's explainer, not a choice the bar offers. The index lists it. */}
            <li>
              <Link
                href="/guide"
                className="tap link-u inline-block font-mono text-label uppercase text-haze transition-colors hover:text-ink"
              >
                Guide
              </Link>
            </li>
            {/* `link-u` like every entry above it. Without it this was the one item
                in the row that did not underline on hover, which reads as the one item
                that is not a link. */}
            <li>
              <Link
                href={JOIN_HREF}
                className="tap link-u inline-block font-mono text-label uppercase text-haze transition-colors hover:text-ink"
              >
                Join
              </Link>
            </li>
            {/* NOT CONDITIONAL ON A SESSION, unlike the nav's. Reading the auth state
                here would make a server component a client one for the sake of one word,
                and it costs nothing to leave in place: a member who presses it lands on
                the dashboard they were already entitled to, which is exactly where the
                label said it would take them. */}
            <li>
              <Link
                href={DASHBOARD_HREF}
                className="tap link-u inline-block font-mono text-label uppercase text-haze transition-colors hover:text-ink"
              >
                Sign in
              </Link>
            </li>
          </ul>
        </nav>

        <div className="mt-10 flex flex-wrap items-baseline justify-between gap-4">
          <p className="max-w-[34rem] text-sm leading-relaxed text-haze">
            This site is open source too. Spot a bug? Send a pull request.
          </p>
          <p className="font-mono text-label uppercase text-haze">
            scaleropensourcelabs.com
          </p>
        </div>

        {/* Programme and organisation names appear throughout as plain type, never as
            logos. Stated once, site-wide, rather than repeated per section. */}
        <p className="mt-8 max-w-[60rem] font-mono text-sm leading-relaxed text-dust">
          Names are trademarks of their owners. Listing them isn&apos;t an endorsement.
        </p>

        {/* The easter egg, at the very bottom, as a reward for getting there. */}
        <Console />
      </div>
    </footer>
  );
}
