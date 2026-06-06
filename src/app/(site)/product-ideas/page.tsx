import type { Metadata } from "next";
import { ProductIdeas } from "@/components/ProductIdeas";

const TITLE = "Product ideas";
const DESCRIPTION =
  "A growing catalogue of product ideas Chukwuka Osakwe is sketching out — design explorations, internet-native concepts, and things that don't exist yet but probably should.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: { title: TITLE, description: DESCRIPTION, url: "/product-ideas" },
  twitter: { title: TITLE, description: DESCRIPTION },
  alternates: { canonical: "/product-ideas" },
};

export default function ProductIdeasPage() {
  return <ProductIdeas />;
}
