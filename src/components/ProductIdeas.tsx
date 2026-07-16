"use client";

import { useState } from "react";
import { getIdeas } from "@/content/ideas";

const IDEAS = getIdeas();

// Every cover exports at the same 2000 × 1293 (≈1.547:1) Figma brand-board
// frame, so one ratio sizes them all. Held as a padding-bottom percentage on
// the wrapper — Chrome glitches the CSS `aspect-ratio` property when the
// wrapper has only position:absolute children, but padding-% uses real layout
// space and is rock-solid across browsers.
const COVER_W = IDEAS[0]?.width ?? 2000;
const COVER_H = IDEAS[0]?.height ?? 1293;
const COVER_PAD_BOTTOM = `${(COVER_H / COVER_W) * 100}%`;

const chevron = (d: string) => (
  <svg
    viewBox="0 0 24 24"
    className="h-5 w-5"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d={d} />
  </svg>
);

/**
 * Product-ideas carousel: one cover image at a time with a one-line caption,
 * prev/next handles flanking it (looping), and a position counter.
 *
 * Architecture:
 *   • A single <img> element whose `src` changes when the user navigates.
 *     Browser swap is the standard image-element behavior — works identically
 *     on every browser.
 *   • Five `<link rel="preload" as="image">` tags (hoisted by Next 15 to
 *     <head>) eagerly fetch every cover on first paint. By the time the user
 *     clicks prev/next, the next cover is already in the HTTP cache — the
 *     swap reads as instant, no caption-ahead-of-image flash.
 *   • The wrapper holds the aspect ratio via `padding-bottom: H/W%`, the
 *     classic pre-`aspect-ratio` technique. CSS-driven, deterministic.
 *
 * Why a plain <img>, not next/image fill: stacked <Image fill> children sit
 * at `position: absolute; inset: 0` and trigger a Chrome layout quirk
 * (cover shrank on loop-back, Firefox unaffected) that we couldn't pin down
 * through any combination of viewport units / wrapper sizing. Plain <img>
 * with raw cover URLs has zero next/image machinery in the loop; the covers
 * are already pre-optimized WebPs (~45KB each at 2000×1293), so the loss
 * of srcset/format-negotiation is not a meaningful cost.
 */
export function ProductIdeas() {
  const [index, setIndex] = useState(0);
  const total = IDEAS.length;
  const idea = IDEAS[index];

  const prev = () => setIndex((i) => (i - 1 + total) % total);
  const next = () => setIndex((i) => (i + 1) % total);

  const handle =
    "frosted focus-ring flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-foreground transition hover:text-accent";

  return (
    // min-h fills the available viewport between topbar and viewswitcher so
    // justify-center can vertically balance the carousel content. Mobile
    // subtracts the full mobile chrome (3.5rem topbar + 2rem pt-8 + 6rem pb-24
    // + safe-area-inset-top for iOS notches = 11.5rem + safe-top). Desktop
    // subtracts only page-grid padding (no topbar at lg).
    <div className="mx-auto flex w-full max-w-[var(--content-w)] flex-col items-center justify-center gap-6 min-h-[calc(100dvh-11.5rem-env(safe-area-inset-top,0px))] lg:min-h-[calc(100vh-8rem)]">
      {/* Preload every cover so prev/next swaps hit cache instantly. Next 15
          hoists `<link>` tags from any component to <head> automatically. */}
      {IDEAS.map((it) => (
        <link key={it.slug} rel="preload" as="image" href={it.image} />
      ))}

      {/* MOBILE — single cover, full container width. */}
      <div
        className="project-card relative w-full overflow-hidden rounded-lg lg:hidden"
        style={{ paddingBottom: COVER_PAD_BOTTOM }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={idea.image}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
      </div>

      {/* MOBILE — transport row: chevrons flanking the position counter. */}
      <div className="flex items-center gap-3 lg:hidden">
        <button type="button" onClick={prev} aria-label="Previous idea" className={handle}>
          {chevron("M15 6l-6 6 6 6")}
        </button>
        <span className="frosted rounded-lg px-3 py-1 text-sm font-medium tabular-nums text-accent">
          {index + 1} / {total}
        </span>
        <button type="button" onClick={next} aria-label="Next idea" className={handle}>
          {chevron("M9 6l6 6-6 6")}
        </button>
      </div>

      {/* DESKTOP — chevrons flank the cover (film-strip frame). */}
      <div className="hidden w-full items-center gap-3 lg:flex">
        <button type="button" onClick={prev} aria-label="Previous idea" className={handle}>
          {chevron("M15 6l-6 6 6 6")}
        </button>
        <div className="flex min-w-0 flex-1 justify-center">
          <div
            className="project-card relative w-full overflow-hidden rounded-lg"
            style={{ paddingBottom: COVER_PAD_BOTTOM }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={idea.image}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
            />
          </div>
        </div>
        <button type="button" onClick={next} aria-label="Next idea" className={handle}>
          {chevron("M9 6l6 6-6 6")}
        </button>
      </div>

      {/* DESKTOP — position indicator on its own line below the carousel row. */}
      <span className="frosted hidden rounded-lg px-3 py-1 text-sm font-medium tabular-nums text-accent lg:inline-block">
        {index + 1} / {total}
      </span>

      {/* Caption. Mobile = full container width; desktop anchors to the
          chevron-flanked cover width (container - 6rem) with a 32px inset. */}
      <p
        className="w-full max-w-full text-center text-pretty font-medium text-text-muted lg:max-w-[calc(100%-6rem)] lg:px-8"
        aria-live="polite"
      >
        {idea.caption}
      </p>
    </div>
  );
}
