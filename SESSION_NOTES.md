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

### Session 7 — 2026-05-26 — gif decision parked + Footy doc re-render
- **Gif (`defifa_spinner.gif`, 1.83 MB, 459×360, 63 frames, in `/the-notion/.../The Footy Mini-App/`) parked** until we tackle videos. When we add motion: it's NOT optimal as a raw gif (body images render as native `<img>`, no on-the-fly conversion → ships full 1.83 MB + gif's 256-colour ceiling bands gradients). Path: **animated WebP** (full colour, ~5–8× smaller, stays an `<img>`, no `<video>` infra) — revisit alongside the **"no videos for now"** rule.

### ⏭️ Next session — to-do
- **Review the current UI card style** — revisit the project card design (cover/excerpt/"read more" treatment, ring/surface, sizing) before adding more case studies. Flagged this session, parked for a fresh look next time.

---

## Session 7 (cont.) — 2026-05-27 — Footy MDX polish · real routes · product-ideas build-out

### Footy case study + MDX components
- **Re-rendered `footy.mdx`** from Chukwuka's updated Notion doc. New structure: Overview → The Problem (Information Density / Visual Cohesion / State Communication) → Designing the System (Cohesive Visual System: colour + typography / Clarifying Information Hierarchy / Clearer State Communication) → The Outcome → Reflection. Headers demoted (`#`→`##`), Notion `---` dividers dropped, `tags` aligned to the doc. Images mapped: `before-score-square` / `colours` / `typography` / `<Compare>` state-before→after / the 9-screen grid. One slot left empty (`{/* TODO(image) */}` — the Info-Hierarchy "examples", no clean asset).
- **Subheading auto-numbering** via `.case-body` CSS counters: each `##` resets, each `###` increments → "1. …", restarting per section. Number neutral (inherits heading colour).
- **`.accent-fill` marker scoped to `##` only** (h2 override wraps text in a span); `###` is plain + numbered.
- **`<Screens>` component + `.screen-grid` rule** — centered, width-capped grid of app screens; knobs `cols` (default 3) + `width` (default 40rem); 1-col on mobile. Replaced the inline Footy screens grid.
- **`<Compare>`** — width-capped (`width` prop, default 40rem, `mx-auto`) + bigger/wider arrow (`text-4xl`, `⟶`).
- **Prose fixes:** list markers were near-invisible (prose-stone `stone-300` on the peach field) → `.case-body` sets `--tw-prose-bullets`/`--tw-prose-counters` to track `--foreground`. Body copy → `font-weight: 500` (headings/bold keep their weights). Moved "and" onto the penultimate bullet of each sentence-continuation list.

### Tokens / global
- **`--text-muted` now tracks `--foreground`**: `color-mix(in srgb, var(--foreground) 52%, var(--background))` (≈ the old hardcoded `#878286`). Joins the auto-deriving tokens.
- **Global `button { cursor: pointer }`** (+ `[role=button]`, excluding disabled) — Tailwind v4 Preflight reverted buttons to the native arrow; restores it for the switcher, nav buttons, carousel chevrons.

### Real routes (committed `4b6b561`)
- Views are now **real routes** under `app/(site)/`: `/` (projects), `/contact`, `/product-ideas`, sharing one chrome layout. Fixes (a) refresh always reset to projects and (b) the client-side view flash — each URL server-renders its own view; all routes stay static. `ViewContext` slimmed to `node` + `detail` (active view = pathname). `NavMenu`/`ViewSwitcher` → `<Link>` + `usePathname`. `CardsColumn` retired; `ProjectsExplorer` clears `detail` on unmount. SEO note from S6 is moot — the grid already ships a hidden crawlable copy of every body.

### Product ideas — data + covers + carousel
- **Data:** extracted to `src/content/ideas.ts` (typed `Idea[]` + `getIdeas()`), sibling to the MDX sections; promote-to-MDX path documented + pointer in `lib/content.ts`. `ProductIdeas.tsx` consumes `getIdeas()`.
- **Real covers (4):** `store-3` (Farcaster e-commerce), `grok-customisation`, `subscriptions-mini-app`, `arsenal-agent` — each with caption, intrinsic `width`/`height`, and a base64 `blurDataURL` (sharp LQIP) for `placeholder="blur"`. Masters → `/sources/ideas/` (gitignored), derivatives → `/public/ideas/`.
- **Cover aspect saga → resolved:** fixed 4:3 frame cropped the non-4:3 covers; tried a blurred-fill 4:3 (`scripts/cover-4x3.mjs`); tried per-image intrinsic frames; finally Chukwuka **re-exported all four at a uniform ~1.55:1 (2000×1293)**. Filenames versioned (`-v2/-v3/-v4`) to dodge the `next/image` same-URL stale-cache trap.
- **Cleanup:** TEMP placeholder ideas nuked; 6 orphaned `/public` Unsplash/batman images deleted; `width`/`height` made required on `Idea`; dead placeholder branch removed from the carousel.
- **Carousel single-page polish:** cover **height-capped** (`lg:max-h-[calc(100dvh-22rem)]`, `w-auto`) → scales down on short viewports, no scroll, no crop/letterbox. Caption aligned to image-frame width (`max-w-[calc(100%-6rem)]`) inset 32px (`px-8`), `font-medium`. Position counter moved **out of the frame** → frosted pill below (matches ViewSwitcher material), `text-accent`. Header in **Nico Moji** (`clamp(1.125rem,3.5vw,1.5rem)`), `mb-4` breathing room. **Product-ideas is the first genuinely-finished part of the app.**

### Lesson (cache)
- Don't run `npm run build` while `next dev` is live — they share `.next` and the prod build corrupts the dev server (broke the page mid-session). Verify with `tsc --noEmit` (doesn't touch `.next`) or the dev server's own compile. For cover swaps, also clear `.next/cache/images` or version the filename.

### ⚠️ Open / still pending
- **Re-delete the 8 placeholder case-study cards** (+ `redesigning-checkout.mdx` with its demo images) — `src/content/work/` still holds them alongside `footy.mdx`; the grid shows all 9. Launch = footy (+ Heyfood/Energy when added).
- Footy loose ends: the one empty image slot (Info-Hierarchy "examples"); provisional `role`; the indigo DRAFT hero alternate; the gif (animated-WebP, with the videos pass).
- Add **Heyfood** then **Energy**; **essays** → WordPress destination.
- Consider **blur placeholders** for case-study card covers too (ideas already have them).
- Push to **Vercel**; OG/sitemap/robots.
- (Still queued) **review the current UI card style** before adding more case studies.

---

## Session 8 — 2026-06-01 — Heyfood landed (no cover)

