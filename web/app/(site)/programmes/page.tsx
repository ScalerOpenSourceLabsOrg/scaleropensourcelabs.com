import type { Metadata } from "next";
import Doodle from "@/components/Doodle";
import Duo from "@/components/Duo";
import NextAction from "@/components/NextAction";
import Note from "@/components/fx/Note";
import { JOIN_HREF } from "@/content/site";
import {
  CALENDAR,
  HACKTOBERFEST_CAVEAT,
  OPEN_ENTRY,
  PAID,
  PROGRAMME_NAME,
  PROGRAMME_SHORT,
  type ProgrammeInfo,
} from "@/content/programmes";
import { achieversFor } from "@/content/people";

// THE PROGRAMMES PAGE. The paid, competitive things a student can be selected
// into, what the club can actually do about it, and when the work has to start.
//
// THE ORDER IS THE ARGUMENT and it is not the obvious one. The obvious order is
// programmes → dates → tracks: here is the prize, here is the deadline, here is
// how to prepare. That puts the deadline before the reader has any idea what they
// would be preparing, which reads as pressure.
//
// So the programmes come first and split by tier — #open-entry ahead of #paid,
// for the reason spelled out over #open-entry — and preparation follows. What
// these are, then where a person like you actually starts, and the dates late
// enough that "applications are decided months before they open" is a useful
// fact rather than a reason to close the tab.
//
// A single undivided listing of all seven programmes used to sit under those two
// tiers, repeating this page's own <h1> as its heading. It is gone; see the note
// where it stood.
//
// The "Pick your path" track cards that closed this page are gone too. They were
// a fourth list of ways in, and the reader could not tell it from the three on
// /join, /events and the home page. /join is the one place that names them now.
//
// The route is /programmes, with /programs redirecting to it. See the note over
// `redirects` in next.config.js.

export const metadata: Metadata = {
  title: "OS Programmes",
  description:
    "GSoC, LFX Mentorship, C4GT and Summer of Bitcoin — what they are, where to start, and when the work that earns a place actually happens.",
};

/* One programme, as a full-width field rather than a card in a grid.

   THE TIER IS STATED IN WORDS as well as carried by the heading colour, which is
   the rule this whole site follows: colour is never the only signal. A reader who
   cannot tell the accent heading from the ink one still reads "Paid · selective"
   or "Open entry" underneath it.

   `ours` is the club own selections into this programme, and it is the difference
   between a list of opportunities and a claim the club can actually support. An
   empty list renders as an honest empty state rather than being hidden. */
