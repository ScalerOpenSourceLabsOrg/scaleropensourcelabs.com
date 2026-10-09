"use client";

// Makes the hero's contribution graph paintable: click a square to bump it one
// level greener (4 wraps back to empty), or hold and drag to paint a stroke.
// Twenty squares painted unlocks Starstruck.
//
// Event delegation on the grid rather than state per cell: the 364 squares are
// server-rendered, and painting only rewrites their data-l attribute, which React
// never re-renders over because their props never change.

import { useRef, type ReactNode } from "react";
import { unlock } from "@/components/fx/achievements";

export default function PaintGrid({
  children,
  className = "",
  style,
}: {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  const painted = useRef(new Set<Element>());
  const down = useRef(false);

  const paint = (target: EventTarget | null) => {
    const el = target instanceof HTMLElement ? target.closest(".gh-cell") : null;
    if (!el) return;
    const next = (Number(el.getAttribute("data-l")) + 1) % 5;
    el.setAttribute("data-l", String(next));
    painted.current.add(el);
    if (painted.current.size >= 20) unlock("starstruck");
  };

  return (
    <div
      className={`gh-paint ${className}`}
      style={style}
      onPointerDown={(e) => {
        down.current = true;
        paint(e.target);
      }}
      onPointerOver={(e) => {
        if (down.current) paint(e.target);
      }}
      onPointerUp={() => (down.current = false)}
      onPointerLeave={() => (down.current = false)}
    >
      {children}
    </div>
  );
}
