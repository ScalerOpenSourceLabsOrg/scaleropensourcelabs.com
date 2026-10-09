// PROJECTS — two fields, not three.
//
// They answer different questions, and keeping them apart is what stops the most
// valuable one getting diluted:
//
//   OURS        "what could I work on, and who reviews it?"   — join-able now
//   IN THE WILD "has anyone here landed code elsewhere?"      — the real proof
//
// BUILD DAYS AND CLUB REPOS USED TO BE TWO SECTIONS and are now one. The split was
// a distinction the club could see and a reader could not: both are our own
// repositories, both are picked up on a build day, both are reviewed by somebody
// you can find in the lab. What it produced in practice was a page whose first
// section was an empty-state placeholder while the one genuinely clickable
// repository sat below the fold in a second section. One list, ordered so the
// things running right now come first.
//
// ---------------------------------------------------------------------------
// WHY THERE ARE NO ORG LOGOS on the upstream cards.
//
// Two reasons, either sufficient. First, an organisation's logo is its trademark,
// and putting OWASP's or Kubernetes' mark on a club page implies an endorsement
// nobody granted — the same rule this site already applies to programme logos.
// Second, the Content-Security-Policy in next.config.js sets `img-src 'self'
// data:`, so a remote logo would be blocked at the browser and render as a broken
// image. The org name set in mono inside a bordered plate says the same thing,
// is ours to use, and cannot 404.

// ---------------------------------------------------------------------------
// 1a. BUILD DAY PROJECTS — what is running right now. Rendered first in the one list.
//
// The gate here is `published`, and it means something specific: the "good first
// issue" link must actually resolve to open issues. A build-day card promising a
// beginner-sized task and linking to an empty list is worse than no card, because
// the person who clicks it concludes the club is dormant.

export type BuildDayProject = {
  name: string;
  /** ONE line. The problem it solves, in the reader's terms, not the architecture. */
  problem: string;
  stack: string[];
  /** Who to actually talk to on the day. A name, not a role. */
  maintainer: string;
  maintainerGithub?: string;
  repo?: string;
  /** Must resolve to genuinely open, genuinely beginner-sized issues. */
  goodFirstIssue?: string;
  /** How many people are on it, so a reader can judge whether to join. */
  size?: string;
  published: boolean;
};

export const BUILD_DAY: BuildDayProject[] = [
  // ---- Awaiting real content ---------------------------------------------
  // One entry per project actually running in build days. Before setting
  // `published: true`, open the goodFirstIssue link yourself and confirm it lists
  // open issues a first-timer could take.
];

// A single holding card, not three fake ones. Three placeholders read as three
// projects at a glance and only reveal themselves as filler on a second look; one
// card that says exactly what it is tells the truth immediately. Every optional
// field is left off on purpose — the card renderer skips the rows it has no data
// for, so there are no empty "Maintainer" labels underneath.
const BUILD_DAY_SCAFFOLD: BuildDayProject[] = [
  {
    name: "To be updated",
    problem: "",
    stack: [],
    maintainer: "",
    published: true,
  },
];

export function publishedBuildDay(): BuildDayProject[] {
  const real = BUILD_DAY.filter((p) => p.published);
  if (real.length > 0) return real;
  return process.env.NODE_ENV === "production" ? [] : BUILD_DAY_SCAFFOLD;
}

// ---------------------------------------------------------------------------
// 1b. CLUB REPOS — the software the club owns and runs. Rendered in the same list,
// underneath the build days.
//
// This site is one of them, and it is the honest flagship: a real repository, with
// a real CONTRIBUTING.md, a real good-first-issue label, and a maintainer a member
// can find in person. That last part is why it is the lowest-friction first merged
// pull request available to anybody reading this page.

export type ClubRepo = {
  name: string;
  repo: string;
  what: string;
  /** Why a beginner specifically should start here. */
  whyStartHere?: string;
  stack: string[];
  goodFirstIssue?: string;
  contributing?: string;
  /** Roughly how long it has been running. Not a version number. */
  since?: string;
  published: boolean;
};

