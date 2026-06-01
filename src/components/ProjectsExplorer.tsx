"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import type { ContentMeta } from "@/lib/content";
import { useView } from "@/components/ViewContext";

// Columns in the card grid (mirrors the grid's `sm:grid-cols-2`); used to map a
// card's index to its [row, col] for the nav "matrix" coordinate readout.
const COLS = 2;

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
  const cardRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  // The open detail slug lives in ViewContext so the ViewSwitcher can hide while
  // a detail is open.
  const { setNode, detail, setDetail } = useView();

  // Drive the open detail from the URL hash (#slug): initial load + back/forward.
  useEffect(() => {
    const fromHash = () => {
      const slug = decodeURIComponent(window.location.hash.replace(/^#/, ""));
      setDetail(slug && projects.some((p) => p.slug === slug) ? slug : null);
    };
    fromHash();
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
          <article className="mx-auto mt-8 max-w-[44rem]">
            <header className="mb-8 border-b-4 border-accent pb-4">
              <h2 className="text-[clamp(1.5rem,3vw,2rem)] font-semibold tracking-tight text-balance">
                {p.title}
              </h2>
              {p.role && (
                <p className="mt-2 font-semibold text-text-muted">{p.role}</p>
              )}
            </header>
            <div className="case-body prose prose-stone max-w-none">{pane?.node}</div>
          </article>
        </div>
      );
    }
  }

  // --- Grid view: preview cards (+ a hidden, crawlable copy of every body). ---
  return (
    <>
    <ul className="project-grid grid gap-8 sm:grid-cols-2">
      {projects.map((p, i) => {
        const pane = panes.find((x) => x.slug === p.slug);
        return (
          <li key={p.slug}>
            <button
              type="button"
              ref={(el) => {
                const refs = cardRefs.current;
                if (el) refs.set(p.slug, el);
                else refs.delete(p.slug);
              }}
              onClick={() => openDetail(p.slug)}
              onMouseEnter={() =>
                setNode({ row: Math.floor(i / COLS) + 1, col: (i % COLS) + 1 })
              }
              onMouseLeave={() => setNode(null)}
              onFocus={() =>
                setNode({ row: Math.floor(i / COLS) + 1, col: (i % COLS) + 1 })
              }
              onBlur={() => setNode(null)}
              className="project-card group flex h-full w-full flex-col overflow-hidden rounded-lg bg-nav-fill text-left transition hover:outline-2 hover:outline-offset-2 hover:outline-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent motion-safe:hover:scale-[1.02]"
            >
              {/* Card cover from `image:` frontmatter; field-tracking placeholder if unset. */}
              {p.image ? (
                <div className="relative h-[200px] w-full overflow-hidden bg-image-placeholder">
                  <Image
                    src={p.image}
                    alt=""
                    fill
                    sizes="(min-width: 640px) 24rem, 100vw"
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="h-[200px] w-full bg-image-placeholder" aria-hidden />
              )}
              <div className="flex flex-1 flex-col p-4">
                <p className="font-semibold tracking-tight transition-colors group-hover:text-accent group-focus-visible:text-accent">
                  {p.title}
                </p>
                {p.role && (
                  <p className="mt-2 text-sm font-semibold text-text-muted">{p.role}</p>
                )}
                {pane?.excerpt && (
                  <p className="mt-2 line-clamp-2 text-text-muted">{pane.excerpt}</p>
                )}
                <span className="mt-auto inline-block pt-4 text-sm font-semibold text-text-muted transition-colors group-hover:text-accent group-focus-visible:text-accent">
                  Read more →
                </span>
              </div>
            </button>
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
            {p.role && <p>{p.role}</p>}
            {pane?.node}
          </article>
        );
      })}
    </div>
    </>
  );
}