### Summary
- **Added the Heyfood case study** (`src/content/work/heyfood.mdx`). Voice kept first-person + personal (Tiwa Savage / Ibadan / Chowdeck) — deliberately different register from Footy (which is professional/distanced). Structure: **Overview → The Problem → The Process → The Screens → Reflection** (4 `##` sections after Overview; the auto-numbered `###` device wasn't needed — Heyfood's flatter than Footy).
- **Cover deferred** — only landscape source asset is `Frame_246.png` (sparse wireframe-y diagram, weak as a thumbnail); the visual payoff is the two redesigned phones (portraits, crop badly per the Footy lesson). Frontmatter ships without `image:` → ProjectsExplorer renders the `bg-image-placeholder` block. Options surfaced: composite the two phones side-by-side OR use Frame_246 as-is OR defer. **User chose defer**; revisit with a stronger asset (or accept the placeholder).
- **Image pipeline (S5 policy, unchanged):** masters → `sources/work/heyfood/` (gitignored): `current-checkout.png` / `categories.png` / `split-flow.png` / `redesigned-order.png` / `redesigned-payment.png`. Derivatives → `public/work/heyfood/*.webp` via inline `sharp`: phone screens + categories sheet near-lossless, the wide diagram (`split-flow`) q80. **Totals: 5 PNGs (~880KB) → 5 WebPs (~250KB), longest edge 1600.** Video (`heyfood.mp4`) skipped per the "no videos for now" rule (parked alongside Footy's gif for the videos pass).
- **Compare vs Screens call:** opted for `<Screens cols={2} width="34rem">` for the two redesigned screens rather than `<Compare>`. Reasoning: the narrative is "step 1 → step 2", not "before → after"; the screens are tall portraits (1:2.17 and 1:2.51), and `<Compare>`'s `items-stretch + object-cover` would crop ~15% off the sides of the shorter one (the order-summary screen). `<Screens cols={2}>` shows both at natural aspect. JSX comment in the MDX records the alt path so future-you can swap.
- **Sort order check:** Footy `2025-10-15` ▸ Heyfood `2024-06-01` (provisional). When the 9 placeholders get culled, the grid becomes **Footy → Heyfood** (newest first). Heyfood `date` + `role` both flagged `# TODO` like Footy was — revisit together.
- **Verified:** `tsc --noEmit` clean; dev server :3000 returns 200; Heyfood body present in SSR HTML (Tiwa Savage / Miller / Constantia / over-stuffed / categories all grep-positive); card title + blurb render. Did **not** run `npm run build` (S7 lesson: corrupts dev server's `.next`).

### ⚠️ Open / still pending (deltas)
- ~~Add Heyfood~~ ✅ done; **Energy** still queued.
- **Heyfood cover** — deferred; placeholder is live. Composite-the-two-phones is the leading option if user picks it back up.
- **Heyfood `date` + `role`** — both provisional with `# TODO` comments. Bundle the revisit with Footy's `role` TODO.
- All previous open items unchanged (re-delete 8 placeholders, Footy loose ends, essays destination, blur placeholders for work covers, Vercel/OG/sitemap/robots, card-style review).

### Session 8 (cont.) — same day — caption system overhaul · Compare refactor · Heyfood body rewrite
A long iteration session. The initial Heyfood landing above became the starting point for a much bigger arc: unifying every case-study caption through `<figure>/<figcaption>`, refactoring `<Compare>`, and rewriting the Heyfood body from a fresh Notion export.

#### Featured = pin · card hover (small UX shifts up front)
- **`featured` repurposed from "homepage rail" → "pin to top of listing".** `getAllMeta` (`lib/content.ts`) now sorts `featured: true` ahead of date-desc within each group. Footy + Heyfood pinned; stripped `featured: true` from two placeholders (`onboarding-activation`, `redesigning-checkout`) that were stealing the top slots via newer dates. Frontmatter doc updated. Sort is durable past the placeholder cull (both still pinned, falls through to date-desc cleanly).
- **Cards get an accent outline on hover** (matching the existing `focus-visible` treatment). `hover:outline-2 hover:outline-offset-2 hover:outline-accent` on `.project-card` (`ProjectsExplorer.tsx`). Tailwind's `hover:` is `@media (hover: hover)`-gated → won't sticky-fire on touch.

#### Caption system overhaul — `<figure>/<figcaption>` is now the single truth
- **Diagnosis.** Captions on `<Figure>` / `<Screens>` / `<Compare>` sat ~32px below their media instead of the intended 8px. Cause: each component's outer wrapper had `my-8` (or `margin-block: 2rem`), and the caption's `margin-top: 8px` collapsed against the larger 32px → max wins. The old fix had been a `:has(+ p:has(> em:only-child))` selector to zero the wrapper's margin-bottom when followed by a caption — but it never matched in practice (browser cascade quirk with nested `:has()` + sibling combinator).
- **Real fix.** Added an optional `caption` prop to **`<Figure>`**, **`<Screens>`**, and **`<Compare>`**. When set, the component renders `<figure><media/><figcaption>{caption}</figcaption></figure>`, owning the image↔caption gap **internally** — no sibling-selector hack needed. New CSS:
  - `.case-body figure { margin-block: 2rem }` (outer 32px stays)
  - `.case-body figure > img/div/picture { margin-block: 0 }` (internal media zeroed)
  - `.case-body figure > figcaption { margin-top: 8px; max-width: 36rem; margin-inline: auto; text-align: center; font-size: 0.875rem; line-height: 1.3; color: var(--text-muted) }` (tightened from 28rem after "After (right): …" wrapped in Footy's Compare caption)
  - `.case-body figure > figcaption > p { margin: 0 }` (for two-`<p>` captions like Footy's split before/after)
  - **`.case-body figure img { margin-block: 0 }`** (NOT `margin: 0` — that shorthand trampled `margin-inline: auto` and left `<Figure>` images left-aligned. Burned an hour on it before catching that subtlety.)
- **Captions are upright** (italics dropped from figcaption styling). Markdown-image italic em also overridden to upright while the placeholder still uses that path.
- **All real case studies now route every caption through the figcaption path.** Orphan rules deleted: `.case-body > p:has(> em:only-child)` (the lone-italic-p styling) and its `> em { font-style: normal }` follower. The only remaining `*caption*` usage is the throwaway `redesigning-checkout.mdx` placeholder (renders acceptably with prose defaults until the cull).
- **Gap below uncaptioned markdown images** patched: `.case-body > p:has(img) + :not(p:has( > em:only-child)) { margin-top: 2rem }` so Footy's `before-score-square` shot sits 32px above AND below its surrounding paragraphs (the existing `margin-bottom: 0` on the image-wrapper was leaving a tight ~20px below).

#### `<Compare>` refactor — ghost-space fix + SVG arrow + split caption
- **Flex+image ghost-space bug.** Inside the Compare row, the two phone images didn't reliably stretch to the container height: `align-self: stretch` is silently ignored on images with an intrinsic aspect-ratio (browsers treat the aspect-derived height as "definite enough" to skip the stretch), so the shorter image left empty space below it AND prose's `margin-top: 2em` pushed each image down inside its cell, leaving a phantom strip above.
- **Fix:** each img now lives inside a flex-1 wrapper div with an explicit `aspect-ratio` (default `9 / 20`, configurable via the new `aspect` prop). Cells render at identical w×h; the img inside fills via `h-full w-full object-cover`. Margins on imgs inside figures zeroed (see caption section above). No more ghost space.
- **SVG arrow** replaces the `⟶` unicode glyph. Inline 48×40 SVG, `stroke="currentColor"`, `stroke-width="4"`, round caps/joins. Precise visual weight; font-independent. Inherits `text-accent` via `currentColor`.
- **Two-line caption support via `captionBefore` / `captionAfter` string props.** The `caption` prop also accepts ReactNode, but a JSX-expression `caption={<><p>…</p><p>…</p></>}` is **silently dropped by `next-mdx-remote/rsc`** (same class of bug as `cols={2}` not propagating — only `caption="…"` strings or `cols="2"` strings make it through). Component composes the two strings into `<p>` + `<p>` inside the figcaption when set. Footy's "Before (left): … / After (right): …" caption now stacks on two lines.

#### Heyfood — image swap, caption unification, full body rewrite
- **Image swap (3 of 5 slots).** New files dropped at `/portfolio/` root: `information-categories.png` / `screen-split-architecture.png` / `redesigned-payment.png`. **Slot rename** for the two diagrams to match descriptive names: `categories.webp` → **`information-categories.webp`**, `split-flow.webp` → **`screen-split-architecture.webp`**. `redesigned-payment.webp` content updated, name preserved. Old derivatives deleted from `/public`; old PNG masters left in `/sources` as gitignored orphans (per the "mv into /sources, never rm" convention). New WebPs: ~135KB total (q80 for the two landscape diagrams, near-lossless for the phone screen).
- **All Heyfood captions now go through `<Figure caption>` / `<Screens caption>`.** The two markdown-image+`*caption*` pairs converted to `<Figure>` calls. Final captions (sentence case): "The current Heyfood checkout" · "Information categories" · "Screen split architecture" · "The redesigned flow — step 1 (order summary) on the left, step 2 (payment) on the right."
- **`<Figure width>` dial for landscape diagrams** — walked 66% (off-balance: caption hung past image) → 80% → **100%** (image fills case-body; caption sits inside its bounds). Current-checkout keeps explicit `width="18rem"` (narrow phone, intentional).
- **Body fully rewritten** from a new Notion export the user landed mid-session (`/the-notion/.../The Heyfood Redesign (Case Study) …md`). New structure: **Overview → The Problem → Designing the System (with `### Final Review Before Commitment` / `### Supporting Alternative Purchase Paths`) → The Outcome → Reflection**. Voice shifted from personal/casual (old: "Tiwa Savage", "four years on", "frankly the motivation") to measured/analytic ("multivariable decision-making", "sequential choice architecture"). User's tone-feedback iteration:
  - Reintroduced **Chowdeck** name into the Overview as a credibility marker ("Eventually I settled on Chowdeck because it was better designed, more visually appealing, and frankly the mental models just made more sense (especially when it came to ordering food).")
  - Split the "Despite that…" sentence into its own paragraph for rhythm
  - Added a **typography-elevation Reflection paragraph** ("Changing the typeface elevated the design so much, and I wasn't expecting that at all").
- **Frontmatter aligned to Notion source:** title → "Heyfood Checkout Redesign"; tags → `["UX Design", "Information Architecture", "Mobile Design"]`. Summary reframed (dropped Miller's Law).

#### Layout/visual polish
- **Header underline** bumped `border-b-2` → **`border-b-4`** on the case-study detail (`ProjectsExplorer.tsx`) to match the nav panel's two `h-1 bg-accent` rules (both now read as the same 4px accent line).

#### MDX gotcha (logged for future me)
- `next-mdx-remote/rsc` **silently drops JSX-expression props in MDX** for at least two cases: numeric expressions (`cols={2}`) and JSX-fragment ReactNode expressions (`caption={<>…</>}`). The component receives `undefined` and falls back to its default. **String-form props work** (`cols="2"`, `caption="…"`, `captionBefore="…"`, etc.). Footy's `<Screens cols={3}>` only ever "worked" because `3` matched the default. New convention: always use string-form props in MDX.

#### Turbopack wedging — diagnosed
- Twice this session the dev server stopped recompiling CSS after a globals.css edit (chunk URL stable, content stale, even after `touch` and restart). Cause is a known **Turbopack ↔ Tailwind v4 CSS HMR desync** — when file-watch events arrive mid-rebuild, Tailwind's incremental output and Turbopack's chunk cache can fall out of sync; Turbopack keeps serving the previously-built chunk under the same stable filename. JS HMR keeps working through it; only CSS gets stuck.
- **Workaround:** `rm -rf .next && npm run dev`. ~10s nuke + cold rebuild. Logged in DESIGN-adjacent notes via this entry; revisit if it gets noisy.

### ⚠️ Open / still pending (after Session 8)
- **Heyfood cover** — still deferred. Will revisit with a stronger asset (composite-the-two-phones leading option) or accept the placeholder long-term.
- **Heyfood `date` + `role`** — both still provisional with `# TODO` comments. Bundle with Footy's `role` TODO.
- **Re-delete the 8 placeholder case-study cards** (+ `redesigning-checkout.mdx`) — featured-pin keeps Footy/Heyfood at the top, but the placeholders still pollute the grid.
- **Energy case study** — still queued.
- **Footy loose ends** unchanged: empty Info-Hierarchy image slot, indigo DRAFT hero alternate, the gif (animated-WebP).
- **Push to Vercel; OG/sitemap/robots; essays destination; blur placeholders for work covers; card-style review** — all still queued.
- **Final pass on cover images (case studies + product ideas)** — once the rest of the site reads "done," revisit covers together so they look intentional side-by-side.
  - *Case studies:* Footy's `components.png` is workable but never deliberately art-directed; Heyfood is still placeholder.
  - *Product ideas:* canvases are uniform 2000×1293, but **content inside the frame is inconsistent** — `grok-customisation` and `retro-chat-app` have ~25% empty padding bands (top/bottom) while `store-3`/`subscriptions`/`arsenal-agent` fill the canvas edge-to-edge. Reads as both "shorter" covers AND a perceived **jump between slides 4↔5** in the carousel (frame is stable; the subject shrinks + the field swaps). Fix: re-export the two outliers with the content scaled up to fill the canvas (same 1.55:1 frame). Confirmed not a carousel bug — see `ProductIdeas.tsx:68` (`h-auto w-auto max-w-full lg:max-h-[…]`, no `object-fit` swap).
  - *Animated covers (parked design flag):* if a cover ever goes motion (animated-WebP path per S7 — `next/image` + `unoptimized`), looping motion next to four static neighbours will pull a lot of attention in the carousel. Prefer **single-play-on-enter** (animated WebP ending on a final frame) over perpetual loop. Decide before producing the asset.

---

## Session 9 — 2026-06-02 (started 2026-06-01) — content swaps · dark mode · tokenization sweep · theme toggle

A long, multi-arc session. Started with small content tweaks, ended with manual dark mode + a tri-state theme toggle wired in. Net result: the site now has a full dark theme (light is default, dark is opt-in or OS-driven), prose colors source from our tokens directly (no `prose-stone`/`dark:prose-invert`), and the token discipline has deepened (4 new CSS custom-properties + 2 `@utility` classes). **Nothing committed this session** — everything sits uncommitted on `main` past `4b6b561`.

### Small wins up front
- **Swapped Heyfood's first Outcome image.** New `redesigned-order.png` (root drop) → archived old master as `redesigned-order-v1.png` in `/sources/work/heyfood/`, regenerated derivative `public/work/heyfood/redesigned-order.webp` (736×1600, 68KB, near-lossless). Cleared `.next/cache/images` to dodge the S7 same-URL stale-cache trap. MDX unchanged (filename preserved).
- **Added a new product idea — `retro-chat-app`.** Master at 8000×5172 (aspect 1.547 — matched the existing 4 covers exactly). Pipeline: master → `/sources/ideas/`, derivative `/public/ideas/retro-chat-app-v1.webp` (2000×1293, 45KB, q80), LQIP `blurDataURL` generated via sharp. Wired into `src/content/ideas.ts` as the 5th idea. Caption: *"Messaging app but it's the 2010s again."*
- **TODO note added** for "final pass on cover images" — bundles Footy/Heyfood case-study covers + product-idea covers (incl. the grok-customisation / retro-chat-app padding bands) + the animated-cover design flag (single-play > loop in a carousel of statics). Diagnostic captured so future-me doesn't have to re-derive: same canvas, content too small inside, fix = re-export with content scaled to fill the 1.55:1 frame. Not a carousel bug — see `ProductIdeas.tsx:68`.

### Dark mode — first OS-driven pass
- **Audited the codebase for theme-readiness first.** Zero hardcoded hexes outside `globals.css` in components (across 9 files, all reach through tokens). Only outlier: the indigo `text-[#4f46e5]` draft hero line in `(site)/layout.tsx:69` (deliberately off-brand, kept as-is). The token discipline from S2 onward made this trivial.
- **One CSS block added.** `@media (prefers-color-scheme: dark) :root { --background … --foreground … --nav-fill … --border … color-scheme: dark }` — only flips the four colour primitives; the auto-derived tokens (`--accent-fill`, `--switcher-thumb`, `--card-ring`, `--image-placeholder`, `--text-muted`) cascade automatically because they're `color-mix()` of these. Folded the standalone `:root { color-scheme: light }` block into the main `:root`.
- **Debugged "I switched OS to dark, nothing happened."** Cause was **Chrome's own appearance setting** (`chrome://settings/appearance`) overriding the OS — when Chrome's theme is "Light," it reports `prefers-color-scheme: light` to all sites no matter what the OS says. Fix: set Chrome appearance → "Device." Logged as a debug cookbook entry.
- **Palette iteration — landed on COFFEE.** Walked the warm-dark spec: original draft (`#1c1715`) → "slightly darker" (`#181311`) → "espresso swing" (`#0e0a08`, too much) → **landed on COFFEE `#181311 / #241c19 / #362c28`** (field / nav-fill / border). Foreground stayed `#f4ead8` (warm cream, never changed). Espresso parked as commented-out alternate in `globals.css` for future eyeball.
- **Case-study readability fix.** Prose-stone palette defaults rendered body/headings as near-invisible stone tones on the coffee field. First fix: added `dark:prose-invert` to the wrapper. Then **refactored to source the entire prose palette from OUR tokens** (`--tw-prose-body`/`-headings`/`-bold`/`-links`/`-quotes`/`-code`/`-hr`/`-th-borders`/`-td-borders`/`-captions` all → `var(--foreground)` / `var(--accent)` / `var(--text-muted)` / `var(--border)`). Dropped `prose-stone dark:prose-invert` from the wrapper — single source of truth.

### Tokenization sweep
Audited the codebase for tokenization candidates, ranked by leverage. Five items landed:

| # | Token / Utility | Was | Now |
|---|---|---|---|
| 1 | `--reading-measure: 42rem` + `--caption-measure: 36rem` | 42rem in `.case-body`, **44rem** in `ProjectsExplorer.tsx:109`, 36rem in figcaption | Single dial each; **42/44 drift killed** (unified at 42) |
| 2 | `--card-cover-h: 12.5rem` | `h-[200px]` × 2 in `ProjectsExplorer.tsx` | `h-[var(--card-cover-h)]` |
| 3 | `--ease-house: cubic-bezier(0.65, 0, 0.35, 1)` | inline in `.view-enter` | `var(--ease-house)`; switcher's `ease-out` deliberately NOT unified (different intent — snappy slide ≠ scene change) |
| 4 | `@utility frosted` | `border border-border bg-background/70 shadow-sm backdrop-blur` × 3 callsites | Single class. Shadow uses pure-black-low-alpha (theme-neutral; foreground-mix would glow in dark) |
| 5 | `@utility focus-ring` | `focus-visible:outline-2 outline-offset-2 outline-accent` × 2 callsites | Single class; `:focus-visible` baked in via Tailwind v4 `& { &:focus-visible {…} }` |

Side cleanup while in the file: stray `8px` → `0.5rem` for the typographic figcaption margin + the view-enter `translateY`. **Left intentionally in `px`**: shadow-blur / spread / offset values + `filter: blur(2px)` — these are render-pixel effects, *invariant* to root font-size by design.

**Drifts flagged**:
- A) Reading-measure 42 vs 44 — resolved by #1.
- B) `Contact.tsx` CTA uses `focus-visible:ring-2 ... ring-offset-2 ring-offset-background` while everywhere else uses `outline-*`. **Parked** for the Contact restyle.

### Theme toggle — the climax (manual override on top of OS)
- **Matrix coord wiring fully nuked first.** `MatrixReadout.tsx` deleted; `node`/`setNode`/`NodeCoord` removed from `ViewContext` (now `detail`/`setDetail` only); `ProjectsExplorer` lost its 4 hover/focus handlers + the `COLS` constant + the unused `i` map index. Brand name "chukwuka's matrix" stays (it's the logo, unrelated).
- **CSS restructured for dual triggers.** Dark palette values factored into `--*-dark` siblings in `:root` (single source of truth). Two trigger blocks both re-point the live tokens at those siblings:
  - `@media (prefers-color-scheme: dark) :root:not([data-theme="light"])` — system dark, *unless* user has explicitly forced light.
  - `:root[data-theme="dark"]` — user has explicitly toggled dark (regardless of OS).
  - Espresso block carried over as parked alternate.
- **Pre-paint script** added to root `<head>` (inline IIFE wrapped in try/catch). Reads `localStorage.getItem('theme')`, sets `html[data-theme]` synchronously before paint — no FOUC on reload when user has forced a theme. `<html suppressHydrationWarning>` (canonical Next.js pattern; React can't see the post-paint attribute mutation).
- **`ThemeToggle.tsx` — long iteration.** Originally built as a **single cycle button** (light → system → dark → click again to cycle), with SVG icons that swapped on state. User wanted all three visible → **rebuilt as a segmented control** mirroring the ViewSwitcher design language (frosted track, sliding thumb 33.333% wide, `motion-safe:transition-transform`, three sun/monitor/moon SVG icons). `aria-pressed` per segment + `aria-label` strings.
- **SSR-safe pattern.** Initial state = "system"; `useEffect` reconciles to localStorage post-mount. The cycle/choose function writes both `html.dataset.theme` AND `localStorage` (or deletes both when returning to "system"). One frame of possible icon mismatch on hydration — no warning, no layout shift.
- **Centering bug:** initial `inline-flex` + `mx-auto` didn't work (auto margins need block-level + defined width). Fixed: `inline-grid` → `grid` + `w-full`.
- **Width match to nav buttons.** Final form: `grid w-full grid-cols-3`; segments `w-full` so each fills its 1/3 grid cell. Lines up exactly with the menu buttons above.
- **Centered-in-viewport-tail layout.** User clocked that the toggle was glued 48px below the bottom accent rule (`mt-12`), not centered in the gap between the rule and viewport bottom — so on tall viewports it looked top-heavy in the tail. Restructured the sticky wrapper:
  - `lg:flex lg:h-[calc(100dvh-2rem)] lg:flex-col` on the sticky inner wrapper.
  - **Upper block** = logo + hero + rules + menu (natural height).
  - **Lower block** = `lg:flex lg:flex-1 lg:items-center lg:justify-center` — fills the remaining tail and centers the toggle inside it.
  - Mobile keeps `mt-12 lg:mt-0` natural stacking (mobile re-jig deferred — user's note).
  - **Concession flagged**: if the upper content grows tall enough to fight for space with the lower block on a short viewport, the toggle gets crushed. Current content has lots of headroom; revisit if menu/hero balloons.
- **`tsc --noEmit` clean** throughout.

### Things still parked / open after Session 9
- **Bribe project** — next session starts here per user's explicit pointer. Add a case study NOT in the Notion export. (Will need a slug, frontmatter, body, and at minimum a cover/image strategy.)
- **Re-delete the 8 placeholder case studies** (+ `redesigning-checkout.mdx` placeholder demo images) — featured-pin keeps Footy/Heyfood top, but the grid still shows 9 cards.
- **Heyfood**: cover deferred (placeholder live); full body rewrite from latest Notion landed S8.
- **Energy case study** — still queued.
- **Footy loose ends**: empty Info-Hierarchy image slot; the indigo DRAFT hero alternate; the gif (animated-WebP path).
- **Drift B (`Contact.tsx` `ring-*` vs `outline-*`)** — bundled with Contact restyle.
- **Mobile re-jig of the nav panel** — user-flagged; not started.
- **Push to Vercel; OG/sitemap/robots; essays destination; blur placeholders for work covers; card-style review** — all still queued.
- **Final pass on cover images (case studies + product ideas)** — see expanded TODO above; includes the animated-cover design flag.
- **Final pass on frontmatter (`date` + `role` across all case studies)** — every case study currently ships with provisional `# TODO(date)` and/or `# TODO(role)` comments: Footy `role`, Heyfood `date` + `role`, Bribe `date` + `role`. Revisit together once everything else reads "done" so the labels stay consistent across the grid (and the chronological sort order is intentional, not provisional). Inline `# TODO` comments stay in the MDX files as code-level breadcrumbs; this is the cross-file tracker.

### Decisions worth recording in DESIGN.md (TODO this session-end)
- Dark mode: warm coffee palette, single source of truth via `--*-dark` siblings, two triggers (OS + explicit `data-theme="dark"`), `prefers-color-scheme: dark` respects an explicit-light override via `:not([data-theme="light"])`.
- Prose tokens: now sourced from `--foreground` / `--accent` / `--text-muted` / `--border` directly. `prose-stone` and `dark:prose-invert` dropped.
- New tokens: `--reading-measure: 42rem`, `--caption-measure: 36rem`, `--card-cover-h: 12.5rem`, `--ease-house`.
- New utilities: `@utility frosted`, `@utility focus-ring`.
- "Render-pixel values stay in px" (shadows, filter-blur) — typographic / layout values go in rem. Established this session.

### Session 9 (cont.) — same day — clear-the-deck (cull · sync · commit)
A short housekeeping pass before opening the Bribe project. Three discrete moves:

- **Culled the 8 placeholder case studies.** `rm`'d `dashboard-hierarchy.mdx`, `design-system-foundations.mdx`, `empty-states-onboarding.mdx`, `notifications-attention.mdx`, `onboarding-activation.mdx`, `pricing-page-clarity.mdx`, `redesigning-checkout.mdx`, `search-that-feels-fast.mdx` from `src/content/work/`. Grid is now real work only (**Footy + Heyfood**, in that order via featured-pin → date-desc). `redesigning-checkout.mdx` had a few Footy demo images inlined for testing (`<Compare>`, `<Figure>`, full phone screen) — those images live under `/public/work/footy/` and are still referenced by `footy.mdx`, so no asset cleanup needed.
- **Synced DESIGN.md** to S9's working tree. Most S9 decisions had already been written in (prose tokens, reading-measure / card-cover-h / ease-house, frosted/focus-ring utilities, dark-mode coffee palette + dual triggers, "render-pixel values stay in px"). What was still stale:
  - **Matrix readout block retired** (Layout & Structure) — component was deleted in S9; the doc still described it. Rewrote the bullet as "retired 2026-06-02" + noted the tail slot is now the theme toggle.
  - **`ViewContext` description** (Stack & Architecture) — was `(node, detail)`; now `(detail)` only, with a `node`-removal aside.
  - **Nav-panel content order** (Layout & Structure) — bottom item was "matrix readout"; now describes the theme toggle's **centered-in-viewport-tail** layout (sticky `flex h-[calc(100dvh-2rem)] flex-col`, upper natural-height block, lower `flex-1 items-center justify-center` block), with the short-viewport-crush concession flagged.
- **Found and corrected an S9 misread.** S9 said "nothing committed past `4b6b561`" — actually S7 (`545b258`, product-ideas) and S8 (`3e95800`, Heyfood + caption system) were both committed. So this commit covers **S9 only**: dark mode, theme toggle, tokenization sweep, Matrix coord wiring nuke, retro-chat-app addition, Heyfood `redesigned-order` swap, prose-token refactor — plus this session's cull + DESIGN.md sync.

#### Staged for the commit
- All S9 component/CSS/layout changes (`globals.css`, `layout.tsx` × 2, `ProductIdeas.tsx`, `ProjectsExplorer.tsx`, `ViewContext.tsx`, `ViewSwitcher.tsx`, `ideas.ts`).
- New files: `ThemeToggle.tsx`, `public/ideas/retro-chat-app-v1.webp`.
- Deletion: `MatrixReadout.tsx`.
- Heyfood asset swap: `public/work/heyfood/redesigned-order.webp`.
- 8 placeholder MDX deletions in `src/content/work/`.
- `DESIGN.md` + `SESSION_NOTES.md`.

#### Staying out of this commit
- **`bribe.png`** (root-drop) — for the next phase; will land with the Bribe case study.
- **`Mockuuups Free mockup of man in khaki shirt holding the iPhone.jpeg`** (root-drop) — unused since project start. Not part of this commit; can be `mv`'d into `/sources` or deleted later if confirmed dead.

#### Verification
- `tsc --noEmit` clean before commit.
- Did **not** run `npm run build` (S7 lesson: corrupts dev server's `.next` if dev is live).

### Resume here — Bribe
With the deck clear, next is the **Bribe project** — a case study NOT in the Notion export. Needs slug, frontmatter, body, cover/image strategy. `bribe.png` already in root waiting to be processed via the masters/derivatives convention.

### Useful commands (unchanged)
- `npx tsc --noEmit` for type-only verification (doesn't touch `.next` — safe with dev server live).
- `rm -rf .next/cache/images` when an image filename is preserved across a content swap (S7 cache trap workaround).

---

## Session 10 — 2026-06-02 (cont. into 06-03) — Bribe landed · reload-fix duo · Footy polish + heading standardisation

A long, multi-arc session in three movements: **(a)** Bribe case study end-to-end (file, body, 8 images through the pipeline, cover A/B); **(b)** two visible-flash reload bugs killed with the same pre-paint-script + CSS-mask recipe; **(c)** Footy polish — frontmatter pass with global side-effects (`tags` dropped, `type` pill introduced, card-button→card-div for HTML validity), Outcome rewrite (3 composites replace the 9-screen grid), and a heading-name standardisation across all three case studies.

### Bribe — end-to-end landing
- **`bribe.mdx`** authored from Notion source. Image pipeline through `/sources/work/bribe/` + `/public/work/bribe/`: `definition.png` + `matrix-narrative.png` (base64-extracted from Notion md), `matrix-colour-palette.webp`, `bribe-logo.webp` (closes The Design System section), `before.webp` (single composite of 4 mini-app screens — replaced an earlier `<Screens cols=4>` grid the user briefly tried), `outcome-1/2/3.webp` (storyboard composites grouping the redesigned screens by flow stage).
- **Cover A/B** via versioned filenames: `cover-v1.webp` (from `bribe-cover-1.png`) and `cover-v2.webp` (from `bribe-cover-2.jpeg`); settled on **v1**. Versioning pattern bulletproofs the S7 cache trap (different URL = cold fetch).
- **Notion archive consolidation:** Footy + Heyfood + Bribe source `.md` files now sit alongside their curated masters in `/sources/work/<slug>/`. Once Energy lands, `/the-notion` can be deleted entirely.
- **Lesson — base64 image res:** Notion's md export embeds inline images at thumbnail-size (~624px wide). Mid-session the user re-exported `definition.png` (1614×638) and `matrix-narrative.png` (1498×1482) at higher res — and asked for PNG-direct paths instead of WebP "for max clarity." The previous softness was source resolution, not codec (near-lossless WebP would have been visually identical at the new sizes) — but PNG was their stated preference.

### Reload-fix duo — pre-paint script + CSS mask pattern
Two visible-flash bugs on reload, same architectural cause, same fix shape.

#### 1. Theme-toggle thumb flashing system → light on every reload
SSR couldn't read localStorage → segmented thumb rendered in the `system` cell → useEffect reconciled to `light` post-hydration → user saw a brief thumb slide on every page load.

First attempt — gate the `transition-transform` class on a double-rAF `animate` flag — killed the slide *animation* only. The visible flash itself persisted because the first paint still showed the wrong cell.

**Final fix — CSS-driven thumb position via `html[data-theme]`:**
- New CSS: `.theme-thumb { transform: translateX(100%) }` (system default); `html[data-theme="light"] .theme-thumb { transform: translateX(0) }`; `html[data-theme="dark"] .theme-thumb { transform: translateX(200%) }`
- React component drops `style={{ transform }}`; thumb just carries the `theme-thumb` class
- The existing pre-paint script (which already set `html[data-theme]` from localStorage before paint) now resolves the correct transform *before the browser paints anything*. No React in the visual loop.
- `animate` flag retained — gates the transition class — so user clicks still slide; reload commits the corrected position instantly.

#### 2. Case-study reload (`/#slug`) flashed grid before detail swap
Architectural: SSR has no access to `location.hash` (browsers strip `#` server-side); `/#bribe` reload SSR'd the grid, painted it, then `useEffect` read the hash post-hydration and swapped to detail. Cold JS bundle = visible window of 100-300ms with grid showing.

**Fix — pre-paint mask + `useLayoutEffect`:**
- New inline `<head>` script in `layout.tsx`: `if (location.hash.length > 1) document.documentElement.dataset.detailPending = '1'`
- CSS: `html[data-detail-pending] .project-grid { visibility: hidden }` (visibility, not display — keeps layout stable through the JS-load window).
- `ProjectsExplorer` initial hash read moved from `useEffect` → `useLayoutEffect`. setState in useLayoutEffect forces a *synchronous* re-render before paint; we then `delete dataset.detailPending` in the same effect (still pre-paint). First paint shows the detail view, never the grid.
- Subsequent hash changes (popstate/hashchange) stay async in a regular useEffect.

#### Lesson — same recipe both times
Anything the server doesn't know about (localStorage, location.hash) needs either to defer until post-paint (and accept a flash) OR be resolved by a pre-paint inline script that writes to `<html>` attributes. CSS then derives presentation, OR React uses `useLayoutEffect` to commit corrections before paint. Both fixes follow this pattern verbatim.

### Frontmatter pass (Footy walked end-to-end; Heyfood + Bribe partial)
- **`tags` field nuked globally** — declared in schema but never rendered anywhere. Same dead-metadata shape as the orphan `EntryList` component, also deleted this session (was the only consumer of `summary` for display). Type field dropped from `Frontmatter`.
- **`summary` kept distinct from `blurb`** — `summary` is genuinely SEO/OG-reserved (type comment says so); `blurb` is the card hook. Both are real; only `blurb` renders today. User passed summary-writing to me ("you're better at SEO than I am") — Footy summary tightened (drop leading "A", denser keyword cluster).
- **`role` → `type` migration introduced:** new optional `type?: string` added to `Frontmatter`; renderer prefers `type` over `role` when set. Value is uppercase (e.g. `"PRODUCT DESIGN"`) and renders as an **accent-fill pill** on card + detail-header — 12px semibold tracking-wider, `self-start` to defeat flex-column cross-axis stretch (the flex parent silently stretched `inline-block` items full-width before — surprised me), `bg-accent-fill`, `rounded-md`. Footy migrated. Heyfood + Bribe still on `role` — next session.
- **`featured` clarified** in conversation: it pins ABOVE non-featured but doesn't pick a winner within the tier — date-desc still sorts among featured. User un-featured Bribe so grid reads **Footy → Heyfood → Bribe**.
- **`date` kept** — invisible after EntryList delete (sort-only), but cheap metadata that unlocks future SEO surfaces (sitemap `lastmod`, OG `article:published_time`, JSON-LD `datePublished`). Date TODOs dropped from Heyfood + Bribe — pick plausible values; exact accuracy doesn't matter since the field's invisible.

### Card design pass (global, fall-out from the Footy walk)
- **Excerpt clamp** `line-clamp-2` → `line-clamp-3`. Room for ~130-char hooks without truncation.
- **Card title** `<p>` → `<h2>` with `text-xl` (20px), `text-balance`, hover/focus accent.
- **Detail-header title** `<h2>` → `<h1>`. Semantic fix — the case-study title IS the page's primary heading; body sections stay h2. Hierarchy is now clean h1 → h2 → h3.
- **Card root** refactored `<button>` → `<div role="button" tabIndex={0}>` + onKeyDown for Enter/Space. **Why:** `<button>` only permits phrasing content per HTML spec; `<h2>` (and the earlier `<p>`) inside `<button>` is invalid. Browsers auto-correct silently and divergently; React 19/Next 16 now surfaces this as a hydration mismatch warning that React 18 tolerated. Ref type `HTMLButtonElement` → `HTMLDivElement`. `focus-ring` utility carries.
- **Card cover slot** `h-[var(--card-cover-h)]` (200px fixed) → **`aspect-[31/20]`** (1.55:1). **Why:** every curated cover exports at 1.55:1 from Figma brand boards; the old fixed-200px slot resolved to ~1.76:1 at 22rem card width, horizontally cropping ~23px off each side. With aspect-ratio, covers render full-canvas; no crop. **Cover art direction is now prescriptive: export at 1.55:1.** `--card-cover-h` token removed. Cards grow ~13% taller — acceptable.

### Footy body work
- **Cover swapped twice** — `components.webp` → `footy-cover.webp` → `alt-cover.webp` (current, 52KB, settled).
- **Information Hierarchy section** — added `comparison.webp` (closes the S7-parked "Insert examples" TODO). Caption: *"The redesigned match cards drop the league pill and date — neither is essential to playing."*
- **Clearer State Communication section** — replaced `<Compare beforeSrc afterSrc>` two-image block with `<Figure src="state-changes.webp">` single composite. Two-line caption stacking preserved by adding **`captionBefore`/`captionAfter` props to `<Figure>`** (mirrors `<Compare>` from S8). Any future composite "before/after" Figure can now stack captions.
- **`before-score-square` master replaced twice** — once with the user's higher-res 1.87:1 export (28764×15384), then again with a cleaned-up version (initial export had visible numbering that was outdated post-rewrite). Archive lineage now `-v1` (7191×3846 original) · `-v2` (28764×15384 numbered) · canonical (28764×15384 cleaned).
- **Outcome section** — replaced 9-screen `<Screens cols={3}>` grid with **3 `<Figure>` composites** (storyboard groupings: match-list+selection, transaction confirmation, post-purchase states). 9 orphan `screen-1..9.webp` derivatives removed from `/public`; masters preserved in `/sources` per convention.
- **Outcome prose rewritten** at three lines: line 140 drops "nine screens" count; line 154 reframes Screens-2-9 reference to *"Beyond the entry point, every state is a variation of the same screen — sections updating dynamically as users move through selection, submission, and confirmation"*; line 138's portfolio-tagline opener (*"transformed Score Square from a rough proof-of-concept into a more cohesive and scalable product experience"*) replaced with a tone-matched version: *"The redesign tightened the visual language and interaction model of Score Square — turning an early prototype into a more coherent product."* Drops the boast, drops "scalable" claim that the body doesn't actually demonstrate.
- **Misplaced-asset incident** — user dropped `outcome-1/2/3.png` at root intending Footy; I read context as Bribe (since Bribe had `outcome-1/2/3` files) and processed them into `public/work/bribe/`. User caught it; Bribe reverted (restored from `-v1`/`-v2` master archives — the lineage is what enabled clean revert), misplaced assets moved to `/sources/work/footy/`, re-derived correctly. **Lesson: when filename matches an existing slot in another case study, ask before assuming.**

### Heading standardisation (across all three case studies — 9 edits)
All three case studies normalised to identical 5-section structure:

> **The Overview → The Problem → The Design System → The Outcome → The Reflection**

User initially proposed *"The Designing"* and *"The Reflections"*; pushed back on both:
- *"The Designing"* reads grammatically odd (present participle isn't a noun phrase). Landed on *"The Design System"* — more accurate to what the section covers (colour + typography + hierarchy + state).
- *"The Reflections"* (plural) broke the singular-noun rhythm. Landed on *"The Reflection"* (singular).

### Status

**Footy: DONE.** Frontmatter and body both complete. Zero TODOs.
```yaml
title: "Footy"
summary: "Visual overhaul and design system for Footy, a Farcaster football mini-app — starting with its flagship Score Square betting game."
blurb: "Redesigning a Farcaster football mini-app and building a design system for its visual language."
date: "2025-10-15"
type: "PRODUCT DESIGN"
image: "/work/footy/alt-cover.webp"
featured: true
```

**Bribe: image-complete, frontmatter partial.** Body fully landed (all 5 sections, every image hole closed). Frontmatter `role: "Visual Designer · 2026"` still pending migration to `type`; summary at 172 chars (over Google's 160 cap — needs trim); blurb has an em-dash; `featured: false` (un-featured this session to fix grid order).

**Heyfood: walk-through deferred to next session.** Cover still placeholder (S8 deferral; composite-the-two-phones leading option), `role` → `type` pending, summary + blurb refinement pending.

### Lessons logged this session
1. **Turbopack ↔ Tailwind v4 desync bit again** — twice. Edits to `globals.css` not appearing in the served CSS bundle. Workaround unchanged from S8: `rm -rf .next && npm run dev`.
2. **S7 cache trap also bit again** on body images — same `/public` path with different bytes serves stale. Two workarounds in play: (a) for `next/image` covers, `rm -rf .next/cache/images`; (b) for raw-`<img>` body images, version the filename (`outcome-1-v2.webp` pattern). **Versioning is bulletproof; cache-clear still needs a browser hard-refresh too.** Default to versioning on swap.
3. **`<img>` vs `next/image` for body** — body uses raw `<img>` because MDX images have unknown dimensions at author time. We trade `next/image`'s responsive `srcset` + format negotiation + blur placeholders for authoring simplicity. The masters/derivatives pipeline already does ~90% of what `next/image` provides for free.
4. **HTML invalidity catches up eventually.** `<button>` containing `<h2>` (or `<p>`, or any block element) is invalid per spec; browsers auto-correct silently and divergently. React 19/Next 16 now surfaces this as a hydration mismatch; React 18 tolerated it. Pattern: clickable cards containing structured content need `<div role="button" tabIndex={0}>` + keyboard handlers, not `<button>`.

### Things parked / next session
- **Heyfood walk-through** — start here. `role` → `type`, summary refinement, blurb review, cover decision (composite-the-two-phones, or accept placeholder long-term).
- **Bribe walk-through** — `role` → `type`, summary trim (172 → ≤160 chars), blurb review.
- **DESIGN.md sync (substantial drift this session):** drop `tags` from schema doc, `type` field + pill spec, `EntryList` orphan deletion, `line-clamp-3`, card-button → card-div pattern, theme-thumb CSS-driven, detail-pending mask + useLayoutEffect, `<Figure>` `captionBefore`/`captionAfter`, h1 promotion of detail-header title, `aspect-[31/20]` cover slot + removal of `--card-cover-h`. Lands before next batch so it doesn't drift further.
- **Footy `footy-cover.webp` orphan** (89KB) — old cover, unreferenced since alt-cover swap. Clean up next time if alt-cover stays.
- **`/sources/work/footy/screen-1..9.png`** — orphaned after Outcome rewrite, but stay per never-rm-masters.
- **Long-parked queue** unchanged: Energy case study, Drift B (Contact `ring-*` vs `outline-*`), mobile re-jig of nav panel, Vercel push, OG/sitemap/robots, essays destination, blur placeholders for work covers, card-style review, final cover-image pass, final frontmatter pass (date + role/type residual).

---

## Session 11 — 2026-06-03 (continued from S10, same day) — frontmatter pass · sync drift · contact restyle

A long, multi-arc session resuming directly from S10. Three substantive movements: **(a)** finished the Heyfood + Bribe frontmatter pass left open by S10 and landed Heyfood's cover; **(b)** synced DESIGN.md to multi-session drift in two focused passes (S10 list + S8 caption system) plus a new flex-layout gotcha; **(c)** restyled the Contact page end-to-end — bio copy iterated through many voices, primary + secondary CTA pair built (with copy-to-clipboard), container width and alignment landed via live iteration. Plus housekeeping: favicon recolored to current accent (caught it was still the original `#9F106B` from S1), four cleanup items knocked out.

### Heyfood + Bribe frontmatter pass

- **Heyfood walk-through landed.** `type: "PRODUCT DESIGN"` pill (replacing provisional `role`). Summary rewritten: dropped "self-initiated redesign" (internal framing — portfolio reader cares about the work, not provenance), dropped "sequential-choice flow" jargon (the IA term works in the body but not in a snippet). Final: *"Redesigning the Heyfood checkout — splitting one overloaded screen into a two-step flow that surfaces decisions at the moment they become relevant."* (149 chars).
- **Heyfood blurb — problem-led hook.** First draft (`"Rethinking a cluttered and inefficient checkout screen using better information architecture practices"`) had two issues: (a) "IA practices" tells a methodology, not a move, (b) "IA" is recruiter-jargon — the user had just asked what IA means in the same session, so spelled-out "information architecture" eats half the blurb. Landed: *"A cluttered single-screen checkout, redesigned around how people actually make purchase decisions."* (98 chars).
- **Heyfood cover landed mid-session.** User dropped `heyfood-cover.png` (8000×5172, exact 1.547 ratio — matches the brand-board 1.55:1 export). Pipeline through `/sources/work/heyfood/heyfood-cover-v1.png` (master, gitignored) + `/public/work/heyfood/heyfood-cover-v1.webp` (derivative, **20KB** at q80 — flat brand-board / SVG-style art compresses to almost nothing). Versioned `-v1` per the S10 lesson (default-version-on-drop bulletproofs against S7's same-URL cache trap). **Heyfood is now fully done.**
- **Bribe walk-through landed.** Body framing explicitly says *"the ask here wasn't to redesign the UX top-down"* — scope is genuinely visual, not full product. Real fork from Footy + Heyfood's PRODUCT DESIGN; landed `type: "VISUAL DESIGN"`. Grid now tells two stories (PRODUCT DESIGN × 2, VISUAL DESIGN × 1), honest to the scope of each project.
- **Bribe summary trim (174 → 144 chars).** Old framing doubled "rooted/narrative" metaphor and trailed off into a feature list ("colour, type, and personality"). New: *"A visual-language redesign of Bribe — a Farcaster mini-app where voice notes come with bribes attached, anchored in a Matrix-inspired narrative."*
- **Bribe blurb restructured.** Old: *"Overhauling the visual language of a Farcaster voice-notes-with-bribes mini-app — anchored in a Matrix narrative."* — five-stacked-hyphen `voice-notes-with-bribes` was gnarly, structure echoed the summary. New: *"A Matrix-inspired visual identity for a Farcaster mini-app where voice notes come with bribes attached."* (102 chars). Blurb and summary now lead with different angles (Matrix-first vs scope-first) — no echo across surfaces.

### DESIGN.md sync — S10 list (7 surgical edits)

1. **Frontmatter schema** — dropped `tags` (declared but never rendered, deleted S10 with the orphan EntryList); replaced `role`→`type` with deprecation note; added a dedicated **`type` pill spec** bullet (uppercase, `text-xs`, `tracking-wider`, `bg-accent-fill`, `self-start` to defeat flex parent's cross-axis stretch — `inline-block` would silently get pulled full-width otherwise; takes precedence over legacy `role`).
2. **`<Figure>` caption props** — added `caption` / `captionBefore` / `captionAfter` doc + the **MDX JSX-expression-props gotcha** linked to `[[mdx-jsx-expression-props-dropped]]` (string-form props only).
3. **Card grid markup** — title is `<h2>` (`text-xl`, `text-balance`); type pill renders; `line-clamp-3`; card root is `<div role="button" tabIndex={0}>` not `<button>` (HTML-validity fix — `<button>` only permits phrasing content per spec; React 19/Next 16 surface this as hydration mismatch where React 18 tolerated).
4. **In-place detail header** — title promoted `<h2>` → `<h1>` (semantic fix; case-study title IS the page's primary heading); border bumped `border-b-2` → `border-b-4` to match the navbar's two `h-1` accent rules; cap reads from `--reading-measure` token.
5. **Reload-fix duo** — `/#slug` cold-reload flash documented (pre-paint `<head>` script sets `html[data-detail-pending]`, CSS masks `.project-grid` through the JS-load window, `useLayoutEffect` commits the detail synchronously before paint, same effect clears the attribute). General pattern named: server-unknown state (localStorage, `location.hash`) → resolve via pre-paint `<head>` script + CSS or `useLayoutEffect`.
6. **Theme-toggle thumb CSS-driven** — `.theme-thumb` transform tied to `html[data-theme]` so the correct cell resolves *before paint* (was React-driven; flashed system→light every reload). Same pattern as #5.
7. **Stale italic-caption reference** — line about "image→italic-caption gap tightened to 8px" updated to reflect captions now live in `<figcaption>` inside `<figure>`, gap owned internally.

### DESIGN.md sync — S8 caption system + flex gotcha

After the S10 list emptied, two more entries:

- **Caption system CSS architecture** — full S8 system documented as a sibling to `<Figure>`'s prop doc. Covers the unified `<figure>/<figcaption>` path replacing the old `*italic*` paragraph-after-image pattern; the four `.case-body figure` CSS rules (outer 2rem margin-block, internal media zeroed, figcaption styling at `--caption-measure: 36rem`, multi-`<p>` tight stacking for two-line captions); the **`margin-block: 0` vs `margin: 0` trap** — using the shorthand trampled `margin-inline: auto` and left-aligned Figure's centered imgs (burned an hour on this once). Reasoning explained: one CSS rule set covers Figure / Screens / Compare because all three render the same `<figure>/<figcaption>` shape.
- **"Watch for (flex children blockify)" — new bullet** at end of Layout & Structure. Documents the spec rule: `inline-flex` / `inline-block` children of flex/grid containers get **blockified** at layout time (`display: inline-flex` → `display: flex`), so the "inline" no longer protects from default `align-items: stretch`. Either add `self-start` (or `self-center`/`self-end`) on each child OR keep an explicit `items-*` on the parent. Children with `w-full max-w-*` (e.g. the Contact bio block) are accidentally immune because the max-width caps the stretch. **Bit us once on the Contact email CTA** (stretched 140px → 576px when `items-center` came off the column) and silently on the channels row.

### Favicon recolor + new convention

- **Caught `src/app/icon.png` was still solid `#9F106B`** — the original S1 accent. The accent has cycled `#9F106B` → `#140C34` → `#FF6440` → `#FB370A`; the favicon never tracked because browsers don't apply CSS to favicons. The on-page logo (CSS-masked alpha + `bg-accent`) auto-tracks the token, so the asymmetry was easy to miss until the user noticed.
- **Regenerated deterministically from `public/portfolio-logo.png` alpha + current accent.** Inline `sharp` script: extract alpha channel, build RGB layer filled with `#FB370A`, stitch into RGBA, write to `src/app/icon.png`. Verified 100% pixel match (95088 px @ `#fb370a`, 0 px @ anything else).
- **New convention logged in DESIGN.md:** "Favicon — regenerate on accent change" subsection in Color & Theme. Documents the asymmetry, captures the exact regen script verbatim (HEX is the one knob — swap and rerun), notes the cache-bust dance (`rm -rf .next/cache` + hard-refresh), and flags the "why not automate" decision so we don't relitigate. Logo row in palette table updated to call out the auto-tracks-vs-doesn't asymmetry.

### Cleanup category emptied (4 items)

User explicitly asked to empty Cleanup, with Footy gif kept and promoted to Pre-launch Polish as a new "Figure out videos" item (alongside an in-mind "bribe digital rain"):

- **`--muted` token removed** (orphaned since S4; `--text-muted` replaced all usages). Stripped from `:root` + `@theme inline`.
- **`--danger` token removed** (orphaned since S6 — its only consumer was the deleted modal close button). Stripped from `:root` + `@theme inline`.
- **`public/work/footy/footy-cover.webp` deleted** (89KB, unreferenced since the S10 `alt-cover.webp` swap).
- **Indigo DRAFT hero alternate removed** from `(site)/layout.tsx` (the parked "armchair philosopher at heart…" line in indigo). Voice ended up living on Contact in a different form, so the parked hero alt became redundant.

### Drift B — Contact `ring-*` → `focus-ring`

- `Contact.tsx`'s `email me` button was the only place using `focus-visible:ring-2 ring-accent ring-offset-2 ring-offset-background`; everywhere else uses the `focus-ring` utility (`outline: 2px solid var(--accent); outline-offset: 2px`). Visual outcome on a solid-accent button is near-identical between the two — but unified the architecture (one focus primitive across all interactive elements).
- **Not drift, just looked like it:** `LINK` constant uses `focus-visible:underline + focus-visible:text-accent` (no outline) — deliberate for inline text links where outline would feel heavy. Confirmed live and explicitly documented as intentional pattern.

### Contact page restyle — the long arc

By far the longest arc of the session. Bookkeeping captured here so the journey is reconstructible.

**Bio copy journey:**
- Started from the S5 placeholder (bare hero + lead + CTA + channels).
- Explored two reference pages: **anneboysen.dk/about** (substance-led: bio + awards + portrait) and **marijanapav.com/contact** (restraint-led: one headline + email + channels, no bio). Picked substance density + reflective tone from Boysen but explicitly NOT the portrait or minimal-contact treatment.
- **Drafted a 3-paragraph reflective bio in indigo DRAFT styling** (voice ported from the parked hero-alt). Surfaced the *substance vs restraint* tension: Marijana works because her work pages do the substance lifting; the site's home hero already does identity, so contact doing identity again is double-substancing.
- User landed on **"identity in broad strokes, not paragraphs"** — Marijana minus the spartan, Boysen minus the bio block. Replaced the 3-paragraph block with personality + CTA-framing 2-paragraph block.
- **User wrote the personality line themselves:** *"Hello, I'm an armchair philosopher at heart, cosplaying as a product designer. I love gradients, typography, and seeing client's faces light up when they see what I've designed."* Three flags applied with permission: casing (`Hello`→`hello`, site convention), `client's`→`clients'` (plural possessive), `seeing… see` repetition → `watching… see`.
- **User wrote the CTA framing themselves:** *"contact me if you've got something you'd like me to look at. whether it's a weeklong sprint or a monthslong contract, we'll turn your product or idea into something beautiful and great to use."* Flagged the "great to use" softness and the singular→plural "we'll" voice pivot. User confirmed "we'll" was intentional and inserted **"together,"** as a comma-fenced parenthetical to make it explicit. The "great to use" iteration went: `delightful` (designer cliché — half-flagged) → `a joy to use` (user's pick after a deeper synonym hunt; warm register without the cliché tax).
- **Promoted out of indigo DRAFT styling** once copy settled — block flattened from `<div><p>DRAFT</p><div><p>...</p><p>...</p></div></div>` to `<div><p>...</p><p>...</p></div>`. Inherits page foreground.
- **Late-session major revision:** user dropped the first sentence ("hello, i'm an armchair philosopher cosplaying as a product designer") and merged into one paragraph. Then nuked everything and tried a service-pitch rewrite ("if you're building a product and need help making it clearer, more cohesive, or easier to use..."). Then reverted partway: brought the old bio back with the service-pitch's first sentence as a new closing. Then dropped that middle sentence (doubled-invite redundancy). Then added a NEW middle sentence — interests list — *"i'm particularly interested in product design, design systems, things for football fans, and internet-native experiences (coyg!)."* — including a **COYG Easter egg** ("Come On You Gunners" Arsenal chant; opaque to non-football-fans, instantly readable to Arsenal fans). **Final bio is 3 sentences:** personality opener + concrete interests with secret-handshake + qualifier-invite. Voice ends up service-pitch-with-personality-that-knows-its-people.

**Two-button CTA pair (new feature):**
- **Primary** = solid-accent `email me →` (mailto, unchanged shape). **Secondary** = outline `copy email ⧉` (text/border accent on transparent; hover fills to `bg-accent-fill`). Both share padding/radius/type so they read as a matched pair; only fill + border differ.
- **`navigator.clipboard.writeText(EMAIL)` + `useState`/`useEffect`** for click feedback. Text swaps `copy email` → `copied!` for `COPIED_FLASH_MS = 4000` (4s; user bumped from 2). Failed clipboard write = silent no-op (mailto is the graceful fallback).
- **Component flipped server → client** (`'use client'` directive added) for clipboard API + state. SEO-neutral — App Router still renders markup server-side.
- **Copy icon:** 16x16 SVG, two overlapping rounded squares (standard duplicate glyph), matching the arrow's stroke conventions (1.75 width, currentColor, non-scaling-stroke).
- **`aria-live="polite"`** on the copy button — screen readers announce the "copied!" state change.
- **Email button hover — two iterations.** First `opacity-80 + motion-safe:hover:scale-[1.02]` (rejected — still "almost not there"). User asked for **width-stretch hover on the SVG arrow itself**: the SVG transitions `w-4` → `w-6` over 320ms, button widens to accommodate, arrow appears to "lean forward." Two SVG attributes make this work: `preserveAspectRatio="none"` (path stretches non-uniformly) + `vectorEffect="non-scaling-stroke"` (stroke stays crisp during stretch). **320ms matches `.view-enter`'s "scene change" timing** documented in DESIGN.md — accidental but coherent rhythm.

**Layout decisions:**
- **Container width A/B'd:** `max-w-2xl` (672px) → `max-w-xl` (576px) → `max-w-md` (448px) → `max-w-[30rem]` (480px) → **`max-w-lg`** (32rem / 512px, locked). Final matches the bio's natural reading measure — bio fills column edge-to-edge.
- **Email button used as a visual ruler during column-width iteration.** `self-start` temporarily removed so the button stretched to full container width; user could see the column-width dial via the button's right edge. Restored `self-start` after locking. **This is how the flex-blockify bug surfaced** — see DESIGN.md sync above.
- **Top spacing: `mt-[12vh]` → `mt-[8vh]` → viewport-fill flex on lg (path 4).** Initially trimmed for laptop-height fit, then implemented the parked path 4: `lg:min-h-[calc(100dvh-8rem)] lg:justify-center lg:mt-0` — column fills viewspace height (8rem = grid's `pt-8 + pb-24`), `justify-center` vertically centers content. Mobile stays the simple `mt-[8vh]` approach.
- **Alignment evolved:**
  - Started fully centered (`items-center text-center`).
  - Pivoted to left-aligned (dropped centering) when bio's left-aligned text fought the centered hero/buttons/channels.
  - User asked to center hero only (`text-center` first, then `self-center` per preference), then center buttons too, then center channels too. **Final: everything centered EXCEPT the bio paragraph** (centered prose past 2 lines hurts scanning). Coherent intentional pattern.
- **Channels simplified.** Originally `github · farcaster` with a hairline dot separator. User dropped github ("not much in there tbh" — sparse github linked from a contact page reads worse than no link). Then dropped the dot. **Final: a closing sentence — *"on the internet you can mostly find me hanging out on farcaster."*** — with "farcaster" inlined as the link. Voice-coherent close instead of a bare text link.

**TODO captured in code at the email button:** future copy-to-clipboard affordance directly on the email address (not just the email-me CTA), referenced to marijanapav.com prior-art.

### Lessons logged this session

1. **inline-flex children get blockified in flex/grid layouts.** Real bug: Contact email button stretched 140px → 576px when `items-center` came off the parent. Pattern logged in DESIGN.md.
2. **Favicons don't track CSS tokens.** On-page logo's CSS-mask + `bg-accent` auto-tracks `--accent`. But favicons are flat rasters; browsers don't apply CSS. Convention logged: regenerate from `portfolio-logo.png` alpha + new hex when accent changes.
3. **Two contact-page references with opposite arguments.** Boysen (substance) and Marijana (restraint) make the same point inverted: pages work when their tone matches what the work elsewhere demands. Don't copy the format — copy the *relationship* between page and surrounding work.
4. **Site convention reconfirmed: all running copy is lowercase.** Reaffirmed multiple times as drafts came in capitalized. Sentence-start capitals and pronoun "I" both lowercased to match.
5. **Apostrophe convention: `&apos;` HTML entities** (renders to straight `'`). Smart quotes (`'` U+2019) work in JSX but break file consistency.

### Pre-launch Polish queue snapshot (post-S11)

Active:
- **Card-style review** ← next session starts here (user's call)
- **Final navbar pass** (added S11)
- **Mobile re-jig of nav panel**
- **Blur placeholders for work covers**
- **Final cover-image pass** *[Footy art direction, ideas padding bands, animated-cover flag]*
- **Final frontmatter pass**
- **Figure out videos** *[footy gif, bribe digital rain]* (consolidated from Cleanup → Pre-launch Polish this session)

Closed this session:
- Drift B (Contact ring-* → focus-ring)
- Contact page styling
- DESIGN.md syncs (S10 list + S8 caption system + favicon convention + flex-blockify gotcha)
- Cleanup category (all 4 items)
- Sync drift category (emptied)

Big Content (deferred):
- Energy / Yara / Kickoff case studies

Launch queue (unchanged):
- Push to Vercel · OG/sitemap/robots · Essays destination

### Resume here — card-style review

User picked card-style review as the next item (longest-deferred Pre-launch Polish item, flagged since S6). Cards are the homepage's primary content and most-seen surface; fresh eyes before launch.

---

## Session 12 — 2026-06-03 (cont. into 06-04) — card-style review · viewspace TOC + slide-out BTT · `--nav-fill` tuned · grid-spotlight retired

A long, three-arc session. Started with the deferred card-style review, turned into a substantive card-body restructure + a new in-place reading nav (TOC bar with a Marijana-style slide-out BTT). Plus a tokenization update and the full retirement of the grid-spotlight hover system.

### Card-style review — anatomy + surface
- **Card body restructure** in `ProjectsExplorer.tsx`. New shape top→bottom: cover → **type eyebrow** above title → title → blurb. Specifically:
  - **"Read more →" line dropped entirely.** Whole card is the click target; the arrow CTA implied a separate destination and double-served the title's hover-accent.
  - **Type pill → plain text eyebrow ABOVE the title** (was a `bg-accent-fill rounded-md px-2 py-1 self-start` chip BELOW title). Now `text-text-muted` `text-xs font-semibold tracking-wider`. The chip was double-buttoning on a card that's already a button-shaped element.
  - **Blurb stays `text-text-muted`** (briefly tried `text-foreground`, reverted — Marijana-style restraint, title carries the only commitment).
  - Title (h2) keeps `text-xl text-balance`, gains `mt-2` (now follows the eyebrow).
- **Card grid gap** `gap-8` (32px) → **`gap-16` (64px)**. Intentional break from the page's `gap-x-8` = 32px column rhythm — cards needed more breathing room than the page-level gap provided. Walked through `gap-12` (48px) → `gap-[60px]` (off-grid, **flagged and rejected**) → `gap-16`. Both still on the 8px grid.
- **Detail-header pill** also stripped of chip styling (same eyebrow language as the card) — but **position kept BELOW H1** per user intent. They envision adding a future **"view live"** CTA pill alongside it; plain-text-label-vs-chip-shaped-CTA visually distinguishes function (label = metadata, chip = clickable) when the row exists.
- **Hover stack simplified, grid-spotlight fully retired.** Card hover keeps: `outline-2 outline-offset-2 outline-accent` + `motion-safe:hover:scale-[1.02]` + title→accent. **Both halves of the grid-spotlight system were removed** in `globals.css`: the pointer-gated hover dim (`:has(:hover) :not(:hover) { opacity:.6 }`) AND the keyboard-focus blur+dim (`:has(:focus-visible) :not(:focus-visible) { blur(2px) opacity:.6 }`). The keyboard variant had been kept in S3 for a11y; today's call: focus-ring + title shift on the focused card itself is enough indication; the field-wide dim+blur was the heaviest visual change in the grid and made browsing feel restless.

### Surface tuning — `--nav-fill` like-for-like-of-dark
- **`--nav-fill`** `#FFFFFF` → **`#FCF3ED`**. Driven by the question: given dark's `--background-dark #181311` → `--nav-fill-dark #241C19` is a +4 L lift in the same hue family, what would the equivalent navbar fill be in light? Three readings:
  - **Additive (+4 L same direction):** `hsl(25°, 76°, 96%)` ≈ **`#FCF3ED`** — picked
  - **Multiplicative (same ratio):** clamps to pure white = what we had
  - **Inverted (+4 L magnitude, opposite direction):** ≈ `#F8DDC4` — recessed/saturated peach, unconventional
- Cascades to nav panel + cards together (both are raised surfaces, by design — token discipline holds). Knock-on: `--card-ring` recomputes ~3 channel units more peach-tinted (imperceptible). Useful side effect: the Heyfood cover's near-white edges now visibly seam against the warm-tinted card body, separating "image" from "metadata" in the card rather than bleeding into one column.

### CaseToc + slide-out BTT — the new in-place reading nav
- **First attempt:** a corner-floating `BackToTop.tsx` button (`fixed bottom-8 right-8` of viewport, up-arrow SVG, frosted circle, threshold 400px, smooth scroll to top). User pushed back: "don't want it in navbar area, want it on viewspace," and proposed the richer pattern: a TOC button set for case-study subheadings, with the BTT sliding out of the set's right edge on scroll — **Marijana homepage pattern** (BTT that emerges from her navbar).
- **Spec landed for `CaseToc.tsx`:**
  - Horizontal frosted pill bar at the bottom of the viewspace, **same fixed slot as ViewSwitcher** (mounted alongside in `layout.tsx`), **mutually exclusive** via `ViewContext.detail` (only one renders at a time — ViewSwitcher hides when detail is set; CaseToc shows then).
  - **5 sliding-thumb segments** for the standardised `## The X` sections — Overview / Problem / Design / Outcome / Reflection — **hardcoded** (S10 heading standardisation guarantees the shape across all case studies; not worth deriving from rendered content for 3 entries).
  - Click → **`scrollIntoView({ behavior: 'smooth' })`** — deliberately **NOT URL hash navigation**, which would collide with `/#slug` case-study routing and close the detail (`projects.some(p => p.slug === hash)` check would find no match → `setDetail(null)`).
  - **Active section** = last `<h2>` whose top crossed the 120px trigger line from viewport top. **Bottom-of-page shortcut** promotes the last section when the document runs out of scroll (without it, the final heading never reaches the trigger line geometrically, and the thumb parks on the second-to-last section).
  - **Thumb mechanic mirrors ViewSwitcher exactly:** `grid-cols-5`, thumb width `calc((100% - 8px) / 5)` (one segment's exact inner width — 8px = bar's `p-1` left+right padding), `translateX(activeIndex * 100%)` snaps segment-to-segment cleanly. Active label is `text-foreground` (no color/weight shift) — thumb is the sole indicator.
  - **BTT as a sibling tucked behind the bar's right edge.** Initial state `ml-2 -translate-x-12 opacity-0` overlaps the bar (invisible because opacity is zero); past **400px** of scroll it animates to `translate-x-0 opacity-100`, sliding into rest position to the right of the bar. Sized **`h-10 w-10 rounded-lg`** to match the bar's outer corner + height (bar = `text-sm` ~20px + `py-1.5` 12px + outer `p-1` 8px = 40px = `h-10`).
  - Hidden below `lg` (`lg:flex` on wrapper); mobile pass deferred.
- **Two scrollspy bugs surfaced + fixed inline:**
  - **Bug 1 — thumb cycled through intermediates on long jumps.** Click Overview → Reflection visibly chewed through every section as the smooth-scroll passed each heading. **Fix v1:** commit user's target activeId immediately on click, then lock scrollspy for 800ms via a `navLockRef` flag (suppresses scroll-driven activeId updates; BTT visibility still tracks scroll).
  - **Bug 2 — second-to-last flicker on long jumps.** With v1, the 800ms lock expired just before the smooth scroll settled; one stray scrollspy pass promoted Outcome briefly before the bottom-of-page shortcut fired on the next tick. **Real fix:** replace the timer with **`scrollend` event** (canonical settle signal — Chrome 114+, Firefox 109+ since 2023; Safari 17.4+ March 2024). 2000ms fallback timer covers older Safari + scrolls the user interrupts mid-flight by manually scrolling (where `scrollend` may not fire). Both unlock paths call the same `unlock()`; double-fire harmless.
- `BackToTop.tsx` deleted after CaseToc absorbed the BTT.
- **Threshold dialing.** `SCROLL_TRIGGER` walked 50 (too early for case-study reading; "first scroll tick" works on a landing page where any scroll means "leaving the hero," but on a case study you're scrolling through content from the jump) → settled on **400**. `ACTIVE_TRIGGER` kept at 120 from viewport top. `NAV_LOCK_FALLBACK_MS` = 2000.

### Lessons logged this session
1. **`scrollend` is the right settle signal** for any "lock derived state until a smooth animation actually finishes" pattern — not a guessed timer. Pattern: set authoritative state on intent (e.g. activeId = clicked target), lock observed/scrollspy state with a ref flag, unlock on `scrollend` with a generous timer fallback for older browsers / interrupted scrolls. Both call the same unlock; idempotent.
2. **`inline-flex` / `inline-block` children get blockified** in flex/grid layouts (per CSS spec) — bit us silently on the eyebrow span in the detail header (block context this time, so `block` class needed explicitly when sibling positioning matters). Existing S11 lesson reaffirmed.
3. **A token swap that cascades is correct, even if it surprises a side surface.** `--nav-fill` shifting from white to warm off-white was specifically about the navbar but cascaded to cards (both raised tier). Right outcome (token discipline holds, both raised surfaces shift in lockstep); the Heyfood cover-seam side effect was useful, not noise.

### DESIGN.md synced this session (5 surgical edits)
- `type` label spec rewritten (card-eyebrow + detail-below-H1; chip retired)
- Card-row entry updated (gap-16, anatomy reorder, Read more dropped)
- Card edge/hover-focus section rewritten (grid-spotlight retired in full, hover stack simplified)
- `--nav-fill` value + the additive-vs-multiplicative derivation rationale
- NEW two bullets under Projects: `CaseToc` design + `scrollend` settle pattern

### Status
- `tsc --noEmit` clean throughout. Did **not** `npm run build` (S7 lesson: dev :3000 live throughout the session).
- **Uncommitted past `eb749cc`:** 4 source files + DESIGN.md + SESSION_NOTES.md. Single coherent arc → single commit imminent.

### Resume here — final navbar pass
S11 flagged "final navbar pass" as a queue item; would be cohesive with the design-polish thread we've been pulling (cards → CaseToc → navbar would close out the chrome surfaces). Alternative quick wins: blur placeholders for case-study covers (extend ideas `blurDataURL` pattern), final frontmatter pass (residual date/role cleanup), or jump to the bigger items (mobile re-jig of nav panel + CaseToc; cover-image pass; videos).

### Session 12 (cont.) — 2026-06-04 — navbar pass arc · panel restructure · accent token scale · type rhythm

A long second movement on the same date. After committing the card-review/CaseToc arc, walked through the final navbar pass. Architecturally invasive (panel restructured to a weighted grid; rules became cutouts), then surgically iterative (7 items on a checklist, each with eyeballing rounds).

#### Panel structural rework
- **Sticky wrapper switched from `lg:flex lg:flex-col` to `lg:grid lg:grid-rows-[7fr_auto_10fr_auto_3fr]`** — a five-row grid (3 content cells + 2 auto-height rules at boundaries). Each cell is `lg:flex lg:flex-col lg:justify-center` so its content vertical-centers within its allotted height. Ratios: **35% identity / 50% menu / 15% toggle.** Walked: 1fr/auto/1fr/auto/1fr (true thirds) → 1fr/auto/2fr/auto/1fr (25/50/25) → 3fr/5fr/2fr (30/50/20) → **7fr/10fr/3fr** (current). The user's intuition was thirds; rebalanced to weight menu cell as the densest content, toggle cell as the lightest (single ~40px segmented control needs little room). **The "concession" from S9 (toggle gets crushed on short viewports) is now structurally inverted** — content cells shrink proportionally rather than the lower block compressing.
- **Accent bracket rules became `bg-background` cutouts (`h-1`).** Walked: started as 4px solid `bg-accent` (per S5 history) → tried 2px + bg-accent-200 (40%) → tried 2px + bg-accent-100 (16%) → bumped back to 4px + bg-accent-100 → **landed on 4px + `bg-background`**. As `bg-background`, the rules visually "cut through" the white nav panel revealing the page-field color behind. Reads as **structural gaps in the panel** rather than colored chrome. Bonus: they extend to the right viewport edge via `lg:-mx-8` and flow seamlessly into the viewspace's same `--background` field.

#### Accent token scale (use-case names → strength scale)
- **Renamed two derived tokens to step naming:** `--accent-fill` → `--accent-100` (16%, faint), `--switcher-thumb` → `--accent-200` (40%, mid). `--accent` (100%, base) kept unchanged. Tailwind classes: `bg-accent-100`, `bg-accent-200`, plus the unchanged `bg-accent` (and text-/border-/outline- variants).
- **Why:** the use-case names had drifted from their original intent — `--switcher-thumb` was being used by the ViewSwitcher thumb, NavMenu active fill, NavMenu bracket rules (briefly), and CaseToc thumb. The name described the FIRST use, not the actual role (a 40%-accent token). Step naming describes WHAT it is (a strength), letting one token serve many uses without misleading anyone.
- **Path B** (keep `--accent` as the unstepped base, step only the derived tints) chosen over Path A (full rename of `--accent` → `--accent-300`). Less churn (~10 callsites vs ~34), reads as "a brand color plus tints of it" rather than a Tailwind-style flat scale.
- **Discussed but rejected for now:** stepping the `--text-muted` token to `--foreground-200`. It's the only foreground-derived tint AND its semantic name is genuinely useful ("this is for muted text"). YAGNI applied — keep stepped naming pragmatic; rename later if more foreground tints arrive.
- **`.accent-fill` highlighter class renamed to `.accent-marker`** so it doesn't echo the (now-removed) `--accent-fill` token name. The class uses an inline `color-mix(... 16% ...)` rather than the renamed token because it supports a `--fill-color` override; intentional.
- 13 callsites + comments migrated; type-check clean.

#### Navbar pass — the 7-item checklist
Initial fresh-eyes pass surfaced 7 items; closed each in order:

1. **Focus-ring unified.** NavMenu buttons were the lone outlier using `outline-none focus-visible:border-accent` (border color shift); everything else uses the `focus-ring` utility (2px accent outline + 2px offset). Migrated.
2. **Active-item / accent-rules competition.** Active item was `bg-accent-fill` (16%), rules were `bg-accent` (100%) — chrome out-shone the affordance. Walked: option B (rules 2px + active 40%) → user wanted "rules accent-200 too" → "make rules accent-100" → "bump to h-1" → "make rules bg-background" (cutout). Final: rules 4px `bg-background` (cutout), active item `bg-accent-200` (40%). Hierarchy now: affordance > chrome.
3. **External link indicator.** Added a trailing 14px ↗ SVG glyph to externals (essays, newsletter). Color `text-text-muted` at rest, `group-hover:text-accent` so the icon follows the label's hover-warm. Layout: BASE switched to `flex items-center justify-between` to allow the icon at right edge — then later changed to `justify-center gap-2` (icon becomes a trailing glyph immediately after the label, the chip-with-arrow look the user preferred over right-pinned).
4. **Hero size.** Initially bumped 14px → 16px ("medium" option) → felt crowded → tried 15px → walked **back to 14px** with the surroundings doing the work instead: `leading-relaxed`, `tracking-tight` dropped, identity cell sized to 7fr (35% of panel), section constrained then unconstrained (see hero rework below). Lesson: when type feels small in a constrained cell, the fix can be *making the cell more generous* rather than bumping the type.
5. **"some things i do" label.** Was 18px Nico Moji foreground — bigger than the items it labels. Landed: **`text-base` (16px) Nico Moji `text-text-muted`**. Same size as items, but muted color + lighter weight + decorative font subordinate it visually.
6. **`tracking-tight` on hero.** Already dropped during #4's iterations. Closed passively.
7. **Hero source caps.** Was `Hello, I'm Chukwuka` (lowercased via CSS); per S11 convention all running copy is lowercase including pronoun "I." Source rewritten lowercase; dropped the now-unnecessary `lowercase` Tailwind class.

#### Hero rework (Cell 1 anatomy)
Multiple iterations, settled state:
- **Single H1** with both sentences, body sans, **`text-sm font-medium leading-relaxed text-pretty`** (no `lowercase`, no `tracking-tight`).
- **Section uses full cell width** (no `max-w-` constraint). Earlier constrained to 16rem + `mx-auto` for block-centering to match the centered logo above; abandoned when the user wanted "systems-oriented" to land at the end of line 1 (which mechanically needs the wider column).
- **Non-breaking glyphs** to control wrap:
  - **`&#160;`** (NBSP) between "a" and "systems‑oriented" → article doesn't orphan at line ends
  - **`&#8209;`** (non-breaking hyphen) inside "systems‑oriented" → never breaks mid-word
  - **explicit `<br/>`** after "systems‑oriented" → forces the desired wrap point
- **Brand text** ("chukwuka's matrix") shifted from foreground → `text-text-muted`. Establishes the **rhythm motif** captured below.
- **Logo / hero asymmetry concession:** with the constrained-block centering gone, the logo-row centers in cell while the hero left-aligns to the cell edge. Accepted; was the simplest way to fit the requested wrap.

#### Rhythm motif — design principle that emerged
Each panel section now follows the same recipe: **muted Nico Moji label + foreground-medium Nata Sans content**. Specifically:

| Section | Label/quiet | Content/loud |
|---|---|---|
| Identity | brand: 16–18px Nico Moji **normal muted** | hero: 14px Nata Sans **medium foreground** |
| Menu | "some things i do": 16px Nico Moji **normal muted** | items: 14px Nata Sans **medium foreground** |

Same shape, repeated. No element exceeds `font-medium` (500) in the entire panel. Accent only appears as: logo color (`bg-accent` via mask), active-item background (`bg-accent-200`), hover transitions on items. Quiet brand, loud affordances; symmetric structure.

#### NavMenu refit details
- **Labels centered in buttons** (`justify-center gap-2`) — labels read centered, external arrow sits as a trailing glyph immediately right of the label rather than pinned to right edge.
- **Font weight evolution:** semibold → normal (briefly) → semibold → **medium** to match the hero rework.
- **Font size:** text-base (16px) → **text-sm (14px)** to align with hero size.

#### DESIGN.md synced this session
- Token table updates (renamed rows for `--accent-100`, `--accent-200`)
- Navbar panel structure (thirds-grid, weighted ratios, cutout rules)
- The `.accent-marker` class rename
- The rhythm motif as a design principle
- Hero non-breaking-glyph wrap pattern

#### Status
- `tsc --noEmit` clean throughout. No `npm run build` (dev :3000 live; S7 lesson).
- 8 files modified past `8d7cc4e`. Single coherent commit pending.

#### Resume here — open queue
Pre-launch Polish (post-arc):
- **Mobile re-jig of nav panel + CaseToc** — captures all the lg-only patterns we added (thirds-grid, CaseToc bar, etc.) in a mobile pass
- **Blur placeholders for work covers** (extend ideas `blurDataURL` pattern)
- **Final cover-image pass** (art direction)
- **Final frontmatter pass** (residual date/role cleanup)
- **Figure out videos** (footy gif, bribe digital rain)

Big Content: Energy / Yara / Kickoff, **essays destination** (moved 2026-06-04 from Launch → Big Content — essays is a content-pipeline decision, not a launch-checklist item; sits more naturally alongside the unwritten case studies).

Launch queue: Vercel push, OG/sitemap/robots.

---

## Session 13 — 2026-06-04 (continued from S12 same day, post-/clear) — frontmatter deprecation closed · blur placeholders shipped · cover audit (dissonance kept)

A focused queue-knockout session. Three discrete movements: **(a)** finished the role → type migration started in S10 by removing the legacy field from schema and renderer; **(b)** shipped blur placeholders on work-card covers via a new sidecar pattern; **(c)** audited all 8 covers (cases + ideas) as a set, corrected a stale diagnosis, and **closed the final-cover-image pass with intentional non-action** — the cross-cover dissonance is kept as a deliberate design choice.

### Final frontmatter pass — role → type deprecation fully closed
Background: S10 introduced `type?: string` alongside legacy `role?: string` with a renderer-side fallback ("renderer prefers `type` over `role` when set"). S10 + S11 migrated all three live case studies (Footy / Heyfood / Bribe) to `type`. The fallback became dead code; this session removed it.

- **Pre-audit clean.** Grepped `*.mdx` for `^role:` and `# TODO` — both empty. Summary lengths Footy 132 / Heyfood 149 / Bribe 146 chars (all under Google's ~150 SERP cap). Sort order **Footy → Heyfood → Bribe** verified via featured-pin × date-desc.
- **Schema (`src/lib/content.ts`):** `role?: string` dropped from `Frontmatter`; `type?` JSDoc rewritten to drop the "takes precedence over `role`" language.
- **Renderer (`src/components/ProjectsExplorer.tsx`):** three `p.type ? ... : p.role ...` ternaries simplified to `p.type && ...` (card eyebrow line 189, detail-header line 125, hidden crawlable copy line 220). Removed three dead-code branches that were also styled inconsistently to each other (different font sizes on the unreachable `role` paths — would have rendered wrong if any case study had landed on `role` anyway).
- **DESIGN.md** synced — three stale references updated: frontmatter schema note ("safe to remove" → "fully removed 2026-06-04"), `type`-label precedence claim collapsed to "when unset, the slot is empty," and the `--text-muted` example callsites refreshed (also dropped the orphan "read more" reference — S12 deleted that line).
- `tsc --noEmit` clean; zero remaining `role` references in `src/` or MDX.

### Blur placeholders for work covers — LQIP sidecar pattern
Item from the queue since S7. Product-idea covers had `blurDataURL` LQIPs from the start (inline on the typed `Idea` record); work-card covers popped in cold because the storage shape didn't translate cleanly to MDX frontmatter (~150-char base64 strings in YAML = noisy).

- **Storage decision: sidecar map.** New file `src/content/work-covers.ts` exports `WORK_COVER_LQIPS: Record<imagePath, blurDataURL>` keyed by image path (not slug — so a versioned cover swap, e.g. `cover-v1.webp → cover-v2.webp` per the S7 cache-trap workaround, carries its LQIP with it). Header comment includes the inline-sharp regen one-liner. Considered three alternatives: (1) embed base64 in MDX YAML — rejected for noise + escape risk on long strings, (2) sidecar `.blur.txt` files per cover — rejected for fs-read overhead + path-derivation logic, (3) merge into ideas-style typed map — rejected, work is MDX-authored, sidecar keeps the two storage shapes appropriate to their content models.
- **Merge point (`lib/content.ts`):** `ContentMeta` extended with optional `blurDataURL?: string` (lives on the derived type, not `Frontmatter`, since it's generated not authored). `getEntry` looks up `fm.image` against the map and attaches at read-time — consumers see one shape.
- **Wire (`ProjectsExplorer.tsx`):** card `<Image>` conditionally spreads `placeholder="blur"` + `blurDataURL` via object-spread (`{...(p.blurDataURL && { placeholder: "blur" as const, blurDataURL: p.blurDataURL })}`) — props absent when no LQIP exists, so no `placeholder="empty"` literal noise. Hidden crawlable copy unchanged (no images).
- **LQIPs generated** via inline sharp (16px-wide WebP, q60): Footy `alt-cover.webp` 115 chars · Heyfood `heyfood-cover-v1.webp` 143 chars · Bribe `cover-v1.webp` 159 chars. Same order of magnitude as the ideas LQIPs (range 115–230 chars).
- **DESIGN.md** new bullet under card-cover spec documenting the LQIP pattern + the sidecar-vs-`Idea`-inline asymmetry rationale.
- `tsc --noEmit` clean.

### Final cover-image pass — audited, dissonance kept as intentional
Read all 8 covers (3 case studies + 5 ideas) as a set. Diagnosis:

**Case studies.** Three different registers across the grid:
- Footy `alt-cover.webp` — UI-fragments composition on black (Score Square ticket + transaction confirmation moment). Asymmetric, deliberate-feeling. "What's it like in use?"
- Heyfood `heyfood-cover-v1.webp` — Pure brand wordmark on white. No product. "What's it called?" Lowest-substance cover of the three.
- Bribe `cover-v1.webp` — 3D angled iPhone mockup on gray studio backdrop. Most conventional portfolio register. "What does it look like on a phone?"

Proposed three coherence paths (all-device-mockup / all-UI-composition / all-editorial-collage), pushed device-mockup. **User called the dissonance intentional** — each cover represents the project's actual visual register honestly; the three pieces of work aren't a coherent set and the covers reflect that. No rework.

**Ideas — diagnosis correction.** S8 note flagged `grok-customisation` + `retro-chat-app` as the padding-band outliers. Looking now, that's stale: `grok-customisation` has been re-exported (busy collage, fills canvas). Current outliers are **`subscriptions-mini-app`** (small phone on lots of empty gray-purple field) and **`retro-chat-app`** (screen with top/bottom padding bands on flat purple field). Carousel jump is now between **slides 3↔4**, not 4↔5. **Also kept as-is** (covered by the same "dissonance intentional" call).

**Animated-cover design flag.** Still abstract — no candidate cover going motion yet. Skip until "Figure out videos" surfaces a candidate.

### Session 13 (cont.) — 2026-06-04 → 2026-06-05 — mobile rebuild from the ground up

After the four cover-pass items above, this session pivoted into a substantive mobile architecture rebuild. The biggest arc of the session by far.

#### Mobile-first process correction (memory saved)
- Discovered four retrofit tasks (CaseToc hidden on mobile, hero glyph wrap, ~600px nav chrome stacked above work, hero alignment dissonance) that all should have been baked in when each desktop pattern landed. Concluded: the codebase syntax was mobile-first (unprefixed = mobile baseline) but the DESIGN THINKING was desktop-first. Process issue, not semantics.
- New memory `[[mobile-first-design-process]]` captures: design at both viewports simultaneously (DevTools docked at 390px); sketch the 375px version first for new patterns; question "is the right mobile composition different from stacked-desktop?" rather than accepting fall-out.
- Closed the four retrofit items (CaseToc bar visible on mobile + segments at text-xs px-2; hero `<br/>` gated to `lg:`; mt-12 → mt-8 across mobile section rhythms; hero text-center on mobile / lg:text-left desktop). Some became moot after the rebuild below (panel doesn't render on mobile anymore), kept as defensive code.

#### Ground-up mobile architecture rebuild
User picked "Top app-bar + drawer" pattern after a multi-architecture proposal (vs bottom-nav-primary, vs landing-hero). Then picked "bottom sheet" for the drawer style (pairs with existing ViewSwitcher/CaseToc bottom-pinned chrome).

- **New components:**
  - `HeroBlock.tsx` — extracted logo + brand row + hero text from inline layout markup. Reusable in desktop aside (cell 1) AND mobile sheet body. Brand row is a `<Link href="/">` (the brand is the home anchor).
  - `MobileTopBar.tsx` — sticky top, h-14 (3.5rem). Layout: brand-link on the left, right-cluster with ThemeCycle + menu button (☰ → ✕). `lg:hidden`. Safe-area-inset-top padding for iOS notches. Receives `buttonRef` so the sheet can return focus on close.
  - `MobileSheet.tsx` — fixed bottom-anchored slide-up sheet. Backdrop (z-40 fixed inset-0) + sheet (z-50 fixed inset-x-0 bottom-0) as separate siblings (earlier nested-in-fixed-inset-0 caused the layout viewport vs visual viewport mismatch on Chrome Android — only the sheet top was visible). Contains HeroBlock + NavMenu. Position-fixed scroll-lock pattern (capture scrollY, freeze body, restore on close) rather than plain `overflow: hidden` — the latter doesn't reliably block touch-scroll on Chrome Android. Close paths: backdrop click · ✕ · ESC · route change (pathname watch). Animation: `motion-safe:transition-transform motion-safe:duration-300 motion-safe:ease-out`, motion-safe-gated so reduced-motion snaps.
  - `ThemeCycle.tsx` — compact 44×44 circular button, cycles light → system → dark on tap. Imports SunIcon/MoonIcon/SystemIcon from ThemeToggle (exported for sharing). Mounted in MobileTopBar as a sibling to the menu button so the toggle is persistent without opening the sheet. ThemeToggle (segmented) still renders in desktop panel; never both at once.

- **Layout (`(site)/layout.tsx`):** became a client component (needed `useState` for mobileSheetOpen + `useRef` for the menu-button trigger). Desktop `<aside>` is now `hidden lg:block` — fully gone on mobile. `<div inert={mobileSheetOpen}>` wraps page-grid + bottom bars so Tab focus stays in the sheet and backdrop taps don't leak. Topbar lives outside the inert wrapper (stays interactive so the menu icon ✕ can close).

- **Mobile sheet polish:**
  - **Grab handle dropped** — implied drag-to-dismiss which we don't support (false affordance). The X + backdrop + ESC give three close paths already.
  - **X close button → circular chip** with `bg-foreground/5` + `hover:bg-foreground/10`, matching the menu button (they read as a paired open/close control type).
  - **Theme cycle button → same circular chip language** as the X/menu — unified visual material across topbar controls.

- **HeroBlock JSX whitespace gotcha** — initial render had "systems-orienteddesigner" smashed together on mobile. The `<br className="hidden lg:inline">` was working (display:none on mobile), but JSX strips whitespace between text and elements on different lines, so the natural-wrap join didn't have a space. Fix: explicit `{" "}` before the `<br/>`. On desktop the trailing space sits invisibly at line end; on mobile it becomes the joining space. Pattern logged in HeroBlock comments for future-me.

- **Brand link sizing** — `inline-flex mx-auto` didn't center in either context (desktop's stretch default kills mx-auto on flex items; mobile sheet body is block where mx-auto needs block-level). Fix: `flex w-fit mx-auto` — block-level flex with content-width works in both contexts.

#### `allowedDevOrigins` discovery (the multi-hour rabbit hole)
The most painful debug arc of the session. Mobile sheet appeared to "not fire" on real device. Symptoms cascaded:
1. Initial: sheet button tap visibly did nothing on real phone (Chrome Android).
2. Cards on the home page also dead — confirmed total hydration failure, not menu-specific.
3. Restructured the sheet positioning (was: outer `fixed inset-0` + inner `absolute bottom-0`; new: backdrop and sheet as separate `fixed` siblings) to fix Chrome Android's layout-vs-visual viewport mismatch where only the sheet's top peeked above the address bar. Useful fix but unrelated to hydration.
4. Switched body scroll-lock from `overflow:hidden` to the position-fixed pattern (preserve scrollY, freeze body, restore on close) — more robust on mobile. Also kept.
5. Added a visible hydration probe to the layout (renders ❌ NOT HYDRATED, flips to ✅ HYDRATED via useEffect, tap counter for handler-attached test) — confirmed React was never mounting on real device.
6. USB debugging attempt failed — phone showed "Pending authentication" but no RSA dialog ever surfaced (multiple manufacturer-skin layers). Pivoted to cloudflared.
7. Installed cloudflared via brew, opened quick-tunnel — still no hydration through the tunnel either.
8. **The actual fix:** Next.js 15+ silently blocks RSC/HMR requests from non-localhost origins. Add `allowedDevOrigins: ['*.trycloudflare.com', '192.168.*.*', '172.20.*.*', '10.*.*.*', '172.20.117.32']` to `next.config.ts`, restart dev. Hydration immediately works.
9. New memory: `[[next-dev-allowed-origins]]` — symptom (HTML+CSS loads but no interactivity, cards "behave like hovering on desktop" because CSS hover fires on touch but JS handlers don't attach) + fix + debugging-shortcut (add a visible hydration probe before going deep on component bugs).

This whole arc was a process lesson too: **page renders on mobile but nothing's clickable = check `allowedDevOrigins` first**. Spent hours diagnosing component bugs that didn't exist.

#### Various mobile polish (post-rebuild)
- **NavMenu label** ("some things i do") was left-aligned on mobile because the sheet body has no `text-center` (desktop panel cell DOES). Added `text-center` directly to the `<p>` for self-sufficient centering in both contexts.
- **Card grid gap** on mobile: `gap-16 → gap-8 sm:gap-16` — 32px between stacked cards on mobile (was 64px which felt sparse without horizontal breathing room from a 2-col layout).
- **CaseToc bar full-width on mobile** — was inline-grid sized to content. Reclaimed inline BTT space: bar is now `w-full` mobile / `w-auto` desktop; BTT positions `absolute bottom-full right-0 mb-2` (above the bar's right edge) on mobile, slides up out of the bar when scrolled. Desktop unchanged (inline slide-out).
- **Product Ideas mobile rebuild:** dropped the chevron-flanking-image arrangement on mobile; image alone gets full container width, chevrons move to a transport row below alongside the counter pill. `<Image>` element duplicated (one mobile-only, one desktop-only with `hidden lg:hidden` gates) — small DOM cost, no double-load (same `src`, browser dedupes). Caption widens to `max-w-full` on mobile (was anchored to image width).
- **Product Ideas spacing redistribution:** parent `gap-2 → gap-6`, dropped now-redundant `mb-4` on hero. Uniform 24px vertical rhythm.
- **Product Ideas vertical centering:** added `min-h-[calc(100dvh-11.5rem-env(safe-area-inset-top,0px))]` so the carousel content sits centered between topbar and ViewSwitcher with symmetric margin (no min-h on mobile previously → content piled at top).
- **Hero text 16px on mobile** (clamp min from 1.125rem → 1rem); max bumped down from 1.5rem → 1.25rem (less aggressive scaling on big screens).
- **Caption alignment:** centered everywhere, but width extended to `max-w-full` on mobile so multi-sentence captions get readable line length without bouncing.
- **Flex-min-width-auto trap caught:** image as direct flex child wasn't respecting `max-w-full` because flex-item `min-width: auto` for replaced elements = intrinsic width (2000px). Fix: remove the flex wrapper, let image be direct flex-column child where cross-axis sizing works. Future-me note in the file.

#### Contact mobile (vertical centering with no-ViewSwitcher math)
- ViewSwitcher returns `null` on `/contact` (lines: `if (activeIndex < 0 || detail) return null` in ViewSwitcher.tsx). So `pb-24` on page-grid is empty padding, not chrome-reserved.
- Applied Product Ideas' vertical-centering pattern initially, then realized it was wrong: subtracting the full 11.5rem (including `pb-24`'s 6rem) made the bottom gap >> top gap (96px vs 32px), asymmetric.
- Fix: `-mt-8 -mb-24` escapes page-grid's vertical padding entirely; `min-h-[calc(100dvh-3.5rem-env(safe-area-inset-top,0px))]` spans Contact from topbar bottom directly to viewport bottom. Justify-center then produces symmetric gaps.
- User wanted content shifted UP for optical centering (top-heavy content cluster). Used `-mt-8` on the hero `<p>` — negative top margin on the first child of a justify-center flex column shrinks the cluster by 8/2 = 4px from the centered position, lifting visible content up by ~16px. Easy dial knob.
- LINK constant for Farcaster link: switched from `text-text-muted underline hover:text-accent` to `text-accent underline` at rest. Without a hover state on touch, inline text links need the link signal to live in the rest state; muted+hover-warm pattern made the link almost invisible on mobile.

#### `overflow-x: clip` phantom-bug detour
- User reported site-wide horizontal scroll on mobile after the Product Ideas changes. Added `overflow-x: clip` to body as defensive (different from `hidden` — clip doesn't create a scroll container, so sticky topbar still works).
- Ran a `getBoundingClientRect` diagnostic snippet via DevTools on cloudflared URL: no elements actually overflow. Cloudflare had no scroll; LAN IP did. Diagnosis: **stale browser cache** on the LAN-IP session (cache survived across the restructure work).
- After confirming both LAN-incognito and cloudflare were clean, commented out the `overflow-x: clip` (left as a known-good fallback in case overflow ever resurfaces).

#### Status
- `tsc --noEmit` clean throughout. No `npm run build` (dev :3000 live + cloudflared tunnel running; S7 lesson).
- 18 files modified/new past `22be7d8`. Single coherent commit pending.
- **2 new memories** saved: `[[mobile-first-design-process]]`, `[[next-dev-allowed-origins]]`.
- **Cloudflared tunnel still running** (`pkill cloudflared` to stop).

### Resume here — open queue (post-S13)

Pre-launch Polish (mobile pass now CLOSED):
- ~~Mobile re-jig of nav panel + CaseToc~~ ✅ done (architecture rebuild + all sub-areas)
- **Figure out videos** (footy gif, bribe digital rain) — bundle the animated-cover flag in here when a candidate appears

Closed this session:
- ✅ Final frontmatter pass (role → type deprecation fully removed)
- ✅ Blur placeholders for work covers (LQIP sidecar pattern shipped)
- ✅ Final cover-image pass (kept as intentional non-action — dissonance per work-register honesty)
- ✅ **Mobile rebuild from the ground up** (top app-bar + bottom sheet + ThemeCycle + all view-specific mobile passes)

Big Content: Energy / Yara / Kickoff, essays destination.
Launch queue: Vercel push, OG/sitemap/robots.
Post-launch: nothing currently queued.

---

## Session 14 — 2026-06-05 → 2026-06-06 — videos started · lightbox shipped · pivot to launch

A multi-arc session that began as the "Figure out videos" pass and ended pivoting to launch after the user concluded the video work would take more than the initially-budgeted attention. Three substantive arcs: **(a)** Heyfood mp4 landed end-to-end (cover v2 + new `<CaseVideo>` component + clip crop + clean poster); **(b)** Defifa spinner gif processed then dropped (user's "do we really need this gif... we don't"); **(c)** clickable image lightbox shipped (new `<CaseImageViewer>` with caption support). Footy walkthrough flagged-and-parked after a fresh master surfaced a device-frame size-jump.

### Heyfood — cover v2 + walkthrough mp4

- **Cover v2 swap.** New 8000×5172 PNG (same brand-board 1.547 ratio as v1) → master `sources/work/heyfood/heyfood-cover-v2.png` → derivative `public/work/heyfood/heyfood-cover-v2.webp` (**33KB** at q80; v1 was 20KB). Versioned `-v2` per the S10 cache-trap workaround. LQIP regenerated and swapped in `work-covers.ts`; `heyfood.mdx` frontmatter repointed; `.next/cache/images` cleared.
- **New `<CaseVideo>` component (`src/components/CaseVideo.tsx`).** Client component — needs `useRef` + IntersectionObserver + `matchMedia`. Mirrors `<Figure>`'s caption API (`caption` / `captionBefore` / `captionAfter`) so `.case-body figure > figcaption` CSS handles it. `<video muted playsinline preload="metadata">` — no native controls. **IntersectionObserver @ 0.5 threshold fires `play()` once, then disconnects** (one-shot autoplay-on-scroll, never loops). On `ended` → replay button overlay. **`prefers-reduced-motion`** → no autoplay; play-button overlay from the start (triangle glyph). Overlay is always-mounted with opacity + `pointer-events` gated by state, so both the appear AND disappear animate. Overlay is `aria-hidden` + `tabIndex={-1}` when invisible. **Frosted accent material** (`frosted` utility + `text-accent`), **320ms fade** matching `.view-enter`'s scene-change rhythm.
- **`> video` added to `.case-body figure` margin-zero rule** so video sits flush like img/div/picture inside a figure.
- **mp4 pipeline.** Source `the-notion/.../heyfood.mp4` (4.0 MB, 444×928, 18.5s, H.264) → master in `/sources` → ffmpeg `-c:v libx264 -crf 23 -preset slow -an -movflags +faststart -pix_fmt yuv420p`. First encode 321KB. Then **discovered the canvas had 19px top + 20px bottom black bands** (precise scan via sharp raw RGB sampling). Re-encoded with `-vf crop=444:888:0:19` for a tight phone-edge canvas. Final: **317KB**, 444×888.
- **Poster pass.** Frame 0 had a tap-ripple overlay; sampled 7 candidate timestamps; **t=18s** was the only fully clean frame — bonus: it matches the clip's start frame, so the poster→first-frame transition is seamless when autoplay fires. Re-extracted poster from cropped video at t=18 → `public/work/heyfood/heyfood-poster.webp` (42KB).
- **Border-and-caption gap iteration.** Initially wrapped the video in a `border border-border` div — user flagged that the outline was visible (and pushed the caption 1px further from the phone than the `<Screens>` block above it). Diagnosis: `<Screens>`'s child imgs have no border (only `<Figure>` does), so adjacent media read inconsistent. Dropped the border on `CaseVideo`'s wrapper; both issues resolved (8px caption gap now matches Screens). Dark mode concession flagged: the phone bezel may blend into the dark coffee bg without a border — user confirmed acceptable after eyeballing.
- **Placement.** Inside `## The Outcome`, after the static `<Screens>` block, at `width="18rem"` matching `current-checkout` (the other single-phone Figure in the case study).

### Defifa spinner gif — processed then dropped

- **Sharp animated-WebP path.** Master `sources/work/footy/defifa-spinner.gif` (1.79 MB, 459×360, 63 frames @ 20fps) → derivative q80 native size: **670KB** (63% reduction, not S7's optimistic 5-8× because the halftone pulse is expensive — lossless ballooned to 1.47 MB, fps reduction backfired after palette re-derivation).
- **Placed at the top of Footy** above `## The Overview` via `<Figure width="16rem">`, no caption (brand-context beat).
- **User reconsidered:** "man, do we really need this gif? i'm thinking about it now and... frankly, we don't." MDX revert, derivative deleted, master in `/sources` initially kept-then-deleted in this session's cleanup.

### KMac link in footy.mdx

- Quick fix mid-session: "KMac" wasn't linked. Wrapped as `[KMac](https://farcaster.xyz/kmacb.eth)` in the Overview's first sentence — routes through the `a` override in `mdx-components.tsx` for accent text + underline + new-tab.

### New `<CaseImageViewer>` (image lightbox)

User flagged: "we can't click into any of the images on the site." Built a delegated-click lightbox.

- **`src/components/CaseImageViewer.tsx`** — client component, wraps the case-body content with a single `onClick` handler. Any `<img>` click inside the subtree opens a native `<dialog>`. Walks `target.closest("figure")?.querySelector("figcaption")` to grab the caption HTML so multi-paragraph captions preserve structure. Opt-out via `[data-no-zoom]` on any ancestor. Excludes non-img elements automatically (so `<video>` inside `CaseVideo` doesn't trigger).
- **Dialog UX.** Native `<dialog>` opened via `showModal()` — focus trap + Esc-to-close + inert background come free. Image at `max-h-[80vh]` and `max-w-[95vw]`, `object-contain`. Backdrop = `bg-foreground/60` + 8px blur. Close paths: ✕ button (frosted chip, top-right of image), backdrop click (`e.target === dialogRef.current`), Esc. Focus restored to the originating `<img>` on close. **200ms fade-in** via `var(--ease-house)`; reduced-motion snaps.
- **Centering iteration.** Initially Tailwind's Preflight `margin: 0` reset killed the UA `margin: auto` that centers native dialogs. Fixed with explicit `m-auto` + `max-h/w` on the dialog itself. Then user asked: "could we center them only in the viewspace?" Added `dialog.image-viewer { right: var(--nav-w) }` on `lg+` so the centering box runs `(0 to viewport-nav)`. Then: "now leave it at that width but center across the entire viewport again." Dropped the `right` constraint, kept image's `max-width: calc(100vw - var(--nav-w))` so the image is capped at viewspace width but centered in the full viewport (visually extends over the dimmed navbar on its right side).
- **Caption support.** Below image, on a **frosted card** (`frosted rounded-md px-4 py-2 text-foreground`), capped at `--caption-measure` (36rem), `[&>p]:m-0` to stack multi-`<p>` captions tight. Image max-h locked at consistent 80vh whether captioned or not — shape feels the same across every image.
- **CSS hooks (globals.css).** `.case-body img { cursor: zoom-in }` + `.case-body figure > video, .case-body [data-no-zoom] img { cursor: default }`. Plus `dialog.image-viewer[open] { animation: view-in 200ms var(--ease-house) both }`.
- **Wired into `ProjectsExplorer`** by wrapping the case-body div with `<CaseImageViewer>` only in the live detail view — the hidden SEO crawlable copy stays unwrapped (display:none, no clicks possible).

### Footy walkthrough — fresh master flagged, parked

User re-recorded the walkthrough (select game → buy squares, ~26.6s, 788×1592, SDR/bt709 — per our pre-record discussion).

- **Substantial improvements over the original 49.6s recording:** 3× the pixel count, much cleaner cropping (4px top + 7px bottom black bands vs Heyfood's 19+20), bt709 SDR as specified.
- **Issue diagnosed: the iPhone frame size jumps between scenes.** Compared frames at t=0 (large), t=1/3/8 (smaller, padded), t=14/20 (large again). The Figma prototype's frames were authored at different sizes; the device chrome wraps each individually, so the visible iPhone appears to zoom in/out between transitions. Reads as jittery. Re-export needed.
- **Tap ripples still visible** on most interactions (same as Heyfood — we shipped Heyfood with them, but if frame-jump gets fixed, worth disabling "Show Touches" while at it).
- User concluded the video pass would take more sessions than originally budgeted: **pivot to launch.**

### Cleanup-and-pivot

User said "nuke session loose ends, let's tackle launch." Cleared:
- **Deleted** `Screen Recording 2026-06-05 at 15.08.08.mov` (Footy walkthrough master with the frame-jump issue; can re-acquire from a clean re-export later)
- **Deleted** `sources/work/footy/defifa-spinner.gif` (parked gif master; original still in `/the-notion` if decision ever reverses)
- **Committing** the legitimate session work (cover v2 + Heyfood video + lightbox + KMac link + DESIGN.md + this entry).

### ⚠️ Open / parked / next

- **Footy walkthrough video** — needs re-export with consistent prototype-frame sizing AND (ideally) disabled touch indicator. When dropped, the existing `<CaseVideo>` pipeline handles the rest.
- **Bribe matrix** — still needs master produced; resurrect S5 `DigitalRain.tsx` from git history (`git show 38fc24d:src/components/DigitalRain.tsx`) and screen-record or use `MediaRecorder`, OR find/produce a stock Matrix-rain loop. Pre-rendered video is the path — collapses into the same `<CaseVideo>` workflow.
- **Loose lightbox eyeball items** carried forward as in-flight visual polish (close button placement, backdrop dim weight, caption frosted card visibility, etc.) — eyeball in production once launched.

### Resume here — launch

Pre-launch Polish queue:
- ⏸️ Figure out videos (Heyfood done, Footy + Bribe parked for re-export / production)

Launch queue (next):
- **Push to Vercel**
- **OG / sitemap / robots**

Big Content (still deferred): Energy / Yara / Kickoff, essays destination.

### Session 14 (cont.) — 2026-06-06 → 2026-06-07 — 🚀 LAUNCH (live at chukwukaosakwe.com)

Pivoted from the videos pass into launch. Whole launch arc landed in one continuous push: SEO foundation → GitHub repo → Vercel deploy → custom domain → redirect-direction correction → OG image iterations. **Site is live at https://chukwukaosakwe.com.**

#### SEO foundation (commit `a472890`)
- **`src/lib/site.ts`** — single source of truth for canonical URL + brand strings (`SITE_URL`, `SITE_NAME`, `SITE_TAGLINE`, `SITE_DESCRIPTION`). `process.env.NEXT_PUBLIC_SITE_URL` wins if set (lets staging deploys point at a different URL without a code change); falls back to the hardcoded value. Trailing-slash stripped via regex on the env value.
- **`scripts/generate-og.mjs`** — reproducible OG image generator. Pattern mirrors the S11 favicon regen convention: read `public/portfolio-logo.png` alpha, build RGB layer at accent (`#FB370A`), stitch back to RGBA, composite on warm-peach (`#FAE8DB`) background. Text via SVG using system sans (`-apple-system, BlinkMacSystemFont, 'Segoe UI'`) — good enough for v1; could swap to embedded Nata Sans later. Re-run on accent / copy / logo changes.
- **`public/og.png`** (1200×630, ~32KB) — site default OG card. Looks like a screenshot of the site identity, so it reads as "of the site" in linkshares.
- **Root `metadata` expansion in `src/app/layout.tsx`** — full `Metadata` API: `metadataBase`, `title { default, template }`, `description`, `authors`, `creator`, `applicationName`, `openGraph { type, siteName, title, description, url, locale, images: [{ url, width, height, alt }] }`, `twitter { card: "summary_large_image", title, description, images }`, `alternates: { canonical: "/" }`, `icons: { icon: "/icon.png" }`.
- **`src/app/sitemap.ts`** — `MetadataRoute.Sitemap` export, 3 routes (`/`, `/product-ideas`, `/contact`) with `lastModified`/`changeFrequency`/`priority`. Case studies omitted: they live as hash deep-links on `/`, not separate routes (sitemaps want URLs that respond independently). Their content stays crawlable via the hidden static block from S6.
- **`src/app/robots.ts`** — `MetadataRoute.Robots` export. Allow all, sitemap + host pointer.
- **Per-page metadata** on `/`, `/contact`, `/product-ideas` — title + description + openGraph + twitter + alternates.canonical. Title template `%s · Chukwuka Osakwe` makes child pages read `Contact · Chukwuka Osakwe` in tabs/SERPs.

#### Branch hygiene + GitHub (commit `424199c`)
- **Branch reshuffle.** Working trunk was `in-place-detail-and-palette` (a feature-branch name that became the de-facto trunk). `main` was stuck at S5 (`fb33273`, 14 commits behind). Fast-forwarded `main` to current HEAD, deleted `in-place-detail-and-palette`. Single-branch `main`-only repo.
- **README polish.** Replaced the create-next-app boilerplate with a portfolio overview (live URL, stack, routes, doc pointers, image pipeline note).
- **GitHub repo created via `gh repo create`** — public at **https://github.com/Chukwuka-Osakwe/portfolio**. `gh` was already authenticated as `Chukwuka-Osakwe`.

#### Vercel deploy (no commit — happened via the GitHub push)
- Imported via Vercel dashboard. Auto-detected Next.js. **Build succeeded first try** (Next.js 16 prod build is stricter than dev — we'd avoided running it locally per the S7 cache-trap lesson, so this was the validation moment; clean).
- First deploy URL: `https://portfolio-gilt-pi-36.vercel.app/`. Sanity-checked all 7 endpoints (200), sitemap content, robots content, OG metadata in HTML head — all healthy.

#### Domain swap → `chukwukaosakwe.com` (commit `9f8bca5`)
- User has Namecheap domain at `chukwukaosakwe.com`. Removed the `TODO(domain)` placeholder, committed, push triggered Vercel redeploy with correct canonical metadata.
- Walked through Namecheap Advanced DNS: A record `@` → `76.76.21.21`, CNAME `www` → `cname.vercel-dns.com.`. Vercel auto-provisioned Let's Encrypt SSL.

#### Apex/www redirect direction — caught + corrected
- After SSL went live, spot-checked the canonical: apex was returning **308 → www** (Vercel had configured `www` as primary). Our metadata (`SITE_URL`, sitemap, robots, all `og:url`, canonical link tags) all pointed at the apex. Mismatch — search engines following our sitemap would hit apex, get redirected to www, then see a canonical tag saying apex is canonical. Contradictory.
- Flipped in Vercel UI: apex primary, `www` redirects to apex (308). Verified: apex 200, www 308 → apex. State of metadata, code, and Vercel routing all in agreement.

#### OG image iterations
- **v1 (initial, in `a472890`):** logo + "Chukwuka Osakwe" name + "Systems-oriented designer" tagline. Centered composition.
- **v2 (`6e97e3b`):** dropped tagline per user request. Recentered the remaining logo+name pair; logo bumped 280→320px wide, name bumped 72→80px to fill the canvas. Same peach + accent palette.
- **v3 (`ba5ac40`):** lowercased name (`Chukwuka Osakwe` → `chukwuka osakwe`) to match the brand voice. **Scope decision documented:** OG image visual = lowercase (matches hero + wordmark); HTML `<title>` tag + `og:title` metadata text = stays title-cased (browser tabs / SERP listings benefit from title case for proper-noun parsing). Different surfaces, different rules.

#### Linkshare cache caveat (logged for future-me)
Social platforms aggressively cache OG images per URL: **Twitter/X** ([cards-dev.twitter.com/validator](https://cards-dev.twitter.com/validator)), **LinkedIn** ([linkedin.com/post-inspector](https://www.linkedin.com/post-inspector/)), **Facebook/Meta** ([developers.facebook.com/tools/debug](https://developers.facebook.com/tools/debug/)) have public validators that force a recrawl. **Discord/Slack/iMessage** cache without a debugger interface — old shares stay stuck for hours-to-days; new shares pick up the new image. If you haven't shared yet, none of this matters — caches only exist for URLs platforms have already fetched.

#### Launch checklist — closed
- ✅ Site live at **https://chukwukaosakwe.com**
- ✅ Apex canonical, `www` permanently redirects (308)
- ✅ HTTPS (Let's Encrypt cert provisioned via Vercel)
- ✅ Sitemap, robots, OG image, per-page metadata all serving correctly on canonical
- ✅ Source public at **https://github.com/Chukwuka-Osakwe/portfolio**
- ✅ Vercel auto-deploys from `main` on push (verified across 3 commits this session)

#### Open / parked after launch
- **Footy walkthrough video** — still needs re-export with consistent prototype-frame sizing.
- **Bribe matrix video** — still needs master produced.
- **Big Content** — Energy / Yara / Kickoff case studies + essays destination, all deferred.
- **Vercel env var (optional)** — `NEXT_PUBLIC_SITE_URL=https://chukwukaosakwe.com` for future-proofing against domain changes. Works either way today.
- **`scripts/generate-og.mjs` regen convention** added to DESIGN.md alongside the favicon regen pattern.

### Resume here — site is live; iterate from production now

Pre-launch Polish (active): videos pass (Footy + Bribe).
Big Content: Energy / Yara / Kickoff + essays.

Notable that the site is now in a state where iteration is **publicly visible** — Vercel auto-deploys mean every push to `main` is live within ~90s. Loop now includes: validate locally → commit → push → check production. Skip `npm run build` per S7 (still applies — dev server is live, prod build still corrupts `.next/`).

### Session 14 (cont.) — post-launch GitHub profile cleanup (2026-06-07)
Short housekeeping pass after the launch arc closed:

- **`Update github links` task removed** (commit `44a1afc`). The S13-noted post-launch item was originally "add github links back on Contact now that the repo has substance." User decided it wasn't worth doing — Contact's current closing sentence (`"on the internet you can mostly find me hanging out on farcaster."`) is voice-coherent and adding github would dilute it. Five references to the task culled across SESSION_NOTES; the S11 historical-decision context at line 617 preserved.

- **GitHub profile reviewed + cleaned (user-side config, not code).** Pre-state: 0 pinned repos, 5 public repos (`portfolio` + `footy-prototype` with no description + 3 Frontend Mentor / "newbie" learning repos). Visitor flow from the portfolio → GitHub painted a tone-mismatched picture: "systems-oriented designer building thoughtful interfaces" → scroll → "newbie-python-projects." User applied the recommendations: pinned `portfolio` only, made the learning repos + `footy-prototype` non-public, created a profile README repo (`Chukwuka-Osakwe`) with description `"this is me."` Post-state: 2 public repos (`portfolio` + `Chukwuka-Osakwe`), 1 pin, batman-themed avatar confirms the bio's `"clearly i like batman a lot"` lands as intentional charm, not non-sequitur. Tone matches portfolio end-to-end now.

### Session 14 — final closed ✅
Started "we back" → ended at a coherent surface across portfolio + GitHub. **Site is live at chukwukaosakwe.com**, source public at github.com/Chukwuka-Osakwe/portfolio, profile cleaned. Resume from production whenever the next session opens.

---

## Session 15 — 2026-06-12 — ProductIdeas carousel: next/image → plain `<img>` + cover preloading

Short, focused session. Opened with the working tree already carrying an in-progress refactor of `ProductIdeas.tsx` (uncommitted at session start; the prior `094014e` "case studies → real routes + per-slug OG images" commit was the last logged HEAD).

#### The carousel refactor (commit `a78c05c`)
The product-ideas carousel was rebuilt to fix a **Chrome-only layout glitch**: stacked `<Image fill>` covers (`position: absolute; inset: 0`) shrank on loop-back when navigating prev/next past the array boundary — Firefox was unaffected, and no combination of viewport units / wrapper sizing pinned it down.

Fix, three parts:
- **`next/image` → plain `<img>`.** A single `<img>` whose `src` swaps on navigation — standard image-element behavior, identical across browsers. Covers are already pre-optimized WebPs (~45KB each at 2000×1293), so losing srcset/format-negotiation is not a meaningful cost. (`@next/next/no-img-element` disabled inline at the two `<img>` sites.)
- **Aspect ratio via `padding-bottom: H/W%`** on the wrapper (the classic pre-`aspect-ratio` technique) instead of the CSS `aspect-ratio` property — which glitches in Chrome when the wrapper has only `position:absolute` children. Computed once from `IDEAS[0]` dims (`COVER_PAD_BOTTOM`), since every cover exports at the same 2000×1293 (≈1.547:1) Figma brand-board frame.
- **Eager preloading.** Five `<link rel="preload" as="image">` tags (one per cover, hoisted to `<head>` by Next) warm the HTTP cache on first paint, so prev/next swaps read as instant — no caption-ahead-of-image flash.
- Also flipped one desktop `min-h` from `100dvh` → `100vh`.

#### Loop followed: validate → commit → push → verify prod
- `tsc --noEmit` clean (exit 0). Skipped `npm run build` per S7 cache trap (dev server was live).
- Eyeballed at `localhost:3000/product-ideas` — user confirmed "looks good" (loop-back no longer shrinks, swaps instant).
- Committed `a78c05c`, pushed to `main`, Vercel auto-deployed.
- **Production verified** at `chukwukaosakwe.com/product-ideas`: 200, all 5 preload tags in `<head>`, raw `<img>` serving direct `.webp` src (no `/_next/image`).

#### Noted, not fixed
- The **current/first cover (`store-3-v3.webp`) preloads twice** in the prod HTML — once from the `IDEAS.map` loop, once as the LCP image. Harmless (browser dedupes the fetch by URL); could skip-preload the current index if we want it pristine. Parked.

#### Still parked (unchanged from S14)
Footy walkthrough video re-export · Bribe matrix video master · Big Content (Energy / Yara / Kickoff + essays).

### Session 15 — closed ✅
Carousel refactor live on production. Resume from production.

---

## Session 16 — 2026-06-12 → 2026-06-14 — Big Content: Energy + Yara case studies · CaseVideo controls rework · nav + mobile-a11y fixes

A long "Big Content" session: shipped **two new case studies (Energy, Yara)** end-to-end, reworked **`<CaseVideo>`** from autoplay-on-scroll to user-initiated native controls, and fixed three correctness bugs found along the way (nav active-state on case-study routes, two mobile-sheet keyboard-focus leaks). The portfolio now has **all five case studies live** (Footy, Heyfood, Bribe, Energy, Yara). Everything below is committed + pushed; production verified each time.

### Working pattern (reaffirmed)
- For each new case study: **propose the reorg mapping + flag the judgment calls FIRST, then build** (the Energy flow). Mid-session I broke this on Yara — bulldozed the whole build before surfacing the gaps — and got pulled back ("you've lost the thread"). Lesson re-logged: surface the plan and the holes before charging into a full build, even when the doc looks ready.

### Energy case study (commits `4e34488` + `4d62189`)
- **Reorg, no rewrite.** Took the Notion `energy.md` (jewellery retail brand, Chukwuka's *first solo project*) and mapped its prose into our five-section spine without rewriting: intro → **Overview**; Project Objectives + taskflow → **Problem**; Research (moodboard + 3 takeaways) **opens** the **Design System** then flows via the doc's own "With sufficient information gathered…" bridge into the design-direction template + brand guidelines + name + logo; UI Screens (4 pages) → **Outcome**; walkthrough → **Outcome** (was a YouTube link, later replaced by a real video — see below). **Reflection** was absent in the source → shipped as a commented-out heading first, then Chukwuka wrote it.
  - **Judgment calls** walked via AskUserQuestion before building: Research placement (chose "open the Design System"), Reflection handling (TODO stub → later filled). Decided to **comment out** the empty `## The Reflection` heading rather than ship a dangling accent heading to the live site; uncommented once copy landed.
  - **Typo fixes** (light, like the prose-preservation rule allows): kept "B2B SaaS" properly capitalised per Chukwuka — *"everything in case studies can break with the site's wider lowercase convention."* Good convention note: **case-study body copy is exempt from the site's lowercase brand voice.**
- **Images:** masters → `sources/work/energy/` (gitignored), 9 WebP derivatives → `public/work/energy/`. Cover iterated: first used the design-direction board, then Chukwuka **re-exported `energy-cover.png`** (the tablet mockup) at the 31:20 frame; that's the live cover. `type: "VISUAL DESIGN"`.
- **Walkthrough video:** the YouTube Short had no local master; Chukwuka dropped the original screen recording (81s, 696×1402, bt709). Re-encoded via the pipeline (downscaled 540w, crf 26, audio stripped, faststart → **2.9MB**) + poster from the first frame. **Flagged 81s as long** for the no-controls component — which seeded the controls rework.
- **`date`:** real date unknown; set to an **intentional earliest-floor (`2023-01-01`, sort-only/never displayed)** so it always sorts last as the first project. Documented in the frontmatter comment.

### Yara case study (commit `b613bb8`)
- **Farcaster mini-app for crypto→Naira conversion.** Source doc (`yara.md`) was **already** in the five-section spine but a rougher draft. Normalised the heading names to convention (**"Designing The System" → "The Design System"**, **"The Reflections" → "The Reflection"**), fixed typos ("Base,r" → "Base,", unclosed paren, escaped `—\>` arrows → `→`).
- **Two real holes flagged, not papered over:** (a) the Reflection trailed off mid-word ("Making") — shipped commented-out, Chukwuka later wrote it; (b) the original USD-first screen image was missing from the drop — left a `{/* TODO(image) */}`, Chukwuka dropped `yara-first-screen.png`, then wired it. Chukwuka also added a closing Outcome paragraph describing the redesigned screen's interactions.
- **Images:** 4 screens/diagrams (original first-screen 18rem phone → flowchart → three-stage categories diagram → consolidated Fund Details redesign). **Cover:** first tried the 4:3 fund-details hero (cropped in the 31:20 card — Chukwuka rejected the crop), then he re-exported `yara-cover.png` at 1.55:1 (the two-phone composition, no crop) — that's live.
- **`date`:** provisional `2026-03-01` (real date unknown), sorts Yara between Bribe and Energy. Sort-only. **Still flagged to confirm.**

### `<CaseVideo>` — autoplay-on-scroll → user-initiated native controls (commit `1403ce3`)
- Chukwuka's call: **"add controls to the videos instead of autoplay every time, anticipating longer videos."** Right call — autoplay-with-no-seek doesn't scale to longer clips.
- Chose (via AskUserQuestion) the **hybrid model**: on-brand frosted poster + play button at rest → **native controls** (`controls={started}`) once the reader presses play. Best of both — branded resting state, real scrubber.
- **Removed:** the IntersectionObserver autoplay, the `prefers-reduced-motion` branch (nothing moves until opt-in now), the custom replay overlay (native controls handle replay). Added `controlsList="nodownload"`. Shared component, so **Heyfood's video changed too**; updated the stale "autoplay-on-scroll" comments in both `heyfood.mdx` and `energy.mdx`. **DESIGN.md `<CaseVideo>` entry updated** to the new model.

### Bug fixes
- **NavMenu active-state on case-study routes (commit `1797ee4`).** The `094014e` real-routes migration moved case studies to `/design/<slug>`, but NavMenu's active check was exact-match against `["/", "/product-ideas"]`, so opening any case study left **no** nav item highlighted. Added `/design` to design's `activeFor` + an `isActiveFor()` helper that matches **"/" exactly but other paths as sub-route prefixes** (so `/design/<slug>` highlights "design" without "/" over-matching everything). General — future sub-routes just work. **Affected all case studies, not just the new ones.**
- **Mobile-sheet keyboard focus leaks (commit `542017b`).** Surfaced while investigating Chukwuka's tab-order report (see below). Two related a11y defects, both fixed with **`inert`** (the correct tool — `aria-hidden` removes from the a11y tree but *not* the tab order):
  - **Closed sheet was tabbable:** `MobileSheet` had `aria-hidden={!open}` only, so its Close button + duplicate nav stayed in the tab order — you could Tab into a closed menu. → `inert={!open}` on the sheet.
  - **Open-sheet focus trap leaked:** the top bar sits *outside* the layout's inert wrapper (so the menu button can double as the ✕), but that left the logo + `ThemeCycle` tabbable while the sheet was open. → `inert={open}` on the logo `<Link>` and on a `contents`-wrapper around `ThemeCycle` (no layout box); the menu/close button stays live.

### Tab-order investigation (CDP, no library)
- Chukwuka reported: tabbing navbar → TOC "selects overview then outcome before the toc items." **Drove headless Chrome via CDP** (Node 25 has global `WebSocket`; `/json/new` needs PUT) to dump focusable order + simulate real Tab presses across widths/heights. **The desktop tab *order* is provably correct** (back-to-work → Overview → Problem → Design → Outcome → Reflection → BTT) and the active-thumb stayed stable (the TOC is `fixed`, so focusing it doesn't scroll). **Could not reproduce** the overview→outcome jump — but the dumps surfaced the *real* mobile-sheet bugs above. **Still open:** asked Chukwuka for repro details (window width; focus-ring vs. the highlighted thumb; browser) — unanswered, parked.
- **Reusable tooling:** CDP-over-built-in-WebSocket is a viable way to inspect real client-rendered tab order / focus behavior without installing puppeteer/playwright. Chrome is at `/Applications/Google Chrome.app/...`; launch `--headless=new --remote-debugging-port=9222`.

### Process gotcha (logged — bit us once)
- **Adding a case study needs `node scripts/generate-case-og.mjs <slug>`** to mint the per-slug OG card (`/og/<slug>.png`). Easy to forget — Energy shipped first without it and `/og/energy.png` 404'd in prod (caught in verification). Now part of the per-case-study checklist. Energy + Yara both have OG cards live.
- **CDN lag on fresh static assets:** after a push, a brand-new `/og/<slug>.png` can 404 for ~30s at the edge even after the route + other `public/` assets are 200. Re-poll before concluding it's broken.

### Production state
All five case studies live: Footy → Heyfood → Bribe → Yara → Energy. Each route 200, covers + body images + per-slug OG all serving; mobile-menu keyboard traps fixed; CaseVideo controls live (Energy + Heyfood). Vercel auto-deployed across all commits this session.

### Resume here — still open / parked
- ~~**Yara `date`** — provisional `2026-03-01`; confirm the real one (sort-only).~~ **Closed S17:** real date unfindable; accepting `2026-03-01` as-is (sort-only, never displayed).
- ~~**Energy 81s walkthrough** — optional trim to a ~20–30s highlight; parked.~~ **Closed S17:** leaving as-is.
- **"overview → outcome" tab report** — unreproduced; waiting on Chukwuka's repro details (window width / focus-ring vs thumb / browser).
- **Yara TOC** shows a "Reflection" segment that now resolves (reflection written); was dead while commented out — no longer an issue.
- **Kickoff** case study — no source dropped yet (Big Content remainder).
- **Bribe matrix video** — master is local (`the-notion/.../Video_2025-11-21_12-56-38.mp4`, 1080×1350, 6.5s, the Bribe app over Matrix rain); unblocked whenever, drops into the `<CaseVideo>` pipeline.
- **Footy walkthrough video** — still needs re-export (prototype frame-size jump).
- ~~**essays destination** — still the WordPress external link.~~ **Closed S17:** built a native `/essays` section and migrated 11 essays (see S17).

### Session 16 — closed ✅
Two case studies (Energy, Yara) + CaseVideo controls rework + nav/mobile-a11y fixes, all live. Resume from production.

---

## Session 17 — 2026-06-16 → 2026-06-18 — Native essays section + Paragraph→Arweave migration (11 essays) · `<YouTube>`/`<Tweet>` components · contact social icons · Bribe video

A big session. Opened with small touches (contact social icons, Bribe matrix video), then built the **native essays section** end-to-end and **migrated 11 essays** off Paragraph/WordPress into it. Commits held while iterating, then shipped at the end: contact icons (`a18c04f`, `f45bfb1`), Bribe video (`1fb3273`), and the whole essays section as one atomic commit **`a935808`** — production build clean (25 pages, all 11 essay routes SSG), **pushed + Vercel-deployed**.

### Contact — GitHub + LinkedIn social icons (committed `a18c04f`, hover fix `f45bfb1`)
- Centered icon-only links below the Farcaster line (`mt-8`, `gap-8`). `aria-label` each; `target=_blank`/`rel`.
- **Hover-aware resting state:** base `text-accent` (touch has no hover, so they read as live links from the start — same logic as the `LINK` inline-link convention), but `[@media(hover:hover)]` mutes at rest → accent on hover for the desktop affordance. Keyed to pointer capability, not width.

### Bribe — Matrix-rain walkthrough video (committed `1fb3273`)
- Dropped the local master (phone over hand-made Matrix rain) into the `<CaseVideo>` pipeline: 540w/crf23/no-audio/faststart (129KB) + first-frame webp poster. Full-width at the end of The Outcome (the rain is a composition, not a bare phone screen).

### Native essays section
- **Data layer already existed:** `lib/content.ts` had a `"writing"` Section + `getFeatured()` merging work+writing (anticipatory). Built the missing **routes + listing UI + nav wiring**.
- **Routes:** `/essays` (listing) + `/essays/[slug]` (reading page), parallel to `/` + `/design/[slug]`. `generateStaticParams` from `getAllMeta("writing")`.
- **`EssaysList`** — prose-first **text listing** (no covers, unlike the case-study card grid). Header mirrors the case-study detail header (title + lead-in + tight `border-b-4 border-accent` rule). Rows are **title-only** (date/summary dropped from previews after eyeball), `py-3`, `text-base`, `divide-y` dividers. **Hover dims siblings to `--text-muted`** (token-based, not raw `opacity-40` — the codebase only uses opacity for show/hide; muting is a color-token job) while the hovered title warms to accent (`!text-accent` to beat the same-specificity list-hover rule). WordPress back-catalogue link sits **at the top**: "some of my older essays are on wordpress →". Lead-in: "thinking out loud about life, design, (onchain) products, and the internet."
- **`/essays/[slug]`** reading page — lighter than a case study: back-link → title + **date** header (essays show the date; case studies don't) → `.case-body` prose (reused for typographic parity). Date is **formatted + displayed** via `lib/date.ts` (`formatDate`, UTC-safe).
- **Nav:** "essays" flipped from external WordPress → internal `/essays` (`activeFor: ["/essays"]`, prefix-matches sub-routes). **Sitemap:** `/essays` + per-essay entries.

### Paragraph → Arweave migration workflow (the method — see [[essays-arweave-migration]])
- Scoped three source options live: **WebFetch** (small model *summarizes*, lossy), **`.md` drops** (carried *degraded ~624px base64* images), and the winner — the post's **Arweave permalink**. Paragraph writes each post to Arweave at publish time as **structured JSON** (a ProseMirror doc). `curl` it → `JSON.parse(d.json)`, walk `.content`.
- **Date = `createdAt`** (epoch ms, authoritative — written on publish, so stop asking). **Images = real high-res URLs** on `storage.googleapis.com/papyrus_images/…` (public, downloadable) → masters in `sources/writing/<slug>/`, WebP derivatives (cap ~1344px, text-heavy → higher q) in `public/writing/<slug>/`. No more base64/re-export round-trips.
- **Node-type handling:** `paragraph`/`heading`/`blockquote`/`orderedList` straightforward; **`youtube`** → `<YouTube id>`; **`embedly`** (Farcaster cast) → render its `thumbnail_url` as a **linked card image** (`warpcast.com`→`farcaster.xyz`); **`twitter`** → the **`<Tweet>` card** (no pre-rendered image, reconstructed from data). Tweets embedded as plain *screenshots* stay `<Figure>` images.
- **Caption-link limitation:** Paragraph `figcaption`s can carry inline links; MDX string-form props can't render them ([[mdx-jsx-expression-props-dropped]]) → captions are plain text, caption links dropped (in-prose links survive).
- **`.md`-drop workflow** (pre-Arweave, still valid for non-Paragraph drops): date sits at the top of the file → lift to frontmatter, don't render ([[essay-date-in-source]]).

### New components
- **`<YouTube id title width caption>`** — privacy-friendly (`youtube-nocookie`) lazy iframe in a 16:9 bordered box, wrapped in `<figure>` for `.case-body figure` spacing. Server component. (First used: Elon first-principles clip in *Design From First Principles*.)
- **`<Tweet name handle avatar href>` + MDX children** — static tweet card (avatar + name + @handle + X glyph + text), the whole card linked to the tweet. Reconstructed from a `twitter` node's data (no live widget). Tweet text passed as **children** (not a prop — JSX-expression props get dropped). 32rem cap to match inline tweet screenshots. (First used: David Perell otium tweet in *Sometimes, Standing Still…*. Chukwuka chose the card over a blockquote.)
- **`lib/date.ts`** — UTC-safe `formatDate("2024-03-20") → "March 20, 2024"`.

### Essay OG cards — `scripts/generate-essay-og.mjs`
- Essays have **no cover**, so OG is a generated **text card** (sharp + SVG, like `generate-og.mjs`): peach field + accent "essays" eyebrow & rule + **title (left-aligned, word-wrapped, auto-fit 64→42px)** + name. Output **`public/og/essays/<slug>.png`** — namespaced under `og/essays/` so essay slugs can't collide with case-study OGs at `og/<slug>.png`. The essay `generateMetadata` existence-checks it (site-default fallback if missing — same pattern as case studies). **Run `node scripts/generate-essay-og.mjs [slug]` per new essay** (logged in the migration checklist).

### The 11 essays (newest→oldest, all in `a935808`)
James Will Only Spend A Few Seconds On This Button (`.md` drop) · Modals In Mini-Apps (Arweave; 10 imgs + YouTube explainer) · Design From First Principles (`.md`; YouTube) · Do Something (`.md`; 1 img) · Financialisation And UX Problems (`.md`; 3 imgs, re-exported crisp) · Obsession And Taste (`.md`) · Self Conscious Running (`.md`) · The Internet Is Dead. Long Live The Internet. (Arweave; Thanos meme, links de-bolded) · Some Ramblings On AI And Creative Work (Arweave) · Sometimes, Standing Still Is Moving Forward (Arweave; 2 tweet screenshots + `<Tweet>` card) · Stablecoin User Narratives (Arweave; cast-card embed + Money Heist meme).
- **Placeholders nuked** (interfaces-are-arguments, the-cost-of-a-default, and the original stated-problem) so previews eyeball clean. **11 real essays, no filler.**

### Open / parked — resume here (S17)
- **Shipped:** essays section committed (`a935808`) + pushed; production build clean (25 pages, 11 essay routes SSG); Vercel auto-deployed. Verify the live `/og/essays/<slug>.png` cards (CDN can 404 fresh static assets ~30s post-deploy — re-poll).
- **Cross-links to repoint when targets migrate** ([[essays-migration-crosslinks]]): obsession-and-taste → "Good Obsession" (WP); sometimes-standing-still → "When In Doubt, Move Forward" (WP); some-ramblings → "writing" (`paragraph.xyz/@cryptonao`).
- **More Paragraph essays** to migrate (back-catalogue) — drop Arweave links; drop the "older essays on WordPress →" listing link once done.
- **Optional `<Figure>` caption-link support** — would let migrated caption links survive (currently dropped).
- Older parked items still open: "overview → outcome" tab report (unreproduced), Kickoff case study, Footy walkthrough re-export.
- **Figure out art style for the future** — settle a visual/art direction for the site going forward.

### Session 17 — closed ✅
Native essays section + 11 migrated essays (`<YouTube>`/`<Tweet>` components, Arweave→ProseMirror workflow, essay OG cards) shipped in `a935808`; contact icons + Bribe video earlier. All live. Resume from production.

---

## Session 18 — 2026-06-18

### Essays listing — inline dates before titles (`EssaysList.tsx`)
- Reversed the earlier "title-only previews" call: each row now leads with its **date inline before the title**. Iterated live: date-above-title → inline with `·` dot → dot dropped for a flex layout.
- **Layout:** `<h2>` is `flex items-baseline gap-8` (32px gap). Date is a `<time shrink-0 text-sm font-normal tabular-nums text-text-muted>`; title in a `<span text-balance>`. **`tabular-nums` + fixed `dd/mm/yy` width guarantees every title shares the same left edge** (no per-row drift). `gap-8` matches the page's 32px grid rhythm.
- Date format: **`dd/mm/yy`** via new **`formatDateShort`** in `lib/date.ts` (en-GB, 2-digit, UTC-safe — same UTC parse as `formatDate`). The long-form `formatDate` is untouched (still used by the essay detail header).
- Hover behavior unchanged: title warms to accent, date stays muted.
- Shipped in `e0c8f24` (pushed).

### Background colour — experiment, reverted
- Briefly swapped `--background` `#fae8db` → `#faf5f2` (cooler off-white) to eyeball, then **reverted to `#fae8db`** (the original warm cream-peach). No net change.
- Note: the live page-background "white" is **`#fae8db`** — the old `#FDF6FB` from S1 history is stale.

### Session 18 — closed ✅
Inline `dd/mm/yy` dates on the essays listing shipped (`e0c8f24`); background-colour experiment reverted. Tree clean.

---

## Session 19 — 2026-06-23 — Essay #12: "On The Importance Of Naming Things Properly"

### New essay migrated (`.md` drop)
- Chukwuka dropped `On The Importance Of Naming Things Properly.md` in root + four full-page screenshots (`navbars1–4.png`, 6048×3928 retina) — a short essay on the Kickoff navbar redesign and the lesson that you can't fix a design problem until you can **name** it (the original nav links were styled as **action buttons** when they should have been **state selectors**). Slug: `on-the-importance-of-naming-things-properly`. **Newest essay → sorts to the top.**
- **`date`:** none in the source file → set to **`2026-06-23`** (publish date; the prose only says "a few weeks ago"). Sort-only/displayed as `23/06/26` in the listing.
- **Images — full screenshots (after a crop detour).** First tried tightly cropping each to just the navbar chrome (focus the subject); cropped to ~7:1 strips they were too small/illegible side-by-side in the 42rem essay column (essay images have **no click-to-zoom** — `/essays/[slug]` renders `<Mdx>` directly, no `CaseImageViewer` wrapper). Chukwuka eyeballed it and **preferred the full page screenshots** instead. Final derivatives: full images → 1600w, WebP q85, ~41–51KB. Masters → gitignored `sources/writing/<slug>/`; derivatives → `public/writing/<slug>/`.
- **navbars1 trimmed + padded to match navbars2's dimensions.** navbars1 was a full-screen capture (macOS menu bar + Chrome bookmarks bar) while navbars2–4 are clean browser windows. **Spliced out** the macOS menu bar (crop above the Chrome tab bar, ~orig y150) **and** the bookmarks bar (removed orig y≈500–655, joining the address bar straight onto the black app navbar) → looks like the others structurally. That left it 6048×3621 (shorter); to match navbars2 exactly, **padded the bottom +307px with the page bg `#0a0a0e`** → 6048×3928, derivative 1600×1039 (identical to navbars2 → equal-height side-by-side). The spliced+padded composite is saved as `sources/.../navbars1-trimmed.png` (original `navbars1.png` master untouched). Residual: navbars1's Chrome is a **light/pink theme** vs the others' dark — baked into the shot, doesn't bother Chukwuka, only fixable by re-shooting.
- **navbars1 + navbars2 side by side (Chukwuka's call).** Kept literally side-by-side with the prose's "left/right" language intact, via `<Screens cols="2" width="100%">`. navbars3 + navbars4 are full-width `<Figure>` (legible at 672px). navbars3 carries the source's caption ("let's make it more rounded so it doesn't compete visually with buttons!").
- **Body:** dropped the duplicate `## title` line (title comes from frontmatter → h1), prose preserved verbatim, three `[insert …]` placeholders replaced. Wrote `summary` (SEO/OG) + descriptive `alt` on all four.
- **OG card:** `node scripts/generate-essay-og.mjs <slug>` → `public/og/essays/<slug>.png` (per the checklist).

### Verified + shipped (`edf4127`, pushed)
- `tsc --noEmit` clean; **`npm run build` clean — 26 routes** (was 25), the new essay route prerendered first in the SSG list (newest). SSR HTML contains all four `navbars*.webp` paths, the `screen-grid` side-by-side, the navbars3 caption, the Alexander Karlsson link, and the "state selectors" prose. Listing shows the title + `23/06/26`.
- Committed as `edf4127` + pushed; **live-verified on production** (chukwukaosakwe.com): page 200, all 4 navbar webps 200, OG card 200, `/essays` listing shows it. The raw `.md` drop was moved into gitignored `sources/.../source.md` (not committed); masters there too.

### OG image redesign — dark fill + accent title-only essays (committed this session)
- Chukwuka changed the OG art direction. **All text-based OG cards now use the DARK (coffee) palette**, not the light peach field — `--background-dark #181311` fill. The hardcoded token constants in the scripts were swapped (comments updated to point at the dark palette; rerun-on-change note kept).
  - **`generate-essay-og.mjs`** — essay cards are now **heading-only**: dropped the "essays" eyebrow + rule **and** the "chukwuka osakwe" name footer. Just the title, **in accent orange `#FB370A`** (Chukwuka's pick over cream), left-aligned, vertically centred in the canvas. Bumped the auto-fit ladder (`76→50`) + max 4 lines since the title owns the whole card now.
  - **`generate-og.mjs`** (site default `og.png`) — flipped to the same dark fill: coffee bg + accent logo + **cream `#F4EAD8`** name. Chukwuka confirmed keep it dark (so a homepage linkshare matches the essay cards).
  - **`generate-case-og.mjs`** — **untouched.** Case-study OGs pad from each cover's own sampled edge colour (no palette fill), so the dark-fill change doesn't apply. (Open option if Chukwuka later wants those "darker" too.)
- Regenerated all **12 essay OG cards** + `og.png`. (Case-study OGs not re-run.)

### Parked
- Cross-ref: this essay is about **Kickoff**, also a parked **case-study** candidate (no source dropped yet).
- Prior `cff9066` (::selection styling) is committed but never got a notes entry.
- All prior parked items unchanged (more Paragraph essays, "overview → outcome" tab report, Footy walkthrough re-export, `<Figure>` caption-link support, broader art-direction pass).

---

## Session 20 — 2026-06-25 — short maintenance sesh

### Installed UI-polish skill
- `npx skills add jakubkrehel/make-interfaces-feel-better` → dropped `.agents/skills/make-interfaces-feel-better/` (SKILL.md + typography/surfaces/animations/performance) + `skills-lock.json` into the repo root. It's a design-engineering audit checklist (concentric radius, optical alignment, shadows-over-borders, staggered enter / subtle exit anims, tabular-nums, text-balance, image outlines, scale-on-press, no `transition: all`, 40×40 hit areas). Much of it already matches the site (card box-shadow, listing tabular-nums, text-balance titles, eased reduced-motion modal). **Net-new candidates if/when we audit:** image outlines on essay/cover imgs, scale-on-press on cards/buttons, root font-smoothing, stray-`transition: all` sweep.
- **`.gitignore`'d both `/.agents` and `/skills-lock.json`** (local tooling, not shipped) — commit `9cd0453`.
- **Audit NOT run** — Chukwuka said hold off. Parked for a future session.

### Essay edit — Stablecoin User Narratives, narrative #2
- Expanded the Jane/Tokyo payroll narrative: added the two Nigerian freelancers, the parallel-rates/weak-currency/finance-integration pain, and the USDT-to-wallet resolution ("Simple, fast, efficient."). Fixed a slip ("create out content" → "create content"). `src/content/writing/stablecoin-user-narratives.mdx`. Content-only. Commit `467b61b`.

### Shipped + closed ✅
- Both commits pushed to `main` (`9cd0453`, `467b61b`); tree clean, up to date with origin. Vercel auto-deploys. No build risk (gitignore + MDX prose only).

---

## Session 21 — 2026-06-26 — epigraph on the naming essay (+ two real bugfixes)

### Goal
- Add a centered Confucius epigraph at the top of the **"On The Importance Of Naming Things Properly"** body: *"The beginning of wisdom is to call things by their proper name." ― Confucius*.

### What looked like a one-line edit hid two stacked bugs
Initial drop was `<p className="text-center italic leading-snug text-text-muted">…<br />…</p>`. It rendered, but every spacing tweak (`leading-snug` → `leading-none`) visibly did nothing. Two causes, found by inspecting **compiled CSS** + **rendered HTML** rather than re-guessing classes:

1. **Tailwind v4 wasn't scanning `.mdx`.** `leading-snug`/`leading-none` appear ONLY in MDX (not in any `.tsx`), so they were never generated — grep of `.next/**/*.css` showed `none=0`/`snug=0` but `tight=1` (the latter is used in components). The classes that *did* seem to work (`text-center`, `italic`, `text-text-muted`) only did so because they're generated from component usage elsewhere. **Fix:** added `@source "../content";` to `globals.css` (after the typography `@plugin`). Rebuilt → `leading-none` now present in prod CSS. Commit `e303e2f`. **→ saved as a memory (`tailwind-mdx-source-scan`).**
2. **`<p>`-in-`<p>` nesting.** MDX wraps a JSX element's inner text in its own `<p>`. A `<p>` can't legally contain a `<p>`, so the browser **auto-closed the styled outer `<p>` as empty** and the text rendered in a bare inner `<p>` with default prose styling (1.75 line-height, no centering). So even once the class existed, it was landing on an empty element. Intermediate attempt with a `<div>` wrapper but multi-line content split the two lines into **two separate `<p>`s** (each with prose's ~20px block margins → gap now margin-driven, `leading-*` useless). **Final fix:** single-line `<div>` — `<div className="…leading-normal…">“…”<br />― Confucius</div>` — so the text sits directly in the styled div and `<br />` is a true inline break the div's line-height controls. Commit `1de25ed`.

### Line-height dialled in live (dev server)
- Spun up `next dev` so Chukwuka could eyeball. Ladder at 16px font: prose default `1.75`=28px ("crazy"), `leading-none` `1`=16px ("too tight"), `leading-tight` `1.25`=20px ("nothing changed" — only 4px off none), settled on **`leading-normal` `1.5`=24px** ("this is fine"). Verified each step landed in the rendered HTML, not just the file.
- Note: the no-op commits `da6fa90` (epigraph add) + `0b30ac5` (`leading-snug`→`leading-none`) predate the two fixes — they shipped but did nothing visible until `e303e2f`+`1de25ed`.

### Shipped + closed ✅
- All pushed to `main` (`da6fa90`, `0b30ac5`, `e303e2f`, `1de25ed`); prod build clean; dev server stopped; tree clean. Vercel auto-deploys.

---

## Session 22 — 2026-07-15 — "the lab": new self-directed-work category (design convo) + Aronia detail page built

### The decision (long conversation, no code first half) — see memory [[portfolio-the-lab-section]]
Worked out a new content category from scratch. Landed on **"the lab"**:
- **Definition = self-directed / uncommissioned work** — things Chukwuka builds *for
  himself* (solo or with a friend). Sorting test: *"did anyone ask me to build this?"*
  (no → lab). **NOT** defined by being unfinished; stage is just a tag. Founding items:
  **Aronia** (agent-friendly component library, own site in progress + GitHub repo) and
  **Kickoff** (2-person passion project — redesign + design→code handoff to a backend-dev
  friend via LLMs + game logic). Both "me-for-me," so both are lab, not client work.
- **Placement:** design becomes a **three-tab surface** (`ViewSwitcher`): **my lab ·
  case studies · product ideas**, with **my lab the default/landing view**. Rejected:
  top-level nav item, lab-as-separate-homepage. Rationale: the lab proves he goes *past*
  design (code/agents/backend) while *still a designer at heart* → it leads the design
  triad, not a silo. **"projects" → "case studies"** rename (strict upgrade).
- **Presentation = video-forward / editorial** (ref: madhurima.me/work/checkmate). Lab
  items are **trailers, not case studies** — looping hero clip + minimal prose, then
  **link OUT** to the real home (repo/site). Don't clone Aronia's own site.

### Built this session — the Aronia lab detail page (proof-of-concept)
- **Route map planned** (lab-as-default shifts URLs; mirrors the case-study pattern):
  | tab | index | detail |
  |-----|-------|--------|
  | my lab (default) | `/` | `/lab/[slug]` (NEW, built) |
  | case studies | `/design` (new index, NOT built yet) | `/design/[slug]` (exists) |
  | product ideas | `/product-ideas` | — |
- **Video pipeline (Aronia):** fresh 64s screen-recording (3020×1650, 120fps, silent)
  → `public/lab/aronia/walkthrough.mp4` (ffmpeg: `scale=1600:-2,fps=30`, libx264
  `-crf 22 -preset slow`, `-an -movflags +faststart`; 28.7MB → **1.8MB**, 1600×874) +
  `walkthrough-poster.webp` (frame @10s via sharp, 45KB). Masters parked in gitignored
  `sources/lab/aronia/` (both the fresh clip + an earlier "baby" clip). **ffmpeg lacks
  libwebp here → extract PNG then convert with `sharp` for webp.**
- **Content model:** added **`"lab"` to the `Section` union** in `lib/content.ts`;
  extended `Frontmatter` with lab-only **`video`**, **`stage`**, **`links: {label,href}[]`**.
  Reuses the whole `getAllMeta`/`getEntry`/`generateStaticParams` machinery. Authored
  `src/content/lab/aronia.mdx` (body leads with `## Overview`). **Gotcha:** unquoted
  `date:` YAML parses to a **Date object**, not a string — read year via
  `new Date(meta.date).getUTCFullYear()`, never `.slice`.
- **Cinematic template** — new `LabDetail.tsx` (server) + `LabHeroVideo.tsx` (client).
  Deliberately NOT the `.case-body`/TOC/CaseImageViewer shell. Final structure (after
  live iteration with Chukwuka): back-link → **header (title + `blurb` tagline) closed
  by `border-b-4 border-accent` rule** (mirrors case-study/essay headers; header
  **left-aligned**, rest centered) → **hero clip** → **TL;DR** (Substack-style
  blockquote, accent left stroke, holds `summary`) → **Overview** (MDX body) → **link
  chips** (outbound, `bg-nav-fill`) → **`STATUS: <stage>` pill** (uppercase, `bg-accent-100`,
  the closer). `LabHeroVideo` autoplays muted+loops; reduced-motion pauses to poster +
  shows controls.
- **Hero "dominate on load"** (Chukwuka picked "tall hero, header first"): new
  **`.lab-hero`** class in `globals.css`. At `min-width:72rem` the clip **breaks out of
  the centered `--content-w` (49rem) column to fill the visible viewspace** (left screen
  edge → identity panel) → ~65vh+, no crop (a wide 3-pane clip can only gain height by
  gaining width). Token-derived calc: `width: calc(100vw - var(--nav-w) - 3rem)`,
  `margin-left: calc((var(--nav-w) + 5rem + var(--content-w))/2 - 50vw)`, ~1.5rem gutter
  each side (absorbs the 100vw-vs-scrollbar mismatch). **Fix hit live:** first centered in
  the grid *track* (excludes the 2rem column-gap before the panel) → read left-shifted on
  wide screens; corrected to center against the **panel edge** (`−3rem` not `−5rem`).
  Plus a `lab-hero-in` load reveal (rise + fade + micro-scale; reduced-motion skips).

### State at session end — NOT committed
- `/lab/aronia` renders (200, SSR-complete: video, poster, TL;DR, Overview, GitHub chip,
  status pill). `tsc --noEmit` clean. **Nothing committed / no build run yet** (mid-feature).
- **Dev server:** stopped at session end.
- Files touched: `src/lib/content.ts`, `src/content/lab/aronia.mdx`,
  `src/components/LabDetail.tsx`, `src/components/LabHeroVideo.tsx`,
  `src/app/(site)/lab/[slug]/page.tsx`, `src/app/globals.css`,
  `public/lab/aronia/*`, `sources/lab/aronia/*` (gitignored).

### Next up (resume here)
1. **Kickoff** — the second lab item (capture footage first; game-logic / design→code
   story). Drops into the proven `/lab/[slug]` mold.
2. **Lab listing** component (the `/` grid of lab cards — card treatment TBD; blurb =
   "An Agentic component library for vibecoders", cover = poster).
3. **Route swap** (the front-door surgery, do last): `/` → lab default; case-studies index
   → new `/design`; `ViewSwitcher` → 3 tabs + `projects`→`case studies` rename;
   `NavMenu` "design" `activeFor` gains `/design`,`/lab`; keep `HashRedirect` on `/`.
4. **OG + sitemap** for lab routes (lab OG script, à la `generate-essay-og.mjs`; deferred).
5. Aronia live-site link chip once the site ships.
6. Then commit + build-verify + push.