export const CLUB_REPOS: ClubRepo[] = [
  {
    name: "scaleropensourcelabs.com",
    repo: "https://github.com/PRAteek-singHWY/scaleropensourcelabs.com",
    // "no database and no backend" was true until the join form started writing to
    // Firestore, and this site's whole argument is that every claim on it is checkable.
    // A stale boast is the one kind of copy this page cannot carry.
    what:
      "This website. Next.js, with all the content in typed arrays — adding a person or project is a one-file edit.",
    whyStartHere:
      "The easiest first PR around: your reviewer's in the lab. CONTRIBUTING.md is written for total first-timers.",
    stack: ["TypeScript", "Next.js", "Tailwind", "Playwright"],
    goodFirstIssue:
      "https://github.com/PRAteek-singHWY/scaleropensourcelabs.com/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22",
    contributing:
      "https://github.com/PRAteek-singHWY/scaleropensourcelabs.com/blob/main/CONTRIBUTING.md",
    published: true,
  },
  {
    name: "authzprobe",
    repo: "https://github.com/ScalerOpenSourceLabsOrg/authzprobe",
    what:
      "A CLI that takes an OpenAPI spec and two logins, and checks whether one can reach the other's data — the BOLA and BFLA bugs topping the OWASP API Security Top 10.",
    whyStartHere:
      "`npm run demo` hits a deliberately broken server, so you see real findings first. Issues are labelled starter, intermediate or ambitious.",
    stack: ["TypeScript", "Node", "Vitest", "Docker"],
    goodFirstIssue:
      "https://github.com/ScalerOpenSourceLabsOrg/authzprobe/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22",
    contributing:
      "https://github.com/ScalerOpenSourceLabsOrg/authzprobe/blob/main/CONTRIBUTING.md",
    published: true,
  },
  {
    name: "osc-learners",
    repo: "https://github.com/ScalerOpenSourceLabsOrg/osc-learners",
    what:
      "The Learners Wall: a searchable grid of member cards. Plain HTML and CSS — open index.html and see your change.",
    whyStartHere:
      "Perfect for your very first PR: your card is one image and one block of HTML, so git is the only new thing.",
    stack: ["HTML", "CSS"],
    // No goodFirstIssue link on purpose: the repo carries the label but had no
    // open issues under it when this card went up, and the rule at the head of
    // this file is that the link must resolve to something takeable. Add it the
    // day there are issues behind it.
    contributing:
      "https://github.com/ScalerOpenSourceLabsOrg/osc-learners/blob/main/CONTRIBUTING.md",
    published: true,
  },
  {
    name: "podium",
    repo: "https://github.com/ScalerOpenSourceLabsOrg/podium",
    what:
      "Run a hackathon end to end — and judge it fairly. Every judge scores a shared anchor set, so a harsh marker can't sink a good team.",
    whyStartHere:
      "One `npm run seed` and you're logged in with no password. A real full-stack app, with the architecture written up in /docs.",
    stack: ["TypeScript", "Next.js", "Prisma", "PostgreSQL"],
    // No goodFirstIssue link yet: zero open issues under the label when this
    // card went up. Same rule as osc-learners — add it once there are some.
    contributing:
      "https://github.com/ScalerOpenSourceLabsOrg/podium/blob/main/CONTRIBUTING.md",
    published: true,
  },
  // ---- Awaiting real content ---------------------------------------------
  // Add the club's other long-running repos here as they exist. Same rule: a
  // repository somebody can open, not a plan for one.
];

export function publishedClubRepos(): ClubRepo[] {
  return CLUB_REPOS.filter((r) => r.published);
}

// ---------------------------------------------------------------------------
// THE ONE LIST THE PAGE ACTUALLY RENDERS.
//
// Both shapes above collapse into this. It is a superset rather than a lowest
// common denominator: a club repo keeps its CONTRIBUTING.md and its repo link, a
// build-day project keeps its maintainer and its team size, and the card renderer
// skips every row it has no data for. Nothing had to be thrown away to merge the
// two sections.
//
// `clubMaintained` is the only flag, and it exists because the difference is still
// worth one word on a card even though it is not worth a section: it tells a
// reader which repositories will still be here next term.

export type ProjectCard = {
  name: string;
  /** ONE line. The problem it solves, in the reader's terms, not the architecture. */
  problem: string;
  stack: string[];
  /** Who to actually talk to. A name, not a role. */
  maintainer?: string;
  maintainerGithub?: string;
  repo?: string;
  goodFirstIssue?: string;
  contributing?: string;
  /** Why a beginner specifically should start here. */
  whyStartHere?: string;
  /** How many people are on it, so a reader can judge whether to join. */
  size?: string;
  clubMaintained?: boolean;
};

function fromBuildDay(p: BuildDayProject): ProjectCard {
  return {
    name: p.name,
    problem: p.problem,
    stack: p.stack,
    // Empty strings in the scaffold entry must not reach the card as empty rows.
    maintainer: p.maintainer || undefined,
    maintainerGithub: p.maintainerGithub,
    repo: p.repo,
    goodFirstIssue: p.goodFirstIssue,
    size: p.size,
  };
}

