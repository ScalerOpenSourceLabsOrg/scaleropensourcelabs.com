"use client";

// A sticker you can pick up and move.
//
// Laptop-lid stickers are the one piece of decoration every developer actually
// owns, so the hero carries a few — and they peel off. Drag one anywhere; it lifts
// (bigger shadow, slight scale) while held and stays where you drop it for the rest
// of the visit. Pointer events, so it works with a mouse, a pen or a finger.
//
// Purely decorative: aria-hidden, not focusable, and a reader who never touches one
// loses nothing. Positioned by the caller with `className` (absolute insets).

import { useRef, useState, type ReactNode } from "react";
import { unlock } from "@/components/fx/achievements";

export default function PeelSticker({
  children,
  className = "",
  tilt = 0,
  tone = "paper",
}: {
  children: ReactNode;
  className?: string;
  tilt?: number;
  tone?: "paper" | "purple" | "blue" | "green" | "yellow";
}) {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [held, setHeld] = useState(false);
  const start = useRef<{ px: number; py: number; x: number; y: number } | null>(null);

  return (
    <span
      aria-hidden
      className={`peel peel-${tone} ${held ? "is-held" : ""} ${className}`}
      style={{
        transform: `translate(${pos.x}px, ${pos.y}px) rotate(${held ? 0 : tilt}deg) scale(${held ? 1.08 : 1})`,
      }}
      onPointerDown={(e) => {
        e.currentTarget.setPointerCapture(e.pointerId);
        start.current = { px: e.clientX, py: e.clientY, x: pos.x, y: pos.y };
        setHeld(true);
      }}
      onPointerMove={(e) => {
        const s = start.current;
        if (!s) return;
        // The page is zoomed (see --zoom in globals.css), so a screen pixel is
        // more than one CSS pixel here; divide so the sticker tracks the pointer.
        const z = parseFloat(getComputedStyle(document.documentElement).zoom) || 1;
        setPos({ x: s.x + (e.clientX - s.px) / z, y: s.y + (e.clientY - s.py) / z });
      }}
      onPointerUp={() => {
        start.current = null;
        setHeld(false);
        // Moved it more than a nudge: that is a peel. Unlocks YOLO once.
        if (Math.abs(pos.x) + Math.abs(pos.y) > 30) unlock("yolo");
      }}
      onPointerCancel={() => {
        start.current = null;
        setHeld(false);
      }}
    >
      {children}
    </span>
  );
}
