import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { WORK_COVER_LQIPS } from "@/content/work-covers";

export type Section = "work" | "writing" | "lab";

// NOTE: "product ideas" are intentionally NOT a Section. An idea is just an image
// + a one-line caption (no MDX body), so it lives as typed data in
// src/content/ideas.ts rather than as per-file MDX. If ideas ever grow real
// bodies, promote them: add "ideas" here, drop .mdx files in src/content/ideas/,
// and swap getIdeas() for getAllMeta("ideas"). See src/content/ideas.ts.

/** Frontmatter authored at the top of each .mdx file. */
export interface Frontmatter {
  title: string;
  /** One-line summary — reserved for SEO / meta + OG description (not the card). */
  summary: string;
  /** Card preview blurb. Falls back to a body excerpt when unset. */
  blurb?: string;
  /** ISO date string, e.g. "2026-05-01". */
  date: string;
  /** Work-only: the category of work this case study represents (e.g.
   *  "PRODUCT DESIGN", "VISUAL DESIGN"). Renders as an eyebrow label on
   *  the card + below the detail-header H1. */
  type?: string;
  /** Card cover image — a path under /public, e.g. "/work/footy/cover.png".
   *  For lab items this doubles as the hero video's poster + OG source. */
  image?: string;
  /** Lab-only: hero clip — an autoplay/loop video path under /public, e.g.
   *  "/lab/aronia/walkthrough.mp4". Rendered muted+looping by <LabHeroVideo>
   *  (poster = `image`). Absent for work/writing. */
  video?: string;
  /** Lab-only: current build stage — a small tag, e.g. "in progress",
   *  "pre-beta". The lab is defined by being self-directed, not by being
   *  finished, so this is metadata, not the headline. */
  stage?: string;
  /** Lab-only: outbound destinations (the item's real home lives elsewhere) —
   *  e.g. a live site, a GitHub repo, a demo. Rendered as link chips on the
   *  detail page. YAML array of { label, href } in frontmatter. */
  links?: { label: string; href: string }[];
  /** Mark true to hide from listings while drafting. */
  draft?: boolean;
  /** Pin to the top of the listing (sorted ahead of unpinned entries, then
   *  date-desc within each group). Use sparingly — it's a manual override on
   *  chronological order, intended for the real case studies while placeholder
   *  entries are still around. */
  featured?: boolean;
}

export interface ContentMeta extends Frontmatter {
  slug: string;
  section: Section;
  /** Generated (not authored): base64 LQIP for `next/image` placeholder="blur".
   *  Populated by `getEntry` from `src/content/work-covers.ts` based on `image`.
   *  Sidecar to frontmatter so authors don't have to paste a noisy base64
   *  string into MDX YAML. Undefined when no LQIP is registered for the path. */
  blurDataURL?: string;
}

export interface Entry {
  meta: ContentMeta;
  /** MDX body with frontmatter stripped. */
  body: string;
}

const CONTENT_DIR = path.join(process.cwd(), "src", "content");

function sectionDir(section: Section): string {
  return path.join(CONTENT_DIR, section);
}

export function getSlugs(section: Section): string[] {
  const dir = sectionDir(section);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => f.replace(/\.mdx$/, ""));
}

export function getEntry(section: Section, slug: string): Entry {
  const file = path.join(sectionDir(section), `${slug}.mdx`);
  const raw = fs.readFileSync(file, "utf8");
  const { data, content } = matter(raw);
  const fm = data as Frontmatter;
  // Attach LQIP if the cover path has one registered. Keyed by image path so a
  // renamed/versioned cover carries its placeholder with it. See work-covers.ts.
  const blurDataURL = fm.image ? WORK_COVER_LQIPS[fm.image] : undefined;
  return {
    meta: { ...fm, slug, section, blurDataURL },
    body: content,
  };
}

/** All non-draft entries in a section. Featured entries float to the top;
 *  within each group (featured / not), sort is date-desc (newest first). */
export function getAllMeta(section: Section): ContentMeta[] {
  return getSlugs(section)
    .map((slug) => getEntry(section, slug).meta)
    .filter((m) => !m.draft)
    .sort((a, b) => {
      // Pinned first, then newest first within each group.
      const af = a.featured ? 1 : 0;
      const bf = b.featured ? 1 : 0;
      if (af !== bf) return bf - af;
      return +new Date(b.date) - +new Date(a.date);
    });
}

/** Featured entries across both sections for the homepage. */
export function getFeatured(): ContentMeta[] {
  return (["work", "writing"] as const)
    .flatMap((section) => getAllMeta(section))
    .filter((m) => m.featured);
}
