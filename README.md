# Portfolio — chukwuka's matrix

Personal portfolio site for [Chukwuka Osakwe](https://farcaster.xyz/chukwukaosakwe). 
Systems-oriented designer building thoughtful interfaces for complex products.

Built with **Next.js 16**, **React 19**, **TypeScript**, **Tailwind v4**. Case studies authored as MDX, rendered server-side via `next-mdx-remote/rsc`.

## Docs

- `DESIGN.md` — design decisions, conventions, architecture rationale
- `SESSION_NOTES.md` — session-by-session work log

## Image pipeline

Masters live (gitignored) in `/sources/`; web derivatives in `/public/work/<slug>/`. Regenerate with `sharp` — see `DESIGN.md` → "Image workflow."
