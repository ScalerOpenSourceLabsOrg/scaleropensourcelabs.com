"use client";

// Collapsible sections, one open at a time — the FAQ's accordion, a page up.
//
// FoldGroup holds which section is open; every Fold inside it reads that. Opening
// one closes whichever was open, for the same reason the FAQ is single-open: the
// outgoing section shuts as the incoming one opens, so a reader is never back at
// the full-length page having clicked their way there.
//
// The head (chip and headline) is always on show and is the whole click target;
// the body is what folds. The explicit button exists for keyboards and screen
// readers — clicks on it bubble to the head's handler, so there is one toggle,
// not two that cancel each other out.
//
// THE CLICKED HEAD STAYS PUT. Closing a long section above the one you just
// opened would otherwise drag the page up by that section's height, and the
// header you clicked would slide off the top of the screen. So for the length of
// the collapse, every frame scrolls back by however far the head has moved.
// Browsers with native scroll anchoring have usually done it already, in which
// case the measured drift is zero and this does nothing.
//
// A Fold with no FoldGroup around it is just a section, always open, no button.

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from "react";

type Ctx = { isOpen: (id: string) => boolean; toggle: (id: string) => void };
const FoldCtx = createContext<Ctx | null>(null);

// A touch longer than the .faq-panel transition, so the last frame of the
// collapse is still being corrected for.
const SETTLE_MS = 380;

export function FoldGroup({
  initial = null,
  allOpen = false,
  children,
}: {
  initial?: string | null;
  /** Every section starts open and each folds on its own, instead of the
   *  one-at-a-time accordion. The home page uses this: a column of collapsed
   *  headlines read as an empty page. */
  allOpen?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState<string | null>(initial);
  // allOpen mode tracks the sections somebody has CLOSED.
  const [closed, setClosed] = useState<Set<string>>(() => new Set());

  const toggle = useCallback(
    (id: string) => {
      if (allOpen) {
        setClosed((cur) => {
          const next = new Set(cur);
          if (next.has(id)) next.delete(id);
          else next.add(id);
          return next;
        });
      } else {
        setOpen((cur) => (cur === id ? null : id));
      }
    },
    [allOpen],
  );
  const isOpen = useCallback(
    (id: string) => (allOpen ? !closed.has(id) : open === id),
    [allOpen, closed, open],
  );

  // A link to /#impact should land on an open section, not a closed one.
  useEffect(() => {
    const fromHash = () => {
      const id = decodeURIComponent(window.location.hash.slice(1));
      if (id && document.querySelector(`[data-fold="${CSS.escape(id)}"]`)) {
        setOpen(id);
        setClosed((cur) => {
          if (!cur.has(id)) return cur;
          const next = new Set(cur);
          next.delete(id);
          return next;
        });
      }
    };
    fromHash();
    window.addEventListener("hashchange", fromHash);
    return () => window.removeEventListener("hashchange", fromHash);
  }, []);

  return <FoldCtx.Provider value={{ isOpen, toggle }}>{children}</FoldCtx.Provider>;
}

export function Fold({
  id,
  head,
  children,
  className,
  label,
}: {
  id: string;
  /** Always visible: the chip and the headline. */
  head: ReactNode;
  /** What collapses. */
  children: ReactNode;
  className?: string;
  /** Names the section, for aria-label and the toggle's accessible name. */
  label: string;
}) {
  const ctx = useContext(FoldCtx);
  const isOpen = ctx ? ctx.isOpen(id) : true;
  const panelId = useId();
  const headRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  // Open AND finished opening. Only then does the body stop clipping — the
  // collapse needs overflow hidden, but left on it would shave the hover lift
  // off every card along the body's edges.
  const [settled, setSettled] = useState(isOpen);
  useEffect(() => {
    if (!isOpen) setSettled(false);
  }, [isOpen]);

  // React 18 has no `inert` prop. A closed body is still in the DOM (there is no
  // height to animate from otherwise), and unlike an FAQ answer it is full of
  // links — so it has to be taken out of the tab order, not just hidden.
  useEffect(() => {
    const el = panelRef.current;
    if (!el) return;
    if (isOpen) el.removeAttribute("inert");
    else el.setAttribute("inert", "");
  }, [isOpen]);

  const onHeadClick = () => {
    if (!ctx) return;
    const head = headRef.current;
    const before = head?.getBoundingClientRect().top ?? 0;
    ctx.toggle(id);
    if (!head) return;
    const start = performance.now();
    const hold = () => {
      const drift = head.getBoundingClientRect().top - before;
      if (Math.abs(drift) > 0.5) {
        window.scrollTo({
          top: window.scrollY + drift,
          behavior: "instant" as ScrollBehavior,
        });
      }
      if (performance.now() - start < SETTLE_MS) requestAnimationFrame(hold);
    };
    requestAnimationFrame(hold);
  };

  return (
    <section
      id={id}
      data-fold={id}
      className={className}
      aria-label={label}
      data-reveal-group
    >
      <div
        ref={headRef}
        className={ctx ? "fold-head" : undefined}
        onClick={ctx ? onHeadClick : undefined}
      >
        <div className="min-w-0 flex-1">{head}</div>
        {ctx && (
          <button
            type="button"
            className="fold-btn"
            aria-expanded={isOpen}
            aria-controls={panelId}
            aria-label={`${isOpen ? "Collapse" : "Expand"}: ${label}`}
          >
            <span className="faq-mark" aria-hidden="true" />
          </button>
        )}
      </div>
      <div
        id={panelId}
        ref={panelRef}
        className="faq-panel fold-panel"
        data-open={isOpen}
        data-settled={isOpen && settled}
        aria-hidden={!isOpen}
        onTransitionEnd={(e) => {
          if (e.target === e.currentTarget && isOpen) setSettled(true);
        }}
      >
        <div>{children}</div>
      </div>
    </section>
  );
}
