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
    <div className="mx-auto flex w-full max-w-[var(--content-w)] flex-col items-center justify-center gap-2 lg:min-h-[calc(100dvh-8rem)]">
      <p
        className="mb-4 text-center text-balance text-[clamp(1.125rem,3.5vw,1.5rem)] text-accent"
        style={{ fontFamily: "var(--font-nico-moji)" }}
      >
        these ideas don&apos;t exist yet but maybe they should
      </p>

      <div className="flex w-full items-center gap-3">
        <button type="button" onClick={prev} aria-label="Previous idea" className={handle}>
          {chevron("M15 6l-6 6 6 6")}
        </button>

        {/* Centering wrapper takes the row's free width; the cover sizes itself
            within it, capped by viewport height (lg:max-h) so the page never
            scrolls — on short viewports the cover scales down, staying centered.
            Frame styling lives on the image, so there's no letterbox. */}
        <div className="flex min-w-0 flex-1 justify-center">
          <Image
            src={idea.image}
            alt=""
            width={idea.width}
            height={idea.height}
            priority
            sizes="(min-width: 768px) 42rem, 100vw"
            placeholder={idea.blurDataURL ? "blur" : "empty"}
            blurDataURL={idea.blurDataURL}
            className="project-card block h-auto w-auto max-w-full rounded-lg lg:max-h-[calc(100dvh-22rem)]"
          />
        </div>

        <button type="button" onClick={next} aria-label="Next idea" className={handle}>
          {chevron("M9 6l6 6-6 6")}
        </button>
      </div>

      {/* Position indicator — moved out of the frame, on the page field, for
          better visibility. */}
      <span className="frosted rounded-lg px-3 py-1 text-sm font-medium tabular-nums text-accent">
        {index + 1} / {total}
      </span>

      {/* Caption aligned to the image-frame width (the carousel row minus the
          two chevrons + gaps = w-9·2 + gap-3·2 = 6rem), then inset 32px (px-8)
          from each frame edge. */}
      <p
        className="w-full max-w-[calc(100%-6rem)] px-8 text-center text-pretty font-medium text-text-muted"
        aria-live="polite"
      >
        {idea.caption}
      </p>
    </div>
  );
}
