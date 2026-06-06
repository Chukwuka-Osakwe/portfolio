import type { Metadata } from "next";
import { Contact } from "@/components/Contact";

const TITLE = "Contact";
const DESCRIPTION =
  "Get in touch with Chukwuka Osakwe about product design work — sprints, contracts, or just to say hi.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  openGraph: { title: TITLE, description: DESCRIPTION, url: "/contact" },
  twitter: { title: TITLE, description: DESCRIPTION },
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return <Contact />;
}
