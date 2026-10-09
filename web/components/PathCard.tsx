// One entry path, as a card.
//
// Lifted out of the page that used to hold the only copy of this markup. It is a
// component now for one reason: /join renders it twice in two different registers
// — twice across the top as the two ways in, and once further down wrapped around
// the mentor bench as the case for doing any of this — and a card whose "what week
// one looks like" list is laid out one way in the first place and another way in
// the second is a card a reader has to re-learn halfway down the page.
//
// IT HOLDS NO CONTENT. Every string comes off the Path it is handed, so a path
// edited in content/join.ts is edited everywhere it appears, and a card can never
// describe a path that does not exist.
//
// THE `children` SLOT IS THE WHOLE REASON THIS TAKES CHILDREN RATHER THAN A FLAG.
// Only one path carries a mentor bench, and a `mentors?: true` field on the Path
// type would invite a second path to set it and get the same six faces. The caller
// that knows which path it is rendering passes the bench in; the card just leaves
// room under the grid for whatever it is given. Anything in that slot sits FULL
// WIDTH beneath the two columns rather than inside the right-hand one — in the
// column it would read as a fifth item in a list of process detail, at 60% of the
// card's width, when it is in fact the reason to pick the path at all.
//
// Zero JavaScript. Server component, and it stays one.

import Link from "next/link";
import Doodle from "@/components/Doodle";
import { JOIN_HREF } from "@/content/site";
import type { Path } from "@/content/join";

export default function PathCard({
  path: p,
  step,
  cta = "Start on this path",
  children,
}: {
  path: Path;
  /** The numeral in the corner, already formatted by the caller. Omitted entirely
   *  where the card is not one of a numbered set — a lone "01" says there is an
   *  02 somewhere, and a reader will go looking for it. */
  step?: string;
  /** The card's own action. Defaults to the phrasing the two front-door cards use;
   *  a card standing on its own says something else. */
  cta?: string;
  /** Rendered full width under the grid. See the note above. */
  children?: React.ReactNode;
}) {
  return (
    <article
      id={p.id}
      className="lift rounded-panel border border-seam bg-raise p-7 sm:p-10"
    >
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[20rem_minmax(0,1fr)] lg:gap-14">
        <div>
          {step && (
            <span className="step" aria-hidden>
              {step}
            </span>
          )}
          <h3
            className={`font-display text-display-md font-bold leading-[1.3] tracking-[-0.02em] ${
              step ? "mt-4" : ""
            }`}
          >
            {p.name}
          </h3>
          <p className="mt-3 text-body text-accent">{p.tagline}</p>

          {p.bring && (
            <p className="mt-6 rounded-inline border border-seam bg-sunk px-4 py-3 font-mono text-xs leading-relaxed text-haze">
              Bring: {p.bring}
            </p>
          )}

          {/* Per-path entry into the same door. Not a competing action — it is the
              page's one action, addressed to whichever path the reader has just
              finished reading, and it carries the path with it.

              The `#apply` is load-bearing on /join specifically, where this link
              points back up at a form the reader has already scrolled past: without
              it the query changes, the sign-in card quietly preselects the path, and
              nothing on screen moves. ?path= survives sign-in and is written to the
              profile on the onboarding form — see the note at the head of
              OnboardingGate.tsx. */}
          <div className="mt-6">
            <Link
              href={`${JOIN_HREF}?path=${p.id}#apply`}
              className="tap link-u inline-block font-mono text-xs text-accent transition hover:brightness-125"
            >
              {cta} →
            </Link>
          </div>
        </div>

        <div className="space-y-8">
          <div>
            <p className="label">Who it&apos;s for</p>
            <p className="mt-2.5 text-body text-haze">{p.forWho}</p>
          </div>

          <div>
            <p className="label">What week one looks like</p>
            <ol className="mt-4 space-y-3.5">
              {p.weekOne.map((w, wi) => (
                <li key={wi} className="flex gap-4">
                  <span
                    aria-hidden
                    className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent"
                  />
                  <span className="text-body text-haze">{w}</span>
                </li>
              ))}
            </ol>
          </div>

          <div className="rise border-t border-seam pt-6">
            <p className="label flex items-center gap-2 text-accent">
              What you walk away with
              <Doodle kind="sparkle" className="h-3.5 w-3.5" />
            </p>
            <p className="mt-2.5 text-body-lg text-ink">{p.walkAway}</p>
          </div>

          {/* A quiet aside rather than a highlighted callout — a note is a
              clarification about how the thing runs, not a selling point. */}
          {p.note && (
            <p className="flex gap-3 rounded-inline border border-seam bg-sunk p-5 text-sm leading-relaxed text-haze">
              <span
                aria-hidden
                className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-dust"
              />
              {p.note}
            </p>
          )}
        </div>
      </div>

      {children}
    </article>
  );
}
