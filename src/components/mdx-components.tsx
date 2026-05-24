import type { MDXComponents } from "mdx/types";
import Link from "next/link";

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
  // e.g. <Figure src="/work/footy/colours.webp" alt="…" width="69%" />
  // eslint-disable-next-line @next/next/no-img-element
  Figure: ({
    src,
    alt = "",
    width = "66%",
  }: {
    src?: string;
    alt?: string;
    width?: string;
  }) => (
    <img
      src={typeof src === "string" ? src : ""}
      alt={alt}
      loading="lazy"
      className="my-8 mx-auto block border border-border"
      style={{ width, maxWidth: "100%" }}
    />
  ),
  // Side-by-side before → after comparison: two images in one row with an
  // accent arrow between them (equal width, vertically centered).
  // e.g. <Compare beforeSrc="…" beforeAlt="…" afterSrc="…" afterAlt="…" />
  /* eslint-disable @next/next/no-img-element */
  Compare: ({
    beforeSrc,
    beforeAlt = "",
    afterSrc,
    afterAlt = "",
  }: {
    beforeSrc?: string;
    beforeAlt?: string;
    afterSrc?: string;
    afterAlt?: string;
  }) => (
    <div className="my-8 flex items-stretch justify-center gap-3 sm:gap-4">
      <img
        src={typeof beforeSrc === "string" ? beforeSrc : ""}
        alt={beforeAlt}
        loading="lazy"
        className="min-w-0 flex-1 self-stretch object-cover border border-border"
      />
      <span aria-hidden className="shrink-0 self-center text-3xl text-accent">
        →
      </span>
      <img
        src={typeof afterSrc === "string" ? afterSrc : ""}
        alt={afterAlt}
        loading="lazy"
        className="min-w-0 flex-1 self-stretch object-cover border border-border"
      />
    </div>
  ),
  /* eslint-enable @next/next/no-img-element */

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
