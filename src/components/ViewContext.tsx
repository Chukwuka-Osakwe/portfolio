"use client";

import { createContext, useContext, useState } from "react";

// The hovered/focused card's 1-indexed position in the projects matrix, shared
// with the nav-panel readout (the "matrix" coordinate gag). null = none active.
export type NodeCoord = { row: number; col: number } | null;

interface ViewCtx {
  node: NodeCoord;
  setNode: (n: NodeCoord) => void;
  // Slug of the project shown in-place on the projects route (the detail
  // replaces the cards grid); null when the grid is showing. Lifted here so the
  // bottom ViewSwitcher can hide while a detail is open.
  detail: string | null;
  setDetail: (s: string | null) => void;
}

const Ctx = createContext<ViewCtx | null>(null);

/**
 * Small cross-tree UI state for the site shell: the projects "matrix" hover
 * coordinate and whether an in-place project detail is open. The active *view*
 * is the route (pathname), not state here — see the app/(site)/ route group.
 */
export function ViewProvider({ children }: { children: React.ReactNode }) {
  const [node, setNode] = useState<NodeCoord>(null);
  const [detail, setDetail] = useState<string | null>(null);
  return (
    <Ctx.Provider value={{ node, setNode, detail, setDetail }}>
      {children}
    </Ctx.Provider>
  );
}

export function useView() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useView must be used within <ViewProvider>");
  return ctx;
}
