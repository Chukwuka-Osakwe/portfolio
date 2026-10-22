import type { GallerySection } from "@/components/Gallery";
import type { BrandEntry } from "@/content/brand";

/* ChipMango — the reference brand/gallery entry (S38, generalized into the
 * shared registry S41). A self-initiated brand identity exploration, not an
 * MDX case study — no prose body, so this is typed data rather than a
 * frontmatter-driven .mdx file (mirrors src/content/ideas.ts). */

const A = (n: string) => `/design/chipmango/${n}.webp`;
const CM = {
  hero: A("hero"),
  heroEmber: A("hero-ember"),
  heroOlive: A("hero-olive"),
  socialAccessible: A("social-accessible"),
  socialGrowth: A("social-growth"),
  socialOnTheMove: A("social-on-the-move"),
  socialEdgeAi: A("social-edge-ai"),
  palette: A("palette"),
  paletteGrad: A("palette-gradient"),
  cardUni: A("card-universities"),
  cardBiz: A("card-businesses"),
  cardWhy: A("card-whyjoin"),
  card300: A("card-300"),
  overviewDesk: A("overview-desk"),
  mangoRipe: A("mango-ripe"),
  mangoTree: A("mango-tree"),
  // Type specimen (Martian Mono / Onest) across the four solid brand grounds.
  typeLight: A("type-light"),
  typeDark: A("type-dark"),
  typeRed: A("type-red"),
  typeGreen: A("type-green"),
  // Chip-motif + wordmark shown as a 2×2 board across the brand grounds,
  // darker and brighter tonal sets (S48).
  motifBoardDark: A("motif-board-dark"),
  motifBoardBright: A("motif-board-bright"),
  // Wordmark lockup as a 2×2 board — one across the four gradient grounds, one
  // across the four solid fills, each on the orange page ground (S49, replacing
  // the eight per-ground wordmark frames).
  wordmarkBoardGradient: A("wordmark-board-gradient"),
  wordmarkBoardSolid: A("wordmark-board-solid"),
};

const AR = {
  hero: "16 / 10",
  typeSpecimen: "55 / 48",
  sq: "1 / 1",
  board: "5 / 4", // the 2×2 wordmark-lockup boards (native 14672×11736 ≈ 5:4)
} as const;

