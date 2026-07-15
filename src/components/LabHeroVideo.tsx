"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Cinematic hero clip for a lab item — the video-forward archetype (looping,
 * chrome-less, draws the eye on arrival). Distinct from <CaseVideo> (which is
 * click-to-play with native controls for in-prose walkthroughs): here motion
 * IS the pitch, so it autoplays muted and loops.
 *
 * Reduced-motion: the `autoPlay` attribute is present in SSR/first render so
 * motion-OK users get playback immediately (matchMedia can't be read on the
 * server). On mount, if the user prefers reduced motion we pause + rewind to
 * the poster frame and expose native `controls` so they can opt in — nothing
 * moves until they ask.
 */
export function LabHeroVideo({
  src,
  poster,
  title,
}: {
  src: string;
  poster?: string;
  title: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const [reduced, setReduced] = useState(false);

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
    <div className="overflow-hidden rounded-lg border border-border bg-image-placeholder shadow-sm">
      <video
        ref={ref}
        src={src}
        poster={poster}
        aria-label={`${title} — screen recording`}
        muted
        loop
        autoPlay
        playsInline
        controls={reduced}
        preload="metadata"
        className="block h-auto w-full"
      />
    </div>
  );
}
