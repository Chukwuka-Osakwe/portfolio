import type { Metadata } from "next";
import { ProjectsSection } from "@/components/ProjectsSection";
import { HashRedirect } from "@/components/HashRedirect";

// Title/description/OG inherit from the root layout defaults.
export const metadata: Metadata = { alternates: { canonical: "/" } };

/** Home / projects view — the grid of case studies.
 *  Each card links to `/design/<slug>` (a real, per-case-study route with its
 *  own OG metadata). Old `/#slug` URLs get a one-shot client-side redirect
 *  via <HashRedirect> below — purely a migration safety net for any
 *  previously-shared hash links. */
export default function Home() {
  return (
    <>
      <HashRedirect />
      <ProjectsSection />
    </>
  );
}
