// ESSENCE — the home page.
//
// One job: a first-year who has never opened a pull request should finish this page
// knowing what open source is, why it changes what happens after graduation, and
// what to do today. In that order, because the third does not land without the
// first two.
//
// The register is seniors explaining something they actually did, not a
// prospectus. Concretely, from CONTRIBUTING.md: say what happened rather than how
// it felt, no adjectives describing people, sentence case, and prefer the specific.

// ---------------------------------------------------------------------------
// 1. WHAT OPEN SOURCE ACTUALLY IS.
//
// The strongest available argument is not a definition, it is the reader's own
// laptop: they are already running several of these and did not know. So every
// entry is something a student at this college is overwhelmingly likely to have
// open right now, and every one links to the actual source repository — the point
// being that you can go and read it, which is the whole idea.
//
// The VS Code entry states the licensing nuance rather than smoothing it over.
// "VS Code is open source" is the kind of half-true line that a maintainer reading
// this page would notice immediately, and getting it exactly right costs one clause.

export type Everyday = {
  name: string;
  /** What it is, for someone who uses it without thinking about it. */
  what: string;
  /** The specific, checkable fact about its openness. */
  fact: string;
  repo: string;
  language: string;
};

export const EVERYDAY: Everyday[] = [
  {
    name: "Linux",
    what:
      "Inside every Android phone, and behind almost every website you visited today.",
    fact:
      "Built in public since 1991. Thousands of people change it every year.",
    repo: "https://github.com/torvalds/linux",
    language: "C",
  },
  {
    name: "Python",
    what: "Probably the first language you came across.",
    fact:
      "The interpreter, CPython, is public — source, bug tracker and design arguments included.",
    repo: "https://github.com/python/cpython",
    language: "C, Python",
  },
  {
    name: "VS Code",
    what: "The editor you almost certainly have open on the other monitor.",
    fact:
      "The source is MIT-licensed. Microsoft's own build adds a few closed bits on top.",
    repo: "https://github.com/microsoft/vscode",
    language: "TypeScript",
  },
  {
    name: "Git",
    what: "The thing you type commands at without being sure what they do.",
    fact:
      "Linus Torvalds wrote it in 2005 for the Linux kernel. Open from the first commit — you can read it.",
    repo: "https://github.com/git/git",
    language: "C",
  },
];

/**
 * The definition itself, in three beats. Deliberately short: this sits under the
 * list above, because the examples do the convincing and the definition only has
 * to name what the reader has just noticed.
 */
export const WHAT_IT_IS: { title: string; body: string }[] = [
  {
    title: "Built in the open",
    body: "Every change is a public proposal. Read the code, the debate, and why things got refused.",
  },
  {
    title: "By anyone",
    body: "No permission needed. A second-year in Bengaluru and a staff engineer in Berlin use the same door.",
  },
  {
    title: "For everyone",
    body: "Free for anyone — including the companies that'll interview you. That's why your commits matter to them.",
  },
];

// ---------------------------------------------------------------------------
// 1b. WHO ACTUALLY MAINTAINS IT.
//
// Added to pull the page toward open source itself and away from being a career
// pitch with open source as the mechanism. The section above tells a reader that the
// software they use is public; this tells them who is on the other side of it, which
// is the part that makes contributing feel like joining something rather than
// harvesting something.
//
// It is also the honest counterweight to the page that follows. "Your GitHub becomes
// your resume" is true and it is not why any of this exists, and a site that only
// ever makes the career argument produces exactly the contributor maintainers
// complain about — one who opens four pull requests in October and is never seen
// again.
//
// No numbers here, deliberately. The obvious version cites how few people maintain
// some critical package, and every figure I could recall for that is either dated or
// unverifiable from memory. The repo rule applies: a weaker claim you can prove beats
// a stronger one you cannot. So the claim is about a study that exists and what it
// was for, which the link supports exactly.

export const MAINTAINERS: { title: string; body: string }[] = [
  {
    title: "Often not paid for it",
    body: "Whoever reviews your first PR is often doing it after their day job, just because they care.",
  },
  {
    // The original draft of this said the census was run "because nobody could say who
    // maintains them". The linked report does not say that — its framing question is
    // which packages are most used, not who maintains them — so the claim now matches
    // the source, and the inference that follows is marked as an inference.
    title: "Nobody had even mapped it",
    body: "The Linux Foundation, OpenSSF and Harvard needed a whole census just to find out which packages the world depends on. So nobody's really in charge.",
  },
  {
    title: "Which is why review feels slow",
    body: "A PR sitting for three weeks is almost never about you. It's one person with a backlog and a day job — a queue, not a rejection.",
  },
];

/** Verified 2026-08-06: resolves 200, and the page's own text names LF Research, the
    OpenSSF and the Laboratory for Innovation Science at Harvard studying "the most
    common packages used at the application library level". */
