"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Looping clip inside a lab *listing* card (the madhurima-style editorial grid:
 * a big rounded canvas per item, meta + title below). Sibling of
 * <LabHeroVideo> — same autoplay-muted-loop pitch — but tuned for a card:
 *
 *   • the card is a navigation <Link>, so on reduced-motion we DON'T expose
 *     native controls (they'd fight the link); we just pause to the poster
 *     frame and let the user open the detail page to play.
 *   • fills the card width at the clip's native aspect (block h-auto w-full).
 *
 * autoPlay is present in SSR/first render so motion-OK users get playback on
 * arrival (matchMedia is client-only); reduced-motion users get paused-to-poster
 * on mount.
 */
export function LabCardVideo({
  src,
  poster,
  title,
}: {
  src: string;
  poster?: string;
  title: string;
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
      className="block h-auto w-full"
    />
  );
}
