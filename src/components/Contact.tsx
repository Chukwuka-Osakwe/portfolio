"use client";

/** Contact route shown in the card column. */

import { useEffect, useState } from "react";

// Real contact channels.
const EMAIL = "chukwuka0009@gmail.com";
const FARCASTER = "https://farcaster.xyz/chukwukaosakwe";
const GITHUB = "https://github.com/Chukwuka-Osakwe";
const LINKEDIN = "https://www.linkedin.com/in/chukwuka-osakwe-a059a5414";

// Inline text link: accent + underlined at rest so it reads unambiguously
// as a link on touch (no hover state to warm into). focus-ring brings the
// site-wide keyboard focus outline; the link's color/underline don't
// shift on hover since they're already at their maximum-emphasis state.
const LINK =
  "focus-ring rounded text-base font-semibold text-accent underline";

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
    // Fills the available viewspace and vertically centers its content.
    // /contact has NO ViewSwitcher (returns null on this route), so the
    // page-grid's pb-24 is empty padding — symmetric centering needs to
    // escape both pt-8 AND pb-24 via negative margins. min-h then subtracts
    // only the topbar (3.5rem + safe-area-top), so Contact spans from
    // topbar-bottom to viewport-bottom. The mt-8/mb-24 page-grid math still
    // resolves to a viewport-sized total (Contact's outer-box-with-margins
    // = inner-box-without; the grid's pt-8 + pb-24 wrap it back).
    // Desktop unchanged: lg:min-h-[calc(100dvh-8rem)] + no negative margins
    // (Product Ideas / Footy / Heyfood share the desktop math because the
    // panel-side handles its own breathing room).
    <div className="mx-auto -mt-8 -mb-24 flex w-full max-w-lg flex-col justify-center min-h-[calc(100dvh-3.5rem-env(safe-area-inset-top,0px))] lg:mt-0 lg:mb-0 lg:min-h-[calc(100dvh-8rem)]">
      <p className="-mt-8 self-center text-[clamp(1.5rem,5vw,2.5rem)] font-semibold tracking-tight text-balance text-accent underline">
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

      {/* Social icons — secondary profiles (github, linkedin) as icon-only
          links, centered below the closing line. aria-label carries the name
          since there's no visible text. Resting color is hover-aware: base is
          accent so touch devices (no hover to warm into) read them as live
          links from the start, but on hover-capable pointers we mute at rest
          and warm to accent on hover for the usual desktop affordance. */}
      <div className="mt-8 flex items-center justify-center gap-8">
        <a
          href={GITHUB}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="GitHub"
          className="focus-ring rounded text-accent transition-colors [@media(hover:hover)]:text-text-muted [@media(hover:hover)]:hover:text-accent"
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 16 16"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
          </svg>
        </a>
        <a
          href={LINKEDIN}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="LinkedIn"
          className="focus-ring rounded text-accent transition-colors [@media(hover:hover)]:text-text-muted [@media(hover:hover)]:hover:text-accent"
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 16 16"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M13.63 0H2.37A2.34 2.34 0 0 0 0 2.31v11.38A2.34 2.34 0 0 0 2.37 16h11.26A2.34 2.34 0 0 0 16 13.69V2.31A2.34 2.34 0 0 0 13.63 0ZM4.86 13.12H2.89V6.78h1.97v6.34ZM3.87 5.91a1.14 1.14 0 1 1 0-2.29 1.14 1.14 0 0 1 0 2.29Zm9.25 7.21h-1.97V9.86c0-.74-.01-1.69-1.03-1.69-1.03 0-1.19.8-1.19 1.63v3.32H6.97V6.78h1.89v.87h.03c.26-.5.91-1.03 1.86-1.03 1.99 0 2.36 1.31 2.36 3.02v3.48Z" />
          </svg>
        </a>
      </div>
    </div>
  );
}
