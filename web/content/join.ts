// THE WAYS IN — named entry paths, each written to one kind of reader.
//
// The reason there is more than one "join us" button: the single biggest reason
// people do not join a technical club is not lack of interest, it is not knowing
// which version of themselves the invitation is addressed to. A first-year who has
// never used Git and a third-year with merged PRs in a CNCF project both bounce off
// the same generic call to action, for opposite reasons.
//
// TWO OF THESE ARE THE FRONT DOOR AND THE REST ARE NOT — see ENTRY_PATH_IDS at the
// foot of the list. /join offers exactly two ways in, because a stranger choosing
// between five is a stranger who closes the tab; the others stay in this array
// because they are real routes people took, they are what the onboarding form and
// the admin roster look member records up against, and deleting an id here would
// turn every profile carrying it into an unlabelled row.
//
// So each path states three things, and the third is the one most club pages skip:
//   WHO IT IS FOR      — an honest filter, so people self-select correctly
//   WEEK ONE           — literally what happens on the first day and the first week
//   WHAT YOU WALK AWAY WITH — the outcome, stated as an artefact, not a feeling
//
// "What you walk away with" is deliberately concrete and modest. "Confidence" is
// not an outcome; "your first merged pull request, and a repo you can build on your
// own machine" is one, and it is checkable a fortnight later.

export type Level = "beginner" | "intermediate";

export type Path = {
  /** Stable id. Used by the nav anchors and by the join form's preselect. */
  id: string;
  name: string;
  level: Level;
  /** The one-line pitch. */
  tagline: string;
  forWho: string;
  /** What the first day and first week actually look like. Specific. */
  weekOne: string[];
  /** The artefact you hold at the end. */
  walkAway: string;
  /** Anything they must bring. Kept honest and short. */
  bring?: string;
  /** An optional caveat or clarification about how this path actually runs. */
  note?: string;
};

export const PATHS: Path[] = [
  {
    id: "build-day",
    name: "Build days",
    level: "beginner",
    tagline: "One evening. One senior sitting next to you. A branch by the end of it.",
    forWho:
      "Never contributed? Barely touched Git? Not sure you belong? This one's for you — it's how most of us started.",
    weekOne: [
      "Just turn up. Nothing to install — we do the setup with you.",
      "You're paired with someone who's already landed work upstream, sitting right next to you.",
      "Together you pick one real issue and read the code around it. Reading is most of the work.",
      "You leave with a branch and a change. Merged tonight or not, doesn't matter.",
    ],
    walkAway:
      "A real project running on your laptop, a branch with a real change, and someone to message when you're stuck.",
    bring: "A laptop and a GitHub account. That's it.",
    /* The pairing is the whole mechanism, so it is stated as a constraint rather
       than left as an aspiration: a build day that fills up with beginners and no
       seniors is the failure mode this note exists to name. */
    note:
      "Pairs are planned ahead, so sign-ups close before the day.",
  },
  {
    id: "hackathon",
    name: "Hackathons",
    level: "beginner",
    tagline: "Thirty people stuck on the same problems in the same room. Nothing is ranked.",
    forWho:
      "A bigger build day. For anyone who's bounced off open source alone at midnight, or found judged hackathons exhausting.",
    weekOne: [
      "Come for the whole day, nothing prepared. The first hour is thirty people beating the same install errors together.",
      "Pick from our shortlist of real repos with real maintainers.",
      "Seniors float around. Asking out loud is expected.",
      "Everyone shows what they got to — stack traces count too.",
    ],
    walkAway:
      "A day of open source in good company, a PR open or nearly there, and a room that knows your name.",
    bring: "A laptop, a GitHub account, and the whole day.",
    /**
     * Hackathons are called out as an ON-RAMP rather than as a competition, and that
     * distinction is the reason this path works for somebody who has never opened a
     * pull request. A hackathon you are judged at is a bad first experience of open
     * source; a hackathon where you sit next to a senior and land one small patch is
     * the best one available.
     */
    note:
      "No judges, no rankings. Just thirty people getting unstuck together.",
  },
  {
    id: "first-contribution",
    name: "First contribution sprint",
    level: "beginner",
    tagline: "A checklist, a club repo, and a reviewer who knows you are new.",
    forWho:
      "You want a merged PR with your name on it, and you'd rather follow a list. Docs fixes, typos and good-first-issues on our own repos — where your reviewer is just down the hall.",
    weekOne: [
      "Grab the checklist: fork, clone, build, find a good-first-issue, claim it in a comment.",
      "Make the change. A docs typo totally counts.",
      "Your mentor reviews it first, so it's nearly mergeable before a maintainer sees it.",
      "Open the PR, and learn that review comments aren't criticism.",
    ],
    walkAway:
      "One merged PR under your name, and fork, branch, PR, review, merge done once — so it stops being scary.",
    bring: "A laptop, a GitHub account, and about four hours across the week.",
  },
  {
    id: "fast-track",
    name: "Fast-track",
    level: "intermediate",
    tagline: "Already contributing somewhere? Show us the PRs and skip the ramp.",
    forWho:
      "Already have merged work somewhere, however small? Skip the Git intro — send the links and join a project team.",
    weekOne: [
      "Send your merged PR links. Not a resume — we want the diffs.",
      "A twenty-minute chat about what you want to work on.",
      "Join a project team with work that's actually yours.",
      "Start reviewing patches in week one — we need reviewers even more than contributors.",
    ],
    walkAway:
      "Real work to own, and a say in what we build. Folks here tend to end up maintaining something.",
  },
  {
    id: "program-track",
    name: "Program track",
    level: "intermediate",
    tagline: "The GSoC/LFX prep cohort, with mentors who have been through it.",
    forWho:
      "Aiming at GSoC, LFX or Outreachy, and not keen on writing the proposal the week it's due? Join six months early — for GSoC, that's autumn.",
    weekOne: [
      "Pick two target orgs. Two, because nobody reliably gets their first choice.",
      "Read both contribution guides and build both codebases locally.",
      "Find a small issue in each. Goal: a merged patch in both, so maintainers know your username by March.",
      "Join the weekly cohort, where people read your proposal and tell it to you straight.",
    ],
    /* "mentors who wrote a successful one recently" used to be the tail of this
       sentence, and it was the most valuable thing on the page hiding in a
       subordinate clause. It is now the named bench under this path — six faces,
       six organisations — so this line stops asserting it and points at it
       instead. Keep the claim in one place: if the bench changes, nothing here
       has to. */
    walkAway:
      "Months of commits in two orgs before applications open, a proposal that's already been torn apart, and the mentors below — who were where you are a year ago.",
  },
];

