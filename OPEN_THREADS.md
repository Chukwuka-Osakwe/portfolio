# Open Threads

The living backlog of everything left unfinished, across sessions. Read this alongside `SESSION_NOTES.md` at session start; keep it current as threads open and close.

**Convention:** one checkbox per thread. When you close one, move it to "Recently closed" (with the session + date) rather than deleting it — that stops future sessions re-investigating settled ground. Group by kind, most actionable first.

_Last reconciled against code: 2026-09-29 (start of S39)._

---

## 🟡 S39 backlog (carried from S38 "Next up")

- [ ] **Delete redundant wireframe sandboxes** — `/wireframe/merged-grid` and `/wireframe/gallery`, both superseded by the live `DesignGrid` and `/design/chipmango`. Kept in S38 as reference sandboxes; cull when no longer needed.
- [ ] **Generalize the ChipMango gallery route** into a `layout: gallery` frontmatter switch on `/design/[slug]` + a real "brand" content section. ChipMango is hardcoded in `src/app/(site)/page.tsx` today (see the TODO at ~`page.tsx:41`). _Deferred until a 2nd gallery entry appears._

---

## ✅ Recently closed

- **[closed S40, 2026-10-20]** Gallery polish — `Gallery.tsx`'s raw `<img>` frames swapped for `next/image` (`fill` + computed `sizes`, `priority` on the first hero block only, the rest lazy). Dropped the now-redundant `[&_*]:!rounded-none` override on `SiteTopBar`'s ThemeToggle wrapper — `radius:0` has been the global default (`globals.css`) since S38, so `ThemeToggle`'s own `rounded-*` classes already render square. Verified: `tsc` clean, dev-server curl confirms `/design/chipmango` 200s with real `srcSet`/`data-nimg="fill"` output and a working `/_next/image` optimizer response. Committed as `f9c9c65`.
- **[closed S40, 2026-10-20]** Deleted the merged local branch `proto/single-bar-shell` (was `dc1292a`, fully merged into `main`).
- **[closed S40, 2026-10-20]** Site-wide terminology pass — canonical word for the merged grid (case studies + lab items) is **"work"** across nav, toggle, and back-links. Fixed `NavMenu.tsx`'s nav label ("design" → "work", the one surface still out of sync with `ViewSwitcher` + both detail back-links). Updated stale comments calling it "the design triad" / "case-studies home" / "my lab index" in `ViewSwitcher.tsx`, `sitemap.ts`, and `(site)/layout.tsx`.
  **Route namespaces also unified** (reconsidered mid-session — the uniformity case won out over the redirect/OG-move cost, which turned out small: only 2 lab items, no slug collisions with the 5 work items): `/lab/[slug]` deleted; `/design/[slug]/page.tsx` now dispatches to `ProjectsSection` (work) or `LabDetail` (lab) by slug, still two different templates, one route. Added 308 redirects `/lab/aronia` → `/design/aronia` and `/lab/kickoff` → `/design/kickoff` in `next.config.ts` so any already-shared/indexed old links still resolve. Moved `public/og/lab/{aronia,kickoff}.png` → `public/og/{aronia,kickoff}.png`, repointed `generate-lab-og.mjs`'s output dir. Verified: `tsc` clean, dev-server curl checks confirm `/design/{aronia,kickoff}` 200 (lab content renders — TL;DR block present), `/lab/{aronia,kickoff}` 308 → the new routes, `/lab/nonexistent-slug` 404s correctly, sitemap lists all 7 details under `/design/<slug>` with no stray `/lab` entries.
  **Bug found + fixed in the same pass:** `sitemap.ts` listed `/lab` as its own indexable URL, but it 308-redirects to `/` — removed that entry (all per-item detail routes are now under `/design/<slug>` anyway).
  Committed + pushed as `a65ef0b` (`main` == `origin/main`).
- **[closed S39, 2026-09-29]** Deleted the dead `/lab` index page (`src/app/(site)/lab/page.tsx`) + its sole consumer `src/components/LabSection.tsx` — unreachable since the `/lab`→`/` redirect (S38 IA merge). `tsc` clean; `/lab/[slug]` details untouched.
- **[closed S39, 2026-09-29]** Pruned the stale "placeholder cull" clause from the `globals.css` caption comment (`redesigning-checkout.mdx` is already gone).
- **[verified closed S39, 2026-09-29]** Merge `proto/single-bar-shell` → `main` **and push** — `main` == `origin/main` == `dc1292a`. (Was S39 "Next up" #1.)
- **[verified closed pre-S39]** `MobileTopBar` deletion — file already removed; only prose references remain.
- **[verified closed pre-S39]** `TEMP_IDEAS` placeholder product-ideas set — no longer in the codebase.
- **[verified closed pre-S39]** Throwaway placeholder content cull (e.g. `redesigning-checkout.mdx`) — done; only the stale `globals.css` comment above lingers.
