"use client";

import { useRef, useState } from "react";
import { ViewSwitcher } from "@/components/ViewSwitcher";
import { CaseToc } from "@/components/CaseToc";
import { ViewProvider } from "@/components/ViewContext";
import { SiteTopBar } from "@/components/SiteTopBar";
import { MobileSheet } from "@/components/MobileSheet";

const MOBILE_SHEET_ID = "mobile-nav-sheet";

/**
 * PROTOTYPE SHELL (proto/single-bar-shell) — single full-bleed top bar for every
 * view, replacing the S13 two-column [viewspace · identity panel] shell.
 *
 * FRAME SWAP, NOT A CONTENT REBUILD: every route's page content still renders
 * unchanged inside the same `max-w-[var(--content-w)]` centered column — it just
 * now centers in the full viewport (the right identity panel is gone) with the
 * SiteTopBar overhead instead of the sticky panel to the side. The IA (the
 * design triad / ViewSwitcher) and the detail-page reading layout are untouched;
 * this only replaces the surrounding chrome.
 *
 * Sheet open-state lives here (lifted so SiteTopBar can toggle it, MobileSheet
 * can read+clear it, and the content can go `inert` when open for a11y).
 *
 * KNOWN OPEN ITEM (for evaluation): the old panel carried HeroBlock as a
 * persistent desktop hero. It's gone here — the mobile sheet still shows it, but
 * on desktop the bar's wordmark is the only identity. Landing-page hero
 * placement is the thing to decide if we keep this direction.
 */
export default function SiteLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [mobileSheetOpen, setMobileSheetOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  return (
    <ViewProvider>
      {/* Flex column pinned to min 100dvh so the bar + content together fill the
          viewport EXACTLY — the sticky bar is in normal flow (takes its own
          height), so main flexes into the *remaining* space. (Putting min-h-dvh
          on main instead made the document bar-height taller than the viewport,
          i.e. a phantom vertical scroll on short pages like contact.) */}
      <div className="flex min-h-dvh flex-col">
        {/* Full-bleed sticky bar — the site's sole nav at every width. Outside
            the inert wrapper so the hamburger stays live to close the sheet. */}
        <SiteTopBar
          open={mobileSheetOpen}
          onToggle={() => setMobileSheetOpen((v) => !v)}
          sheetId={MOBILE_SHEET_ID}
          buttonRef={menuButtonRef}
        />

        <div inert={mobileSheetOpen} className="flex flex-1 flex-col">
          {/* Single centered column. Content keeps its --content-w cap (unchanged
              from the old viewspace); it now centers in the full viewport instead
              of the left grid track. flex-1 fills the height left by the bar so
              short pages still reach the bottom without overflowing it. */}
          <main className="flex-1 px-6 pb-24 pt-8">
            <div className="mx-auto w-full max-w-[var(--content-w)]">{children}</div>
          </main>

        {/* Floating view switcher / case-toc — fixed near the bottom, now simply
            centered under the single content column (was mirroring the old
            two-track grid). pointer-events-none so only the pill is interactive;
            safe-area-inset keeps it clear of the iOS home indicator. */}
        <div className="pointer-events-none fixed inset-x-0 z-20 bottom-[calc(1.5rem+env(safe-area-inset-bottom,0px))]">
          <div className="flex justify-center px-4">
            <ViewSwitcher />
            <CaseToc />
          </div>
        </div>
        </div>
      </div>

      {/* Mobile sheet — overlay, outside the inert wrapper so it stays
          interactive. breakpoint="md" matches SiteTopBar's link-collapse point. */}
      <MobileSheet
        id={MOBILE_SHEET_ID}
        open={mobileSheetOpen}
        onClose={() => setMobileSheetOpen(false)}
        triggerRef={menuButtonRef}
        breakpoint="md"
      />
    </ViewProvider>
  );
}
