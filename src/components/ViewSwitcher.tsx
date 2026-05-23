"use client";

import { useView, type ViewId } from "@/components/ViewContext";

const VIEWS: { id: ViewId; label: string }[] = [
  { id: "projects", label: "projects" },
  { id: "product-ideas", label: "product ideas" },
];

/**
 * Segmented toggle for switching the visible set (currently visual only — the
 * "product ideas" content set isn't built yet, so this just slides the active
 * highlight). Lives inside the fixed switcher bar in `page.tsx`.
 *
 * The highlight is an absolutely-positioned "thumb" sized to one segment that
 * translates between the two equal-width (`grid-cols-2`) segments; the slide is
 * `motion-safe` so reduced-motion users get an instant swap.
 */
export function ViewSwitcher() {
  const { active, setActive } = useView();
  const activeIndex = VIEWS.findIndex((v) => v.id === active);

  // The switcher is a sub-toggle within the "design" area (projects ↔ product
  // ideas) — hide it entirely on other routes (e.g. contact).
  if (activeIndex < 0) return null;

  return (
    <div
      role="group"
      aria-label="Choose a view"
      className="pointer-events-auto relative inline-grid grid-cols-2 rounded-lg border border-border bg-background/70 p-1 shadow-sm backdrop-blur"
    >
      {/* Sliding thumb */}
      <span
        aria-hidden
        className="absolute inset-y-1 left-1 w-[calc(50%_-_4px)] rounded-md bg-accent-fill motion-safe:transition-transform motion-safe:duration-200 motion-safe:ease-out"
        style={{ transform: `translateX(${activeIndex * 100}%)` }}
      />

      {VIEWS.map((v) => {
        const isActive = v.id === active;
        return (
          <button
            key={v.id}
            type="button"
            aria-pressed={isActive}
            onClick={() => setActive(v.id)}
            className={
              "relative z-10 rounded-md px-4 py-1.5 text-center text-base transition-colors " +
              (isActive
                ? "font-medium text-foreground"
                : "text-text-muted hover:text-foreground")
            }
          >
            {v.label}
          </button>
        );
      })}
    </div>
  );
}
