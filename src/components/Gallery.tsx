import Image from "next/image";
import Link from "next/link";
import { CardVideo } from "@/components/CardVideo";

/* Generic brand/gallery detail view — the "lookbook" template, graduated from
 * the ChipMango-only implementation (S38) into shared code once a second
 * gallery entry (Kickoff) landed (S41). A contained column of image/video
 * frames (full rows + matched 2-up pairs) beside a sticky right rail carrying
 * the project title / tags / description. Rows are separated by spacing only
 * (no headings) — the section gap is the divider.
 *
 * Server component: pure presentation, no state of its own (video autoplay +
 * reduced-motion handling lives in <CardVideo>, which is itself a client
 * component). Frame aspects should match each asset's NATIVE ratio so
 * object-cover never crops.
 *
 * Lives INSIDE the (site) shell, so it wears SiteTopBar and gets the
 * persistent-shell transition. It breaks out to full-bleed (the shell caps
 * content at --content-w = 49rem) and re-centers at its own MAX_W, and its
 * sticky rail is offset by --bar-h so it parks below the top bar.
 */

export type Kind =
  | "render"
  | "image"
  | "motif"
  | "type-specimen"
  | "palette"
  | "wordmark"
  | "stat"
  | "product-ui"
  | "collateral"
  | "big-type"
  | "video";

export interface Block {
  kind: Kind;
  /** CSS aspect-ratio for the frame box, e.g. "16 / 9". Drives the rhythm. */
  aspect: string;
  src: string;
  alt: string;
  /** Video poster frame. Only read when `kind === "video"`. */
  poster?: string;
  /** Skip Next's image optimizer and serve the source file as-is. Set for
   *  pixel-exact UI screenshots (product-ui): the optimizer re-encodes to
   *  lossy WebP (~q75), which rings high-contrast UI text — so we ship a
   *  lossless source and let the browser downsample it. Photographic brand
   *  renders (ChipMango) leave this off; they want the optimizer. */
  unoptimized?: boolean;
}

/** Inline editorial text in the content column — the one primitive the lookbook
 *  lacked (added for pensieve, S45). A "statement" is large display type (the
 *  editorial spine: a standalone line, optionally with a supporting sentence or
 *  two beneath it); a "caption" is a small muted line that sits under a sequence
 *  of frames. Lives as a Row so it can be dropped anywhere between frames —
 *  unlike GallerySection.note, which only renders above a section's rows. */
export interface TextBlock {
  variant: "statement" | "caption";
  /** The line itself. */
  body: string;
  /** Supporting sentence(s) under a statement — the 1–2 lines the brief pairs
   *  with each big statement. Ignored for captions. */
  sub?: string;
}

export type Row =
  | { span: "full"; block: Block }
  | { span: "half"; blocks: [Block, Block] }
  | { span: "text"; text: TextBlock };

export interface GallerySection {
  /** Tracked small-caps label above the section — wayfinding across a long
   *  gallery (e.g. "Squad", "Match day"). Omit for a HEADLESS section: the
   *  hero, or a wordless lookbook (ChipMango) where the gap IS the divider.
   *  Named GallerySection (not Section) to avoid colliding with content.ts's
   *  "work" | "lab" | "brand" Section discriminator. */
  heading?: string;
  /** Optional supporting line rendered under the heading — a short framing
   *  sentence for the set (e.g. what it shows / how it was made). Only renders
   *  alongside a heading. Keeps the heading itself a tight label. */
  note?: string;
  /** Row-to-row gap within this section, in px. Defaults to ROW_GAP (48). A
   *  headless single-section lookbook (pensieve) overrides this — with no
   *  section dividers, the frame-to-frame gap IS the rhythm, so it runs wider. */
  rowGap?: number;
  rows: Row[];
}

export interface GalleryMeta {
  title: string;
  /** Accent-bordered pill, e.g. "Self-initiated". Omit to skip the pill. */
  eyebrow?: string;
  /** Grey chips, e.g. ["Visual Identity", "Art Direction"]. */
  tags: string[];
  /** The lead paragraph (the entry's headline) above the first frame. Optional:
   *  omit to open the gallery image-first, so the column never opens text-then-
   *  image — a cadence a purely visual lookbook may prefer. */
  description?: string;
  /** Optionally wrap one substring of `description` in an inline link (e.g. a
   *  collaborator's name → their site). `description` itself stays plain text so
   *  it's reused verbatim as the OG/meta description (page.tsx); only the
   *  rendered lead paragraph carries the link. First match only. */
  descriptionLink?: { match: string; href: string };
  /** Outbound / related link chips in the rail — e.g. a GitHub repo, the
   *  backing essay. The lookbook template has no prose body to hang a CTA on,
   *  so for a tool-shaped entry (Aronia) whose "go use it" link IS the point,
   *  the rail carries it. External (http…) hrefs open in a new tab with a ↗;
   *  internal hrefs (e.g. /essays/<slug>) stay in-tab with a →. Omit for a
   *  pure visual entry (ChipMango, Kickoff). */
  links?: { label: string; href: string }[];
}

