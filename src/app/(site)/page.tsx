import type { Metadata } from "next";
import { ProjectsSection } from "@/components/ProjectsSection";

// Home explicitly carries `alternates.canonical` so deep-link variants like
// `/#footy` don't get treated as alternates. Title/description/OG inherit from
// the root layout defaults — no override here.
export const metadata: Metadata = { alternates: { canonical: "/" } };

/** Home / projects view — the grid of case studies (details open in-place). */
export default function Home() {
  return <ProjectsSection />;
}
