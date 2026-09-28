/* ChipMango gallery — the "lookbook" brand-entry view, graduated from
 * /wireframe/gallery into the live site (S38). A contained column of image
 * frames (full rows + matched 2-up pairs) beside a sticky right rail carrying
 * the project title / tags / description. Rows are separated by spacing only
 * (no headings) — the section gap is the divider.
 *
 * Server component: pure presentation, no state (the wireframe's live dials +
 * theme-hijack are gone — a live page must respect the visitor's theme). Frame
 * aspects match each asset's NATIVE ratio so object-cover never crops.
 *
 * Lives INSIDE the (site) shell, so it wears SiteTopBar and gets the persistent-
 * shell transition. It breaks out to full-bleed (the shell caps content at
 * --content-w = 49rem) and re-centers at its own 65rem, and its sticky rail is
 * offset by --bar-h so it parks below the top bar. When a second gallery entry
 * appears, extract the template + drive the data from frontmatter.
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
  src: string;
  alt: string;
}

const A = (n: string) => `/design/chipmango/${n}.webp`;
const CM = {
  hero: A("hero"),
  motif: A("motif-grid"),
  typeSpec: A("type-specimen"),
  palette: A("palette"),
  paletteGrad: A("palette-gradient"),
  motifWordmark: A("motif-wordmark"),
  wordmark: A("wordmark"),
  brandFuture: A("brand-future"),
  cardUni: A("card-universities"),
  cardBiz: A("card-businesses"),
  cardWhy: A("card-whyjoin"),
  card300: A("card-300"),
  components: A("components"),
  wmGradOlive: A("wordmark-grad-olive"),
  wmGradEmber: A("wordmark-grad-ember"),
  talkGradOlive: A("talk-grad-olive"),
  talkGradEmber: A("talk-grad-ember"),
  overviewDesk: A("overview-desk"),
  talkPodium: A("talk-podium"),
  motifIpadGrid: A("motif-ipad-grid"),
  motifIpadMark: A("motif-ipad-mark"),
  mangoRipe: A("mango-ripe"),
  mangoTree: A("mango-tree"),
  onTheMoveEmber: A("on-the-move-ember"),
  onTheMoveOlive: A("on-the-move-olive"),
};

type Row =
  | { span: "full"; block: Block }
  | { span: "half"; blocks: [Block, Block] };

const AR = {
  hero: "16 / 10",
  typeSpec: "1600 / 1397",
  motif: "20 / 17",
  wordmark: "1600 / 1284",
  components: "200 / 157",
  sq: "1 / 1",
} as const;

// Sections mirror the paper-canvas grouping. No headings — a larger vertical gap
// between sections is the only divider. A 2-up pairs only matched sets.
const SECTIONS: Row[][] = [
  // 01 — Overview.
  [
    { span: "full", block: { kind: "render", aspect: AR.hero, src: CM.hero, alt: "ChipMango website hero — the chip-sun render" } },
    { span: "full", block: { kind: "image", aspect: "1042 / 1298", src: CM.overviewDesk, alt: "The ChipMango hero on a MacBook, on a desk" } },
  ],
  // Colour — palette, the palette sourced from real fruit (ripe = warm, tree =
  // olive), then gradient fields.
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
  // Motif & Logo.
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
    {
      span: "half",
      blocks: [
        { kind: "big-type", aspect: AR.sq, src: CM.onTheMoveEmber, alt: "On the move — for Africa's future (ember)" },
        { kind: "big-type", aspect: AR.sq, src: CM.onTheMoveOlive, alt: "On the move — for Africa's future (olive)" },
      ],
    },
  ],
  // CTA — Talk to MangoAI.
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

// Baked layout values (were live dials in the wireframe; tuned by eye).
const MAX_W = 65; // rem — contained wrapper (asset column + rail)
const RAIL_W = 16; // rem — sticky rail width
const RAIL_GAP = 96; // px — gap between asset column and rail (lg+)
const SECT_GAP = 200; // px — gap between sections (the only section marker)
const ROW_GAP = 48; // px — rhythm between rows within a section
const GUTTER = 48; // px — gap between the two halves of a 2-up
const RING_W = 4; // px — frame ring width (box-shadow spread)
const RING_PCT = 20; // % — frame ring strength (of --foreground; inverts per theme)

export function Gallery() {
  return (
    // Outermost view-enter wrapper — identical to every other detail view
    // (ProjectsExplorer / LabDetail / essays), so the gallery fades + rises in on
    // open exactly like the rest. Inside it: the full-bleed break-out of the
    // shell's --content-w cap (100vw box re-centered on the symmetric layout;
    // relies on body { overflow-x: clip }), then the gallery re-centered at
    // MAX_W. view-in animates transform, but it lives on this plain wrapper, so
    // it never touches the break-out's own -translate-x.
    <div className="view-enter">
      <div className="relative left-1/2 w-screen -translate-x-1/2">
        <div
          className="mx-auto grid w-full grid-cols-1 px-6 lg:grid-cols-[1fr_var(--rail)]"
          style={{
            maxWidth: `${MAX_W}rem`,
            ["--rail" as string]: `${RAIL_W}rem`,
            columnGap: RAIL_GAP,
          }}
        >
        {/* Sticky rail — title, tags, description. Parks below SiteTopBar
            (top = --bar-h) and fills the remaining viewport height, vertically
            centering its content. A normal top block on mobile. */}
        <aside className="lg:order-2 lg:sticky lg:top-[var(--bar-h)] lg:h-[calc(100dvh-var(--bar-h))] lg:self-start">
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

        {/* Asset column — sections separated by SECT_GAP; rows within by ROW_GAP. */}
        <main className="flex flex-col pb-8 lg:order-1" style={{ rowGap: SECT_GAP }}>
          {SECTIONS.map((section, si) => (
            <section key={si} className="flex flex-col" style={{ rowGap: ROW_GAP }}>
              {section.map((row, i) =>
                row.span === "full" ? (
                  <BlockBox key={i} block={row.block} eager={si === 0 && i === 0} />
                ) : (
                  <div
                    key={i}
                    className="grid grid-cols-1 sm:grid-cols-2"
                    style={{ columnGap: GUTTER, rowGap: GUTTER }}
                  >
                    <BlockBox block={row.blocks[0]} />
                    <BlockBox block={row.blocks[1]} />
                  </div>
                )
              )}
            </section>
          ))}
        </main>
        </div>
      </div>
    </div>
  );
}

/** A square-cornered, overflow-clipped image frame on the page ground. The ring
 *  is foreground-based so it reads on both light and dark grounds. */
function BlockBox({ block, eager = false }: { block: Block; eager?: boolean }) {
  return (
    <div
      className="relative overflow-hidden"
      style={{
        aspectRatio: block.aspect,
        boxShadow: `0 0 0 ${RING_W}px color-mix(in srgb, var(--foreground) ${RING_PCT}%, transparent), 0 1px 2px color-mix(in srgb, var(--foreground) 8%, transparent)`,
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={block.src}
        alt={block.alt}
        loading={eager ? "eager" : "lazy"}
        decoding="async"
        className="absolute inset-0 h-full w-full object-cover"
      />
    </div>
  );
}