function fromClubRepo(r: ClubRepo): ProjectCard {
  return {
    name: r.name,
    problem: r.what,
    stack: r.stack,
    repo: r.repo,
    goodFirstIssue: r.goodFirstIssue,
    contributing: r.contributing,
    whyStartHere: r.whyStartHere,
    clubMaintained: true,
  };
}

/**
 * Build-day projects first, then the club's own repositories. That order is the
 * point of the merge: what is running this Saturday leads, and the long-lived
 * repositories are the backstop for somebody reading on a Tuesday.
 *
 * The holding card only appears when the combined list is empty, which — unlike
 * the old split — means it stays hidden for as long as the club maintains a single
 * public repository.
 */
export function publishedProjects(): ProjectCard[] {
  const cards = [
    ...BUILD_DAY.filter((p) => p.published).map(fromBuildDay),
    ...publishedClubRepos().map(fromClubRepo),
  ];
  if (cards.length > 0) return cards;
  return process.env.NODE_ENV === "production"
    ? []
    : BUILD_DAY_SCAFFOLD.map(fromBuildDay);
}

// ---------------------------------------------------------------------------
// 2. MEMBER CONTRIBUTIONS IN THE WILD — the strongest thing on this page.
//
// Code that a maintainer who owes us nothing agreed to merge into a project we do
// not control. Everything else here is work we assigned ourselves.
//
// VERIFIED against the live GitHub API on 2026-07-29 via the contributors endpoint
// and scoped search counts. These numbers were read from GitHub, not estimated.
// Re-check before quoting them anywhere else, because they move.

export type Upstream = {
  /** "owner/repo" as it appears on GitHub. */
  repo: string;
  url: string;
  /** The organisation, rendered as type. See the note on logos above. */
  org: string;
  /** What the upstream project actually is, in the reader's terms. */
  what: string;
  /** What our member did there. Specific — never "contributed to". */
  did: string;
  member: string;
  memberUrl?: string;
  /** Link to the merged work itself, when there is one PR to point at. */
  prUrl?: string;
  /** Hard proof: a rank, a count. Only when verified against the source. */
  proof?: { label: string; value: string };
  language?: string;
  /** Card state tag. "security" claims the site's single signal colour, so it is
      reserved for coordinated-disclosure work rather than applied for emphasis. */
  tag?: { label: string; tone: "merged" | "security" | "neutral" };
  published: boolean;
};

export const UPSTREAM: Upstream[] = [
  {
    repo: "OWASP/OpenCRE",
    url: "https://github.com/OWASP/OpenCRE",
    org: "OWASP",
    what:
      "OWASP's Common Requirement Enumeration — the open catalogue that maps security standards to each other.",
    did:
      "Second-highest contributor by commits on the default branch, out of forty. 74 pull requests opened, 46 merged.",
    member: "Prateek Singh",
    memberUrl: "https://github.com/PRAteek-singHWY",
    proof: { label: "Contributor rank", value: "#2 / 40" },
    language: "Python",
    tag: { label: "46 merged", tone: "merged" },
    published: true,
  },
  // ---- Awaiting real content ---------------------------------------------
  // One entry per member contribution, with a URL that proves it. Set
  // published: true only once the numbers have been checked against GitHub.
];

export function publishedUpstream(): Upstream[] {
  return UPSTREAM.filter((p) => p.published);
}

/**
 * Headline figures, DERIVED from the lists rather than typed separately, so a
 * summary can never drift from the evidence underneath it. This is the mechanism
 * that makes the numbers strip on the home page safe: there is no second place to
 * edit, so there is nothing to forget to update.
 */
export function projectTotals() {
  const upstream = publishedUpstream();
  const repos = publishedClubRepos();
  const buildDay = publishedBuildDay();

  // Merged PRs are only counted where a tag states a verified count. Parsing the
  // tag rather than keeping a second number is deliberate: one source of truth,
  // and an entry with no verified count contributes nothing instead of guessing.
  const merged = upstream.reduce((n, u) => {
    const m = u.tag?.label.match(/^(\d+)\s+merged$/);
    return n + (m ? Number(m[1]) : 0);
  }, 0);

  return {
    upstreamRepos: upstream.length,
    clubRepos: repos.length,
    activeProjects: buildDay.length + repos.length,
    merged,
    contributors: new Set(upstream.map((u) => u.member)).size,
    orgs: new Set(upstream.map((u) => u.org)).size,
  };
}
