import fs from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllMeta, getEntry } from "@/lib/content";
import { formatDate } from "@/lib/date";
import { Mdx } from "@/components/Mdx";

const OG_W = 1200;
const OG_H = 630;

interface PageProps {
  // Next 15+: route params arrive as a Promise that must be awaited.
  params: Promise<{ slug: string }>;
}

/** Prebuild a page per essay at build time → fully static, indexable. */
export function generateStaticParams() {
  return getAllMeta("writing").map((e) => ({ slug: e.slug }));
}

/**
 * Per-essay metadata. Essays have no cover, so the OG card is a generated TEXT
 * card at `/og/essays/<slug>.png` (run `node scripts/generate-essay-og.mjs`).
 * Existence-checked like the case-study OGs — a freshly-added essay without a
 * regen run falls back to the site default rather than linking a broken card.
 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const meta = getAllMeta("writing").find((e) => e.slug === slug);
  if (!meta) return {};

  const url = `/essays/${slug}`;
  const ogPath = `/og/essays/${slug}.png`;
  const ogExists = fs.existsSync(
    path.join(process.cwd(), "public", "og", "essays", `${slug}.png`),
  );
  const images = ogExists
    ? [{ url: ogPath, width: OG_W, height: OG_H, alt: meta.title }]
    : undefined;

  return {
    title: meta.title,
    description: meta.summary,
    openGraph: {
      type: "article",
      title: meta.title,
      description: meta.summary,
      url,
      publishedTime: meta.date,
      images,
    },
    twitter: {
      card: "summary_large_image",
      title: meta.title,
      description: meta.summary,
      images: ogExists ? [ogPath] : undefined,
    },
    alternates: { canonical: url },
  };
}

/** Essay reading page — a dedicated route per essay (own URL, sitemap entry,
 *  no JS required). Lighter than a case study: title + date header, then the
 *  prose. Reuses `.case-body` so essay typography matches case-study bodies. */
export default async function EssayPage({ params }: PageProps) {
  const { slug } = await params;
  const meta = getAllMeta("writing").find((e) => e.slug === slug);
  if (!meta) notFound();
  const { body } = getEntry("writing", slug);

  return (
    <div className="view-enter">
      <Link
        href="/essays"
        className="group inline-flex items-center gap-2 text-sm font-semibold text-text-muted transition-colors hover:text-accent focus-visible:text-accent focus-visible:outline-none"
      >
        <span aria-hidden className="transition-transform group-hover:-translate-x-0.5">
          ←
        </span>
        back to essays
      </Link>
      <article className="mx-auto mt-8 max-w-[var(--reading-measure)]">
        <header className="mb-8 border-b-2 border-accent pb-4">
          <h1 className="text-[clamp(1.5rem,3vw,2rem)] font-semibold tracking-tight text-balance">
            {meta.title}
          </h1>
          <time
            dateTime={meta.date}
            className="mt-2 inline-block text-xs font-semibold tracking-wider text-text-muted"
          >
            {formatDate(meta.date)}
          </time>
        </header>
        <div className="case-body prose max-w-none">
          <Mdx source={body} />
        </div>
      </article>
    </div>
  );
}
