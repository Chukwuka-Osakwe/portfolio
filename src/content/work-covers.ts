/**
 * Cover LQIPs (Low-Quality Image Placeholders) for work case-study cards —
 * the sidecar to MDX frontmatter that the masters/derivatives pipeline writes.
 *
 * WHY THIS FILE EXISTS
 * Product ideas store their `blurDataURL` directly on the `Idea` record (see
 * src/content/ideas.ts) because they're typed data. Work entries are authored
 * as MDX with frontmatter, and the base64 LQIP string is generated, not
 * authored — so it lives here instead of in the .mdx YAML head, keeping
 * frontmatter human-editable. `lib/content.ts` merges these into ContentMeta
 * at read-time so consumers see one shape.
 *
 * KEYED BY IMAGE PATH (not slug) so that if a cover is renamed/versioned
 * (e.g. cover-v1.webp → cover-v2.webp per the S7 cache-trap workaround) the
 * LQIP travels with the asset, not the entry.
 *
 * REGENERATING (after a cover swap):
 *   node -e "const sharp=require('sharp');(async()=>{
 *     const buf=await sharp('public/work/<slug>/<file>.webp')
 *       .resize(16,null,{fit:'inside'}).webp({quality:60}).toBuffer();
 *     console.log('data:image/webp;base64,'+buf.toString('base64'));
 *   })();"
 * Then paste the data URL below at the matching path key.
 */
export const WORK_COVER_LQIPS: Record<string, string> = {
  "/work/footy/alt-cover.webp":
    "data:image/webp;base64,UklGRjwAAABXRUJQVlA4IDAAAACwAQCdASoQAAoAAoBCJZwAAudjjvdAAP776o/SxuhZwTlgaXKYJ9weDAkXSiXgAAA=",
  "/work/heyfood/heyfood-cover-v2.webp":
    "data:image/webp;base64,UklGRkwAAABXRUJQVlA4IEAAAAAQAgCdASoQAAoAAoBCJZQC7AEVz1hp/ywAAP73D9/TPkLTH0eb0x8Q/0tZ/n1pYP0tCA5eTJ0vgQ/BVn0/WgAA",
  "/work/bribe/cover-v1.webp":
    "data:image/webp;base64,UklGRlwAAABXRUJQVlA4IFAAAAAQAgCdASoQAAwAAoBCJZwAAuzVo7TJxtgAAP7UUouf2iDP9lZ/W5/YzxJ0J2m+PUPyzqhZ7Q8thyI1/E7JU9JpKY2wrMhYW3W30rLe14AAAA==",
  "/work/energy/energy-cover.webp":
    "data:image/webp;base64,UklGRnAAAABXRUJQVlA4IGQAAAAQAgCdASoQAAoAAoBCJQBOgCPaRaKPw7ZAAP7OB6O8nKBu1zgGuSpKHavtqMw9fMa1bF5Gei8gLmHc/xti3u2mY4OpFpG6LxNRo/MbW4WE8u+lUVu47xFdxiK5bdeTXWeAwAAA",
  "/work/yara/yara-cover.webp":
    "data:image/webp;base64,UklGRnoAAABXRUJQVlA4IG4AAABQAgCdASoQAAoAAoBCJZACdAfwBrhjKiXsXAAA/upe+yAc17+Z9PIgclOFl5JE0LzQ+eV8H+hI7fr+DLLJixd2fptotH9UoxwNQAbi90+8AA+hJGByqpW29V0I11FheCPDuJZFF/OLYpfE/kAAAA==",
};
