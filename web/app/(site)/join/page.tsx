import type { Metadata } from "next";
import Link from "next/link";
import JoinGate from "@/components/JoinGate";
import Duo from "@/components/Duo";
import Doodle from "@/components/Doodle";
import PathCard from "@/components/PathCard";
import ProgramMentors from "@/components/ProgramMentors";
import Faq from "@/components/Faq";
import Note from "@/components/fx/Note";
import { ENTRY_PATHS, MENTORED_PATH_ID, PATHS } from "@/content/join";
import { FAQ, NOT_FOR } from "@/content/how-to-join";

// JOINING. The door, the two ways through it, and the case for walking in.
//
// THIS ROUTE ABSORBED THE FRONT HALF OF /how-to-join, and the reason is the nav:
// the bar used to carry "How to Join" as a route AND "Join" as a filled button
// three inches to its right, two controls with the same word on them dividing one
// question between two pages, with nothing on screen saying which half was where.
// The button is the one every reader presses, so the button's destination is where
// the answer had to be. See the note over PAGES in content/site.ts.
//
// WHAT IT NOW HOLDS, in the order a reader meets it:
//
//   #apply      what joining is, and the door itself
//   #ways-in    the two ways in — build days and hackathons
//   #why-join   why bother at all: the programme track, and the mentors on it
//   #who-not-for four honest reasons to walk away
//   #faq        what people actually ask
//   (closing)   the two futures
//
// THE LAST TWO CAME FROM /how-to-join, WHICH IS GONE. That page split one question
// ("how do I join") across two routes with the same word in their names, and
// half of what it held was a second telling of the pull-request loop the home
// page and /programmes also told. The loop and the commands went to /guide; the
// part a person deciding whether to sign in actually needs — who this is not for,
// and the FAQ — came here. /how-to-join redirects to this page.
//
// TWO WAYS IN AND NOT FIVE. content/join.ts still holds five paths and they are
// all real; ENTRY_PATHS names the two this page offers, for the reason written
// there. A stranger choosing between five doors is a stranger who closes the tab,
// and the other three are routes people move ONTO rather than arrive by — the
// onboarding form still offers every one of them.
//
// WHY #why-join IS LAST RATHER THAN FIRST. It is the strongest material on the
// page — six named seniors, six organisations, every one selected into a paid
// programme — and the instinct is to lead with it. It is also the most
// intimidating material on the page, and the reader this route is written for is
// the one who is not sure they are good enough to be in the room. Leading with a
// wall of GSoC selections answers a question they have not asked yet and confirms
// the fear they arrived with. So: the door first, the low-stakes Saturday second,
// and the ambitious thing only once "you do not need to be good yet" has been said
// and demonstrated.
//
// It carries no NextAction, and it is the only route that does not: the form IS
// the next action, and a closing "here is what to do next" band pointing somewhere
// else is an invitation to abandon it.
//
// It does close on a band, and that band is built to respect the same rule — the
// only link in it goes back UP to the form. Anything added down there has to clear
// the same bar: no exits under an unfinished form.
//
// It is also absent from PAGES, so it appears in neither the nav strip nor beside
// the other routes in the footer. The nav carries it as a filled button at the
// other end of the bar — putting the same word in the strip as well would be the
// site's one action said twice in one component.
//
// The form used to sit immediately below the hero on a single-page site, because
// with one page that was the only way to keep it within one scroll of the top.
// With its own route it is one click from every screen instead, which is strictly
// better, and the section around it can be about the form rather than being a
// compromise between the form and the hero above it.

export const metadata: Metadata = {
  title: "Join",
  description:
    "Join the Scaler Open Source Club: build days, hackathons and a mentored programme track. Free, no interview, no experience needed.",
};

/* The programme track, pulled out by id rather than by position. It is the one
   path this page renders outside the two front-door cards, and MENTORED_PATH_ID is
   the same constant ProgramMentors is attached by — so the bench and the path it
   sits under cannot come apart. Missing means the section does not render, which
   is the honest failure: a "why join" band with the argument removed is worse than
   no band. */
