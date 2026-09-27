"use client";

import { useEffect, useState } from "react";

/* ------------------------------------------------------------------ model --
 * Opsis grammar (kargul.studio/work/opsis-partners): a centered, contained
 * column of big ROUNDED frames on a clean ground — mostly 1-up, occasional
 * 2-up — under an Overview/Challenge/Outcome preamble. No full-bleed, no rail.
 *
 * Made-assets-only: the systematic surfaces Chukwuka actually owns (systems,
 * type, UI, renders). The brand-in-the-world photography/device mockups are
 * cut — that art-direction layer isn't the story we're leading with.
 */
type Kind =
  | "render"
  | "image"
  | "motif"
  | "type-specimen"
  | "palette"
  | "wordmark"
  | "stat"
  | "product-ui"
  | "collateral"
  | "big-type";

interface Block {
  kind: Kind;
  /** CSS aspect-ratio for the frame box, e.g. "16 / 9". Drives the rhythm. */
  aspect: string;
  /** Real asset src. Omit for a placeholder (renders a dashed pending box). */
  src?: string;
  /** Alt text for the frame (a11y — this is heading toward a live page). */
  alt?: string;
  /** Label — a placeholder's caption, or an optional corner label on an image. */
  label?: string;
}

// Real ChipMango assets (WebP-optimised into public/wireframe/chipmango).
// Made surfaces only — the photography/device-mockup batch is intentionally
// absent (billboard, business-card, desk-dell, ipad-*, macbook, mango).
const A = (n: string) => `/wireframe/chipmango/${n}.webp`;
const CM = {
  hero: A("hero"), // chip-sun landing render
  motif: A("motif-grid"), // sun-chip gradient grid
  typeSpec: A("type-specimen"), // Martian Mono / Onest specimen
  palette: A("palette"), // colour swatch grid
  paletteGrad: A("palette-gradient"), // gradient fields
  motifWordmark: A("motif-wordmark"), // motif + wordmark studies
  wordmark: A("wordmark"), // wordmark on molten marble
  brandFuture: A("brand-future"), // "A brand for the future…"
  cardUni: A("card-universities"), // social card
  cardBiz: A("card-businesses"), // social card
  cardWhy: A("card-whyjoin"), // social card
  card300: A("card-300"), // "Taking AI…/300+" stat card
  components: A("components"), // buttons + mission/vision UI
  wmGradOlive: A("wordmark-grad-olive"), // wordmark in vertical gradient
  wmGradEmber: A("wordmark-grad-ember"),
  talkGradOlive: A("talk-grad-olive"), // button in vertical gradient
  talkGradEmber: A("talk-grad-ember"),
  overviewDesk: A("overview-desk"), // hero on a MacBook, on a desk (device mockup)
  talkPodium: A("talk-podium"), // "Talk to MangoAI" on an iPad, on a dark podium
  motifIpadGrid: A("motif-ipad-grid"), // motif grid on an iPad, on fabric + wood
  motifIpadMark: A("motif-ipad-mark"), // single chip mark on an iPad, on fabric + wood
  mangoRipe: A("mango-ripe"), // ripe orange mangoes at market (the warm palette, sourced)
  mangoTree: A("mango-tree"), // green mangoes on the tree (the olive palette, sourced)
  onTheMoveEmber: A("on-the-move-ember"), // "On the move / For Africa's future" — ember
  onTheMoveOlive: A("on-the-move-olive"), // "On the move / For Africa's future" — olive
};

type Row =
  | { span: "full"; block: Block }
  | { span: "half"; blocks: [Block, Block] };

// Frame aspects match each asset's NATIVE ratio so object-cover never crops.
// The landscape-ish assets (1.15–1.6) carry the 1-up rows at their true shape;
// the truly-square (1:1) assets pair into 2-up bands (equal aspect = aligned
// bottoms). `portrait` is the placeholder shape for the campaign frames.
const AR = {
  hero: "16 / 10", // 1.600
  typeSpec: "1600 / 1397", // 1.145
  motif: "20 / 17", // 1.176
  wordmark: "1600 / 1284", // 1.246
  components: "200 / 157", // 1.274 (1600×1256)
  sq: "1 / 1",
  portrait: "4 / 5", // placeholder shape for the "On the move" campaign frames
} as const;

