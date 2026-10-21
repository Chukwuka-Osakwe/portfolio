import type { GallerySection } from "@/components/Gallery";
import type { BrandEntry } from "@/content/brand";

/* ChipMango — the reference brand/gallery entry (S38, generalized into the
 * shared registry S41). A self-initiated brand identity exploration, not an
 * MDX case study — no prose body, so this is typed data rather than a
 * frontmatter-driven .mdx file (mirrors src/content/ideas.ts). */

const A = (n: string) => `/design/chipmango/${n}.webp`;
const CM = {
  hero: A("hero"),
  motif: A("motif-grid"),
  typeSpec: A("type-specimen"),
  palette: A("palette"),
  paletteGrad: A("palette-gradient"),
  motifWordmark: A("motif-wordmark"),
  wordmark: A("wordmark"),
  brandFuture: A("brand-future"),
  cardUni: A("card-universities"),
  cardBiz: A("card-businesses"),
  cardWhy: A("card-whyjoin"),
  card300: A("card-300"),
  components: A("components"),
  wmGradOlive: A("wordmark-grad-olive"),
  wmGradEmber: A("wordmark-grad-ember"),
  talkGradOlive: A("talk-grad-olive"),
  talkGradEmber: A("talk-grad-ember"),
  overviewDesk: A("overview-desk"),
  talkPodium: A("talk-podium"),
  motifIpadGrid: A("motif-ipad-grid"),
  motifIpadMark: A("motif-ipad-mark"),
  mangoRipe: A("mango-ripe"),
  mangoTree: A("mango-tree"),
  onTheMoveEmber: A("on-the-move-ember"),
  onTheMoveOlive: A("on-the-move-olive"),
};

const AR = {
  hero: "16 / 10",
  typeSpec: "1600 / 1397",
  motif: "20 / 17",
  wordmark: "1600 / 1284",
  components: "200 / 157",
  sq: "1 / 1",
} as const;

// Sections mirror the paper-canvas grouping. Headless on purpose — a larger
// vertical gap between sections is the only divider; this is a wordless brand
// lookbook, so no GallerySection carries a `heading`. A 2-up pairs only matched sets.
const sections: GallerySection[] = [
  // 01 — Overview.
  {
    rows: [
      { span: "full", block: { kind: "render", aspect: AR.hero, src: CM.hero, alt: "ChipMango website hero — the chip-sun render" } },
      { span: "full", block: { kind: "image", aspect: "1042 / 1298", src: CM.overviewDesk, alt: "The ChipMango hero on a MacBook, on a desk" } },
    ],
  },
  // Colour — palette, the palette sourced from real fruit (ripe = warm, tree =
  // olive), then gradient fields.
  {
    rows: [
      { span: "full", block: { kind: "palette", aspect: AR.sq, src: CM.palette, alt: "Colour palette swatches" } },
      {
        span: "half",
        blocks: [
          { kind: "image", aspect: "3 / 4", src: CM.mangoRipe, alt: "Ripe orange mangoes at market — the warm palette" },
          { kind: "image", aspect: "3 / 4", src: CM.mangoTree, alt: "Green mangoes on the tree — the olive palette" },
        ],
      },
      { span: "full", block: { kind: "palette", aspect: AR.sq, src: CM.paletteGrad, alt: "Gradient colour fields" } },
    ],
  },
  // Motif & Logo.
  {
    rows: [
      { span: "full", block: { kind: "motif", aspect: AR.motif, src: CM.motif, alt: "Sun-chip motif grid" } },
      { span: "full", block: { kind: "motif", aspect: AR.sq, src: CM.motifWordmark, alt: "Mark studies — motif and wordmark" } },
      { span: "full", block: { kind: "wordmark", aspect: AR.wordmark, src: CM.wordmark, alt: "ChipMango wordmark on molten marble" } },
      {
        span: "half",
        blocks: [
          { kind: "wordmark", aspect: AR.sq, src: CM.wmGradEmber, alt: "Wordmark in an ember gradient" },
          { kind: "wordmark", aspect: AR.sq, src: CM.wmGradOlive, alt: "Wordmark in an olive gradient" },
        ],
      },
      {
        span: "half",
        blocks: [
          { kind: "image", aspect: "4 / 3", src: CM.motifIpadGrid, alt: "Motif grid on an iPad, on textured fabric and wood" },
          { kind: "image", aspect: "4 / 3", src: CM.motifIpadMark, alt: "Chip mark on an iPad, on textured fabric and wood" },
        ],
      },
    ],
  },
  // 02 — Typography / Messaging.
  {
    rows: [
      { span: "full", block: { kind: "type-specimen", aspect: AR.typeSpec, src: CM.typeSpec, alt: "Type specimen — Martian Mono and Onest" } },
      {
        span: "half",
        blocks: [
          { kind: "collateral", aspect: AR.sq, src: CM.cardUni, alt: "Social card — For Universities" },
          { kind: "collateral", aspect: AR.sq, src: CM.cardBiz, alt: "Social card — For Businesses" },
        ],
      },
      {
        span: "half",
        blocks: [
          { kind: "collateral", aspect: AR.sq, src: CM.cardWhy, alt: "Social card — Why join the future?" },
          { kind: "stat", aspect: AR.sq, src: CM.card300, alt: "Stat card — 300+" },
        ],
      },
      { span: "full", block: { kind: "big-type", aspect: AR.sq, src: CM.brandFuture, alt: "A brand for the future of microchip design" } },
      {
        span: "half",
        blocks: [
          { kind: "big-type", aspect: AR.sq, src: CM.onTheMoveEmber, alt: "On the move — for Africa's future (ember)" },
          { kind: "big-type", aspect: AR.sq, src: CM.onTheMoveOlive, alt: "On the move — for Africa's future (olive)" },
        ],
      },
    ],
  },
  // CTA — Talk to MangoAI.
  {
    rows: [
      {
        span: "half",
        blocks: [
          { kind: "product-ui", aspect: AR.sq, src: CM.talkGradEmber, alt: "Talk to MangoAI — button in an ember gradient" },
          { kind: "product-ui", aspect: AR.sq, src: CM.talkGradOlive, alt: "Talk to MangoAI — button in an olive gradient" },
        ],
      },
      { span: "full", block: { kind: "image", aspect: "4 / 3", src: CM.talkPodium, alt: "Talk to MangoAI on an iPad, on a dark podium" } },
    ],
  },
  // 04 — Components.
  {
    rows: [{ span: "full", block: { kind: "product-ui", aspect: AR.components, src: CM.components, alt: "UI components — buttons, mission and vision" } }],
  },
];

export const chipmango: BrandEntry = {
  meta: {
    slug: "chipmango",
    title: "ChipMango",
    date: "2026-09-25",
    blurb: "A brand identity system for ChipMango.",
    image: "/design/chipmango/wordmark.webp",
    video: null,
    ratio: "8 / 5", // house cover ratio — wordmark-on-mosaic motif cropped to 8:5 (covers live at 8:5 or 16:9 only)
    blurDataURL: undefined,
    eyebrow: "Self-initiated",
    tags: ["Visual Identity", "Art Direction", "Web Design"],
    description:
      "A brand exploration for ChipMango — a Nigerian microchip-design startup making semiconductor and edge-AI education accessible across Africa. Identity, type system, and web direction, briefed and built end-to-end.",
  },
  sections,
};
