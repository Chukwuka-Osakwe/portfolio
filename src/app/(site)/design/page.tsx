import type { Metadata } from "next";
import { ProjectsSection } from "@/components/ProjectsSection";

const TITLE = "Case studies";
const DESCRIPTION =
  "Selected product design case studies by Chukwuka Osakwe — the decisions behind interfaces for complex products, end to end.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: { title: TITLE, description: DESCRIPTION, url: "/design" },
  twitter: { title: TITLE, description: DESCRIPTION },
  alternates: { canonical: "/design" },
};

/** Case-studies index — the grid of `work` case studies (the middle tab of
 *  the design triad: my lab · case studies · product ideas). Renders the same
 *  `ProjectsSection` as the per-case-study route but with no `initialSlug`, so
 *  it shows the grid. Cards link to `/design/<slug>` for the detail. */
export default function DesignIndexPage() {
  return <ProjectsSection />;
}
