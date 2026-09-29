import Image from "next/image";
import { DetailHeroVideo } from "@/components/DetailHeroVideo";

/**
 * Shared detail-page hero — the unified arrival beat for both lab items and
 * case studies (post-grid the two are the same kind of thing). Renders the
 * entry's `video` as a looping cinematic clip when present, else its cover
 * `image` as a still, framed identically. Spans the full --content-w column
 * (no reading-measure cap) so it reads wider than the prose beneath, and
 * carries the `.detail-hero` load-in reveal (rise + scale + fade) layered on
 * top of the parent `.view-enter` page fade.
 *
 * Renders nothing when the entry has neither video nor image.
 */
export function DetailHero({
  video,
  image,
  title,
  blurDataURL,
}: {
  video?: string;
  image?: string;
  title: string;
  blurDataURL?: string;
}) {
  if (!video && !image) return null;
  return (
    <div className="detail-hero mt-8">
      {video ? (
        <DetailHeroVideo src={video} poster={image} title={title} />
      ) : (
        <div className="overflow-hidden rounded-lg border border-border bg-image-placeholder shadow-sm">
          {/* 8:5 — the house cover ratio (matches the grid card's cover slot),
              so the still reads as a wider echo of the card. */}
          <div className="relative aspect-[8/5] w-full">
            <Image
              src={image!}
              alt={title}
              fill
              sizes="(max-width: 49rem) 100vw, 49rem"
              className="object-cover"
              {...(blurDataURL
                ? { placeholder: "blur" as const, blurDataURL }
                : {})}
            />
          </div>
        </div>
      )}
    </div>
  );
}
