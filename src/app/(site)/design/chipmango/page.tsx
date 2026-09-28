import type { Metadata } from "next";
import { Gallery } from "./Gallery";

const TITLE = "ChipMango — brand identity";
const DESCRIPTION =
  "A self-initiated brand identity for ChipMango, a Nigerian microchip-design startup: logo and motif, colour and type system, and web direction — briefed and built end-to-end.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: "/design/chipmango",
    images: ["/design/chipmango/hero.webp"],
  },
  twitter: { title: TITLE, description: DESCRIPTION, images: ["/design/chipmango/hero.webp"] },
  alternates: { canonical: "/design/chipmango" },
};

/** ChipMango — a brand/gallery entry in the design grid. A dedicated route (not
 *  the [slug] MDX case-study route) because it renders the gallery/lookbook
 *  layout, not an article. A static folder route takes precedence over the
 *  sibling [slug] segment, so there's no collision. */
export default function ChipMangoPage() {
  return <Gallery />;
}