// Sections mirror the paper canvas grouping. No headings — each section is a
// group of rows, separated on the page purely by a larger vertical gap. A 2-up
// pairs only matched sets; standalone assets take their own full-width line.
// Blocks without a `src` render as dashed placeholders (assets not made yet).
const SECTIONS: Row[][] = [
  // 01 — Overview.
  [
    { span: "full", block: { kind: "render", aspect: AR.hero, src: CM.hero, alt: "ChipMango website hero — the chip-sun render" } },
    { span: "full", block: { kind: "image", aspect: "1042 / 1298", src: CM.overviewDesk, alt: "The ChipMango hero on a MacBook, on a desk" } },
  ],

  // Colour — palette, then the palette sourced from the real fruit (ripe = warm,
  // tree = olive), then the gradient fields. Only the mango pair is a 2-up.
  [
    { span: "full", block: { kind: "palette", aspect: AR.sq, src: CM.palette, alt: "Colour palette swatches" } },
    {
      span: "half",
      blocks: [
        { kind: "image", aspect: "3 / 4", src: CM.mangoRipe, alt: "Ripe orange mangoes at market — the warm palette" },
        { kind: "image", aspect: "3 / 4", src: CM.mangoTree, alt: "Green mangoes on the tree — the olive palette" },
      ],
    },
    { span: "full", block: { kind: "palette", aspect: AR.sq, src: CM.paletteGrad, alt: "Gradient colour fields" } },
  ],

  // Motif & Logo (+ the wordmark-gradient pair, per the reorg).
  [
    { span: "full", block: { kind: "motif", aspect: AR.motif, src: CM.motif, alt: "Sun-chip motif grid" } },
    { span: "full", block: { kind: "motif", aspect: AR.sq, src: CM.motifWordmark, alt: "Mark studies — motif and wordmark" } },
    { span: "full", block: { kind: "wordmark", aspect: AR.wordmark, src: CM.wordmark, alt: "ChipMango wordmark on molten marble" } },
    {
      span: "half",
      blocks: [
        { kind: "wordmark", aspect: AR.sq, src: CM.wmGradEmber, alt: "Wordmark in an ember gradient" },
        { kind: "wordmark", aspect: AR.sq, src: CM.wmGradOlive, alt: "Wordmark in an olive gradient" },
      ],
    },
    // Closers — the motif applied on an iPad, in a room (matched fabric/wood pair).
    {
      span: "half",
      blocks: [
        { kind: "image", aspect: "4 / 3", src: CM.motifIpadGrid, alt: "Motif grid on an iPad, on textured fabric and wood" },
        { kind: "image", aspect: "4 / 3", src: CM.motifIpadMark, alt: "Chip mark on an iPad, on textured fabric and wood" },
      ],
    },
  ],

  // 02 — Typography / Messaging.
  [
    { span: "full", block: { kind: "type-specimen", aspect: AR.typeSpec, src: CM.typeSpec, alt: "Type specimen — Martian Mono and Onest" } },
    {
      span: "half",
      blocks: [
        { kind: "collateral", aspect: AR.sq, src: CM.cardUni, alt: "Social card — For Universities" },
        { kind: "collateral", aspect: AR.sq, src: CM.cardBiz, alt: "Social card — For Businesses" },
      ],
    },
    {
      span: "half",
      blocks: [
        { kind: "collateral", aspect: AR.sq, src: CM.cardWhy, alt: "Social card — Why join the future?" },
        { kind: "stat", aspect: AR.sq, src: CM.card300, alt: "Stat card — 300+" },
      ],
    },
    { span: "full", block: { kind: "big-type", aspect: AR.sq, src: CM.brandFuture, alt: "A brand for the future of microchip design" } },
    // "On the move / For Africa's future" — the campaign pair (ember + olive).
    {
      span: "half",
      blocks: [
        { kind: "big-type", aspect: AR.sq, src: CM.onTheMoveEmber, alt: "On the move — for Africa's future (ember)" },
        { kind: "big-type", aspect: AR.sq, src: CM.onTheMoveOlive, alt: "On the move — for Africa's future (olive)" },
      ],
    },
  ],

  // CTA — Talk to MangoAI (gradient buttons, then the podium mockup).
  [
    {
      span: "half",
      blocks: [
        { kind: "product-ui", aspect: AR.sq, src: CM.talkGradEmber, alt: "Talk to MangoAI — button in an ember gradient" },
        { kind: "product-ui", aspect: AR.sq, src: CM.talkGradOlive, alt: "Talk to MangoAI — button in an olive gradient" },
      ],
    },
    { span: "full", block: { kind: "image", aspect: "4 / 3", src: CM.talkPodium, alt: "Talk to MangoAI on an iPad, on a dark podium" } },
  ],

  // 04 — Components.
  [{ span: "full", block: { kind: "product-ui", aspect: AR.components, src: CM.components, alt: "UI components — buttons, mission and vision" } }],
];

