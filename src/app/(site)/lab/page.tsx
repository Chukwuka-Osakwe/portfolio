import type { Metadata } from "next";
import { LabSection } from "@/components/LabSection";

const TITLE = "My lab";
const DESCRIPTION =
  "The little projects Chukwuka Osakwe builds in his spare time — self-directed experiments, shipped as short trailers.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: { title: TITLE, description: DESCRIPTION, url: "/lab" },
  twitter: { title: TITLE, description: DESCRIPTION },
  alternates: { canonical: "/lab" },
};

/** "My lab" index — the grid of self-directed lab projects (the leading-left
 *  tab of the design triad is now case studies at `/`; the lab sits here).
 *  Each card links to `/lab/<slug>`, the cinematic detail page. */
export default function LabIndexPage() {
  return <LabSection />;
}
