"use client";

import { useEffect, useState } from "react";

type Theme = "light" | "system" | "dark";

const SEGMENTS: { value: Theme; label: string }[] = [
  { value: "light", label: "Light theme" },
  { value: "system", label: "Follow system theme" },
  { value: "dark", label: "Dark theme" },
];

/**
 * Tri-state theme segmented control: light · system · dark. "system" follows
 * the visitor's OS preference (default; no `data-theme` attribute set).
 * Explicit choices write `html[data-theme]` (read by CSS) AND localStorage
 * (read by the pre-paint script in the root layout, which avoids FOUC on
 * reload).
 *
 * Mirrors the ViewSwitcher design language — frosted track, sliding thumb,
 * `motion-safe`-gated transition. The thumb is 1/3 of the track and translates
 * 0 / 100% / 200% between segments.
 *
 * SSR-safe: server renders with system as the visible-pressed segment (it
 * can't read localStorage); after mount, state is reconciled to the persisted
 * value if any. One frame of possible mismatch — no hydration warning, no
 * layout shift.
 *
 * `animate` is a separate flag that gates the thumb's `transition-transform`
 * class. It flips on after a double-rAF (one paint past the theme
 * reconciliation), so the thumb LANDS at its correct position on reload
 * instead of sliding into it from the SSR-default "system" cell.
 */
export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("system");
  const [mounted, setMounted] = useState(false);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("theme");
    if (stored === "light" || stored === "dark") setTheme(stored);
    // Double-rAF: a single rAF would still fire before the corrected-thumb
    // paint and react would batch both commits together; the second rAF
    // guarantees we're past at least one paint with the reconciled transform.
    let r1 = 0, r2 = 0;
    r1 = requestAnimationFrame(() => {
      r2 = requestAnimationFrame(() => setAnimate(true));
    });
    return () => {
      cancelAnimationFrame(r1);
      cancelAnimationFrame(r2);
    };
  }, []);

  const choose = (next: Theme) => {
    setTheme(next);
    const root = document.documentElement;
    if (next === "system") {
      localStorage.removeItem("theme");
      delete root.dataset.theme;
    } else {
      localStorage.setItem("theme", next);
      root.dataset.theme = next;
    }
  };

  return (
    <div
      role="group"
      aria-label="Theme"
      className="frosted relative grid w-full grid-cols-3 rounded-lg p-1"
    >
      {/* Sliding thumb — position driven by `.theme-thumb` rules in globals.css
          reading html[data-theme]. CSS-driven (not inline-style) so the thumb
          lands in the correct cell on the first paint, before React mounts —
          the pre-paint script in layout.tsx sets html[data-theme] from
          localStorage. The transition class is gated on `animate` (double-rAF
          after mount) so reload doesn't slide; user clicks animate normally. */}
      <span
        aria-hidden
        className={`theme-thumb absolute inset-y-1 left-1 w-[calc(33.333%_-_4px)] rounded-md bg-accent-200 ${animate ? "motion-safe:transition-transform motion-safe:duration-200 motion-safe:ease-out" : ""}`}
      />

      {SEGMENTS.map((s) => {
        const isActive = mounted && s.value === theme;
        return (
          <button
            key={s.value}
            type="button"
            onClick={() => choose(s.value)}
            aria-pressed={isActive}
            aria-label={s.label}
            title={s.label}
            className="focus-ring relative z-10 flex h-7 w-full items-center justify-center rounded-md text-foreground transition-colors"
          >
            <SegmentIcon value={s.value} />
          </button>
        );
      })}
    </div>
  );
}

function SegmentIcon({ value }: { value: Theme }) {
  if (value === "light") return <SunIcon />;
  if (value === "dark") return <MoonIcon />;
  return <SystemIcon />;
}

// Stroke icons — currentColor so they inherit text-* classes. Sized 16px to
// sit nicely inside the segmented control's compressed cells. Exported so
// the mobile ThemeCycle button can reuse them.

export function SunIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  );
}

export function MoonIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" />
    </svg>
  );
}

export function SystemIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="3" y="4" width="18" height="13" rx="1" />
      <path d="M8 21h8M12 17v4" />
    </svg>
  );
}
