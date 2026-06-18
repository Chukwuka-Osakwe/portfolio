import type { MetadataRoute } from "next";
import { getAllMeta } from "@/lib/content";
import { SITE_URL } from "@/lib/site";

/**
 * Static sitemap — home, the two list routes, and one entry per case study.
 *
 * Case studies live at `/design/<slug>` (real routes, generated statically
 * from `src/content/work/`) so each one gets its own URL, per-route OG
 * metadata, and indexable presence. The old hash deep-links (`/#footy`) are
 * gone — fragments aren't sent to servers, so they could never be indexed
 * independently.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const projects = getAllMeta("work");
  const essays = getAllMeta("writing");
  return [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: "monthly", priority: 1 },
    ...projects.map((p) => ({
      url: `${SITE_URL}/design/${p.slug}`,
      // lastModified ideally tracks the MDX's mtime; using the frontmatter
      // date is close enough and avoids a file-stat round-trip.
      lastModified: new Date(p.date),
      changeFrequency: "yearly" as const,
      priority: 0.8,
    })),
    { url: `${SITE_URL}/essays`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    ...essays.map((e) => ({
      url: `${SITE_URL}/essays/${e.slug}`,
      lastModified: new Date(e.date),
      changeFrequency: "yearly" as const,
      priority: 0.6,
    })),
    { url: `${SITE_URL}/product-ideas`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/contact`, lastModified: now, changeFrequency: "yearly", priority: 0.5 },
  ];
}
