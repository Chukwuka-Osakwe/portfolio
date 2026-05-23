"use client";

import { useView, type ViewId } from "@/components/ViewContext";

// `view` = where clicking sends you; `activeFor` = the views this item counts
// as active for (defaults to [view]). "design" is a top-level route covering
// both projects and product-ideas (the switcher toggles between them), so it
// stays active across both.
type Item = {
  label: string;
  href?: string;
  view?: ViewId;
  activeFor?: ViewId[];
};

// "things i do" menu. `href` → external link (new tab); `view` → switches the
// card column to that route (shared with the bottom switcher via ViewProvider);
// neither → inert placeholder until it has a destination.
const ITEMS: Item[] = [
  { label: "design", view: "projects", activeFor: ["projects", "product-ideas"] },
  { label: "essays", href: "https://thechukwukaosakwe.wordpress.com/" },
  { label: "newsletter", href: "https://chukwukaosakwe.substack.com/" },
  { label: "contact", view: "contact" },
];

// Separated button stack: each item is its own full-width (equal), rounded,
// flat outlined button with a gap between them (so they read as buttons, not
// table rows). Left-aligned; hover fills the row; active = accent-fill. No
// drop shadow — on the white panel it just reads as noise. (bg lives in the
// state constants, not BASE, to avoid a Tailwind bg-* conflict between
// inactive white and active accent-fill.)
const BASE =
  "block w-full rounded-lg border px-4 py-3 text-left text-base font-semibold outline-none transition focus-visible:border-accent";
const INACTIVE = "border-border bg-nav-fill hover:bg-foreground/5 hover:text-accent";
const ACTIVE = "border-border bg-accent-fill text-foreground";

export function NavMenu() {
  const { active, setActive } = useView();

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
          if (item.href) {
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
          const view = item.view;
          if (view) {
            const isActive = (item.activeFor ?? [view]).includes(active);
            return (
              <button
                key={item.label}
                type="button"
                onClick={() => setActive(view)}
                aria-current={isActive ? "page" : undefined}
                className={`${BASE} ${isActive ? ACTIVE : INACTIVE}`}
              >
                {item.label}
              </button>
            );
          }
          return (
            <button
              key={item.label}
              type="button"
              className={`${BASE} ${INACTIVE}`}
            >
              {item.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