const MONO = { fontFamily: "var(--font-geist-mono)" } as const;

const DEFAULTS = {
  maxW: 65, // contained wrapper width (rem) — holds asset column + right rail
  railW: 16, // sticky rail width (rem)
  railGap: 96, // gap between the asset column and the right rail (px, lg+ only)
  rowGap: 48, // vertical rhythm between rows within a section (px)
  sectGap: 200, // vertical gap between sections (px) — the only section marker
  gutter: 48, // gap between the two halves of a 2-up (px)
  ringW: 4, // frame ring width (px, box-shadow spread)
  ringPct: 20, // frame ring strength (% of --foreground) — inverts per theme
  labels: false, // corner labels (frames are bare)
};

export function GalleryWireframe() {
  const [maxW, setMaxW] = useState(DEFAULTS.maxW);
  const [railW, setRailW] = useState(DEFAULTS.railW);
  const [railGap, setRailGap] = useState(DEFAULTS.railGap);
  const [rowGap, setRowGap] = useState(DEFAULTS.rowGap);
  const [sectGap, setSectGap] = useState(DEFAULTS.sectGap);
  const [gutter, setGutter] = useState(DEFAULTS.gutter);
  const [ringW, setRingW] = useState(DEFAULTS.ringW);
  const [ringPct, setRingPct] = useState(DEFAULTS.ringPct);
  const [labels, setLabels] = useState(DEFAULTS.labels);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  const [winW, setWinW] = useState(0);
  useEffect(() => {
    const onResize = () => setWinW(window.innerWidth);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Drive the page theme from the `theme` dial so both grounds can be previewed
  // in one sitting (default light — the cream field the frames were tuned on).
  // Capture the site's prior theme on mount and restore it on unmount so this
  // preview doesn't hijack the rest of the site.
  useEffect(() => {
    const html = document.documentElement;
    const prev = html.getAttribute("data-theme");
    return () => {
      if (prev) html.setAttribute("data-theme", prev);
      else html.removeAttribute("data-theme");
    };
  }, []);
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const reset = () => {
    setMaxW(DEFAULTS.maxW);
    setRailW(DEFAULTS.railW);
    setRailGap(DEFAULTS.railGap);
    setRowGap(DEFAULTS.rowGap);
    setSectGap(DEFAULTS.sectGap);
    setGutter(DEFAULTS.gutter);
    setRingW(DEFAULTS.ringW);
    setRingPct(DEFAULTS.ringPct);
    setLabels(DEFAULTS.labels);
  };

  return (
    <div className="min-h-dvh">
      {/* Contained wrapper (no full-bleed) holding the asset column + a sticky
          right rail. On mobile the rail is a normal top block; sticky at lg. */}
      <div
        className="mx-auto grid w-full grid-cols-1 px-6 lg:grid-cols-[1fr_var(--rail)]"
        style={{
          maxWidth: `${maxW}rem`,
          ["--rail" as string]: `${railW}rem`,
          // columnGap has no visual effect on the single-column mobile layout;
          // it only opens up once the rail column appears at lg.
          columnGap: railGap,
        }}
      >
        {/* Sticky rail — project title, tags, description. Vertically centered. */}
        <aside className="pt-8 lg:order-2 lg:sticky lg:top-0 lg:h-dvh lg:self-start lg:pt-10">
          <div className="flex h-full flex-col lg:justify-center">
            <div>
              <div className="text-base font-medium">ChipMango</div>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="border border-accent/40 px-2 py-1 text-xs text-accent">
                  Self-initiated
                </span>
                {["Visual Identity", "Art Direction", "Web Design"].map((t) => (
                  <span
                    key={t}
                    className="bg-black/[0.05] px-2 py-1 text-xs text-foreground/60 dark:bg-white/[0.06]"
                  >
                    {t}
                  </span>
                ))}
              </div>
              <p className="mt-6 max-w-[22rem] text-sm leading-relaxed text-foreground/60">
                A brand exploration for ChipMango — a Nigerian microchip-design
                startup making semiconductor and edge-AI education accessible
                across Africa. Identity, type system, and web direction, briefed
                and built end-to-end.
              </p>
            </div>
          </div>
        </aside>

        {/* The asset column — sections separated by the larger sectGap; rows
            within a section by rowGap. No headings: spacing is the divider. */}
        <main
          className="flex flex-col pb-28 pt-8 lg:order-1 lg:pt-10"
          style={{ rowGap: sectGap }}
        >
          {SECTIONS.map((section, si) => (
            <section key={si} className="flex flex-col" style={{ rowGap }}>
              {section.map((row, i) =>
                row.span === "full" ? (
                  <BlockBox key={i} block={row.block} showLabel={labels} ringW={ringW} ringPct={ringPct} />
                ) : (
                  <div
                    key={i}
                    className="grid grid-cols-1 sm:grid-cols-2"
                    style={{ columnGap: gutter, rowGap: gutter }}
                  >
                    <BlockBox block={row.blocks[0]} showLabel={labels} ringW={ringW} ringPct={ringPct} />
                    <BlockBox block={row.blocks[1]} showLabel={labels} ringW={ringW} ringPct={ringPct} />
                  </div>
                )
              )}
            </section>
          ))}
        </main>
      </div>

      {/* Live dial — parked. Uncomment to tune by eye again.
      <DialPanel
        maxW={maxW}
        setMaxW={setMaxW}
        railW={railW}
        setRailW={setRailW}
        railGap={railGap}
        setRailGap={setRailGap}
        rowGap={rowGap}
        setRowGap={setRowGap}
        sectGap={sectGap}
        setSectGap={setSectGap}
        gutter={gutter}
        setGutter={setGutter}
        ringW={ringW}
        setRingW={setRingW}
        ringPct={ringPct}
        setRingPct={setRingPct}
        labels={labels}
        setLabels={setLabels}
        theme={theme}
        setTheme={setTheme}
        winW={winW}
        reset={reset}
      /> */}
    </div>
  );
}

/* ----------------------------------------------------------------- a frame --
 * A square-cornered (border-radius:0, house default), overflow-clipped image
 * frame on the page ground. A block without a `src` renders as a dashed
 * placeholder announcing the pending asset (no ring). */
function BlockBox({
  block,
  showLabel,
  ringW,
  ringPct,
}: {
  block: Block;
  showLabel: boolean;
  ringW: number;
  ringPct: number;
}) {
  if (!block.src) {
    return (
      <div
        className="relative flex items-center justify-center overflow-hidden"
        style={{
          aspectRatio: block.aspect,
          border: "1px dashed color-mix(in srgb, var(--foreground) 30%, transparent)",
          color: "color-mix(in srgb, var(--foreground) 55%, transparent)",
        }}
      >
        <span className="px-3 text-center text-[11px] tracking-tight" style={MONO}>
          {block.label ?? "asset"}
          <span className="opacity-50"> · placeholder</span>
        </span>
      </div>
    );
  }
  return (
    <div
      className="relative overflow-hidden"
      style={{
        aspectRatio: block.aspect,
        // Foreground-based ring so it stays visible on BOTH grounds: --foreground
        // inverts per theme, so one strength reads as a dark line on light and a
        // light line on dark. Width (spread) + strength (% foreground) are dialed.
        boxShadow: `0 0 0 ${ringW}px color-mix(in srgb, var(--foreground) ${ringPct}%, transparent), 0 1px 2px color-mix(in srgb, var(--foreground) 8%, transparent)`,
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={block.src} alt={block.alt ?? ""} className="absolute inset-0 h-full w-full object-cover" />
      {showLabel && block.label && (
        <span
          className="absolute left-3 top-3 z-10 text-[11px] tracking-tight text-white/90"
          style={MONO}
        >
          {block.label}
        </span>
      )}
    </div>
  );
}

/* ------------------------------------------------------------- dial panel --- */
function DialPanel(props: {
  maxW: number;
  setMaxW: (n: number) => void;
  railW: number;
  setRailW: (n: number) => void;
  railGap: number;
  setRailGap: (n: number) => void;
  rowGap: number;
  setRowGap: (n: number) => void;
  sectGap: number;
  setSectGap: (n: number) => void;
  gutter: number;
  setGutter: (n: number) => void;
  ringW: number;
  setRingW: (n: number) => void;
  ringPct: number;
  setRingPct: (n: number) => void;
  labels: boolean;
  setLabels: (b: boolean) => void;
  theme: "light" | "dark";
  setTheme: (t: "light" | "dark") => void;
  winW: number;
  reset: () => void;
}) {
  return (
    <div
      className="fixed bottom-4 right-4 z-50 w-72 border border-border/60 bg-nav-fill/85 p-3 text-xs text-foreground/80 shadow-lg backdrop-blur"
      style={MONO}
    >
      <div className="mb-2 flex items-center justify-between">
        <span className="font-medium">gallery dials</span>
        <button onClick={props.reset} className="text-foreground/50 hover:text-foreground">
          reset
        </button>
      </div>
      <Slider label="max w" value={props.maxW} min={60} max={88} unit="rem" onChange={props.setMaxW} />
      <Slider label="rail w" value={props.railW} min={10} max={22} unit="rem" onChange={props.setRailW} />
      <Slider label="rail gap" value={props.railGap} min={0} max={96} unit="px" onChange={props.setRailGap} />
      <Slider label="row gap" value={props.rowGap} min={0} max={80} unit="px" onChange={props.setRowGap} />
      <Slider label="sect gap" value={props.sectGap} min={0} max={240} unit="px" onChange={props.setSectGap} />
      <Slider label="gutter" value={props.gutter} min={0} max={48} unit="px" onChange={props.setGutter} />
      <Slider label="ring w" value={props.ringW} min={0} max={12} unit="px" onChange={props.setRingW} />
      <Slider label="ring %" value={props.ringPct} min={0} max={40} unit="%" onChange={props.setRingPct} />
      <div className="mt-2 flex gap-3">
        <Toggle label="labels" on={props.labels} onClick={() => props.setLabels(!props.labels)} />
        <button
          onClick={() => props.setTheme(props.theme === "dark" ? "light" : "dark")}
          className="flex-1 border border-border/60 px-2 py-1"
          style={{
            background: props.theme === "dark" ? "var(--accent)" : "transparent",
            color: props.theme === "dark" ? "#fff" : undefined,
          }}
        >
          mode · {props.theme}
        </button>
      </div>
      <div className="mt-2 border-t border-border/50 pt-2 text-[11px] text-foreground/50">
        {props.winW}px · {props.winW >= 640 ? "contained" : "stacked (mobile)"}
      </div>
    </div>
  );
}

function Slider({
  label,
  value,
  min,
  max,
  unit,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  unit: string;
  onChange: (n: number) => void;
}) {
  return (
    <label className="mb-1.5 flex items-center gap-2">
      <span className="w-16 shrink-0 whitespace-nowrap text-foreground/60">{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(+e.target.value)}
        className="h-1 min-w-0 flex-1 accent-accent"
      />
      <span className="w-14 shrink-0 whitespace-nowrap text-right tabular-nums">
        {value}
        {unit}
      </span>
    </label>
  );
}

function Toggle({ label, on, onClick }: { label: string; on: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex-1 border border-border/60 px-2 py-1"
      style={{ background: on ? "var(--accent)" : "transparent", color: on ? "#fff" : undefined }}
    >
      {label} {on ? "on" : "off"}
    </button>
  );
}
