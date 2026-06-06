"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type MouseEvent,
  type ReactNode,
} from "react";

/**
 * Lightbox for case-study body images. Wraps the .case-body content with a
 * delegated click handler: any `<img>` click inside the subtree opens a native
 * `<dialog>` showing the image at viewport-fit size (max 95vw × 95vh,
 * object-contain).
 *
 * One delegated listener covers every body image — markdown imgs, <Figure>,
 * <Compare>, <Screens> — without per-component wiring. Add the `data-no-zoom`
 * attribute on any ancestor to opt an image out.
 *
 * Architecture note: the modal-for-navigation pattern was retired in S6 in
 * favour of in-place detail. This is a separate use case — a viewer for media,
 * not a navigation chrome — so the <dialog> reappears here without
 * contradiction. Focus is restored to the clicked image on close.
 */
type Active = { src: string; alt: string; captionHtml?: string };

export default function CaseImageViewer({ children }: { children: ReactNode }) {
  const [active, setActive] = useState<Active | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const lastFocusedRef = useRef<HTMLElement | null>(null);

  // Open a dialog when an img inside the subtree is clicked. Plain `<img>` only
  // (videos handle their own state via CaseVideo's overlay), and an opt-out via
  // [data-no-zoom] on any ancestor. If the img is inside a <figure>, the
  // sibling <figcaption>'s HTML is captured and rendered alongside the image
  // — multi-paragraph captions (Footy's stacked "Before/After") preserve their
  // structure via innerHTML (safe here since all MDX is author-trusted).
  const handleClick = useCallback((e: MouseEvent<HTMLDivElement>) => {
    const target = e.target;
    if (!(target instanceof HTMLImageElement)) return;
    if (target.closest("[data-no-zoom]")) return;
    lastFocusedRef.current = target;
    const figcaption = target.closest("figure")?.querySelector("figcaption");
    setActive({
      src: target.currentSrc || target.src,
      alt: target.alt,
      captionHtml: figcaption?.innerHTML,
    });
  }, []);

  // Sync dialog open/close with `active`. Native showModal() handles focus
  // trapping + Esc-to-close + inert backdrop for us.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (active && !dialog.open) {
      dialog.showModal();
    } else if (!active && dialog.open) {
      dialog.close();
    }
  }, [active]);

  const close = useCallback(() => {
    setActive(null);
    // Restore focus to the originating img so keyboard users don't lose place.
    // Use rAF so the dialog's close has settled before we focus.
    requestAnimationFrame(() => {
      lastFocusedRef.current?.focus?.();
    });
  }, []);

  // Click on the dialog element itself (not the image inside) = backdrop click.
  // Native <dialog>::backdrop fires events on the dialog, so target===dialog
  // means the user clicked outside the image.
  const onDialogClick = (e: MouseEvent<HTMLDialogElement>) => {
    if (e.target === dialogRef.current) close();
  };

  return (
    <div onClick={handleClick}>
      {children}
      <dialog
        ref={dialogRef}
        onClose={close}
        onClick={onDialogClick}
        aria-label={active?.alt || "Image viewer"}
        // The dialog backdrop styling lives in globals.css (::backdrop pseudo).
        // The dialog itself is transparent — the image sits centered with
        // viewport-fit constraints; we draw no chrome around it besides the
        // close button.
        className="image-viewer m-auto max-h-[95vh] max-w-[95vw] bg-transparent p-0 outline-none backdrop:bg-foreground/60 backdrop:backdrop-blur-[8px]"
      >
        {active && (
          <div className="relative flex flex-col items-center gap-3">
            {/* Image max-h is a consistent 80vh whether captioned or not, so
                the lightbox shape feels the same across every image. Width
                cap (viewspace on lg+) lives in globals.css. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={active.src}
              alt={active.alt}
              className="block max-h-[80vh] max-w-[95vw] object-contain"
            />
            {active.captionHtml && (
              <figcaption
                className="frosted max-w-[var(--caption-measure)] rounded-md px-4 py-2 text-center text-sm leading-tight text-foreground [&>p]:m-0"
                dangerouslySetInnerHTML={{ __html: active.captionHtml }}
              />
            )}
            <button
              type="button"
              onClick={close}
              autoFocus
              aria-label="Close"
              className="focus-ring frosted absolute right-2 top-2 flex h-10 w-10 items-center justify-center rounded-full text-foreground"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden
              >
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            </button>
          </div>
        )}
      </dialog>
    </div>
  );
}
