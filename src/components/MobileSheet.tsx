"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { HeroBlock } from "@/components/HeroBlock";
import { NavMenu } from "@/components/NavMenu";

/**
 * Bottom sheet — the mobile counterpart to the desktop nav panel.
 * Slides up from the bottom edge (motion source matches the existing
 * ViewSwitcher/CaseToc chrome) carrying hero copy + nav + theme toggle.
 *
 * STRUCTURE: backdrop and sheet are SIBLINGS, both directly `position: fixed`.
 * An earlier version nested them inside `fixed inset-0` but that anchored
 * everything to the layout viewport — on Chrome Android with the URL bar
 * visible, the layout viewport extends below the visible area, leaving
 * only the sheet's top edge poking into the visible region. Direct
 * `fixed bottom-0` pins the sheet to the visible viewport's bottom edge
 * reliably across browsers.
 *
 * SCROLL LOCK uses the position-fixed pattern (capture scrollY, freeze body,
 * restore on close). Plain `overflow: hidden` doesn't reliably block touch-
 * scroll on Chrome Android, and the address-bar gesture can still fire and
 * resize the viewport mid-interaction.
 *
 * Close paths: backdrop click · ✕ button · ESC · route change.
 */
export function MobileSheet({
  id,
  open,
  onClose,
  triggerRef,
}: {
  /** Matches `aria-controls` on the trigger button. */
  id: string;
  open: boolean;
  onClose: () => void;
  /** Ref to the menu-button that opened the sheet — focus returns here on close. */
  triggerRef: React.RefObject<HTMLButtonElement | null>;
}) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();
  const wasOpenRef = useRef(false);

  // Auto-close on route change. A NavMenu <Link> click navigates and we want
  // the sheet to dismiss as the new route lands. Watching pathname (not the
  // open flag) is the right signal — open changes for many reasons; route
  // change specifically means "user just used the menu."
  useEffect(() => {
    if (open) onClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // ESC to close + bulletproof body scroll lock. The position-fixed pattern
  // (vs plain overflow:hidden) reliably prevents Chrome Android's address-
  // bar collapse gesture from firing while the sheet is open, and survives
  // mobile Safari's elastic-scroll bounce. Captures + restores scrollY so
  // the page doesn't jump on lock/unlock.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    const scrollY = window.scrollY;
    const body = document.body;
    const prev = {
      overflow: body.style.overflow,
      position: body.style.position,
      top: body.style.top,
      width: body.style.width,
    };
    body.style.overflow = "hidden";
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.width = "100%";
    window.addEventListener("keydown", onKey);
    return () => {
      body.style.overflow = prev.overflow;
      body.style.position = prev.position;
      body.style.top = prev.top;
      body.style.width = prev.width;
      window.scrollTo(0, scrollY);
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  // Focus management: move focus into the sheet on open, restore to the
  // trigger on close. wasOpenRef tracks "did we transition from open → closed"
  // so we don't fight whatever already has focus on mount.
  useEffect(() => {
    if (open) {
      // Next tick — let the transition start before stealing focus, so screen
      // readers announce the dialog opening rather than a stray button focus.
      const t = window.setTimeout(() => closeButtonRef.current?.focus(), 0);
      wasOpenRef.current = true;
      return () => window.clearTimeout(t);
    }
    if (wasOpenRef.current) {
      triggerRef.current?.focus();
      wasOpenRef.current = false;
    }
  }, [open, triggerRef]);

  return (
    <>
      {/* Backdrop — its own fixed full-viewport layer. Click closes. */}
      <button
        type="button"
        tabIndex={-1}
        aria-label="Close menu"
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-foreground/30 backdrop-blur-sm transition-opacity duration-200 lg:hidden ${
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      {/* Sheet — directly fixed at bottom-0 so it pins to the visible
          viewport's bottom edge (not the layout viewport, which on Chrome
          Android extends past visible when the URL bar shows). z-50 sits
          above the backdrop. overscroll-behavior:contain prevents touch-
          gestures inside the sheet from propagating to the underlying body. */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${id}-title`}
        aria-hidden={!open}
        // `inert` (not just aria-hidden) when closed: aria-hidden removes the
        // sheet from the a11y tree but leaves its Close button + NavMenu links
        // in the tab order, so keyboard users could Tab into a closed menu.
        // inert removes descendants from focus/pointer/a11y entirely.
        inert={!open}
        id={id}
        className={`fixed inset-x-0 bottom-0 z-50 max-h-[85dvh] overflow-y-auto overscroll-contain rounded-t-2xl bg-nav-fill pb-[max(1.5rem,env(safe-area-inset-bottom,0px))] shadow-2xl motion-safe:transition-transform motion-safe:duration-300 motion-safe:ease-out lg:hidden ${
          open ? "pointer-events-auto translate-y-0" : "pointer-events-none translate-y-full"
        }`}
      >
        {/* Header row — hidden a11y title + close button. Close is the first
            focusable; tab order then goes through NavMenu items + toggle.
            (The earlier grab-handle pill above this row was dropped: it
            implied drag-to-dismiss, which we don't actually support — false
            affordance. The X is the sheet's sole explicit close marker now;
            backdrop tap + ESC still work as silent close paths.) */}
        <div className="flex items-center justify-between px-6 pt-4">
          <h2 id={`${id}-title`} className="sr-only">
            Menu
          </h2>
          <span aria-hidden />
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            // Soft circular chip — bg-foreground/5 (same fill NavMenu hovers
            // to) reads as a quiet "this is a control" container rather than
            // a bare standout icon. hover bumps to /10 for subtle feedback.
            className="focus-ring -mr-2 flex h-11 w-11 items-center justify-center rounded-full bg-foreground/5 text-foreground transition-colors hover:bg-foreground/10"
          >
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
          </button>
        </div>

        {/* Sheet body. HeroBlock (logo + brand + hero text) → NavMenu.
            Theme toggle lives in the topbar now (ThemeCycle compact button)
            so it's persistent — no longer rendered here.
            Internal spacing mirrors the desktop rhythm (mt-8 between
            sections), which feels right when the sheet is the full focus. */}
        <div className="px-6 pb-6">
          <HeroBlock />
          <div className="mt-8">
            <NavMenu />
          </div>
        </div>
      </div>
    </>
  );
}
