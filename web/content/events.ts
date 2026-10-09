// WHAT IS ON, AND WHEN. The two halves of a student's calendar, in one file.
//
// The split is INTERNAL / EXTERNAL and it is not a tidiness decision — it is the
// only question a reader actually has when they open this page:
//
//   INTERNAL  things the club runs. We own the room, the date and the outcome, so
//             we can promise them. Build days, sessions, our own hackathons.
//   EXTERNAL  things other people run — SIH, whatever is live on Unstop — that we
//             think are worth a student's month. We promise nothing about these
//             except that the link is right and the date was right when we wrote
//             it down. Every one of them carries `url`, because a hackathon named
//             without a link is a rumour.
//
// WHY THIS IS A CONTENT FILE AND NOT FIRESTORE, given that the club already has a
// sessions collection with real build days in it (lib/sessions.ts, lib/buildDays.ts).
// Those are the MEMBERS' copy: audience-gated, behind a sign-in, and the thing the
// dashboard reads. This page is addressed to somebody who has not joined yet and is
// deciding whether to turn up, so it is part of the static export like every other
// (site) route — no auth, no spinner, no empty box while a query resolves. The two
// will say the same thing about a given build day; they are aimed at different people.
//
// "IS IT OVER YET" IS DECIDED AT BUILD TIME, from `date`. The site is a static
// export (see next.config.js), so the clock here is the moment of the last deploy,
// not the moment somebody reads the page. That is still better than the hand-set flag
// it replaced: that flag was the only mechanism, and on 7 Oct the page was advertising
// two September build days as "coming up". A build-time clock is right at every
// deploy; a flag is right only when somebody remembers. `done: true` still forces an
// event into the past, and `when` stays the human string as announced.

/** Where an external listing lives. Shown as a tag, so a reader recognises the
 *  platform before they click — Unstop and Devfolio want very different accounts of
 *  you, and that is worth knowing one click early. */
export type Platform = string;

/** Something the club runs.
 *
 *  `kind` drives which group it lands in on the page, and the three values are the
 *  three things we actually put on a calendar. An unrecognised one would silently
 *  drop the event off the page, so it is a closed set. */
export type InternalEvent = {
  /** Stable, kebab-case. The React key and the anchor if one is ever needed. */
  id: string;
  kind: "build-day" | "session" | "hackathon";
  name: string;
  /** Written the way it was announced: "Saturday 4 Oct, 3–6pm", "Every other Saturday".
   *  A human string rather than a timestamp, for the reason in the header note. */
  when: string;
  /** The day it happens, as YYYY-MM-DD. Once the build runs on a later day the event
   *  counts as past without anybody setting `done`. */
  date?: string;
  where?: string;
  /** Who it is for, in the reader's words: "Anyone, no experience needed",
   *  "Beginner track". Left off means everyone. */
  audience?: string;
  /** Two or three sentences at most. What happens in the room, not why the club exists. */
  what?: string;
  /** Free-form tags — tracks, stacks, "Bring a laptop". */
  tags?: string[];
  /** Where to go next. Internal routes are fine here. */
  href?: string;
  cta?: string;
  /** It has happened. Kept on the page, greyed, rather than deleted — a club with a
   *  visible past is more convincing than one that only ever advertises. */
  done?: boolean;
};

/** Something somebody else runs, that we are pointing at. */
export type ExternalEvent = {
  id: string;
  name: string;
  /** Who is actually running it. "Ministry of Education, Govt. of India". */
  host: string;
  /** "Unstop", "Devfolio", "MLH" — wherever the link goes. */
  platform?: Platform;
  /** The event window, as the organisers state it. */
  when: string;
  /** The date that actually costs a reader something if they miss it. Shown loud. */
  registerBy?: string;
  what?: string;
  /** Who can enter — year, team size, whatever the rule is. */
  eligibility?: string;
  /** REQUIRED. An external event without a link is a rumour, so the type will not
   *  let one exist. Unstop URLs go here verbatim. */
  url: string;
  /** Prize, stipend, or what the winner actually gets. Optional and often absent. */
  prize?: string;
  tags?: string[];
  /** Registration has closed or the event is over. */
  done?: boolean;
};

