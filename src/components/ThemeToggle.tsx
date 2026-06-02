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
 */
export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("system");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("theme");
    if (stored === "light" || stored === "dark") setTheme(stored);
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

  const activeIndex = SEGMENTS.findIndex((s) => s.value === theme);

  return (
    <div
      role="group"
      aria-label="Theme"
      className="frosted relative grid w-full grid-cols-3 rounded-lg p-1"
    >
      {/* Sliding thumb — 1/3 of track, translates between segments. */}
      <span
        aria-hidden
        className="absolute inset-y-1 left-1 w-[calc(33.333%_-_4px)] rounded-md bg-switcher-thumb motion-safe:transition-transform motion-safe:duration-200 motion-safe:ease-out"
        style={{ transform: `translateX(${activeIndex * 100}%)` }}
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
// sit nicely inside the segmented control's compressed cells.

function SunIcon() {
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

function MoonIcon() {
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

function SystemIcon() {
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
