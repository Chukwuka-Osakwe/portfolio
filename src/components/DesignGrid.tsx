import Image from "next/image";
import Link from "next/link";
import { CardVideo } from "@/components/CardVideo";

/** One card in the merged design grid — a work or lab entry, flattened for
 *  the listing (detail lives at `href`). */
export interface GridEntry {
  slug: string;
  /** Real detail route — /design/<slug> (work) or /lab/<slug> (lab). */
  href: string;
  title: string;
  blurb: string | null;
  image: string | null;
  video: string | null;
  /** CSS aspect-ratio override (frontmatter `ratio`); null → uniform default. */
  ratio: string | null;
  /** Sidecar LQIP for next/image blur placeholder, when registered. */
  blurDataURL?: string;
}

// Uniform cover frame when an entry doesn't declare its own `ratio`. Landscape
// so the covers sit as tidy rows; ratio overrides (e.g. aronia/kickoff at 16/9)
// break the rhythm on purpose.
const DEFAULT_RATIO = "4 / 3";

/**
 * The merged "design" grid — client work + lab intermixed into ONE date-desc
 * stream (the S31 thesis: the paid/self-directed split is authorship trivia the
 * visitor doesn't need). Full-bleed lattice: a two-up grid at lg, single column
 * below, with 1px rules between rows and a centred vertical divider drawn by
 * per-cell borders (pure CSS — no JS column measurement, so no hydration flash).
 *
 * Cards are next/link, so clicking navigates to the real detail route with
 * client-side nav — the shared SiteTopBar stays mounted and the detail plays its
 * view-enter fade, preserving the smooth in-place feel.
 */
export function DesignGrid({ entries }: { entries: GridEntry[] }) {
  // Trailing filler cell so an odd count doesn't leave the last row's right
  // slot borderless at lg (keeps the bottom rule unbroken). Hidden < lg.
  const odd = entries.length % 2 === 1;

  return (
    <div>
      {/* Hero — the identity blurb, restored to the landing now the desktop
          panel is gone (the wordmark lives in the bar; this is copy only). */}
      <section className="mx-auto mb-12 max-w-[42rem] px-6 text-center">
        <h1 className="text-[clamp(1rem,2vw,1.25rem)] font-medium leading-relaxed text-pretty">
          hello, i&apos;m chukwuka and i like to design (and make) cool stuff.
        </h1>
      </section>

      {/* Full-bleed break-out: the grid is meant to span the whole viewport,
          but the (site) shell caps content at --content-w (49rem). This wrapper
          escapes that cap — a 100vw box centred on the (symmetric) layout, so
          the lattice rules run edge to edge and the divider sits at true screen
          centre, exactly like the wireframe (which lived outside the shell).
          Relies on body { overflow-x: clip } to swallow the 100vw scrollbar
          gutter without a horizontal scroll (clip keeps the sticky bar working).
          The hero above stays inside the cap — narrow + centred is right for it. */}
      <div className="relative left-1/2 w-screen -translate-x-1/2">
        {/* Lattice. border-t on the container is the top rule; each cell's
            border-b draws the row rules (last cell's = the closing rule); left-
            column cells (odd nth-child at lg) get border-r for the centred
            divider. Below lg it's a single column, so only the horizontal rules
            show. */}
        <div className="grid grid-cols-1 border-t border-border lg:grid-cols-2">
        {entries.map((entry, i) => (
          <div
            key={entry.slug}
            className="flex justify-center border-b border-border lg:[&:nth-child(odd)]:border-r"
            style={{ padding: "clamp(1.5rem, 4vw, 4.5rem)" }}
          >
            <div className="w-full" style={{ maxWidth: "48rem" }}>
              <Card entry={entry} />
            </div>
          </div>
        ))}
          {odd && (
            <div aria-hidden className="hidden border-b border-border lg:block" />
          )}
        </div>
      </div>
    </div>
  );
}

/** Contained card — cover frame (native `ratio` or the uniform default) over a
 *  centred title + blurb. No ring/radius: the lattice lines are the structure. */
function Card({ entry }: { entry: GridEntry }) {
  return (
    <Link
      href={entry.href}
      className="focus-ring group flex w-full flex-col text-center"
    >
      <div
        className="relative w-full overflow-hidden bg-image-placeholder"
        style={{ aspectRatio: entry.ratio ?? DEFAULT_RATIO }}
      >
        <Media entry={entry} />
      </div>
      <div className="mt-4">
        <h2 className="text-2xl font-semibold tracking-tight text-balance transition-colors group-hover:text-accent group-focus-visible:text-accent">
          {entry.title}
        </h2>
        {entry.blurb && (
          <p className="mx-auto mt-2 line-clamp-3 max-w-[28rem] text-text-muted">
            {entry.blurb}
          </p>
        )}
      </div>
    </Link>
  );
}

/** Cover fill — looping muted clip (poster = static cover) when present, else
 *  the static cover via next/image (with its LQIP blur when registered). */
function Media({ entry }: { entry: GridEntry }) {
  if (entry.video) {
    return (
      <CardVideo
        src={entry.video}
        poster={entry.image ?? undefined}
        title={entry.title}
        className="h-full w-full object-cover"
      />
    );
  }
  if (entry.image) {
    return (
      <Image
        src={entry.image}
        alt=""
        fill
        sizes="(min-width: 1024px) 48rem, 100vw"
        className="object-cover"
        {...(entry.blurDataURL && {
          placeholder: "blur" as const,
          blurDataURL: entry.blurDataURL,
        })}
      />
    );
  }
  return null;
}
