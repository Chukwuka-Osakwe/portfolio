"use client";

import { useEffect, useRef, useState } from "react";
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

interface Box {
  left: number;
  top: number;
  width: number;
  height: number;
}

const OPEN_MS = 360;
const CLOSE_MS = 300;
// Smooth ease-in-out both ways: gentle ramp up, slow settle at both ends.
const OPEN_EASE = "cubic-bezier(0.65, 0, 0.35, 1)";
const CLOSE_EASE = "cubic-bezier(0.65, 0, 0.35, 1)";
// Open panel: a centered column wider than the cards column, full viewport
// height. Text inside is capped to a reading measure (.case-body) while media
// breaks out to this width.
const MODAL_MAX_W = 1040; // px — max panel width
const MODAL_MARGIN = 24; // px — min gap to the viewport edges on smaller screens

const boxKeyframe = (b: Box) => ({
  left: `${b.left}px`,
  top: `${b.top}px`,
  width: `${b.width}px`,
  height: `${b.height}px`,
});

/**
 * Projects as a grid of preview cards. Each card shows an image, title, role,
 * and an excerpt; clicking opens the full case study in a modal.
 *
 * There is one native <dialog> per project (all rendered, closed by default),
 * so every case study body is present in the static HTML — crawlable and
 * find-in-page-able — while still reading in a modal. `showModal()` gives the
 * browser's focus trap, Esc, inert background, and focus restoration. The open
 * project is mirrored to the URL hash (#slug) for shareable deep-links.
 *
 * Open/close motion (a "container transform"): the clicked card's frame grows
 * by animating its actual size/position into a panel that fills the cards
 * column (measured live from the grid <ul>), with vertical breathing room. As
 * it grows, the rest of the card grid fades out — so the panel looks like it's
 * erasing the other cards — and they fade back in as it shrinks into the card.
 * The ::backdrop fades to dim the nav. All motion is skipped under
 * prefers-reduced-motion.
 */
