import Link from "next/link";

/**
 * The identity block: logo + brand text + hero copy. A reusable unit so
 * the desktop nav-panel aside and the mobile bottom-sheet can render the
 * same identity surface without duplication.
 *
 * Renders its own internal vertical rhythm (mt-4 between logo-row and hero
 * text; mt-4 lg:mt-0 between component-top and logo-row to handle mobile
 * cell-top spacing). Callers supply their own outer container (cell
 * wrapper on desktop, sheet body on mobile).
 *
 * The text-pretty + text-center mobile / text-left desktop alignment and
 * the `<br className="hidden lg:inline" />` desktop-only wrap point live
 * here — see the layout's hero comment for the full rationale.
 */
export function HeroBlock() {
  return (
    <>
      {/* Logo + brand row — link to home. CSS-mask logo tracks --accent
          automatically. The `mt-4` is cell-top spacing on mobile; lg cell
          uses justify-center on its wrapper so we cancel to mt-0 on lg.
          `flex w-fit mx-auto` (not `inline-flex mx-auto`): block-level flex
          with content-width lets auto-margins center the Link in BOTH the
          desktop cell 1 flex column (where align-items: stretch would
          otherwise hijack the width) AND the mobile sheet's block body
          (where `inline-flex` was inline-level and auto-margins had no
          effect). Tap target stays brand-sized, not panel-wide. */}
      <Link
        href="/"
        aria-label="chukwuka's matrix — home"
        className="focus-ring mx-auto mt-4 flex w-fit items-center justify-center gap-4 rounded-md px-1 py-1 lg:-mt-8"
      >
        <span
          aria-hidden
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
          chukwuka&apos;s matrix
        </p>
      </Link>

      {/* Hero — both sentences merged into one block.
          • leading-relaxed for line-internal breathing
          • text-center on mobile (matches centered logo above + sheet stack);
            lg:text-left restores the deliberate left-anchor in the 28rem cell
          • <br/> after "systems-oriented" is a desktop-only wrap crutch
            (hidden lg:inline) — on mobile the natural wrap takes over.
          • The {" "} before the <br/> is REQUIRED for the mobile join: JSX
            strips whitespace between text and elements on different lines, so
            without an explicit space "oriented" and "designer" would smash
            together when the <br/> is display:none. On desktop the trailing
            space sits invisibly at line end before the forced break.
          • NBSP (&#160;) + non-breaking hyphen (&#8209;) help at every
            breakpoint — article stays tight to noun, "systems-oriented"
            never breaks mid-word */}
      <section className="mt-4 text-center lg:text-left">
        <h1 className="text-sm font-medium leading-relaxed text-pretty">
          hello, i&apos;m chukwuka, a&#160;systems&#8209;oriented{" "}
          <br className="hidden lg:inline" />
          designer building thoughtful interfaces for complex products.
          i design products end to end — and i write about the decisions
          behind them (sometimes).
        </h1>
      </section>
    </>
  );
}
