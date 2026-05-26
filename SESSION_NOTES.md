# Session Notes

A running log of each work session: what got done, decisions made, and where we're headed next. Read this first when starting a new session.

---

## Session 1 — 2026-05-20

### Summary
- Created the project workspace in `/Users/apple/portfolio` (started empty).
- Set up project bookkeeping: `SESSION_NOTES.md` and `DESIGN.md`.
- Scaffolded the app with `create-next-app`: **Next.js 16, React 19, TypeScript, Tailwind v4, App Router, `src/` dir, `@/*` alias.**
- Wired up an **MDX content pipeline** with `next-mdx-remote/rsc` + `gray-matter` (+ `remark-gfm`, `rehype-slug`, `@tailwindcss/typography`).
- Built the initial site: home, `/work`, `/work/[slug]`, `/writing`, `/writing/[slug]`, `/about`, shared nav + footer, token-based theme with light/dark.
- Added two sample entries (one case study, one essay) and **verified `npm run build` passes** — all 9 routes prerendered.

### Decisions
- See `DESIGN.md` for the full rationale. Headlines: static-first SSG; MDX via `next-mdx-remote/rsc` (not `@next/mdx`); Tailwind v4 CSS-based config; warm-neutral + amber theme.

### Session 1 (cont.) — design exploration + projects explorer
- **Pivoted to a single-page site:** removed `/work`, `/writing`, `/about` routes, the nav component, and footer. (Content infra — `lib/content.ts`, `Mdx`, `mdx-components`, `EntryList`, `src/content` — kept on disk.)
- **Design pass on the hero:** palette tokenized (see `DESIGN.md` table — white `#FDF6FB`, black `#120E11`, accent/logo `#9F106B`), **light mode only**, **Nata Sans** body + **Nico Moji** (self-hosted, OFL) greeting, logo recolored via CSS mask to accent, favicon recolored (`sharp`) + token `--logo` → `var(--accent)`.
- **Responsiveness convention:** fluid `clamp()` for type/spacing (not breakpoint steps); breakpoints reserved for true layout shifts. Documented in `DESIGN.md`.
- **Built the projects section (list–detail explorer):** single page = nav → hero → projects. `ProjectsExplorer` (client) + `ProjectsSection` (server). Desktop = split (detail left / list right); mobile = ☰ drawer. In-page selection state + hash deep-links (`/#slug`). All 5 sample case-study panes render server-side (SEO/find-in-page), switch instantly. **`npm run build` passes; `/` is fully static.**

---

## Session 2 — 2026-05-21

### Summary
- **Long design-iteration pass** on the hero and projects section (colors, fonts, spacing, radii, sticky behaviors), tuning one element at a time.
- **Established conventions (all in `DESIGN.md`):** 8px spacing grid for margins/padding/gaps; 8px border-radius standard (the uneven `.accent-fill` marker is the documented exception); fluid `clamp()` sizing; light mode only; reference tokens, never hard-coded hex.
- **Built, then discarded, a list–detail split + right rail + ☰ drawer + sticky-offset model.** It pinned everything to a hand-computed `--nav-h + 32px` line that every sticky element had to share — judged fragile and unscalable.
- **Pivoted the projects section to a card grid + modal (current model):** responsive card grid (`1/2/3` cols); each card = image placeholder + title + role + excerpt (first ~2 sentences, computed server-side in `ProjectsSection`). Clicking opens the full case study in a **per-project native `<dialog>`** (`showModal()`). **One dialog per project, all rendered/closed → every body is in the static HTML (crawlable / find-in-page).** Hash deep-links (`/#slug`) retained. The `--nav-h` magic-offset system was deleted.
- Bumped placeholder projects to **8** and lengthened the default case study.
- **`npm run build` passes; `/` fully static.** Still not a git repo.

### Decisions
- See `DESIGN.md` — "Layout & Structure" rewritten for the card+modal model (incl. *why* it replaced the split); plus Spacing, Shape & Radius, Color sections.

### Session 2 (cont.) — polish: two-column layout
- **Restructured the whole page into two columns (desktop):** `page.tsx` is now a CSS grid `lg:grid-cols-[1fr_17rem]`. **Left = card grid; right = identity column (nav + hero).** The identity `<aside>` is first in DOM (stacks on top on mobile), moved right via `lg:order-2`, and pinned with `lg:sticky lg:top-8 lg:self-start`. Hero is now left-aligned (was centered). Below `lg` → single stacked column, nav on top.
- Card grid dropped 3 → 2 cols (`sm:grid-cols-2`) since the left column is now ~44rem at `lg`.
- The old full-width sticky `<header>` (and its `z-30`/`bg-background`) is gone; the nav now lives inside the identity column.
- **`npm run build` passes; `/` fully static.**

