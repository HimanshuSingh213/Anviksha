import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Bell, RefreshCw } from "lucide-react";
import { fetchGGSIPUNotices } from "@/helpers/notices";
import NoticesClientView from "@/components/notices/NoticesClientView";

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://anviksha-result.vercel.app";

export const metadata: Metadata = {
  title: "GGSIPU Notices — Live Result Circulars, Date-Sheets & Exam Schedules",
  description:
    "Live official GGSIPU examination notices: declared result circulars, end-term date-sheets, re-appear schedules, and answer-sheet inspection notices, updated every 15 minutes with direct PDF downloads.",
  alternates: {
    canonical: `${appUrl}/notices`,
  },
  openGraph: {
    title: "GGSIPU Notices — Live Result Circulars, Date-Sheets & Exam Schedules",
    description:
      "Live official GGSIPU examination notices: declared result circulars, end-term date-sheets, re-appear schedules, and answer-sheet inspection notices, updated every 15 minutes with direct PDF downloads.",
    url: `${appUrl}/notices`,
    type: "website",
    siteName: "Anviksha",
    images: [{ url: "/favicon.png", width: 512, height: 512, alt: "Anviksha GGSIPU Notices Feed" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "GGSIPU Notices — Live Result Circulars, Date-Sheets & Exam Schedules",
    description:
      "Live official GGSIPU examination notices: declared result circulars, end-term date-sheets, re-appear schedules, and answer-sheet inspection notices.",
    images: ["/favicon.png"],
  },
};

export const revalidate = 900; // 15-minute ISR cache

export default async function NoticesPage() {
  const notices = await fetchGGSIPUNotices();

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        "@id": `${appUrl}/notices#collection`,
        "name": "Live GGSIPU Result Circulars, Date-Sheets & Notices",
        "url": `${appUrl}/notices`,
        "description":
          "Official GGSIPU examination notices, declared results circulars, date-sheets, and evaluated answer sheet schedules with direct PDF links.",
        "inLanguage": "en",
        "publisher": {
          "@type": "Organization",
          "name": "Anviksha",
          "url": appUrl,
        },
      },
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": appUrl,
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "Exam Circulars",
            "item": `${appUrl}/notices`,
          },
        ],
      },
    ],
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-border-strong bg-surface-deep/90 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-foreground-secondary hover:text-foreground transition-colors group"
          >
            <Image
              src="/icon-192.png"
              alt="Anviksha"
              width={24}
              height={24}
              className="rounded object-contain opacity-90 group-hover:opacity-100 transition-opacity"
            />
            <span className="font-mono text-sm font-bold tracking-wider text-foreground">
              ANVIKSHA
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/calculations"
              className="text-xs font-mono text-foreground-muted hover:text-gold transition-colors hidden sm:inline"
            >
              Calculations Guide
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-white text-black text-xs font-mono font-bold hover:bg-neutral-200 transition-colors uppercase tracking-wider shadow-xs"
            >
              <span>Student Login</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main id="main-content" className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10 space-y-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-gold-surface border border-gold-border text-gold font-mono text-[11px]">
            <Bell size={12} className="animate-pulse shrink-0" />
            <span>Official University Feed</span>
          </div>

          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground font-mono">
            Examination Circulars & Result Notices
          </h1>

          <p className="text-xs sm:text-sm text-foreground-secondary max-w-2xl leading-relaxed">
            Real-time feed of official GGSIPU examination circulars, declared result notices, end-term date-sheets, and answer sheet inspection schedules directly from the university portal.
          </p>
        </div>

        {/* Real-time sync & transparency card */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 sm:p-4 rounded-lg bg-surface border border-border-strong text-xs font-mono text-foreground-secondary shadow-xs">
          <div className="flex items-center gap-2.5">
            <RefreshCw size={14} className="text-gold shrink-0 animate-spin" style={{ animationDuration: "6s" }} />
            <span>
              <strong className="text-foreground">Live Synchronization: </strong>Fetched & updated directly from the university portal every <strong>15 minutes</strong> via server ISR caching.
            </span>
          </div>
          <span className="text-[11px] text-foreground-muted shrink-0">
            Source: ipu.ac.in/exam_notices.php
          </span>
        </div>

        {/* Notices Client Component */}
        <NoticesClientView initialNotices={notices} />

        {/* Bottom Navigation */}
        <div className="pt-6 border-t border-border-strong flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-foreground-muted">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 hover:text-foreground transition-colors"
          >
            <ArrowLeft size={13} />
            <span>Back to Home</span>
          </Link>

          <div className="flex items-center gap-3">
            <Link href="/calculations" className="hover:text-gold transition-colors">
              How Calculations Work
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
