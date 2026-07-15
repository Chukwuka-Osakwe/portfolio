import type { MetadataRoute } from "next";
import { getAllMeta } from "@/lib/content";
import { SITE_URL } from "@/lib/site";

/**
 * Static sitemap — the lab home (`/`) + one entry per lab item, the case-
 * studies index + one entry per case study, the essays + product-ideas +
 * contact routes.
 *
 * Case studies live at `/design/<slug>` (real routes, generated statically
 * from `src/content/work/`) so each one gets its own URL, per-route OG
 * metadata, and indexable presence. The old hash deep-links (`/#footy`) are
 * gone — fragments aren't sent to servers, so they could never be indexed
 * independently.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const lab = getAllMeta("lab");
  const projects = getAllMeta("work");
  const essays = getAllMeta("writing");
  return [
    // `/` is the "my lab" landing view (the design triad leads with the lab).
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: "monthly", priority: 1 },
    ...lab.map((p) => ({
      url: `${SITE_URL}/lab/${p.slug}`,
      lastModified: new Date(p.date),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    // Case studies moved off `/` to their own `/design` index tab.
    { url: `${SITE_URL}/design`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
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
