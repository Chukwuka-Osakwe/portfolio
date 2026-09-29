# Open Threads

The living backlog of everything left unfinished, across sessions. Read this alongside `SESSION_NOTES.md` at session start; keep it current as threads open and close.

**Convention:** one checkbox per thread. When you close one, move it to "Recently closed" (with the session + date) rather than deleting it — that stops future sessions re-investigating settled ground. Group by kind, most actionable first.

_Last reconciled against code: 2026-09-29 (start of S39)._

---

## 🟡 S39 backlog (carried from S38 "Next up")

- [ ] **Delete redundant wireframe sandboxes** — `/wireframe/merged-grid` and `/wireframe/gallery`, both superseded by the live `DesignGrid` and `/design/chipmango`. Kept in S38 as reference sandboxes; cull when no longer needed.
- [ ] **Generalize the ChipMango gallery route** into a `layout: gallery` frontmatter switch on `/design/[slug]` + a real "brand" content section. ChipMango is hardcoded in `src/app/(site)/page.tsx` today (see the TODO at ~`page.tsx:41`). _Deferred until a 2nd gallery entry appears._
- [ ] **Gallery polish** — swap the gallery's raw `<img>` frames for `next/image`; drop the now-redundant `[&_*]:!rounded-none` on SiteTopBar's ThemeToggle wrapper (radius:0 is global since S38).

## 🟢 Housekeeping

- [ ] **Delete merged branch** `proto/single-bar-shell` — fully merged into `main` (both at `dc1292a`), safe to remove.

## 🧭 Terminology / IA

- [ ] **Site-wide terminology pass.** Post-grid, the lab/case-study split is dissolving but the words still vary across surfaces ("my lab", "case studies", "design", "work"). Detail back-links were unified to "← work" (S39), but nav labels, copy, route names (`/design/*` vs `/lab/*`), and section headings should get one coherent vocabulary. Decide the canonical terms, then sweep.

## 📝 Content

- [ ] **Confirm `yara.mdx` date.** Frontmatter is `date: "2026-03-01"` with a `# TODO: confirm real date` (Farcaster mini-app; sits between Footy 2025-10 and Bribe 2026-05). Verify the real date and drop the TODO.

---

## ✅ Recently closed

- **[closed S39, 2026-09-29]** Deleted the dead `/lab` index page (`src/app/(site)/lab/page.tsx`) + its sole consumer `src/components/LabSection.tsx` — unreachable since the `/lab`→`/` redirect (S38 IA merge). `tsc` clean; `/lab/[slug]` details untouched.
- **[closed S39, 2026-09-29]** Pruned the stale "placeholder cull" clause from the `globals.css` caption comment (`redesigning-checkout.mdx` is already gone).
- **[verified closed S39, 2026-09-29]** Merge `proto/single-bar-shell` → `main` **and push** — `main` == `origin/main` == `dc1292a`. (Was S39 "Next up" #1.)
- **[verified closed pre-S39]** `MobileTopBar` deletion — file already removed; only prose references remain.
- **[verified closed pre-S39]** `TEMP_IDEAS` placeholder product-ideas set — no longer in the codebase.
- **[verified closed pre-S39]** Throwaway placeholder content cull (e.g. `redesigning-checkout.mdx`) — done; only the stale `globals.css` comment above lingers.
