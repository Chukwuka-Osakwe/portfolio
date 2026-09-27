import type { Metadata } from "next";
import { getAllMeta } from "@/lib/content";
import { MergedGridWireframe, type WireEntry } from "./MergedGridWireframe";

// Dev-only prototype: never index, never appears in the sitemap route (it's
// outside the (site) group, so it isn't in the case-study/lab listings either).
export const metadata: Metadata = {
  title: "Merged grid — wireframe",
  robots: { index: false, follow: false },
};

/**
 * WIREFRAME (throwaway, S31) — the merged "design" grid: case studies + lab
 * intermixed into ONE track, filling the full viewspace (nav assumed vacated),
 * two-up at desktop. Built in house style (real tokens / covers / motion clips)
 * so we can judge how airy to make it before committing to the real IA rebuild.
 *
 * Lives OUTSIDE the (site) route group on purpose: that group's layout wraps
 * every page in the two-column [viewspace · nav] shell. Sitting at the app root
 * inherits only the root layout (fonts + globals + theme), so the grid reads at
 * true full-bleed width — which is the whole point of the reclaim.
 *
 * Merge + sort: both sections, pure date-desc (NOT the per-section featured
 * pinning getAllMeta does — that's a within-section device; a merged view wants
 * one honest chronological stream so lab + client work genuinely interleave).
 */

// Per-entry cover ratio (CSS aspect-ratio value). Stands in for a future
// frontmatter field: "brand"/gallery entries declare their own cover shape
// instead of inheriting the grid's uniform frame. Set here for Aronia + Kickoff
// so we can see mixed ratios coexisting in the lattice TODAY (they sit in the
// same top row — a wide card next to a portrait one is the stress test).
// Change these values (or add slugs) to try other shapes.
const RATIO_OVERRIDES: Record<string, string> = {
  aronia: "16 / 9", // wide
  kickoff: "16 / 9", // wide
};

// Wireframe-only cover-clip swaps (a dropped-in recording transcoded to
// web-safe MP4). Keyed by slug; overrides the entry's frontmatter `video`.
const VIDEO_OVERRIDES: Record<string, string> = {
  kickoff: "/wireframe/kickoff-new.mp4",
};

// Poster (pre-play frame) that goes with the swapped clip — kept in sync so the
// old walkthrough poster doesn't flash before the new video paints.
const POSTER_OVERRIDES: Record<string, string> = {
  kickoff: "/wireframe/kickoff-new-poster.jpg",
};

export default function Page() {
  const entries: WireEntry[] = [...getAllMeta("work"), ...getAllMeta("lab")]
    .sort((a, b) => +new Date(b.date) - +new Date(a.date))
    .map((m) => ({
      slug: m.slug,
      section: m.section as "work" | "lab",
      href: m.section === "lab" ? `/lab/${m.slug}` : `/design/${m.slug}`,
      title: m.title,
      type: m.type ?? null,
      stage: m.stage ?? null,
      blurb: m.blurb ?? null,
      image: POSTER_OVERRIDES[m.slug] ?? m.image ?? null,
      video: VIDEO_OVERRIDES[m.slug] ?? m.video ?? null,
      ratio: RATIO_OVERRIDES[m.slug] ?? null,
    }));

  return <MergedGridWireframe entries={entries} />;
}
