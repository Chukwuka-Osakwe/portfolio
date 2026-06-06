"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import Image from "next/image";
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
}

/**
 * Projects as a grid of preview cards. Clicking a card opens its full case study
 * IN PLACE: the cards grid is swapped for the detail view within the same
 * viewspace column, so the nav panel stays put. A "back to work" control and Esc
 * return to the grid (restoring focus to the card you came from).
 *
 * The open project lives in ViewContext (`detail`) so the bottom ViewSwitcher
 * can hide while a detail is showing, and is mirrored to the URL hash (#slug)
 * for shareable, back/forward-able deep-links. The grid→detail enter motion is
 * the `.view-enter` CSS (reduced-motion-safe).
 */
export function ProjectsExplorer({ projects, panes }: Props) {
  const cardRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  // The open detail slug lives in ViewContext so the ViewSwitcher can hide while
  // a detail is open.
  const { detail, setDetail } = useView();

  // Drive the open detail from the URL hash (#slug). The INITIAL read uses
  // useLayoutEffect so the detail commits BEFORE the browser paints — paired
  // with the pre-paint `data-detail-pending` mask (see layout.tsx + globals.css),
  // this eliminates the /#slug-reload grid flicker: setState in useLayoutEffect
  // forces a synchronous re-render, after which we delete the mask attribute,
  // and only then does the browser paint (showing the detail, not the grid).
  // Subsequent hash changes (popstate / hashchange) run async via useEffect
  // — the mask is already gone by then.
  useLayoutEffect(() => {
    const slug = decodeURIComponent(window.location.hash.replace(/^#/, ""));
    setDetail(slug && projects.some((p) => p.slug === slug) ? slug : null);
    delete document.documentElement.dataset.detailPending;
  }, [projects, setDetail]);

  useEffect(() => {
    const fromHash = () => {
      const slug = decodeURIComponent(window.location.hash.replace(/^#/, ""));
      setDetail(slug && projects.some((p) => p.slug === slug) ? slug : null);
    };
    window.addEventListener("popstate", fromHash);
    window.addEventListener("hashchange", fromHash);
    return () => {
      window.removeEventListener("popstate", fromHash);
      window.removeEventListener("hashchange", fromHash);
      // Leaving the projects route: clear any open detail so it can't keep the
      // ViewSwitcher hidden on another view (the flag lives in the shared shell).
      setDetail(null);
    };
  }, [projects, setDetail]);

  const openDetail = (slug: string) => {
    setDetail(slug);
    history.pushState(null, "", `#${slug}`);
    window.scrollTo({ top: 0 });
  };

  const closeDetail = () => {
    const slug = detail;
    setDetail(null);
    if (window.location.hash) {
      history.replaceState(
        null,
        "",
        window.location.pathname + window.location.search,
      );
    }
    window.scrollTo({ top: 0 });
    // Restore focus to the card we came from once the grid remounts.
    requestAnimationFrame(() => {
      if (slug) cardRefs.current.get(slug)?.focus();
    });
  };

  // Esc returns from the detail to the grid.
  useEffect(() => {
    if (!detail) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeDetail();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [detail]);

  // --- Detail view: the cards column becomes the full case study. ---
  if (detail) {
    const p = projects.find((x) => x.slug === detail);
    const pane = panes.find((x) => x.slug === detail);
    if (p) {
      return (
        <div className="view-enter">
          <button
            type="button"
            onClick={closeDetail}
            className="group inline-flex items-center gap-2 text-sm font-semibold text-text-muted transition-colors hover:text-accent focus-visible:text-accent focus-visible:outline-none"
          >
            <span aria-hidden className="transition-transform group-hover:-translate-x-0.5">
              ←
            </span>
            back to work
          </button>
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

  // --- Grid view: preview cards (+ a hidden, crawlable copy of every body). ---
  return (
    <>
    <ul className="project-grid grid gap-8 sm:grid-cols-2 sm:gap-16">
      {projects.map((p) => {
        const pane = panes.find((x) => x.slug === p.slug);
        return (
          <li key={p.slug}>
            {/* Card is a div+role=button rather than a native <button> so it
                can legally contain block-level children like <h2> and <p>
                (button only permits phrasing content per the HTML spec).
                Click + keyboard handlers replicate native button behavior. */}
            <div
              role="button"
              tabIndex={0}
              ref={(el) => {
                const refs = cardRefs.current;
                if (el) refs.set(p.slug, el);
                else refs.delete(p.slug);
              }}
              onClick={() => openDetail(p.slug)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  openDetail(p.slug);
                }
              }}
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
            </div>
          </li>
        );
      })}
    </ul>

    {/* Crawlable copy: every case-study body in the static HTML, hidden. The
        interactive view shows one at a time (hash-opened, client-side); this
        keeps all bodies present in the SSR output for search/indexing the way
        the old per-project modals did. Only rendered on the grid (detail is
        null here) so heading IDs don't duplicate when a detail is open. */}
    <div hidden>
      {projects.map((p) => {
        const pane = panes.find((x) => x.slug === p.slug);
        return (
          <article key={p.slug}>
            <h2>{p.title}</h2>
            {p.type && <p>{p.type}</p>}
            {pane?.node}
          </article>
        );
      })}
    </div>
    </>
  );
}
