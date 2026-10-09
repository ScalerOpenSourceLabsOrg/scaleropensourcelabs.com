// UPSTREAM WORK THE CLUB CAN POINT AT, and the headline figures derived from it.
//
// The rule this file shares with every other module in content/: nothing here may
// be aspirational. A site whose whole argument is "our claims are verifiable"
// cannot carry a number nobody checked, because an international audience includes
// maintainers who will click the link. If you cannot open a URL that proves it, it
// does not go in. See CONTRIBUTING.md.

export type Project = {
  /** "owner/repo" as it appears on GitHub. */
  repo: string;
  url: string;
  /** What the upstream project actually is, in the reader's terms. */
  what: string;
  /** What our member did there. Specific, not "contributed to". */
  did: string;
  /** Who did it. */
  member: string;
  memberUrl?: string;
  /** Optional hard proof: a rank, a count. Only when verified. */
  proof?: { label: string; value: string };
  language?: string;
  /**
   * Card state tag. "security" claims the site's single signal colour, so it is
   * reserved for coordinated-disclosure work rather than applied for emphasis.
   */
  tag?: { label: string; tone: "merged" | "security" | "neutral" };
  /** Set false for entries still being written, so they don't render. */
  published: boolean;
};

/**
 * VERIFIED against the live GitHub API on 2026-07-29 via the contributors
 * endpoint and scoped search counts. These numbers were read from GitHub, not
 * estimated.
 */
export const PROJECTS: Project[] = [
  {
    repo: "OWASP/OpenCRE",
    url: "https://github.com/OWASP/OpenCRE",
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

  // ---- Awaiting real content ----------------------------------------------
  // Add one entry per member contribution, with a URL that proves it. Set
  // published: true only once the numbers have been checked against GitHub.
  // Delete this comment block when the list is real.
];

/**
 * Headline figures. Derived from PROJECTS rather than typed separately, so the
 * summary can never drift from the evidence underneath it.
 */
export function totals() {
  const live = PROJECTS.filter((p) => p.published);
  return {
    projects: live.length,
    members: new Set(live.map((p) => p.member)).size,
    ranked: live.filter((p) => p.proof).length,
  };
}
