// Site achievements, named after GitHub's own profile achievements.
//
// Small things on the home page unlock them — merging the fake PR, peeling a
// sticker, painting the contribution graph, the Konami code. They are kept per
// browser in localStorage (a convenience: if storage is missing they simply unlock
// again next visit) and announced with a window event that AchievementToast shows.

export type AchievementId = "pull-shark" | "quickdraw" | "yolo" | "starstruck" | "galaxy-brain";

export const ACHIEVEMENTS: Record<AchievementId, { emoji: string; name: string; how: string }> = {
  "pull-shark": { emoji: "🦈", name: "Pull Shark", how: "Merged a pull request. A pretend one, but still." },
  quickdraw: { emoji: "⚡", name: "Quickdraw", how: "Merged within 15 seconds of arriving. Read the diff next time." },
  yolo: { emoji: "🤠", name: "YOLO", how: "Peeled a sticker off without asking for review." },
  starstruck: { emoji: "⭐", name: "Starstruck", how: "Painted 20 squares on the contribution graph." },
  "galaxy-brain": { emoji: "🧠", name: "Galaxy Brain", how: "↑ ↑ ↓ ↓ ← → ← → B A. Of course you did." },
};

const KEY = "osc-achievements";
export const EVENT = "osc:achievement";

export function unlocked(): Set<AchievementId> {
  try {
    return new Set(JSON.parse(localStorage.getItem(KEY) ?? "[]"));
  } catch {
    return new Set();
  }
}

/** Unlock once. Returns false if it was already unlocked. */
export function unlock(id: AchievementId): boolean {
  const have = unlocked();
  if (have.has(id)) return false;
  have.add(id);
  try {
    localStorage.setItem(KEY, JSON.stringify([...have]));
  } catch {
    // No storage: the toast still shows, it just will not remember.
  }
  window.dispatchEvent(new CustomEvent(EVENT, { detail: { id, count: have.size } }));
  return true;
}
