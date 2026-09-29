import type { Metadata } from "next";
import { getAllMeta } from "@/lib/content";
import { DesignGrid, type GridEntry } from "@/components/DesignGrid";
import { HashRedirect } from "@/components/HashRedirect";

// Title/description/OG inherit the brand-level defaults from the root layout
// (this is the bare-domain homepage, so it carries the site's own billing, not
// a section title). Canonical pinned to "/".
export const metadata: Metadata = { alternates: { canonical: "/" } };

/** Home — the merged design grid: client work + lab intermixed into one
 *  date-desc stream (the S31 thesis — the paid/self-directed split is authorship
 *  trivia the visitor doesn't need). Each card links to its real detail route
 *  (/design/<slug> for work, /lab/<slug> for lab), which server-renders the
 *  detail in this same shell.
 *
 *  Old `/#slug` hash deep-links still get a one-shot client redirect to
 *  `/design/<slug>` via <HashRedirect> — a migration safety net. `/lab` and the
 *  old `/design` index 308-redirect here (see next.config). */
export default function Home() {
  // Content-backed entries (work + lab MDX), each paired with its date for the
  // merge sort below.
  const content = [...getAllMeta("work"), ...getAllMeta("lab")].map((m) => ({
    date: m.date,
    entry: {
      slug: m.slug,
      href: m.section === "lab" ? `/lab/${m.slug}` : `/design/${m.slug}`,
      title: m.title,
      blurb: m.blurb ?? null,
      image: m.image ?? null,
      video: m.video ?? null,
      ratio: m.ratio ?? null,
      blurDataURL: m.blurDataURL,
    } satisfies GridEntry,
  }));

  // Gallery / brand entries — NOT MDX case studies (no article body); a
  // self-initiated brand exploration. ChipMango declares its own cover shape
  // (1600×1000 ≈ 8:5, uncropped) and links to its gallery/lookbook view at
  // /design/chipmango (a real (site) route → smooth in-shell transition).
  // TODO: when a second gallery lands, formalise as a "brand" content section +
  // a `layout: gallery` frontmatter switch on /design/[slug].
  const gallery = [
    {
      date: "2026-09-25",
      entry: {
        slug: "chipmango",
        href: "/design/chipmango",
        title: "ChipMango",
        blurb: "A brand identity system for ChipMango.",
        image: "/design/chipmango/wordmark.webp",
        video: null,
        ratio: "8 / 5", // house cover ratio — wordmark-on-mosaic motif cropped to 8:5 (covers live at 8:5 or 16:9 only)
        blurDataURL: undefined,
      } satisfies GridEntry,
    },
  ];

  // Curated grid order — a hand-picked lead (fills the first three rows: two per
  // row), then everything unlisted falls in behind, date-desc. Slugs not in ORDER
  // sort to the back by recency.
  const ORDER = ["kickoff", "aronia", "chipmango", "energy", "footy", "yara"];
  const rank = (slug: string) => {
    const i = ORDER.indexOf(slug);
    return i === -1 ? Infinity : i;
  };
  const entries: GridEntry[] = [...content, ...gallery]
    .sort((a, b) => {
      const ra = rank(a.entry.slug);
      const rb = rank(b.entry.slug);
      if (ra !== rb) return ra - rb; // pinned lead, in ORDER; unlisted (Infinity) trail
      return +new Date(b.date) - +new Date(a.date); // ties (both unlisted) → date-desc
    })
    .map((x) => x.entry);

  return (
    <>
      <HashRedirect />
      <DesignGrid entries={entries} />
    </>
  );
}
