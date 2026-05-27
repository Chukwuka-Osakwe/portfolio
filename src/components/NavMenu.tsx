"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// `href` → destination. `external` items open in a new tab; internal items are
// real routes. `activeFor` lists the pathnames the item should highlight on
// (defaults to [href]). "design" covers both projects (/) and product-ideas, so
// it stays active across both.
type Item = {
  label: string;
  href: string;
  external?: boolean;
  activeFor?: string[];
};

const ITEMS: Item[] = [
  { label: "design", href: "/", activeFor: ["/", "/product-ideas"] },
  { label: "essays", href: "https://thechukwukaosakwe.wordpress.com/", external: true },
  { label: "newsletter", href: "https://chukwukaosakwe.substack.com/", external: true },
  { label: "contact", href: "/contact" },
];

// Separated button stack: each item is its own full-width (equal), rounded,
// flat outlined control with a gap between them. Left-aligned; hover fills the
// row; active = accent-fill. (bg lives in the state constants, not BASE, to
// avoid a Tailwind bg-* conflict between inactive white and active accent-fill.)
const BASE =
  "block w-full rounded-lg border px-4 py-3 text-left text-base font-semibold outline-none transition focus-visible:border-accent";
const INACTIVE = "border-border bg-nav-fill hover:bg-foreground/5 hover:text-accent";
const ACTIVE = "border-border bg-accent-fill text-foreground";

export function NavMenu() {
  const pathname = usePathname();

  return (
    <div className="mt-12">
      <p
        className="text-lg text-foreground"
        style={{ fontFamily: "var(--font-nico-moji)" }}
      >
        some things i do
      </p>
      <div className="mt-4 flex flex-col gap-2">
        {ITEMS.map((item) => {
          if (item.external) {
            return (
              <a
                key={item.label}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className={`${BASE} ${INACTIVE}`}
              >
                {item.label}
              </a>
            );
          }
          const isActive = (item.activeFor ?? [item.href]).includes(pathname);
          return (
            <Link
              key={item.label}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={`${BASE} ${isActive ? ACTIVE : INACTIVE}`}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
