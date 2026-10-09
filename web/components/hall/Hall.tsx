// The hall: every student who was selected, as a grid of cards.
//
// This replaced a WebGL solar system in which each selection was an orbiting
// planet and a rocket flew past them on scroll. The 3D is gone at the client's
// instruction, and the honest accounting is that it cost about a thousand lines,
// a 15,000px section, a three.js dependency, and a scroll mechanic that could
// only ever be verified by rendering it — to say one thing: these people got in.
//
// It went through a one-per-row feature layout in between, which was a mistake worth
// recording: at 440px a portrait plus its text filled a viewport, so seeing fourteen
// people meant scrolling fourteen screens. That buries the very argument the count
// is making. A grid says "these are all of them" at a glance.
//
// Still ZERO JavaScript — no state, no scroll listener, no canvas — so this stays a
// server component and the whole section is HTML and CSS.
//
// There are deliberately no 01/02/03 markers. Order carries no meaning in a list
// of people — numbering them would imply a ranking that does not exist, which is
// the exact thing the client removed the leaderboard to avoid.

// ONE WALL, THREE YEARS, IN ORDER. 2025 with the single GSoC selection the club
// started from, then 2026 across GSoC, LFX and Summer of Bitcoin, then 2027 — which
// holds no people at all, only the open slot.
//
// The split is not filing. Flattened into one grid, that 2025 name reads as the
// sixteenth person picked this year — wrong, and a smaller claim than the truth,
// because what the two real cohorts say together is one → sixteen in a year. A
// reader can only see that if the years are separate enough to compare.
//
// Oldest first, so the wall is read in the direction the growth happened: one name,
// then sixteen, then a year with nobody in it yet and a way in. The page still opens
// with the total above all three, which is what a reader who only reads one line
// gets. The order of the real cohorts is enforced in the data (selectionsByYear
// sorts ascending), not by the order content/selections.ts happens to write them in.
//
// 2027 is appended after them rather than sorted among them — it holds no entries,
// so it is not in that data at all — and it lands where the sequence would have put
// it anyway. The comment over that section says why it is last on its own terms.

// THE CARD HEADINGS ARE h3 AND WERE h2, and the reason is not inside this file.
//
// The hall is its own route: its section heading IS the page title and is an h1, so
// while the wall was a single grid the cards sat directly under it and h2 was
// correct. Each cohort now has its own h2 — the year — and a card under a year
// heading has to be one level below it, or a screen reader hears sixteen headings
// at the same rank as the cohort they belong to.
//
// The inverse of this was caught once already, by the heading-order check in
// scripts/qa.mjs, which is the only thing on this project that would have. Nothing
// renders differently — these carry their own size and weight and never relied on
// the tag.
//
// If the cohort split is ever collapsed back to one grid, these go back to h2.

import Link from "next/link";
import Portrait from "@/components/Portrait";
import {
  type Programme,
  PROGRAMME_COLOUR,
  PROGRAMME_SHORT,
} from "@/content/programmes";
import {
  type Selection,
  selectionsByYear,
  selectionStats,
} from "@/content/selections";
import { PROJECTS } from "@/content/showcase";

/** A cohort's credential mix, one pill per programme.
 *
 *  The programme colour stays on the TEXT rather than becoming the fill: the five
 *  programme colours were each validated against the page ground, and re-hosting
 *  them as fills would need five new pairs proved instead.
 *
 *  --raise, NOT --sunk, and the difference is 0.25 of a contrast point. The first
 *  version used the recessed fill, which is #F5F6F8 in light — barely darker than
 *  the page, and enough to drop C4GT's teal from 4.65:1 to 4.37:1 and fail the
 *  sweep at every light breakpoint. These colours have no margin to give away, so a
 *  tag built from them has to sit on the LIGHTEST surface available, not a tinted
 *  one. Anything that darkens --raise in light theme has to re-check this. */
