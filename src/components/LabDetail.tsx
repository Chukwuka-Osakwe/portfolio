import Link from "next/link";
import type { ContentMeta } from "@/lib/content";
import { Mdx } from "@/components/Mdx";
import { LabHeroVideo } from "@/components/LabHeroVideo";

/**
 * Lab item detail — the cinematic/editorial template (layout cue: madhurima.me
 * case studies). Deliberately NOT the case-study shell (`.case-body` + TOC +
 * CaseImageViewer): a lab page is a trailer, not a case study.
 *
 * Structure, top → bottom:
 *   • two-line header   — L1 the title, L2 the one-line explanation
 *                         (frontmatter `blurb`), closed by an accent rule
 *                         (border-b-4 border-accent) as case studies + essays do
 *   • hero clip         — full viewspace width
 *   • TL;DR callout     — Substack-style blockquote (accent left stroke),
 *                         holds the longer `summary`
 *   • Overview          — the MDX body (authored to lead with `## Overview`)
 *   • link chips        — outbound to the item's real home (site / repo)
 *   • status pill       — "status: <stage>" (frontmatter `stage`), the closer
 *
 * Left-aligned editorial column: text blocks cap at --reading-measure; the
 * hero spans the full --content-w so it reads wider than the prose.
 */
export function LabDetail({ meta, body }: { meta: ContentMeta; body: string }) {
  return (
    <div className="view-enter">
      <Link
        href="/"
        className="group inline-flex items-center gap-2 text-sm font-semibold text-text-muted transition-colors hover:text-accent focus-visible:text-accent focus-visible:outline-none"
      >
        <span
          aria-hidden
          className="transition-transform group-hover:-translate-x-0.5"
        >
          ←
        </span>
        the lab
      </Link>

      {/* Header → accent rule → content, mirroring the case-study + essay
          detail headers (border-b-4 border-accent). */}
      <header className="mx-auto mt-8 max-w-[var(--reading-measure)] border-b-4 border-accent pb-4">
        <h1 className="text-[clamp(1.5rem,3vw,2rem)] font-semibold tracking-tight text-balance">
          {meta.title}
        </h1>
        {meta.blurb && (
          <p className="mt-2 text-lg text-text-muted text-balance">
            {meta.blurb}
          </p>
        )}
      </header>

      {meta.video && (
        <div className="lab-hero mt-8">
          <LabHeroVideo src={meta.video} poster={meta.image} title={meta.title} />
        </div>
      )}

      {/* TL;DR — Substack-style blockquote with an accent left stroke. */}
      {meta.summary && (
        <div className="mx-auto mt-8 max-w-[var(--reading-measure)] border-l-4 border-accent py-1 pl-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-accent">
            TL;DR
          </p>
          <p className="mt-1 text-base leading-relaxed text-foreground">
            {meta.summary}
          </p>
        </div>
      )}

      <div className="case-body prose mx-auto mt-8 max-w-[var(--reading-measure)]">
        <Mdx source={body} />
      </div>

      {meta.links && meta.links.length > 0 && (
        <div className="mx-auto mt-8 flex max-w-[var(--reading-measure)] flex-wrap justify-center gap-4">
          {meta.links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              target="_blank"
              rel="noopener noreferrer"
              className="focus-ring group inline-flex items-center gap-2 rounded-lg border border-border bg-nav-fill px-4 py-2 text-sm font-medium transition hover:bg-foreground/5 hover:text-accent"
            >
              <span>{l.label}</span>
              <span
                aria-hidden
                className="text-text-muted transition-colors group-hover:text-accent"
              >
                ↗
              </span>
            </a>
          ))}
        </div>
      )}

      {/* Status pill — the closing note, below the outbound link chips. */}
      {meta.stage && (
        <div className="mt-8 text-center">
          <span className="inline-flex items-center rounded-full bg-accent-100 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-accent">
            status: {meta.stage}
          </span>
        </div>
      )}
    </div>
  );
}
