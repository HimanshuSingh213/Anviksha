import { Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { Metadata } from "next";
import { ArrowLeft, MessageSquare, ShieldCheck, Home } from "lucide-react";
import ReportForm from "@/components/report/ReportForm";

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://anviksha-result.vercel.app";

export const metadata: Metadata = {
  title: "Report a Problem — Anviksha Support & Feedback",
  description:
    "Report bugs, calculation discrepancies, or syllabus feedback for Anviksha GGSIPU academic results engine.",
  alternates: {
    canonical: `${appUrl}/report`,
  },
  openGraph: {
    title: "Report a Problem — Anviksha Support & Feedback",
    description:
      "Report bugs, calculation discrepancies, or syllabus feedback for Anviksha GGSIPU academic results engine.",
    url: `${appUrl}/report`,
    images: ["/favicon.png"],
  },
  twitter: {
    card: "summary",
    title: "Report a Problem — Anviksha Support & Feedback",
    description:
      "Report bugs, calculation discrepancies, or syllabus feedback for Anviksha GGSIPU academic results engine.",
    images: ["/favicon.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function ReportPage() {
  return (
    <div className="relative flex min-h-screen flex-col bg-background text-foreground">
      {/* Ambient background glows */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -top-32 -left-20 h-96 w-96 rounded-full bg-gold opacity-10 blur-3xl" />
        <div className="absolute top-1/2 -right-20 h-96 w-96 rounded-full bg-cat-blue opacity-10 blur-3xl" />
      </div>

      {/* Header Navbar */}
      <header className="sticky top-0 z-30 border-b border-border-strong bg-surface-deep/85 backdrop-blur-xl">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          <Link href="/" title="Go to Homepage" className="flex items-center gap-2 shrink-0 group">
            <Image
              src="/navbar-logo.png"
              alt="Anviksha"
              width={150}
              height={40}
              className="object-contain h-7.5 w-auto transition-opacity group-hover:opacity-85"
              priority
            />
          </Link>

          <div className="flex items-center gap-2">
            <Link
              href="/dashboard"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-border-strong bg-surface text-xs font-mono font-semibold text-foreground-secondary hover:text-foreground hover:bg-surface-elevated transition-colors cursor-pointer shrink-0"
            >
              <ArrowLeft size={13} />
              <span>Dashboard</span>
            </Link>
            <Link
              href="/"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-border-strong bg-surface text-xs font-mono font-semibold text-foreground-secondary hover:text-gold hover:border-gold-border transition-colors cursor-pointer shrink-0"
            >
              <Home size={13} />
              <span className="hidden sm:inline">Home</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-6">
        
        {/* Page Header */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md border border-gold-border bg-gold-surface text-gold text-xs font-mono font-semibold">
            <MessageSquare size={13} />
            <span>Support & Issue Tracker</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Report a Problem
          </h1>

          <p className="text-sm sm:text-base text-foreground-secondary leading-relaxed max-w-2xl">
            Help us improve Anviksha. Found an incorrect grade, calculation discrepancy, or interface issue? Tell us what happened and what you expected.
          </p>
        </div>

        {/* Privacy Callout */}
        <div className="flex items-start gap-3 p-3.5 sm:p-4 rounded-lg bg-surface border border-border-strong text-xs font-mono text-foreground-secondary">
          <ShieldCheck size={16} className="text-accent-mint shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-bold text-foreground">Privacy Protection:</span>{" "}
            Basic context (route & programme) is prefilled to save you time. Passwords, enrollment numbers, OTPs, and authentication tokens are never captured.
          </div>
        </div>

        {/* Embedded Google Form with Prefilled Context */}
        <Suspense
          fallback={
            <div className="rounded-xl border border-border-strong bg-surface p-12 text-center text-xs font-mono text-foreground-muted">
              Loading report form…
            </div>
          }
        >
          <ReportForm />
        </Suspense>
      </main>

      {/* Page Footer */}
      <footer className="relative z-10 border-t border-border py-6 text-center text-xs text-foreground-muted">
        <div className="max-w-5xl mx-auto px-4 flex flex-wrap items-center justify-center gap-3 font-mono">
          <span>Anviksha · Unofficial GGSIPU Results Portal</span>
          <span className="text-border-strong">·</span>
          <Link href="/calculations" className="hover:text-gold transition-colors">
            How Calculations Work
          </Link>
          <span className="text-border-strong">·</span>
          <Link href="/" className="hover:text-gold transition-colors">
            Home
          </Link>
        </div>
      </footer>
    </div>
  );
}
