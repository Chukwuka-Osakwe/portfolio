"use client";

/** Contact route shown in the card column. */

import { useEffect, useState } from "react";

// Real contact channels.
const EMAIL = "chukwuka0009@gmail.com";
const FARCASTER = "https://farcaster.xyz/chukwukaosakwe";

// Understated text link: muted at rest, warms to accent on hover/focus
// (parity), mirroring the "read more" affordance on the idea cards.
const LINK =
  "rounded text-base font-semibold text-text-muted outline-none transition hover:text-accent focus-visible:text-accent focus-visible:underline";

// "Copied!" feedback duration on the copy-email button.
const COPIED_FLASH_MS = 4000;

export function Contact() {
  const [copied, setCopied] = useState(false);

  // Auto-revert the "copied!" label after COPIED_FLASH_MS. Cleared on unmount
  // or on a fresh click (state change re-runs the effect, clearing the prior
  // timer first).
  useEffect(() => {
    if (!copied) return;
    const id = setTimeout(() => setCopied(false), COPIED_FLASH_MS);
    return () => clearTimeout(id);
  }, [copied]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(EMAIL);
      setCopied(true);
    } catch {
      // Graceful no-op: the mailto link beside this button still works.
    }
  };

  return (
    // On lg: the column fills the available viewspace (dvh minus the grid's
    // pt-8/pb-24 = 8rem) and vertically centers its content via justify-center
    // — content sits visually centered in the cards-column area regardless of
    // viewport height. On mobile: column sizes to content + uses mt-[8vh] as
    // a simple top-offset (no min-h fight on tiny screens).
    <div className="mx-auto mt-[8vh] flex w-full max-w-lg flex-col lg:mt-0 lg:min-h-[calc(100dvh-8rem)] lg:justify-center">
      <p className="self-center text-[clamp(1.5rem,5vw,2.5rem)] font-semibold tracking-tight text-balance text-accent underline">
        better call chuka!
      </p>

      {/* Bio — personality opener + concrete interests + specific qualifier-
          invite. Reading measure 32rem; shares the column's left edge. */}
      <div className="mt-10 w-full max-w-[32rem] text-base leading-relaxed">
        <p>
          i love gradients, typography, and watching clients&apos; faces
          light up when they see what i&apos;ve designed. i&apos;m
          particularly interested in product design, design systems,
          building things for football fans, and internet-native
          experiences (coyg!). if
          you&apos;re building a product and need help making it clearer,
          more cohesive, or easier to use, i&apos;d love to hear about it.
        </p>
      </div>

      {/* CTA row — primary (solid-accent mailto) + secondary (outline copy-to-
          clipboard). The pair is centered within the column (self-center) and
          gapped on the 8px grid (gap-4). Both buttons share padding/radius/
          type so they read as a matched pair; only fill + border differ. */}
      <div className="mt-12 flex items-center gap-4 self-center">
        {/* Primary — the one solid-accent button on the site. Hover effect:
            the arrow stretches horizontally (`group-hover:w-6`) and the button
            widens to fit — a "leaning forward" kinetic feedback specific to
            the directional CTA. `preserveAspectRatio="none"` lets the path
            stretch non-uniformly; `vector-effect="non-scaling-stroke"` keeps
            the stroke width constant so the arrow doesn't get thinner-looking
            as it stretches. */}
        <a
          href={`mailto:${EMAIL}`}
          className="focus-ring group inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-3 text-base font-semibold text-nav-fill transition"
        >
          email me
          <svg
            viewBox="0 0 16 16"
            preserveAspectRatio="none"
            fill="none"
            aria-hidden="true"
            className="h-4 w-4 transition-[width] duration-[320ms] motion-safe:group-hover:w-6"
          >
            <path
              d="M3 8h9M8.5 4l4 4-4 4"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
        </a>

        {/* Secondary — outline button, writes EMAIL to clipboard. Text swaps
            to "copied!" for COPIED_FLASH_MS on success; mailto button beside
            it stays usable as a graceful fallback if clipboard API fails. */}
        <button
          type="button"
          onClick={handleCopy}
          aria-live="polite"
          className="focus-ring inline-flex items-center gap-2 rounded-lg border border-accent bg-transparent px-5 py-3 text-base font-semibold text-accent transition hover:bg-accent-100"
        >
          {copied ? "copied!" : "copy email"}
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            aria-hidden="true"
          >
            {/* Two overlapping rounded squares — standard duplicate/copy glyph. */}
            <rect
              x="5"
              y="5"
              width="9"
              height="9"
              rx="1.5"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M11 5V3.5A1.5 1.5 0 0 0 9.5 2h-6A1.5 1.5 0 0 0 2 3.5v6A1.5 1.5 0 0 0 3.5 11H5"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>

      {/* Closing line — secondary channel (farcaster) inlined into a
          conversational lead-in rather than presented as a bare text link. */}
      <p className="mt-6 text-center text-base text-text-muted">
        on the internet you can mostly find me hanging out on{" "}
        <a href={FARCASTER} target="_blank" rel="noopener noreferrer" className={LINK}>
          farcaster
        </a>
        .
      </p>
    </div>
  );
}
