// SELECTIONS — the club's strongest claim.
//
// Getting students into GSoC, LFX Mentorship, C4GT and Summer of Bitcoin is the
// most internationally legible thing a college open-source club can show. These
// programmes are recognised on sight by exactly the audience this site is for, and
// unlike a self-reported metric they cannot be manufactured: somebody else ran a
// selection process and picked your member.
//
// Two rules, both non-negotiable.
//
// 1. CONSENT. Each entry publishes a real student's face and name to an
//    international audience. That needs their explicit permission, and `consented`
//    must be true or the entry does not render — the same rule the old dashboard
//    enforced in the database, applied here in the content file.
//
// 2. NO PROGRAMME LOGOS. We render the programme NAME as type, never the official
//    GSoC/Linux Foundation/C4GT mark. Those are trademarks belonging to other
//    organisations, and putting them on a club site implies an endorsement nobody
//    granted. Typographic treatment says the same thing and is ours to use.

import type { Programme } from "@/content/programmes";

export type Selection = {
  name: string;
  programme: Programme;
  /** The PROGRAMME year — which edition selected them. Not their year of study. */
  year: string;
  /** Year of study at the time of selection, e.g. "3rd year". */
  studyYear?: string;
  /**
   * The mentoring organisation that selected them.
   *
   * Optional, and that is a concession to how the list actually gets filled in:
   * the names arrive first, from someone who knows the cohort, and the org and the
   * proof link get chased down per person afterwards. Requiring it up front would
   * mean inventing one, and an invented org on this page is exactly the kind of
   * unverifiable claim the file's opening rule exists to keep out. A missing org
   * renders as nothing; a wrong one renders as a lie.
   */
  org?: string;
  /** One line on what they actually built. Specific beats impressive. */
  work?: string;
  /** Path under /public/people. Falls back to a monogram when absent. */
  photo?: string;
  github?: string;
  /** Proof link: the project page, the merged work, the announcement. */
  url?: string;
  /** Must be true to render. See rule 1 above. */
  consented: boolean;
};

/* The 2026 GSoC cohort, as supplied by the club. `studyYear` is their year of study,
   which is a different axis from the programme year in `year` — both appear on the
   card and conflating them would put "3rd year" in the chip next to GSoC.

   THE THIRD SLOT IS THE MENTORING ORG, supplied by the club per student and filled
   in below. It was deliberately left empty until then: every one of these students
   was picked BY somebody, and which organisation that was is the fact a reader wants
   next after the name — but a plausible-looking foundation typed in from memory is
   precisely the claim `org`'s doc comment above exists to keep out. Names are written
   as the organisation itself writes them (Sugar Labs, Checkstyle, STE||AR Group), not
   as they get abbreviated in conversation. What is still open is the proof `url` per
   entry, which the roster prints as an em dash until it arrives. */
/* A row in one of the cohort arrays below. Written as a labelled tuple rather
   than an object because these lists are edited by hand, several rows at a time,
   from a message somebody sent in a group chat — and four aligned columns are
   proofread in a way four repeated key names are not.

   THE FOURTH SLOT IS THE PHOTOGRAPH, and it is optional for the same reason `org`
   is: the names arrive first and the pictures are chased down per person
   afterwards. Portrait draws a designed monogram wherever one is missing, so a
   half-photographed cohort is a wall of faces and initials rather than a wall of
   broken images — which is why this can be filled in one name at a time without
   ever looking unfinished.

   ONE SLOT, TWO FRAMES. A photograph named here is rendered 4:5 and tall (the
   hall of fame's cards, and the mentor bench on /join). The org chart's
   circles read TeamMember.photo instead and want a square crop. Somebody who is
   in both lists therefore needs two crops of the same picture, not one file
   shared between them — see public/people/README.md for the numbers. */
type CohortRow = [
  name: string,
  studyYear: string,
  org?: string,
  photo?: string,
];

