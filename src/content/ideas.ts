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
  /** Tiny base64 LQIP for next/image placeholder="blur". Set it on real covers
   *  (generate from the image with sharp); placeholder covers go without. */
  blurDataURL?: string;
  /** Intrinsic cover dimensions. The carousel renders the cover at its own
   *  aspect ratio (no crop, no letterbox) and caps its height so the page fits
   *  without scrolling. Required — every cover needs them. */
  width: number;
  height: number;
  /** Hide while drafting (mirrors Frontmatter.draft). */
  draft?: boolean;
}

export const ideas: Idea[] = [
  {
    // First real idea. Slug intentionally kept as the filename for now — rename
    // to the idea concept (not the file) before any promotion to MDX/routes.
    slug: "store-3",
    image: "/ideas/store-3-v3.webp",
    width: 2000,
    height: 1293,
    caption:
      "A Farcaster e-commerce mini-app. Everyday products with the full gamut of crypto payment options available to the user",
    blurDataURL:
      "data:image/webp;base64,UklGRswAAABXRUJQVlA4WAoAAAAQAAAADwAACQAAQUxQSEEAAAABd6CgbRuGP+PumkZEhFtonzcPNZHtRL8jJUrujjoVdkBPNCABEyAjMjgcRPQ/tPIW7qqE6WBPBuNCmJ8lL8lNAQBWUDggZAAAALABAJ0BKhAACgADgFoliAAC1oLnewAA/vX8Qn2Rc1I0QO0BaYEFJNG1pBplJj8WEqgYpdYL0rPyAQqBwV71lwf83vT1VAkFOsgKOr4uRJz6PS45MjS6YrPUWfA9s/+SMDz8AAA=",
  },
  {
    slug: "grok-customisation",
    image: "/ideas/grok-customisation-v2.webp",
    width: 2000,
    height: 1293,
    caption:
      "What if you could talk to a social media platform's agent and ask it to tailor your feed to very precise customisation?",
    blurDataURL:
      "data:image/webp;base64,UklGRmYAAABXRUJQVlA4IFoAAAAQAgCdASoQAAoAA4BaJZwAAn/gu1enagIAAP7zXyNaftpDtZaXzsajUKZx96Ng+u9UIKcwiiFsoMUViYFyh6BQ4ouKC8JTXdnB4A8rb4fV3bgAL3IAZpAAAAA=",
  },
  {
    slug: "subscriptions-mini-app",
    image: "/ideas/subscriptions-mini-app-v4.webp",
    width: 2000,
    height: 1293,
    caption:
      "A Farcaster mini-app tracking all the onchain subscriptions associated with a wallet. Obviously this one can grow beyond mini-app to become a one-stop shop for onchain subscriptions.",
    blurDataURL:
      "data:image/webp;base64,UklGRlQAAABXRUJQVlA4IEgAAAAwAgCdASoQAAoAA4BaJYwCdDBAAX/5CBD/gAD+Flm6TRx8mYz8aKtf2Wz+xPmAJP/T+tPq01I+KGGg1VVSgPM0YAN9JRwQgAA=",
  },
  {
    slug: "arsenal-agent",
    image: "/ideas/arsenal-agent-v4.webp",
    width: 2000,
    height: 1293,
    caption:
      "A club having a dedicated football agent could be an interesting direction. What if the Arsenal agent could help you purchase tickets to the Arsenal game conditionally?",
    blurDataURL:
      "data:image/webp;base64,UklGRl4AAABXRUJQVlA4IFIAAAAwAgCdASoQAAoAA4BaJYwC7AEQUKPOgtBcAAD++RcrCvdT9AznuZDwqB+FhrL+3A5ih91Jh2TMDiuS3q8Ev9h1vOI15Qz5mpTydnkjY0LsrVAA",
  },
];

/** Non-draft ideas, in author order. Parallels getAllMeta() for work/writing. */
export function getIdeas(): Idea[] {
  return ideas.filter((i) => !i.draft);
}