const TRACK = PATHS.find((p) => p.id === MENTORED_PATH_ID);

export default function Join() {
  return (
    <main id="main">
        {/* ---- Apply, immediately below the hero ----------------------------
            The form cannot live INSIDE the hero: that hero is sticky and
            scroll-scrubbed, and animating a background under someone who is
            filling in fields is hostile. Scaler's hero carries its form because
            their hero is static. So the form gets the very next band instead —
            one scroll, still the second thing you meet, and it keeps both
            mechanics intact. */}
        {/* `relative` so the sticker below anchors to this section rather than to
            the page. Each sticker is positioned against the section it belongs to,
            so none of them can drift when a section above changes height. */}
        <section id="apply" className="section page-top relative pb-8">
          {/* THE THREE STICKERS, and the rule they all now follow.
              A negative inset only means "hang into the margin" when a margin
              exists. `.section` caps at 88rem, so below ~1600px viewport there is
              no gutter at all and a negative offset hangs off the SCREEN instead:
              the bottom-right sticker was pushing the document 16-40px wider than
              the viewport across the entire 1024-1360px band, which covers most
              laptops.
              It went unseen because `body { overflow-x: hidden }` clips the strip
              rather than producing a scrollbar, and because the QA sweep tests
              390, 834 and 1440 — the band sits exactly between the last two.
              So: flush insets by default, negative ones only past 1600px.

              AND A FLUSH INSET IS INSIDE THE TEXT COLUMN, which is the half of
              that rule the vertical position has to answer for. `left-0` on a
              container whose gutter has not appeared yet does not mean "in the
              margin" — it means "on top of the first thing in the left column",
              and the only reason it ever looked otherwise was that `top-14`
              landed inside this section's 96px of top padding. A later spacing
              pass cut that padding to 48/64px and the sticker came to rest
              exactly on the eyebrow above the headline, at EVERY width from
              1024 up.
              So a flush sticker needs a band that is empty in both axes, not
              just a corner. */}
          {/* THE "WORKS ON MY MACHINE" STICKER USED TO SIT HERE, AND IT WAS LANDING
              ON THE "FREE" TILE AT EVERY WIDTH IT RENDERED AT. Measured, not guessed:
              at 1280 the sticker occupied y 567-607 / x -1-249 and the tile occupied
              y 563-665 / x 24-274; at 1440 it was 532-572 over a tile at 524-630; at
              1600, 581-620 over 571-678. A direct hit on the word "Free" in all three.

              Its own comment said it sat in "350-450px of dead space at the bottom of
              the left column", and that was true when the left column carried more copy
              and the form beside it was a tall anonymous one. Sign-in replaced that form
              with a short card, the left column now ends at these two tiles, and the
              dead space the sticker was placed in stopped existing — so `bottom-24`
              stopped meaning "under the copy" and started meaning "on top of it".

              It is removed rather than moved because there is no longer an empty band on
              this section to move it to: both columns end within 10px of each other, and
              inventing space for a decoration on the page whose whole brief is "less
              crowded" is the wrong trade. The gutter note below stays, so the section
              keeps a sticker voice without a sticker sitting on the content. */}
          {/* Opposite gutter, level with the form itself — it answers the first
              thing anybody wonders while looking at a sign-up form.

              THE POINT IS THE ABSENT SECOND TIER, not the price. "Free" alone is
              a word every programme on the internet uses about its entry level,
              and a reader who has met a few of those hears it as "free until the
              part that matters". What is actually unusual here is that there is
              no part that matters more — nobody is kept out of a room because of
              where they sit in the club — so the note says that instead, and the
              price follows from it. The "Free" tile a few inches away already
              carries the fee.

              IT IS SPECIFICALLY *SESSIONS* THAT ARE UNDIVIDED, AND SPECIFICALLY
              REPOS THAT ARE NOT. An earlier draft read "same mentors, same
              repos, everyone", which is not true and is not even the thing being
              claimed: #tracks below sorts the work into three named difficulties
              on purpose, because handing a first-timer an advanced codebase
              helps nobody. That division is a match to what you can currently
              read, and it moves as you do. The division this note rules out is
              the other kind — a rank inside the club that decides which room you
              are allowed into. Keep those two apart in any rewrite; collapsing
              them either makes the club sound undifferentiated or makes the
              tracks sound like tiers. */}
          <Note
            place="gutter"
            tone="sky"
            paper="grid"
            fold
            title="No premium tier."
            body="Every session is open to everyone. Repos differ by level, not by rank."
            tilt={2.5}
            className="-right-40 top-24"
          />
          {/* An even 1fr/1fr split, up from 1fr/26rem. The form was a fixed
              416px column against a fluid one, so every pixel the container
              gained went to the prose and none to the fields — at 88rem the
              argument ran to 780px while the inputs stayed at 416px and the two
              org fields underneath were squeezed into 172px each.

              Even halves put roughly 600px on each side at the cap, which is
              what lets those paired fields breathe and stops the form reading
              as a sidebar bolted to an essay. */}
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-8">
            {/* The one section whose stagger group is NOT the <section>. Its
                header lives a level down inside this two-column grid, so the
                group goes here and the section keeps its ordinary settle. */}
            <div data-reveal-group>
              <p className="label">Open to every SST student</p>
              {/* h1, not the default h2 — same reason as on /hall-of-fame. This was
                  a mid-page band and is now the whole route. */}
              <Duo
                as="h1"
                className="mt-4 max-w-2xl text-display-lg"
                lead="You do not need to be good yet."
                trail="You need a laptop and a GitHub account."
              />
              {/* "every name further down this page" was true when the hall of fame
                  was 6,000px below this form. It is a route away now, so the sentence
                  pointed at nothing — the kind of line that survives a restructure
                  because it still reads fine and is simply no longer about anything.
                  Named and linked instead. */}
              <p className="measure mt-4 text-body-lg text-haze">
                Most people arrive having never opened a pull request. So did everyone
                in the{" "}
                <Link href="/hall-of-fame" className="link-u text-accent">
                  hall of fame
                </Link>{" "}
                began there.
              </p>

              {/* The two questions every prospective member asks first, answered
                  before they have to ask. Straight from the reference, where they
                  sit under the hero as tiles. */}
              <div className="mt-6 grid max-w-lg grid-cols-2 gap-3">
                <div className="card rounded-tile bg-raise px-5 py-4">
                  <p className="text-body-lg font-semibold text-accent">Free</p>
                  <p className="mt-1 text-sm text-haze">No fee, ever</p>
                </div>
                <div className="card rounded-tile bg-raise px-5 py-4">
                  <p className="text-body-lg font-semibold text-accent">All years</p>
                  <p className="mt-1 text-sm text-haze">No prior experience</p>
                </div>
              </div>

            </div>

            {/* SIGN-IN, NOT AN APPLICATION FORM, and this reverses the previous change
                here rather than drifting from it.

                The argument for the anonymous form was real and is worth stating: making
                somebody hold a Google account before they may apply puts a requirement in
                front of the club's front door, and the headline three inches to the left
                promises the opposite. That is true of a club that admits anybody.

                This one does not. Membership IS an @sst.scaler.com address — that is the
                whole test, and it is the one thing an application form cannot check. A
                form asks a stranger to type an address they may not own and leaves an
                organiser to verify it by hand; signing in with the college account proves
                it in one tap and produces a record nobody had to check. So the door and
                the test are the same act now, and there is no application to read.

                The two tiles above and the copy beside this are unchanged. The flow
                changed, not the page. */}
            <JoinGate />
          </div>
        </section>

        {/* ---- The two ways in -----------------------------------------------
            Directly under the door, because "which of these am I" is the question
            the sign-in card raises and does not answer. Both are beginner paths and
            both are a day rather than a commitment — the point of putting them here
            is that neither one asks the reader to already be anything.

            NUMBERED, which a two-item list usually should not be. It is not a
            ranking and nothing is sequential about them; the numerals are here
            because the section above promises "two ways", and a numbered pair is
            the cheapest way for a reader scrolling past to confirm they have seen
            both rather than wondering whether a third scrolled by. */}
        <section
          id="ways-in"
          className="band section relative pt-10 pb-10 sm:pt-14 sm:pb-14"
          aria-label="The two ways in"
          data-reveal-group
        >
          <p className="flex items-center gap-2">
            <span className="chip">Where people actually start</span>
            <Doodle kind="squiggle" className="h-5 w-8 text-accent" />
          </p>
          <Duo
            className="mt-4 max-w-4xl text-display-lg"
            lead="There are two ways in."
            trail="Neither of them is a commitment."
          />
          <p className="measure mt-4 text-body-lg text-haze">
            No track to pick. Choose a day and show up with nothing ready —{" "}
            <span className="mark">the setup is the part that defeats people</span>, so we do it with you.
          </p>

          <div className="mt-9 space-y-4" data-reveal-group>
            {ENTRY_PATHS.map((p, i) => (
              <PathCard
                key={p.id}
                path={p}
                step={String(i + 1).padStart(2, "0")}
              />
            ))}
          </div>

          {/* The three paths this page does not offer. One line, not a fourth and
              fifth card: they are real routes and somebody arriving with merged pull
              requests deserves to know the club has somewhere to put them, but a
              stranger deciding whether to sign in should not have to rule them out
              first. The onboarding form lists all five. */}
          <p className="mt-8 max-w-3xl text-body text-haze">
            Already have merged PRs? Say so after you sign in and skip straight to a
            project team.
          </p>

          {/* Points DOWN the page, not off it: the honest part and the FAQ live
              here now (see the head of this file), so this is not an exit from
              the form. */}
          <p className="mt-3 max-w-3xl">
            <Link
              href="#who-not-for"
              className="tap link-u inline-block font-mono text-xs text-accent transition hover:brightness-125"
            >
              The honest bit: who this isn&apos;t for, plus FAQs ↓
            </Link>
          </p>
        </section>

        {/* ---- Why bother ----------------------------------------------------
            The case, made last and made with people rather than with process. See
            the note at the head of this file for why it is down here and not at the
            top, and ProgramMentors.tsx for why the bench is six faces rather than a
            sentence.

            IT RENDERS THE PROGRAMME TRACK IN FULL — the same card as the two above,
            same fields, same layout — rather than a summary of it. Two reasons: a
            reader who has just read two cards knows how to read a third, and a
            summary is a second copy of content/join.ts's prose that would drift from
            it the first time anybody edited either. */}
        {TRACK && (
          <section
            id="why-join"
            className="section relative pt-16 sm:pt-24"
            aria-label="Why join"
            data-reveal-group
          >
            <p className="chip">Why bother</p>
            <Duo
              className="mt-4 max-w-4xl text-display-lg"
              lead="The thing worth joining for is decided months before you apply."
              trail="Which is the whole reason to start in September."
            />
            <p className="measure mt-4 text-body-lg text-haze">
              A build day is a good evening. This is what it&apos;s an evening{" "}
              <em>towards</em>: GSoC, LFX and Outreachy — paid, competitive, and won
              by people maintainers already know. Our track is run by people who got in.
            </p>

            <div className="mt-9">
              <PathCard path={TRACK} cta="Sign in and say this is your aim">
                <ProgramMentors />
              </PathCard>
            </div>
          </section>
        )}

        {/* ---- Who this is not for -----------------------------------------
            Four reasons to walk away, on the page whose job is recruitment. It is
            the section that makes the rest credible: a club that claims to be for
            everybody is making a claim nobody believes. */}
        <section
          id="who-not-for"
          className="band section pt-10 pb-10 sm:pt-14 sm:pb-14"
          data-reveal-group
        >
          <p className="chip">Be honest with yourself</p>
          <Duo
            className="mt-4 max-w-4xl text-display-lg"
            lead="This is not for everyone."
            trail="Four reasons to walk away now."
          />
          <ul className="mt-7 max-w-3xl space-y-4">
            {NOT_FOR.map((n) => (
              <li key={n} className="flex gap-4 border-t border-seam pt-6">
                <span aria-hidden className="mt-2.5 h-1 w-1 shrink-0 rounded-full bg-ember" />
                <span className="text-body text-haze">{n}</span>
              </li>
            ))}
          </ul>
          <p className="mt-8 max-w-3xl text-body text-ink">
            Still here? Then it&apos;s for you.
          </p>
        </section>

        {/* ---- FAQ ---------------------------------------------------------- */}
        <section id="faq" className="section pt-10 sm:pt-14" data-reveal-group>
          <p className="chip">Questions</p>
          <Duo
            className="mt-4 max-w-4xl text-display-lg"
            lead="The things people actually ask."
          />
          <Faq items={FAQ} />
        </section>

        {/* ---- The two futures ---------------------------------------------
            The closing band, and the exception the comment at the top of this
            file now carries: it is not a NextAction. Every other route ends by
            handing you somewhere else to go, which under a half-filled form
            would be an exit. This one restates the decision and then stops.

            IT CARRIES EXACTLY ONE LINK NOW, AND IT POINTS BACKWARDS. The band
            had none at all while the form was one scroll above it. It is three
            sections above it since this route absorbed the ways in and the
            programme track, and "scroll back up and finish" stopped being a
            thing a reader does — it is a 4,000px drag past two arguments they
            have already read. So the band ends with the way back to the door.
            That is not an exit: it is the same action the whole page is for,
            offered at the one place somebody has finished reading and has
            nothing in front of them. A link to anywhere ELSE still does not
            belong here.

            NOT INSIDE THE SIGN-IN CARD. It lived in the card for one revision and the
            card is the wrong container: at 15px inside a 7-unit padded tile it
            read as a third disclaimer under the two grey notes about data, and
            disclaimers are what people skip. On the page at display-md it is
            the loudest type below the hero.

            The asymmetry is the whole argument. Both eyebrows take .label, so
            they read as one pair rather than a warning and a reward — the
            weight sits in the body copy instead: `dust` on the left, `ink` on
            the right, plus the accent rule down the right column. The future
            where you did nothing is literally the dimmer of the two.
            Do not try to colour the eyebrow to sharpen it: .label sets its own
            colour and every custom class in globals.css is declared after
            @tailwind utilities, so a text-* utility on it silently does
            nothing. See the note on .page-top there. */}
        <section className="section pb-16 pt-4">
          {/* One column until lg, and lg rather than sm because these are
              30-word paragraphs at display size — the point where two of them
              fit side by side without either dropping to four words a line is
              a good deal wider than the point where two columns fit. */}
          <div
            className="grid gap-10 border-t border-seam pt-12 lg:grid-cols-2 lg:gap-14"
            data-reveal-group
          >
            <div>
              <p className="label">If you close this tab</p>
              <p className="mt-4 text-display-md font-medium text-dust text-balance">
                You&apos;ll be back in February. Same tap, one semester behind.
              </p>
            </div>

            {/* The accent rule is the second column's left edge at lg and its top
                edge below that, so the band never loses the mark that says which
                of the two futures the page is pointing at. */}
            <div className="border-l-2 border-accent pl-7 lg:pl-14">
              <p className="label">If you sign in</p>
              <p className="mt-4 text-display-md font-semibold text-ink text-balance">
                Somebody messages you this week. You show up regularly. By November
                you&apos;re the one answering the questions.
              </p>
              {/* Quiet, mono, and pointing up — the loud version of this control is
                  already in the bar at every scroll position, and a second filled
                  button here would be the third thing on the page saying "join". */}
              <p className="mt-7">
                <Link
                  href="#apply"
                  className="tap link-u inline-block font-mono text-xs text-accent transition hover:brightness-125"
                >
                  ↑ Back to the sign-in
                </Link>
              </p>
            </div>
          </div>
        </section>
    </main>
  );
}
