"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useView } from "@/components/ViewContext";

const VIEWS: { href: string; label: string }[] = [
  { href: "/", label: "my lab" },
  { href: "/design", label: "case studies" },
  { href: "/product-ideas", label: "product ideas" },
];

/**
 * Segmented toggle for the design triad (my lab ↔ case studies ↔ product
 * ideas). Each segment is a real route link; the active one is derived from
 * the pathname. The highlight is an absolutely-positioned "thumb" sized to one
 * segment that translates across the three equal-width (`grid-cols-3`) segments
 * as the route changes (the layout persists across client navigation, so the
 * slide animates). `motion-safe` so reduced-motion users get an instant swap.
 */
export function ViewSwitcher() {
  const pathname = usePathname();
  const { detail } = useView();
  const activeIndex = VIEWS.findIndex((v) => v.href === pathname);

  // Only shown on the projects ↔ product-ideas routes (hidden on e.g. contact),
  // and while a project detail is open in-place (the cards grid isn't showing).
  if (activeIndex < 0 || detail) return null;

  return (
    <div
      role="group"
      aria-label="Choose a view"
      className="frosted pointer-events-auto relative inline-grid grid-cols-3 rounded-lg p-1"
    >
      {/* Sliding thumb — one segment wide: (track − p-1 both sides) / 3. */}
      <span
        aria-hidden
        className="absolute inset-y-1 left-1 w-[calc((100%_-_0.5rem)/3)] rounded-md bg-accent-200 motion-safe:transition-transform motion-safe:duration-200 motion-safe:ease-out"
        style={{ transform: `translateX(${activeIndex * 100}%)` }}
      />

      {VIEWS.map((v) => {
        const isActive = v.href === pathname;
        return (
          <Link
            key={v.href}
            href={v.href}
            aria-current={isActive ? "page" : undefined}
            className="relative z-10 rounded-md px-4 py-1.5 text-center text-base text-foreground transition-colors"
          >
            {v.label}
          </Link>
        );
      })}
    </div>
  );
}
