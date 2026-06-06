/**
 * Single source of truth for the site's canonical URL — used by metadataBase,
 * sitemap, robots, and OG `url` resolution.
 *
 * ⚠️ TODO(domain): placeholder until the Vercel domain is wired. Swap to the
 * real domain before the first production deploy goes live.
 *
 * Override at deploy time by setting `NEXT_PUBLIC_SITE_URL`; the env var wins
 * if present (lets us point staging deploys at a different URL without code
 * changes). Falls back to the placeholder for local dev.
 */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
  "https://chukwuka.design";

export const SITE_NAME = "Chukwuka Osakwe";
export const SITE_TAGLINE = "chukwuka's matrix";
export const SITE_DESCRIPTION =
  "Chukwuka Osakwe is a systems-oriented designer building thoughtful interfaces for complex products. Selected work and product ideas.";
