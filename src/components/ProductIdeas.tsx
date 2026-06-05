"use client";

import { useState } from "react";
import Image from "next/image";
import { getIdeas } from "@/content/ideas";

const IDEAS = getIdeas();

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
 * prev/next handles flanking it (looping), and an overlaid position counter.
 * Reuses TEMP_IDEAS for now.
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
    <div className="mx-auto flex w-full max-w-[var(--content-w)] flex-col items-center justify-center gap-6 min-h-[calc(100dvh-11.5rem-env(safe-area-inset-top,0px))] lg:min-h-[calc(100dvh-8rem)]">
      <p
        className="text-center text-balance text-[clamp(1rem,3.5vw,1.25rem)] text-accent"
        style={{ fontFamily: "var(--font-nico-moji)" }}
      >
        these ideas don&apos;t exist yet but maybe they should
      </p>

      {/* MOBILE — cover alone, gets the full container width. NO flex wrapper:
          when the image was inside `<div class="flex">`, it became a flex
          item subject to default `min-width: auto`, which for replaced
          elements equals intrinsic content size (here: 2000px) and overrode
          `max-w-full`, causing horizontal overflow on mobile.
          As a direct child of the parent flex COLUMN, the image's width is
          governed by the cross axis where `max-w-full` works correctly.
          `items-center` on the parent centers the image naturally. */}
      <Image
        src={idea.image}
        alt=""
        width={idea.width}
        height={idea.height}
        priority
        sizes="100vw"
        placeholder={idea.blurDataURL ? "blur" : "empty"}
        blurDataURL={idea.blurDataURL}
        className="project-card block h-auto w-auto max-w-full rounded-lg lg:hidden"
      />

      {/* MOBILE — transport row: chevrons flanking the position counter, like
          a media-player. Replaces the chevrons-flanking-image arrangement on
          mobile so the cover gets the full container width. */}
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

      {/* DESKTOP — chevrons flank the cover image (film-strip frame).
          Centering wrapper takes the row's free width; the cover sizes itself
          within it, capped by viewport height (lg:max-h) so the page never
          scrolls — on short viewports the cover scales down, staying centered.
          Frame styling lives on the image, so there's no letterbox. */}
      <div className="hidden w-full items-center gap-3 lg:flex">
        <button type="button" onClick={prev} aria-label="Previous idea" className={handle}>
          {chevron("M15 6l-6 6 6 6")}
        </button>
        <div className="flex min-w-0 flex-1 justify-center">
          <Image
            src={idea.image}
            alt=""
            width={idea.width}
            height={idea.height}
            priority
            sizes="42rem"
            placeholder={idea.blurDataURL ? "blur" : "empty"}
            blurDataURL={idea.blurDataURL}
            className="project-card block h-auto w-auto max-w-full rounded-lg lg:max-h-[calc(100dvh-22rem)]"
          />
        </div>
        <button type="button" onClick={next} aria-label="Next idea" className={handle}>
          {chevron("M9 6l6 6-6 6")}
        </button>
      </div>

      {/* DESKTOP — position indicator on its own line below the carousel row.
          frosted styling applied unconditionally; the element is hidden on
          mobile via `hidden lg:inline-block`, so the unused styles don't
          render anywhere. */}
      <span className="frosted hidden rounded-lg px-3 py-1 text-sm font-medium tabular-nums text-accent lg:inline-block">
        {index + 1} / {total}
      </span>

      {/* Caption — full container width on mobile (anchors to the cover above,
          which is also full width). Desktop anchors to the chevron-flanked
          cover width (container - 6rem) with a 32px inset (px-8) for
          typography breathing. */}
      <p
        className="w-full max-w-full text-center text-pretty font-medium text-text-muted lg:max-w-[calc(100%-6rem)] lg:px-8"
        aria-live="polite"
      >
        {idea.caption}
      </p>
    </div>
  );
}
