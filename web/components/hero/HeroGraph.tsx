// The hero's contribution calendar: a GitHub profile graph that spells OPEN SOURCE.
//
// The one big picture on the page, and it is a picture of the work itself. A reader
// who has a GitHub account has looked at this exact grid on their own profile —
// mostly grey, if they are who this page is for — and the joke is that the letters
// are the greenest squares on it.
//
// Decorative, so aria-hidden: the background cells are a seeded pattern, not data,
// and the caption says only what is true (the selection count, from content).
// The letters reuse the 5-row glyphs from hall/ContribWall.tsx, which this replaces.

import { selectionStats } from "@/content/selections";
import PeelSticker from "@/components/fx/PeelSticker";
import AchievementToast from "@/components/fx/AchievementToast";
import PaintGrid from "@/components/hero/PaintGrid";

const ROWS = 7;
const COLS = 52;

const GLYPHS: Record<string, string[]> = {
  O: [".##.", "#..#", "#..#", "#..#", ".##."],
  P: ["###", "#.#", "###", "#..", "#.."],
  E: ["###", "#..", "##.", "#..", "###"],
  N: ["#..#", "##.#", "#.##", "#..#", "#..#"],
  S: [".###", "#...", ".##.", "...#", "###."],
  U: ["#..#", "#..#", "#..#", "#..#", ".##."],
  R: ["###.", "#..#", "###.", "#.#.", "#..#"],
  C: [".###", "#...", "#...", "#...", ".###"],
};
const WORD = "OPEN SOURCE";

/** Which cells are letter. Centred in the 52x7 grid, one column between letters. */
function mask(): boolean[][] {
  const lines = ["", "", "", "", ""];
  [...WORD].forEach((ch, k) => {
    const gap = ch === " " ? ".." : WORD[k + 1] && WORD[k + 1] !== " " ? "." : "";
    for (let r = 0; r < 5; r++) lines[r] += ch === " " ? gap : GLYPHS[ch][r] + gap;
  });
  const grid = Array.from({ length: ROWS }, () => Array<boolean>(COLS).fill(false));
  const x0 = Math.floor((COLS - lines[0].length) / 2);
  for (let r = 0; r < 5; r++)
    for (let c = 0; c < lines[r].length; c++) grid[r + 1][x0 + c] = lines[r][c] === "#";
  return grid;
}

/** A seeded 0-1 level for a background cell, so the build is deterministic. Mostly
 *  empty with the odd busy day, the way a real student's graph looks. Capped at 1
 *  and kept sparse: the letters are the only level-4 cells, and anything brighter
 *  or busier around them stops OPEN SOURCE being readable. */
function level(i: number): number {
  const v = ((Math.imul(i + 1, 2654435761) >>> 0) >>> 13) % 100;
  return v > 85 ? 1 : 0;
}

const MASK = mask();
const MONTHS = ["Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep"];

export default function HeroGraph() {
  const { total } = selectionStats();
  return (
    <div className="mt-14 sm:mt-20" data-reveal-group>
      <div aria-hidden className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
        <p className="font-mono text-sm text-ink">
          <span className="font-semibold">{total} selections</span>
          <span className="text-haze"> into paid programmes since 2025</span>
        </p>
        <p className="font-mono text-xs text-dust">git log --author=&quot;sst&quot; --since=2025</p>
      </div>

      <div aria-hidden className="gh-graph relative mt-3 rounded-tile border border-seam bg-sunk p-3 sm:p-4">
        <PeelSticker tone="purple" tilt={-4} className="-bottom-5 right-56 z-20 hidden lg:inline-flex">
          good first issue
        </PeelSticker>
        <div className="mb-1.5 grid font-mono text-[0.6875rem] text-dust" style={{ gridTemplateColumns: "repeat(12, minmax(0, 1fr))" }}>
          {MONTHS.map((m) => (
            <span key={m}>{m}</span>
          ))}
        </div>
        {/* Paintable: click or drag across squares. See PaintGrid.tsx. */}
        <PaintGrid
          className="grid w-full gap-[2px] sm:gap-[3px]"
          style={{ gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))` }}
        >
          {/* Row-major, so the letters read left to right; the fill animation runs
              by column (--wall-col), the way a year accumulates. */}
          {Array.from({ length: ROWS * COLS }, (_, i) => {
            const row = Math.floor(i / COLS);
            const col = i % COLS;
            const l = MASK[row][col] ? 4 : level(i);
            return (
              <span
                key={i}
                className="wall-cell gh-cell aspect-square rounded-[2px]"
                data-l={l}
                style={{ "--wall-col": col } as React.CSSProperties}
              />
            );
          })}
        </PaintGrid>
        <div className="mt-2.5 flex items-center justify-between gap-1 font-mono text-[0.6875rem] text-dust">
          <span className="hidden sm:inline">psst — the squares are paintable. so are the stickers.</span>
          <span className="flex items-center gap-1">
          <span className="mr-1">Less</span>
          {[0, 1, 2, 3, 4].map((l) => (
            <span key={l} className="gh-cell h-2.5 w-2.5 rounded-[2px]" data-l={l} />
          ))}
          <span className="ml-1">More</span>
          </span>
        </div>
      </div>
      {/* Achievement toasts and the Konami listener, mounted with the hero so
          they exist on the home page only. */}
      <AchievementToast />
    </div>
  );
}
