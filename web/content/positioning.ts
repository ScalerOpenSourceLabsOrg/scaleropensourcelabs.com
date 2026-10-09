// THE HOME PAGE'S ARGUMENT: what a member walks away with, and how that compares
// with the other club a student is choosing between.

// WHAT YOU ACTUALLY GET — the argument that outlasts the stipend.
//
// The stipend is the smallest part. A student who lands one of these ends up with
// a public track record, a named maintainer who knows their work, and a reference
// from outside their university. That is what turns into an internship.

export const OUTCOMES: { title: string; body: string }[] = [
  {
    title: "A maintainer who knows your name",
    body: "You spend a summer being reviewed by someone senior at a real project. They remember who ships, and that relationship does not expire when the programme ends. It is worth more than the money.",
  },
  {
    title: "A public record an employer can read",
    body: "Merged pull requests in a project a company already depends on. Not a certificate, not a course completion — code they can open and read, with your name on the commit.",
  },
  {
    title: "A reference from outside your college",
    body: "Every student in your batch has the same professors. Almost none of them have someone at a foundation willing to vouch for their work.",
  },
  {
    title: "The people doing it with you",
    body: "The others in this club apply to the same programmes, review each other's patches, and share which maintainers actually reply. That network is why the second selection is easier than the first.",
  },
];

// ---------------------------------------------------------------------------
// POSITIONING against the other club a student is choosing between.
//
// EVERY NUMBER HERE IS VERIFIED AGAINST A PRIMARY SOURCE AND CARRIES ITS LINK.
// That is not fussiness — this section attacks a rival activity, so it is the
// first place a sceptical reader will go looking for an exaggeration. One
// unsupported figure here retroactively discredits every other claim on a site
// whose whole thesis is "you can check this".
//
// Two claims were CUT during research because they did not hold up:
//   * "only ~9 people per college make ICPC" — no rule or dataset produces 9.
//     The real numbers (3 by rule, ~5.6 in practice, 30 nationally) are both
//     true and more striking, so the invented figure bought nothing.
//   * "open source is an easier door than ICPC" — false. GSoC 2025 accepted
//     1,280 of 15,240 applicants, about 8.4%. Comparable brutality.
//
// So the argument is deliberately NOT "our thing is easier to win". It is that
// open source pays out below the top prize and competitive programming mostly
// does not. That is the floor, not the ceiling, and it is defensible.
//
// THE THIRD COLUMN. A student on this campus is realistically choosing between
// three clubs, not two, so the AI/ML club is in the comparison rather than
// implied. It carries NO FIGURES, and that is deliberate: there is no rulebook
// to cite for a hackathon and no published national admit rate for a Kaggle
// competition, so every AI/ML cell is a structural statement about how the
// activity works — open entry, a fixed prize pool, a leaderboard that closes —
// which is checkable by anyone who has entered one. Inventing a stat to fill
// the column would break the same rule the two claims above were cut for.
//
// Each row is also written so the CP and AI/ML cells are ones their own members
// would agree with. "Who signs off" concedes the judge outright. A comparison a
// rival would call unfair is one a reader discounts entirely, and this section
// only works if it survives being read by someone in both other clubs.

export type Cell = {
  stat?: string;
  line: string;
  sources?: { label: string; url: string }[];
};

export type Comparison = {
  /** The question the row answers. Renders as the row header. */
  axis: string;
  cp: Cell;
  aiml: Cell;
  osc: Cell;
};

