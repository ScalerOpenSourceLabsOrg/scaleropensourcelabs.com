// THE PROGRAMMES themselves: what each one is, what it costs to enter, when it
// opens, and the name and colour it wears everywhere on the site.
//
// Who got into them is a separate list — content/selections.ts.

// GSSOC AND HACKTOBERFEST ARRIVED IN THE MERGE, and they are the reason the `tier`
// field below exists. This list used to be five programmes that a student has to be
// SELECTED into, which made "programme" and "paid, competitive thing" the same word.
// The moment two open-entry events joined the list that stopped being true, and a
// first-year reading a single undifferentiated grid would reasonably conclude that
// every item on it is out of reach this year. The honest answer — the open ones
// today, the paid ones after a few months of the open ones — needs the distinction
// to be in the data.
export type Programme =
  | "GSOC"
  | "LFX"
  | "C4GT"
  | "SOB"
  | "OUTREACHY"
  | "GSSOC"
  | "HACKTOBERFEST";

/**
 * `paid` — somebody else runs a selection process, and if they pick you, you are
 *   paid. This is the tier that is worth something to a recruiter precisely
 *   because you did not award it to yourself.
 * `open` — no selection. You participate by turning up and contributing. Real
 *   value for a first contribution, no signal value as a credential.
 */
export type Tier = "paid" | "open";

/** Full names, since the acronyms mean nothing to a general reader. */
export const PROGRAMME_NAME: Record<Programme, string> = {
  GSOC: "Google Summer of Code",
  LFX: "LFX Mentorship",
  C4GT: "Code for GovTech",
  SOB: "Summer of Bitcoin",
  OUTREACHY: "Outreachy",
  GSSOC: "GirlScript Summer of Code",
  HACKTOBERFEST: "Hacktoberfest",
};

/**
 * Programme colours, used to tint each planet in the system.
 *
 * Validated as a categorical set against the #05070D surface with the dataviz
 * validator — lightness band, chroma floor, normal-vision separation and contrast
 * all pass. Adjacent-pair CVD separation lands at ΔE 6.5 under deuteranopia, which
 * is the floor band and legal ONLY with secondary encoding, so every planet also
 * carries its programme name as a direct label. Colour never carries identity
 * alone here.
 *
 * The obvious palette — Google blue for GSoC next to a violet for LFX — failed
 * badly: ΔE 2.5 under protanopia, effectively one colour for a red-green
 * colourblind viewer. Blue and violet are adjacent hues; magenta buys the
 * separation that violet cannot.
 */
/* Programme colours resolve through CSS custom properties rather than literals,
   because the same hue cannot serve both themes: the dark set was validated
   against #05070D and measures 3.22–3.83:1 on white, i.e. all four fail AA as
   the 11px text they are used for. The variables are defined per theme in
   globals.css. Anything drawn in the DOM must use this map so it follows the
   theme. */
/* THE LAST TWO WERE ADDED BY A MERGE AND WERE PUT THROUGH THE SAME VALIDATOR.
   `npm run palette -- --legacy` sweeps all seven, and the seven-colour set fails on
   exactly the pairs the five-colour set already failed on — three GSOC/OUTREACHY
   distances, which are the known adjacent-hue problem the note above describes.
   Adding these two costs nothing.

   Getting there took three attempts and the reason is worth recording, because the
   obvious pick is the wrong one. GSSoC's own branding is pink, and a pink sits on
   top of LFX's magenta: dE 13.8 against a floor of 15. Moving it to a mid red then
   collided with SOB's orange under deuteranopia and with C4GT's teal under
   protanopia — because red-green CVD collapses all three of those onto the same
   axis, so no amount of hue-shifting inside the red-orange-green arc separates
   them. The only two things that survive red-green CVD are the blue-yellow axis and
   LIGHTNESS, which is why GSSoC ended up as a very dark red on light and a very
   light pink on dark rather than as anything in the middle.

   Colour still never carries identity alone here — every programme is directly
   labelled with its own name — but the set is no longer weaker than the one it
   extends. Re-run the sweep before adding an eighth. */
export const PROGRAMME_COLOUR: Record<Programme, string> = {
  GSOC: "var(--prog-gsoc)",
  LFX: "var(--prog-lfx)",
  C4GT: "var(--prog-c4gt)",
  SOB: "var(--prog-sob)",
  OUTREACHY: "var(--prog-outreachy)",
  GSSOC: "var(--prog-gssoc)",
  HACKTOBERFEST: "var(--prog-hacktoberfest)",
};

