"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// `href` → destination. `external` items open in a new tab; internal items are
// real routes. `activeFor` lists the pathnames the item should highlight on
// (defaults to [href]). Matching is exact for "/" and sub-route-prefix for the
// rest (see isActiveFor) — so "design" stays active across projects (/),
// product-ideas, AND the per-case-study routes (/design/<slug>).
type Item = {
  label: string;
  href: string;
  external?: boolean;
  activeFor?: string[];
};

const ITEMS: Item[] = [
  { label: "design", href: "/", activeFor: ["/", "/product-ideas", "/design"] },
  { label: "essays", href: "https://thechukwukaosakwe.wordpress.com/", external: true },
  { label: "newsletter", href: "https://chukwukaosakwe.substack.com/", external: true },
  { label: "contact", href: "/contact" },
];

// An item is active when the current pathname exactly equals one of its
// `activeFor` paths, OR sits underneath one as a sub-route (/design matches
// /design/<slug>). "/" is matched exactly only — prefix-matching it would
// highlight every route.
function isActiveFor(paths: string[], pathname: string): boolean {
  return paths.some(
    (p) => pathname === p || (p !== "/" && pathname.startsWith(p + "/")),
  );
}

// Separated button stack: each item is its own full-width (equal), rounded,
// flat outlined control with a gap between them. Left-aligned; hover fills the
// row; active = --accent-200 fill. (bg lives in the state constants, not
// BASE, to avoid a Tailwind bg-* conflict between inactive white and the
// active fill.)
// `focus-ring` matches the site-wide focus pattern (cards, CaseToc, ViewSwitcher,
// ThemeToggle) — a 2px accent outline at 2px offset on keyboard focus.
// flex+justify-center centers the label in the button; external-link arrow
// sits immediately to the right of the label (gap-2) as a trailing glyph
// rather than pinned to the button's right edge. `group` is here so the
// external-icon can group-hover with the label.
const BASE =
  "group focus-ring flex w-full items-center justify-center gap-2 rounded-lg border px-4 py-3 text-sm font-medium transition";
const INACTIVE = "border-border bg-nav-fill hover:bg-foreground/5 hover:text-accent";
// Active uses --accent-200 (40%) rather than --accent-100 (16%) so it out-
// emphasises the (now-thinner) bracket rules instead of competing with them —
// affordance > chrome.
const ACTIVE = "border-border bg-accent-200 text-foreground";

export function NavMenu() {
  const pathname = usePathname();

  return (
    // mt-8 keeps a tightened 32px section rhythm on mobile (was 48px — too
    // stretched on a single full-width column). lg:mt-0 lets the parent's
    // sticky thirds-grid take over (cells handle vertical centering then).
    <div className="mt-8 lg:mt-0">
      {/* Label is text-base + text-text-muted: bigger than the menu items
          but muted in color and lighter in weight (Nico Moji normal vs items'
          medium sans). Subordinates via color (and a half-step in weight)
          rather than size. Nico Moji preserved so it still echoes
          "chukwuka's matrix" — the two Nico Moji lines bracket the hero.
          text-center is self-contained: desktop panel already cascades it
          from a text-center wrapper, mobile sheet body doesn't — this makes
          NavMenu's label center in both contexts without coupling to parent. */}
      <p
        className="text-center text-base text-text-muted"
        style={{ fontFamily: "var(--font-nico-moji)" }}
      >
        some things i do
      </p>
      <div className="mt-4 flex flex-col gap-2">
        {ITEMS.map((item) => {
          if (item.external) {
            return (
              <a
                key={item.label}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`${BASE} ${INACTIVE}`}
              >
                <span>{item.label}</span>
                <ExternalIcon />
              </a>
            );
          }
          const isActive = isActiveFor(item.activeFor ?? [item.href], pathname);
          return (
            <Link
              key={item.label}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={`${BASE} ${isActive ? ACTIVE : INACTIVE}`}
            >
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

// Arrow-up-right glyph trailing every external link — telegraphs "opens in a
// new tab" before the click. Muted at rest (reads as metadata, not as part of
// the affordance); on hover follows the label to accent via group-hover so
// the whole row warms in sync.
function ExternalIcon() {
  return (
    <svg
      width="14"
      height="14"
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
  );
}
