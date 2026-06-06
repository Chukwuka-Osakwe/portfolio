import type { MDXComponents } from "mdx/types";
import type { CSSProperties, ReactNode } from "react";
import Link from "next/link";
import CaseVideo from "./CaseVideo";

/**
 * Custom element + component overrides for MDX bodies.
 * Base typography is handled by Tailwind's `prose` classes on the wrapper;
 * this is where we swap in framework-aware or branded components.
 */
export const mdxComponents: MDXComponents = {
  // Case-study body images. Native <img> (not next/image) because MDX images
  // have arbitrary, unknown dimensions; a plain responsive img + lazy loading
  // is the pragmatic fit. Framed to match the card-elevation language.
  // eslint-disable-next-line @next/next/no-img-element
  img: ({ src, alt = "", ...props }) => (
    <img
      src={typeof src === "string" ? src : ""}
      alt={alt}
      loading="lazy"
      className="my-8 w-full border border-border"
      {...props}
    />
  ),

  // Centered, width-capped image — for shots that shouldn't run the full
  // column width. Plain markdown images (![]()) stay full-width; reach for
  // <Figure> when you want one inset. `width` is any CSS length/percentage
  // (default 66%); it's always centered and never exceeds the column.
  // Pass `caption` to render the image inside a <figure> with a <figcaption>
  // — owning the image↔caption gap internally (cleaner than the previous
  // sibling-selector approach, which lost the cascade race against `my-8`).
  // e.g. <Figure src="/work/footy/colours.webp" alt="…" width="69%" caption="…" />
  /* eslint-disable @next/next/no-img-element */
  Figure: ({
    src,
    alt = "",
    width = "66%",
    caption,
    captionBefore,
    captionAfter,
  }: {
    src?: string;
    alt?: string;
    width?: string;
    /** Single-line caption (string or ReactNode). For two-line captions —
     *  e.g. a "before / after" pair where the image is one composite — use
     *  `captionBefore`/`captionAfter` instead. (Mirrors <Compare>.) */
    caption?: ReactNode;
    captionBefore?: string;
    captionAfter?: string;
  }) => {
    const hasCaption = !!(caption || captionBefore || captionAfter);
    const img = (
      <img
        src={typeof src === "string" ? src : ""}
        alt={alt}
        loading="lazy"
        className={hasCaption ? "mx-auto block border border-border" : "my-8 mx-auto block border border-border"}
        style={{ width, maxWidth: "100%" }}
      />
    );
    return hasCaption ? (
      <figure>
        {img}
        <figcaption>
          {captionBefore || captionAfter ? (
            <>
              {captionBefore && <p>{captionBefore}</p>}
              {captionAfter && <p>{captionAfter}</p>}
            </>
          ) : (
            caption
          )}
        </figcaption>
      </figure>
    ) : (
      img
    );
  },
  /* eslint-enable @next/next/no-img-element */
  // Side-by-side before → after comparison: two images in one row with an
  // accent arrow between them (equal width, vertically centered). Centered and
  // width-capped via `width` (default 40rem, matching <Screens>) so the pair
  // doesn't sprawl across the full content column.
  // e.g. <Compare beforeSrc="…" beforeAlt="…" afterSrc="…" afterAlt="…" width="40rem" />
  /* eslint-disable @next/next/no-img-element */
  Compare: ({
    beforeSrc,
    beforeAlt = "",
    afterSrc,
    afterAlt = "",
    width = "40rem",
    aspect = "9 / 20",
    caption,
    captionBefore,
    captionAfter,
  }: {
    beforeSrc?: string;
    beforeAlt?: string;
    afterSrc?: string;
    afterAlt?: string;
    width?: string;
    /** CSS aspect-ratio applied to each image cell. Default `9 / 20` (≈0.45)
     *  matches a portrait phone screenshot. Override for landscape pairs. */
    aspect?: string;
    /** Single-line caption (string or ReactNode). For two-line captions —
     *  e.g. a "before / after" pair — use `captionBefore`/`captionAfter`
     *  instead, since next-mdx-remote drops JSX-expression caption nodes. */
    caption?: ReactNode;
    captionBefore?: string;
    captionAfter?: string;
  }) => {
    // Each image lives in a flex-1 wrapper div with a definite aspect-ratio,
    // so both cells render at exactly the same width AND height. The img
    // inside fills the wrapper via `h-full w-full object-cover`, cropping
    // any aspect mismatch with the underlying file. Sidesteps the flex
    // `align-self: stretch` issue (silently ignored on images with intrinsic
    // aspect-ratio, which left the container taller than the shorter image).
    /* eslint-disable @next/next/no-img-element */
    const cell = (src: string, alt: string) => (
      <div
        className="min-w-0 flex-1 overflow-hidden border border-border"
        style={{ aspectRatio: aspect }}
      >
        <img
          src={src}
          alt={alt}
          loading="lazy"
          className="block h-full w-full object-cover"
        />
      </div>
    );
    const hasCaption = !!(caption || captionBefore || captionAfter);
    const row = (
      <div
        className={
          hasCaption
            ? "mx-auto flex items-stretch justify-center gap-3 sm:gap-4"
            : "mx-auto my-8 flex items-stretch justify-center gap-3 sm:gap-4"
        }
        style={{ maxWidth: width }}
      >
        {cell(typeof beforeSrc === "string" ? beforeSrc : "", beforeAlt)}
        {/* SVG arrow instead of the ⟶ glyph so the stroke weight is precise
            (4px) and font-independent. Sized to ~match the prior text-4xl
            arrow's footprint (~48×40px), vertically centered in the flex row. */}
        <svg
          aria-hidden
          className="shrink-0 self-center block text-accent"
          width="48"
          height="40"
          viewBox="0 0 48 40"
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M4 20h36" />
          <path d="M30 10l10 10-10 10" />
        </svg>
        {cell(typeof afterSrc === "string" ? afterSrc : "", afterAlt)}
      </div>
    );
    /* eslint-enable @next/next/no-img-element */
    const captionContent =
      caption ??
      (captionBefore || captionAfter ? (
        <>
          {captionBefore && <p>{captionBefore}</p>}
          {captionAfter && <p>{captionAfter}</p>}
        </>
      ) : null);
    return hasCaption ? (
      <figure>
        {row}
        <figcaption>{captionContent}</figcaption>
      </figure>
    ) : (
      row
    );
  },
  /* eslint-enable @next/next/no-img-element */

  // h2 wraps its text in an inline .accent-marker highlighter (hugs the text
  // rather than banding the full column). The rehype-slug `id` stays on the
  // heading for anchor links. h3 is left as plain prose — it gets an auto-
  // number via CSS counters instead (see .case-body rules in globals.css).
  // Note: the case-study TITLE at the top of the detail view is rendered as
  // <h1> in ProjectsExplorer; body section headings stay h2 so the hierarchy
  // is h1 (title) → h2 (sections) → h3 (subsections), no skipped levels.
  h2: ({ children, ...props }) => (
    <h2 {...props}>
      <span className="accent-marker">{children}</span>
    </h2>
  ),

  // A centered, width-capped grid of app screens. Pass plain <img>s as children;
  // the .screen-grid rule (globals.css) handles layout. `cols` sets the column
  // count at sm+ (default 3), `width` the max-width (default 40rem). Reuse in any
  // case study: <Screens cols={2} width="30rem">…imgs…</Screens>
  Screens: ({
    cols = 3,
    width = "40rem",
    children,
    caption,
  }: {
    cols?: number;
    width?: string;
    children?: ReactNode;
    caption?: ReactNode;
  }) => {
    const grid = (
      <div
        className="screen-grid"
        style={
          { "--screens-cols": cols, "--screens-w": width } as CSSProperties
        }
      >
        {children}
      </div>
    );
    return caption ? (
      <figure>
        {grid}
        <figcaption>{caption}</figcaption>
      </figure>
    ) : (
      grid
    );
  },

  // Case-study body video. Client component (needs IntersectionObserver +
  // matchMedia); mirrors <Figure>'s caption API so the same `.case-body figure`
  // CSS rules cover it. Playback: muted autoplay-on-scroll, one-shot, replay
  // button overlay on end. Reduced-motion: skip autoplay, show play overlay.
  // e.g. <CaseVideo src="/work/heyfood/heyfood.mp4" poster="/work/heyfood/heyfood-poster.webp" caption="…" />
  CaseVideo,

  a: ({ href = "", children, ...props }) => {
    // Body / attribution links render in the brand accent (overrides prose's
    // default dark link colour), keeping the underline as the affordance.
    const className =
      "text-accent underline decoration-accent/40 underline-offset-2 transition-colors hover:decoration-accent";
    const isInternal = href.startsWith("/") || href.startsWith("#");
    if (isInternal) {
      return (
        <Link href={href} className={className} {...props}>
          {children}
        </Link>
      );
    }
    return (
      <a
        href={href}
        target="_blank"
        rel="noreferrer noopener"
        className={className}
        {...props}
      >
        {children}
      </a>
    );
  },
};
