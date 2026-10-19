import { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Bell } from "lucide-react";
import { fetchGGSIPUNotices } from "@/helpers/notices";
import Chip from "@/components/analytics/Chip";
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

      <main id="main-content" className="mx-auto w-full max-w-5xl space-y-6 px-4 py-10 sm:px-6 lg:py-12">

        {/* Title */}
        <header>
          <Chip tone="gold">
            <Bell size={12} aria-hidden="true" />
            Official University Feed
          </Chip>

          <h1 className="mt-4 text-2xl font-semibold tracking-[-0.02em] sm:text-3xl">
            Examination Circulars & Result Notices
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-foreground-secondary">
            Real-time feed of official GGSIPU examination circulars, declared result notices, end-term date-sheets, and answer sheet inspection schedules directly from the university portal.
          </p>
        </header>

        {/* Real-time sync & transparency */}
        <div className="home-panel flex flex-col gap-2 px-4 py-3.5 text-xs leading-5 text-foreground-secondary sm:flex-row sm:items-center sm:justify-between sm:gap-6">
          <p className="flex items-start gap-2.5">
            <span className="mt-1.5 size-1.5 shrink-0 animate-pulse rounded-full bg-grade-excellent" aria-hidden="true" />
            <span>
              <strong className="font-semibold text-foreground">Live Synchronization: </strong>Fetched & updated directly from the university portal every <strong className="font-semibold text-foreground">15 minutes</strong> via server ISR caching.
            </span>
          </p>
          <span className="shrink-0 pl-4 font-mono text-foreground-muted sm:pl-0">
            Source: ipu.ac.in/exam_notices.php
          </span>
        </div>

        {/* Notices Client Component */}
        <NoticesClientView initialNotices={notices} />

        {/* Bottom Navigation */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-6 font-mono text-xs text-foreground-muted">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 transition-colors hover:text-foreground"
          >
            <ArrowLeft size={13} aria-hidden="true" />
            <span>Back to Home</span>
          </Link>

          <Link href="/calculations" className="transition-colors hover:text-gold">
            How Calculations Work
          </Link>
        </div>
      </main>
    </div>
  );
}
