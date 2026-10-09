// The sticky notes — squares of paper taped or pinned into the empty space
// beside a section.
//
// A server component, like Sticker beside it, and for the same reason: there is
// no state here. The whole behaviour is a tilt at rest and a peel on hover, and
// both are four lines of CSS (see .note in globals.css).
//
// This exists because there used to be exactly one of these, hand-written inline
// in page.tsx underneath a forty-line comment explaining the arithmetic that
// keeps it off the heading. That comment was right and had to survive, but a
// second note written from memory would have got the arithmetic wrong — so the
// arithmetic lives here now, in the one place every note passes through.
//
// ---------------------------------------------------------------------------
// PLACEMENT. There are exactly two safe ways to put a note beside a section, and
// which one applies is decided by the section, not by taste.
//
//   place="gutter"  — for sections whose content fills the container. The note
//                     hangs OUTSIDE it, into the margin, and therefore only
//                     exists once that margin does.
//
//                     The arithmetic, since it is not guessable: `.section` caps
//                     at 88rem, so the gutter each side is (viewport - 1408) / 2.
//                     THE OFFSET IS THE NOTE'S OWN WIDTH — `-left-40`/`-right-40`
//                     against `w-40` — which puts it entirely outside the
//                     container, and the container's 24px of padding is then the
//                     whole of the clearance between it and the text.
//
//                     That 160px of gutter plus a margin first exists at about
//                     1760px. Below it the note does not render at all — a
//                     decoration that covers a heading is worse than one nobody
//                     sees.
//
//                     THE OFFSET USED TO BE 144 AND IT WAS WRONG BY 8px THE
//                     MOMENT SOMEBODY ELSE'S SPACING PASS TOOK `.section` from
//                     px-8 to px-6. 144 leaves 16px of the note inside the
//                     container and relies on the padding to cover it, so the
//                     clearance was (padding - 16): 16px under px-8, and 8px
//                     under px-6 — 2px once the tilt is counted, which is a note
//                     touching the heading. An offset equal to the width has no
//                     such coupling; only the breakpoint has to move if the cap
//                     does.
//
//                     Two more ways to get this wrong, both of which shipped
//                     once: an offset SMALLER than the note leaves most of it
//                     over the text at every width, and gating on `xl:` (1280px)
//                     shows the note at precisely the breakpoint where the
//                     gutter is zero.
//
//   place="flow"    — for sections whose heading is a LEFT-ALIGNED capped
//                     column with empty container to its right. The note is
//                     NOT absolutely positioned: it sits IN FLOW, as the second
//                     item of a `lg:flex` row whose first item is the chip and
//                     heading (`min-w-0 flex-1`). Wrap the call site in
//                     <div className="lg:flex lg:items-start lg:gap-10">.
//
//                     IT USED TO BE ABSOLUTE, at a hand-measured `anchor` in rem
//                     from the container's left edge, and every anchor went stale
//                     the moment the display face changed: the headline's ink
//                     grew past the number and the note landed on it. In flow, the
//                     heading wraps narrower instead — no measurement to rot, at
//                     any font, zoom or width. The cost is that a note taller than
//                     its heading pushes the next paragraph down; that is a gap,
//                     not an overlap, and it is the right trade.
//
// A negative inset that hangs off the SCREEN rather than into a margin is not
// caught by anything: `body { overflow-x: hidden }` clips the strip silently
// instead of producing a scrollbar, and scripts/qa.mjs samples 390, 834 and 1440.
// Hence flush by default, negative only past 1760px, and never a bare `-left-*`
// written at a call site.
//
// ---------------------------------------------------------------------------
// VERTICAL SPACING, which is a page-level property and therefore cannot be
// decided here. NO TWO NOTES SHARE A HORIZONTAL LEVEL. Past 1760px a section can
// carry one in each margin, and two notes level with each other read as a pair of
// wings bolted to a heading — the eye takes them as one symmetrical ornament
// instead of two remarks, and the tilts that are supposed to look casual start
// looking like a mirrored pattern. So where a section holds two, the gutter one
// is dropped clear of the flow one's band: #calendar and #culture both do this,
// and the numbers at those call sites are the flow note's measured foot plus a
// gap, not taste.
//
// scripts/tmp-measure.mjs prints every decoration's document-y band and flags any
// pair within 40px of each other. Run it after moving one.
//
// NOT aria-hidden, unlike the margin stickers. A sticker is a three-word joke
// that reads as an interruption between a heading and its paragraph; these carry
// whole sentences that say something the section does not, so they are worth
// hearing. Keep it that way when adding one — if a note has nothing to say
// beyond decoration, it should be a sticker instead.