export const MAINTAINERS_SOURCE = {
  label: "Census III of Free and Open Source Software",
  url: "https://www.linuxfoundation.org/research/census-iii",
};

// ---------------------------------------------------------------------------
// 1c. THE VOCABULARY.
//
// This is the most open-source-specific thing on the site and it is here because the
// barrier to a first contribution is very often linguistic rather than technical. A
// second-year who can write Python fine will still not open a pull request when the
// contributing guide says "rebase onto upstream/main and squash before we triage" —
// and nobody explains those words, because everyone who could has forgotten not
// knowing them.
//
// Chosen by one test: would a competent second-year who has never contributed be
// stopped by this word? "Repository" and "commit" are out — they have used those.
// "Upstream", "nit" and "LGTM" are in, because they are used constantly, never
// explained, and each one privately reads as hostile the first time.

export const GLOSSARY: { term: string; meaning: string }[] = [
  {
    term: "upstream",
    meaning:
      "The original project, not your copy. “Landed upstream” means the real project took your change.",
  },
  {
    term: "fork",
    meaning:
      "Your own copy of the project on GitHub. Break whatever you like — it's yours.",
  },
  {
    term: "good first issue",
    meaning:
      "A label for tasks sized for newcomers. Filtering by it isn't cheating — it's the point.",
  },
  {
    term: "maintainer",
    meaning:
      "The person who decides what gets merged. Usually a volunteer. Almost always busier than you assume.",
  },
  {
    term: "triage",
    meaning:
      "Sorting new issues into what they actually are. Unglamorous, endless, and hugely welcome help.",
  },
  {
    term: "nit",
    meaning:
      "A small, non-blocking comment. “nit: trailing whitespace” is not a rejection and is not criticism of you.",
  },
  {
    term: "LGTM",
    meaning:
      "“Looks good to me.” An approval. Your first one is a great day.",
  },
  {
    term: "rebase",
    meaning:
      "Replaying your commits on top of the latest upstream, so history stays a line, not a knot. You'll be asked to at least once.",
  },
  {
    term: "squash",
    meaning:
      "Collapsing your eleven “fix typo” commits into one clean commit before it is merged. Nobody minds that you needed eleven.",
  },
  {
    term: "licence",
    meaning:
      "The terms the code ships under. MIT and Apache-2.0 let anyone use it; the GPL also requires derived work to stay open.",
  },
  {
    term: "CLA",
    meaning:
      "A Contributor License Agreement. Some foundations want one before your first merge. Routine, not a trap, two minutes.",
  },
  {
    term: "RFC",
    meaning:
      "A written proposal for a change big enough to argue about first. Old ones show you how a project thinks.",
  },
];

// ---------------------------------------------------------------------------
// 2. HOW IT CHANGES WHAT HAPPENS AFTER COLLEGE.
//
// Four claims. Each is about a mechanism, not a feeling — "recruiters can read
// your commits" is checkable, "unlock your potential" is not.

export const IMPACT: { title: string; body: string; aside?: string }[] = [
  {
    title: "Your GitHub stops being empty",
    body: "Right now it holds semester projects nobody asked for. After one merged pull request it holds a change a real maintainer read, argued about and accepted. Anyone technical can tell the difference in nine seconds.",
  },
  {
    title: "Engineers at global companies review your code, for free",
    body: "The person reviewing your patch to a Kubernetes-adjacent project may well do that work at Google or Red Hat. You do not have to be hired there to have them read your code and say why it is wrong.",
  },
  {
    title: "It is the most honest signal you can send a recruiter",
    body: "A certificate says you attended. A CGPA says you passed exams somebody else set. A merged pull request says a stranger with no reason to be kind let your work into software other people depend on.",
    aside: "It is also harder to fake than anything else on a resume, which is exactly why it counts.",
  },
  {
    title: "Some of it pays, in your second year",
    body: "Google Summer of Code, LFX Mentorship and Outreachy pay stipends to people with no professional experience — for a summer being mentored on a real codebase. Most students never apply because nobody told them.",
  },
];

// ---------------------------------------------------------------------------
// 3. POSITIONING against the other club a student is choosing between.
//
// EVERY NUMBER HERE IS VERIFIED AGAINST A PRIMARY SOURCE AND CARRIES ITS LINK.
// This section attacks a rival activity, so it is the first place a sceptical
// reader goes looking for an exaggeration, and one unsupported figure here
// retroactively discredits every other claim on the site.
//
// Two claims were CUT during research because they did not hold up:
//   * "only ~9 people per college make ICPC" — no rule or dataset produces 9. The
//     real numbers (3 by rule, 30 nationally) are both true and more striking.
//   * "open source is an easier door than ICPC" — false. GSoC 2025 accepted 1,280
//     of 15,240 applicants, about 8.4%. Comparable brutality.
//
// So the argument is deliberately NOT "our thing is easier to win". It is that
// open source pays out below the top prize and competitive programming mostly does
// not. That is a claim about the floor, not the ceiling, and it is defensible.

