import type { Metadata } from "next";
import { ProductIdeas } from "@/components/ProductIdeas";

export const metadata: Metadata = { title: "Product ideas" };

export default function ProductIdeasPage() {
  return <ProductIdeas />;
}
