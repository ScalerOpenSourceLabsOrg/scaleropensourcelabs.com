// LOOKING A PERSON UP BY NAME.
//
// Every fact about a member is already written down exactly once in content/ —
// the photograph on the org chart, the programme and organisation on the hall of
// fame — and the same person turns up in more than one section. These four
// functions are how a second section borrows those facts instead of restating
// them, so a card built somewhere else cannot end up claiming a different
// organisation from the roster, or showing a monogram for somebody whose
// photograph arrived last week.
//
// NAME IS THE KEY, and it is a weak one: "Vansh Dobhal" and "Vansh Dhobal" are
// two different people as far as a string comparison is concerned. That is
// tolerable only because every one of these returns "nothing recorded" rather
// than a guess, and every caller is required to render the person anyway with
// whatever came back — see ProgramMentors.tsx, which draws a card with a name and
// no credential rather than dropping the person off the page. A missing chip is
// a visible prompt to fix the spelling; a missing card is not.

import {
  publishedSelections,
  type Selection,
} from "@/content/selections";
import {
  TEAM_CONTENT,
  TEAM_LEADS,
  TEAM_OFFICERS,
  TEAM_SHADOWS,
} from "@/content/team";

/** Every published selection recorded for one person. Usually none or one. */
export function selectionsFor(name: string): Selection[] {
  return publishedSelections().filter((s) => s.name === name);
}

/**
 * The one selection to introduce a person by: their most recent.
 *
 * Newest rather than most impressive, and the two do come apart — somebody with a
 * GSoC and an Outreachy is introduced by whichever came second. The reader's
 * question under a mentor's name is "did this work lately", not "what is their
 * best result", and a ranking of programmes is an argument this file does not
 * want to have in code.
 */
export function newestSelectionFor(name: string): Selection | undefined {
  return [...selectionsFor(name)].sort((a, b) =>
    b.year.localeCompare(a.year),
  )[0];
}

/**
 * The photograph the site already holds for a person, wherever it is recorded.
 *
 * SELECTIONS IS SEARCHED FIRST, and the order is the whole content of this
 * function. Somebody who is both a selected student and an officer has two
 * pictures on this site — a tall 4:5 crop for their hall of fame card, and a
 * square one for the circle on the org chart — and the only caller of this
 * function renders 4:5. Taking whichever turned up first would put a square
 * headshot in a tall frame for exactly the people who are in both lists, which is
 * the club's own leadership. Returns undefined rather than a guess when neither
 * list has one; Portrait draws its monogram from there.
 */
export function photoFor(name: string): string | undefined {
  const person = [
    // publishedSelections(), not SELECTIONS: this feeds a PUBLIC page, and the
    // consent flag is the gate on every other reader of that list.
    ...publishedSelections(),
    ...TEAM_OFFICERS,
    ...TEAM_LEADS,
    ...TEAM_SHADOWS,
    ...TEAM_CONTENT.members,
  ].find((p) => p.name === name && "photo" in p && p.photo);
  return person && "photo" in person ? person.photo : undefined;
}

/**
 * The club office this person holds, if any. Offices only — tier 3 is excluded
 * because its designations are "Shadow" and "Aide", which name a relationship to
 * an office rather than an office, and read as a job title the moment they are
 * lifted out of the chart that draws the connector.
 */
export function designationFor(name: string): string | undefined {
  return [...TEAM_OFFICERS, ...TEAM_LEADS].find((p) => p.name === name)
    ?.designation;
}
