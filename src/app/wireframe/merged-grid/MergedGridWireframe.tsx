"use client";

import { useEffect, useRef, useState, type Ref } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ThemeCycle } from "@/components/ThemeCycle";
import { MobileSheet } from "@/components/MobileSheet";

const MOBILE_SHEET_ID = "merged-grid-nav-sheet";

export interface WireEntry {
  slug: string;
  section: "work" | "lab";
  href: string;
  title: string;
  type: string | null;
  stage: string | null;
  blurb: string | null;
  image: string | null;
  video: string | null;
  /** Per-entry cover aspect-ratio (CSS value, e.g. "16 / 9"). When set, the
   *  cover uses it instead of the card style's uniform frame — the mechanism a
   *  future brand/gallery entry uses to declare its own cover shape. */
  ratio: string | null;
}

type CardStyle = "contained" | "editorial";

// Baked layout values. The grid is full-bleed (two equal halves split at a
// centered vertical divider); a card is capped to `cardCap` and centered within
// its half, and `cellPad` is the uniform breathing room (edge ↔ card, divider ↔
// card, and row rhythm). Tuned by eye via the (now-removed) live dials.
const DEFAULTS = {
  cardCap: 48,
  cellPad: 72,
  cardStyle: "contained" as CardStyle,
};

export function MergedGridWireframe({ entries }: { entries: WireEntry[] }) {
  // Layout values — these were live "airiness dials"; baked to the values tuned
  // by eye once the design shipped to the real grid at `/` (see DesignGrid).
  const cardCap = DEFAULTS.cardCap;
  const cellPad = DEFAULTS.cellPad;
  const cardStyle = DEFAULTS.cardStyle;

  // Column count is viewport-driven: two-up at ≥1024, single column below.
  const [winW, setWinW] = useState(0);

  // The top bar is fixed (out of flow), so the page must pad itself down to
  // clear it. Measure its real height so the hero clears it with the SAME 48px
  // gap the hero keeps below itself (mb-12) — symmetric air on load. Seeded at
  // an estimate to avoid a first-paint jump.
  const bar = useRef<HTMLElement>(null);
  const [barH, setBarH] = useState(66);

  // Mobile nav sheet (≤md): the inline links collapse into a hamburger that
  // opens the shared bottom sheet. State lives here so TopBar can toggle it,
  // MobileSheet can read+clear it, and the page can go `inert` while it's open.
  const [sheetOpen, setSheetOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onResize = () => setWinW(window.innerWidth);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    const el = bar.current;
    if (!el) return;
    const measure = () => setBarH(el.getBoundingClientRect().height);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const twoUp = winW >= 1024;
  const cols = twoUp ? 2 : 1;

  // Chunk into rows of `cols` so each row can be wrapped by its own full-bleed
  // horizontal rule.
  const rows: WireEntry[][] = [];
  for (let i = 0; i < entries.length; i += cols) {
    rows.push(entries.slice(i, i + cols));
  }

  return (
    // paddingTop = measured bar height + 48px, so the hero clears the fixed bar
    // with the same 48px gap it keeps below itself (the section's mb-12).
    <div className="min-h-dvh pb-12" style={{ paddingTop: barH + 48 }}>
      {/* Everything except the top bar + sheet goes `inert` while the mobile
          sheet is open — keeps Tab focus inside the sheet, blocks background
          taps. The hamburger (in TopBar) stays live so it can also close. */}
      <div inert={sheetOpen}>
      {/* Hero intro — the identity blurb, promoted into the space the dev
          billing vacated. The wordmark itself lives in the top bar, so this
          is copy only. */}
      <section
        className="mx-auto mb-12 px-6 text-center"
        style={{ maxWidth: "42rem" }}
      >
        <h1 className="text-[clamp(1rem,2vw,1.25rem)] font-medium leading-relaxed text-pretty">
          hello, i&apos;m chukwuka and i like to design (and make) cool stuff.
        </h1>
      </section>

      {/* Full-bleed lattice: horizontal rules run the full viewport width (off
          both edges); a centered vertical divider (right border of the left
          column) splits the viewport into two equal halves and meets the rules
          to form crosses. The grid itself is full width — a card is capped to
          `cardCap` and CENTERED within its half (justify-center on the cell),
          so its breathing room is measured from the viewport edge, not from a
          capped-and-centered pair. `cellPad` is the min inset + row rhythm. */}
      <div>
        {rows.map((row, r) => (
          <div key={r}>
            <div className="h-px w-full bg-border" aria-hidden />
            <div className={`grid ${twoUp ? "grid-cols-2" : "grid-cols-1"}`}>
              {row.map((e, ci) => (
                <div
                  key={e.slug}
                  className={`flex justify-center ${
                    twoUp && ci === 0 ? "border-r border-border" : ""
                  }`}
                  style={{ padding: cellPad }}
                >
                  <div className="w-full" style={{ maxWidth: `${cardCap}rem` }}>
                    {cardStyle === "contained" ? (
                      <ContainedCard entry={e} />
                    ) : (
                      <EditorialCard entry={e} />
                    )}
                  </div>
                </div>
              ))}
              {/* Empty trailing cell so a lone last card keeps its column (and
                  its divider) instead of stretching across the row. */}
              {row.length < cols && <div aria-hidden />}
            </div>
          </div>
        ))}
        <div className="h-px w-full bg-border" aria-hidden />
      </div>
      </div>

      <TopBar
        barRef={bar}
        sheetOpen={sheetOpen}
        onToggleSheet={() => setSheetOpen((v) => !v)}
        sheetId={MOBILE_SHEET_ID}
        menuButtonRef={menuButtonRef}
      />

      {/* Shared bottom sheet — same component the live site uses; `breakpoint`
          pins its visibility to the wireframe's md collapse point. */}
      <MobileSheet
        id={MOBILE_SHEET_ID}
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        triggerRef={menuButtonRef}
        breakpoint="md"
      />
    </div>
  );
}

/* ---- Top bar nav --------------------------------------------------------- */

// The reclaimed nav (S32 direction: slim sticky top bar). Full-width, pinned
// to the top edge; identity wordmark at left, menu + theme toggle at right.
// The grid flows full-bleed beneath it. Self-contained (not the site
// NavMenu/HeroBlock, which are vertical panel/sheet units) so the wireframe
// stays free of the two-column shell.
const NAV_ITEMS: { label: string; href: string; external?: boolean; active?: boolean }[] = [
  { label: "design", href: "/", active: true }, // this IS the design view
  { label: "essays", href: "/essays" },
  { label: "newsletter", href: "https://chukwukaosakwe.substack.com/", external: true },
  { label: "contact", href: "/contact" },
];

function TopBar({
  barRef,
  sheetOpen,
  onToggleSheet,
  sheetId,
  menuButtonRef,
}: {
  barRef: Ref<HTMLElement>;
  sheetOpen: boolean;
  onToggleSheet: () => void;
  sheetId: string;
  menuButtonRef: Ref<HTMLButtonElement>;
}) {
  return (
    <nav
      ref={barRef}
      // Full-bleed at every width: pinned edge-to-edge with just a bottom rule.
      // The ¾-width floating bracket bar was dropped so the inline nav has the
      // full viewport to redistribute at the md collapse boundary (~768px),
      // where the ¾ version left too little room. Coherent with the full-bleed
      // lattice below (its rules already run edge to edge). Reinstate ¾ at xl
      // later if the floating-bracket look is wanted on very wide screens.
      className="fixed top-0 left-0 z-40 w-full border-b-4 border-border bg-nav-fill/85 backdrop-blur"
    >
      <div className="flex items-center justify-between gap-8 px-6 py-3">
        {/* Wordmark — CSS-mask logo tracks --accent (same technique as HeroBlock). */}
        <a
          href="/"
          aria-label="chukwuka's matrix — home"
          inert={sheetOpen}
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
        </a>

        {/* Menu + theme toggle grouped at the right. */}
        <div className="flex items-center gap-8">
          {/* Menu links — inline (horizontal) here rather than the panel's
              vertical button stack. Collapse into the hamburger at ≤md. Gap is
              fluid: tightens to 20px where the inline nav first appears (~768),
              opens to 32px on wide screens. clamp bounds it; the 2.3vw slope is
              calibrated to hit both ends across 768→1280. */}
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
                <a
                  key={item.label}
                  href={item.href}
                  aria-current={item.active ? "page" : undefined}
                  className={`focus-ring rounded-none transition-colors hover:text-accent ${
                    item.active
                      ? "text-accent outline outline-2 outline-offset-4 outline-accent"
                      : "text-text-muted"
                  }`}
                >
                  {item.label}
                </a>
              ),
            )}
          </div>
          {/* Segmented theme toggle — WIDE DESKTOP only (≥lg), where the bar
              has room for the 3-up track. Below lg it crowds the inline nav, so
              the compact ThemeCycle stands in instead. Widened (w-36) so the
              segments breathe. [&_*]:!rounded-none locally squares the shared
              control so we can eyeball radius:0 without editing the real
              ThemeToggle (used across the live site). Border stays the frosted
              track's native 1px. */}
          <div className="hidden w-36 shrink-0 [&_*]:!rounded-none lg:block">
            <ThemeToggle />
          </div>

          {/* Compact cluster (<lg) — ThemeCycle icon, plus the hamburger once
              the inline links have collapsed (<md). The hamburger opens the
              shared MobileSheet; ThemeCycle goes inert with the sheet, but the
              menu button stays live so it doubles as the ✕ close. gap-1 (8px)
              since both are chips (only both visible <md; 768–1023 = cycle
              alone). */}
          <div className="flex items-center gap-1 lg:hidden">
            <span className="contents" inert={sheetOpen}>
              <ThemeCycle />
            </span>
            <button
              ref={menuButtonRef}
              type="button"
              onClick={onToggleSheet}
              aria-expanded={sheetOpen}
              aria-controls={sheetId}
              aria-haspopup="dialog"
              aria-label={sheetOpen ? "Close menu" : "Open menu"}
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
                {sheetOpen ? (
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

/** Media fill — looping muted clip when present, else the static cover. */
function Media({ entry }: { entry: WireEntry }) {
  if (entry.video) {
    return (
      <video
        className="h-full w-full object-cover"
        src={entry.video}
        poster={entry.image ?? undefined}
        autoPlay
        muted
        loop
        playsInline
      />
    );
  }
  if (entry.image) {
    // Plain <img> (not next/image) — a wireframe doesn't need the optimizer,
    // and it keeps this file free of server plumbing. Real build uses next/image.
    // eslint-disable-next-line @next/next/no-img-element
    return <img className="h-full w-full object-cover" src={entry.image} alt="" />;
  }
  return null;
}

/** Contained — 4:3 cover + full metadata (eyebrow/title/blurb). No ring, no
 *  radius: the cover sits clean in its cell. */
function ContainedCard({ entry }: { entry: WireEntry }) {
  return (
    <a
      href={entry.href}
      className="focus-ring group flex w-full flex-col text-center"
    >
      {/* Uniform 4:3 frame unless the entry declares its own ratio. */}
      <div
        className="relative w-full overflow-hidden bg-image-placeholder"
        style={{ aspectRatio: entry.ratio ?? "4 / 3" }}
      >
        <Media entry={entry} />
      </div>
      <div className="mt-4 flex flex-col">
        <h2 className="text-2xl font-semibold tracking-tight text-balance transition-colors group-hover:text-accent group-focus-visible:text-accent">
          {entry.title}
        </h2>
        {entry.blurb && (
          <p className="mx-auto mt-2 line-clamp-3 max-w-[28rem] text-text-muted">
            {entry.blurb}
          </p>
        )}
      </div>
    </a>
  );
}

/** Editorial — 16:9 canvas + eyebrow, the blurb carried as the big title. No
 *  ring, no radius. */
function EditorialCard({ entry }: { entry: WireEntry }) {
  return (
    <a href={entry.href} className="focus-ring group block text-center">
      {/* Uniform 16:9 frame unless the entry declares its own ratio. */}
      <div
        className="relative w-full overflow-hidden bg-image-placeholder"
        style={{ aspectRatio: entry.ratio ?? "16 / 9" }}
      >
        <Media entry={entry} />
      </div>
      <div className="mt-4">
        <h2 className="text-2xl font-semibold tracking-tight text-balance transition-colors group-hover:text-accent group-focus-visible:text-accent">
          {entry.blurb ?? entry.title}
        </h2>
      </div>
    </a>
  );
}