function ProgrammeTags({
  programmes,
}: {
  programmes: { programme: Programme; count: number }[];
}) {
  return (
    <ul className="flex flex-wrap items-center gap-2">
      {programmes.map(({ programme, count }) => (
        <li
          key={programme}
          className="flex items-center gap-1.5 rounded-full border border-edge bg-raise px-3 py-1.5 font-mono text-xs"
        >
          <span
            className="font-medium"
            style={{ color: PROGRAMME_COLOUR[programme] }}
          >
            {PROGRAMME_SHORT[programme]}
          </span>
          <span className="text-dust">×{count}</span>
        </li>
      ))}
    </ul>
  );
}

/** One person, one selection.
 *
 *  Lifted out of the map when the wall split into cohorts: two grids rendering the
 *  same card from two copies of ninety lines of JSX is how the 2025 row quietly
 *  stops matching the 2026 one six months from now. */
function SelectionCard({
  person: p,
  work,
  priority,
}: {
  person: Selection;
  work?: (typeof PROJECTS)[number];
  priority: boolean;
}) {
  return (
    // data-achiever marks a real person's card. The "Open spot" tile is an <li> in
    // a grid of exactly this shape and legitimately has no portrait, so a
    // cross-engine check asserting "every card carries a portrait" needs to tell the
    // two apart by something other than copy text — and still does now that the two
    // usually sit in different sections. Same convention as data-reveal-group: a
    // hook, not a style.
    <li className="flex" data-achiever>
      {/* Full-height flex column so the action row can be pinned to the
          bottom. Grid already stretches the cells to equal height, which made
          the card BOTTOMS align and hid the real problem: with sentences of
          realistic length the "See the work" links floated at a 77px spread
          across a row of three. The placeholder data all being the same
          length made it measure as perfectly aligned. */}
      <article className="group flex w-full flex-col">
        {/* The portrait frame IS this card's tile — the entry has no other
            chrome — so it takes the border and the lift. card-still is not
            used here: this is the outermost interactive surface, not a
            panel nested inside one.

            `relative` for the tooltip below; `tilt` for the 3D rotation on
            hover, which is applied HERE rather than on the <article> so the
            name and programme underneath stay on a flat plane. Text on a
            rotated surface loses subpixel antialiasing and goes visibly
            fuzzy, which is a poor trade for a caption. */}
        <div className="card tilt relative [container-type:inline-size] overflow-hidden rounded-panel">
          <Portrait
            name={p.name}
            photo={p.photo}
            priority={priority}
            className="aspect-[4/5] w-full"
          />

          {/* The hover detail.
              The brief asks for "their top merged pull request". Exactly one
              person in this list has one recorded — the OWASP/OpenCRE entry
              in PROJECTS, with figures read from the GitHub API — and the
              others have a name, a programme and a year. Inventing a PR for
              them would put a fabricated contribution record on a real
              student's photograph, which is the one thing on this page that
              could actually cost somebody something if a maintainer went
              looking.

              So the tooltip shows the real work where it exists and the real
              credential where it does not. Both are worth surfacing; only
              one of them is a pull request. */}
          <span aria-hidden className="card-tip">
            {work ? (
              <>
                <span className="text-[#4ADE80]">✓ {work.tag?.label}</span>{" "}
                <span className="text-[#94A3B8]">in</span>{" "}
                <span className="text-[#60A5FA]">{work.repo}</span>
              </>
            ) : (
              <>
                <span className="text-[#A78BFA]">
                  {PROGRAMME_SHORT[p.programme]} {p.year}
                </span>{" "}
                <span className="text-[#94A3B8]">
                  · {p.studyYear ?? "selected"}
                </span>
              </>
            )}
          </span>
        </div>

        {/* Programme and year as a chip: it is the credential, so it should
            read as a badge rather than a caption. Violet and untilted, not
            the electric-blue sticker the section eyebrows wear — this one is a fact
            about a person rather than a label the site applied to itself,
            and against a photograph's straight edge a tilt would read as a
            misalignment rather than as a sticker.

            IT STILL CARRIES THE YEAR, even though the cohort heading above the
            grid now states it. The card is the unit that gets screenshotted,
            linked and read out of order — a scroll that lands halfway down the
            2026 grid never passed the heading — and "GSoC 2026" is one credential
            in the form a reader already recognises. Dropping the year to avoid
            repeating the heading would save four characters and cost the card the
            ability to stand on its own.

            THE ORG SITS ON THIS ROW, beside the programme, because it is half
            of the same fact — "GSoC 2026" says which programme, the org says
            who inside it actually picked them, and the two read as one
            credential. It was briefly on the mono line below the name, next to
            the year of study, which put the organisation in with the small
            subordinate facts and left the credential looking finished without
            it.

            It is NOT a second .chip. That class is 14px bold uppercase with
            0.1em tracking; a second one of those at this width competes with
            the violet badge for the same job and the pair reads as two
            credentials rather than one. Mono and quiet is the same treatment
            the repo names on the projects page get — a machine-ish fact
            attached to a human one.

            ALWAYS RENDERED, even when the org is unknown, which is a change
            from "a missing org renders as nothing". Every card in the 2025
            cohort is missing it, so rendering nothing meant the wall never
            answered the question a reader asks straight after the programme.
            The slot holds its place and says it is empty.

            It says "org TBA" rather than naming a plausible foundation, and it
            wears a dashed keyline so it cannot be misread as an org called
            that. The rule in content/selections.ts is unchanged: a missing org
            as a wrong one. A slot that admits it is empty is not a claim. Fill
            `org` in content/selections.ts's cohort tuples and the placeholder is
            person, with no edit here.

            "org TBA" AND NOT "org to be announced", which is the phrase this
            started as, and the reason is measured rather than stylistic. The
            space left beside the violet chip is 188px at the 4-column top end
            but only 92px at 1024 and 107px at 820 — the spelt-out phrase is
            178px and wrapped to its own line at every width below the widest,
            turning a 27px row into 59px and leaving the pill orphaned under
            the badge it was meant to sit beside. "org TBA" is 77px and fits
            everywhere. Anything longer than about 90px will wrap again.

            A long REAL org — "The Linux Foundation" measures 186px — will
            wrap here too, and that is the acceptable half of the trade: by
            then the row is carrying a fact worth a second line, not a note
            saying there is nothing to show. */}
        <p className="mt-5 flex flex-wrap items-center gap-x-2.5 gap-y-2">
          <span className="chip chip-true">
            {PROGRAMME_SHORT[p.programme]} {p.year}
          </span>
          {p.org ? (
            <span className="font-mono text-xs text-haze">{p.org}</span>
          ) : (
            <span className="rounded-full border border-dashed border-seam px-2 py-0.5 font-mono text-xs text-dust">
              org TBA
            </span>
          )}
        </p>

        {/* Reserves two lines, so a long name cannot push everything below
            it down in that one card.
            Sentence case rather than capitals now, and here the reason is
            arithmetic as much as tone: at xl the grid is five columns of
            roughly 220px, and Plus Jakarta Sans sets "PRATEEK SINGH" in
            caps at about 243px. Every name of that length or more would
            have taken both reserved lines, and a longer one a third. */}
        {/* min-h is in `lh` units, so the two reserved lines grow with the
            leading on their own — the reservation stays exactly two lines of
            this heading whatever the number below is. That is the reason for
            the unit, and it is why loosening the leading here needed no second
            edit to keep the card bottoms aligned. */}
        <h3 className="mt-3.5 min-h-[2lh] font-display text-display-md font-bold leading-[1.3] tracking-[-0.02em]">
          {p.name}
        </h3>

        {/* Year of study alone on the mono line. The organisation used to
            share it — it has moved up beside the programme chip, where it
            belongs, and this line is left holding the one fact that really is
            subordinate to the name. */}
        {p.studyYear && (
          <p className="mt-2 font-mono text-xs text-dust">{p.studyYear}</p>
        )}

        {p.work && <p className="mt-3 text-body text-haze">{p.work}</p>}

        {/* mt-auto: the actions sit on the card's baseline, so a row of them
            reads as one line regardless of how long each sentence runs.

            Rendered only when there is something in it. An entry awaiting its
            proof link has neither, and an empty flex row still contributes its
            pt-5 — which reads as an unexplained gap under every card in the
            cohort rather than as nothing. */}
        {(p.url || p.github) && (
          <div className="mt-auto flex flex-wrap items-center gap-x-5 gap-y-2 pt-5">
            {p.url && (
              <a
                href={p.url}
                target="_blank"
                rel="noreferrer"
                className="tap inline-block font-label text-sm font-semibold uppercase tracking-[0.04em] text-accent hover:brightness-110"
              >
                See the work →
              </a>
            )}
            {p.github && (
              <a
                href={`https://github.com/${p.github}`}
                target="_blank"
                rel="noreferrer"
                className="tap inline-block font-mono text-xs text-haze hover:text-accent"
              >
                @{p.github}
              </a>
            )}
          </div>
        )}
      </article>
    </li>
  );
}

