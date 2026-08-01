"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Looping cover clip inside a listing card (lab grid or case-study grid): an
 * autoplay-muted-loop <video> that plays in place and carries the "this thing
 * moves" pitch. The card is a navigation <Link>, so we deliberately DON'T
 * expose native controls on reduced-motion (they'd fight the link) — we pause
 * to the poster frame and let the user open the detail page to play.
 *
 * `autoPlay` is present in SSR/first render so motion-OK users get playback on
 * arrival (matchMedia is client-only); reduced-motion users get paused-to-poster
 * on mount.
 *
 * `className` sizes the video for its frame:
 *   • lab cards  → "block h-auto w-full"          (native aspect, canvas hugs it)
 *   • case cards → "h-full w-full object-cover"   (fills a fixed aspect box)
 */
export function CardVideo({
  src,
  poster,
  title,
  className = "block h-auto w-full",
}: {
  src: string;
  poster?: string;
  title: string;
  className?: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const [, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => {
      setReduced(mq.matches);
      const v = ref.current;
      if (mq.matches && v) {
        v.pause();
        v.currentTime = 0;
      }
    };
    apply();
    mq.addEventListener?.("change", apply);
    return () => mq.removeEventListener?.("change", apply);
  }, []);

  return (
    <video
      ref={ref}
      src={src}
      poster={poster}
      aria-label={`${title} — screen recording`}
      muted
      loop
      autoPlay
      playsInline
      preload="metadata"
      className={className}
    />
  );
}