// ---------------------------------------------------------------------------
// THE MENTOR BENCH ON THE PROGRAM TRACK.
//
// This is the club's single strongest claim and it was previously made in one
// subordinate clause — "mentors who wrote a successful one recently", at the end
// of the fourth path's walkAway. Nobody buys the most important fact on a page
// from a relative clause. So the path now carries a named list, rendered as faces
// under the path itself: six people, every one of them selected into a paid
// programme, at six different organisations.
//
// NO FACT HERE IS WRITTEN TWICE. The photograph, the programme, the year, the
// organisation and the club office are all read out of the club's own lists at
// render time (see content/lookup.ts). This file holds the two things those lists
// have no place for: WHO mentors this track, and one line on what they actually
// built. So a card here cannot drift into crediting somebody to the wrong
// organisation, and adding a seventh mentor is a name plus a sentence.
//
// WHAT A BLURB IS ALLOWED TO SAY, because this is the one field on the bench that
// is prose rather than a lookup, and prose is where a page starts flattering
// people. Three rules, and they are the ones the Mentor type in content/mentors.ts was
// already written under:
//
//   1. EVERY CLAIM CAME FROM THE PERSON. These are compressed from what each
//      mentor supplied about themselves. Nothing is inferred, rounded up, or
//      filled in from the organisation's reputation.
//   2. NO ADJECTIVES ABOUT THE HUMAN. "Passionate", "talented", "brilliant" —
//      none of it survives contact with a reader deciding whether to trust the
//      club. The specifics attach to things instead: a count of merged pull
//      requests, a named subsystem, a threshold in a pipeline.
//   3. THIRD PERSON. They arrived as first-person bios, which is the right voice
//      for a CV and the wrong one under a name already set in bold two lines
//      above — "Hi, I'm Shubham Kumar" under a heading reading "Shubham Kumar"
//      reads as a form somebody filled in.
//
// A mentor with no blurb renders without one rather than with a hedge. An empty
// slot is a prompt to go and ask them; "details to follow" is a sentence nobody
// needed to read.
//
// SPELLING IS THE JOIN KEY, so a name here has to match content/selections.ts exactly.
// spelt the way the club's own cohort list spells it, including "Vansh Dobhal",
// which is worth noting because it gets written "Dhobal" about as often. A name
// that fails to match still renders — as a card with no credential under it,
// which is a visible prompt to fix the spelling rather than a person silently
// missing from the bench.
//
// Order is the club's, not alphabetical and not a ranking.
export type BenchMentor = {
  /** Must match content/selections.ts exactly — it is the key every other fact is
   *  looked up by. */
  name: string;
  /** One or two sentences on what they built. See the three rules above. */
  blurb?: string;
};

