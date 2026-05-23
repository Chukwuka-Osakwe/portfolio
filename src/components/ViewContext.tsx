"use client";

import { createContext, useContext, useState } from "react";

export type ViewId = "projects" | "product-ideas" | "contact";

// The hovered/focused card's 1-indexed position in the projects matrix, shared
// with the nav-panel readout (the "matrix" coordinate gag). null = none active.
export type NodeCoord = { row: number; col: number } | null;

interface ViewCtx {
  active: ViewId;
  setActive: (v: ViewId) => void;
  node: NodeCoord;
  setNode: (n: NodeCoord) => void;
}

const Ctx = createContext<ViewCtx | null>(null);

/**
 * Shares the active view between the fixed bottom switcher and the content
 * area (they sit in different parts of the tree). Defaults to "projects" so the
 * static build ships the projects grid (+ crawlable modal bodies); the
 * product-ideas carousel mounts client-side on toggle.
 */
export function ViewProvider({ children }: { children: React.ReactNode }) {
  const [active, setActive] = useState<ViewId>("projects");
  const [node, setNode] = useState<NodeCoord>(null);
  return (
    <Ctx.Provider value={{ active, setActive, node, setNode }}>
      {children}
    </Ctx.Provider>
  );
}

export function useView() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useView must be used within <ViewProvider>");
  return ctx;
}
