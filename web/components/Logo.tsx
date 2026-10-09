// The CherryPick mark: two branches, and a commit lifted from one onto the other.
//
// Drawn rather than shipped as the supplied JPG, because the JPG has an off-white
// ground baked in and would sit on the dark theme as a pale rectangle. As SVG the
// branches take `currentColor`, so they follow --ink in both themes and inherit a
// link's hover colour. The cherries stay cherry in every theme: they ARE the mark.
//
// The wordmark is type, not outlines, set in --font-brand (layout.tsx), so it stays
// crisp at every size and a screen reader gets the name for free.

const CHERRY = "#D1454E";

/** The mark alone. Size it with a height class; the width follows. */
export function LogoMark({ className = "h-7 w-auto" }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="6 6 170 186"
      className={className}
      fill="none"
      strokeLinecap="round"
    >
      {/* The branches. */}
      <path d="M37 60V184M145 30V184" stroke="currentColor" strokeWidth="9" />
      <circle cx="37" cy="140" r="13" fill="currentColor" />
      <circle cx="145" cy="22" r="12" fill="currentColor" />
      {/* The pick: from the big cherry on the left to its copy on the right. */}
      <path d="M37 53C95 55 136 82 145 122" stroke={CHERRY} strokeWidth="9" />
      <circle cx="37" cy="53" r="25" fill={CHERRY} />
      <circle cx="145" cy="122" r="16" fill={CHERRY} />
    </svg>
  );
}

/** Mark plus wordmark. `tagline` adds the "Open source club" line beneath. */
export default function Logo({
  size = "sm",
  tagline = false,
}: {
  size?: "sm" | "lg";
  tagline?: boolean;
}) {
  const lg = size === "lg";
  return (
    <span className={`inline-flex items-center ${lg ? "gap-4" : "gap-2"}`}>
      <LogoMark className={lg ? "h-14 w-auto" : "h-6 w-auto"} />
      <span className="flex flex-col">
        <span
          className={`font-brand font-extrabold leading-none tracking-tight ${
            lg ? "text-4xl" : "text-lg"
          }`}
        >
          CherryPick
        </span>
        {tagline && (
          <span className="mt-2 font-mono text-label uppercase tracking-[0.3em] text-dust">
            Open source club
          </span>
        )}
      </span>
    </span>
  );
}
