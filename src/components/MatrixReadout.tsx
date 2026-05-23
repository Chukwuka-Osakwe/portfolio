"use client";

import { useView } from "@/components/ViewContext";

/**
 * The "matrix" coordinate gag: a small mono readout that reports the [row, col]
 * of the project card currently hovered/focused in the grid (the site is
 * "chukwuka's matrix", and the card grid is literally a matrix). Idle = [–,–].
 */
export function MatrixReadout() {
  const { node } = useView();
  return (
    <p className="mt-12 text-left font-mono text-xs uppercase tracking-wide text-foreground/50">
      matrix node{" "}
      <span className={node ? "text-accent" : undefined}>
        {node ? `[${node.row},${node.col}]` : "[–,–]"}
      </span>
    </p>
  );
}
