"use client";

import { useState } from "react";
import Image from "next/image";

// TEMP: reuse the project images + placeholder one-liners for the carousel.
// Replace with a real product-ideas content set later.
const TEMP_IDEAS: { src: string; caption: string }[] = [
  { src: "/batman.jpg", caption: "A focus timer that rewards deep work, not streaks." },
  { src: "/anders-jilden-GjwsHRIcQjU-unsplash.jpg", caption: "Calm weather, told as a single sentence." },
  { src: "/jacob-kiesow-Mb_Rgr8iD88-unsplash.jpg", caption: "Reading queue that surfaces what you'll actually finish." },
  { src: "/john-fowler-RsRTIofe0HE-unsplash.jpg", caption: "Trip planning that thinks in days, not lists." },
  { src: "/nasa-WKT3TE5AQu0-unsplash.jpg", caption: "A night-sky journal for backyard astronomers." },
  { src: "/nitish-meena-RbbdzZBKRDY-unsplash.jpg", caption: "Habit tracker that fades into the background." },
];

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
  const total = TEMP_IDEAS.length;
  const idea = TEMP_IDEAS[index];

  const prev = () => setIndex((i) => (i - 1 + total) % total);
  const next = () => setIndex((i) => (i + 1) % total);

  const handle =
    "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border bg-background/70 text-foreground shadow-sm backdrop-blur transition hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

  return (
    <div className="mx-auto mt-[12vh] flex w-full max-w-2xl flex-col items-center gap-4">
      <p className="text-center text-pretty text-accent">
        these ideas don&apos;t exist yet but maybe they should
      </p>

      <div className="flex w-full items-center gap-3">
        <button type="button" onClick={prev} aria-label="Previous idea" className={handle}>
          {chevron("M15 6l-6 6 6 6")}
        </button>

        <div className="project-card relative aspect-[4/3] w-full overflow-hidden rounded-lg">
          <Image
            src={idea.src}
            alt=""
            fill
            sizes="(min-width: 768px) 42rem, 100vw"
            className="object-cover"
          />
          <span className="absolute bottom-2 right-2 rounded-md bg-foreground/70 px-2 py-0.5 text-xs font-medium text-background backdrop-blur">
            {index + 1} / {total}
          </span>
        </div>

        <button type="button" onClick={next} aria-label="Next idea" className={handle}>
          {chevron("M9 6l6 6-6 6")}
        </button>
      </div>

      <p className="text-center text-pretty text-text-muted" aria-live="polite">
        {idea.caption}
      </p>
    </div>
  );
}