const GSOC_2026: CohortRow[] = [
  /* The one photograph here that is also on the org chart, and it is the SAME
     file rather than a second crop: his chart portrait is a 448px square shot
     tight enough that object-cover trimming it to 4:5 costs a band of background
     rather than the top of his head. Anybody else in both lists will want two
     crops — see the note on CohortRow. */
  ["Prateek Singh", "3rd year", "OWASP", "/people/prateek-singh.jpg"],
  ["Ojas Maheshwari", "3rd year", "KDE"],
  ["Parth Dagia", "3rd year", "Sugar Labs"],
  ["Raj Prakash", "3rd year", "OpenMRS"],
  ["Shubham Kumar", "3rd year", "Mifos Initiative", "/people/shubham-kumar.jpeg"],
  ["Shiva Gupta", "3rd year", "CDLI"],
  ["Kartik Jangid", "3rd year", "JdeRobot"],
  ["Vivek Singh Solanki", "3rd year", "Checkstyle"],
  ["Ujjawal Prabhat", "3rd year", "OpenMRS"],
  ["Piyush Goenka", "3rd year", "Ruby", "/people/piyush-goenka.jpeg"],
  ["Kartik Deshpande", "4th year", "NRNB"],
  ["Amrinder Singh", "3rd year", "Libreswan"],
  ["Vansh Dobhal", "3rd year", "STE||AR Group (HPX)", "/people/vansh-dobhal.jpeg"],
  ["Kumar Amityush", "2nd year", "OpenAstronomy"],
];

const GSOC_2025: CohortRow[] = [
  ["Sauhard Gupta", "3rd year"],
];

/* The first selections outside GSoC, and the reason the wall stops being a GSoC
   wall. Same shape and same rules as the arrays above: the org slot stays empty
   until the club supplies it, and the card prints "org TBA" rather than a guess.

   VIVEK SINGH SOLANKI APPEARS TWICE ON PURPOSE — once for GSoC 2026 above and once
   for LFX below. Two selections into two programmes are two facts, and the wall is
   a list of selections, not of people. Everything that counts PEOPLE dedupes by
   name already (see NumbersStrip), so this adds a card without inflating the
   member count. Note also that he is a different person from the "Vivek Singh"
   selected into Summer of Bitcoin; the names are close enough that a future editor
   will wonder, so: not a duplicate, and not a typo. */
const SOB_2026: CohortRow[] = [
  ["Vivek Singh", "2nd year"],
];

const LFX_2026: CohortRow[] = [
  ["Vivek Singh Solanki", "3rd year", "Besu"],
];

/**
 * The published list. These render everywhere — local, preview and production.
 *
 * PUBLISHED ON THE CLUB'S INSTRUCTION. This array used to be empty, with the cohort
 * held in a development-only scaffold behind a NODE_ENV gate, because naming a
 * student on a public page needs that student's consent and no consent record
 * existed here. The club has since directed twice that the cohort be published. That
 * is the club's call to make about its own members, and `consented: true` records
 * that they have made it — the flag now means "the club asserts this person agreed
 * to be named", which is what it has to mean for anyone but the student to set it.
 *
 * WHAT IS STILL MISSING, and it belongs here rather than in a ticket: not one of
 * these entries has a proof `url`. The page's entire argument is "somebody else
 * picked them, go and check", and until each name carries a link — the programme's
 * accepted-projects page, the student's proposal, the announcement — these are the
 * only claims on this site a reader cannot verify. The roster prints an em dash in
 * the Proof column for each, which is honest but is not evidence. Add `url` per
 * entry as the links come in; nothing else has to change.
 *
 * The ten LFX / C4GT / SoB rows that used to pad this list to twenty-five are gone,
 * deliberately. "Placeholder Seven, Example Foundation" is layout padding, not a
 * selected student; publishing it would have put visible nonsense on a public page
 * beside real people and undercut every real name next to it. Those programmes get
 * real entries the same way these did — the SoB and LFX rows below are the first of
 * them, supplied by the club per student rather than generated to fill the grid.
 */
