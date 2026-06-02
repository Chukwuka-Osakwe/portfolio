"use client";

import { createContext, useContext, useState } from "react";

interface ViewCtx {
  // Slug of the project shown in-place on the projects route (the detail
  // replaces the cards grid); null when the grid is showing. Lifted here so the
  // bottom ViewSwitcher can hide while a detail is open.
  detail: string | null;
  setDetail: (s: string | null) => void;
}

const Ctx = createContext<ViewCtx | null>(null);

/**
 * Small cross-tree UI state for the site shell: whether an in-place project
 * detail is open. The active *view* is the route (pathname), not state here —
 * see the app/(site)/ route group.
 */
export function ViewProvider({ children }: { children: React.ReactNode }) {
  const [detail, setDetail] = useState<string | null>(null);
  return (
    <Ctx.Provider value={{ detail, setDetail }}>{children}</Ctx.Provider>
  );
}

export function useView() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useView must be used within <ViewProvider>");
  return ctx;
}
