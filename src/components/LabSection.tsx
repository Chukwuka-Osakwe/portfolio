import Image from "next/image";
import Link from "next/link";
import { getAllMeta } from "@/lib/content";
import { LabCardVideo } from "@/components/LabCardVideo";

/**
 * Lab listing — the grid of self-directed ("me-for-me") projects, and the
 * site's default/landing view (mounted at `/`). Each card links to
 * `/lab/<slug>`, the cinematic detail page (see LabDetail).
 *
 * TREATMENT (ref: madhurima.me/work) — video-forward / editorial, NOT the
 * bordered-with-padding case-study card. Lab items are trailers, so each card
 * is a big single-column canvas that *plays its hero clip in place* (looping,
 * muted), with the metadata sitting BELOW the canvas on the page field:
 *
 *   [ large rounded canvas — the looping clip ]
 *   NAME • CATEGORY • YEAR          ← eyebrow (uppercase, tracked, muted)
 *   <the blurb, as a big descriptive title>
 *
 * The eyebrow's NAME is the item `title`; the big line is its `blurb` (the
 * descriptive one-liner). One item per row, generous vertical rhythm — the
 * clips carry the page.
 */
export function LabSection() {
  const items = getAllMeta("lab");
  return (
    <>
      {/* Intro line framing the view — mirrors the ProductIdeas accent/Nico Moji
          header ("these ideas don't exist yet…"). Sets up the lab as the
          self-directed / spare-time work before the trailers. */}
      <p
        className="mb-12 text-center text-balance text-[clamp(1rem,3.5vw,1.25rem)] text-accent"
        style={{ fontFamily: "var(--font-nico-moji)" }}
      >
        what i&apos;m building in my spare time
      </p>

      <ul className="flex flex-col gap-16 sm:gap-20">
      {items.map((p) => {
        // Unquoted `date:` YAML can parse to a Date object, not a string —
        // new Date() handles both; getUTCFullYear avoids a TZ off-by-one.
        const year = new Date(p.date).getUTCFullYear();
        const eyebrow = [p.title, p.type, Number.isNaN(year) ? null : year]
          .filter(Boolean)
          .join(" • ");
        return (
          <li key={p.slug}>
            <Link
              href={`/lab/${p.slug}`}
              className="focus-ring group block rounded-lg"
            >
              {/* Canvas — the clip plays here. `.project-card` gives the same
                  ring + micro-shadow the case-study covers use, so the clip
                  reads as a framed surface on the peach field rather than a raw
                  edge. Subtle scale on hover; the whole card is the link. */}
              <div className="project-card overflow-hidden rounded-lg bg-image-placeholder transition motion-safe:group-hover:scale-[1.01]">
                {p.video ? (
                  <LabCardVideo src={p.video} poster={p.image} title={p.title} />
                ) : p.image ? (
                  <div className="relative aspect-video w-full">
                    <Image
                      src={p.image}
                      alt=""
                      fill
                      sizes="(min-width: 1024px) 49rem, 100vw"
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="aspect-video w-full" aria-hidden />
                )}
              </div>

              <div className="mt-4">
                {eyebrow && (
                  <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                    {eyebrow}
                  </p>
                )}
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-balance transition-colors group-hover:text-accent group-focus-visible:text-accent">
                  {p.blurb ?? p.title}
                </h2>
              </div>
            </Link>
          </li>
        );
      })}
      </ul>
    </>
  );
}