export const PROGRAM_TRACK_MENTORS: BenchMentor[] = [
  {
    name: "Shubham Kumar",
    /* The selection is the smaller half of this and the number is the larger one,
       so the number leads. Deliberately silent on WHEN he was selected: he
       describes getting in during his second year, and the cohort list files him under
       GSoC 2026 as a third-year, which cannot both be true. The card prints the
       roster's answer in the chip and this line does not argue with it — one of
       the two needs correcting at source rather than papering over here. */
    blurb:
      "230+ merged pull requests into Mifos — the record a maintainer reads first.",
  },
  {
    name: "Piyush Goenka",
    /* Compressed hard, and the cuts are worth recording so nobody restores them
       thinking they were missed: a second hackathon win, a fourth project, and
       the full list of maintainer duties are all gone. What is left is one shipped
       subsystem, one promotion with a time on it, and one win with a field size on
       it. A card that lists everything a person has done reads as a CV, and a CV
       is the one document nobody on this page came to read. */
    blurb:
      "Shipping HTTP chunked transfer and streaming across Iodine and the Rage framework. Contributor to maintainer at Palisadoes in three months, and first of a thousand teams at Smart India Hackathon 2025.",
  },
  {
    name: "Kumar Amityush",
    /* The year of study is the point of this one, and it is the fact the chip
       does not carry — so the sentence leads with it. He is also the Mentorship
       Lead, which the card already prints on its own line out of content/team.ts. */
    blurb:
      "In GSoC as a second-year, on OpenAstronomy's data-analysis and visualisation tooling. The six-month runway is a default, not a rule.",
  },
  {
    name: "Prateek Singh",
    /* Named subsystem, named mechanism, named threshold. This is the level of
       specificity the whole block is arguing for: "works on AI safety" is a
       domain and proves nothing, "anything under 0.80 goes to a human" is a
       decision somebody had to make and defend. */
    blurb:
      "Builds The Librarian, OpenCRE's link-decision engine — anything under 0.80 confidence goes to a human. 90+ merged commits, second-highest in the repo.",
  },
  {
    name: "Vansh Dobhal",
    /* NO BLURB SUPPLIED YET. Left empty rather than written out of the
       organisation's name, which would produce a sentence that is true of HPX and
       unverifiable about him. The card renders without it. */
  },
  {
    name: "Raj Prakash",
    /* The one entry whose work reaches somebody outside a repository, which is
       why its second sentence is allowed to point at that rather than at another
       number. */
    blurb:
      "Built the audit-log dashboard clinicians and hospitals read in OpenMRS.",
  },
];

/** The one path the bench above is attached to. Named rather than compared
 *  against the string inline, so the list and the renderer agree. */
export const MENTORED_PATH_ID = "program-track";

/** The two paths /join offers a stranger, in the order it offers them.
 *
 *  A LIST OF IDS RATHER THAN A FLAG ON Path, and rather than a `.slice(0, 2)` at
 *  the render site. A flag invites a third path to set it and quietly make the
 *  front door a three-way choice; a slice makes the front door depend on array
 *  order, so reordering PATHS for any other reason silently changes what a
 *  stranger is offered. Two ids written down is the version that has to be edited
 *  on purpose.
 *
 *  They are both `beginner` and that is deliberate: the reader this page is
 *  written for has not contributed before. Somebody who has does not need to be
 *  sorted at the door — they read the case below it, sign in, and say so on the
 *  onboarding form, which still offers every path in the array. */
export const ENTRY_PATH_IDS = ["build-day", "hackathon"] as const;

/** ENTRY_PATH_IDS resolved, in that order. Throws nothing and skips nothing: an id
 *  with no matching path is dropped, so a typo costs one card rather than the page. */
