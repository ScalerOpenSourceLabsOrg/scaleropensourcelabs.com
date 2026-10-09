// The media split: a large framed visual beside a 2x2 of what the club actually
// runs.
//
// THE LEFT FRAME, AND THE ONE HONEST PROBLEM IN THIS SECTION.
//
// The brief asks for "a photo of students collaborating at laptops". This repo
// contains no images at all — `public/` holds a single README explaining how to
// add them, and not one entry in content/selections.ts has a `photo` set. So there
// three ways to fill this frame and only one of them is defensible:
//
//   * A stock photograph of unrelated people, captioned as this club. That is a
//     misrepresentation on a page whose entire argument is that its claims are
//     checkable, and it is the version most sites ship.
//   * An empty grey box with "image goes here". Honest and unshippable.
//   * What this does: render the real photograph THE MOMENT one exists at the
//     path below, and until then compose the frame out of the club's real member
//     tiles — the same pastel monogram treatment the hall already uses for
//     everyone who has not supplied a picture.
//
// The fallback is a designed state, not an error state: four member tiles, the
// contribution wall's colour language, and a caption that says what it is. It
// does not pretend to be a photograph, so nothing here can be read as one.
//
// To ship the real thing: drop the image at public/people/ per the README there
// and set PHOTO below. Nothing else changes.

import Doodle from "@/components/Doodle";
import Duo from "@/components/Duo";
import { Fold } from "@/components/Fold";
import Note from "@/components/fx/Note";

/** Set to a path under /public once a real photograph exists. Empty = fallback. */
const PHOTO = "";

/* The four things the club actually runs, which is why these are hardcoded here
   rather than pulled from content: they describe the club's format, not its
   record, so there is no figure in them that could go stale or be wrong. Anything
   with a number in it belongs in a content/ module instead. */
const FEATURES: {
  title: string;
  body: string;
  glyph: string;
  fill: string;
  ink: string;
  /* An optional qualifier, set in red under the body. Only ONE card carries one,
     and that is the point: the standfirst directly above this grid says every one
     of these is "open to anyone … no selection at the door", so a card that is in
     fact rationed has to say so where the claim is made rather than leave the
     correction to the FAQ. A second red line would turn a correction into a
     texture and this one would stop being read. */
  caveat?: string;
}[] = [
  // THE SAME NAMES /join USES. This grid used to list "commit sessions, hackathons
  // & bounties, networking, mentorship" while /join offered build days, hackathons
  // and a programme track, /events had three tracks and /programmes had three more —
  // four vocabularies for one club. These are /join's, plus the club's own repos.
  {
    title: "Build days",
    body: "One evening, one senior beside you, one real change by the end.",
    glyph: "< />",
    fill: "#FEF9C3",
    ink: "#713F12", // 8.0:1 on the pastel yellow
  },
  {
    title: "Hackathons",
    body: "Thirty people, one room, the same setup bugs. Nothing's ranked.",
    glyph: "⚡",
    fill: "#EDE9FE",
    ink: "#4C1D95",
  },
  {
    title: "Programme track",
    body: "GSoC and LFX prep, with a 1-on-1 mentor who got in last cycle reading your patch first.",
    glyph: "★",
    fill: "#D1FAE5",
    ink: "#065F46",
    // It used to read "accessible to serious students only", under a standfirst
    // promising no selection at the door. What is actually rationed is mentor time,
    // and it goes by who keeps turning up, not by who passes a bar.
    caveat: "*1-on-1 mentor pairs go to the people who keep showing up",
  },
  {
    title: "Club projects",
    body: "This site and the club's other repos — your reviewer sits in the lab.",
    glyph: "◎",
    fill: "#DBEAFE",
    ink: "#1E3A8A",
  },
];