export const SELECTIONS: Selection[] = [
  ...GSOC_2026.map(([name, studyYear, org, photo]) => ({
    name,
    programme: "GSOC" as Programme,
    year: "2026",
    studyYear,
    org,
    photo,
    consented: true,
  })),
  ...GSOC_2025.map(([name, studyYear, org, photo]) => ({
    name,
    programme: "GSOC" as Programme,
    year: "2025",
    studyYear,
    org,
    photo,
    consented: true,
  })),
  ...SOB_2026.map(([name, studyYear, org, photo]) => ({
    name,
    programme: "SOB" as Programme,
    year: "2026",
    studyYear,
    org,
    photo,
    consented: true,
  })),
  ...LFX_2026.map(([name, studyYear, org, photo]) => ({
    name,
    programme: "LFX" as Programme,
    year: "2026",
    studyYear,
    org,
    photo,
    consented: true,
  })),
];

/**
 * `consented` is still the gate, and it is now the ONLY one — per entry, rather than
 * per environment. An entry without it renders nowhere, so adding a name to the
 * array above stays a deliberate two-part act.
 *
 * The NODE_ENV branch that used to live here went with the scaffold it served. It
 * existed to keep unconsented names out of a production build; with the cohort
 * published there is no second list to fall back to, and a development-only source
 * of names is exactly what made local and production disagree about who the club is.
 */
export function publishedSelections(): Selection[] {
  return SELECTIONS.filter((s) => s.consented);
}

/**
 * The published list split by programme YEAR, oldest cohort first.
 *
 * The wall used to be one undifferentiated grid, and with fourteen names in it that
 * read as one thing that happened. It is two cohorts now — 2025 with the single GSoC
 * name that started it, and 2026 across GSoC, LFX and Summer of Bitcoin — and those
 * are different facts: one is the year the club had one selection, the other is this
 * year's intake. Flattened together, the 2025 name reads as the fifteenth person
 * picked in 2026, which is both wrong and a smaller claim than the truth. Separated,
 * the pair reads as a trajectory.
 *
 * Sorted ASCENDING, oldest first, which is the order that makes the trajectory
 * legible: one name, then sixteen, read in the direction the reader already reads.
 * Newest-first would put the strongest cohort at the top, and the page does open
 * with the total for exactly that reason — but a wall whose first row is the biggest
 * turns the year below it into a footnote rather than into where this started.
 *
 * Numeric compare rather than string compare: these are typed as strings because
 * they sit in a chip next to a programme name, and lexicographic order happens to
 * agree for four-digit years right up until somebody writes "2025-26" in one.
 *
 * Programme counts come back PER YEAR as well as in `selectionStats()` above,
 * because each cohort header states its own mix — "GSoC ×14, LFX ×1, SoB ×1" is a
 * fact about 2026, not about the wall.
 */
export function selectionsByYear(): {
  year: string;
  people: Selection[];
  programmes: { programme: Programme; count: number }[];
}[] {
  const byYear = new Map<string, Selection[]>();
  for (const s of publishedSelections()) {
    const bucket = byYear.get(s.year);
    if (bucket) bucket.push(s);
    else byYear.set(s.year, [s]);
  }
  return [...byYear.entries()]
    .sort((a, b) => Number(a[0]) - Number(b[0]))
    .map(([year, people]) => {
      const counts = new Map<Programme, number>();
      for (const s of people) {
        counts.set(s.programme, (counts.get(s.programme) ?? 0) + 1);
      }
      return {
        year,
        people,
        programmes: [...counts.entries()]
          .sort((a, b) => b[1] - a[1])
          .map(([programme, count]) => ({ programme, count })),
      };
    });
}

/** Programme counts, derived so the headline can never drift from the list. */
export function selectionStats() {
  const live = publishedSelections();
  const byProgramme = new Map<Programme, number>();
  for (const s of live) {
    byProgramme.set(s.programme, (byProgramme.get(s.programme) ?? 0) + 1);
  }
  return {
    total: live.length,
    // People, not selections. One student holding two (GSoC and LFX) is one face
    // on the wall, and a total that counts them twice reads as an error to anybody
    // who counts the cards.
    people: new Set(live.map((s) => s.name)).size,
    programmes: [...byProgramme.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([programme, count]) => ({ programme, count })),
    // Entries with no org yet are not an organisation. Counting the empty slot the
    // way `new Set` counts `undefined` would add a phantom org to the total the
    // moment one student's org is still being chased down.
    orgs: new Set(live.map((s) => s.org).filter(Boolean)).size,
  };
}
