// Generate per-lab-item OG images (1200×630) from each lab item's frontmatter
// `image` — the hero clip's poster (walkthrough-poster.webp).
//
// Run: `node scripts/generate-lab-og.mjs` (all lab items)
//      `node scripts/generate-lab-og.mjs kickoff` (subset by slug)
// Output: `public/og/lab/<slug>.png` for each lab item with an `image:` field.
//
// WHY: lab items are video-forward, so the share card should show the actual
// clip — its poster frame. Posters are ~1.83:1 (1600×874); OG cards want
// 1.91:1 (1200×630). Rather than let a platform centre-crop the poster, we
// `fit: contain` to 1200×630 and pad with the poster's OWN sampled edge colour
// so the strip reads as an extension of the frame, not as added bars. Same
// technique as scripts/generate-case-og.mjs (case-study covers), just pointed
// at the lab content dir + a namespaced `og/lab/` output so lab slugs can't
// collide with case-study OGs at `og/<slug>.png`.
//
// Re-run when: a lab item's poster changes, a new lab item lands, or the OG
// aspect target changes. (Lab OG is the poster-based sibling of the essay text
// cards — essays have no visual, lab items do.)

import sharp from "sharp";
import matter from "gray-matter";
import { readFileSync, readdirSync, mkdirSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const LAB_DIR = path.join(root, "src", "content", "lab");
const PUBLIC_DIR = path.join(root, "public");
const OUT_DIR = path.join(PUBLIC_DIR, "og", "lab");

const OG_WIDTH = 1200;
const OG_HEIGHT = 630;
// Sampled area in the poster's top-left corner used to pick the pad colour.
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

  const files = readdirSync(LAB_DIR).filter((f) => f.endsWith(".mdx"));
  let made = 0;
  let skipped = 0;

  for (const file of files) {
    const slug = file.replace(/\.mdx$/, "");
    if (args.length && !args.includes(slug)) continue;

    const raw = readFileSync(path.join(LAB_DIR, file), "utf8");
    const { data } = matter(raw);
    if (!data.image) {
      console.log(`· ${slug} — skipped (no \`image:\` frontmatter / poster)`);
      skipped++;
      continue;
    }

    const imagePath = path.join(PUBLIC_DIR, String(data.image).replace(/^\//, ""));
    if (!existsSync(imagePath)) {
      console.warn(`! ${slug} — skipped (poster not found at ${data.image})`);
      skipped++;
      continue;
    }

    const outPath = path.join(OUT_DIR, `${slug}.png`);
    const bg = await generateOg(imagePath, outPath);
    console.log(
      `✓ lab/${slug}.png — padded with rgb(${bg.r}, ${bg.g}, ${bg.b}) from ${data.image}`,
    );
    made++;
  }

  console.log(`\ngenerated ${made}, skipped ${skipped}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
