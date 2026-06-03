"use client";

import { useEffect, useRef, useState } from "react";
import { useView } from "@/components/ViewContext";

/**
 * Hardcoded — every case study shares this 5-section structure (Footy,
 * Heyfood, Bribe; see S10 heading standardisation in SESSION_NOTES). IDs
 * are the rehype-slug output for each `## The X` heading. If a future case
 * study breaks the pattern, this goes per-slug or derives from rendered
 * content; not worth the complexity for 3 standardised entries today.
 */
const SECTIONS = [
  { id: "the-overview", label: "Overview" },
  { id: "the-problem", label: "Problem" },
  { id: "the-design-system", label: "Design" },
  { id: "the-outcome", label: "Outcome" },
  { id: "the-reflection", label: "Reflection" },
];

const SCROLL_TRIGGER = 400; // px past 0 before BTT slides out — user past the header, well into the body
const ACTIVE_TRIGGER = 120; // viewport-top offset where a section is considered "current"
const NAV_LOCK_FALLBACK_MS = 2000; // unlock if `scrollend` doesn't fire (older Safari / interrupted scroll)

/**
 * Case-study table-of-contents bar — horizontal frosted pill at the bottom
 * of the viewspace. Shares the slot with ViewSwitcher (mutually exclusive
 * via ViewContext.detail). Click a label to smooth-scroll to the matching
 * `##` heading via scrollIntoView — deliberately NOT hash navigation, which
 * would collide with the case-study hash routing that drives detail open
 * /close in ProjectsExplorer.
 *
 * The back-to-top button is a sibling tucked behind the bar's right edge
 * (overlap via -translate, invisible via opacity-0). On first scroll it
 * slides out and fades in, appearing to emerge from the bar — Marijana
 * homepage pattern (the BTT that lives in/emerges from her navbar).
 */
export function CaseToc() {
  const { detail } = useView();
  const [activeId, setActiveId] = useState<string>(SECTIONS[0].id);
  const [scrolled, setScrolled] = useState(false);
  // While true, scroll-driven activeId updates are suppressed — set on TOC
  // click so the thumb doesn't visibly cycle through every intermediate
  // section as the smooth scroll passes them. (Refs, not state — toggling
  // wouldn't usefully re-render and we don't want to fight React batching.)
  const navLockRef = useRef(false);
  const navTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!detail) return;
    const onScroll = () => {
      setScrolled(window.scrollY > SCROLL_TRIGGER);
      // Lock window: skip the activeId computation entirely, the click handler
      // already set it to the user's chosen target. (BTT visibility above still
      // updates — that's purely a function of scroll position, not "active".)
      if (navLockRef.current) return;
      // Bottom-of-page shortcut: when the scroll has hit the document
      // bottom, force active = last section. Without this, clicking the
      // final TOC item (e.g. "Reflection") visibly misfires — the page
      // runs out of scroll room before that heading's top reaches the
      // trigger line, so the for-loop never promotes it and the thumb
      // parks on the previous section.
      const atBottom =
        window.scrollY + window.innerHeight >=
        document.documentElement.scrollHeight - 4;
      if (atBottom) {
        setActiveId(SECTIONS[SECTIONS.length - 1].id);
        return;
      }
      // Active = the last section whose top edge has passed the trigger line.
      // Defaults to first section when nothing has passed yet (top of page).
      let last: string = SECTIONS[0].id;
      for (const s of SECTIONS) {
        const el = document.getElementById(s.id);
        if (!el) continue;
        if (el.getBoundingClientRect().top <= ACTIVE_TRIGGER) {
          last = s.id;
        }
      }
      setActiveId(last);
    };
    // Sync on mount and on detail change — the headings remount when the
    // case study switches, so we need to re-evaluate against fresh DOM.
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      // Cleanup pending nav-lock timer on detail change / unmount so we don't
      // leak a stale flag flip into the next case study.
      if (navTimerRef.current !== null) clearTimeout(navTimerRef.current);
    };
  }, [detail]);

  if (!detail) return null;

  const activeIndex = SECTIONS.findIndex((s) => s.id === activeId);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    // Commit the user's pick to the thumb immediately, then suppress scrollspy
    // until the smooth-scroll actually settles — otherwise a final scrollspy
    // pass right before settling can promote the second-to-last section
    // visibly, then snap back. `scrollend` is the canonical settle signal;
    // the timer is a fallback for browsers that don't fire it (Safari < 17.4)
    // or scrolls the user interrupts before they settle.
    setActiveId(id);
    navLockRef.current = true;
    if (navTimerRef.current !== null) clearTimeout(navTimerRef.current);
    const unlock = () => {
      navLockRef.current = false;
    };
    window.addEventListener("scrollend", unlock, { once: true });
    navTimerRef.current = window.setTimeout(unlock, NAV_LOCK_FALLBACK_MS);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
  };

  const scrollToTop = () => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
  };

  return (
    <div className="pointer-events-auto hidden items-center lg:flex">
      <nav
        aria-label="Case-study sections"
        className="frosted relative inline-grid grid-cols-5 rounded-lg p-1"
      >
        {/* Sliding thumb — matches ViewSwitcher pattern, generalised for 5
            segments. Width is `(100% - 8px) / 5` so it equals one segment's
            inner width exactly (8px = the bar's left+right `p-1` padding);
            translateX(N * 100%) then snaps it segment-to-segment cleanly. */}
        <span
          aria-hidden
          className="absolute inset-y-1 left-1 w-[calc((100%_-_8px)/5)] rounded-md bg-switcher-thumb motion-safe:transition-transform motion-safe:duration-200 motion-safe:ease-out"
          style={{ transform: `translateX(${activeIndex * 100}%)` }}
        />
        {SECTIONS.map((s) => {
          const isActive = activeId === s.id;
          return (
            <button
              key={s.id}
              type="button"
              onClick={() => scrollToSection(s.id)}
              aria-current={isActive ? "true" : undefined}
              className="focus-ring relative z-10 rounded-md px-3 py-1.5 text-center text-sm text-foreground"
            >
              {s.label}
            </button>
          );
        })}
      </nav>

      {/* BTT — overlaps the bar's right edge while hidden (-translate + opacity-0),
          slides into its rest position once scrolled. Reduced-motion handled by
          Tailwind's `motion-safe:` on the translate (opacity still fades quickly). */}
      <button
        type="button"
        onClick={scrollToTop}
        aria-label="Back to top"
        // Sized + shaped to match the bar — same `h-10` total height as
        // [text-sm + py-1.5 + p-1] = 40px, same `rounded-lg` outer corner,
        // same frosted material. Reads as a sibling pill that the bar
        // "extends into" rather than a separate floating element.
        className={`frosted focus-ring ml-2 flex h-10 w-10 items-center justify-center rounded-lg text-accent transition-all duration-300 ${
          scrolled
            ? "translate-x-0 opacity-100"
            : "pointer-events-none -translate-x-12 opacity-0"
        }`}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <path d="M12 19V5M5 12l7-7 7 7" />
        </svg>
      </button>
    </div>
  );
}
