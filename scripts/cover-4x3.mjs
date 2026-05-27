// Convert a cover image to a 4:3 frame WITHOUT cropping or distorting the
// content: the full image is centered (fit:inside) over a blurred, frame-
// filling copy of itself. Lets a square/wide cover sit in the carousel's fixed
// 4:3 well with nothing trimmed or stretched — the surround is a soft backdrop,
// not empty letterbox bars.
//
// Usage: node scripts/cover-4x3.mjs <input> <output>
//   e.g. node scripts/cover-4x3.mjs sources/ideas/foo.webp public/ideas/foo.webp
import sharp from "sharp";
import path from "node:path";

const W = 2000;
const H = 1500; // 4:3
const BLUR = 24; // backdrop softness

const [, , inFile, outFile] = process.argv;
if (!inFile || !outFile) {
  console.error("usage: node scripts/cover-4x3.mjs <input> <output>");
  process.exit(1);
}

const meta = await sharp(inFile).metadata();

// Backdrop: the image scaled to fill the 4:3 frame (cover), then blurred.
const bg = await sharp(inFile)
  .resize(W, H, { fit: "cover", position: "centre" })
  .blur(BLUR)
  .toBuffer();

// Foreground: the full image fit inside the frame (no crop, no distortion).
const fg = await sharp(inFile)
  .resize(W, H, { fit: "inside" })
  .toBuffer();

await sharp(bg)
  .composite([{ input: fg, gravity: "centre" }])
  .webp({ quality: 80 })
  .toFile(outFile);

console.log(
  `${path.basename(inFile)} (${meta.width}x${meta.height}) → ${path.basename(outFile)} ${W}x${H}`,
);
