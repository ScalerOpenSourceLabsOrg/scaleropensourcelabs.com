"use client";

// The toast for site achievements (see achievements.ts), and the Konami listener.
//
// Bottom-left, stacked, each one sliding in and leaving after a few seconds. An
// aria-live region, so an unlock is announced rather than only seen.

import { useEffect, useState } from "react";
import { celebrate } from "@/components/fx/celebrate";
import { ACHIEVEMENTS, EVENT, unlock, type AchievementId } from "@/components/fx/achievements";

const TOTAL = Object.keys(ACHIEVEMENTS).length;
const KONAMI = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];

type Toast = { key: number; id: AchievementId; count: number };

export default function AchievementToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    let n = 0;
    const onUnlock = (e: Event) => {
      const { id, count } = (e as CustomEvent<{ id: AchievementId; count: number }>).detail;
      const key = ++n;
      setToasts((t) => [...t, { key, id, count }]);
      window.setTimeout(() => setToasts((t) => t.filter((x) => x.key !== key)), 5200);
    };
    window.addEventListener(EVENT, onUnlock);

    let pos = 0;
    const onKey = (e: KeyboardEvent) => {
      const want = KONAMI[pos];
      pos = e.key === want || e.key.toLowerCase() === want ? pos + 1 : e.key === KONAMI[0] ? 1 : 0;
      if (pos === KONAMI.length) {
        pos = 0;
        if (unlock("galaxy-brain")) void celebrate();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener(EVENT, onUnlock);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <div className="pointer-events-none fixed bottom-5 left-5 z-[70] flex flex-col gap-2" aria-live="polite">
      {toasts.map((t) => {
        const a = ACHIEVEMENTS[t.id];
        return (
          <div key={t.key} className="ach-toast pointer-events-auto">
            <span className="ach-medal" aria-hidden>
              {a.emoji}
            </span>
            <div className="min-w-0">
              <p className="font-mono text-[0.6875rem] uppercase tracking-wider text-dust">
                Achievement unlocked · {t.count}/{TOTAL}
              </p>
              <p className="font-semibold text-ink">{a.name}</p>
              <p className="text-sm text-haze">{a.how}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