/** The cohort nobody has been picked for yet — the year the open slot belongs to.
 *
 *  A LITERAL, EDITED ONCE A YEAR, and that is deliberate over the two clever
 *  alternatives. Deriving it as "newest cohort + 1" looks self-maintaining and is
 *  wrong the first afternoon somebody lands a single 2027 selection: the invitation
 *  would jump to 2028 while 2027 applications are still open. Leaving it out and
 *  putting the card at the end of the newest grid is where it started, and that is
 *  what this change moved it away from.
 *
 *  If real 2027 rows arrive, the section below does not duplicate the heading — the
 *  card joins that cohort's grid instead, and this constant moves on to 2028 when
 *  somebody decides the year is closed. */
const NEXT_COHORT = "2027";

/** THE OPEN SLOT: the one card on this wall that is an invitation rather than
 *  evidence.
 *
 *  Every other card is a record of something that already happened, which makes a
 *  cohort grid readable as a closed set — this is who got picked, done. This card
 *  says the list is still being written.
 *
 *  It lives in the 2027 section now, and that is the point of giving it a year of
 *  its own rather than parking it at the end of 2026. In the 2026 grid it was a
 *  seventeenth tile in a row of people who have already been selected, which quietly
 *  made it one of them; under its own heading it is the cohort that has not been
 *  picked yet, and the reader is being invited into a year rather than onto a wall.
 *
 *  So it is the only card in yellow. #FFD600 is the page's primary-action colour —
 *  the apply button wears it, the marker badges wear it, nothing else does — and
 *  spending it once at the foot of a wall of photographs is what makes it read as a
 *  call to act rather than as another person.
 *
 *  It is not a Selection and never was: no programme, no org, no proof link. Every
 *  count on this page — the total, each cohort header — is derived from real
 *  entries, so nothing here has to know to skip it.
 *
 *  The whole card is one <a> to /join rather than a card with a link inside it:
 *  there is no second thing to click, and a 265px yellow tile that does nothing when
 *  pressed is worse than no tile. That is also why the action row is a <span> — an
 *  <a> inside an <a> is invalid and browsers recover from it by splitting the outer
 *  link. */
