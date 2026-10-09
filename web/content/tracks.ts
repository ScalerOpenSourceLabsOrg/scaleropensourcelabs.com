// THE THREE TRACKS, and the sequence a newcomer actually follows.
//
// Not to be confused with PATHS in content/join.ts. Those are the named ways in
// that the join form and the member roster look records up against; PATH below is
// the four steps of a first contribution, and it is prose on /how-to-join.

import { LINKS } from "@/content/site";

export type Track = {
  /** Rendered as two lines, the second in the track's own tint. */
  name: { lead: string; trail: string };
  summary: string;
  detail: string;
  /**
   * Which colour the card wears. A key rather than a hex: the two values behind
   * it (a soft fill and an ink that is legible on it) have to invert between
   * themes, so they live in globals.css as .tint-* and only the name travels
   * through the content file. See the .tint block there.
   */
  tint: "blue" | "mint" | "violet";
  /** Three at most — they are a scan aid on the card, not a taxonomy. */
  tags: string[];
  /**
   * The dark frame at the foot of each card. Ordinary commands anybody can run,
   * never simulated output: a fabricated `46 files changed` beside real
   * contribution figures elsewhere on this page would be indistinguishable from
   * a claim. Same rule as the code frames in the culture bento.
   */
  preview: { title: string; lines: { kind: "cmd" | "out"; text: string }[] };
  cta?: { label: string; href: string; external?: boolean };
};

export const TRACKS: Track[] = [
  {
    name: { lead: "Mentored", trail: "contribution" },
    summary: "Where almost everyone starts.",
    detail:
      "A mentor who has already landed work upstream helps you pick a project that needs help, find an issue sized for a first attempt, and review the patch before a maintainer sees it. The goal is your second contribution.",
    tint: "blue",
    // "Beginner" rather than "Beginner friendly": three pills have to hold ONE line
    // at a third of an 80rem grid, and the longer phrase wrapped — which pushed this
    // card's code frame a line higher than the other two and broke the row.
    tags: ["Beginner", "Mentor review", "First PR"],
    preview: {
      title: "first-patch",
      lines: [
        { kind: "cmd", text: "git switch -c fix/broken-link" },
        { kind: "out", text: "# small first, always" },
        { kind: "cmd", text: "gh pr create --fill" },
        { kind: "out", text: "# then read the review" },
      ],
    },
    cta: { label: "How it goes", href: "/how-to-join#path" },
  },
  {
    name: { lead: "AI", trail: "security" },
    summary: "Higher difficulty. The work most likely to get you noticed.",
    detail:
      "Open-source AI tooling shipped fast and is now load-bearing. Members find real weaknesses — credentials in model configs, checkpoints that execute code on load, agent frameworks letting untrusted input reach a shell — and land the fix upstream.",
    tint: "mint",
    tags: ["Disclosure", "Model configs", "Harder"],
    preview: {
      title: "audit",
      lines: [
        { kind: "cmd", text: 'grep -rn "api_key" configs/' },
        { kind: "out", text: "# secrets get committed by accident" },
        { kind: "cmd", text: "cat SECURITY.md" },
        { kind: "out", text: "# report privately, never in an issue" },
      ],
    },
    cta: { label: "Where it lands", href: "/hall-of-fame" },
  },
  {
    name: { lead: "Club", trail: "engineering" },
    summary: "Software the club owns and runs.",
    detail:
      "This site is one of them, and it is open source. Working here is the lowest-friction way to get a first merged pull request, because the maintainer reviewing it is someone you can talk to in person.",
    tint: "violet",
    tags: ["This site", "Next.js", "Lowest friction"],
    preview: {
      title: "this-site",
      lines: [
        { kind: "cmd", text: "git clone …/scaleropensourcelabs.com" },
        { kind: "cmd", text: "npm install && npm run dev" },
        { kind: "out", text: "# localhost:3000, then open a PR" },
      ],
    },
    cta: { label: "The repo", href: LINKS.github, external: true },
  },
];

/** Where a newcomer actually starts. Ordered, because it is a sequence. */
export const PATH: { step: string; body: string }[] = [
  {
    step: "Pick a project that needs help",
    body: "Not the most famous one. A project with open issues, a responsive maintainer, and a test suite that runs on your machine.",
  },
  {
    step: "Find an issue sized for a first attempt",
    body: "A failing edge case, a documentation gap, a small refactor. Unglamorous work does get merged; that's how you start.",
  },
  {
    step: "Get it reviewed before you send it",
    body: "Your mentor reads the patch first, so the version a maintainer opens is already close to mergeable.",
  },
  {
    step: "Then do it again",
    body: "The first contribution is the hard one. Everything after it compounds, because you already know where things live.",
  },
];
