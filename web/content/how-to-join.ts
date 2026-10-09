// THE /how-to-join PAGE'S PROSE: who the club is looking for, how it runs, who it
// is not for, and the questions people ask before joining.
//
// The entry paths that page links to live in content/join.ts, because the join
// form and the admin roster read them too.

// WHAT THE CLUB LOOKS FOR.
//
// Added on the founder's suggestion, and it is the highest-value thing on the page
// after the selections themselves — because it removes the one belief that stops
// people applying: "I am not good enough at coding yet."
//
// The claim was already here, buried as FAQ item twelve ("Do I need to be good at
// DSA? No. Different skill."). Nobody reaching a decision reads to item twelve.
//
// Worded as what the club VALUES, not as a test it administers. Nothing else on
// this site claims a screening process — the form is an application, not an exam —
// so "we assess your reasoning" would be inventing a mechanic that does not exist.
// The distinction matters: one is a statement of what predicts success here, the
// other is a promise about a process nobody has designed.
//
// Both columns are concrete and checkable against a real first contribution. That
// is the test for anything in this list: if a line could sit on any club's page, it
// is too vague to be here.

export type LookingFor = { not: string; yes: string };

export const LOOKING_FOR: LookingFor[] = [
  {
    not: "A contest rating, or fluency in DSA",
    yes: "Reading code you did not write and working out what it does",
  },
  {
    not: "Knowing a particular framework already",
    yes: "Turning a vague problem into one small change you can defend",
  },
  {
    not: "Prior open-source experience, or any merged work",
    yes: "Following a review thread and understanding why a change was refused",
  },
  {
    not: "A tidy GitHub profile with a streak",
    yes: "Saying \"I do not understand this yet\" early instead of late",
  },
];

// ---------------------------------------------------------------------------
// HOW THE CLUB ACTUALLY RUNS.
//
// Written plainly and specifically. "Vibrant community" tells a reader nothing;
// coffee and Maggi at eleven at night tells them exactly what walking in is like.

export const CULTURE: { title: string; body: string }[] = [
  {
    title: "Discussions, not lectures",
    body: "Sessions are people arguing about a codebase with a laptop open, not slides. If you have a question halfway through, that is the session.",
  },
  {
    title: "Coffee and Maggi are on the club",
    body: "Working sessions run late and nobody codes well hungry. There is always chai, coffee and Maggi, and you do not have to ask.",
  },
  {
    title: "Work where you like",
    body: "Library, lab, hostel common room, or the campus spot everyone knows. We pick the location by what the group wants that week, not by what was booked.",
  },
  {
    title: "Nobody is behind",
    body: "People join knowing wildly different amounts. Sitting in on a session you only half follow is a completely normal way to start, and everyone here did it.",
  },
];

// ---------------------------------------------------------------------------
// WHO THIS IS NOT FOR.
//
// An explicit filter immediately before the ask. Stating who should not join
// makes the invitation read as selective rather than desperate, and it saves
// everyone the wasted month — including us.

export const NOT_FOR: string[] = [
  "Anyone after a certificate. There isn't one — you get a public commit history instead.",
  "Anyone only prepping for the DSA round. The CP club's better at that — do both if you've got the hours.",
  "Anyone wanting a weekly syllabus. You get a mentor and a direction instead.",
  "Anyone counting PRs. That's how Hacktoberfest got its bad name. Not here.",
];

// ---------------------------------------------------------------------------
// FAQ.
//
// Seven questions, no more. Every one is a real reason somebody decides not to
// join, and the Scaler-funnel question is the one that silently loses exactly the
// sceptical students most worth having.

export const FAQ: { q: string; a: string }[] = [
  {
    q: "Do I need to be good at DSA?",
    a: "Nope, different skill: reading unfamiliar code, making a small correct change, surviving review.",
  },
  {
    q: "How many hours a week?",
    a: "Four to six once you're rolling, more near deadlines. Exams? Go quiet and pick it back up after.",
  },
  {
    q: "Is this free?",
    a: "Yes, and there is nothing to upsell you. The coffee is on the club.",
  },
  {
    q: "Is this a Scaler product or a marketing funnel?",
    a: "A student club at Scaler School of Technology, run by students. Nothing to pay for, nothing for sale.",
  },
  {
    q: "I'm in my final year — is it too late?",
    a: "For this year's GSoC, probably. For LFX, no — three terms a year. And GSoC dropped its student-only rule in 2022, so graduating doesn't end it.",
  },
  {
    q: "What language or stack do I need?",
    a: "Any one you can already write. Projects span Python, Go, Rust, TypeScript, C++ and more — we fit the project to you.",
  },
  {
    q: "What if my pull request gets rejected?",
    a: "It will, sometimes. Ours do too — getting some closed is part of how everyone learns what a project wants. Totally normal.",
  },
];