/* WebGL cannot read custom properties — a shader uniform needs a real number. The
   solar system is inside .night in both themes, so it always wants the dark set,
   which is exactly what these are. Do not use these in the DOM. */
export const PROGRAMME_COLOUR_HEX: Record<Programme, string> = {
  GSOC: "#4A86E8",
  LFX: "#D64FA0",
  C4GT: "#1F9D6B",
  SOB: "#B8871F",
  OUTREACHY: "#8B6DE8",
  GSSOC: "#FFB3B3",
  HACKTOBERFEST: "#C3D98A",
};

export const PROGRAMME_SHORT: Record<Programme, string> = {
  GSOC: "GSoC",
  LFX: "LFX",
  C4GT: "C4GT",
  SOB: "SoB",
  OUTREACHY: "Outreachy",
  GSSOC: "GSSoC",
  HACKTOBERFEST: "Hacktoberfest",
};

// PROGRAMMES — the product line.
//
// The site's job is not only to show that members got selected; it is to explain
// what these programmes ARE to someone who has never heard of them, and what they
// pay. Most students don't apply because nobody told them the thing exists, pays
// real money, and takes applicants with almost no track record.
//
// Stipends are deliberately written as "published by the programme" rather than
// quoted as our own figures. They change year to year and we are not the source.

export type ProgrammeInfo = {
  key: Programme;
  /** See the note over `Tier`. Drives the two groups the programmes page renders. */
  tier: Tier;
  what: string;
  who: string;
  /** Rough shape of the year — not exact dates, which move annually. */
  when: string;
  pays: string;
  /** What OSC specifically does to get you in. This is the product. */
  weDo: string;
  /**
   * What the club has to show for this programme, when a list of names is the
   * wrong shape for it.
   *
   * The "who from SST has done it" row is normally DERIVED from SELECTIONS, and
   * that stays the default: a selective programme's answer is a set of people who
   * were each individually picked, and deriving it is what stops this page and the
   * Hall of Fame disagreeing. But the open tier is a participation programme —
   * dozens take part and there is nothing to be selected into — so the honest
   * answer is a count plus whoever stood out, which no list of Selection rows can
   * express without inventing a selection that never happened. Prose here, names
   * in SELECTIONS; when both exist the row shows both.
   */
  ours?: string;
  url: string;
};

export const PROGRAMMES: ProgrammeInfo[] = [
  {
    key: "GSOC",

    tier: "paid",
    what: "Google pays you to code for an open-source org over the summer, with a mentor from that org.",
    who: "Anyone 18+ who's new to the org. No student status or open-source experience needed.",
    when: "Orgs announced early in the year, applications weeks later, coding all summer.",
    pays: "A stipend set by Google, by country and project size.",
    weDo: "We start six months early, so maintainers know your name before applications open.",
    url: "https://summerofcode.withgoogle.com/",
  },
  {
    key: "LFX",

    tier: "paid",
    what: "The Linux Foundation's mentorship programme, across CNCF, Kubernetes, Node.js and more.",
    who: "Built for beginners. Miss a term? The next is months away, not a year.",
    when: "Three terms a year — there's almost always one open.",
    pays: "A stipend published by the Linux Foundation, scaled by region.",
    weDo: "Help you pick a project that fits what you know, and land a merged PR there before applications close.",
    url: "https://lfx.linuxfoundation.org/tools/mentorship/",
  },
  {
    key: "C4GT",

    tier: "paid",
    what: "Code for GovTech: open source for the software Indian government services run on.",
    who: "Indian students who want their code used at national scale, not just starred.",
    when: "An annual summer cohort plus year-round contribution windows.",
    pays: "A stipend published by the programme.",
    weDo: "Point you at projects with responsive maintainers, and help you read code built for scale.",
    url: "https://www.codeforgovtech.in/",
  },
  {
    key: "SOB",
    tier: "paid",
    what: "Summer of Bitcoin: a paid summer on Bitcoin and Lightning projects.",
    who: "Students — even ones who've never touched the codebase. The C++ is scary, and they know it.",
    when: "Applications early in the year, coding over the summer.",
    pays: "A stipend published by the programme.",
    weDo: "Do the onboarding curriculum together. Almost nobody finishes it alone.",
    url: "https://www.summerofbitcoin.org/",
  },

  // ---- The open tier ------------------------------------------------------
  // Everything above requires somebody else to pick you. These two do not, and
  // that is the entire reason they are on the page: the honest answer to "which
  // of these can I actually do right now" is "these, today", and a first-year
  // who only ever sees the selective five concludes the answer is "none".
  {
    key: "GSSOC",
    tier: "open",
    what:
      "GirlScript Summer of Code: three months of open source with mentors and a points leaderboard. Made for beginners.",
    who: "Beginners welcome, even first-years with zero merged work. You can start here today.",
    when: "Register at the start, then about three months of contributing.",
    pays:
      "No stipend. Certificates and swag — but the mentors are the real prize.",
    weDo:
      "Register when it opens, pick a project in a language you know, and learn the fork-to-merge loop before the paid ones.",
    ours:
      "30+ students participated in GSSoC '26. Top contributor from SST: Bhumi N Deshpande.",
    url: "https://gssoc.girlscript.tech/",
  },
  {
    key: "HACKTOBERFEST",
    tier: "open",
    what:
      "Every October: get a handful of PRs merged and you get swag. No selection, no stipend.",
    who: "Anyone. The lowest bar in open source, and the best month for a first PR — half the internet is reviewing.",
    when: "October, every year. Registration opens in late September.",
    pays: "Swag, or a tree planted in your name. That's it.",
    weDo:
      "Get a project built on your machine before 1 October. Come to a September session and we'll do it together.",
    ours: "Many of us had our first PRs merged here.",
    url: "https://hacktoberfest.com/",
  },
];

