"use client";

import { useRef, useState } from "react";
import { ViewSwitcher } from "@/components/ViewSwitcher";
import { CaseToc } from "@/components/CaseToc";
import { ViewProvider } from "@/components/ViewContext";
import { NavMenu } from "@/components/NavMenu";
import { ThemeToggle } from "@/components/ThemeToggle";
import { HeroBlock } from "@/components/HeroBlock";
import { MobileTopBar } from "@/components/MobileTopBar";
import { MobileSheet } from "@/components/MobileSheet";

const MOBILE_SHEET_ID = "mobile-nav-sheet";

/**
 * Shared site shell for all views (projects · product-ideas · contact).
 *
 * RESPONSIVE ARCHITECTURE (S13 rebuild — see SESSION_NOTES):
 *   • lg+ (≥1024px): two-column desktop pattern — viewspace left, persistent
 *     identity panel right (with the sticky weighted-cell grid from S12).
 *   • Below lg: single-column viewspace with a slim MobileTopBar (logo +
 *     menu button) sticky at top, and a bottom-sheet drawer carrying
 *     hero / nav / theme toggle when the user taps the menu. The "persistent
 *     identity panel" semantic becomes a "sticky logo + on-demand sheet."
 *
 * Made a client component because mobile-sheet open state lives here (lifted
 * so MobileTopBar can set it, MobileSheet can read+clear it, and the rest
 * of the page can be marked `inert` when open for keyboard a11y).
 */
export default function SiteLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  return (
    <ViewProvider>
      {/* Mobile sticky top bar — hidden on lg+. */}
      <MobileTopBar
        open={mobileSheetOpen}
        onToggle={() => setMobileSheetOpen((v) => !v)}
        sheetId={MOBILE_SHEET_ID}
        buttonRef={menuButtonRef}
      />

      {/* Everything below the topbar is `inert` while the mobile sheet is
          open — keeps Tab focus inside the sheet, prevents background taps.
          Topbar stays interactive so the menu icon ✕ can also close. */}
      <div inert={mobileSheetOpen}>
        {/* Two-column layout (desktop): [viewspace · navbar].
            - Track 1 (minmax(0,1fr)): the viewspace — fills all width that isn't
              the navbar. Its content (cards / carousel / detail) is capped to
              --content-w and centered, so it stays a constant, readable width and
              surplus width becomes balanced margin. (min 0 lets it shrink.)
            - Track 2 (var(--nav-w)): the white identity panel — a fixed, dial-able
              width that bleeds to the right viewport edge on its own.
            Mobile: single column; the aside is hidden (MobileTopBar + MobileSheet
            carry identity/nav instead). */}
        <div className="grid grid-cols-1 px-6 pb-24 pt-8 lg:min-h-dvh lg:gap-x-8 lg:gap-y-12 lg:grid-cols-[minmax(0,1fr)_var(--nav-w)] lg:px-0">
          {/* Identity panel — DESKTOP ONLY. Hidden on mobile (the sheet
              + topbar take over). The negative top/bottom margins cancel
              the grid's lg pt-8/pb-24 so the white fills to the screen edges. */}
          <aside className="hidden bg-nav-fill lg:col-start-2 lg:row-start-1 lg:-mb-24 lg:-mt-8 lg:block lg:pt-8">
            {/* Weighted-cell grid (lg+): three vertical-centered content cells
                separated by two auto-height accent rules. Ratios 7fr / 10fr / 3fr
                = 35% identity · 50% menu · 15% toggle. Menu stays the densest
                cell (it needs the most room); identity gets generous breathing
                room around the 16px hero; toggle (a single ~40px segmented
                control) fits comfortably even in 15% of the panel. */}
            <div className="text-center lg:sticky lg:top-8 lg:mx-auto lg:grid lg:h-[calc(100dvh-2rem)] lg:max-w-[28rem] lg:grid-rows-[7fr_auto_10fr_auto_3fr] lg:px-8">

              {/* CELL 1 — IDENTITY: logo + hero, centered in the upper cell. */}
              <div className="lg:flex lg:flex-col lg:justify-center">
                <HeroBlock />
              </div>

              {/* RULE 1 — boundary between identity and menu cells.
                  lg:-mx-8 cancels the wrapper's px-8 so the line spans the
                  navbar's full width while cell content stays inset 32px. */}
              <div className="h-1 bg-background lg:-mx-8" aria-hidden />

              {/* CELL 2 — MENU, centered in the middle (10fr) cell. */}
              <div className="lg:flex lg:flex-col lg:justify-center">
                <NavMenu />
              </div>

              {/* RULE 2 — boundary between menu and toggle cells (mirror of #1). */}
              <div className="h-1 bg-background lg:-mx-8" aria-hidden />

              {/* CELL 3 — THEME TOGGLE, centered in the lower cell. */}
              <div className="lg:flex lg:flex-col lg:justify-center">
                <ThemeToggle />
              </div>
            </div>
          </aside>

          {/* Viewspace — fills track 1 on desktop; full-width on mobile.
              Content is capped to --content-w and centered, so each view
              shares one constant, centered width. */}
          <section className="lg:col-start-1 lg:row-start-1">
            <div className="mx-auto w-full max-w-[var(--content-w)]">{children}</div>
          </section>
        </div>

        {/* Floating view switcher / case-toc — fixed near the bottom of the
            viewport, aligned under the viewspace by mirroring the page grid's
            tracks. Must stay in sync with the grid-cols above.
            pointer-events-none so only the pill is interactive.
            Mobile: px-4 (was px-6) so the wider CaseToc bar (5 labelled segments
            + the BTT) has room without crowding. Safe-area-inset-bottom keeps
            the bar clear of the iOS home indicator. */}
        <div className="pointer-events-none fixed inset-x-0 z-20 bottom-[calc(1.5rem+env(safe-area-inset-bottom,0px))]">
          <div className="grid grid-cols-1 gap-x-8 px-4 lg:grid-cols-[minmax(0,1fr)_var(--nav-w)] lg:px-0">
            <div className="flex justify-center lg:col-start-1">
              <ViewSwitcher />
              <CaseToc />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile sheet — overlay, outside the inert wrapper so it remains
          interactive while everything else is blocked. */}
      <MobileSheet
        id={MOBILE_SHEET_ID}
        open={mobileSheetOpen}
        onClose={() => setMobileSheetOpen(false)}
        triggerRef={menuButtonRef}
      />
    </ViewProvider>
  );
}
