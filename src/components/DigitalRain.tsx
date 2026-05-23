"use client";

import { useEffect, useRef } from "react";

/**
 * TEMP "digital rain" backdrop for the whole nav panel (Matrix homage; the site
 * is "chukwuka's matrix"). Renders as an `absolute inset-0` canvas behind the
 * panel content (the parent `<aside>` is `relative`); content sits on `z-10`.
 * Canvas-based, FPS-capped, respects `prefers-reduced-motion` (single static
 * frame, no loop). `lg`-only.
 *
 * Explicitly temporary — to be replaced before the site goes live (panel content
 * is still TBD; see SESSION_NOTES / DESIGN). The MatrixReadout coordinate gag is
 * parked, not deleted.
 */
const GLYPHS = "アイウエオカキクケコサシスセソタチツテトナニヌネノ0123456789".split("");
const FONT = 14; // px glyph size
const FPS = 24; // capped for perf

export function DigitalRain() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const css = getComputedStyle(canvas);
    const accent = css.getPropertyValue("--accent").trim() || "#fb370a";
    const bg = css.getPropertyValue("--foreground").trim() || "#120e11";

    let cols = 0;
    let drops: number[] = [];

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const { clientWidth: w, clientHeight: h } = canvas;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cols = Math.ceil(w / FONT);
      drops = Array.from({ length: cols }, () =>
        Math.floor((Math.random() * h) / FONT),
      );
      ctx.fillStyle = bg; // opaque base
      ctx.fillRect(0, 0, w, h);
    };

    const draw = () => {
      const { clientWidth: w, clientHeight: h } = canvas;
      ctx.fillStyle = `${bg}22`; // ~13% bg over each frame → trailing fade
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = accent;
      ctx.font = `${FONT}px monospace`;
      for (let i = 0; i < cols; i++) {
        const ch = GLYPHS[(Math.random() * GLYPHS.length) | 0];
        ctx.fillText(ch, i * FONT, drops[i] * FONT);
        if (drops[i] * FONT > h && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
      }
    };

    resize();
    window.addEventListener("resize", resize);

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      draw(); // single static frame, no animation
      return () => window.removeEventListener("resize", resize);
    }

    let raf = 0;
    let last = 0;
    const interval = 1000 / FPS;
    const loop = (t: number) => {
      raf = requestAnimationFrame(loop);
      if (t - last < interval) return;
      last = t;
      draw();
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none absolute inset-0 z-0 hidden h-full w-full bg-foreground lg:block"
    />
  );
}
