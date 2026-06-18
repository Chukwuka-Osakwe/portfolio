import type { ReactNode } from "react";

/**
 * Static tweet card for essay / case-study bodies — reconstructed from a
 * Paragraph `twitter` embed's structured data (no live Twitter script). Avatar
 * + name + @handle + the X glyph, then the tweet text as children. The whole
 * card links to the tweet. Wrapped in a <figure> so `.case-body figure` owns
 * its 2rem block spacing; capped to 32rem to match inline tweet screenshots.
 *
 * Server component. Pass the tweet text as MDX children (blank-line-separated
 * paragraphs) rather than a prop, so multi-paragraph tweets render cleanly.
 *
 * e.g.
 * <Tweet name="David Perell" handle="david_perell"
 *        avatar="/writing/<slug>/perell-avatar.webp"
 *        href="https://x.com/david_perell/status/1720598056704286846">
 *
 * Tweet text here.
 *
 * </Tweet>
 */
type Props = {
  name: string;
  /** Handle without the leading @. */
  handle: string;
  avatar: string;
  /** Link to the tweet. */
  href: string;
  children: ReactNode;
};

export default function Tweet({ name, handle, avatar, href, children }: Props) {
  return (
    <figure>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="focus-ring mx-auto block max-w-[32rem] rounded-2xl border border-border p-5 no-underline transition-colors hover:border-accent"
      >
        <div className="flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={avatar}
            alt=""
            width={44}
            height={44}
            className="h-11 w-11 shrink-0 rounded-full"
          />
          <div className="min-w-0 leading-tight">
            <div className="font-semibold text-foreground">{name}</div>
            <div className="text-sm text-text-muted">@{handle}</div>
          </div>
          {/* X glyph */}
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
            className="ml-auto h-5 w-5 shrink-0 fill-foreground"
          >
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.66l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
        </div>
        {/* Tweet text — children are MDX paragraphs; zero their prose margins
            and space them evenly. text-foreground overrides prose link colour
            since the whole card is the link. */}
        <div className="mt-3 space-y-3 text-foreground [&>p]:m-0">{children}</div>
      </a>
    </figure>
  );
}
