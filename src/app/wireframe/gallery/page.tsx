import type { Metadata } from "next";
import { GalleryWireframe } from "./GalleryWireframe";

// Dev-only prototype: never index. Outside the (site) group so it escapes the
// two-column [viewspace · nav] shell and owns the whole window — this template
// brings its OWN sticky left rail (à la New Apology / Pinto), so it must not sit
// inside the site's nav shell.
export const metadata: Metadata = {
  title: "Gallery view — wireframe",
  robots: { index: false, follow: false },
};

/**
 * WIREFRAME (throwaway, S33) — the "gallery / lookbook" detail template for
 * brand entries (Pensieve, Chipmango), modelled on New Apology's Pinto/Auro
 * presentation but adapted: we KEEP the sticky left rail (repurposed from a
 * discipline-tag column into a rolling project description) and open the brief
 * in a top block.
 *
 * The whole thing is placeholder rectangles — zero real assets. Each block is a
 * tagged stand-in ("image · tall", "type-specimen", "stat" …) so we can settle
 * the RHYTHM now and pour Pensieve/Chipmango assets in later.
 *
 * Row grammar (the Pinto model): a section is either one FULL block or a pair of
 * HALF blocks side by side. The row is the wrapper, so on mobile a half-pair
 * just stacks into two fulls. All variety comes from per-block props (aspect /
 * bg field colour / corner label / content alignment), NOT more block types.
 */
export default function Page() {
  return <GalleryWireframe />;
}
