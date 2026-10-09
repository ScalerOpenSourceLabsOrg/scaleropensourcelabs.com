"use client";

// A member's portrait, with an identicon fallback that is a designed state rather
// than an error state.
//
// THE FALLBACK IS GITHUB'S OWN, on purpose. It used to be the initials over one of
// four pastel gradients, which is the stock placeholder of every generated landing
// page and read that way. Every person on this site has a GitHub account, and the
// avatar GitHub shows for somebody who has not uploaded one is a mirrored 5x5
// identicon on a light grey field. So the empty state here is that: the same thing
// a reader would see on the person's profile, which is the one placeholder that is
// native to the work rather than invented for the page.
//
// Deterministic per name, so a person keeps the same pattern across the hall, the
// team page and the home page. Fixed colours rather than theme tokens: it stands in
// for a picture, and a picture does not invert.
//
// The failure detection is the same lesson learned earlier in this project:
// `onError` alone never fires for an image the browser already finished failing
// before React hydrated, so the element's own state is checked on mount too.

import { useEffect, useRef, useState } from "react";

/** FNV-1a over the name: stable, cheap, and well spread for short strings. */
function hash(name: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < name.length; i++) {
    h ^= name.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h >>> 0;
}

/** The 5x5 grid, mirrored down the middle column like GitHub's: 15 bits decide it. */
function cells(h: number): [number, number][] {
  const on: [number, number][] = [];
  for (let col = 0; col < 3; col++) {
    for (let row = 0; row < 5; row++) {
      if ((h >>> (col * 5 + row)) & 1) {
        on.push([col, row]);
        if (col < 2) on.push([4 - col, row]);
      }
    }
  }
  // An all-empty grid is a blank tile, which reads as broken. Light the centre.
  return on.length ? on : [[2, 2]];
}

/** GitHub's light-grey identicon field. */
const FIELD = "#F0F0F0";

export default function Portrait({
  name,
  photo,
  className = "",
  priority = false,
}: {
  name: string;
  photo?: string;
  className?: string;
  priority?: boolean;
}) {
  const [failed, setFailed] = useState(!photo);
  const img = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const el = img.current;
    if (el && el.complete && el.naturalWidth === 0) setFailed(true);
  }, []);

  if (failed) {
    const h = hash(name.trim().toLowerCase());
    // Hue from the high bits (the low 15 drew the grid); saturation and lightness
    // fixed at a middle value that holds on the grey field.
    const colour = `hsl(${(h >>> 15) % 360} 55% 52%)`;
    return (
      <div
        className={`relative overflow-hidden ${className}`}
        role="img"
        aria-label={name}
        style={{ backgroundColor: FIELD }}
      >
        {/* A 6-unit box around a 5-unit grid gives GitHub's half-cell margin.
            `meet` keeps the cells square inside any card aspect. */}
        <svg
          aria-hidden
          viewBox="-0.5 -0.5 6 6"
          preserveAspectRatio="xMidYMid meet"
          className="absolute inset-0 h-full w-full"
          shapeRendering="crispEdges"
        >
          {cells(h).map(([x, y]) => (
            <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill={colour} />
          ))}
        </svg>
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      ref={img}
      src={photo}
      alt={name}
      loading={priority ? "eager" : "lazy"}
      onError={() => setFailed(true)}
      className={`object-cover shadow-[inset_0_0_0_1px_rgba(0,0,0,0.10)] ${className}`}
    />
  );
}
