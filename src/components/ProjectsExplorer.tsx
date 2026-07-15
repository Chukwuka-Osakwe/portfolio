"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ContentMeta } from "@/lib/content";
import { useView } from "@/components/ViewContext";
import CaseImageViewer from "@/components/CaseImageViewer";

interface Pane {
  slug: string;
  excerpt: string;
  node: React.ReactNode;
}

interface Props {
  projects: ContentMeta[];
  panes: Pane[];
  /** When set, render the detail view for this slug; otherwise show the grid.
   *  Provided by the `/design/[slug]` route's page; the `/design` index
   *  doesn't pass it (grid). */
  initialSlug?: string;
}

/**
 * Projects as a grid of preview cards. Clicking a card navigates to
 * `/design/<slug>`, a real route whose page server-renders the case-study
 * detail in this same viewspace (the shared site layout keeps the nav panel
 * mounted across the navigation, so it reads as in-place even though the
 * URL changes).
 *
 * Why a real route, not a hash:
 *   - Per-case-study OG previews when shared (crawlers can't see fragments).
 *   - Each case study indexable with its own title / description / canonical.
 *   - Native browser back / forward / middle-click / cmd-click — anchors
 *     handle them, no manual history hacks.
 *   - The hidden SSR static block that backfilled crawlability under the old
 *     hash model is no longer needed (deleted).
 *
 * `initialSlug` drives which view renders — the slug route hands it in, the
 * home route doesn't. ViewContext.detail mirrors it so the bottom
 * ViewSwitcher can hide while a detail is showing.
 */
export function ProjectsExplorer({ projects, panes, initialSlug }: Props) {
  const router = useRouter();
  const { setDetail } = useView();

  // Sync detail flag with ViewContext for the ViewSwitcher hide rule. Clear
  // on unmount so other views don't inherit it.
  useEffect(() => {
    setDetail(initialSlug ?? null);
    return () => setDetail(null);
  }, [initialSlug, setDetail]);

  // Esc on a detail page returns to the grid. Native browser back works too,
  // since this is a real route — this is just the keyboard shortcut.
  useEffect(() => {
    if (!initialSlug) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") router.push("/design");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [initialSlug, router]);

  // --- Detail view: rendered when the route passes a slug. ---
  if (initialSlug) {
    const p = projects.find((x) => x.slug === initialSlug);
    const pane = panes.find((x) => x.slug === initialSlug);
    if (p) {
      return (
        <div className="view-enter">
          <Link
            href="/design"
            className="group inline-flex items-center gap-2 text-sm font-semibold text-text-muted transition-colors hover:text-accent focus-visible:text-accent focus-visible:outline-none"
          >
            <span aria-hidden className="transition-transform group-hover:-translate-x-0.5">
              ←
            </span>
            case studies
          </Link>
          <article className="mx-auto mt-8 max-w-[var(--reading-measure)]">
            <header className="mb-8 border-b-4 border-accent pb-4">
              <h1 className="text-[clamp(1.5rem,3vw,2rem)] font-semibold tracking-tight text-balance">
                {p.title}
              </h1>
              {/* Metadata row below H1 — type label here today, room for action
                  pills (e.g. "view live →") alongside it later. Plain text now
                  so future chip-shaped CTAs visually distinguish themselves. */}
              {p.type && (
                <span className="mt-2 inline-block text-xs font-semibold tracking-wider text-text-muted">
                  {p.type}
                </span>
              )}
            </header>
            <CaseImageViewer>
              <div className="case-body prose max-w-none">{pane?.node}</div>
            </CaseImageViewer>
          </article>
        </div>
      );
    }
  }

  // --- Grid view: preview cards link to /design/<slug>. ---
  // Each card is a <Link> (not <div role="button">) — semantically a navigation
  // to a real URL, gets native Enter / middle-click / cmd-click for free, no
  // manual keyboard handling needed. Anchors are valid containers for block
  // children (h2 + p) per HTML5.
  return (
    <ul className="grid gap-8 sm:grid-cols-2 sm:gap-16">
      {projects.map((p) => {
        const pane = panes.find((x) => x.slug === p.slug);
        return (
          <li key={p.slug}>
            <Link
              href={`/design/${p.slug}`}
              className="project-card focus-ring group flex h-full w-full flex-col overflow-hidden rounded-lg bg-nav-fill text-left transition hover:outline-2 hover:outline-offset-2 hover:outline-accent motion-safe:hover:scale-[1.02]"
            >
              {/* Card cover from `image:` frontmatter; field-tracking placeholder if unset.
                  `blurDataURL` is the sidecar LQIP from work-covers.ts — when present,
                  next/image renders a soft blurred preview before the full WebP loads. */}
              {p.image ? (
                <div className="relative aspect-[31/20] w-full overflow-hidden bg-image-placeholder">
                  <Image
                    src={p.image}
                    alt=""
                    fill
                    sizes="(min-width: 640px) 24rem, 100vw"
                    className="object-cover"
                    {...(p.blurDataURL && {
                      placeholder: "blur" as const,
                      blurDataURL: p.blurDataURL,
                    })}
                  />
                </div>
              ) : (
                <div className="aspect-[31/20] w-full bg-image-placeholder" aria-hidden />
              )}
              <div className="flex flex-1 flex-col p-4">
                {/* Type label is now an eyebrow ABOVE the title — editorial
                    card pattern. No chip background (the card itself is the
                    button-shaped element; a second one was double-buttoning).
                    Color committed to accent so it actually reads as a category
                    signal. */}
                {p.type && (
                  <span className="text-xs font-semibold tracking-wider text-text-muted">
                    {p.type}
                  </span>
                )}
                <h2 className="mt-2 text-xl font-semibold tracking-tight text-balance transition-colors group-hover:text-accent group-focus-visible:text-accent">
                  {p.title}
                </h2>
                {pane?.excerpt && (
                  <p className="mt-2 line-clamp-3 text-text-muted">{pane.excerpt}</p>
                )}
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
