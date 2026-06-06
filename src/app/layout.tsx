import type { Metadata } from "next";
import { Nata_Sans, Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import {
  SITE_URL,
  SITE_NAME,
  SITE_TAGLINE,
  SITE_DESCRIPTION,
} from "@/lib/site";
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
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — ${SITE_TAGLINE}`,
    template: `%s · ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  applicationName: SITE_NAME,
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    locale: "en_US",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: `${SITE_NAME} — ${SITE_TAGLINE}`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
    images: ["/og.png"],
  },
  alternates: { canonical: "/" },
  icons: { icon: "/icon.png" },
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
      suppressHydrationWarning
    >
      <head>
        {/* Pre-paint theme application — runs synchronously before the body
            renders, so the page paints in the user's saved theme immediately
            (no FOUC on reload). Reads localStorage; if the user has picked
            light or dark explicitly, sets html[data-theme]. If absent or set
            to "system", does nothing and the OS preference drives the CSS. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');if(t==='light'||t==='dark'){document.documentElement.dataset.theme=t}}catch(e){}})()`,
          }}
        />
        {/* Pre-paint detail-reload mask. SSR doesn't have access to
            location.hash, so /#slug reloads render the grid by default and
            flash it before JS hydrates and swaps to the detail. This sets
            html[data-detail-pending] when a hash is present so CSS can hide
            the grid through the JS-load window; ProjectsExplorer clears the
            attribute synchronously inside useLayoutEffect after it commits
            the detail (so the grid never actually paints). */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{if(location.hash.length>1)document.documentElement.dataset.detailPending='1'}catch(e){}})()`,
          }}
        />
      </head>
      {/* suppressHydrationWarning on <body> too: browser extensions (Grammarly,
          LanguageTool, etc.) inject attributes on <body> before React hydrates
          (e.g. data-new-gr-c-s-check-loaded, data-gr-ext-installed), tripping
          the attribute-mismatch warning. Scoped to <body>'s own attributes —
          child mismatches still surface. */}
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
