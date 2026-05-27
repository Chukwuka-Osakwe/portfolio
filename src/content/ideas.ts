/**
 * Product ideas — the lightweight sibling of the MDX `work/` and `writing/`
 * sections. An idea is just a cover image + a one-line caption (no body), so it
 * lives here as a typed array rather than as per-file MDX with frontmatter.
 * Kept under src/content/ on purpose, so it sits alongside work/ and writing/.
 *
 * PROMOTING TO MDX (only if ideas ever grow real bodies):
 *   1. Add "ideas" to the `Section` union in src/lib/content.ts.
 *   2. Create src/content/ideas/<slug>.mdx, one per idea, moving `caption`
 *      into frontmatter (e.g. as `blurb`) + the prose into the body.
 *   3. Replace getIdeas() below with the generic getAllMeta("ideas").
 * The field names here (slug, image, draft) deliberately match `Frontmatter`
 * so that migration is mostly mechanical.
 */
export interface Idea {
  /** Stable id — used as the React key now, and the MDX slug if promoted. */
  slug: string;
  /** Cover image — a path under /public (mirrors Frontmatter.image). */
  image: string;
  /** One-line description shown under the image in the carousel. */
  caption: string;
  /** Hide while drafting (mirrors Frontmatter.draft). */
  draft?: boolean;
}

// TEMP: placeholder set — reuses the project/Unsplash images + sample one-liners.
// Swap in the real ideas (and their cover images under /public) later.
export const ideas: Idea[] = [
  {
    slug: "focus-timer",
    image: "/batman.jpg",
    caption: "A focus timer that rewards deep work, not streaks.",
  },
  {
    slug: "calm-weather",
    image: "/anders-jilden-GjwsHRIcQjU-unsplash.jpg",
    caption: "Calm weather, told as a single sentence.",
  },
  {
    slug: "reading-queue",
    image: "/jacob-kiesow-Mb_Rgr8iD88-unsplash.jpg",
    caption: "Reading queue that surfaces what you'll actually finish.",
  },
  {
    slug: "trip-planning",
    image: "/john-fowler-RsRTIofe0HE-unsplash.jpg",
    caption: "Trip planning that thinks in days, not lists.",
  },
  {
    slug: "night-sky-journal",
    image: "/nasa-WKT3TE5AQu0-unsplash.jpg",
    caption: "A night-sky journal for backyard astronomers.",
  },
  {
    slug: "habit-tracker",
    image: "/nitish-meena-RbbdzZBKRDY-unsplash.jpg",
    caption: "Habit tracker that fades into the background.",
  },
];

/** Non-draft ideas, in author order. Parallels getAllMeta() for work/writing. */
export function getIdeas(): Idea[] {
  return ideas.filter((i) => !i.draft);
}