export default function MediaSplit() {
  return (
    <Fold
      id="what-we-run"
      /* `relative` for the note below and nothing else. A flow note is absolutely
         positioned, so without a positioned ancestor here it would hang off
         whichever section happens to be positioned further up the page. */
      className="band section relative py-20 sm:py-28"
      label="What the club runs"
      /* Folds with the rest of the home page — see Fold.tsx. */
      head={
        <>
      {/* THE TITLE BLOCK. Every other section on the page opens with a chip and a
          Duo; this one used to open with the frame itself, so the 2x2 arrived with
          nothing telling a reader what it was a list OF.

          Same three parts as the reference site's: a label, a two-clause headline
          split across a colour change, and one line of subtitle with a single
          phrase lifted out of it. The parts are this site's own — `.chip`, Duo's
          ink/blue split, `.mark` — rather than a copy of theirs, which is what
          keeps this section looking like the eleven above it.

          LEFT-ALIGNED, and that is the one deliberate departure from the
          screenshot. The reference centres its heading over a centred grid; every
          section here hangs off the left margin, and Duo's hand-drawn underline is
          fixed-width from that margin — centring this one block would have left it
          the only heading on the page that does not line up with the rest.

          Sentence case, per the rule in Duo's header: caps are for labels, and a
          two-clause sentence in the display face at this size is a wall. The chip
          above it is a label, so the chip is the part that shouts. */}
      {/* Moved here from #culture, where it annotated a headline about arguing
          over code from a section that never said what a session IS. This is the
          section that does — "Regular commit sessions: open laptops, one issue
          each" is the first card in the 2x2 below — so the note now reads as a
          remark about the thing beside it rather than as a second way of saying
          the headline.

          It is also the only note between #culture and #tracks, so nothing here
          shares a horizontal level with it; the two decorations either side are
          hundreds of pixels clear. See the vertical spacing note in Note.tsx.

          In flow beside the heading rather than at a measured inset — see the
          placement note in Note.tsx. The old anchor went stale when the display
          face changed and the note sat on "syllabus". */}
      <div className="lg:flex lg:items-start lg:gap-10">
        <div className="min-w-0 flex-1">
      <p className="flex items-center gap-2">
        <span className="chip">Why students join</span>
        <Doodle kind="squiggle" className="h-5 w-8 text-accent" />
      </p>
      <Duo
        className="mt-4 max-w-4xl text-display-lg"
        lead="College gives you a syllabus."
        trail="This gives you a review thread."
      />
        </div>
        <Note
          place="flow"
          tone="sky"
          fold
          title="Laptop open."
          body="People arguing about a codebase, not sitting through slides."
          tilt={-2.5}
          className="mt-2"
        />
      </div>
        </>
      }
    >
      <p className="measure mt-4 text-body-lg text-haze">
        Four things we run, all{" "}
        <span className="mark">open to anyone</span> — no selection at the door.
      </p>

      <div className={`mt-8 grid gap-5 lg:gap-6 ${PHOTO ? "lg:grid-cols-2" : ""}`}>
        {/* ---- Left: the photograph, once there is one -------------------
            The fallback was four monogram tiles captioned "photographs to
            follow" — a placeholder announcing itself on the home page. With no
            photo the frame is simply absent and the four cards take the row. */}
        {PHOTO && (
          <div className="zoom overflow-hidden rounded-panel border-2 border-black bg-raise shadow-[4px_4px_0_0_#000]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={PHOTO}
              alt="Club members working together at a session"
              className="h-full w-full object-cover"
            />
          </div>
        )}

        {/* ---- The four cards -------------------------------------------- */}
        <div className={`grid gap-4 sm:grid-cols-2 ${PHOTO ? "" : "lg:grid-cols-4"}`}>
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="rounded-tile border border-[#F1F5F9] bg-raise p-5 transition-shadow duration-200 ease-in-out hover:shadow-[0_10px_30px_rgba(0,0,0,0.06)]"
            >
              {/* The pastel icon badge. Fixed fill and fixed foreground — a
                  self-contained pair, so it needs no dark-theme variant and its
                  contrast is one number rather than two. */}
              <span
                aria-hidden
                className="flex h-10 w-10 items-center justify-center rounded-tile font-mono text-sm font-bold"
                style={{ background: f.fill, color: f.ink }}
              >
                {f.glyph}
              </span>
              <h3 className="mt-4 font-display text-body-lg font-bold leading-snug">
                {f.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-haze">{f.body}</p>
              {/* 12px against the body's 14px, and --flag rather than --ember —
                  see the token's note in globals.css. The asterisk is authored
                  into the string rather than added here so the copy reads the
                  same in the source as it does on the page. */}
              {f.caveat ? (
                <p className="mt-2 text-xs leading-relaxed text-flag">
                  {f.caveat}
                </p>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </Fold>
  );
}
