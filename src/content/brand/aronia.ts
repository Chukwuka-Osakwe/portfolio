import type { Block, GallerySection } from "@/components/Gallery";
import type { BrandEntry } from "@/content/brand";

// Every hero mockup is a full-bleed website/app UI shot, served `unoptimized`
// (as-is, no Next optimizer re-encode — the flat graphic ones are lossless and
// the optimizer would ring their type; the photo/gradient ones are already
// q92). aspect = the served file's native ratio so object-cover never crops.
const shot = (name: string, aspect: string, alt: string): Block => ({
  kind: "product-ui",
  aspect,
  unoptimized: true,
  src: `/design/aronia/${name}.webp`,
  alt,
});

// Setlist screens are all 2000×1096 desktop captures.
const SL = "2000 / 1096";

// Live aronia-site captures are all 3024×1654 retina screen grabs.
const SITE = "3024 / 1654";

/* Aronia — third brand/gallery entry (S43), folded out of the lab section
 * (was src/content/lab/aronia.mdx; the prose moved to an essay, see
 * src/content/writing/teaching-ai-to-speak-design-languages.mdx — the same
 * move Kickoff made in S41). Unlike ChipMango/Kickoff, Aronia is a tool, not a
 * pure visual-identity piece: an agent-friendly component library with one
 * component set per design language. Its "go use it" CTA (GitHub + npx) is the
 * point, so the rail carries link chips (GalleryMeta.links, added S43) — the
 * lookbook has no prose body to hang a CTA on.
 *
 * Assets live at /design/aronia/ (unified from the old /lab/aronia/ in S43, to
 * match /design/chipmango/ and /design/kickoff/). Built up in batches as the
 * per-language component specimens land. */