export const ENTRY_PATHS: Path[] = ENTRY_PATH_IDS.map((id) =>
  PATHS.find((p) => p.id === id),
).filter((p): p is Path => Boolean(p));

export const LEVEL_LABEL: Record<Level, string> = {
  beginner: "Never contributed before",
  intermediate: "Some experience already",
};

// ---------------------------------------------------------------------------
// WHAT THE CLUB LOOKS FOR.
//
// This removes the one belief that stops people applying: "I am not good enough at
// coding yet." Worded as what the club VALUES, not as a test it administers —
// nothing on this site claims a screening process, the form is an application

// ---------------------------------------------------------------------------
// LOOKING_FOR, CULTURE, NOT_FOR AND FAQ USED TO BE HERE. They are in
// content/how-to-join.ts.
//
// All four existed in both halves of the merge that produced this file, and the
// rule applied throughout was that the club's own copy wins on anything both
// described. Its
// copies are the longer ones — its FAQ runs to seven entries against five here,
// and its NOT_FOR carries a fourth reason to walk away. Two arrays with the same
// name in two content files is the failure mode this whole directory is arranged
// to prevent, so the shorter copies are gone rather than kept in step by hand.
//
// The sections that render them are unchanged; they import from
// content/how-to-join.ts now.

// ---------------------------------------------------------------------------
// THE JOIN FORM'S OPTIONS.
//
// Kept here rather than inline in the component so the form and the rest of the
// site cannot disagree about what the four paths are called — the form's path
// options are DERIVED from PATHS above, which is the only way a fifth path can be
// added without silently missing from the form.

// LEVELS WAS HERE — three radio buttons asking whether somebody had merged a pull request
// before. It is gone with the `level` field it fed. It was a self-assessment made by
// somebody who had not yet met the club, nothing acted on it, and it stopped being true a
// fortnight after they answered. LEVEL_LABEL above is a different thing and stays: it
// labels the two experience groups PATHS are sorted into, and the admin roster still
// reads it.

// The hostels. Two, because there are two.
//
// REQUIRED, and the list is exhaustive: everyone the club takes applications from lives
// in one of these two buildings, so there is no third answer to offer and an opt-out
// would only produce applications nobody can schedule around. It is asked because build
// days and evening sessions get planned by which building people have to walk back to.
// If that ever stops being true — an off-campus intake, a third block — this list and
// the `hasAll` line in firestore.rules both have to change, not just this one.
export const HOSTELS = [
  { value: "uniworld-1", label: "Uniworld 1" },
  { value: "uniworld-2", label: "Uniworld 2" },
] as const;

// The named programmes, and the one field on this form that is a closed set of
// PROPER NOUNS rather than of the club's own vocabulary. Two consequences:
//
//   1. The labels are spelled the way the programmes spell themselves, including the
//      parenthesised acronyms people actually search for. "Season of KDE", not
//      "Season of KDE (SoK)" — the abbreviation is not what the programme calls
//      itself on its own front page.
//   2. `other` is here because this list will be out of date. New programmes appear
//      every year and a fixed list of nine would quietly tell the applicant aiming at
//      the tenth that the club has never heard of it. Selecting it reveals a required
//      free-text field, so "other" never arrives without saying which — an
//      unqualified "other" is the one answer that would change nobody's first
//      conversation, which is the test every field on this form has to pass.
//
// Order is roughly by how competitive and how paid they are, which is also the order
// somebody scanning the list is looking for the familiar name in.
export const PROGRAMS = [
  { value: "gsoc", label: "Google Summer of Code (GSoC)" },
  { value: "lfx", label: "Linux Foundation LFX Mentorship" },
  { value: "outreachy", label: "Outreachy" },
  { value: "sok", label: "Season of KDE" },
  { value: "hacktoberfest", label: "Hacktoberfest" },
  { value: "sob", label: "Summer of Bitcoin" },
  { value: "gssoc", label: "GSSoC" },
  { value: "ssoc", label: "SSoC" },
  { value: "esoc", label: "ESoC" },
  { value: "other", label: "Other" },
] as const;

/** The one PROGRAMS value that requires the free-text field beside it. Named rather
 *  than compared against the string inline, so the form and the rules check are
 *  talking about the same thing. */
export const PROGRAM_OTHER = "other";
