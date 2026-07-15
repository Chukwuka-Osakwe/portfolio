import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getAllMeta, getEntry } from "@/lib/content";
import { LabDetail } from "@/components/LabDetail";

interface PageProps {
  // Next 15+: route params arrive as a Promise that must be awaited.
  params: Promise<{ slug: string }>;
}

/** Prebuild a page per lab item at build time → fully static, indexable. */
export function generateStaticParams() {
  return getAllMeta("lab").map((p) => ({ slug: p.slug }));
}

/**
 * Per-item metadata. No generated OG card yet (falls back to the site default
 * from the root layout) — a lab-specific OG script can come later, same
 * pattern as scripts/generate-essay-og.mjs.
 */
export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const meta = getAllMeta("lab").find((p) => p.slug === slug);
  if (!meta) return {};
  const url = `/lab/${slug}`;
  return {
    title: meta.title,
    description: meta.summary,
    openGraph: {
      type: "article",
      title: meta.title,
      description: meta.summary,
      url,
    },
    twitter: {
      card: "summary_large_image",
      title: meta.title,
      description: meta.summary,
    },
    alternates: { canonical: url },
  };
}

export default async function LabItemPage({ params }: PageProps) {
  const { slug } = await params;
  const exists = getAllMeta("lab").some((p) => p.slug === slug);
  if (!exists) notFound();
  const { meta, body } = getEntry("lab", slug);
  return <LabDetail meta={meta} body={body} />;
}