function OpenSlot() {
  return (
    <li className="flex">
      <Link href="/join" className="group flex w-full flex-col">
        {/* Same frame as a portrait — the `card` border, the `tilt` hover, the
            4/5 aspect and the panel radius — so the slot sits in the grid rhythm
            instead of beside it. Only the fill changes.

            bg-pop as a utility works here because `.card` deliberately sets no
            background (see globals.css); a `background` on that class would
            silently beat this, which is the trap the class comment names.

            The ring, not a border utility: `.card`'s `border` shorthand is emitted
            after Tailwind's utilities and would win, so the keyline that separates
            a bright yellow field from a pale page has to come from a property the
            card does not own. Same trick Portrait uses on its monogram field. */}
        <div className="card tilt relative flex aspect-[4/5] w-full items-center justify-center overflow-hidden rounded-panel bg-pop ring-1 ring-inset ring-black/10">
          {/* The dashed inset says "empty slot" in the one visual language every
              reader already knows, and it is what stops a plain yellow rectangle
              reading as an image that failed to load. */}
          <span
            aria-hidden
            className="absolute inset-3 rounded-tile border-2 border-dashed border-black/25"
          />
          {/* A plus at the same scale as Portrait's monogram, in the same
              container-query unit, so the glyph in this cell is the same size as
              the initials in the cell beside it at every column width. Black at
              full strength rather than the monogram's 45%: on #FFD600 that is the
              14.9:1 pair the palette reserves for this fill. */}
          <span
            aria-hidden
            className="relative select-none font-display font-extrabold leading-none text-black"
            style={{ fontSize: "clamp(2.5rem, 26cqw, 7rem)" }}
          >
            +
          </span>
        </div>

        {/* Occupies the credential chip's slot, in yellow rather than violet —
            the violet chips are facts about a person and this is not one. */}
        <p className="mt-5">
          <span className="chip chip-pop chip-true">Open spot</span>
        </p>

        {/* min-h-[2lh] like every other heading in this grid, so this card's
            bottom edge lines up with the rest of its row rather than sitting a
            line high because the phrase is short. */}
        <h3 className="mt-3.5 min-h-[2lh] font-display text-display-md font-bold leading-[1.3] tracking-[-0.02em] text-ink">
          Next could be you!
        </h3>

        {/* Sits in the "3rd year · org" slot the other cards use, so the column
            of small mono lines stays unbroken. Deliberately NOT "no experience
            needed" — the sticky CTA at the foot of the page already says exactly
            that, and a card repeating the bar two inches above it reads as a
            template filling itself in. */}
        <p className="mt-2 font-mono text-xs text-dust">
          applications open
        </p>

        <p className="mt-3 text-body text-haze">
          This wall isn&apos;t finished. Every name here began with a first try.
        </p>

        <div className="mt-auto flex flex-wrap items-center gap-x-5 gap-y-2 pt-5">
          <span className="tap inline-block font-label text-sm font-semibold uppercase tracking-[0.04em] text-accent group-hover:brightness-110">
            Apply now →
          </span>
        </div>
      </Link>
    </li>
  );
}

