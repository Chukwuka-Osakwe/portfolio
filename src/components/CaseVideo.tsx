"use client";

import { useRef, useState, type ReactNode } from "react";

/**
 * In-body case-study video. Mirrors <Figure>'s caption API (caption /
 * captionBefore / captionAfter) so the same `.case-body figure` CSS rules
 * cover it — figure margin owns the outer 32px, figcaption owns the 8px gap.
 *
 * Playback model: user-initiated, with native controls. At rest the clip shows
 * its poster under an on-brand frosted play button (no native chrome, clean
 * resting state). On first play the browser's native controls (scrubber, pause,
 * fullscreen) take over — the scrubber matters for longer walkthroughs, where
 * autoplay-on-scroll with no seek was the wrong fit. No autoplay; nothing moves
 * until the reader opts in, so there's no reduced-motion branch to handle.
 *
 * `preload="metadata"` so we get dimensions without downloading the full clip
 * until the reader presses play; `poster` paints the resting frame regardless.
 */
type Props = {
  src: string;
  poster?: string;
  /** CSS length (e.g. "22rem", "60%"). Default 22rem — fits a portrait phone
   *  walkthrough comfortably between the column edges; override for landscape. */
  width?: string;
  /** Single-line caption (string or ReactNode). For two-line captions — e.g. a
   *  "before / after" framing — use `captionBefore`/`captionAfter` instead,
   *  since next-mdx-remote drops JSX-expression caption nodes (see DESIGN.md
   *  / [[mdx-jsx-expression-props-dropped]]). */
  caption?: ReactNode;
  captionBefore?: string;
  captionAfter?: string;
};

export default function CaseVideo({
  src,
  poster,
  width = "22rem",
  caption,
  captionBefore,
  captionAfter,
}: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  // Resting state shows the frosted play button + no native controls; once the
  // reader presses play, native controls take over for the rest of the session.
  const [started, setStarted] = useState(false);

  const handlePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    setStarted(true);
    video.play().catch(() => {});
  };

  const hasCaption = !!(caption || captionBefore || captionAfter);

  const player = (
    <div
      className="relative mx-auto block overflow-hidden"
      style={{ width, maxWidth: "100%" }}
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        playsInline
        preload="metadata"
        controls={started}
        controlsList="nodownload"
        className="block h-auto w-full"
      />
      {/* Frosted play button over the poster. Always mounted so it can fade out
          on first play (320ms matches `.view-enter`'s scene-change rhythm);
          opacity + pointer-events gate visibility, aria-hidden + tabIndex=-1
          keep it out of the a11y tree once playback has started (native
          controls are the controls from then on). */}
      <button
        type="button"
        onClick={handlePlay}
        aria-label="Play"
        aria-hidden={started}
        tabIndex={started ? -1 : 0}
        className={`focus-ring absolute inset-0 flex items-center justify-center bg-foreground/20 backdrop-blur-[2px] motion-safe:transition-opacity motion-safe:duration-[320ms] motion-safe:ease-out ${
          started ? "pointer-events-none opacity-0" : "opacity-100"
        }`}
      >
        <span className="frosted flex h-14 w-14 items-center justify-center rounded-full text-accent">
          {/* Triangle (play) */}
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden
          >
            <path d="M7 4.5v15l13-7.5z" />
          </svg>
        </span>
      </button>
    </div>
  );

  if (!hasCaption) return player;

  const captionContent =
    caption ??
    (captionBefore || captionAfter ? (
      <>
        {captionBefore && <p>{captionBefore}</p>}
        {captionAfter && <p>{captionAfter}</p>}
      </>
    ) : null);

  return (
    <figure>
      {player}
      <figcaption>{captionContent}</figcaption>
    </figure>
  );
}
