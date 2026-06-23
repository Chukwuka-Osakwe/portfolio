// Generate per-essay OG images (1200×630) for the native essays section.
//
// Essays have NO cover image (unlike case studies), so this is a TEXT card:
// the site's DARK-mode coffee field + ONLY the essay title (left-aligned,
// word-wrapped, size auto-fit, vertically centred). No "essays" eyebrow, no
// name footer — just the heading. Mirrors generate-og.mjs's dark fill.
//
// Run: `node scripts/generate-essay-og.mjs`            (all essays)
//      `node scripts/generate-essay-og.mjs do-something` (subset by slug)
// Output: `public/og/essays/<slug>.png` — namespaced under og/essays/ so essay
// slugs can never collide with case-study OGs at `public/og/<slug>.png`.
//
// Re-run when: a new essay lands, a title changes, or the accent/bg changes.

import sharp from "sharp";
import matter from "gray-matter";
import { readFileSync, readdirSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const WRITING_DIR = path.join(root, "src", "content", "writing");
const OUT_DIR = path.join(root, "public", "og", "essays");

const W = 1200;
const H = 630;
const MARGIN = 90;

// Tokens — mirror globals.css DARK palette (OG cards use the dark theme).
// If these change, rerun.
const BG = "#181311"; // --background-dark (coffee field)
const ACCENT = "#FB370A"; // --accent — the title colour

const FONT =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif";

const escapeXml = (s) =>
  s.replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" }[c]),
  );

/** Greedy word-wrap to a pixel width, estimating glyph width from font size. */
function wrap(text, fontSize, maxWidth) {
  const charW = fontSize * 0.54; // empirical avg for the system sans at weight 600
  const words = text.split(/\s+/);
  const lines = [];
  let line = "";
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (candidate.length * charW > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  }
  if (line) lines.push(line);
  return lines;
}

/** Pick the largest size (from a descending ladder) that keeps the title ≤ 4 lines.
 *  Bigger ladder than before — the title is now the card's sole element, so it
 *  gets the whole canvas. */
function fitTitle(title, maxWidth) {
  for (const size of [76, 66, 58, 50]) {
    const lines = wrap(title, size, maxWidth);
    if (lines.length <= 4) return { size, lines };
  }
  const size = 50;
  return { size, lines: wrap(title, size, maxWidth).slice(0, 4) };
}

function buildSvg(title) {
  const maxWidth = W - MARGIN * 2;
  const { size, lines } = fitTitle(title, maxWidth);
  const lineH = Math.round(size * 1.16);

  // Title-only card: vertically centre the whole title block in the canvas.
  const blockH = lines.length * lineH;
  const firstBaseline = Math.round(H / 2 - blockH / 2 + size * 0.8);

  const titleTspans = lines
    .map(
      (ln, i) =>
        `<text x="${MARGIN}" y="${firstBaseline + i * lineH}" font-family="${FONT}" font-size="${size}" font-weight="600" letter-spacing="-1" fill="${ACCENT}">${escapeXml(ln)}</text>`,
    )
    .join("\n  ");

  return `
<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${W}" height="${H}" fill="${BG}"/>
  ${titleTspans}
</svg>`;
}

async function main() {
  const args = process.argv.slice(2);
  mkdirSync(OUT_DIR, { recursive: true });

  const files = readdirSync(WRITING_DIR).filter((f) => f.endsWith(".mdx"));
  let made = 0;

  for (const file of files) {
    const slug = file.replace(/\.mdx$/, "");
    if (args.length && !args.includes(slug)) continue;

    const { data } = matter(readFileSync(path.join(WRITING_DIR, file), "utf8"));
    if (data.draft) {
      console.log(`· ${slug} — skipped (draft)`);
      continue;
    }
    const title = String(data.title || slug);
    const outPath = path.join(OUT_DIR, `${slug}.png`);
    await sharp(Buffer.from(buildSvg(title)))
      .png({ compressionLevel: 9 })
      .toFile(outPath);
    console.log(`✓ og/essays/${slug}.png — "${title}"`);
    made++;
  }

  console.log(`\ngenerated ${made}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
