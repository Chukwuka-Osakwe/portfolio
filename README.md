# Portfolio — chukwuka's matrix

Personal portfolio site for [Chukwuka Osakwe](https://farcaster.xyz/chukwukaosakwe). A systems-oriented designer building thoughtful interfaces for complex products.

Built with **Next.js 16**, **React 19**, **TypeScript**, **Tailwind v4**. Case studies authored as MDX, rendered server-side via `next-mdx-remote/rsc`.

## Local dev

```bash
npm install
npm run dev
```

Open <http://localhost:3000>.

## Routes

- `/` — work (case-study grid; details open in-place via `/#slug`)
- `/product-ideas` — sketched-out product ideas, carousel-style
- `/contact` — say hello

## Docs

- `DESIGN.md` — design decisions, conventions, architecture rationale
- `SESSION_NOTES.md` — session-by-session work log

## Image pipeline

Masters live (gitignored) in `/sources/`; web derivatives in `/public/work/<slug>/`. Regenerate with `sharp` — see `DESIGN.md` → "Image workflow."