export type Claim = {
  stat?: string;
  line: string;
  source?: { label: string; url: string };
};

export const POSITIONING: Claim[] = [
  {
    stat: "3",
    line: "Only one team from a given institution may advance to the ICPC World Finals. Three students, per college, per year. That is the rulebook, not our opinion.",
    source: {
      label: "ICPC Regional Rules",
      url: "https://icpc-iiitdm.vercel.app/onsite-rules.pdf",
    },
  },
  {
    stat: "30",
    line: "Ten Indian teams reached the 2025 World Finals in Baku. Thirty students, for the entire country. They earned every place — the door is simply that narrow by design.",
    source: {
      label: "ICPC 2025 standings",
      url: "https://cphof.org/standings/icpc/2025",
    },
  },
  {
    line: "No rule caps how many people from your college get code merged into Kubernetes. Competitive programming is a sport with a fixed number of podium places. Open source is an unbounded backlog.",
  },
  {
    stat: "8.4%",
    // 1,280 not 1,272. Google's May announcement said 1,272; the August final
    // statistics post — which is what we link — says 1,280. Citing one figure while
    // linking a source stating another is the exact failure this section exists to
    // avoid, so the number matches the page it points at.
    line: "GSoC accepted 1,280 of 15,240 applicants in 2025 — not the soft option. The difference is what you are left holding if you do not get in: a rating graph, or commits with your name on them.",
    source: {
      label: "Google Open Source Blog",
      url: "https://opensource.googleblog.com/2025/08/google-summer-of-code-2025-contributor-statistics.html",
    },
  },
  {
    line: "ICPC eligibility runs out: five regional years, two World Finals, and you must still be enrolled. Your commit history has no eligibility clause, and GSoC dropped its student-only requirement in 2022.",
    source: {
      label: "GSoC eligibility change",
      url: "https://opensource.googleblog.com/2021/11/expanding-google-summer-of-code-in-2022.html",
    },
  },
  {
    line: "India now has the largest open-source contributor base in the world. American developers still contribute more per head. That gap is the entire reason this club exists.",
    source: {
      label: "GitHub Octoverse 2025",
      url: "https://github.blog/news-insights/octoverse/octoverse-a-new-developer-joins-github-every-second-as-ai-leads-typescript-to-1/",
    },
  },
];

// TRADE_OFFS — "what we are worse at" — LIVES IN content/positioning.ts, not here.
//
// Both branches of this site carried a copy, and they had drifted: that one has a
// fifth entry about quant and high-frequency trading, where this file's stopped at
// four. A duplicated array is a duplicated array whichever copy is longer, so the
// superset stays and this one is gone rather than being kept "in sync" by hand.
//
// It is still rendered, on the same section it always was — see /positioning on the
// home page, which imports it from content/positioning.ts alongside POSITIONING above.

// ---------------------------------------------------------------------------
// 4. MEMBER STORIES, FIRST PERSON.
//
// First person and unedited, which is the only reason they are worth having. A
// story rewritten in the site's voice is just the site talking about itself.
//
// These render as a rail of testimonial cards rather than a single account — see
// the note at the top of components/MemberStory.tsx for what that costs and what
// keeps the credibility. The one thing it costs HERE: a set of quotes is read as a
// set, so a single vague entry drags the others down with it. Prefer five specific
// stories to six where one says "it was a great learning experience".
//
// `consented` is not optional and not a formality: this publishes a named student's
// own words to an international audience. Set it only after they have read the exact
// text that will ship.
//
// There is no photo field. The slides are text — see the note at the top of
// MemberStory.tsx — so a story needs nothing from /public/people.

export type Story = {
  name: string;
  /**
   * The line under the name: batch, then the programme it led to — "Batch ’27 ·
   * GSoC 2026". Situation at the time of writing, no adjectives.
   */
  situation: string;
  github?: string;
  /**
   * Their own words. Paragraphs, first person. Do not tidy their voice.
   *
   * Written WITHOUT quotation marks: the component opens them on the first
   * paragraph and closes them on the last, so a pair typed here would double up.
   */
  quote: string[];
  /** The verifiable thing the story is about. */
  proof?: { label: string; url: string };
  consented: boolean;
};

