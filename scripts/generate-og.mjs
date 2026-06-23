// Generate the site's default OG image (1200x630) from the source logo.
//
// Run: `node scripts/generate-og.mjs`
// Output: `public/og.png` (committed; replaces previous if any).
//
// Composition: DARK coffee background (the site's dark-mode --background) →
// centered logo recoloured to accent → name beneath in a system sans. Mirrors
// the site's dark identity so the OG card reads as "of the site" in linkshares.
//
// Re-run on:
//   - accent change (same asymmetry as the favicon — see DESIGN.md / S11)
//   - title/tagline copy change
//   - logo update

import sharp from "sharp";
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const W = 1200;
const H = 630;

// Tokens — mirror globals.css DARK palette (OG cards use the dark theme).
// If these change, rerun.
const BG = "#181311"; // --background-dark (coffee field)
const ACCENT = "#FB370A"; // --accent
const FG = "#F4EAD8"; // --foreground-dark (warm cream)

// Lowercase on the OG image to match the site's brand voice (hero + wordmark
// are all lowercase). HTML <title> + og:title metadata stay title-cased — they
// surface in browser tabs / SERPs where title case reads more authoritatively.
const NAME = "chukwuka osakwe";

const LOGO_SRC = path.join(root, "public", "portfolio-logo.png");
const OUT = path.join(root, "public", "og.png");

(async () => {
  // 1) Recolour the logo: keep the alpha, swap RGB to accent.
  const logoMeta = await sharp(LOGO_SRC).metadata();
  const { width: lw = 384, height: lh = 320 } = logoMeta;

  const alpha = await sharp(LOGO_SRC).extractChannel("alpha").toBuffer();
  // Build a solid-accent RGB layer the same size, then join alpha back on.
  const rgb = await sharp({
    create: {
      width: lw,
      height: lh,
      channels: 3,
      background: ACCENT,
    },
  })
    .raw()
    .toBuffer();
  const recoloured = await sharp(rgb, {
    raw: { width: lw, height: lh, channels: 3 },
  })
    .joinChannel(alpha)
    .png()
    .toBuffer();

  // 2) Resize the recoloured logo. Slightly larger now that the tagline is
  // gone — gives the brand mark more presence in the canvas.
  const TARGET_LOGO_W = 320;
  const sizedLogo = await sharp(recoloured)
    .resize({ width: TARGET_LOGO_W })
    .toBuffer();
  const { width: sw = TARGET_LOGO_W, height: sh = Math.round(TARGET_LOGO_W * (lh / lw)) } =
    await sharp(sizedLogo).metadata();

  // 3) Vertically centre the logo + name pair in the canvas.
  const NAME_SIZE = 80;
  const GAP = 56; // logo-bottom → name-top
  const compositionH = sh + GAP + NAME_SIZE;
  const compositionTop = Math.round((H - compositionH) / 2);
  const logoY = compositionTop;
  // SVG <text> y is the baseline — sit it ~0.8 of font-size below the gap line
  // so the visible text feels vertically centred in its slot.
  const nameY = compositionTop + sh + GAP + Math.round(NAME_SIZE * 0.8);

  // System sans (-apple-system on macOS, sans-serif fallback elsewhere) — good
  // enough for a v1; can swap to embedded Nata Sans later for pixel-perfect.
  const svg = `
<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${W}" height="${H}" fill="${BG}"/>
  <text
    x="${W / 2}" y="${nameY}"
    font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    font-size="${NAME_SIZE}" font-weight="500" letter-spacing="-0.5"
    fill="${FG}" text-anchor="middle"
  >${NAME}</text>
</svg>`;

  const logoX = Math.round((W - sw) / 2);
  await sharp(Buffer.from(svg))
    .composite([{ input: sizedLogo, top: logoY, left: logoX }])
    .png({ compressionLevel: 9 })
    .toFile(OUT);

  const sz = (await sharp(OUT).metadata()).size;
  console.log(`og.png: ${W}x${H} · ${(sz / 1024) | 0}KB · → ${OUT}`);
})();
