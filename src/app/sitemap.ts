import type { MetadataRoute } from "next";
import { getAllMeta } from "@/lib/content";
import { SITE_URL } from "@/lib/site";

/**
 * Static sitemap — the case-studies home (`/`) + one entry per case study, the
 * lab index + one entry per lab item, the essays + product-ideas + contact
 * routes.
 *
 * Case studies live at `/design/<slug>` (real routes, generated statically
 * from `src/content/work/`) so each one gets its own URL, per-route OG
 * metadata, and indexable presence; their grid is now the bare-domain home
 * (`/`). The old `/design` index redirects to `/`, so it's not listed here.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const lab = getAllMeta("lab");
  const projects = getAllMeta("work");
  const essays = getAllMeta("writing");
  return [
    // `/` is the case-studies landing view (the design triad now leads with it).
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: "monthly", priority: 1 },
    ...projects.map((p) => ({
      url: `${SITE_URL}/design/${p.slug}`,
      // lastModified ideally tracks the MDX's mtime; using the frontmatter
      // date is close enough and avoids a file-stat round-trip.
      lastModified: new Date(p.date),
      changeFrequency: "yearly" as const,
      priority: 0.8,
    })),
    // The "my lab" index (moved off `/` to its own tab) + one entry per item.
    { url: `${SITE_URL}/lab`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    ...lab.map((p) => ({
      url: `${SITE_URL}/lab/${p.slug}`,
      lastModified: new Date(p.date),
      changeFrequency: "monthly" as const,
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