// Sections mirror the paper-canvas grouping. Each carries a `heading` label for
// wayfinding (Gallery handles the headed spacing). A 2-up pairs only matched sets.
const sections: GallerySection[] = [
  // Splash opener — the animated-mosaic wordmark (same clip as the card cover;
  // seamless-loop crossfade). Native 960×774 ≈ 5:4, so the frame aspect is native
  // and object-cover never crops. Same splash pattern as Kickoff/Aronia.
  {
    heading: "Identity in motion",
    note: "The wordmark resolving out of its chip-mosaic field.",
    rows: [
      {
        span: "full",
        block: {
          kind: "video",
          aspect: "960 / 774",
          src: "/design/chipmango/wordmark.mp4",
          poster: "/design/chipmango/splash-poster.webp",
          alt: "ChipMango splash — the orange wordmark on an animated mosaic field",
        },
      },
    ],
  },
  // Colour — palette, the palette sourced from real fruit (ripe = warm, tree =
  // olive), then gradient fields.
  {
    heading: "Colour",
    note: "A palette drawn from the fruit — ripe-orange warmth, unripe-olive green — and the gradients between.",
    rows: [
      {
        span: "half",
        blocks: [
          { kind: "image", aspect: "3 / 4", src: CM.mangoRipe, alt: "Ripe orange mangoes at market — the warm palette" },
          { kind: "image", aspect: "3 / 4", src: CM.mangoTree, alt: "Green mangoes on the tree — the olive palette" },
        ],
      },
      { span: "full", block: { kind: "palette", aspect: AR.sq, src: CM.palette, alt: "Colour palette swatches" } },
      { span: "full", block: { kind: "palette", aspect: AR.sq, src: CM.paletteGrad, alt: "Gradient colour fields" } },
    ],
  },
  // The marks — the chip motif and the wordmark laid out as 2×2 boards across
  // the brand grounds. First the motif boards (darker set, then brighter), then
  // the wordmark lockup on the gradient grounds and on the solid fills (S49 —
  // these two boards replaced the eight per-ground wordmark frames). Smooth
  // gradient / flat panels, so served `unoptimized` + lossless. Single-column.
  {
    heading: "The marks",
    note: "The chip motif and the wordmark, laid out across the brand grounds.",
    rows: [
      { span: "full", block: { kind: "motif", aspect: AR.sq, unoptimized: true, src: CM.motifBoardDark, alt: "Chip motif and ChipMango wordmark across the brand grounds — the darker set" } },
      { span: "full", block: { kind: "motif", aspect: AR.sq, unoptimized: true, src: CM.motifBoardBright, alt: "Chip motif and ChipMango wordmark across the brand grounds — the brighter set" } },
      { span: "full", block: { kind: "wordmark", aspect: AR.board, unoptimized: true, src: CM.wordmarkBoardGradient, alt: "ChipMango wordmark lockup on the four gradient grounds — dark ember, olive-ember, bright ember, olive-orange" } },
      { span: "full", block: { kind: "wordmark", aspect: AR.board, unoptimized: true, src: CM.wordmarkBoardSolid, alt: "ChipMango wordmark lockup on the four solid fills — red ember, olive green, light cream, near-black" } },
    ],
  },
  // Type — the specimen (Martian Mono headlines / Onest body) shown across the
  // four solid brand grounds, ordered light → dark → red → green. Flat fills +
  // high-contrast type, so served `unoptimized` + lossless (the message-card
  // rule). Single-column.
  {
    heading: "Typography",
    note: "Martian Mono for headlines, Onest for body, across every ground.",
    rows: [
      { span: "full", block: { kind: "type-specimen", aspect: AR.typeSpecimen, unoptimized: true, src: CM.typeLight, alt: "Type specimen — Martian Mono and Onest on the light cream ground" } },
      { span: "full", block: { kind: "type-specimen", aspect: AR.typeSpecimen, unoptimized: true, src: CM.typeDark, alt: "Type specimen — Martian Mono and Onest on the dark coffee ground" } },
      { span: "full", block: { kind: "type-specimen", aspect: AR.typeSpecimen, unoptimized: true, src: CM.typeRed, alt: "Type specimen — Martian Mono and Onest on the red ember ground" } },
      { span: "full", block: { kind: "type-specimen", aspect: AR.typeSpecimen, unoptimized: true, src: CM.typeGreen, alt: "Type specimen — Martian Mono and Onest on the green olive ground" } },
    ],
  },
  // Messaging — the social/message cards (cream type on brand gradient grounds).
  // Served `unoptimized` + lossless: high-contrast text on a smooth gradient is
  // the exact case Next's ~q75 optimizer rings, and these flat limited-palette
  // cards are tiny lossless (45–157KB), so there's no size cost to crispness.
  // Single-column.
  {
    heading: "Messaging",
    note: "The brand voice — short statements set on the gradient grounds.",
    rows: [
      { span: "full", block: { kind: "big-type", aspect: AR.sq, unoptimized: true, src: CM.socialOnTheMove, alt: "Message card — “On the move. For Africa’s future.”" } },
      { span: "full", block: { kind: "big-type", aspect: AR.sq, unoptimized: true, src: CM.socialGrowth, alt: "Message card — driving the growth of semiconductor and AI expertise with ARM-based training and workforce development built for real impact" } },
      { span: "full", block: { kind: "big-type", aspect: AR.sq, unoptimized: true, src: CM.socialAccessible, alt: "Message card — “Microchip design made accessible.”" } },
      { span: "full", block: { kind: "big-type", aspect: AR.sq, unoptimized: true, src: CM.socialEdgeAi, alt: "Message card — from system design to edge AI, develop practical skills and collaborate with a global network of engineers building the next generation of technology" } },
    ],
  },

  // Audiences — the who-it's-for / value-prop cards (headline + body) on the
  // four solid brand grounds, ordered light → dark → red → green to match the
  // Type section. Flat fills + high-contrast type → `unoptimized` + lossless.
  // Single-column.
  {
    heading: "Audiences",
    note: "The pitch to each audience ChipMango serves — campus, industry, and the curious.",
    rows: [
      { span: "full", block: { kind: "collateral", aspect: AR.sq, unoptimized: true, src: CM.cardUni, alt: "Card — “ChipMango For Universities”, on the light cream ground" } },
      { span: "full", block: { kind: "collateral", aspect: AR.sq, unoptimized: true, src: CM.cardBiz, alt: "Card — “ChipMango For Businesses”, on the dark coffee ground" } },
      { span: "full", block: { kind: "collateral", aspect: AR.sq, unoptimized: true, src: CM.cardWhy, alt: "Card — “Why join the future?”, on the red ember ground" } },
      { span: "full", block: { kind: "collateral", aspect: AR.sq, unoptimized: true, src: CM.card300, alt: "Card — “Taking AI to the edge of humanity”, on the green olive ground" } },
    ],
  },

  // More sections go here (rebuild zone, S48) — above the hero screens below.

  // Hero screens — the website hero in its three palette grounds (dark · ember ·
  // olive), then the desk mockup; moved out of the opener to close the entry
  // (S48). Single-column.
  {
    heading: "Hero explorations",
    note: "Directions for the website hero across the three brand grounds, then mocked up on a desk.",
    rows: [
      { span: "full", block: { kind: "render", aspect: AR.hero, src: CM.hero, alt: "ChipMango website hero — the chip-sun render on a near-black ground" } },
      { span: "full", block: { kind: "render", aspect: AR.hero, src: CM.heroEmber, alt: "ChipMango website hero — the chip-sun render on an ember ground" } },
      { span: "full", block: { kind: "render", aspect: AR.hero, src: CM.heroOlive, alt: "ChipMango website hero — the chip-sun render on an olive ground" } },
      { span: "full", block: { kind: "image", aspect: "1042 / 1298", src: CM.overviewDesk, alt: "The ChipMango hero on a MacBook, on a desk" } },
    ],
  },
];

export const chipmango: BrandEntry = {
  meta: {
    slug: "chipmango",
    title: "ChipMango",
    date: "2026-09-25",
    blurb: "A brand identity system for ChipMango.",
    image: "/design/chipmango/wordmark.webp",
    video: "/design/chipmango/wordmark.mp4", // animated mosaic behind the wordmark; wordmark.webp is the poster

    ratio: "5 / 4", // card cover — the wordmark-on-mosaic motif is natively ~1.25:1, so 5:4 frames it near-uncropped (covers live at 16:9 or 5:4 only)
    blurDataURL: undefined,
    eyebrow: "Self-initiated",
    tags: ["Visual Identity", "Art Direction", "Web Design"],
    description:
      "An exercise in taking the “mango” part of ChipMango seriously and building a lookbook for the brand based on a mango-inspired palette. The key here was to create a system that while mango-inspired still communicated the seriousness and ambition of an African chip design startup.",
  },
  sections,
};
