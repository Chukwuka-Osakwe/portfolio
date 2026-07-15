import type { Metadata } from "next";
import { LabSection } from "@/components/LabSection";
import { HashRedirect } from "@/components/HashRedirect";

// Title/description/OG inherit from the root layout defaults.
export const metadata: Metadata = { alternates: { canonical: "/" } };

/** Home / "my lab" view — the grid of self-directed lab projects, and the
 *  site's landing surface (the design triad leads with the lab). Each card
 *  links to `/lab/<slug>` (a real, per-item route with its own metadata).
 *
 *  Case studies now live one tab over at `/design`; product ideas at
 *  `/product-ideas`. Old `/#slug` case-study URLs still get a one-shot
 *  client-side redirect to `/design/<slug>` via <HashRedirect> below — a
 *  migration safety net for previously-shared hash links. */
export default function Home() {
  return (
    <>
      <HashRedirect />
      <LabSection />
    </>
  );
}