// Baked layout values, tuned by eye against ChipMango (the reference entry)
// and re-tuned for the fixed-rail layout (S41).
const MAX_W = 62; // rem — contained wrapper (asset column + rail)
const RAIL_W = 13; // rem — rail width
const RAIL_GAP = 96; // px — gap between asset column and rail (lg+)
const SECT_GAP = 200; // px — gap above a HEADLESS section (the gap IS the divider — ChipMango, and the splash hero); also the lead-in gap for a headless entry
const SECT_GAP_HEADED = 140; // px — gap above a HEADED section: the heading shares divider duty, so less raw air than SECT_GAP; also the lead-in gap for an entry that uses headings
const HEAD_GAP = 16; // px — heading → its section's first row
// Topbar → description gap: 48px mobile, 120px lg+. The shared
// (site)/layout.tsx `<main>` already contributes `pt-8` (32px) above every
// page, so this template only adds the remainder — `pt-4` (16px, an exact
// Tailwind step) mobile, `pt-[88px]` (arbitrary — 88 isn't a default
// Tailwind step) lg+ — on the wrapper below, rather than touching the shared
// layout (which every other page template also sits inside).
const ROW_GAP = 48; // px — rhythm between rows within a section
const GUTTER = 48; // px — gap between the two halves of a 2-up
const RING_W = 4; // px — frame ring width (box-shadow spread)
const RING_PCT = 20; // % — frame ring strength (of --foreground; inverts per theme)

// Render the lead paragraph, optionally wrapping its first `link.match` substring
// in an inline link (collaborator credit etc.). The surrounding text is plain so
// `description` stays a verbatim string for OG/meta (see GalleryMeta).
function renderLede(
  text: string,
  link?: GalleryMeta["descriptionLink"],
) {
  if (!link) return text;
  const i = text.indexOf(link.match);
  if (i === -1) return text;
  const external = /^https?:/.test(link.href);
  return (
    <>
      {text.slice(0, i)}
      <a
        href={link.href}
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        className="focus-ring font-medium text-accent decoration-accent underline underline-offset-2 transition lg:text-foreground lg:decoration-foreground/30 lg:hover:text-accent lg:hover:decoration-accent"
      >
        {link.match}
      </a>
      {text.slice(i + link.match.length)}
    </>
  );
}

// Back-to-work affordance — same markup as the case-study (ProjectsExplorer),
// lab (LabDetail) and essay detail headers. Accent by default on touch (no
// hover to signal the affordance), muted + accent-hover at lg+. Rendered twice
// by <Gallery>: once before the rail for touch widths (where the rail stacks on
// top, so this must be the page's first element) and once at the top of the
// content column for desktop. The caller supplies display/spacing/visibility.
function BackToWork({ className }: { className: string }) {
  return (
    <Link
      href="/"
      className={`group items-center gap-2 text-sm font-semibold text-accent transition-colors hover:text-accent focus-visible:text-accent focus-visible:outline-none lg:text-text-muted ${className}`}
    >
      <span
        aria-hidden
        className="transition-transform group-hover:-translate-x-0.5"
      >
        ←
      </span>
      work
    </Link>
  );
}

