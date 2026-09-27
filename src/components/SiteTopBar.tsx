"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ThemeCycle } from "@/components/ThemeCycle";
import { NAV_ITEMS, isActiveFor } from "@/components/NavMenu";

/**
 * PROTOTYPE (proto/single-bar-shell) — the site's horizontal top bar, promoted
 * from the merged-grid wireframe. Full-bleed, sticky at the top edge; wordmark
 * left, inline nav + theme control right. Replaces the two-column shell's
 * desktop identity panel AND the mobile MobileTopBar with one bar at every
 * width.
 *
 * Responsive ranges (mirrors the merged-grid wireframe it came from):
 *   • <md   : inline links collapse → hamburger opens the shared MobileSheet;
 *             ThemeCycle icon for theme.
 *   • md–lg : inline links; ThemeCycle icon (segmented toggle would crowd).
 *   • ≥lg   : inline links; segmented ThemeToggle (room for the 3-up track).
 *
 * Sticky (not fixed) so it reserves its own space — no padding-clearance math.
 * Nav destinations come from NAV_ITEMS (shared with NavMenu) so the horizontal
 * bar and the sheet's vertical stack can't drift; active state is derived from
 * the pathname the same way NavMenu does.
 */
export function SiteTopBar({
  open,
  onToggle,
  sheetId,
  buttonRef,
}: {
  open: boolean;
  onToggle: () => void;
  sheetId: string;
  buttonRef?: React.RefObject<HTMLButtonElement | null>;
}) {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-40 w-full border-b-4 border-border bg-nav-fill/85 backdrop-blur">
      {/* Three top-level sections — wordmark · links · theme control — as direct
          flex children so justify-between distributes the slack EVENLY between
          them (no lopsided void). At <md the links section is display:none, so
          it falls out of the distribution and the remaining two push to the
          edges. gap-6 is just a min floor for the narrow crossover widths. */}
      <div className="flex items-center justify-between gap-6 px-12 py-3">
        {/* Wordmark — CSS-mask logo tracks --accent (same technique as HeroBlock
            / MobileTopBar). Goes inert with the sheet so the open-sheet focus
            trap is sealed; the hamburger stays live as the ✕. */}
        <Link
          href="/"
          inert={open}
          aria-label="chukwuka's matrix — home"
          className="focus-ring flex shrink-0 items-center gap-3 rounded-none px-1 py-1"
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
          <span
            className="whitespace-nowrap text-[clamp(1rem,3vw,1.125rem)] text-text-muted"
            style={{ fontFamily: "var(--font-nico-moji)" }}
          >
            chukwuka&apos;s matrix
          </span>
        </Link>

        {/* SECTION 2 — inline links (≥md). Fluid gap: 20px where they first
            appear (~768) → 32px on wide screens. Collapse into the hamburger
            below md. */}
        <div
          className="hidden items-center text-base font-medium md:flex"
          style={{ gap: "clamp(1.25rem, 0.13rem + 2.3vw, 2rem)" }}
        >
            {NAV_ITEMS.map((item) =>
              item.external ? (
                <a
                  key={item.label}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="focus-ring group inline-flex items-center gap-1 rounded-none text-text-muted transition-colors hover:text-accent"
                >
                  {item.label}
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden
                    className="shrink-0 text-text-muted transition-colors group-hover:text-accent"
                  >
                    <path d="M7 17L17 7M7 7h10v10" />
                  </svg>
                </a>
              ) : (
                (() => {
                  const active = isActiveFor(item.activeFor ?? [item.href], pathname);
                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={`focus-ring rounded-none transition-colors hover:text-accent ${
                        active
                          ? "text-accent outline outline-2 outline-offset-4 outline-accent"
                          : "text-text-muted"
                      }`}
                    >
                      {item.label}
                    </Link>
                  );
                })()
              ),
            )}
        </div>

        {/* SECTION 3 — theme control. The segmented toggle (≥lg) and the compact
            cluster (<lg) are mutually exclusive by breakpoint; wrapped together
            so they read as one flex section for the even distribution. */}
        <div className="flex items-center">
          {/* Segmented theme toggle — WIDE DESKTOP only (≥lg), where the bar has
              room for the 3-up track. Below lg the compact ThemeCycle stands in.
              [&_*]:!rounded-none squares it to match the bar's radius:0 language
              (the emerging default) without editing the shared ThemeToggle. */}
          <div className="hidden w-36 shrink-0 [&_*]:!rounded-none lg:block">
            <ThemeToggle />
          </div>

          {/* Compact cluster (<lg) — ThemeCycle icon, plus the hamburger once the
              inline links have collapsed (<md). ThemeCycle goes inert with the
              sheet; the menu button stays live so it doubles as the ✕ close. */}
          <div className="flex items-center gap-1 lg:hidden">
            <span className="contents" inert={open}>
              <ThemeCycle />
            </span>
            <button
              ref={buttonRef}
              type="button"
              onClick={onToggle}
              aria-expanded={open}
              aria-controls={sheetId}
              aria-haspopup="dialog"
              aria-label={open ? "Close menu" : "Open menu"}
              className="focus-ring flex h-11 w-11 items-center justify-center rounded-full bg-foreground/5 text-foreground transition-colors hover:bg-foreground/10 md:hidden"
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
                {open ? (
                  <path d="M18 6 6 18M6 6l12 12" />
                ) : (
                  <path d="M4 7h16M4 12h16M4 17h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
