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
 * REFERENCE SANDBOX (was S31 "throwaway") — the merged "design" grid: case
 * studies + lab intermixed into ONE date-desc track. This SHIPPED: the design it
 * proved is now the live landing at `/` (see @/components/DesignGrid, rendered by
 * (site)/page.tsx). This standalone copy is kept as a self-contained playground
 * — outside the (site) shell (root layout only → true full-bleed) so it can be
 * poked at without the site chrome. Not the source of truth; DesignGrid is.
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

// Wireframe-only cover-clip swaps. Empty now: the kickoff splash clip it used to
// point at was promoted to kickoff's real frontmatter (public/lab/kickoff/
// splash.*), so both this wireframe and the live grid read it from there.
const VIDEO_OVERRIDES: Record<string, string> = {};
const POSTER_OVERRIDES: Record<string, string> = {};

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
