"use client";

import { CardVideo } from "@/components/CardVideo";

/**
 * Looping clip inside a lab *listing* card (the madhurima-style editorial grid:
 * a big rounded canvas per item, meta + title below). Thin wrapper over the
 * shared <CardVideo> pinning the lab treatment: the clip fills the card width
 * at its native aspect (block h-auto w-full), so the canvas hugs the clip's
 * own height. Case-study cards use <CardVideo> directly with an object-cover
 * className against a fixed 4:3 frame.
 */
export function LabCardVideo(props: {
  src: string;
  poster?: string;
  title: string;
}) {
  return <CardVideo {...props} className="block h-auto w-full" />;
}
