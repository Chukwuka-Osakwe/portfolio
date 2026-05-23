/**
 * NOTE: Currently unused — intentionally retained.
 * Listing component from the original multi-route site (home + /work + /writing
 * index pages). Kept for the planned expansion beyond the current single page;
 * links assume `/${section}/${slug}` routes that don't exist yet. Not dead code.
 */
import Link from "next/link";
import type { ContentMeta } from "@/lib/content";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
  });
}

export function EntryList({ entries }: { entries: ContentMeta[] }) {
  if (entries.length === 0) {
    return <p className="text-text-muted">Nothing here yet.</p>;
  }
  return (
    <ul className="divide-y divide-border">
      {entries.map((entry) => (
        <li key={`${entry.section}/${entry.slug}`} className="py-6">
          <Link href={`/${entry.section}/${entry.slug}`} className="group block">
            <div className="flex items-baseline justify-between gap-4">
              <h3 className="font-medium group-hover:text-accent transition-colors">
                {entry.title}
              </h3>
              <time className="shrink-0 text-sm text-text-muted" dateTime={entry.date}>
                {formatDate(entry.date)}
              </time>
            </div>
            <p className="mt-1 text-text-muted">{entry.summary}</p>
            {entry.role && (
              <p className="mt-1 text-sm text-text-muted">{entry.role}</p>
            )}
          </Link>
        </li>
      ))}
    </ul>
  );
}
