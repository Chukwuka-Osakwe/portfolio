import { getAllMeta, getEntry } from "@/lib/content";
import { Mdx } from "@/components/Mdx";
import { ProjectsExplorer } from "@/components/ProjectsExplorer";

/** First couple of sentences of the body as plain text, for card previews. */
function makeExcerpt(body: string, sentences = 2): string {
  const para =
    body
      .split(/\n\s*\n/)
      .map((b) => b.trim())
      .find(
        (b) =>
          b &&
          !b.startsWith("#") &&
          !b.startsWith(">") &&
          !b.startsWith("-") &&
          !/^\d+\./.test(b),
      ) ?? "";
  const clean = para
    .replace(/\n/g, " ")
    .replace(/[*_`]/g, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
  const parts = clean.match(/[^.!?]+[.!?]+/g) ?? [clean];
  return parts.slice(0, sentences).join(" ").trim();
}

interface Props {
  /** When set, the explorer renders the detail view for this slug instead of
   *  the grid. Driven by the route: `/` passes nothing (grid), `/design/<slug>`
   *  passes the slug (detail). Same component, route-derived initial state —
   *  replaces the old `location.hash` model so every case study has a real,
   *  crawlable URL (per-route OG image, sitemap entry, no JS required). */
  initialSlug?: string;
}

/**
 * Server component: loads all work projects, pre-renders each MDX body, and
 * hands the metadata + rendered panes (+ a plain-text excerpt) to the client
 * explorer.
 */
export function ProjectsSection({ initialSlug }: Props = {}) {
  const projects = getAllMeta("work");
  const panes = projects.map((p) => {
    const { body } = getEntry("work", p.slug);
    return {
      slug: p.slug,
      // Card blurb: the authored `blurb` frontmatter, falling back to the first
      // sentences of the body when a file hasn't set one. (`summary` is reserved
      // for SEO/meta, kept separate from the card text.)
      excerpt: p.blurb?.trim() || makeExcerpt(body),
      node: <Mdx source={body} />,
    };
  });
  return (
    <ProjectsExplorer
      projects={projects}
      panes={panes}
      initialSlug={initialSlug}
    />
  );
}
