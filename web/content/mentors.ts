// MENTORS.
//
// A student mentor is not a professor, and a page that implies otherwise is
// detectable in one line. The programmes that handle peer mentorship credibly all
// redefine authority away from rank: Outreachy states mentor eligibility purely as
// hours committed, GSoC defines a mentor by duty rather than qualification, and
// Recurse Center establishes seniority by naming an artifact, attaching a number,
// and stopping.
//
// So each entry here is: a named artifact, a public link that proves it, an
// explicit boundary on what they are useful for, and a bounded availability. No
// adjectives describing the person. Recency and a checkable record are the honest
// basis of a senior's authority, and they are enough.
//
// On "lifelong mentors": the word never appears. Asserting duration spends it and
// proves nothing. Instead each entry can carry who mentored THEM — after two or
// three cohorts that lineage renders as a visible graph, which demonstrates the
// same thing and cannot be faked.

import type { Programme } from "@/content/programmes";

export type Mentor = {
  name: string;
  /** Present tense, no adjectives. "Final year, CSE." / "Graduated 2024. …" */
  situation: string;
  /** The credential: programme, year, org, and the official public archive link. */
  credential: { programme: Programme; year: string; org: string; url?: string };
  /** One sentence naming a subsystem, not a domain. Links the merged work. */
  shipped: string;
  shippedUrl?: string;
  /** The boundary of their authority. This is what makes the inside believable. */
  askAbout: string[];
  /** A stated commitment, not a disposition. Only publish what will hold. */
  around: string;
  github?: string;
  /** Who taught them. Needs BOTH people's consent — it discloses about both. */
  mentoredBy?: string;
  /** Publication consent, per person. No consent, no entry. */
  consented: boolean;
};

export const MENTORS: Mentor[] = [];

export function publishedMentors(): Mentor[] {
  return MENTORS.filter((m) => m.consented);
}
