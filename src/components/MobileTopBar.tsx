"use client";

import Link from "next/link";
import { ThemeCycle } from "@/components/ThemeCycle";

/**
 * Sticky top bar — the mobile equivalent of the desktop nav panel's
 * persistent-identity contract. Logo + brand on the left (always visible),
 * menu button on the right (opens the bottom sheet with full nav).
 *
 * Hidden on lg+ where the side panel takes over.
 *
 * Safe-area-inset-top padding makes the opaque background extend under
 * iOS notches while content sits below them. Sticky position keeps the
 * bar visible as the user scrolls through work.
 */
export function MobileTopBar({
  open,
  onToggle,
  sheetId,
  buttonRef,
}: {
  open: boolean;
  onToggle: () => void;
  /** id of the controlled sheet — wired via aria-controls for assistive tech. */
  sheetId: string;
  /** Forwarded ref to the menu button — used by the sheet to return focus on close. */
  buttonRef?: React.RefObject<HTMLButtonElement | null>;
}) {
  return (
    <header
      className="sticky top-0 z-30 border-b border-border bg-nav-fill pt-[env(safe-area-inset-top,0px)] lg:hidden"
    >
      <div className="flex h-14 items-center justify-between px-4">
        {/* Logo + brand — link to home. Compact lockup, same logo + Nico Moji
            wordmark as the desktop aside / HeroBlock, laid out for a horizontal
            bar (left-aligned, smaller gap). The Link is the flex container so
            the whole brand row is one tap target. focus-ring carries the site-
            wide keyboard outline; cursor:pointer is implicit via <a>. */}
        <Link
          href="/"
          aria-label="chukwuka's matrix — home"
          className="focus-ring -ml-1 flex items-center gap-3 rounded-md px-1 py-1"
        >
          <span
            aria-hidden
            className="block h-5 w-6 shrink-0 bg-accent"
            style={{
              maskImage: "url(/portfolio-logo.png)",
              WebkitMaskImage: "url(/portfolio-logo.png)",
              maskSize: "contain",
              WebkitMaskSize: "contain",
              maskRepeat: "no-repeat",
              WebkitMaskRepeat: "no-repeat",
              maskPosition: "center",
              WebkitMaskPosition: "center",
            }}
          />
          <p
            className="text-base text-text-muted"
            style={{ fontFamily: "var(--font-nico-moji)" }}
          >
            chukwuka&apos;s matrix
          </p>
        </Link>

        {/* Right cluster — theme cycle + menu button. Wrapped in a flex group
            so justify-between on the parent still pins brand to the left and
            this cluster to the right. gap-1 is tight (8px) since both children
            are already 44px circular chips with their own visual separation. */}
        <div className="-mr-2 flex items-center gap-1">
        <ThemeCycle />
        {/* Menu button — 44×44 touch target (h-11 w-11). Icon swaps ☰ → ✕
            on open. aria-expanded + aria-controls wire it to the sheet for
            assistive tech; aria-label gives a verbal version that changes
            with state. */}
        <button
          ref={buttonRef}
          type="button"
          onClick={onToggle}
          aria-expanded={open}
          aria-controls={sheetId}
          aria-haspopup="dialog"
          aria-label={open ? "Close menu" : "Open menu"}
          // Matches the sheet's close button — soft circular chip so they
          // read as the same element type across the open/close pair.
          className="focus-ring flex h-11 w-11 items-center justify-center rounded-full bg-foreground/5 text-foreground transition-colors hover:bg-foreground/10"
        >
          {open ? (
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          ) : (
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          )}
        </button>
        </div>
      </div>
    </header>
  );
}