---

## Session 3 — 2026-05-22

### Summary — polish pass: nav-as-right-column + modal transition
- **Iterated the two-column layout (live, eyeballing in the browser):** landed on a **fixed-nav model** — grid `lg:grid-cols-[1fr_18rem]` inside `max-w-[72rem]`, **column gap `gap-x-8` (32px)**, cards back to **2 columns** (`sm:grid-cols-2`). (Explored fr-ratios 3:1 → 5:1 first; the fr changes felt subtle, so switched to fixed `18rem` nav + `1fr` cards. The 18rem keeps "chukwuka's matrix" on one line — title also has `whitespace-nowrap`.)
- **Turned the old nav underline into a full-height vertical divider** on the left edge of the identity column. The `<aside>` **stretches to the full content height** and uses `lg:-mt-8 lg:-mb-24` to cancel the grid's `pt-8`/`pb-24`, so the accent border runs **from the very top of the page to the very bottom** (reaches both screen edges; doesn't lift off at the top before scroll or at the bottom at page end). Nav/hero pin via an **inner `lg:sticky lg:top-8`** wrapper. Hero left-aligned.
- **Reworked the project modal into a "container transform" (`ProjectsExplorer.tsx`, big rewrite):** clicking a card **grows its frame** (animating real `left/top/width/height`, not transform-scale) into a panel that **fills the cards column** (measured live from the grid `<ul>`), inset `24px` top/bottom for breathing room. As it grows, **the rest of the card grid fades out** ("erasing" the other cards); on close it shrinks back into the card and the grid fades back in. **Modal content is static** (just revealed by the growing frame — no in-modal cross-fade; an earlier card↔content cross-fade attempt was scrapped per feedback). `::backdrop` fades to dim the nav. Driven by the Web Animations API; **`prefers-reduced-motion` snaps instantly**. Esc/backdrop-click/✕ all route through `requestClose` so they play the exit animation.
- **Easing:** both open/close use **ease-in-out** `cubic-bezier(0.65, 0, 0.35, 1)` (durations 360ms open / 300ms close) — user picked "smooth in-out" so neither direction noticeably picks up speed.
- **Card edge — landed on clean elevation (ref: marijanapav.com/work).** Long exploration: started by dropping the 1px `border-border`, tried a transparent `border-4` + faint even shadow as a fake outline (tuned directional→even, blur 20→12px, opacity 40→10%), then **replaced all of it** with the reference's technique — a **two-layer `box-shadow` on `.project-card`**: a **4px ring** (`var(--card-ring)` = `#f7f3f6`, A/B'd several near-background pinks) **+** a micro `0 1px 2px` dark shadow (`--foreground` @ 8%). Written as plain CSS (Tailwind's arbitrary-shadow parser mangles multi-layer + alpha). New tokens added + mapped in `@theme`: **`--accent-fill`** (`color-mix(--accent 16%)`) and **`--card-ring`** (`#f7f3f6`).
- **Hover/focus spotlight (done):** activating a card (hover or keyboard focus) blurs (`blur(2px)`) + dims (`opacity:.6`) the *other* cards. Hover rule is `@media (hover:hover)`-gated; the focus rule (`:has(.project-card:focus-visible) … :not(:focus-visible)`) is not (keyboard users vary).
- **Focus-visible (done):** keyboard focus drives the spotlight **and** gives the focused card an accent `outline-2 outline-offset-2 outline-accent` marker (a11y). `:focus-visible` so mouse clicks (which open the modal) don't trigger it.
- **Card grid gap `gap-6` → `gap-8`** (24px → 32px) so card-to-card spacing matches the page's `gap-x-8` column gap (both 32px, on the 8px grid). Modal `INSET` left at 24px (independent). The container-transform measures grid/card rects live, so the gap change needs no transition code changes.
- Added `html { scrollbar-gutter: stable; }` so locking page scroll on modal-open doesn't shift the layout (which made the source card jump during the transition).
- **`npm run build` passes; `/` fully static.** Still not a git repo. Dev server runs on **:3000** (a long-lived instance; a 2nd `npm run dev` will refuse and pick :3001 then exit).

### Open questions / deferred
- **Images are placeholders** (accent-tinted `aspect-video` blocks) until real content. Plan: add an `image:` frontmatter field + render with `next/image`.
- **`.accent-fill`** class is currently unused (kept on purpose for possible reuse of the uneven-marker look).
- Real identity + copy; real project content (8 are placeholders); contact/social links.
- Custom domain on Vercel? (Not a git repo yet.)
- **Essays sourcing (deferred):** explored pulling essays into the viewspace; headless WordPress is viable with no WP-side changes (public REST API verified — see DESIGN.md → routing → "Essays sourcing"). Held off as out-of-scope; likely future = MDX authored in VS Code. Essays button stays an external link for now.
- Modal motion: container transform's first frame mirrors the card but isn't pixel-identical (card has a border, panel a shadow) — fine for now; revisit if the swap reads oddly with real images.

### Built this session (cont.)
- **Polish — all done:** modal open/close transition, card hover/focus spotlight, `focus-visible`.
- **Modal backdrop (done):** `dialog::backdrop` now dims (`--foreground` @ 30%) **and** blurs (`backdrop-filter: blur(4px)`); the existing opacity fade carries both in/out.
- **Card images (TEMP preview):** 6 of 8 cards show real images via a `TEMP_CARD_IMAGES` array in `ProjectsExplorer` (batman.jpg + 5 Unsplash in `public/`), rendered with `next/image` (`fill`/`object-cover`). Remove once `image:` frontmatter is wired. Cards 7–8 still placeholder.
- **Card-column routing system (done).** The cards column is now a swappable content area driven by one shared state — `active: ViewId` (`"projects" | "product-ideas" | "contact"`) in a **`ViewProvider` context** (`useView`); `CardsColumn` (client) renders the matching view (server `<ProjectsSection/>` passed as prop / `<ProductIdeas/>` / `<Contact/>`). Default `"projects"` keeps the static build SEO-complete. Two controls set the state:
  - **`NavMenu`** ("things i do:" menu, client) = **top-level routes**: each item is a `view` (in-app) or an `href` (external new-tab). *design* → `projects`, *contact* → `contact` (in-app); *essays* → `https://thechukwukaosakwe.wordpress.com/`, *newsletter* → `https://chukwukaosakwe.substack.com/`. Active item shows accent + `aria-current`. Centered, full-width menu buttons; nav underline (`border-b-2 border-accent`) restored above it.
  - **`ViewSwitcher`** = **design's internal sub-toggle** (projects ↔ product-ideas) only. Fixed frosted segmented control, grid-mirrored alignment, `motion-safe` **sliding thumb** (`bg-accent-fill`; `rounded-lg` track / `rounded-md` thumb per the 8px rule). **Renders `null` when `active` isn't one of its two segments** (e.g. contact) — so it's scoped to the design area; you leave/return via the menu.
- **Views:** `ProductIdeas` carousel (TEMP content) — cover-fit image (`aspect-[4/3]`, `.project-card` frame) + one-line caption + looping chevron handles + overlaid counter pill; `mt-[12vh]`. Reuses the 6 `public/` images + placeholder captions (`TEMP_IDEAS`). `Contact` — placeholder centered accent "better call chuka!".
- **Divider full-height in every view:** `lg:min-h-dvh` on the page grid so the accent divider spans the viewport even when a shorter view (carousel/contact) is shown.
- **Identity-column styling pass.** "things i do" menu: frosted to match the switcher (`bg-background/70 backdrop-blur` + border + shadow), `text-base`/`font-semibold`, `py-4`, `gap-4`, centered, full-width. States reworked — **hover warms text only**, **active route = `bg-accent-fill`** (no accent border), and the **accent border is now keyboard-focus only** (`focus-visible:border-accent` + `outline-none`). Menu items gained `activeFor` (design stays active across projects+product-ideas) and the `essays`/`newsletter` external links.
- **Nav underline + a new hero/menu rule** both extend left to touch the vertical divider (`lg:-ml-6`, content re-padded `lg:pl-6`) — two full-width accent rules bracketing the hero. Spacing kept on the 8px grid (mt-8 gaps; fixed an off-grid `mt-3`→`mt-4`).
- **Hero copy/type:** added "I'm a" lead-in, whole line `font-normal` (400) at `text-lg` (18px), lowercased "systems", dropped `text-balance` + `whitespace-nowrap` so it fills the column width.
- **Modal close button:** restyled to a circular `--danger` (`#D31D0C`) outline + centered **SVG X** (token added + mapped). Modal header rule bumped 1px → `border-b-2`.

### Next up
- **Real content (we're about ready):** project copy + `image:` frontmatter (replaces `TEMP_CARD_IMAGES`); a real product-ideas set + captions (replaces `TEMP_IDEAS`); flesh out the `Contact` view; give the `essays` route a destination (view or `href`).
- Nice-to-haves: OG/social images, sitemap/robots, `rehype-pretty-code` if code appears in case studies.
- Initialize git + push to Vercel when ready.

### Useful commands
- `npm run dev` — local dev server
- `npm run build` — production build (also the MDX correctness check)

---

## Session 4 — 2026-05-23 (continued from Session 3, long layout pass)

### Summary — nav-panel redesign + grid restructure + token tuning
- **Big layout restructure — full-bleed-right panel (replaced the fixed-`18rem`/divider model).** The page is now a **full-width grid with gutter tracks**: `lg:grid-cols-[1fr_minmax(0,49rem)_minmax(24rem,1fr)]` (track 1 = left margin, track 2 = cards, track 3 = the white identity/nav **panel**). As the last track of an edge-to-edge grid, the panel's `bg-nav-fill` **bleeds to the right viewport edge on its own** — so we **deleted the old fake-bleed `::after` pseudo (`w-screen`/`left-full`) and the `body { overflow-x: clip }`** it required (the clip had been cutting off content nudged toward the edge). Placement is explicit: cards `lg:col-start-2 lg:row-start-1`, panel `lg:col-start-3 lg:row-start-1`. **Gotcha hit:** mixed `col-start` with the DOM-first aside (col 3) pushed the cards to row 2 → fixed by pinning both to `lg:row-start-1`. See `DESIGN.md` → Layout for the full rationale.
- **Killed the vertical divider system entirely** (the 3 `border-accent` lines + the `-ml-6`/`pl-6` insets) — the user decided it's gone for good.
- **Nav content wrapper:** inner `lg:sticky lg:top-8`, **capped `lg:max-w-[28rem]` + `lg:mx-auto`** (centers in panel), **`lg:px-8`** (32px gutters). Cap engages only past cap+gutters; below that content stays 32px off both edges.
- **Hero text:** the two text blocks merged into **one left-aligned `<h1>`**, `text-sm` (14px), `lowercase` (CSS). Copy now: *"hello, i'm chukwuka, a systems-oriented **designer** building thoughtful interfaces for complex products. i design products end to end — and i write about the decisions behind them (sometimes)."*
- **Menu (`NavMenu`) reworked → separated flat outlined buttons:** full-width (equal), `rounded-lg`, `border-border`, **no shadow**, left-aligned, `gap-2`. Hover fills row (`bg-foreground/5` + accent text), active = `bg-accent-fill`, focus = `focus-visible:border-accent`. Label "**some things i do**" in **Nico Moji** (matches the logo). *(Explored frosted bars → chips → `divide-y` grouped list before landing here.)*
- **Two 4px accent rules** (`h-1 bg-accent`) bracket the menu, full panel width via `lg:-mx-8` (items stay 32px inset).
- **Matrix coordinate gag (`MatrixReadout`):** mono readout below the lower rule — `matrix node [row,col]`, reflecting the hovered/focused card (idle `[–,–]`, coord in accent). `ViewContext` extended with `node`/`setNode`; cards report position on hover/focus (`COLS = 2`). *(Built then removed a "system readout" footer — status/location/live Lagos time. Visitor geolocation for a real local-time line discussed (timezone-client vs Vercel-edge vs IP-API) and **deferred**.)*
- **48px (`mt-12`) is now the standard gap between navbar sections** (DESIGN.md → Spacing). Exception: logo + hero text are one "identity" section → 16px (`mt-4`) internal. Top-of-column → logo = 48px (`pt-8` + `mt-4`).
- **`html { background: var(--nav-fill) }`** so the scrollbar-gutter strip matches the white panel.
- **`ProductIdeas`:** placeholder accent intro line "these ideas don't exist yet but maybe they should". **`ViewSwitcher`** segment text bumped to 16px. **"read more"** on cards = `text-text-muted` resting → accent on hover *and* focus (parity), `font-semibold`, pinned 16px from card bottom (`mt-auto` + `pt-4`).
- **Token tuning (final values in `globals.css`):** `--accent` `#FB370A` · `--card-ring` `#FBEEF8` · `--border` `#E5DFE4` · added **`--nav-fill` `#FFFFFF`** · added **`--text-muted` `#878286`** (now drives ALL muted text — replaced every `text-muted` usage with `text-text-muted`; **`--muted` `#78716c` is now orphaned**, safe to delete).
- **`npm run build` passes; `/` fully static** (4 pages). Benign warning only: "Failed to find font override values for font `Nata Sans`" (Next can't auto-generate a fallback metric — harmless; silence later via `fallback`/`adjustFontFallback`). Still **not a git repo**.

### Resume here — next up, in this order (user's call 2026-05-23)
1. **Initialize the git repo** (+ first commit) — do this FIRST so there's a restore point before the next big pass.
2. **Contact page (view) styling** — currently just the placeholder accent "better call chuka!". Style it out.
3. **Add real content** — project copy + `image:` frontmatter (replaces `TEMP_CARD_IMAGES`); a real product-ideas set + captions (replaces `TEMP_IDEAS`); flesh out the `Contact` view; give `essays` a real destination.
4. **What to do with the nav panel backdrop** — **currently a TEMP `DigitalRain` (Matrix homage) underlaying the WHOLE panel** (`absolute inset-0` canvas behind the content, which sits on `z-10`; `lg`-only, FPS-capped, reduced-motion-safe). **Known-rough / to be nuked:** the rain is dark, so "chukwuka's matrix", the hero paragraph, and "some things i do" (dark text) are **unreadable on it** — menu buttons (white) + accent lines/logo still read. User's call: "let it be what it is, we'll nuke it later." So next session, **decide the panel's real treatment** (legible dark-panel theme, or scrap the rain). Parked alternatives: the `MatrixReadout` coordinate gag (component + `ViewContext.node` wiring + `ProjectsExplorer` hover/focus handlers still in place, just not rendered) and the visitor location/time idea (see deferred).

### Still deferred (unchanged)
- OG/social images, sitemap/robots, `rehype-pretty-code` — explicitly held until real content + Vercel push.
- ~~Initialize git~~ ✅ done (Session 5). Push to Vercel when ready.
- Delete the orphaned `--muted` token (or split a separate border token if the shared `--border` becomes a problem).

---

## Session 5 — 2026-05-23 (continued)

### Summary — git init + Contact view styled
- **Initialized the git repo** (item #1, the restore point). `git init` on `main`; `.gitignore` was already complete (Next default — `node_modules`/`.next`/`.DS_Store`/env all ignored). First commit `38fc24d` "Initial commit: portfolio site (Next.js 16 + Tailwind v4)" — 51 source files. **Now a git repo** (no remote yet).
- **Styled the `Contact` view** (item #2; was a bare accent placeholder). User's calls: **keep the big accent line**; channels = **email + github + farcaster** (no LinkedIn/X); **no contact form** (no backend). Layout (centered column, `mt-[12vh]`): accent hero **"better call chuka!"** → muted warmth sentence ("got a product worth building, or just want to say hi? my inbox is open.") → **primary `email me` CTA** → **github · farcaster** text-links.
  - **`email me` is the site's one solid-accent button** (`bg-accent` + `text-nav-fill` + arrow glyph + focus ring) — justified as the single primary action; accent is text/fill everywhere else. `mailto:chukwuka0009@gmail.com`.
  - github/farcaster use the **"read more" link pattern** (`text-text-muted` → accent on hover *and* focus), dot separator (`text-border`), new tab. Links: `github.com/Chukwuka-Osakwe`, `farcaster.xyz/chukwukaosakwe`.
  - Channels are **top-of-file constants** (`EMAIL`/`GITHUB`/`FARCASTER`) for easy edits.
- **`npm run build` passes; `/` fully static** (4 pages; benign `Nata Sans` font-override warning only). Dev server running on **:3000**.

### Session 5 (cont.) — nuked DigitalRain + real content (Footy launch set)
- **Nuked the TEMP `DigitalRain`** (item #4) — removed `<DigitalRain/>` + import from `page.tsx`, dropped the `relative isolate` / `relative z-10` layering it required, **deleted `src/components/DigitalRain.tsx`**. Panel is now clean white; dark hero/menu text reads fine. (The "chukwuka's matrix" brand name + logo stay; only the rain canvas is gone.)
- **Got the real Notion content in.** User dropped the Notion **Markdown & CSV export** at `/portfolio/the-notion` (3 case studies — Footy, Heyfood, Energy — + an index page). Tried `WebFetch` on the public share link first: useless (JS-rendered, returns only "Notion"). Export is the way. **`/the-notion` is now gitignored** (heavy, has videos; curated copies live in `/public/work`).
- **Wired the `image:` frontmatter field** (item #3 infra): added `image?` to `Frontmatter` (`content.ts`); `ProjectsExplorer` card cover now reads `p.image` via `next/image` (placeholder block when unset); **removed `TEMP_CARD_IMAGES`**. Also mapped **`img`** in `mdx-components.tsx` → styled native `<img>` (rounded, bordered, lazy) for case-study body images.
- **Footy is the launch set** (user's call: "begin with footy"). Wrote `src/content/work/footy.mdx` from the Notion md — demoted headers, dropped the title/gif, **no videos** (user: "no to all videos for now"), curated **17 of 27 images** (culled the gif, a redundant type shot, and 9 of 10 Figma colour screenshots), captions kept as `*italic*`. Fixed a couple of obvious typos ("problem problem"). Images copied + renamed into **`/public/work/footy/`** (`components.png` = cover + Act-3 shot; `before`, `before-score-square`, `state-before/after`, `colours`, `typography`, `screen-1..9`, `for-you`). **Cover = `components.png`** (landscape components sheet — portrait phone screens crop badly in the `aspect-video` card).
- **Deleted the 8 placeholder case studies** — `src/content/work/` now holds only `footy.mdx`. ⚠️ **Grid currently shows ONE card** (sparse in the 2-col layout) until Heyfood/Energy land — by design (start-with-1 plan), flagged for awareness.
- **Hero:** kept the live line; **appended the Notion "about" voice** ("an armchair philosopher at heart, cosplaying as a product designer. In love with gradients.") as a **DRAFT alternate**, coloured **indigo `#4f46e5`** to mark it provisional (NOT live). Has a clear JSX comment + "remove or promote later". User wants it parked for future consideration, not swapped in.
- **`npm run build` passes; `/` fully static** (4 pages). Dev server :3000. Full Footy body is in the static HTML (crawlable). **Nothing committed yet** since the initial commit (user styling further first).

### Session 5 (cont.) — image rework + masters/derivatives convention
- **Optimised the whole Footy image set: 10 MB → ~0.7 MB (−93%)** via `sharp` (resize ≤1600px longest edge, WebP q80, deleted source PNGs). Rewrote all `.png`→`.webp` paths in `footy.mdx`. Modal/case-study now loads instantly.
- **Phone screens (Act 3) → responsive 2-up grid.** Re-cut screens 1–9 from the 1284px originals at **740px wide** (~2× the ~352px half-column cell), wrapped in a JSX grid in the MDX: `grid-cols-1 gap-4 sm:grid-cols-2 [&_img]:my-0` (1-col on mobile, 2-up at `sm`+). Confirmed **Tailwind v4 scans `.mdx`** (the grid + arbitrary classes generate). Lesson: for portraits in a split layout, target **width** (≈2× display), not "longest edge."
- **Modal:** now **full viewport height** (`INSET` 0) with **squared corners** (`rounded-none`). Body images lost their `rounded-lg` (square corners). Body/attribution links + role tag styled accent / `font-semibold` (earlier).
- **`<Figure>` component (centered, width-capped images)** added to `mdx-components.tsx` — `<Figure src alt width="69%" />`, default 66%, always centered. Act 2 colours+typography are a centered pair at `width="69%"`. **Full detail + the masters/derivatives + WebP-by-image-type policy is logged in DESIGN.md** ("Image workflow — masters & derivatives").
- **Masters/derivatives convention now in force:** masters → gitignored **`/sources/work/<slug>/`** (recovered 15 of 17 Footy masters from `/the-notion`); derivatives → `/public/work/<slug>/`. **`mv` drops into `/sources`, never `rm`.**

### Session 5 (cont.) — modal redesign, layout dials, MDX components, blurb split
- **`<Compare>` component** (`mdx-components.tsx`): side-by-side **before → after** with an accent `→`, **equal heights** via `items-stretch` + `object-cover` (similar aspects trim a few invisible px, no letterbox). Act 1 before/after now uses it.
- **Modal, big rework** (`ProjectsExplorer`): geometry went full-height → centered max-width → **fills everything left of the nav** and is **shifted 32px right** (gap on the left, laps the nav slightly). Reads the nav's left edge via `[data-nav-panel]` on the `<aside>`; below `lg` falls back to a centered max-width box. **Squared corners.** **Close button pinned** to the panel's top-right (32px, solid bg). **Backdrop: blur 8px + 90% dim** (tuned live 30→90%).
- **Breakout content layout** (`.case-body` in `globals.css`): inside the wide panel, text holds a **42rem reading measure** (centered) while **media breaks out** to the content width; whole content column capped at `max-w-[60rem]` so it doesn't sprawl. Header aligns to the text column.
- **Image placement:** `<Figure width="69%">` used for Act-2 colours+typography (centered pair) and Act-1 isn't (those use `<Compare>`). Colours/typography masters re-dropped clean (`palette.png`→`colours.webp` near-lossless; new `typography.png`); added `component-set-1` + `components2` (cart-state strips) to Act 3 — `components2` padded to match the first image's height. **near-lossless** confirmed for flat-UI shots (q80 vs near-lossless: 24KB vs 63KB on `components`).
- **Nav-width dial:** grid track 3 is now **`var(--nav-w)`** (currently **21rem**) — a single "shave the navbar" knob (only width changes; gutters/vertical-spacing/text/logo/strokes untouched, content reflows). Replaced the old `minmax(24rem,1fr)`.
- **Cards now flex to fill** reclaimed space: grid track 1 (left margin) bounded at `minmax(2rem,8rem)`, track 2 (cards) = `minmax(0,1fr)`. So shaving the nav grows the cards, not the gutter. (Both the page grid + the mirrored ViewSwitcher grid updated in sync.)
- **Card sizing:** cover is a **fixed 200px** height (was `aspect-video`, which ballooned as cards widened); excerpt **`line-clamp-2`** — tuned so ~4 cards show on screen.
- **Blurb / summary split:** added **`blurb`** frontmatter (drives the card preview, clamped 2 lines, falls back to body excerpt); **`summary`** reserved for SEO/OG, no longer drives the card. Footy has both.

### ⚠️ Open / to confirm / TODO
- ⚠️ **8 placeholder cards RESTORED (throwaway)** — `git restore`d to eyeball multi-card sizing. Only `footy.mdx` is real; **re-delete the 8 before launch** (they're in HEAD; `git rm` or delete). Footy sorts last (2025 date) under the 2026-dated placeholders.
- **3 masters to re-drop** — `typography`, `component-set-1`, `components2` (deleted before the convention; only 1600px WebPs survive). `colours` already re-dropped.
- **`role` label provisional** — `footy.mdx` `role: "Product & Visual Designer · 2025"` + `# TODO(role)`. Revisit LAST, per user.
- **Draft indigo hero line** — the "armchair philosopher…" alternate in `page.tsx` is parked for future consideration (not live).
- **Orphaned `/public` images** — `batman.jpg` + 5 unsplash unused by cards but still used by `ProductIdeas` (`TEMP_IDEAS`). Keep for now.

### Parked (explicit — address last)
- **Wide-screen layout** — on large monitors the bounded margin + flexing cards + fixed nav need a deliberate pass (cards/margins can get large). User parked this for after everything else.

### Resume here — next up
- **Re-delete the 8 placeholder cards** when done eyeballing (launch = footy only for now).
- **Add Heyfood** (then Energy) — Heyfood = cleanest narrative (5 imgs, no video). Energy walkthrough is a YouTube Short (external) → embed/link, not download.
- **Product-ideas** still placeholder (`TEMP_IDEAS`); **`essays`** → wordpress link — decide destinations.
- Revisit provisional `role` (last). Then: wide-screen pass; push to Vercel; OG/sitemap/robots.

---

## Session 6 — 2026-05-26

### Summary — in-place detail replaces the modal; palette overhaul; 2-column refactor
A long live-iteration session. Net: the **modal is gone**, replaced by an **in-place case-study view**; the layout dropped to **two columns**; the palette was retuned to a **warm peach field with white surfaces**; scrollbars are hidden; new background-tracking tokens added.

- **Explored, then adopted, the in-place pattern.** Prototyped one card opening its case study *in place* (swapping the cards column for the detail, nav panel staying put) vs. the modal. Reading measure **44rem** (narrower than the modal's wide panel — better). Decided to make it the pattern.
- **`.view-enter` motion** added (`globals.css`): gentle fade + 8px rise as the detail replaces the grid; reduced-motion-safe. (No shared-element/container-transform — deliberate; the modal's grow-into-panel animation was retired with it.)
- **Full-screen image handling (`globals.css`):** lone breakout images in `.case-body` are now bounded by **height** (`--shot-max-h`, default `min(36rem,75vh)`) as well as width, so a tall portrait phone screen scales down + centers instead of stretching huge. Wide landscapes still fill the column. Scoped to `> p:has(img) > img` (Footy 2-up grid / `<Figure>` / `<Compare>` untouched). Also tightened the **image→italic-caption gap to 8px** (zeroed the img + wrapper bottom margins; caption owns the 8px top margin).
- **ViewSwitcher fix:** the in-place `detail` slug was lifted into **`ViewContext`** (`detail`/`setDetail`) so the switcher can **hide while a detail is open** (cards aren't rendered then).
- **Hover blur removed:** the card hover spotlight now only **dims** others (`opacity:.6`), no blur. Blur + dim is **kept for keyboard `:focus-visible`**.
- **PALETTE OVERHAUL (long A/B pass; final values in `globals.css`):**
  - **`--background: #FAE8DB`** — warm cream-peach field (the one dial; walked ffffff↔e9edf0↔f0e9ef↔ffb581↔ffc39a↔f8d7c0↔fbe8da↔fae8db). Bold peaches washed out the accent; this is the settled warm-but-calm point.
  - **`--nav-fill: #FFFFFF`** — now white = **raised surfaces** (nav panel, **cards**, left rail when present). Cards got an explicit `bg-nav-fill` (they were transparent, so on a non-white field they'd vanish).
  - **`--card-ring`** → **tracks background**: `color-mix(--background 75%, --nav-fill)` (walked 55→45→25→75; 75 = soft, ring≈field; lower = whiter halo/cards pop more). No longer the old pink `#FBEEF8`.
  - **`--image-placeholder`** (NEW) → **tracks background**: `color-mix(--background 92%, --foreground)`. Stand-in card covers now read as an empty image well in the field, **not** the old `bg-accent/10` peach. Both card-cover spots use `bg-image-placeholder`.
  - **`--switcher-thumb`** (NEW) → **tracks accent**: `color-mix(--accent 40%, transparent)`. Decoupled the switcher thumb from `--accent-fill` (which stays 16% for the marker + active menu row) so the thumb can read stronger on the frosted track. The % is the legibility dial.
  - Convention going forward: **`--card-ring` + `--image-placeholder` auto-derive from `--background`**; tweak the field and they follow. Only the white surfaces + orange accent are fixed.
- **`.accent-fill` marker brought back:** the uneven highlighter-style marker now sits behind **"designer"** in the hero (replaced its `text-accent`). (Demoed on "some things i do" first.)
- **ViewSwitcher segments:** both active + de-selected are now **same weight + `text-foreground`** — the salmon thumb is the *sole* active indicator (a11y backed by `aria-pressed`). (De-selected was the receding muted grey before.)
- **LAYOUT: 3-col → 2-col (big refactor).** Grid is now **`lg:grid-cols-[minmax(0,1fr)_var(--nav-w)]`** = **viewspace + navbar**. The viewspace content (cards/carousel/detail) is capped to **`--content-w: 49rem`** and **centered** (`mx-auto`), so cards stay a constant readable width and surplus becomes balanced margin — **retires the parked wide-screen debt**. Nav moved to `col-start-1`→ now `col-start-2`; cards `col-start-1`. ViewSwitcher mirror grid + `ProductIdeas` cap re-synced to `--content-w`. The old left-gutter track + the brief left-rail experiment are gone.
- **Scrollbar:** tried (and reverted) a fixed-navbar/scrolling-viewspace model to move the scrollbar off the navbar; then tried recoloring the gutter; **settled on hiding scrollbars site-wide** (`scrollbar-width:none` + `::-webkit-scrollbar{display:none}`), dropped `scrollbar-gutter`. `html` bg = `--background`. Navbar bleeds full to the edge again.
- **MODAL REMOVED (the big one).** `ProjectsExplorer` rewritten: **every** card opens in-place; deleted the `<dialog>` system, the WAAPI container-transform (box/backdrop/grid-fade), `targetBox`/`setBox`, the modal scroll-lock, the `dialog::backdrop` CSS, the prototype scaffolding (`INLINE_PROTOTYPE_SLUG`, badge, `?inline=` param, `aria-haspopup`). The **URL hash (`#slug`)** now drives the in-place detail (deep-link + back/forward + Esc + focus-restore-to-card preserved).
- **`npm run build` passes; `/` fully static** (4 pages; only the benign Nata Sans font warning). **Nothing committed since `fb33273`** — this whole session is uncommitted.

### ⚠️ Open / to confirm / TODO (Session 6)
- **SEO regression (flagged, not yet addressed):** the modal kept *every* case-study body in the static HTML (crawlable). In-place renders only the active detail (hash-opened client-side), so case-study **text is no longer in the SSR output**. Option on the table: render all bodies into a hidden static block. **User to decide.**
- **Dead code:** `data-nav-panel` on the `<aside>` (only the modal's geometry read it) is now unused — safe to drop.
- **`redesigning-checkout.mdx`** (a placeholder) still holds the Footy **demo images** I dropped in to test image behaviour (`<Compare>`, `<Figure>`, a full phone screen) — remove with the placeholder cull.
- **"designer" marker** — the `.accent-fill` highlight on the hero word is the parked demo placement; confirm keep.
- Still pending from S5: **re-delete the 8 placeholder cards** (launch = footy only); add Heyfood then Energy; product-ideas real set; essays destination; revisit `role`; push to Vercel; OG/sitemap/robots.
