import type { ReactNode } from "react";

/**
 * Responsive YouTube embed for essay / case-study bodies. A privacy-friendly
 * (youtube-nocookie), lazily-loaded iframe held in a 16:9 box and bordered to
 * match <Figure> / <CaseVideo>. Always wrapped in a <figure> so the
 * `.case-body figure` rules own its 2rem block spacing (and an optional
 * <figcaption>); the inner box is flush per `.case-body figure > div`.
 *
 * Server component — a plain lazy iframe needs no client JS.
 *
 * e.g. <YouTube id="NV3sBlRgzTI" title="Elon Musk on first-principles thinking" />
 */
type Props = {
  /** YouTube video id — the `v=` param, e.g. "NV3sBlRgzTI". */
  id: string;
  /** Accessible iframe title (describe the video). */
  title?: string;
  /** CSS length cap. Default 100% — fills the reading column (16:9 landscape). */
  width?: string;
  caption?: ReactNode;
};

export default function YouTube({
  id,
  title = "YouTube video",
  width = "100%",
  caption,
}: Props) {
  const player = (
    <div
      className="relative mx-auto block overflow-hidden border border-border"
      style={{ width, maxWidth: "100%", aspectRatio: "16 / 9" }}
    >
      <iframe
        src={`https://www.youtube-nocookie.com/embed/${id}`}
        title={title}
        loading="lazy"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        className="absolute inset-0 h-full w-full"
      />
    </div>
  );

  return (
    <figure>
      {player}
      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  );
}
