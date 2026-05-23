import type { MDXComponents } from "mdx/types";
import Link from "next/link";

/**
 * Custom element + component overrides for MDX bodies.
 * Base typography is handled by Tailwind's `prose` classes on the wrapper;
 * this is where we swap in framework-aware or branded components.
 */
export const mdxComponents: MDXComponents = {
  a: ({ href = "", children, ...props }) => {
    const isInternal = href.startsWith("/") || href.startsWith("#");
    if (isInternal) {
      return (
        <Link href={href} {...props}>
          {children}
        </Link>
      );
    }
    return (
      <a href={href} target="_blank" rel="noreferrer noopener" {...props}>
        {children}
      </a>
    );
  },
};
