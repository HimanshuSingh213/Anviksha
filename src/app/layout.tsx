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
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://anviksha-result.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: "GGSIPU Results 2026, SGPA/CGPA Calculator & Transcript Portal | Anviksha",
    template: "%s | Anviksha - GGSIPU Results",
  },
  description:
    "Check GGSIPU results 2026 instantly. Free SGPA & CGPA calculator using Ordinance 11, 50% annual credit promotion checker, campus placement cutoff benchmarks, odd/even reappear exam planner, and official consolidated transcript PDF download for all IPU students. Built by Himanshu Singh.",
  applicationName: "Anviksha",
  authors: [{ name: "Himanshu Singh", url: "https://github.com/HimanshuSingh213" }],
  creator: "Himanshu Singh",
  publisher: "Himanshu Singh",
  generator: "Next.js",
  category: "education",
  classification: "Educational Technology & Academic Analytics",
  alternates: {
    canonical: appUrl,
  },
  keywords: [
    "ggsipu",
    "ggsipu result",
    "ggsipu results",
    "ggsipu results 2026",
    "ggsipu result 2026",
    "ipu result",
    "ipu results",
    "ipu result 2026",
    "ggsipu exam results",
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
  ],
  icons: {
    icon: "/favicon.png",
    apple: "/favicon.png",
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: appUrl,
    siteName: "Anviksha - GGSIPU Results Portal",
    title: "GGSIPU Results 2026, SGPA/CGPA Calculator & Transcript Portal | Anviksha",
    description:
      "Check GGSIPU results instantly. Free SGPA & CGPA calculator, Ordinance 11 promotion checker, placement cutoff benchmarks, reappear exam planner, and official transcript PDF download for IPU students. By Himanshu Singh.",
  },
  twitter: {
    card: "summary",
    title: "GGSIPU Results 2026, SGPA/CGPA Calculator & Transcript | Anviksha",
    description:
      "Check GGSIPU results instantly. Free SGPA & CGPA calculator, Ordinance 11 promotion checker, placement cutoff benchmarks, and transcript PDF for IPU students. By Himanshu Singh.",
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
