import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";
import ErrorBoundary from "@/components/common/ErrorBoundary";
import StructuredData from "@/components/common/StructuredData";
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
const currentYear = new Date().getFullYear();
const nextYear = currentYear + 1;

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: `Anviksha — GGSIPU Results, SGPA/CGPA Calculator & Academic Analytics Portal ${currentYear}`,
    template: "%s | Anviksha — GGSIPU Results",
  },
  description:
    "Official GGSIPU exam result portal wrapper. Instant SGPA & CGPA calculator using Ordinance 11, annual credit promotion checker, campus placement cutoffs, reappear session planner, and transcript PDF download for IPU students. Supports B.Tech, BCA, BBA, MBA and all IPU programmes.",
  applicationName: "Anviksha - GGSIPU Results Portal",
  authors: [{ name: "Himanshu Singh", url: "https://github.com/HimanshuSingh213" }],
  creator: "Himanshu Singh",
  publisher: "Himanshu Singh",
  generator: "Next.js",
  category: "education",
  classification: "Educational Technology & Academic Analytics",
  alternates: {
    canonical: appUrl,
    languages: {
      "en-IN": appUrl,
    },
  },
  keywords: [
    "ggsipu",
    "ggsipu result",
    "ggsipu results",
    `ggsipu results ${currentYear}`,
    `ggsipu results ${nextYear}`,
    `ggsipu result ${currentYear}`,
    `ggsipu result ${nextYear}`,
    "ipu result",
    "ipu results",
    `ipu result ${currentYear}`,
    `ipu result ${nextYear}`,
    "ggsipu exam results",
    "ggsipu result portal",
    "ggsipu sgpa calculator",
    "ggsipu cgpa calculator",
    "ipu sgpa calculator",
    "ipu cgpa calculator",
    "ggsipu ordinance 11",
    "ggsipu marksheet download",
    "ggsipu marksheet pdf",
    "ggsipu consolidated transcript",
    "ggsipu 50 percent credit rule",
    "ggsipu year back rule",
    "ggsipu academic promotion",
    "ggsipu reappear exam",
    "ggsipu placement cutoff",
    "ggsipu odd even reappear",
    "anviksha",
    "anviksha result",
    "anviksha ipu",
    "Himanshu Singh",
    "usict result",
    "mait result",
    "msit result",
    "bvcoe result",
    "bpit result",
    "gtbit result",
    "vips result",
    "btech ipu result",
    "bca ipu result",
    "bba ipu result",
    "mba ipu result",
    "ggsipu semester result",
    "ggsipu revaluation result",
    "ggsipu reappear result",
    "ipu university result",
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
    siteName: "Anviksha — GGSIPU Results Portal",
    title: "Anviksha — GGSIPU Results, SGPA/CGPA & Academic Analytics Portal",
    description:
      "Official GGSIPU exam result portal wrapper. Instant SGPA & CGPA calculator using Ordinance 11, annual credit promotion checker, campus placement cutoffs, reappear session planner, and transcript PDF download for IPU students.",
    images: [
      {
        url: "/favicon.png",
        width: 512,
        height: 512,
        alt: "Anviksha - GGSIPU Results Portal Logo",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "Anviksha — GGSIPU Results, SGPA/CGPA & Academic Analytics Portal",
    description:
      "Official GGSIPU exam result portal wrapper. Instant SGPA & CGPA calculator using Ordinance 11, annual credit promotion checker, campus placement cutoffs, and transcript PDF download for IPU students.",
    images: ["/favicon.png"],
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

export const viewport = {
  themeColor: "#060608",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <StructuredData />
        <ErrorBoundary>{children}</ErrorBoundary>
        <Toaster theme="dark" position="bottom-right" richColors />
        <Analytics />
      </body>
    </html>
  );
}
