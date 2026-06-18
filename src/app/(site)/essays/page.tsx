import type { Metadata } from "next";
import { EssaysList } from "@/components/EssaysList";

const TITLE = "Essays";
const DESCRIPTION =
  "Essays by Chukwuka Osakwe — thinking out loud about design, products, and the internet.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: { title: TITLE, description: DESCRIPTION, url: "/essays" },
  twitter: { title: TITLE, description: DESCRIPTION },
  alternates: { canonical: "/essays" },
};

export default function EssaysPage() {
  return <EssaysList />;
}
