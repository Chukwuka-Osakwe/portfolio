import type { GalleryMeta, GallerySection } from "@/components/Gallery";
import { chipmango } from "@/content/brand/chipmango";
import { kickoff } from "@/content/brand/kickoff";

/**
 * Brand/gallery entries — the sibling of `ideas.ts`: self-initiated brand
 * explorations with no prose body, so they're typed data rather than MDX (see
 * src/lib/content.ts's Section note on why ideas skip MDX for the same
 * reason). Rendered by the generic <Gallery> at /design/<slug>.
 */
export interface BrandCardMeta {
  slug: string;
  title: string;
  date: string;
  blurb: string;
  image: string | null;
  video: string | null;
  ratio: string | null;
  blurDataURL?: string;
}

export interface BrandEntry {
  meta: BrandCardMeta & GalleryMeta;
  sections: GallerySection[];
}

const BRAND_ENTRIES: BrandEntry[] = [chipmango, kickoff];

export function getBrandEntries(): BrandEntry["meta"][] {
  return BRAND_ENTRIES.map((e) => e.meta);
}

export function getBrandEntry(slug: string): BrandEntry | undefined {
  return BRAND_ENTRIES.find((e) => e.meta.slug === slug);
}
