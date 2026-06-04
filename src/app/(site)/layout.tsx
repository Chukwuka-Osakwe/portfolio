import { ViewSwitcher } from "@/components/ViewSwitcher";
import { CaseToc } from "@/components/CaseToc";
import { ViewProvider } from "@/components/ViewContext";
import { NavMenu } from "@/components/NavMenu";
import { ThemeToggle } from "@/components/ThemeToggle";

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
          {/* Weighted-cell grid (lg+): three vertical-centered content cells
              separated by two auto-height accent rules. Ratios 7fr / 10fr / 3fr
              = 35% identity · 50% menu · 15% toggle. Menu stays the densest
              cell (it needs the most room); identity gets generous breathing
              room around the 16px hero; toggle (a single ~40px segmented
              control) fits comfortably even in 15% of the panel. Below lg
              the grid doesn't activate — content flows naturally with the
              existing mt-* spacing. */}
          <div className="text-center lg:sticky lg:top-8 lg:mx-auto lg:grid lg:h-[calc(100dvh-2rem)] lg:max-w-[28rem] lg:grid-rows-[7fr_auto_10fr_auto_3fr] lg:px-8">

            {/* CELL 1 — IDENTITY: logo + hero, centered in the upper cell. */}
            <div className="lg:flex lg:flex-col lg:justify-center">
              <div className="mt-4 flex items-center justify-center gap-4 lg:mt-0">
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
                  className="whitespace-nowrap text-[clamp(1rem,3vw,1.125rem)] text-text-muted"
                  style={{ fontFamily: "var(--font-nico-moji)" }}
                >
                  chukwuka's matrix
                </p>
              </div>

              {/* Hero — both sentences merged into one left-aligned 14px block.
                  Quiet on purpose; presence comes from the surroundings, not
                  the type size. Specifically:
                  • leading-relaxed (1.625) gives line-internal breathing room
                  • tracking-tight dropped — a headline treatment, pinches at
                    body sizes
                  • the cell itself is the largest slice (7fr — see grid above)
                    so the small block sits in a generous frame
                  • explicit <br/> after "systems-oriented" forces an intentional
                    wrap point (the natural break landed orphans on the line
                    before); the section uses the full cell width so the line
                    is wide enough to fit "hello, i'm chukwuka, a systems-
                    oriented" before breaking
                  Mobile unconstrained. */}
              <section className="mt-4 text-left">
                <h1 className="text-sm font-medium leading-relaxed text-pretty">
                  hello, i&apos;m chukwuka, a&#160;systems&#8209;oriented
                  <br />
                  designer building thoughtful interfaces for complex products.
                  i design products end to end — and i write about the decisions
                  behind them (sometimes).
                </h1>
              </section>
            </div>

            {/* RULE 1 — boundary between identity and menu cells.
                lg:-mx-8 cancels the wrapper's px-8 so the line spans the
                navbar's full width while cell content stays inset 32px. */}
            <div className="mt-12 h-1 bg-background lg:mt-0 lg:-mx-8" aria-hidden />

            {/* CELL 2 — MENU, centered in the middle (10fr) cell. */}
            <div className="lg:flex lg:flex-col lg:justify-center">
              <NavMenu />
            </div>

            {/* RULE 2 — boundary between menu and toggle cells (mirror of #1). */}
            <div className="mt-12 h-1 bg-background lg:mt-0 lg:-mx-8" aria-hidden />

            {/* CELL 3 — THEME TOGGLE, centered in the lower cell. */}
            <div className="mt-12 lg:mt-0 lg:flex lg:flex-col lg:justify-center">
              <ThemeToggle />
            </div>
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
            <CaseToc />
          </div>
        </div>
      </div>
    </ViewProvider>
  );
}
