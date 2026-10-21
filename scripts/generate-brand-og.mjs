// Generate per-brand-entry OG images (1200×630) for the brand/gallery entries.
//
// Run: `node scripts/generate-brand-og.mjs` (all brand entries)
//      `node scripts/generate-brand-og.mjs chipmango` (subset by slug)
// Output: `public/og/<slug>.png` for each brand entry — shares the flat `og/`
// dir with case-study + lab OGs, so brand slugs must stay distinct from work
// and lab slugs (checked at merge time; re-check if any set grows).
//
// WHY A HARDCODED SOURCE MAP (not frontmatter, like the case/lab scripts):
// brand entries aren't MDX — they're typed TS modules (src/content/brand/*.ts)
// with `@/` path aliases, which a plain .mjs can't import without a TS loader,
// and the cover `image` field appears many times inside each file's asset
// blocks (so a regex would be fragile). There are only a handful of brand
// entries and the OG source is a deliberate per-entry curation call, so an
// explicit map here mirrors how the sibling scripts encode their content *dir*,
// just one level more specific (the source *path*). Add a line per new entry.
//
// Source choice is intentional and need not be the card cover:
//   - chipmango → hero (richer than the wordmark cover used in the grid)
//   - kickoff   → splash-poster (its cover; near-OG ratio already)
//
// Same corner-sampled contain-pad technique as generate-case-og.mjs /
// generate-lab-og.mjs: `fit: contain` to 1200×630, padded with the source's
// OWN sampled edge colour so the strip reads as an extension of the frame, not
// as added bars — and so sharing platforms don't centre-crop the source.
//
// Re-run when: a brand entry's OG source changes, a new brand entry lands, or
// the OG aspect target changes.

import sharp from "sharp";
import { mkdirSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PUBLIC_DIR = path.join(root, "public");
const OUT_DIR = path.join(PUBLIC_DIR, "og");

// slug → OG source image (public-relative path). See header note on why this
// is explicit rather than read from the registry.
const SOURCES = {
  chipmango: "/design/chipmango/hero.webp",
  kickoff: "/design/kickoff/splash-poster.webp",
};

const OG_WIDTH = 1200;
const OG_HEIGHT = 630;
// Sampled area in the source's top-left corner used to pick the pad colour.
// Averaging 24×24 pixels rather than a single pixel is robust against thin
// borders / UI chrome on the frame edge.
const SAMPLE_PX = 24;

/** Sample the top-left corner of an image and return the averaged RGB. */
async function sampleCornerColor(imagePath) {
  const { data, info } = await sharp(imagePath)
    .extract({ left: 0, top: 0, width: SAMPLE_PX, height: SAMPLE_PX })
    .raw()
    .toBuffer({ resolveWithObject: true });
  const stride = info.channels;
  const pixels = data.length / stride;
  let r = 0;
  let g = 0;
  let b = 0;
  for (let i = 0; i < data.length; i += stride) {
    r += data[i];
    g += data[i + 1];
    b += data[i + 2];
  }
  return {
    r: Math.round(r / pixels),
    g: Math.round(g / pixels),
    b: Math.round(b / pixels),
  };
}

async function generateOg(imagePath, outPath) {
  const bg = await sampleCornerColor(imagePath);
  await sharp(imagePath)
    .resize(OG_WIDTH, OG_HEIGHT, {
      fit: "contain",
      background: { r: bg.r, g: bg.g, b: bg.b, alpha: 1 },
      kernel: "lanczos3",
    })
    .png({ compressionLevel: 9 })
    .toFile(outPath);
  return bg;
}

async function main() {
  const args = process.argv.slice(2);
  mkdirSync(OUT_DIR, { recursive: true });

  let made = 0;
  let skipped = 0;

  for (const [slug, src] of Object.entries(SOURCES)) {
    if (args.length && !args.includes(slug)) continue;

    const imagePath = path.join(PUBLIC_DIR, src.replace(/^\//, ""));
    if (!existsSync(imagePath)) {
      console.warn(`! ${slug} — skipped (source not found at ${src})`);
      skipped++;
      continue;
    }

    const outPath = path.join(OUT_DIR, `${slug}.png`);
    const bg = await generateOg(imagePath, outPath);
    console.log(
      `✓ ${slug}.png — padded with rgb(${bg.r}, ${bg.g}, ${bg.b}) from ${src}`,
    );
    made++;
  }

  console.log(`\ngenerated ${made}, skipped ${skipped}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