export const COMPARISON: Comparison[] = [
  {
    axis: "How many can win",
    cp: {
      stat: "3",
      line: "Only one team per institution may advance to the World Finals: three students, per college, per year. Ten Indian teams reached Baku in 2025 — thirty students for the entire country. The door is that narrow by design.",
      sources: [
        {
          label: "ICPC Regional Rules",
          url: "https://icpc-iiitdm.vercel.app/onsite-rules.pdf",
        },
        { label: "ICPC 2025 standings", url: "https://cphof.org/standings/icpc/2025" },
      ],
    },
    aiml: {
      line: "A hackathon or a Kaggle competition ranks everyone who entered and pays the top of the list. How many places exist is decided before registration opens.",
    },
    osc: {
      stat: "∞",
      line: "No rule caps how many people from your college get code merged into Kubernetes. Competitive programming is a sport with a fixed number of podium places. Open source is a backlog with an unbounded number of open issues.",
    },
  },
  {
    axis: "Odds at the top",
    cp: {
      line: "The World Finals is the ceiling and it is brutal. Nothing on this page pretends otherwise.",
    },
    aiml: {
      line: "The leaderboard is public and open, which means you are ranked against everyone who entered — including people who do this full time.",
    },
    osc: {
      stat: "8.4%",
      // 1,280 not 1,272. Google's May announcement said 1,272; the August final
      // statistics post — which is what we link — says 1,280. Citing one figure and
      // linking a source that states another is the exact failure this whole section
      // exists to avoid, so the number now matches the page it points at.
      line: "GSoC accepted 1,280 people from 15,240 applicants in 2025. This is not the soft option, and we will not pretend it is.",
      sources: [
        {
          label: "Google Open Source Blog",
          url: "https://opensource.googleblog.com/2025/08/google-summer-of-code-2025-contributor-statistics.html",
        },
      ],
    },
  },
  {
    axis: "What you keep if you do not get in",
    cp: {
      line: "A rating graph. It is a real measure of real skill, and it lives on one site, in one profile.",
    },
    aiml: {
      line: "A model in a notebook. Good work — and the competition it was built for closes, and the leaderboard is archived.",
    },
    osc: {
      line: "Commits with your name on them, in a repository other people run in production. Merged is merged whether or not the stipend came with it.",
    },
  },
  {
    axis: "When you stop being eligible",
    cp: {
      line: "Five regional years, two World Finals, and you must still be enrolled. The clock is part of the format.",
    },
    aiml: {
      line: "Kaggle has no student rule. Most campus hackathons do — the badge goes with the enrolment.",
    },
    osc: {
      line: "Your commit history has no eligibility clause, and GSoC dropped its student-only requirement in 2022.",
      sources: [
        {
          label: "GSoC eligibility change",
          url: "https://opensource.googleblog.com/2021/11/expanding-google-summer-of-code-in-2022.html",
        },
      ],
    },
  },
  {
    axis: "Who signs off on your work",
    cp: {
      line: "An automated judge, in thirty seconds. The fastest feedback loop of the three and unbeatable for getting quick at DSA. What it cannot tell you is whether another person could read what you wrote.",
    },
    aiml: {
      line: "A metric on a held-out set. Objective and immediate, and indifferent to everything a number cannot see — including whether anybody but you can run the code.",
    },
    osc: {
      line: "A maintainer who has to read your patch, push back on it, then live with it for years. The slowest of the three, and the only one where a working engineer reviews you the way a colleague will.",
    },
  },
  {
    axis: "What it pays",
    cp: {
      line: "Prize money at the top of the bracket. Below it, the return is the skill itself — which is not nothing, but it is not a stipend.",
    },
    aiml: {
      line: "A prize pool, split between the teams that place.",
    },
    osc: {
      line: "GSoC, LFX Mentorship, C4GT and Summer of Bitcoin pay stipends to contributors who are nowhere near the best in the country. The money is the floor here, not the ceiling.",
    },
  },
];

/**
 * The closing line under the comparison table.
 *
 * Deliberately not a row: it is not a fact about any of the three clubs, it is
 * the reason this one exists. Putting it in the grid would have forced two
 * invented cells to sit beside it.
 */
export const COMPARISON_NOTE = {
  line: "India now has the largest open-source contributor base in the world. American developers still contribute more per head. That gap is the entire reason this club exists.",
  source: {
    label: "GitHub Octoverse 2025",
    url: "https://github.blog/news-insights/octoverse/octoverse-a-new-developer-joins-github-every-second-as-ai-leads-typescript-to-1/",
  },
};

/**
 * What we are worse at.
 *
 * This is on the page on purpose. A comparison that lists only our advantages
 * reads as marketing and gets discounted wholesale; naming the real cost is what
 * makes the paragraph above believable. The DSA point goes first because it is
 * the single strongest honest argument for joining the CP club instead, and
 * burying it would be the tell.
 */
export const TRADE_OFFS: string[] = [
  "We will not prepare you for the DSA round. That is the filter on most campus placements, and the competitive programming club is straightforwardly better at it. Do both.",
  "Feedback is slow and depends on strangers. A pull request can sit for three weeks; a judge answers in thirty seconds. If a tight loop is what keeps you going, this is the harder room.",
  "There is no single number for your resume. Nothing sorts. A recruiter has to actually open your GitHub, and some will not.",
  "Getting started takes longer. Building the project, finding a tractable issue and reading enough code to be useful can take weeks. Your first submission on a judge takes ten minutes.",
  "If you are aiming at quant or high-frequency trading, contest standing is the recognised route and we are not a substitute for it.",
];

// ---------------------------------------------------------------------------
// WHAT THE HOME PAGE NOW CARRIES of all the above.
//
// The home page used to make the career argument twice ("Beyond the stipend" from
// OUTCOMES, "Why it matters" from essence.ts IMPACT) and then run the six-row
// COMPARISON table. Two lists saying the same thing read as padding, and the
// table — the longest block on the site — read as an attack on the other two clubs
// on campus. So: one list of four, merged from both, and the table's one sentence a
// reader would keep. OUTCOMES, COMPARISON and TRADE_OFFS stay here as the sourced
// long form, unmounted.

export const WHY_IT_MATTERS: { title: string; body: string }[] = [
  {
    title: "A public record an employer can read",
    body: "Right now your GitHub holds semester projects. One merged PR adds code a real maintainer read, argued about and accepted — with your name on it.",
  },
  {
    title: "Senior engineers review your code, for free",
    body: "Your reviewer might work at Google or Red Hat. They remember who ships — long after the programme ends.",
  },
  {
    title: "Some of it pays, in your second year",
    body: "GSoC, LFX and Outreachy pay stipends to people with zero work experience. Most students never apply because nobody told them.",
  },
  {
    title: "The people doing it with you",
    body: "We apply to the same programmes, review each other's patches, and swap notes on which maintainers reply. That's why the second selection comes easier.",
  },
];

/** The comparison table, as the one line of it worth keeping. Same sources. */
export const PODIUM = {
  line: "ICPC sends three students per college per year to its World Finals. Nobody caps how many of you get code merged into Kubernetes.",
  source: COMPARISON[0].cp.sources![0],
};
