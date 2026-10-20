import type { MetadataRoute } from "next";
import { getAllMeta } from "@/lib/content";
import { SITE_URL } from "@/lib/site";

/**
 * Static sitemap — the merged work grid (`/`, case studies + lab items) + one
 * entry per detail page, the essays + product-ideas + contact routes.
 *
 * Every detail page (case study or lab item) lives at `/design/<slug>` (S40:
 * one shared route namespace), generated statically from `src/content/work/`
 * and `src/content/lab/`, so each one gets its own URL, per-route OG
 * metadata, and indexable presence. The old `/design` and `/lab` indexes, and
 * the old per-lab-item `/lab/<slug>` routes, all 308-redirect into this
 * namespace (see `next.config.ts`), so none of them are listed here.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const details = [...getAllMeta("work"), ...getAllMeta("lab")];
  const essays = getAllMeta("writing");
  return [
    // `/` is the merged work grid — case studies and lab items in one stream.
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: "monthly", priority: 1 },
    ...details.map((p) => ({
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