// ---------------------------------------------------------------------------
// INTERNAL. Ours.
//
// PASTE ROWS HERE. The shape, with everything optional filled in:
//
//   {
//     id: "build-day-oct-04",
//     kind: "build-day",
//     name: "Build Day #7",
//     when: "Saturday 4 Oct, 3–6pm",
//     where: "Lab 2, SST campus",
//     audience: "Anyone. No experience needed.",
//     what: "Three hours, three tracks, and a mentor per table. You leave with a pull request open on something real.",
//     tags: ["Beginner", "Intermediate", "Advanced"],
//     href: "/join",
//     cta: "Come to the next one",
//   },

export const INTERNAL_EVENTS: InternalEvent[] = [
  // ORDER IS EDITORIAL, per the reader note below: the next one a student can turn
  // up to leads, and the one that has happened sits last so the file reads the way
  // the page does. Past or not comes from `date` — see the header note.
  {
    id: "build-day-oct-09",
    kind: "build-day",
    name: "Build day",
    when: "Friday 9 Oct, 10pm–12am",
    date: "2026-10-09",
    href: "/join",
    cta: "Come to this one",
  },
  {
    id: "build-day-sep-25",
    kind: "build-day",
    name: "Build day",
    when: "Friday 25 Sep, 10pm–12am",
    date: "2026-09-25",
    href: "/join",
    cta: "Come to the next one",
  },
  {
    id: "build-day-oct-01",
    kind: "build-day",
    name: "Build day",
    when: "Thursday 1 Oct, 10pm–12am",
    date: "2026-10-01",
    href: "/join",
    cta: "Come to the next one",
  },
  {
    id: "build-day-sep-18",
    kind: "build-day",
    name: "Build day",
    when: "Friday 18 Sep, 10pm–12am",
    date: "2026-09-18",
  },
];

// ---------------------------------------------------------------------------
// EXTERNAL. Everyone else's.
//
// THE BAR FOR A ROW HERE is that a student from this college could plausibly win
// something by entering, and that we have checked the link resolves. It is not a
// noticeboard for every hackathon on the internet — that list exists, it is Unstop's
// homepage, and a club that reprints it adds nothing.
//
// PASTE ROWS HERE:
//
//   {
//     id: "sih-2026",
//     name: "Smart India Hackathon 2026",
//     host: "Ministry of Education, Govt. of India",
//     platform: "MIC",
//     when: "Internal round Sep, grand finale Dec",
//     registerBy: "Internal submissions close 20 Sep",
//     what: "Problem statements posted by ministries and PSUs. Teams of six, one nominated leader, and the internal college round comes first.",
//     eligibility: "Teams of 6 + 2 reserves, at least one woman per team",
//     url: "https://www.sih.gov.in/",
//     prize: "₹1,00,000 per winning team",
//     tags: ["Government", "Team of 6"],
//   },

export const EXTERNAL_EVENTS: ExternalEvent[] = [];

// ---------------------------------------------------------------------------
// Readers. Both pages and the page's own headings go through these, so "what is
// still on" is decided in one place.

/** Today in the club's timezone, as YYYY-MM-DD, so it compares directly with `date`.
 *  en-CA formats as ISO. An event is past from the day AFTER its date. */
const today = () =>
  new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });

const isPast = (e: InternalEvent) =>
  e.done === true || (e.date !== undefined && e.date < today());

/** Everything still ahead of us, in the order the file lists it. Order is editorial:
 *  the thing the club most wants a reader to turn up to goes first. */
export const upcomingInternal = () => INTERNAL_EVENTS.filter((e) => !isPast(e));
/** Most recent first. Returned with `done` set, because that is what the card reads
 *  to grey itself and drop its "Come to the next one" action. */
export const pastInternal = () =>
  INTERNAL_EVENTS.filter(isPast)
    .map((e) => ({ ...e, done: true }))
    .sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""));

/** The club's own events, split the way the page groups them. */
export const internalOfKind = (kind: InternalEvent["kind"]) =>
  upcomingInternal().filter((e) => e.kind === kind);

export const openExternal = () => EXTERNAL_EVENTS.filter((e) => !e.done);
export const closedExternal = () => EXTERNAL_EVENTS.filter((e) => e.done);

/** Is there anything at all to show? Used to choose between the page's real content
 *  and its holding state, so an empty file renders as "dates are coming" rather than
 *  as four empty headings — which reads as a broken page, not a quiet month. */
export const hasEvents = () => INTERNAL_EVENTS.length + EXTERNAL_EVENTS.length > 0;
