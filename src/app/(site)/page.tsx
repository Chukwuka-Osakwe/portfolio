import type { Metadata } from "next";
import { ProjectsSection } from "@/components/ProjectsSection";
import { HashRedirect } from "@/components/HashRedirect";

// Title/description/OG inherit the brand-level defaults from the root layout
// (this is the bare-domain homepage, so it carries the site's own billing, not
// a section title). Canonical pinned to "/".
export const metadata: Metadata = { alternates: { canonical: "/" } };

/** Home — the case-studies grid, and the site's landing surface (the design
 *  triad now leads with case studies). Renders `ProjectsSection` with no
 *  `initialSlug`, so it shows the grid; each card links to `/design/<slug>`
 *  for the detail (a real, per-item route with its own metadata).
 *
 *  My lab now lives one tab over at `/lab`; product ideas at `/product-ideas`.
 *  The old `/design` case-studies index 308-redirects here (see next.config);
 *  old `/#slug` hash deep-links still get a one-shot client redirect to
 *  `/design/<slug>` via <HashRedirect> — a migration safety net. */
export default function Home() {
  return (
    <>
      <HashRedirect />
      <ProjectsSection />
    </>
  );
}
