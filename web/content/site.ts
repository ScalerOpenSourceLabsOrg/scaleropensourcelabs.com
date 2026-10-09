// Site-wide structure, and the two content lists that every page's chrome reads.
//
// This file exists because the site stopped being one page. Most of it is the
// shape of the thing rather than content: which routes there are, what they are
// called, and where the one persistent action goes. Two consumers read that part
// (Nav and Footer), which is the whole reason it is a module rather than an array
// declared inside the nav — a route that appears in the bar and not in the footer
// is a route half the readers cannot find.
//
// LINKS and INSTITUTIONAL live here rather than in a content module of their own,
// so a component that needs "the site's chrome" has one import instead of three.
// Everything else that is content is split by topic across the rest of content/.

/** Every outbound address the site uses. One copy, so a moved repo is one edit. */
export const LINKS = {
  github: "https://github.com/PRAteek-singHWY",
  security: "/security",
  email: "os_club@sst.scaler.com",
  /** The club's own repo. This site is one of the club's projects. */
  repo: "https://github.com/PRAteek-singHWY/scaleropensourcelabs.com",
  issues:
    "https://github.com/PRAteek-singHWY/scaleropensourcelabs.com/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22",
  contributing:
    "https://github.com/PRAteek-singHWY/scaleropensourcelabs.com/blob/main/CONTRIBUTING.md",
};

// FOR FACULTY, SPONSORS AND MAINTAINERS.
//
// Two of this site's three audiences previously had no real estate at all. An
// anonymous club reads as vaporware to a faculty member and to a maintainer
// simultaneously, so this band exists to be concrete and contactable, and to make
// exactly one ask.
//
// THE ASK IS FOR PEOPLE, NOT MONEY, and it used to be the other thing — a room, a
// projector, a small budget for the domain and refreshments. That version was easy
// to grant and easy to ignore, and it was not what the club actually runs short of:
// almost everyone who leaves leaves in the stretch where nothing works yet. So
// "What we need" now asks for the members who sit through that stretch.
//
// Keep it that way. Put a budget line back and the faculty CTA underneath this band
// stops being an invitation and becomes a funding request, which is a different
// email to a different person.

export const INSTITUTIONAL: { title: string; body: string }[] = [
  {
    title: "What we produce",
    body: "Public, attributable contributions to projects outside the university, plus students selected into internationally competitive mentorship programmes. Every claim on this site links to the upstream record.",
  },
  {
    title: "How we run",
    body: "Weekly working sessions, open to any student, no selection at the door. Mentors are seniors and alumni who have been through the same programmes.",
  },
  {
    title: "What we need",
    body: "People who stay. Almost everyone who quits, quits in the stretch where nothing works and nothing is fun. We need the ones who sit through it, answer the person behind them, and bring one more next term.",
  },
];

/**
 * The pages, in reading order, as the nav and footer render them.
 *
 * THE ORDER IS AN ARGUMENT, not an inventory. It walks a reader who has just
 * arrived through what the club is, then what it has actually produced, and then
 * who is behind it — so that by the time they reach for the Join button at the
 * other end of the bar, every reason to want to has already been made.
 *
 * `/join` is deliberately absent. It is an action rather than a destination, it
 * has its own filled button at the other end of the bar, and listing it here would
 * put the same word in the nav twice.
 *
 * "HOW TO JOIN" IS ALSO ABSENT NOW, AND THAT IS THE SAME ARGUMENT APPLIED TWICE.
 * It was a route in the strip AND a filled button three inches to its right, both
 * carrying the word "join", pointing at two pages that had to divide the one
 * question between them — and the division was invisible from the bar, so a reader
 * with a question about joining had to guess which of the two controls answered it.
 * The button wins, because it is the one every reader already presses: /join now
 * opens with what joining is, the two ways in, and the case for doing it at all.
 *
 * The /how-to-join ROUTE has since gone too: it redirects to /join, which took its
 * FAQ and "who this is not for", and its pull-request loop moved to /guide. /guide
 * is not in this list either — it is somewhere a reader is sent from the home page,
 * not a choice the bar offers — so the footer names it explicitly.
 *
 * SO IS "/". The home page used to sit at the head of this list as "Essence", which
 * put two controls three inches apart in the same bar pointing at the same route —
 * the wordmark and the first link. A wordmark that goes home is a convention every
 * reader already has; a nav item competing with it is just the strip's widest slot
 * spent on the one destination nobody needs help finding. The footer names it
 * explicitly instead, where the row is a site index rather than a set of choices.
 *
 * "EVENTS" SITS SECOND, AND THAT IS A DEPARTURE FROM THE WALKTHROUGH. Everything
 * else in this list is an argument a reader works through in order; Events is the
 * one entry that is time-sensitive, and a date they could still turn up to is worth
 * more to them than the next paragraph of the case. Second rather than first because
 * Projects is what the club IS — somebody who does not yet know that has no reason to
 * care what day it happens on.
 */
export const PAGES = [
  { href: "/projects", label: "Projects" },
  { href: "/events", label: "Events" },
  { href: "/programmes", label: "OS Programmes" },
  { href: "/hall-of-fame", label: "Hall of Fame" },
  { href: "/team", label: "Team" },
] as const;

/** Where every Join button on every page goes. One destination, deliberately. */
export const JOIN_HREF = "/join";

/** Where the members' area is — and, because signing in happens there, where the
 *  chrome names the members' area.
 *
 *  IT IS NOT JOIN_HREF's SIGNED-IN VARIANT, AND THAT IS THE POINT OF THE PAIR. These
 *  are two doors answering two different questions:
 *
 *    JOIN_HREF      the anonymous application form. A stranger asking to join: no
 *                   account, one submission, nothing to read back afterwards.
 *    DASHBOARD_HREF the members' area, which asks who you are and shows you your own
 *                   things. Reached by signing in with a college Google account.
 *
 *  THE PAIR NO LONGER SPLITS THE CHROME IN TWO, and the reason is that JOIN_HREF
 *  stopped being an application form. It is a sign-in card: the same "continue with
 *  your college account" tap for a stranger and for a member of two years, and the
 *  gate forwards anybody who already has a session straight here. So the bar carries
 *  one control rather than two, because two controls an inch apart resolving to the
 *  same act is a choice a reader makes for no reason. The bug this constant was
 *  written to keep fixed — a returning member sent to JOIN_HREF and handed an
 *  application they filled in months ago — is fixed at the destination instead.
 *
 *  The distinction above still holds and is still worth keeping: these are two names
 *  for two things, and a page that means "the members' area" should say
 *  DASHBOARD_HREF even though pressing Join now gets you there too.
 *
 *  A CONSTANT RATHER THAN A STRING, because the marketing chrome still names it in
 *  the footer's route row, and the signed-in shell is built on it throughout. A
 *  rename that moved only one would leave exactly one kind of reader with a dead link
 *  and everybody else fine — which is the half nobody testing the site would click.
 *
 *  Absent from PAGES for the same reason /join is: it is one person's own destination,
 *  reached by signing in rather than browsed to, and the footer names it explicitly
 *  where the row is a site index rather than a set of choices. */
export const DASHBOARD_HREF = "/dashboard";
