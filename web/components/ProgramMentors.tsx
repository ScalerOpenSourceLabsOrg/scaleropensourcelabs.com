// The mentor bench, under the Program track.
//
// WHY THIS IS PEOPLE AND NOT A SENTENCE
// Everything else around it is an argument about process — what week one looks
// like, what you walk away with. This is the one part that is an argument about
// PEOPLE, and it is the club's strongest: a student choosing between this and
// doing GSoC alone is choosing between six named seniors who got in and a Discord
// server. That claim used to live in a subordinate clause at the end of the path's
// walkAway line, where it was worth roughly nothing.
//
// WHY THE CARDS LIE DOWN RATHER THAN STAND UP
// The first version of this block was six portraits in a row, which looked like
// the hall of fame and said the same thing the hall already says — here are six
// faces, count them. Then each mentor got a paragraph on what they actually
// built, and a paragraph is the reason the layout changed: a 180px column cannot
// hold thirty words without setting them eight to a line, and the words are now
// the point. So the portrait turns into a fixed 8.5rem plate on the left and the
// text runs beside it, two cards to a row. The count is still legible — three
// rows of two reads as six — and the sentences are readable, which they were not.
//
// WHY IT SITS INSIDE THE PATH CARD RATHER THAN IN A SECTION OF ITS OWN
// It is an answer to "why this path", and a reader who has scrolled past the
// Program track card has already decided. Below the card is too late. So it goes
// under the path's own two-column grid, full width, with a rule above it and its
// own heading — far enough from the week-one list to read as a separate claim,
// close enough that it is still part of the card's pitch. It is handed to PathCard
// as `children` rather than switched on inside it; see the note there for why a
// `mentors?: true` field on the Path type would be the wrong shape.
//
// IT LIVES ON /join NOW, in the #why-join band, and used to live on /how-to-join.
// The route moved, the placement did not: it is still full width under the one
// path it belongs to.
//
// WHY IT INVENTS NOTHING
// The photograph, the programme, the year, the organisation and the office are
// all read out of the club's own lists by name (see content/lookup.ts, which
// file); the one line of prose per person comes from join.ts, compressed from
// what each mentor supplied about themselves. This component holds no data at
// all. Two consequences worth stating: a mentor's organisation here can never
// disagree with the same person's row on the hall of fame, and a mentor whose
// name does not match those lists renders as a face with a name and no credential
// rather than as a face with a plausible one.
//
// Zero JavaScript of its own. Portrait is a client component for its image
// fallback; this is a server component and stays one.

import Link from "next/link";
import Portrait from "@/components/Portrait";
import { designationFor, newestSelectionFor, photoFor } from "@/content/lookup";
import { PROGRAMME_SHORT } from "@/content/programmes";
import { PROGRAM_TRACK_MENTORS } from "@/content/join";

/* A mentor, assembled from what the rest of the site already knows about them.
   Four lookups, no data: see content/lookup.ts for what each one
   does and what it returns when it finds nothing. */
const BENCH = PROGRAM_TRACK_MENTORS.map((m) => ({
  ...m,
  photo: photoFor(m.name),
  office: designationFor(m.name),
  credential: newestSelectionFor(m.name),
}));

/* The number in the standfirst, counted rather than typed. It is the one that
   carries the argument — six mentors inside one organisation is a study group,
   six inside six is a map of the landscape — and it is exactly the sort of number
   that goes stale the moment a seventh name is added, so it is never written down
   as a word. Empty orgs are dropped for the same reason selectionStats drops
   them: an unrecorded organisation is not one. */
const ORG_COUNT = new Set(
  BENCH.map((m) => m.credential?.org).filter(Boolean),
).size;