/**
 * The honest caveat about Hacktoberfest, kept next to it rather than buried.
 *
 * This is on the page because the club's position is not "do all of these". In
 * 2020 Hacktoberfest's reward structure produced enough junk pull requests that
 * maintainers publicly asked people to stop, and the programme changed its rules
 * in response. Recommending it without saying so would be the kind of omission
 * this site exists not to make — and a maintainer reading this page would spot it
 * instantly.
 */
export const HACKTOBERFEST_CAVEAT =
  "One warning: the point isn't four merged PRs. Whitespace-change spam gave Hacktoberfest a bad name, and maintainers remember. Fix something actually broken, or skip the PR.";

/* Derived rather than written out as two arrays, so a programme cannot be in
   neither group or in both. Adding one to PROGRAMMES with a `tier` puts it in the
   right place on the page automatically. */
export const PAID = PROGRAMMES.filter((p) => p.tier === "paid");
export const OPEN_ENTRY = PROGRAMMES.filter((p) => p.tier === "open");

// ---------------------------------------------------------------------------
// THE CALENDAR — the only honest urgency device this club owns.
//
// Not a logistics footer. The argument is arithmetic: organisations select
// contributors who already have months of commits in their repo, so an
// application written the week it opens is competing against people who started
// in autumn. "I'll do it next year" is therefore not a delay, it is a skipped
// cycle. That is unanswerable and it needs no countdown timer.
//
// Deliberately no exact dates. They move every year, and a stale date on a page
// whose whole claim is accuracy costs more than it buys. Each row states the
// typical window and — the part that matters — what you should already be doing
// months before it opens.

export type CalendarRow = {
  window: string;
  programme: string;
  opens: string;
  /** The month range when the work that actually gets you selected happens. */
  prepFrom: string;
  doingNow: string;
};

export const CALENDAR: CalendarRow[] = [
  {
    window: "Jan – Apr",
    programme: "Google Summer of Code",
    opens: "Organisations announced late Feb, proposals due late Mar",
    prepFrom: "Sep – Dec",
    doingNow:
      "Get one small patch merged in each of two orgs, so reviewers know your username by proposal time.",
  },
  {
    window: "Rolling, three terms",
    programme: "LFX Mentorship",
    opens: "Terms start around Mar, Jun and Sep",
    prepFrom: "6–8 weeks before a term",
    doingNow:
      "The most forgiving one — a miss costs months, not a year. Pick a term that fits what you know.",
  },
  {
    window: "Feb – Jun",
    programme: "Code for GovTech",
    opens: "Cohort announced early in the year",
    prepFrom: "Nov – Jan",
    doingNow:
      "Read a public-infrastructure codebase properly. Built for national scale, not demos.",
  },
  {
    window: "Jan – Aug",
    programme: "Summer of Bitcoin",
    opens: "Applications early in the year, then a multi-week bootcamp",
    prepFrom: "Oct – Dec",
    doingNow:
      "Start the onboarding curriculum — with us. Almost nobody finishes it alone.",
  },
];