export function Gallery({
  meta,
  sections,
}: {
  meta: GalleryMeta;
  sections: GallerySection[];
}) {
  // Lead-in (description → first frame) rides the same rhythm as the section
  // gaps: tighter for an entry that uses headings (the heading does divider
  // duty), the full SECT_GAP for a headless lookbook. Keeps each entry
  // internally uniform — Kickoff all at SECT_GAP_HEADED, ChipMango all at SECT_GAP.
  const leadGap = sections.some((s) => s.heading) ? SECT_GAP_HEADED : SECT_GAP;
  return (
    // The rail is a SIBLING of .view-enter, not a descendant — deliberately.
    // CSS animations that ever touch `transform` leave the element's computed
    // transform as `matrix(1,0,0,1,0,0)` (the identity matrix) once finished,
    // NOT the literal keyword `none`, even under `animation-fill-mode: both`.
    // Browsers treat any matrix value as "has a transform" for containing-
    // block purposes, so .view-enter (used site-wide for the fade+rise
    // entrance on every detail page) was silently establishing a containing
    // block for position:fixed/sticky descendants for its entire lifetime,
    // regardless of the animation having long finished. Confirmed empirically
    // with Playwright: the rail's real bounding box didn't match the
    // viewport-relative calc() at all — it was being positioned relative to
    // .view-enter's own box. Moving the rail outside .view-enter's subtree
    // removes the only remaining transform-bearing ancestor (checked the full
    // chain up to <html> — everything else is `transform: none`, confirmed
    // via computed styles). Side effect: the rail no longer fades/rises in
    // with the rest of the page content, which reads fine — it's persistent
    // chrome (like SiteTopBar), not page content.
    <>
      {/* Touch-only back link — on mobile/tablet the rail stacks on top of the
          content, so this must be the page's first element to match the
          case-study layout (which has no rail). Hidden at lg+, where the copy
          inside the content column takes over. */}
      {/* -mt-4 trims the shell's global main pt-8 (32px) down to a 16px gap
          below the sticky topbar. Only renders on touch (lg:hidden). */}
      <div className="-mt-4 px-6 lg:hidden">
        <BackToWork className="inline-flex" />
      </div>
      <aside className="gallery-rail px-6 pt-4 lg:px-0 lg:pt-0">
        <div className="flex h-full flex-col lg:justify-center">
          <div>
            <div className="text-base font-medium">{meta.title}</div>
            <div className="mt-3 flex flex-wrap gap-2">
              {meta.eyebrow && (
                <span className="border border-accent/40 px-2 py-1 text-xs text-accent">
                  {meta.eyebrow}
                </span>
              )}
              {meta.tags.map((t) => (
                <span
                  key={t}
                  className="bg-foreground/10 px-2 py-1 text-xs text-foreground/60"
                >
                  {t}
                </span>
              ))}
            </div>
            {meta.links && meta.links.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {meta.links.map((l) => {
                  const external = /^https?:/.test(l.href);
                  return (
                    <a
                      key={l.href}
                      href={l.href}
                      {...(external
                        ? { target: "_blank", rel: "noopener noreferrer" }
                        : {})}
                      className="focus-ring group inline-flex items-center gap-2 border border-border px-2 py-1 text-xs font-medium transition hover:border-accent hover:text-accent"
                    >
                      <span>{l.label}</span>
                      <span
                        aria-hidden
                        className="text-text-muted transition-colors group-hover:text-accent"
                      >
                        {external ? "↗" : "→"}
                      </span>
                    </a>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Outermost view-enter wrapper — identical to every other detail view
          (ProjectsExplorer / LabDetail / essays), so the gallery fades + rises
          in on open exactly like the rest. Inside it: the full-bleed
          break-out of the shell's --content-w cap (100vw box re-centered on
          the symmetric layout; relies on body { overflow-x: clip }), then the
          gallery re-centered at MAX_W.
          Deliberately margin-based (`mx-[calc(50%-50vw)]`), NOT the
          left-1/2/-translate-x-1/2 transform trick used elsewhere (e.g.
          DesignGrid) — same transform/containing-block reasoning as above. */}
      <div className="view-enter">
        <div className="w-screen mx-[calc(50%-50vw)] pt-4 lg:pt-[88px]">
          <div
            className="mx-auto grid w-full grid-cols-1 gap-y-12 px-6 lg:grid-cols-[1fr_var(--rail)] lg:gap-y-0"
            style={{
              maxWidth: `${MAX_W}rem`,
              ["--rail" as string]: `${RAIL_W}rem`,
              columnGap: RAIL_GAP,
            }}
          >
          {/* Asset column — the SOLE grid child, so it lands in column 1 (the
              `1fr` track). Column 2 (`var(--rail)` wide) is left empty on
              purpose: it reserves the horizontal space the now-out-of-flow,
              position:fixed rail visually occupies, so the asset column never
              expands under it. On mobile the grid collapses to one column and
              the rail stacks above (it's a sibling before this wrapper in the
              DOM; see .gallery-rail switching to position:static below lg).
              Description leads as a full-width text block (same column the
              image/video blocks share), then sections separated by SECT_GAP;
              rows within by ROW_GAP. */}
          <main className="flex flex-col pb-8">
            {/* Desktop back link — top-left of the content column, above the
                lead, mirroring the case studies spatially. Hidden on touch,
                where the copy before the rail handles it. */}
            <BackToWork className="mb-8 hidden lg:inline-flex" />
            {/* Description → first frame: leadGap at every width, so the lead
                text sits on the same section rhythm as the gaps below it (140
                for a headed entry, 200 for a headless one). */}
            {meta.description && (
              <p
                className="text-xl leading-relaxed text-foreground/70 sm:text-2xl"
                style={{ marginBottom: leadGap }}
              >
                {renderLede(meta.description, meta.descriptionLink)}
              </p>
            )}
            {/* Each section carries its own top gap (vs a shared container
                rowGap) so a HEADED section can sit on a tighter rhythm than a
                headless one — the heading does divider duty, so it needs less
                raw air above. Headless sections keep the full SECT_GAP, so
                ChipMango and the splash hero render exactly as before. */}
            <div className="flex flex-col">
              {sections.map((section, si) => (
                <section
                  key={si}
                  style={{
                    marginTop:
                      si === 0 ? 0 : section.heading ? SECT_GAP_HEADED : SECT_GAP,
                  }}
                >
                  {section.heading && (
                    <div style={{ marginBottom: HEAD_GAP }}>
                      <h2 className="text-base font-semibold text-foreground">
                        {section.heading}
                      </h2>
                      {section.note && (
                        <p className="mt-2 max-w-prose text-sm text-foreground/60">
                          {section.note}
                        </p>
                      )}
                    </div>
                  )}
                  <div className="flex flex-col" style={{ rowGap: section.rowGap ?? ROW_GAP }}>
                    {section.rows.map((row, i) => {
                      if (row.span === "full") {
                        return (
                          <BlockBox key={i} block={row.block} eager={si === 0 && i === 0} />
                        );
                      }
                      if (row.span === "half") {
                        return (
                          <div
                            key={i}
                            className="grid grid-cols-1 sm:grid-cols-2"
                            style={{ columnGap: GUTTER, rowGap: GUTTER }}
                          >
                            <BlockBox block={row.blocks[0]} />
                            <BlockBox block={row.blocks[1]} />
                          </div>
                        );
                      }
                      return <TextRow key={i} text={row.text} />;
                    })}
                  </div>
                </section>
              ))}
            </div>
          </main>
          </div>
        </div>
      </div>
    </>
  );
}

/** Inline editorial text (statement / caption). A statement is the biggest type
 *  on the page: foreground, tracked tight, balanced, on a tight ~24ch measure
 *  so it wraps into a deliberate 2–3 line block; its optional `sub` picks up the
 *  same muted lead voice as the description, on a wider prose measure. A caption
 *  is a small muted line for sitting under a sequence of frames. Both ride the
 *  column's normal ROW_GAP for now — tighten by eye (live dial) if a caption
 *  floats too far off the frame it belongs to; that's when Block.caption earns
 *  its place. Type sizes are starting values, tunable against real copy. */
function TextRow({ text }: { text: TextBlock }) {
  if (text.variant === "caption") {
    return (
      <p className="max-w-prose text-sm leading-relaxed text-text-muted">
        {text.body}
      </p>
    );
  }
  return (
    <div>
      <p className="max-w-[24ch] text-[clamp(1.75rem,4vw,2.75rem)] font-semibold leading-[1.1] tracking-tight text-balance">
        {text.body}
      </p>
      {text.sub && (
        <p className="mt-5 max-w-prose text-xl leading-relaxed text-foreground/70">
          {text.sub}
        </p>
      )}
    </div>
  );
}

/** A square-cornered, overflow-clipped image/video frame on the page ground.
 *  The ring is foreground-based so it reads on both light and dark grounds. */
function BlockBox({ block, eager = false }: { block: Block; eager?: boolean }) {
  return (
    <div
      className="relative overflow-hidden"
      style={{
        aspectRatio: block.aspect,
        boxShadow: `0 0 0 ${RING_W}px color-mix(in srgb, var(--foreground) ${RING_PCT}%, transparent), 0 1px 2px color-mix(in srgb, var(--foreground) 8%, transparent)`,
      }}
    >
      {block.kind === "video" ? (
        <CardVideo
          src={block.src}
          poster={block.poster}
          title={block.alt}
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <Image
          src={block.src}
          alt={block.alt}
          fill
          priority={eager}
          unoptimized={block.unoptimized}
          sizes="(min-width: 1024px) 43rem, 100vw"
          className="object-cover"
        />
      )}
    </div>
  );
}
