import { ViewSwitcher } from "@/components/ViewSwitcher";
import { ViewProvider } from "@/components/ViewContext";
import { NavMenu } from "@/components/NavMenu";

/**
 * Shared site shell for all views (projects · product-ideas · contact). The
 * nav/hero panel + bottom switcher live here and persist across client-side
 * route changes; only the viewspace ({children}) swaps. Each view is its own
 * route, so the server sends the correct HTML per URL — no client-side view
 * flash. ViewProvider supplies the small cross-tree UI state (hover coordinate,
 * open-detail flag) the chrome + projects grid share.
 */
export default function SiteLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ViewProvider>
      {/* Two-column layout (desktop): [viewspace · navbar].
          - Track 1 (minmax(0,1fr)): the viewspace — fills all width that isn't
            the navbar. Its content (cards / carousel / detail) is capped to
            --content-w and centered, so it stays a constant, readable width and
            surplus width becomes balanced margin. (min 0 lets it shrink.)
          - Track 2 (var(--nav-w)): the white identity panel — a fixed, dial-able
            width that bleeds to the right viewport edge on its own. */}
      <div className="grid grid-cols-1 gap-x-8 gap-y-12 px-6 pb-24 pt-8 lg:min-h-dvh lg:grid-cols-[minmax(0,1fr)_var(--nav-w)] lg:px-0">
        {/* Identity panel: nav + hero. First in DOM so it stacks on top on
            mobile; moved to the right (col 2) on desktop. The negative top/bottom
            margins cancel the grid's pt-8/pb-24 so the white fills to the screen
            edges; the nav/hero pins via the inner sticky wrapper. */}
        <aside className="bg-nav-fill lg:col-start-2 lg:row-start-1 lg:-mb-24 lg:-mt-8 lg:pt-8">
          <div className="text-center lg:sticky lg:top-8 lg:mx-auto lg:max-w-[28rem] lg:px-8">
            {/* Nav */}
            <div className="mt-4 flex items-center justify-center gap-4">
              <span
                role="img"
                aria-label="chukwuka's matrix logo"
                className="block h-5 w-6 shrink-0 bg-accent"
                style={{
                  maskImage: "url(/portfolio-logo.png)",
                  WebkitMaskImage: "url(/portfolio-logo.png)",
                  maskSize: "contain",
                  WebkitMaskSize: "contain",
                  maskRepeat: "no-repeat",
                  WebkitMaskRepeat: "no-repeat",
                  maskPosition: "center",
                  WebkitMaskPosition: "center",
                }}
              />
              <p
                className="whitespace-nowrap text-[clamp(1rem,3vw,1.125rem)]"
                style={{ fontFamily: "var(--font-nico-moji)" }}
              >
                chukwuka's matrix
              </p>
            </div>

            {/* Hero — both sentences merged into one left-aligned 14px block */}
            <section className="mt-4 text-left">
              <h1 className="text-sm font-normal tracking-tight text-pretty lowercase">
                Hello, I&apos;m Chukwuka, a systems-oriented{" "}
                {/* DEMO: .accent-fill marker highlight (was text-accent). */}
                <span className="accent-fill">designer</span> building thoughtful
                interfaces for complex products. I design products end to end —
                and I write about the decisions behind them (sometimes).
              </h1>
              {/* DRAFT — alternate hero voice from the Notion "about" page, kept
                  for future consideration (see SESSION_NOTES). Coloured indigo to
                  mark it as provisional, NOT the live line. Remove or promote. */}
              <p className="mt-4 text-sm font-normal tracking-tight text-pretty lowercase text-[#4f46e5]">
                I&apos;m an armchair philosopher at heart, cosplaying as a product
                designer. In love with gradients.
              </p>
            </section>

            {/* 4px accent rule between the text and the menu. lg:-mx-8 cancels the
                wrapper's px-8 so the line spans the navbar's full width while the
                text and buttons stay inset 32px from its edges. */}
            <div className="mt-12 h-1 bg-accent lg:-mx-8" aria-hidden />

            {/* Things I do */}
            <NavMenu />

            {/* 4px accent rule 32px below the menu (mirrors the one above it). */}
            <div className="mt-12 h-1 bg-accent lg:-mx-8" aria-hidden />
          </div>
        </aside>

        {/* Viewspace — fills track 1; its content is capped to --content-w and
            centered, so each view shares one constant, centered width. */}
        <section className="lg:col-start-1 lg:row-start-1">
          <div className="mx-auto w-full max-w-[var(--content-w)]">{children}</div>
        </section>
      </div>

      {/* Floating view switcher — fixed near the bottom of the viewport,
          aligned under the viewspace by mirroring the page grid's tracks. Must
          stay in sync with the grid-cols above. pointer-events-none so only the
          pill is interactive. */}
      <div className="pointer-events-none fixed inset-x-0 bottom-6 z-20">
        <div className="grid grid-cols-1 gap-x-8 px-6 lg:grid-cols-[minmax(0,1fr)_var(--nav-w)] lg:px-0">
          <div className="flex justify-center lg:col-start-1">
            <ViewSwitcher />
          </div>
        </div>
      </div>
    </ViewProvider>
  );
}