export default function Hall() {
  const cohorts = selectionsByYear();
  const stats = selectionStats();
  // Indexed by member name so a card can find its own recorded work in one
  // lookup rather than scanning PROJECTS per person inside the map below.
  const workByMember = new Map(
    PROJECTS.filter((p) => p.published).map((p) => [p.member, p]),
  );

  if (cohorts.length === 0) {
    return (
      <div className="mt-8 rounded-tile border border-dashed border-seam px-8 py-8">
        <p className="text-display-md font-semibold">No selections published yet.</p>
        <p className="measure mt-4 text-body text-haze">
          Every entry needs the person&apos;s permission, the selecting organisation,
          and public proof.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* The count is the argument the section makes, so it leads. Derived from the
          list rather than typed, so the headline can never drift from the entries
          below it. */}
      {/* The number is the whole argument, so it is now sized like one: its own
          clamp up to 4.5rem rather than the shared display-lg step, which topped
          out at 2.75rem and let a two-digit figure sit at the same weight as the
          sentence explaining it. 800 is the ceiling of Plus Jakarta Sans — a
          `font-black` here would ask for a 900 the family does not ship and get
          either a synthetic smear or the same 800 back, so it is stated honestly.

          Baseline-aligned rather than centred: the figure and the clause are one
          sentence, and a 72px numeral vertically centred against 20px text reads
          as two unrelated elements sharing a row.

          THE PROGRAMME TAGS USED TO SIT ON THIS ROW and have moved down into the
          cohort headers. Held here they were the mix across every year at once,
          which is a figure nobody asked for — "GSoC ×15" is two cohorts added
          together — and keeping them here AND per cohort put the same pills on the
          screen twice within 200px. Per year they answer the question the heading
          raises. The TOTAL stays, because the total across both years is the one
          number that really is about the wall rather than about a cohort. */}
      <div className="mt-7 border-t border-seam pt-6">
        <p className="flex items-baseline gap-3">
          <span className="font-display text-display-xl font-bold leading-[0.85] tracking-[-0.04em]">
            {stats.total}
          </span>
          <span className="text-body-lg text-haze">
            {stats.people === stats.total
              ? "selected into international programmes"
              : `selections into international programmes, across ${stats.people} people`}
          </span>
        </p>
      </div>

      {cohorts.map((cohort, ci) => (
        <section
          key={cohort.year}
          aria-labelledby={`cohort-${cohort.year}`}
          className={ci === 0 ? "mt-10 sm:mt-12" : "mt-16 sm:mt-24"}
        >
          {/* The cohort header. The year is the heading and it is set as a numeral
              at display weight, because on this page a year IS a claim — "2026"
              over sixteen faces and "2025" over one states the club's growth
              without a single adjective.

              The count and the mix sit on the same baseline as the year rather than
              under it, so the whole header reads as one line: year, how many, which
              programmes. It wraps to two rows below about 640px, where the grid is
              one column anyway.

              A HAIRLINE above each cohort rather than a band or a tinted strip:
              this page already carries a glow, a sticker, a gutter note and a wall
              of photographs, and a heavier divider between the grids would read as
              two sections of the page rather than two years of one list. The gap
              above does the separating — see the section margins. */}
          <div className="flex flex-wrap items-end gap-x-5 gap-y-3 border-t border-seam pt-6">
            <h2
              id={`cohort-${cohort.year}`}
              className="font-display text-display-lg font-bold leading-[0.9] tracking-[-0.03em]"
            >
              {cohort.year}
            </h2>
            <p className="text-body-lg text-haze">
              {cohort.people.length}{" "}
              {cohort.people.length === 1 ? "selection" : "selections"}
            </p>
            <ProgrammeTags programmes={cohort.programmes} />
          </div>

          {/* A grid, so every achiever is on screen at once.
              The one-per-row feature layout showed one person per viewport — fourteen
              screens to see fourteen people, which buries the argument the count is
              making. A grid says "these are all of them" in a glance, which is the
              whole point of the section.

              Chrome-less cards, taken from apple.com/store: their product cards
              measure transparent background, no border, no radius — the image IS the
              card, and the surrounding box is what makes a grid look templated. So the
              portrait carries the tile radius and the text sits beneath it in open
              space rather than inside a panel.

              Hover lifts the card on their measured curve — transform 0.3s
              cubic-bezier(0, 0, 0.5, 1) — and only at the pointer, never on touch.

              FOUR across at the top end, per the client, down from five. The row is
              the unit of reading here and four is the count that still divides cleanly
              into the list while giving each card room: at the 76rem container, four
              columns is roughly 265px a card against five columns' 208px, which is the
              difference between a two-word name setting on one line at display-md and
              setting on two. There is no xl step any more — lg is the top of the
              ladder, so the grid stops widening once the cards are comfortable rather
              than adding a column the moment the window allows one.
              The ladder below it steps one column at a time — a two-column jump halves
              the card width in a single breakpoint and the text visibly reflows as the
              window resizes. Mobile stays at one, unchanged: two 155px cards side by
              side is where the name and the work sentence stop being readable at all.

              THE SAME LADDER IN BOTH COHORTS, including the one with a single name in
              it. Giving a one-card grid its own narrower column would put the 2025
              portrait at a different size from every card above it, and on this page
              card size is not styling — a smaller face reads as a smaller selection.
              One card in a four-column grid simply leaves three columns empty, which
              is what one selection in a year actually looked like. */}
          <ul
            className="mt-8 grid gap-x-7 gap-y-12 sm:mt-12 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
            data-reveal-group
          >
            {cohort.people.map((p, i) => (
              <SelectionCard
                key={`${p.name}-${p.programme}-${p.year}`}
                person={p}
                work={workByMember.get(p.name)}
                // Only the first row of the FIRST cohort on the page is anywhere
                // near the fold, so only those three portraits are worth preloading.
                // Priority on the first three of every cohort hands Next.js a second
                // set of high-priority images for a grid a full scroll further down,
                // which competes with the ones actually on screen.
                //
                // `ci === 0` is the topmost cohort whichever way the years are
                // sorted, so this needed no edit when the wall flipped to oldest
                // first — it just means fewer preloads now, because the cohort at the
                // top is the one with a single name in it.
                priority={ci === 0 && i < 3}
              />
            ))}

            {/* The open slot used to close this grid unconditionally. It has its
                own cohort section below now — it only appears HERE if the open
                year has picked up real entries, in which case that year is a
                cohort like any other and the invitation belongs at the end of
                it rather than under a second heading with the same number. */}
            {cohort.year === NEXT_COHORT && <OpenSlot />}
          </ul>
        </section>
      ))}

      {/* 2027 — THE COHORT THAT HAS NOT BEEN PICKED YET.
          One heading, one card, three empty columns.

          It is appended after the sorted cohorts rather than sorted among them,
          because it holds no entries and so is not in that data at all. With the
          wall running oldest first that puts it exactly where the sequence wants
          it — 2025, 2026, 2027 — and the argument for last no longer has to fight
          the order: one name, then sixteen, then the year the reader could be in.
          It would still belong here if the years ran the other way. An empty grid
          at the top of the page opens the strongest thing the club can say with a
          blank space where the evidence goes.

          The empty columns are the copy. A single card in a four-column grid is
          what an unfilled cohort looks like, and nothing has to say so.

          Rendered only when that year has no real entries — otherwise it is a
          cohort in the list above and prints its own heading there, with the card
          at the end of its grid. Two <h2>2027</h2>s on one page is the failure this
          guard exists to prevent. */}
      {!cohorts.some((c) => c.year === NEXT_COHORT) && (
        <section
          aria-labelledby={`cohort-${NEXT_COHORT}`}
          className="mt-16 sm:mt-24"
        >
          <div className="flex flex-wrap items-end gap-x-5 gap-y-3 border-t border-seam pt-6">
            <h2
              id={`cohort-${NEXT_COHORT}`}
              className="font-display text-display-lg font-bold leading-[0.9] tracking-[-0.03em]"
            >
              {NEXT_COHORT}
            </h2>
            {/* Where every other cohort header states a count and its programme
                mix, this one states that there is nothing to count yet. It does
                NOT say "0 selections": a zero next to a year reads as a failed
                year rather than an open one, and this is the only cohort on the
                page a reader can still get into. */}
            <p className="text-body-lg text-haze">
              still being picked — this is the one you can be in
            </p>
          </div>

          {/* The same grid ladder as every cohort above, so the card is the same
              size as the sixteen faces it follows. A lone tile given its own
              wider column would read as a banner, and the whole argument of this
              card is that it is one of the cards. */}
          <ul
            className="mt-8 grid gap-x-7 gap-y-12 sm:mt-12 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
            data-reveal-group
          >
            <OpenSlot />
          </ul>
        </section>
      )}

      {/* The decorative green wall ("close your eyes 70%") used to close the
          grids. Texture, not evidence, on the page that is all evidence — cut
          with the rest of the stickers. ContribWall.tsx is unmounted. */}
    </>
  );
}
