# Portfolio — chukwuka's matrix

Personal portfolio site for [Chukwuka Osakwe](https://farcaster.xyz/chukwukaosakwe). 
Systems-oriented designer building thoughtful interfaces for complex products.

Built with **Next.js 16**, **React 19**, **TypeScript**, **Tailwind v4**. Case studies authored as MDX, rendered server-side via `next-mdx-remote/rsc`.

## Docs

Local-only, gitignored — `/docs`:

- `docs/DESIGN.md` — design decisions, conventions, architecture rationale
- `docs/SESSION_NOTES.md` — session-by-session work log
- `docs/OPEN_THREADS.md` — cross-session backlog

## Image pipeline

Masters live (gitignored) in `/sources/`; web derivatives in `/public/work/<slug>/`. Regenerate with `sharp` — see `docs/DESIGN.md` → "Image workflow."