export default function ProgramMentors() {
  if (BENCH.length === 0) return null;

  return (
    <section
      aria-label="The mentors on this path"
      className="mt-11 border-t border-seam pt-9 sm:mt-14 sm:pt-11"
    >
      <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-4">
        <div>
          <p className="label">The people you get</p>
          {/* h4 because the path's own name is the h3 on this card. The heading
              level is the card's structure, not a size choice — the size comes
              from the display class beside it. */}
          <h4 className="mt-3.5 max-w-2xl font-display text-display-md font-bold leading-[1.3] tracking-[-0.02em]">
            {BENCH.length} mentors, and every one of them got in.
          </h4>
        </div>
        {ORG_COUNT > 0 && (
          <p className="font-mono text-xs text-dust">
            {ORG_COUNT} organisations, no two the same
          </p>
        )}
      </div>

      <p className="measure mt-4 text-body text-haze">
        Your proposal gets torn apart by someone who wrote a winning one last March.
        And when the build breaks in week three, help is two floors away.
      </p>

      {/* Two to a row at lg and above, one below it. No three-column step: at the
          88rem container three columns leave about 300px a card, of which the
          portrait plate takes 136, and thirty words in the 160px left over is the
          layout this block just moved away from.

          gap-y is much the larger of the two because the cards have no border —
          the only thing separating one row from the next is the air between them,
          whereas the columns already have a portrait plate holding them apart. */}
      <ul
        className="mt-8 grid gap-x-10 gap-y-10 sm:mt-10 lg:grid-cols-2"
        data-reveal-group
      >
        {BENCH.map((m) => (
          <li key={m.name}>
            {/* STACKED ON A PHONE, side by side from sm up. The plate is 96px
                and a phone is 430px, so keeping them side by side left the blurb
                setting at about five words a line in the 180px remainder — a
                paragraph read through a letterbox. Dropping the portrait onto its
                own line above the text gives the sentence the full column and
                costs one 96px band of height per card. */}
            <article className="flex flex-col gap-4 sm:flex-row sm:gap-6">
              {/* The portrait plate. Fixed width rather than a fraction, so every
                  card in the row starts its text on the same vertical line
                  whatever the grid is doing — a percentage would leave the six
                  paragraphs starting at two different x positions per breakpoint.

                  It IS the tile: no border, no panel, as on the hall. This block
                  already sits inside a card, and a card inside a card inside a
                  card is where a page starts looking like a settings screen.
                  `tilt` on the plate only, never on the text beside it — type on a
                  rotated surface loses subpixel antialiasing and goes fuzzy.

                  h-fit matters once the card stacks: without it the plate is a
                  flex item in a column and stretches to the height of the blurb
                  beside it, which turns a 4:5 portrait into a 4:20 one. */}
              <div className="card tilt h-fit w-24 shrink-0 overflow-hidden rounded-panel sm:w-[8.5rem]">
                <Portrait
                  name={m.name}
                  photo={m.photo}
                  className="aspect-[4/5] w-full"
                />
              </div>

              {/* min-w-0 so a long unbroken token in the blurb cannot push the
                  flex item past its track and shove the portrait off the card. */}
              <div className="min-w-0 flex-1">
                <h5 className="font-display text-display-md font-bold leading-[1.25] tracking-[-0.02em]">
                  {m.name}
                </h5>

                {/* ONE META ROW, and everything factual about the person is on it:
                    the programme chip, the organisation that picked them, and the
                    club office where they hold one. Three separate lines was the
                    alternative and it pushed the blurb — the thing the reader is
                    actually here for — below the portrait plate on every card.

                    The chip is straightened (chip-true) because it labels the row
                    rather than being stickered onto it; a tilt next to two lines
                    of mono reads as a misalignment.

                    The office is in the accent and in caps rather than as a third
                    quiet mono item, because it answers a different question from
                    the two beside it: those say what this person pulled off, this
                    says which of them is the one who actually assigns you a
                    mentor. */}
                <p className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2">
                  {m.credential && (
                    <>
                      <span className="chip chip-true">
                        {PROGRAMME_SHORT[m.credential.programme]}{" "}
                        {m.credential.year}
                      </span>
                      {m.credential.org && (
                        <span className="font-mono text-xs text-haze">
                          {m.credential.org}
                        </span>
                      )}
                    </>
                  )}
                  {m.office && (
                    <span className="font-label text-sm font-semibold uppercase leading-[1.2] tracking-[0.07em] text-accent">
                      {m.office}
                    </span>
                  )}
                </p>

                {/* The sentence this whole layout was rearranged for. Rendered
                    only when there is one — a mentor whose line has not been
                    collected yet gets a card with a name, a credential and no
                    filler, which is a visible prompt to go and ask them. */}
                {m.blurb && (
                  <p className="mt-3.5 text-body text-haze">{m.blurb}</p>
                )}
              </div>
            </article>
          </li>
        ))}
      </ul>

      {/* The proof link, out to the roster where the same names sit beside their
          programme and year. Not a second call to action — the path's own "Apply
          on this path" is the action, and this is the thing a sceptical reader
          presses first. */}
      <p className="mt-10">
        <Link
          href="/hall-of-fame"
          className="tap link-u inline-block font-mono text-xs text-accent transition hover:brightness-125"
        >
          Every selection the club has, in one list →
        </Link>
      </p>
    </section>
  );
}