function ProgrammeField({ p }: { p: ProgrammeInfo }) {
  const paid = p.tier === "paid";
  const ours = achieversFor(p.key);
  return (
    <li className="list-row bg-raise p-8 sm:p-10">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-14">
        <div>
          {/* The name as type, never the official mark. */}
          {/* Same treatment as every other card heading on this site: the display
              face at font-bold, sentence case, leading-[1.3]. It arrived carrying
              `uppercase leading-none tracking-[-0.005em]`, which are Archivo's
              metrics from the branch this section came from — Archivo ships only
              weight 700, so a bare `font-display` was already bold there. Space
              Grotesk defaults to 400, so the same markup rendered these six
              programme names noticeably lighter than everything around them.

              This one hid from the first sweep because it is a TEMPLATE LITERAL:
              a grep for `className="…font-display…"` only finds double-quoted
              class strings. */}
          <h3
            className={`font-display text-display-md font-bold leading-[1.3] tracking-[-0.02em] ${
              paid ? "text-accent" : "text-ink"
            }`}
          >
            {PROGRAMME_SHORT[p.key]}
          </h3>
          {/* Suppressed when it would only repeat the headline — Hacktoberfest's
              short and full names are the same string. */}
          {PROGRAMME_NAME[p.key] !== PROGRAMME_SHORT[p.key] && (
            <p className="mt-2.5 font-mono text-xs leading-relaxed text-dust">
              {PROGRAMME_NAME[p.key]}
            </p>
          )}

          {/* The tier, stated in words as well as carried by the colour. The
              colour is never the only signal. */}
          <p
            className={`mt-4 inline-block rounded-inline border px-2.5 py-1 font-mono text-sm uppercase tracking-[0.14em] ${
              paid
                ? "border-accent/40 text-accent"
                : "border-seam text-haze"
            }`}
          >
            {paid ? "Paid · selective" : "Unpaid · open entry"}
          </p>

          <div className="mt-5">
            <a
              href={p.url}
              target="_blank"
              rel="noreferrer"
              className="tap block font-mono text-xs text-accent transition hover:brightness-125"
            >
              Official site ↗
            </a>
          </div>
        </div>

        <dl className="grid gap-6 sm:grid-cols-2">
          {(
            [
              ["What it is", p.what],
              ["Who gets in", p.who],
              ["Timeline", p.when],
              [paid ? "What it pays" : "What you get", p.pays],
            ] as const
          ).map(([k, v]) => (
            <div key={k}>
              <dt className="label">{k}</dt>
              <dd className="mt-2 text-sm leading-relaxed text-haze">{v}</dd>
            </div>
          ))}

          {/* Who from the club has actually done this.
              DERIVED from the Hall of Fame's achievers rather than written here, so the
              two pages cannot disagree — see achieversFor() in content/people.ts. When
              nobody has, it says so plainly instead of going quiet: an empty field on
              GSoC reads as an oversight, whereas "nobody yet, and that is the opening"
              is both true and a better argument for applying. */}
          <div className="border-t border-seam pt-5 sm:col-span-2">
            <dt className="label">Who from SST has done it</dt>
            <dd className="mt-2 text-sm leading-relaxed">
              {/* The written answer, for programmes where a count and a standout
                  name say more than a list of selections could — see `ours` in
                  ProgrammeInfo. It sits above the derived names rather than
                  replacing them, so adding a selection later cannot silently drop
                  this line, and this line cannot silently hide a selection. */}
              {p.ours && <p className="text-ink">{p.ours}</p>}
              {ours.length > 0 ? (
                <ul
                  className={`flex flex-wrap gap-x-5 gap-y-2${
                    p.ours ? " mt-2" : ""
                  }`}
                >
                  {ours.map((a) => (
                    <li key={`${a.name}-${a.year}`} className="text-ink">
                      {a.url ? (
                        <a
                          href={a.url}
                          target="_blank"
                          rel="noreferrer"
                          className="underline decoration-seam underline-offset-4 transition-colors hover:text-accent"
                        >
                          {a.name}
                        </a>
                      ) : (
                        a.name
                      )}
                      {/* A literal space, not just the margin. `ml-2` separates them
                          visually but leaves no whitespace in the text, so the
                          accessible name and anything copied out of the page read
                          "Placeholder EightExample Foundation". */}{" "}
                      <span className="font-mono text-xs text-dust">
                        {a.org} · {a.year}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : p.ours ? null : (
                // TIER-AWARE, because one sentence cannot serve both. The first
                // version said "the first person from this college to get in has not
                // been picked" for every programme — which is meaningless for
                // Hacktoberfest, whose own row two lines above says "no selection, no
                // application". Nobody picks you; you turn up. Copy that contradicts
                // the field beside it is worse than no copy.
                <span className="text-haze">
                  {paid
                    ? "Nobody yet. The first spot is up for grabs."
                    : "Nobody yet. No selection — just show up when it opens."}
                </span>
              )}
            </dd>
          </div>

          {/* The actionable one, given its own full-width row because it is the only
              field on this page that tells the reader to do something. */}
          <div className="border-t border-seam pt-5 sm:col-span-2">
            <dt className="label flex items-center gap-2 text-accent">
              Start preparing
              <Doodle kind="arrow" className="h-3.5 w-6" />
            </dt>
            <dd className="mt-2 text-sm leading-relaxed text-ink">
              {p.weDo}
            </dd>
          </div>
        </dl>
      </div>
    </li>
  );
}

export default function Programmes() {
  return (
    <main id="main">
      <header className="section page-top pb-4" data-reveal-group>
        <p className="chip">OS Programmes</p>
        <Duo
          as="h1"
          className="mt-6 max-w-4xl text-display-lg"
          lead="Paid, competitive, and open to beginners."
          trail="Most students never apply because nobody told them these exist."
        />
        {/* COUNTED, not written. This said "Four programmes" and there were six by
            the time anybody read it — the merge added GSSoC and Hacktoberfest to
            PROGRAMMES and nothing connected that array to this sentence. A hardcoded
            count in a standfirst above the list it counts is the most visible way for
            this site to be wrong about itself, and the split is only over the two
            tiers because that distinction is the point of the page.

            The #paid standfirst had the same bug and kept it longer: it opened
            "Five programmes that pay a stipend" over a list of four, because it was
            written when Outreachy was still in the tier. It counts now too. */}
        <p className="measure mt-4 text-body-lg text-haze">
          {OPEN_ENTRY.length} unpaid ones you can start today, {PAID.length} paid ones you get
          picked for. We can&apos;t get you in — but we can make you the contributor
          they pick.
        </p>
      </header>


      {/* ---- Open entry first ------------------------------------------------
          Deliberately ahead of the paid tier, which is the opposite of
          strongest-first. GSoC is the impressive one and it is also eight months of
          preparation away; a first-year who reads it first concludes the page is not
          for them and stops. The two things they can do this month go at the top. */}
      <section
        id="open-entry"
        className="section pt-14 sm:pt-20"
        aria-label="Unpaid programmes"
        data-reveal-group
      >
        <div className="border-b border-seam pb-5">
          <p className="label">Unpaid</p>
          <Duo
            className="mt-4 max-w-3xl text-display-lg"
            lead="No selection, no application."
            trail="You can do these now."
          />
        </div>
        <p className="measure mt-7 text-body-lg text-haze">
          No pay, little resume weight — but the best place to learn fork, branch,
          review, merge with zero stakes.
        </p>

        <ul className="mt-9 space-y-px overflow-hidden rounded-panel bg-seam">
          {OPEN_ENTRY.map((p) => (
            <ProgrammeField key={p.key} p={p} />
          ))}
        </ul>

        {/* The honest caveat, next to the thing it is about rather than in a footnote
            nobody reaches. */}
        <p className="mt-8 flex gap-4 rounded-tile border border-seam bg-sunk p-6 text-body text-haze">
          <span aria-hidden className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-ember" />
          {HACKTOBERFEST_CAVEAT}
        </p>
      </section>


      {/* ---- Paid tier ------------------------------------------------------- */}
      <section
        id="paid"
        /* `relative` for the gutter note below — it anchors to this section, so
           it cannot drift when a section above it changes height. */
        className="band section relative pb-16 pt-16 sm:pb-24 sm:pt-24"
        aria-label="Paid programmes"
        data-reveal-group
      >
        {/* Right gutter. A reader who has just been told these programmes are
            paid files them next to the internships they are already chasing,
            and then assumes the usual shape — a company, a manager, work that
            belongs to somebody else the day you leave.

            SAID AS WHAT THIS IS RATHER THAN AS WHAT IT IS NOT. The earlier
            draft opened "Not an internship", which spends the loudest line on
            the page's margin telling a reader their existing ambition is the
            wrong one. Most students here want an internship and should; the
            distinction worth drawing is that this particular work stays
            theirs afterwards, which is a thing to gain rather than a thing to
            be corrected about.

            It hung off the section below until that section went, and this is
            where it belonged anyway: the sentence is about the PAID tier, and
            it now sits level with the rows it is actually a remark on. top-40
            rather than top-28 for that — this section opens with a heading and
            a standfirst above its rows, one band deeper than the old one. */}
        <Note
          place="gutter"
          tone="warm"
          fold
          title="You keep the work."
          body="No boss, no timesheet. Everything you write stays public, and stays yours."
          tilt={2.5}
          className="-right-40 top-40"
        />
        <div className="border-b border-seam pb-5">
          <p className="label">Paid</p>
          <Duo
            // max-w-4xl, matching every other display-lg Duo on the site, and the
            // step is measured rather than eyeballed. At 3xl this sentence needs
            // three lines, and Duo's `text-balance` then evens them to 470/522/518
            // px inside a 1360px section — so the heading read as hard-broken a
            // third of the way across, which is what balancing a line count one
            // too high always looks like. At 4xl it is two lines, 799/723, and the
            // break lands where the sentence already breaks: between the clauses.
            className="mt-4 max-w-4xl text-display-lg"
            lead="Somebody else runs the selection."
            trail="Which is exactly why it counts."
          />
        </div>
        <p className="measure mt-7 text-body-lg text-haze">
          {PAID.length} programmes that pay students a stipend. No degree, CGPA or referral
          needed — just a few months of public contributions before the window opens.
        </p>

        <ul className="mt-9 space-y-px overflow-hidden rounded-panel bg-seam">
          {PAID.map((p) => (
            <ProgrammeField key={p.key} p={p} />
          ))}
        </ul>
      </section>

        {/* A third listing of PROGRAMMES stood here — chip "The programmes", and
            under it every programme's what/who/when/pays/weDo in its own rows.
            Three problems, all of them structural rather than cosmetic.

            Its heading was the page's <h1> repeated WORD FOR WORD — "Paid,
            competitive, and open to beginners. Most students never apply because
            nobody told them these exist." A reader who scrolled past the masthead
            met the same sentence again and had to decide whether they had lost
            their place.

            Its rows carried the same five fields ProgrammeField already renders
            for #open-entry and #paid, from the same content/programmes.ts entries — so
            every paid programme appeared twice on one page, the second time with
            less detail: no "who from the club has done it", no "start preparing".
            The shorter copy of a thing always looks like the authoritative one
            because it is the one that fits on a screen.

            And it flattened the tier split. #open-entry and #paid exist to say
            "these two you can start today, these five you get selected into",
            which is the argument of the page; a single undivided list of all
            seven says the opposite immediately underneath.

            The gutter note it carried moved up into #paid, where its sentence was
            always pointed. */}

        {/* ---- Calendar -----------------------------------------------------
            The only honest urgency device the club owns. The argument is
            arithmetic, not a countdown: organisations select contributors who
            already have months of commits in their repo, so "next year" is a
            skipped cycle rather than a delay. No exact dates — they move annually
            and a stale date costs more than it buys on a page claiming accuracy. */}
        {/* NOT a `band` any more, and that is a consequence of the move rather
            than a taste change. This section now sits directly under #paid, which
            is itself banded — two adjacent bands paint one continuous full-bleed
            tint, so the boundary between "here are the paid programmes" and "here
            is when they are decided" would disappear exactly where the page
            changes subject. Plain, it reads as its own section again. */}
        <section
          id="calendar"
          className="section relative pt-10 sm:pt-14"
          data-reveal-group
        >
          {/* Left gutter, beside the argument it compresses. The proverb is the
              whole section in two lines, and it is deliberately undated: every
              other timing claim on this page avoids naming a month for the same
              reason the table does, and a note that says "start in October" is
              wrong for eleven months of the year.

              KEPT SHORT, which is a constraint the gutter imposes rather than a
              style. A note is 160px wide and hangs 16px inside a container whose
              padding is the only thing between it and the text; every line it
              gains grows it downward past the eyebrow and alongside the heading,
              where that 16px is all the clearance there is. Four lines is the
              working limit.

              top-28, beside the heading, which is where a gutter note belongs.
              It spent a while at top-80 for one reason only: a flow note used to
              sit in the opposite margin at the top of this band, and two notes
              at one height read as a symmetrical ornament flanking the heading
              rather than as two separate remarks (see the vertical spacing note
              in Note.tsx). That note is gone, so the constraint is gone with it
              and this one is the only decoration in the section. */}
          <Note
            place="gutter"
            fixing="pin"
            paper="ruled"
            title="Best day: last autumn."
            body="Second best: today. Those are the two options."
            tilt={-2.5}
            className="-left-40 top-28"
          />
          {/* The void to the right of this heading is deliberately empty. It held
              a flow note ("No exact dates.") that said in two lines what the
              section header above already says in a sentence and the table below
              says in a column — the one decoration on the page that annotated
              nothing. Left clear, the heading and the table read as one block.

              If a note ever goes back here: the band is 288px tall with 405px of
              clear width at 1024, 1280 and 1800 alike, the heading's longest line
              ends at 789px from the container's left edge, and the gutter note
              above has to move back down out of its level. */}
          <p className="chip">The reverse clock</p>
          <Duo
            className="mt-4 max-w-4xl text-display-lg"
            lead="Applications are decided months before they open."
            trail="Which is why starting now is the whole trick."
          />
          <p className="measure mt-4 text-body-lg text-haze">
            Orgs pick people they already recognise — usually ones committing since
            autumn. Wait a year and you lose the whole cycle.
          </p>

          <div className="mt-8 overflow-x-auto">
            <table className="w-full min-w-[52rem] border-collapse text-sm">
              <thead>
                <tr className="border-b border-seam">
                  {["Window", "Programme", "Opens", "Start prepping", "What you do first"].map((h) => (
                    <th key={h} scope="col" className="px-3 py-3 text-left font-mono text-sm font-medium uppercase tracking-[0.14em] text-dust">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {CALENDAR.map((r) => (
                  <tr key={r.programme} className="row-live border-b border-seam/60 align-top last:border-0">
                    <td className="px-3 py-5 font-mono text-xs text-accent">{r.window}</td>
                    <td className="px-3 py-5 font-medium text-ink">{r.programme}</td>
                    <td className="px-3 py-5 text-haze">{r.opens}</td>
                    <td className="px-3 py-5 font-mono text-xs text-ember">{r.prepFrom}</td>
                    <td className="max-w-sm px-3 py-5 text-haze">{r.doingNow}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

      <NextAction
        eyebrow="Start now"
        lead="The applications open in spring."
        trail="The work that wins them starts in autumn."
        body="Come to a session, pick something small in a repo you like, and be a name maintainers know by spring."
        href={JOIN_HREF}
        cta="Join the club"
      />
    </main>
  );
}
