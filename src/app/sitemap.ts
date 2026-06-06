import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

/**
 * Static sitemap — only the three real routes (home, contact, product-ideas).
 *
 * Case studies live as hash deep-links on `/` (e.g. `/#footy`) per the
 * in-place detail pattern, not as separate routes. Sitemaps want URLs that
 * respond independently, so we don't list them here — their content is still
 * crawlable via the hidden static block rendered alongside the grid.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: "monthly", priority: 1 },
    { url: `${SITE_URL}/product-ideas`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/contact`, lastModified: now, changeFrequency: "yearly", priority: 0.5 },
  ];
}
