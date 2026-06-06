"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * In-body case-study video. Mirrors <Figure>'s caption API (caption /
 * captionBefore / captionAfter) so the same `.case-body figure` CSS rules
 * cover it — figure margin owns the outer 32px, figcaption owns the 8px gap.
 *
 * Playback model: muted, playsinline, no native controls. IntersectionObserver
 * fires play() once when in view (≥50% visible), then disconnects — one-shot,
 * never loops, lets the clip end on its final frame. A replay button overlays
 * on `ended`.
 *
 * `prefers-reduced-motion`: skip autoplay entirely; show a play button overlay
 * from the start so the reader opts in. Same overlay component, different glyph
 * (triangle vs circular arrow).
 *
 * `preload="metadata"` so we get the poster + dimensions without downloading
 * the full clip until needed.
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
  const [ended, setEnded] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  // matchMedia is client-only; SSR initial state is `false` (autoplay-allowed
  // path) which is the more common branch — reduced-motion users get the play
  // overlay one frame after hydration, no flash for the majority.
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  // IntersectionObserver-driven one-shot autoplay. Disconnect after firing so
  // the video isn't restarted on subsequent scroll-ins (one-shot, replay-only).
  useEffect(() => {
    if (reducedMotion) return;
    const video = videoRef.current;
    if (!video) return;

    const io = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
          // Muted autoplay is broadly allowed but may still fail in edge
          // cases (Low Power Mode, etc.) — swallow silently; the poster
          // stays visible and the reader can scroll on.
          video.play().catch(() => {});
          io.disconnect();
        }
      },
      { threshold: 0.5 },
    );
    io.observe(video);
    return () => io.disconnect();
  }, [reducedMotion]);

  const handlePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = 0;
    setEnded(false);
    video.play().catch(() => {});
  };

  // Overlay shown when: video has ended (replay), OR reduced-motion is on
  // (initial opt-in). Same button, different glyph. Always mounted so the
  // appearance/disappearance can fade — 320ms matches `.view-enter`'s
  // scene-change rhythm. opacity + pointer-events gate visibility; aria-hidden
  // + tabIndex=-1 keep it out of the a11y tree when invisible.
  const showOverlay = ended || reducedMotion;
  const overlayLabel = ended ? "Replay" : "Play";

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
        muted
        playsInline
        preload="metadata"
        onEnded={() => setEnded(true)}
        className="block h-auto w-full"
      />
      <button
        type="button"
        onClick={handlePlay}
        aria-label={overlayLabel}
        aria-hidden={!showOverlay}
        tabIndex={showOverlay ? 0 : -1}
        className={`focus-ring absolute inset-0 flex items-center justify-center bg-foreground/20 backdrop-blur-[2px] motion-safe:transition-opacity motion-safe:duration-[320ms] motion-safe:ease-out ${
          showOverlay ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <span className="frosted flex h-14 w-14 items-center justify-center rounded-full text-accent">
          {ended ? (
            // Circular arrow (replay)
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M21 12a9 9 0 1 1-3-6.7" />
              <path d="M21 4v5h-5" />
            </svg>
          ) : (
            // Triangle (initial play, reduced-motion)
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden
            >
              <path d="M7 4.5v15l13-7.5z" />
            </svg>
          )}
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
