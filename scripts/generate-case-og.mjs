// Generate per-case-study OG images (1200×630) from each case study's
// frontmatter `image` cover.
//
// Run: `node scripts/generate-case-og.mjs` (all case studies)
//      `node scripts/generate-case-og.mjs footy heyfood` (subset by slug)
// Output: `public/og/<slug>.png` for each case study with an `image:` field.
//
// WHY: covers are exported at the 1.55:1 brand-board frame (2000×1293), but
// OG cards prefer 1.91:1 (1200×630). Sharing platforms (X / LinkedIn / Slack
// etc.) center-crop or letterbox what they receive — Heyfood's cover in
// particular would lose its top/bottom edges to a centre-crop. This script
// solves that by `fit: contain` to 1200×630 with the cover's OWN edge colour
// sampled as the pad — so the padded strip reads as an extension of the
// cover's canvas, not as added bars. Works regardless of whether the cover's
// field is light (Heyfood) or dark (Footy, Bribe).
//
// Re-run when:
//   - a case study's cover changes
//   - a new case study lands
//   - aspect target changes (e.g. some platform wants 2:1 in the future)

import sharp from "sharp";
import matter from "gray-matter";
import { readFileSync, readdirSync, mkdirSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const WORK_DIR = path.join(root, "src", "content", "work");
const PUBLIC_DIR = path.join(root, "public");
const OUT_DIR = path.join(PUBLIC_DIR, "og");

const OG_WIDTH = 1200;
const OG_HEIGHT = 630;
// Sampled area in the cover's top-left corner used to pick the pad colour.
// Averaging 24×24 pixels rather than reading a single pixel is robust against
// thin borders / single-pixel markers on the brand-board edge.
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

async function generateOg(slug, imagePath, outPath) {
  const bg = await sampleCornerColor(imagePath);
  await sharp(imagePath)
    .resize(OG_WIDTH, OG_HEIGHT, {
      fit: "contain",
      // alpha 1 — opaque pad; format-encode below is PNG with no alpha needed.
      background: { r: bg.r, g: bg.g, b: bg.b, alpha: 1 },
      // High-quality downscale; OG card is small + viewed in social previews,
      // sharpness matters more than file size at 1200×630.
      kernel: "lanczos3",
    })
    .png({ compressionLevel: 9 })
    .toFile(outPath);
  return bg;
}

async function main() {
  const args = process.argv.slice(2);
  mkdirSync(OUT_DIR, { recursive: true });

  const files = readdirSync(WORK_DIR).filter((f) => f.endsWith(".mdx"));
  let made = 0;
  let skipped = 0;

  for (const file of files) {
    const slug = file.replace(/\.mdx$/, "");
    if (args.length && !args.includes(slug)) continue;

    const raw = readFileSync(path.join(WORK_DIR, file), "utf8");
    const { data } = matter(raw);
    if (!data.image) {
      console.log(`· ${slug} — skipped (no \`image:\` frontmatter)`);
      skipped++;
      continue;
    }

    const imagePath = path.join(PUBLIC_DIR, String(data.image).replace(/^\//, ""));
    if (!existsSync(imagePath)) {
      console.warn(`! ${slug} — skipped (cover not found at ${data.image})`);
      skipped++;
      continue;
    }

    const outPath = path.join(OUT_DIR, `${slug}.png`);
    const bg = await generateOg(slug, imagePath, outPath);
    console.log(
      `✓ ${slug}.png — padded with rgb(${bg.r}, ${bg.g}, ${bg.b}) from ${data.image}`,
    );
    made++;
  }

  console.log(`\ngenerated ${made}, skipped ${skipped}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