/** THREE PAPERS, FROM ONE PAD. There were seven; see the block in globals.css for
 *  why that read as a stationery catalogue rather than as somebody's working wall.
 *  `yellow` is the site's own --pop and stays the default. */
const TONE_CLASS = {
  yellow: "",
  warm: "note-warm",
  sky: "note-sky",
} as const;

const PAPER_CLASS = {
  plain: "",
  ruled: "note-ruled",
  grid: "note-grid",
} as const;

export default function Note({
  title,
  body,
  children,
  tone = "yellow",
  paper = "plain",
  fixing = "tape",
  fold = false,
  tilt = -2.5,
  place = "gutter",
  className = "",
}: {
  /** The bold first line. Short — this is a note, not a paragraph. */
  title: string;
  /** The line under it. Omit when passing `children` instead. */
  body?: string;
  /** Richer content in place of `body` — a checklist, a couple of lines. */
  children?: React.ReactNode;
  tone?: keyof typeof TONE_CLASS;
  /** Blank, ruled or squared stock. See the note on qa.mjs in globals.css. */
  paper?: keyof typeof PAPER_CLASS;
  /** Tape across the top corner, or a pushpin through it. */
  fixing?: "tape" | "pin";
  /** Turn the bottom-right corner up, as if somebody has been at it. */
  fold?: boolean;
  /** Degrees. Past about 4 a note stops reading as stuck on and starts reading as fallen off. */
  tilt?: number;
  /** See the placement note above — this is not a style choice. */
  place?: "gutter" | "flow";
  /**
   * VERTICAL INSET ONLY — `top-*`/`bottom-*`. Horizontal placement belongs to
   * `place`, which carries arithmetic a call site cannot see.
   *
   * The one exception is the gutter note's margin offset, which has to be
   * written here because its SIGN is the side it hangs off: `-left-40` or
   * `-right-40`, the note's exact width, never less.
   */
  className?: string;
}) {
  // w-40 is 160px, and it is the number BOTH halves of the gutter arithmetic
  // above are written against: the -left-40/-right-40 offsets at every call site
  // and the 1760px gate below. Change it here and all three have to move
  // together, or the notes go back to grazing the headings.
  //
  // Both branches are written out in full rather than composed, because Tailwind
  // scans this file as text: a class assembled at runtime is never generated and
  // the note simply never appears.
  const placement =
    place === "gutter"
      // 1760px, and the number is DERIVED rather than tuned by eye — twice now,
      // because it has had to move twice. The spacing pass widened `.section`
      // from 80rem to 88rem (128px straight out of this gutter) and cut its
      // padding from 32px to 24px, and the offset then had to grow from 144 to
      // the note's full 160 to stop leaning on that padding.
      //
      // Re-running the derivation with the current values: the gutter is
      // (viewport - 1408) / 2, a -right-40 note needs all 160px of it plus ~8px
      // of margin, so it first exists at 1408 + 2*168 = 1744. 1760 is the next
      // round number above that.
      //
      // Leave the gate behind the offset and every gutter note on a screen in
      // between hangs off the edge — silently, because overflow-x: hidden clips
      // the strip instead of producing a scrollbar. That is the failure the block
      // comment at the top of this file describes, arriving through a container
      // change rather than through a bad offset.
      ? "hidden w-40 min-[1760px]:block"
      // In flow beside its heading — see the placement note above. shrink-0 so
      // the heading gives way, never the note; 224px from xl, where the void
      // beside a max-w-4xl heading has room for it.
      : "relative hidden w-40 shrink-0 lg:block xl:w-56";

  return (
    <div
      className={`${place === "gutter" ? "absolute" : ""} z-10 ${placement} ${className}`}
    >
      <div
        // The rest angle rides in as a custom property rather than a class, so
        // the hover peel can straighten toward it and return to it exactly —
        // the same arrangement --rest has on the stickers. A hard-coded rotate
        // in the hover rule would snap every note to one shared angle.
        style={{ ["--tilt" as string]: `${tilt}deg` }}
        className={`note ${TONE_CLASS[tone]} ${PAPER_CLASS[paper]} ${
          fixing === "pin" ? "note-pin" : ""
        } rounded-tile px-4 pb-4 ${fixing === "pin" ? "pt-5" : "pt-6"}`}
      >
        <p className="font-display text-body-lg font-bold leading-tight">
          {title}
        </p>
        {body && (
          <p className="mt-2 text-sm font-medium leading-snug">{body}</p>
        )}
        {children && <div className="mt-2 text-sm font-medium">{children}</div>}
        {fold && <span aria-hidden className="note-fold" />}
      </div>
    </div>
  );
}