const sections: GallerySection[] = [
  // Splash — the hero (headless): the aronia wordmark on an animated
  // liquid-navy field. Native ~5:4 (served 1280×1032), so the frame aspect is
  // native and object-cover never crops. Same splash pattern as Kickoff.
  {
    rows: [
      {
        span: "full",
        block: {
          kind: "video",
          aspect: "1280 / 1032",
          src: "/design/aronia/splash.mp4",
          poster: "/design/aronia/splash-poster.webp",
          alt: "Aronia splash — the wordmark on an animated liquid-navy field",
        },
      },
    ],
  },
  // The website — captures of the live aronia landing page itself, leading the
  // gallery (it's the real product). Full-width, in page-scroll order:
  // hero → problem → Setlist showcase → setup → pick-a-look → FAQ → closing CTA.
  {
    heading: "The website",
    note: "Shots of the aronia landing page itself.",
    rows: [
      { span: "full", block: shot("site-hero", SITE, "The aronia landing page — the hero: teal wordmark, the “Reject the default AI look.” headline, and a band of mockups") },
      { span: "full", block: shot("site-problem", SITE, "“Your app works. It just looks like everyone else’s.” — a generic SaaS mockup as the default-AI-look foil") },
      { span: "full", block: shot("site-setlist", SITE, "“One point of view, every screen.” — the Setlist showcase with a light/dark toggle") },
      { span: "full", block: shot("site-setup", SITE, "“Three steps. No code.” — step one: run `npx aronia init`") },
      { span: "full", block: shot("site-pick-a-look", SITE, "“Pick a look” — the style picker, previewing a Neo-Brutalism treatment") },
      { span: "full", block: shot("site-faq", SITE, "The FAQ — do I need to know how to code or design, what am I installing, is it free") },
      { span: "full", block: shot("site-cta", SITE, "The closing CTA — “Make your next website look like a choice.” — and the footer") },
    ],
  },
  // Hero mockups — eight website/app heroes, each a different design language,
  // all built with aronia. Landscapes run full-width (their UI stays readable);
  // the two editorial phone-app squares pair into a 2-up. Sequenced for colour
  // rhythm off the navy splash: neo (yellow) → glass (purple) → the light pair
  // → drop (blue) → depart (black) → halo (lilac) → spindle (dark).
  {
    heading: "Hero mockups",
    note: "All built with aronia, designed to showcase the range of looks.",
    rows: [
      { span: "full", block: shot("neo", "2048 / 1579", "A neo-brutalist revenue dashboard (“Tally”) — electric-yellow ground, black borders, bold type") },
      { span: "full", block: shot("glass", "2048 / 1368", "A glassmorphism fitness dashboard (“Good morning, Masaya”) — frosted cards on a deep-purple gradient") },
      {
        span: "half",
        blocks: [
          shot("swiss", "1800 / 1803", "A Swiss-editorial news app (“The Dispatch”) — a phone mockup on a light dotted ground"),
          shot("riso", "1800 / 1803", "A risograph-styled recipe app (“Simmer”) — a phone mockup on a warm tan ground"),
        ],
      },
      { span: "full", block: shot("drop", "2048 / 1368", "A bold e-commerce product page (“DROP”, the Aero Trail ’92 sneaker) on a blue dotted ground") },
      { span: "full", block: shot("depart", "2048 / 1579", "A dark transit departures board (“Departures”, King’s Cross) — editorial, monospace times, live status") },
      { span: "full", block: shot("halo", "1800 / 1803", "A soft weather app (San Francisco, 64°) — a phone mockup on a lilac halo gradient") },
      { span: "full", block: shot("spindle", "2048 / 1579", "A dark music player (“Spindle”, Midnight Pressing) with a magenta accent") },
    ],
  },
  // Setlist — a gig-discovery site built with aronia's Risograph library in
  // under ten prompts. Dark variants only, each full-width so the UI stays readable,
  // sequenced as a product flow: Discover → Artists → My Shows → gig detail.
  // (The light variants exist in public/ too, parked — the 2-up light|dark
  // pairing read too small, so we lead with dark alone.)
  {
    heading: "Setlist",
    note: "A gig-discovery site I built with aronia’s Risograph library in less than ten prompts to show what’s possible.",
    rows: [
      { span: "full", block: shot("setlist-discover-dark", SL, "Setlist — the Discover home: a featured-gig hero (The Marías) over a “gigs near you” grid") },
      { span: "full", block: shot("setlist-artists-dark", SL, "Setlist — Artists: the followed-artists grid with genre tags") },
      { span: "full", block: shot("setlist-shows-dark", SL, "Setlist — My Shows: saved gigs with going/interested status and prices") },
      { span: "full", block: shot("setlist-gig-dark", SL, "Setlist — a gig detail page: Little Simz at the Roundhouse, with “more gigs like this”") },
    ],
  },
  // Early explorations — the landing page's design direction worked out on the
  // Paper canvas before any code: palette, the aronia-berry photography, type
  // studies, and hero/footer/mobile frames. One standalone frame (the full
  // canvas, app chrome included — the point is that it's a design tool), closing
  // the gallery on where it started.
  {
    heading: "Early explorations",
    note: "The landing page’s design direction on the Paper canvas, before building.",
    rows: [
      { span: "full", block: shot("paper-explorations", "3024 / 1964", "The aronia explorations on the Paper design canvas — palette swatches, aronia-berry photography, typography studies, and hero/footer/mobile frames") },
    ],
  },
];

export const aronia: BrandEntry = {
  meta: {
    slug: "aronia",
    title: "Aronia",
    date: "2026-07-15",
    blurb: "An agentic component library for vibecoders.",
    image: "/design/aronia/splash-poster.webp",
    video: "/design/aronia/splash.mp4",
    ratio: "16 / 9", // card cover — center-crops the ~5:4 splash to the wordmark band (matches Kickoff's card)
    blurDataURL: undefined,
    eyebrow: "In progress",
    tags: ["Design Systems", "AI Tooling", "Web Design"],
    description:
      "Aronia is my attempt to teach agents how to produce distinctive visual languages and give vibecoders who don’t have a design background the ability to make user interfaces that don’t default to the common AI look. I designed and built a simple landing page to show what it’s capable of and how to use it.",
    links: [
      { label: "Website", href: "https://aronia-pi.vercel.app/" },
      { label: "Read the essay", href: "/essays/teaching-ai-to-speak-design-languages" },
    ],
  },
  sections,
};
