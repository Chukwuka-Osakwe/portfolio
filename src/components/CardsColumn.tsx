"use client";

import { useView } from "@/components/ViewContext";
import { ProductIdeas } from "@/components/ProductIdeas";
import { Contact } from "@/components/Contact";

/**
 * Swaps the cards-column content based on the active view: the server-rendered
 * projects grid (passed in), the product-ideas carousel, or the contact route.
 */
export function CardsColumn({ projects }: { projects: React.ReactNode }) {
  const { active } = useView();
  if (active === "product-ideas") return <ProductIdeas />;
  if (active === "contact") return <Contact />;
  return <>{projects}</>;
}
