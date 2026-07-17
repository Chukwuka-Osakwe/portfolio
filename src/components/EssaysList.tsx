import Link from "next/link";
import { getAllMeta } from "@/lib/content";
import { formatDateShort } from "@/lib/date";

// The WordPress back-catalogue — kept reachable via a footer link while essays
// migrate in-house. Mirrors the URL that "essays" used to point at in NavMenu.
const WORDPRESS_URL = "https://thechukwukaosakwe.wordpress.com/";

/**
 * Essays listing — a prose-first, text-only index (no cover images, unlike the
 * case-study grid). Each entry is a full-row link: date eyebrow → title →
 * summary. Reuses the writing section of the content lib; sorted featured-first
 * then date-desc by getAllMeta.
 */
export function EssaysList() {
  const essays = getAllMeta("writing");

  return (
    // Reading-measure column, centered in the viewspace and vertically settled.
    <div className="mx-auto flex w-full max-w-[var(--reading-measure)] flex-col min-h-[calc(100dvh-11.5rem-env(safe-area-inset-top,0px))] lg:min-h-[calc(100dvh-8rem)]">
      {/* Header — mirrors the case-study detail header: title + subheading,
          then a tight border-b-2 accent rule close beneath (same pb-4/mb-8
          spacing) so the listing reads as part of the same family. */}
      <header className="mb-8 border-b-2 border-accent pb-4">
        <h1 className="text-[clamp(1.5rem,3vw,2rem)] font-semibold tracking-tight text-accent">
          essays
        </h1>
        <p className="mt-2 text-base text-text-muted">
          thinking out loud about life, design, (onchain) products, and the internet.
        </p>
      </header>

      {/* Migration note — the older catalogue still lives on WordPress while
          essays move in-house; sits at the top of the list. Drop once the
          migration is complete. */}
      <p className="mb-8 text-sm text-text-muted">
        <a
          href={WORDPRESS_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="focus-ring group inline-flex items-center gap-1 rounded transition-colors hover:text-accent focus-visible:text-accent"
        >
          some of my older essays are on wordpress
          <span aria-hidden className="transition-transform group-hover:translate-x-0.5">
            →
          </span>
        </a>
      </p>

      {/* Entry list — subtle dividers between rows (the accent header rule is
          the boundary above the first row, so no border-top here). The whole
          row is the link target; title warms to accent on hover/focus
          (desktop affordance; date + summary stay muted). */}
      <ol className="group/list divide-y divide-border">
        {essays.map((e) => (
          <li key={e.slug}>
            <Link
              href={`/essays/${e.slug}`}
              className="focus-ring group block rounded py-3"
            >
              <h2 className="flex items-baseline gap-8 text-base font-semibold tracking-tight transition-colors group-hover/list:text-text-muted group-hover:!text-accent group-focus-visible:!text-accent">
                <time
                  dateTime={e.date}
                  className="shrink-0 text-sm font-normal tabular-nums text-text-muted"
                >
                  {formatDateShort(e.date)}
                </time>
                <span className="text-balance">{e.title}</span>
              </h2>
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}
