"use client";

import { useEffect, useState } from "react";
import { SunIcon, MoonIcon, SystemIcon } from "@/components/ThemeToggle";

type Theme = "light" | "system" | "dark";
const ORDER: Theme[] = ["light", "system", "dark"];
const NEXT_LABEL: Record<Theme, string> = {
  light: "Switch to system theme",
  system: "Switch to dark theme",
  dark: "Switch to light theme",
};

/**
 * Compact single-button theme cycler — mobile counterpart to the desktop
 * 3-segment ThemeToggle. Shows the CURRENT theme's icon; tap cycles
 * light → system → dark → light. Loses the always-visible 3-state
 * affordance in exchange for fitting alongside the menu button in the
 * mobile topbar.
 *
 * Writes the same localStorage('theme') + html[data-theme] surface as
 * ThemeToggle, so the pre-paint script + CSS theme system both work
 * unchanged. Either control can be active per breakpoint; never both
 * at once.
 *
 * SSR-safe: defaults to "system" icon on initial render (server can't
 * read localStorage), reconciles to the persisted value in useEffect.
 * One-frame icon flicker possible if user has chosen a non-system
 * theme — acceptable for v1.
 */
export function ThemeCycle() {
  const [theme, setTheme] = useState<Theme>("system");

  useEffect(() => {
    const stored = localStorage.getItem("theme");
    if (stored === "light" || stored === "dark") setTheme(stored);
  }, []);

  const cycle = () => {
    const i = ORDER.indexOf(theme);
    const next = ORDER[(i + 1) % ORDER.length];
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
    <button
      type="button"
      onClick={cycle}
      aria-label={NEXT_LABEL[theme]}
      // Matches the menu / close button language — h-11 w-11 circular chip
      // with bg-foreground/5 fill, hover bumps to /10. Same touch target,
      // same visual material — reads as a sibling control to the menu button.
      className="focus-ring flex h-11 w-11 items-center justify-center rounded-full bg-foreground/5 text-foreground transition-colors hover:bg-foreground/10"
    >
      {theme === "light" && <SunIcon />}
      {theme === "system" && <SystemIcon />}
      {theme === "dark" && <MoonIcon />}
    </button>
  );
}