export function ProjectsExplorer({ projects, panes }: Props) {
  const [openSlug, setOpenSlug] = useState<string | null>(null);
  const dialogRefs = useRef<Map<string, HTMLDialogElement>>(new Map());
  const cardRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const gridRef = useRef<HTMLUListElement>(null);
  const gridAnim = useRef<Animation | null>(null);
  const prevOpen = useRef<string | null>(null);
  const reduceMotion = useRef(false);
  const { setNode } = useView();

  useEffect(() => {
    reduceMotion.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
  }, []);

  // Open from the URL hash (initial load + back/forward).
  useEffect(() => {
    const fromHash = () => {
      const slug = decodeURIComponent(window.location.hash.replace(/^#/, ""));
      setOpenSlug(slug && projects.some((p) => p.slug === slug) ? slug : null);
    };
    fromHash();
    window.addEventListener("popstate", fromHash);
    window.addEventListener("hashchange", fromHash);
    return () => {
      window.removeEventListener("popstate", fromHash);
      window.removeEventListener("hashchange", fromHash);
    };
  }, [projects]);

  // The open panel's box, full viewport height. On desktop it fills everything
  // to the LEFT of the nav panel (so the nav stays uncovered); below lg (nav
  // stacks on top) it falls back to a centered, max-width column.
  const targetBox = (): Box => {
    const vw = window.innerWidth;
    const nav =
      window.matchMedia("(min-width: 1024px)").matches &&
      document.querySelector<HTMLElement>("[data-nav-panel]");
    if (nav) {
      // Shift right 32px: leaves a gap against the left viewport edge and pushes
      // the panel's right edge to overlap the nav slightly. Width is unchanged.
      return {
        left: 32,
        top: 0,
        width: Math.round(nav.getBoundingClientRect().left),
        height: window.innerHeight,
      };
    }
    const width = Math.min(MODAL_MAX_W, vw - MODAL_MARGIN * 2);
    return {
      left: Math.round((vw - width) / 2),
      top: 0,
      width,
      height: window.innerHeight,
    };
  };

  const setBox = (dialog: HTMLDialogElement, b: Box) => {
    Object.assign(dialog.style, {
      position: "fixed",
      left: `${b.left}px`,
      top: `${b.top}px`,
      width: `${b.width}px`,
      height: `${b.height}px`,
      maxWidth: "none",
      maxHeight: "none",
      margin: "0",
    });
  };

  // Fade the whole card grid (open: 1→0 "erase"; close: 0→1 "return").
  const fadeGrid = (to: 0 | 1, duration: number, easing: string) => {
    const grid = gridRef.current;
    if (!grid) return;
    gridAnim.current?.cancel();
    const from = to === 0 ? 1 : 0;
    grid.style.opacity = String(from);
    gridAnim.current = grid.animate(
      [{ opacity: from }, { opacity: to }],
      { duration, easing, fill: "forwards" },
    );
  };

  // Drive the matching native <dialog> from state, with the container transform.
  useEffect(() => {
    const prev = prevOpen.current;
    prevOpen.current = openSlug;
    if (prev === openSlug) return;

    // --- Close the previously-open dialog ---
    if (prev) {
      const dialog = dialogRefs.current.get(prev);
      if (dialog?.open) {
        const card = cardRefs.current.get(prev);
        if (reduceMotion.current || !card) {
          dialog.close();
        } else {
          const from: Box = dialog.getBoundingClientRect();
          const to: Box = card.getBoundingClientRect();
          const boxAnim = dialog.animate(
            [boxKeyframe(from), boxKeyframe(to)],
            { duration: CLOSE_MS, easing: CLOSE_EASE, fill: "forwards" },
          );
          const backdropAnim = dialog.animate(
            [{ opacity: 1 }, { opacity: 0 }],
            {
              duration: CLOSE_MS,
              easing: "ease",
              pseudoElement: "::backdrop",
              fill: "forwards",
            },
          );
          fadeGrid(1, CLOSE_MS, CLOSE_EASE); // cards return
          boxAnim.onfinish = () => {
            dialog.close();
            boxAnim.cancel();
            backdropAnim.cancel();
            gridAnim.current?.cancel();
            const grid = gridRef.current;
            if (grid) grid.style.opacity = "";
          };
        }
      }
    }

    // --- Open the newly-selected dialog ---
    if (openSlug) {
      const dialog = dialogRefs.current.get(openSlug);
      const to = targetBox();
      if (dialog && !dialog.open && to) {
        const card = cardRefs.current.get(openSlug);
        if (reduceMotion.current || !card) {
          setBox(dialog, to);
          dialog.showModal();
        } else {
          const from: Box = card.getBoundingClientRect();
          setBox(dialog, from); // start collapsed onto the card (no flash)
          dialog.showModal();
          const boxAnim = dialog.animate(
            [boxKeyframe(from), boxKeyframe(to)],
            { duration: OPEN_MS, easing: OPEN_EASE, fill: "forwards" },
          );
          const backdropAnim = dialog.animate(
            [{ opacity: 0 }, { opacity: 1 }],
            { duration: OPEN_MS, easing: "ease", pseudoElement: "::backdrop" },
          );
          fadeGrid(0, OPEN_MS, OPEN_EASE); // cards erase
          boxAnim.onfinish = () => {
            setBox(dialog, to); // settle at the resting box
            boxAnim.cancel();
            backdropAnim.cancel();
          };
        }
      }
    }
  }, [openSlug]);

  // Lock background scroll while a modal is open.
  useEffect(() => {
    if (!openSlug) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [openSlug]);

  const openProject = (slug: string) => {
    setOpenSlug(slug);
    history.pushState(null, "", `#${slug}`);
  };

  // Request a close — flips state, which drives the exit animation in the
  // effect above. The native close() is called when that animation finishes.
  const requestClose = (slug: string) => {
    setOpenSlug((cur) => (cur === slug ? null : cur));
    if (window.location.hash === `#${slug}`) {
      history.replaceState(
        null,
        "",
        window.location.pathname + window.location.search,
      );
    }
  };

  return (
    <>
      <ul ref={gridRef} className="project-grid grid gap-8 sm:grid-cols-2">
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
                onClick={() => openProject(p.slug)}
                onMouseEnter={() =>
                  setNode({ row: Math.floor(i / COLS) + 1, col: (i % COLS) + 1 })
                }
                onMouseLeave={() => setNode(null)}
                onFocus={() =>
                  setNode({ row: Math.floor(i / COLS) + 1, col: (i % COLS) + 1 })
                }
                onBlur={() => setNode(null)}
                aria-haspopup="dialog"
                className="project-card group flex h-full w-full flex-col overflow-hidden rounded-lg text-left transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent motion-safe:hover:scale-[1.02]"
              >
                {/* Card cover from `image:` frontmatter; accent placeholder if unset. */}
                {p.image ? (
                  <div className="relative h-[200px] w-full overflow-hidden bg-accent/10">
                    <Image
                      src={p.image}
                      alt=""
                      fill
                      sizes="(min-width: 640px) 24rem, 100vw"
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="h-[200px] w-full bg-accent/10" aria-hidden />
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

      {/* One modal per project — every body stays in the HTML (crawlable). */}
      {projects.map((p) => {
        const pane = panes.find((x) => x.slug === p.slug);
        return (
          <dialog
            key={p.slug}
            ref={(el) => {
              const refs = dialogRefs.current;
              if (el) refs.set(p.slug, el);
              else refs.delete(p.slug);
            }}
            aria-label={p.title}
            onCancel={(e) => {
              // Esc: animate out instead of the instant native close.
              e.preventDefault();
              requestClose(p.slug);
            }}
            onClose={() => setOpenSlug((cur) => (cur === p.slug ? null : cur))}
            onClick={(e) => {
              if (e.target === e.currentTarget) requestClose(p.slug);
            }}
            className="box-border overflow-hidden rounded-none bg-background shadow-xl"
          >
            {/* Close — pinned to the panel's top-right corner, 32px in. */}
            <button
              type="button"
              onClick={() => requestClose(p.slug)}
              aria-label="Close"
              className="absolute right-8 top-8 z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 border-danger bg-background text-danger transition hover:bg-danger/10"
            >
              <svg
                viewBox="0 0 24 24"
                className="h-3.5 w-3.5"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
                strokeLinecap="round"
                aria-hidden="true"
              >
                <path d="M6 6l12 12M6 18L18 6" />
              </svg>
            </button>
            {/* Case study — scrolls inside the panel. Content is centered + capped
                (max-w-[60rem]) so it doesn't sprawl in a wide panel; text holds a
                reading measure (.case-body), media breaks out to the content width. */}
            <div className="h-full overflow-y-auto px-6 py-10">
              <article className="mx-auto max-w-[60rem]">
                <header className="mx-auto mb-8 max-w-[42rem] border-b-2 border-accent pb-4">
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
          </dialog>
        );
      })}
    </>
  );
}
