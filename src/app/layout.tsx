import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";
import ErrorBoundary from "@/components/common/ErrorBoundary";
import StructuredData from "@/components/common/StructuredData";
import FloatingReportButton from "@/components/common/FloatingReportButton";
import { Analytics } from "@vercel/analytics/next";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://anviksha-result.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: "Anviksha — GGSIPU Results, SGPA/CGPA Calculator & Academic Analytics",
    template: "%s | Anviksha",
  },
  description:
    "GGSIPU results, SGPA/CGPA calculations, promotion standing, and academic analytics for IPU students. Check semester marks and generate consolidated transcripts.",
  applicationName: "Anviksha",
  authors: [{ name: "Himanshu Singh" }],
  creator: "Himanshu Singh",
  publisher: "Himanshu Singh",
  category: "education",
  classification: "Educational Technology & Academic Analytics",
  alternates: {
    canonical: appUrl,
    languages: {
      "en-IN": appUrl,
    },
  },
  keywords: [
    "ggsipu result",
    "ggsipu results",
    "ipu result",
    "ipu results",
    "ggsipu sgpa calculator",
    "ggsipu cgpa calculator",
    "ggsipu ordinance 11",
    "ggsipu exam notices",
    "ggsipu datesheet",
    "ggsipu result circulars",
    "ggsipu btech results",
    "ggsipu bca results",
    "ggsipu bba results",
    "ggsipu mba results",
    "ggsipu law results",
    "ggsipu marksheet",
    "ggsipu transcript",
    "anviksha",
  ],
  icons: {
    icon: [
      { url: "/favicon-48x48.png", sizes: "48x48", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/favicon.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: "/favicon-48x48.png",
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: appUrl,
    siteName: "Anviksha",
    title: "Anviksha — GGSIPU Results, SGPA/CGPA Calculator & Academic Analytics",
    description:
      "GGSIPU results, SGPA/CGPA calculations, promotion standing, and academic analytics for IPU students. Check semester marks and generate consolidated transcripts.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        type: "image/png",
        alt: "Anviksha — GGSIPU Results & Academic Analytics",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Anviksha — GGSIPU Results, SGPA/CGPA Calculator & Academic Analytics",
    description:
      "GGSIPU results, SGPA/CGPA calculations, promotion standing, and academic analytics for IPU students. Check semester marks and generate consolidated transcripts.",
    images: ["/og-image.png"],
    creator: "@HimanshuSingh",
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  other: {
    "geo.region": "IN-DL",
    "geo.placename": "New Delhi, India",
    "geo.position": "28.5957;77.0199",
    ICBM: "28.5957, 77.0199",
    "theme-color": "#060608",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
    "apple-mobile-web-app-title": "Anviksha",
  },
};

export const viewport: Viewport = {
  themeColor: "#060608",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en-IN"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <link rel="preconnect" href="https://examweb.ggsipu.ac.in" crossOrigin="" />
      </head>
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        {/* Keyboard users can jump straight past the navigation */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:top-2 focus:left-2 focus:rounded-md focus:bg-white focus:px-4 focus:py-2 focus:text-xs focus:font-mono focus:font-bold focus:text-black"
        >
          Skip to main content
        </a>
        <StructuredData />
        <ErrorBoundary>{children}</ErrorBoundary>
        <FloatingReportButton />
        <Toaster theme="dark" position="bottom-right" richColors />
        <Analytics />
      </body>
    </html>
  );
}