// Three, which is exactly MIN_TO_LOOP in MemberStory.tsx — the rail loops, but
// only just. A fourth story is the safest thing you can add to this page.
export const STORIES: Story[] = [
  {
    name: "Kartik Deshpande",
    situation: "Batch ’27 · GSoC 2026",
    quote: [
      "Though I started GSoC prep later than usual, I did not make quick, surface-level PRs. I decided to go deep — truly understanding codebases, maintainer needs, and underlying architecture. That single mindset shift is what got me into GSoC. Open source isn't a race to start first; it's a marathon of building real engineering depth.",
    ],
    consented: true,
  },
  {
    name: "Ojas Maheshwari",
    situation: "Batch ’28 · GSoC 2026",
    quote: [
      "For me, open source is about building real engineering depth, not generating surface-level code. That's why I enforce a strict zero-AI rule across my contributions. When you rely on AI tools to write your PRs, you skip the most critical part of the process — reading documentation, debugging edge cases, and truly understanding the architecture. Open source exists to make us better engineers, not better prompt operators.",
    ],
    consented: true,
  },
  {
    name: "Shubham Kapoor",
    situation: "Batch ’28 · GSoC 2026",
    quote: [
      "My open-source journey was anything but a straight line. Between navigating intense FOMO, handling rejected PRs, and feeling lost in massive codebases, there were countless moments I felt stuck. But instead of walking away, I kept reading docs, fixing broken builds, and submitting code — even when progress felt invisible. Making it to GSoC wasn't luck; it was the result of showing up every day and staying relentless through every single setback.",
    ],
    consented: true,
  },
];

/**
 * Development scaffold. The story block is a looping rail of cards — it cannot be
 * designed, measured or reviewed against an empty array, and a rail in particular
 * needs enough entries to wrap (three; see MIN_TO_LOOP in MemberStory.tsx). Six,
 * because six is the number the rail is designed around.
 *
 * Deliberately NOT plausible: the names are obviously placeholders and the words
 * describe what should be written rather than pretending to be real accounts. And
 * it is gated on NODE_ENV, so a production build cannot ship it by accident.
 *
 * Each entry names a different SHAPE of story, because six cards that are all
 * "my first pull request" is a rail of one story told six times. The set wants
 * range: the first merge, the long wait, the review that stung, the unglamorous
 * work, the paid summer, the one who is now on the other side of the review.
 */
const SCAFFOLD: Story[] = [
  {
    name: "Placeholder A",
    situation: "Replace with their batch and programme — Batch ’29 · GSoC 2027.",
    quote: [
      "Replace this with what the member actually wrote, first person and in their own words. Two or three short paragraphs is the right length for a card.",
      "The useful shape is: what I believed before, the specific thing that went wrong or surprised me, and what is different now. Concrete beats inspiring — name the repo, say how long the review took, quote what the maintainer said.",
    ],
    consented: true,
  },
  {
    name: "Placeholder B",
    situation: "Replace with their batch and programme — Batch ’29 · GSoC 2027.",
    quote: [
      "This slot is for the first merged pull request. The detail that makes it land is usually how small the change was, so let them say that rather than rounding it up.",
      "Attach the pull request itself in `proof`. A card that links to the thing it describes is a different kind of claim from one that does not.",
    ],
    consented: true,
  },
  {
    name: "Placeholder C",
    situation: "Replace with their batch and programme — Batch ’29 · GSoC 2027.",
    quote: [
      "This slot is for the wait. Someone whose patch sat for three weeks before anybody looked at it, and what they thought was happening during those three weeks.",
      "It is the most useful story on the page and the one nobody volunteers, because it does not sound like a success. Ask for it directly.",
    ],
    consented: true,
  },
  {
    name: "Placeholder D",
    situation: "Replace with their batch and programme — Batch ’29 · GSoC 2027.",
    quote: [
      "This slot is for the unglamorous work — triage, a docs fix, a flaky test — and for whoever discovered that maintainers were glad of it.",
      "Keep whatever they say about the boring parts being boring. Editing that out is how this section turns into a brochure.",
    ],
    consented: true,
  },
  {
    name: "Placeholder E",
    situation: "Replace with their batch and programme — Batch ’29 · GSoC 2027.",
    quote: [
      "This slot is for a programme: GSoC, LFX, Outreachy. What the application actually involved, not the announcement.",
      "If they were rejected first and got in the following year, that is the version worth publishing. Most readers of this page will be the person who did not get in.",
    ],
    consented: true,
  },
  {
    name: "Placeholder F",
    situation: "Replace with their batch and programme — Batch ’29 · GSoC 2027.",
    quote: [
      "This slot is for someone now on the other side of it — reviewing pull requests, or maintaining something of their own.",
      "Ending the rail here is deliberate: it is the only card that shows where the first one leads.",
    ],
    consented: true,
  },
];

export function publishedStories(): Story[] {
  const real = STORIES.filter((s) => s.consented);
  if (real.length > 0) return real;
  return process.env.NODE_ENV === "production" ? [] : SCAFFOLD;
}
