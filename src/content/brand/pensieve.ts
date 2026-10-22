import type { Block, GallerySection } from "@/components/Gallery";
import type { BrandEntry } from "@/content/brand";

/* Pensieve — fourth brand/gallery entry (S45–S46), the first MOBILE-FOCUSED one
 * (chipmango/kickoff/aronia are all desktop-heavy). A digital travel journal
 * built as an editorial piece that happens to document a product, not a UX
 * case study. It opens on the core-experience frame (the trips archive), with
 * the splash title card second, then runs asset-first with no rail `description` — every text
 * moment is a designed image frame (exact Titillium art direction), not live
 * copy. All UI frames sit on one cream→peach gradient ground.
 *
 * Encoding (all UI/mockup frames `unoptimized`, so the bytes ship as-authored):
 * the gradient ground makes lossless wasteful (a smooth ramp is ~5× its lossy
 * size), so these go q92 — verified clean (no banding, QR + boarding-pass fine
 * print still legible). Only the flat palette + wordmark stay lossless (tiny).
 * The "World of Pensieve" travel photos keep the Next optimizer ON (`kind:
 * "image"`, no `unoptimized`) — photography, no text to ring. */

const GRAD = "2048 / 1652"; // shared native ratio of the gradient-ground frames

// UI / mockup frame on the cream→peach gradient ground — `unoptimized` (see the
// encoding note above). `kind` is semantic only (the renderer branches on
// "video" alone). aspect defaults to the shared ratio; override per odd frame.
const ui = (
  name: string,
  alt: string,
  kind: Block["kind"] = "product-ui",
  aspect: string = GRAD,
): Block => ({ kind, aspect, unoptimized: true, src: `/design/pensieve/${name}.webp`, alt });

// "World of Pensieve" travel photo — real photography, so the Next optimizer
// stays ON (no `unoptimized`): no text to ring, and it right-sizes the heavier
// files per viewport. All shot ~5:4.
const photo = (name: string, alt: string): Block => ({
  kind: "image",
  aspect: "5 / 4",
  src: `/design/pensieve/${name}.webp`,
  alt,
});

const full = (block: Block) => ({ span: "full" as const, block });

// One headless lookbook — no sections, no headings (S46; was a 4-section build).
// The ordering IS the structure: every cream→peach gradient frame is broken up
// by a dark frame (a "World of Pensieve" night photo, a dark phone mockup, the
// palette bands, or the near-black wordmark) so two warm grounds never butt
// together and sawtooth. The sole sanctioned adjacency is the two type boards
// (Titillium Web → Remember your journey) — they're one idea, so they pair.
// World photos stay dispersed (never adjacent). Opens on the trips-archive core
// frame, with the splash second (so splash → airport are the two dark openers
// back-to-back), and closes on the wordmark — which still echoes the splash's
// own platform→wordmark reveal.
const sections: GallerySection[] = [
  {
    // 120px frame-to-frame (vs the default 48) — dialled by eye (S46). With no
    // section dividers, this gap IS the lookbook's rhythm, so it runs wider.
    rowGap: 120,
    rows: [
      full(ui("trips-archive", "The core experience — a year’s trips, a trip broken into days, and a day’s memories: photos, a journal entry, a voice memo")),
      full({
        kind: "video",
        aspect: "1304 / 1034",
        src: "/design/pensieve/splash.mp4",
        poster: "/design/pensieve/splash-poster.webp",
        alt: "Pensieve splash — the orange “pensieve” wordmark drawing in over a near-empty night train platform",
      }),
      full(photo("world-airport-boarding", "A departures board at night — “Final call, boarding, Gate B14, London Heathrow” in amber dot-matrix")),
      full(ui("idea", "What if a travel journal didn’t ask you to document your trip? Pensieve is a quiet place to keep memories — somewhere to return to afterwards, rather than another feed to perform for while you’re away.", "big-type")),
      full(ui("app-icon", "The app on a home screen — the orange “P” mark on black, labelled “pensieve”, beside the system apps")),
      full(ui("welcome", "The welcome screen — the pensieve wordmark over “welcome to pensieve ngozi, ready to get started with new memories?” and two buttons: start a new trip, or import an existing one")),
      full(ui("new-trip-flow", "The ‘new trip’ flow — name the trip, set the dates, optional mindfulness suggestions, then a confirmation", "product-ui", "2048 / 1639")),
      full(photo("world-metro-sherbrooke", "A metro station — green seats against a yellow-tiled wall beneath a “Sherbrooke” sign")),
      full(ui("memory-types", "Three Pensieve memories on a warm ground — a boarding pass, a map-pinned location note, and a song paired with a voice memo")),
      full(ui("capture-widget", "A home-screen quick action for the current trip (‘Japan Trip: Day 3’) — capture, record, or write")),
      // The one sanctioned warm-on-warm pair: the two type boards belong together.
      full(ui("type-specimen", "The typeface — Titillium Web, a humanist-inspired typeface designed for digital screens, shown on a warm ground", "type-specimen")),
      full(ui("type-scale", "The type scale — “Remember your journey.” set from small to display across the ramp", "type-specimen")),
      full(ui("palette", "The Pensieve palette — cream, warm tan, warm grey, olive-grey, bright orange, burnt orange, near-black and black bands", "palette")),
      full(photo("world-train-platform", "A near-empty train platform at night — a destination board reading “London Paddington”, benches along the wall")),
      full(ui("wordmark", "The Pensieve wordmark — lowercase orange “pensieve” with a hand-drawn imperfect underline on a near-black ground", "wordmark")),
    ],
  },
];

export const pensieve: BrandEntry = {
  meta: {
    slug: "pensieve",
    title: "Pensieve",
    date: "2026-10-21",
    blurb: "A memory portal disguised as a travel journal.",
    image: "/design/pensieve/cover.webp",
    video: null,
    ratio: "5 / 4", // card cover — a padded wordmark lockup, natively ~1.24:1 so 5:4 frames it near-uncropped (and groups with chipmango's 5:4). Distinct from the tight full-bleed `wordmark` lookbook frame.
    unoptimized: true, // flat near-black ground — the optimizer's lossy q75 re-encode bands it; serve the 17K lossless source direct
    blurDataURL: undefined,
    eyebrow: "Self-initiated",
    tags: ["Product Design", "Brand Identity", "Interaction"],
    // Headline (S46) — the lead paragraph above the splash; also the share/OG
    // description. Sets the 3-day-sprint context + the brief, then lands on the
    // memory-keeping (not travel-logging) thesis the baked `idea` frame echoes.
    description:
      "Pensieve is the result of a 3-day design sprint. The aim was to try to conceptualise a different kind of travel journal — one that encourages modes of capturing memories while travelling that don’t interfere with the user’s experience of the trip. It isn’t really a travel journal, it’s a place to return to moments that would otherwise fade.",
  },
  sections,
};
