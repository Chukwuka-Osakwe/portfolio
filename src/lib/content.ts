import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

export type Section = "work" | "writing";

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
  tags?: string[];
  /** Work-only: the role you played on the project. */
  role?: string;
  /** Card cover image — a path under /public, e.g. "/work/footy/cover.png". */
  image?: string;
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
  return {
    meta: { ...(data as Frontmatter), slug, section },
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
