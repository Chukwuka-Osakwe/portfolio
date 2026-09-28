import type { Metadata } from "next";
import { getAllMeta } from "@/lib/content";
import { DesignGrid, type GridEntry } from "@/components/DesignGrid";
import { HashRedirect } from "@/components/HashRedirect";

// Title/description/OG inherit the brand-level defaults from the root layout
// (this is the bare-domain homepage, so it carries the site's own billing, not
// a section title). Canonical pinned to "/".
export const metadata: Metadata = { alternates: { canonical: "/" } };

/** Home — the merged design grid: client work + lab intermixed into one
 *  date-desc stream (the S31 thesis — the paid/self-directed split is authorship
 *  trivia the visitor doesn't need). Each card links to its real detail route
 *  (/design/<slug> for work, /lab/<slug> for lab), which server-renders the
 *  detail in this same shell.
 *
 *  Old `/#slug` hash deep-links still get a one-shot client redirect to
 *  `/design/<slug>` via <HashRedirect> — a migration safety net. `/lab` and the
 *  old `/design` index 308-redirect here (see next.config). */
export default function Home() {
  const entries: GridEntry[] = [...getAllMeta("work"), ...getAllMeta("lab")]
    // Pure date-desc across the merge (NOT getAllMeta's per-section featured
    // pinning — a merged stream wants one honest chronological order so lab and
    // client work genuinely interleave).
    .sort((a, b) => +new Date(b.date) - +new Date(a.date))
    .map((m) => ({
      slug: m.slug,
      href: m.section === "lab" ? `/lab/${m.slug}` : `/design/${m.slug}`,
      title: m.title,
      blurb: m.blurb ?? null,
      image: m.image ?? null,
      video: m.video ?? null,
      ratio: m.ratio ?? null,
      blurDataURL: m.blurDataURL,
    }));

  return (
    <>
      <HashRedirect />
      <DesignGrid entries={entries} />
    </>
  );
}
