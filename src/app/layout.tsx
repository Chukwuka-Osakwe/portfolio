import type { Metadata } from "next";
import { Nata_Sans, Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

const nataSans = Nata_Sans({
  variable: "--font-nata-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const nicoMoji = localFont({
  src: "./fonts/NicoMoji-Regular.ttf",
  variable: "--font-nico-moji",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Portfolio",
    template: "%s · Portfolio",
  },
  description:
    "Selected work and writing on design, craft, and problem-solving.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${nataSans.variable} ${geistMono.variable} ${nicoMoji.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
