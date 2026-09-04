import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { cookies } from "next/headers";
import LandingPageView from "@/components/home/LandingPageView";

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://anviksha-result.vercel.app";

export const metadata: Metadata = {
  title: "Anviksha — GGSIPU Results, SGPA/CGPA Calculator & Academic Analytics",
  description:
    "Check your GGSIPU result instantly and get SGPA/CGPA calculated under Ordinance 11, promotion standing, placement eligibility, and a consolidated transcript. Official ExamWeb data, nothing stored.",
  alternates: {
    canonical: appUrl,
  },
  openGraph: {
    title: "Anviksha — GGSIPU Results, SGPA/CGPA Calculator & Academic Analytics",
    description:
      "Your GGSIPU result, actually explained. SGPA/CGPA under Ordinance 11, promotion standing, placement eligibility, and consolidated transcripts — instantly after login.",
    url: appUrl,
    type: "website",
    siteName: "Anviksha",
    locale: "en_IN",
    images: [{ url: "/favicon.png", width: 512, height: 512, alt: "Anviksha — GGSIPU Results & Academic Analytics" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Anviksha — GGSIPU Results, SGPA/CGPA Calculator & Academic Analytics",
    description:
      "Your GGSIPU result, actually explained. SGPA/CGPA under Ordinance 11, promotion standing, placement eligibility, and consolidated transcripts — instantly after login.",
    images: ["/favicon.png"],
  },
};

const FAQS = [
  {
    q: "How can I check my GGSIPU Semester Results on Anviksha?",
    a: "Simply enter your GGSIPU student enrollment number and password. Anviksha securely connects to the official university exam servers via direct proxy to fetch your complete semester marks, grade points, and academic standing instantly.",
  },
  {
    q: "Does Anviksha work for all GGSIPU programmes and streams?",
    a: "Anviksha shows your result for any programme declared on GGSIPU's ExamWeb server — every affiliated institute is supported. Deep academic analytics (SGPA/CGPA, promotion standing, divisions) are computed under each programme's own ordinance: Ordinance 11 for B.Tech, BCA, BBA, MBA, BA LLB, BBA LLB and other semester degrees, with separate verified frameworks for MBBS, BPT, BHMS, BAMS and BASLP. Where a rule isn't verified yet, we show the raw marks and say so instead of guessing.",
  },
  {
    q: "How is SGPA and CGPA calculated in GGSIPU under Ordinance 11?",
    a: "Under GGSIPU Ordinance 11 (Clause 13), SGPA is calculated as the credit-weighted average: the sum of (Subject Credits × Grade Points) divided by total semester credits. CGPA is the cumulative credit-weighted average across all completed semesters. Equivalent percentage is computed as CGPA × 10.",
  },
  {
    q: "What is the GGSIPU 50% Credit Rule for Academic Promotion?",
    a: "Under GGSIPU academic regulations, a student must clear at least 50% of the total credits offered across both semesters of an academic year (e.g. Sem 1 + Sem 2) to be eligible for promotion to the next academic year without facing year-back detention.",
  },
  {
    q: "How does the Live GGSIPU Exam Circulars and Date-Sheets feed work?",
    a: "The Notices feed on Anviksha is synchronized directly with the official university portal (ipu.ac.in/exam_notices.php) every 15 minutes using server ISR caching. Students can search circulars by keyword, filter by category (Results, Date Sheets, Inspection), and download official PDFs directly.",
  },
  {
    q: "Is my student data and login password safe on Anviksha?",
    a: "Yes, 100%. Anviksha operates on a zero-database architecture. Your credentials and marks are proxied directly to the university's official server during your active session and are never saved or recorded on any server.",
  },
];

export default async function Home() {
  const cookieStore = await cookies();
  const isAuthenticated = Boolean(cookieStore.get("auth_session")?.value);

  const cta = isAuthenticated
    ? { label: "Go to Dashboard", href: "/dashboard" }
    : { label: "View My Result", href: "/login" };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": FAQS.map((faq) => ({
      "@type": "Question",
      "name": faq.q,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.a,
      },
    })),
  };

  return (
    <div className="relative flex flex-1 flex-col overflow-hidden bg-background text-foreground">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      {/* Ambient background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle,var(--color-border-strong)_1.5px,transparent_1.5px)] bg-size-[28px_28px] mask-[radial-gradient(ellipse_80%_60%_at_50%_0%,black_20%,transparent_100%)]" />
        <div className="absolute -top-32 -left-24 h-96 w-96 rounded-full bg-gold opacity-[0.08] blur-3xl" />
        <div className="absolute top-1/4 -right-24 h-96 w-96 rounded-full bg-cat-violet opacity-[0.06] blur-3xl" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center shrink-0" aria-label="Anviksha home">
            <Image
              src="/navbar-logo.png"
              alt="Anviksha"
              width={150}
              height={40}
              className="h-8 w-auto object-contain"
              priority
            />
          </Link>

          <nav aria-label="Main navigation" className="hidden items-center gap-7 font-mono text-xs text-foreground-secondary sm:flex">
            <Link href="/notices" className="transition-colors hover:text-gold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" aria-hidden="true" />
              <span>Circulars</span>
            </Link>
            <Link href="/calculations" className="transition-colors hover:text-foreground">
              Calculations
            </Link>
            <a href="#features" className="transition-colors hover:text-foreground">Features</a>
            <a href="#how-it-works" className="transition-colors hover:text-foreground">How it works</a>
          </nav>

          <Link
            href={isAuthenticated ? "/dashboard" : "/login"}
            className="rounded-md border border-border-strong px-4 py-2 font-mono text-xs font-semibold text-foreground transition-colors hover:border-gold-border hover:text-gold"
          >
            {isAuthenticated ? "Dashboard" : "Sign in"}
          </Link>
        </div>
      </header>

      {/* Animated Homepage Sections (Framer Motion) */}
      <main id="main-content" className="relative flex-1">
        <LandingPageView isAuthenticated={isAuthenticated} cta={cta} />
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border bg-surface/30">
        <div className="mx-auto max-w-6xl px-6 py-10 space-y-6">
          <div className="flex flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left">
            <div className="flex items-center gap-2">
              <Image
                src="/navbar-logo.png"
                alt="Anviksha"
                width={130}
                height={35}
                className="h-7 w-auto object-contain opacity-90"
              />
              <span className="text-xs font-mono text-foreground-muted">
                · Academic Analytics &amp; Results Portal
              </span>
            </div>

            <nav aria-label="Footer Navigation" className="flex flex-wrap items-center justify-center gap-4 font-mono text-xs text-foreground-secondary">
              <Link
                href="/notices"
                className="transition-colors hover:text-gold"
              >
                Live Circulars
              </Link>
              <span className="text-border-strong" aria-hidden="true">·</span>
              <Link
                href="/calculations"
                className="transition-colors hover:text-gold"
              >
                Calculations Guide
              </Link>
              <span className="text-border-strong" aria-hidden="true">·</span>
              <Link
                href="/report"
                className="transition-colors hover:text-gold"
              >
                Report an Issue
              </Link>
            </nav>
          </div>

          <p className="text-center text-[11px] leading-relaxed text-foreground-secondary/80 sm:text-left max-w-4xl">
            Anviksha is a privacy-first academic results and analytics portal for students of Guru Gobind Singh Indraprastha University (GGSIPU), covering every affiliated institute — USICT, MAIT, MSIT, BVCOE, BPIT, GTBIT, VIPS, ADGITM, JIMS, DTC, GNDIT, and the rest across Delhi NCR. Analytics are computed under each programme&apos;s own ordinance: Ordinance 11 for semester degrees, with separate frameworks for MBBS, BPT, BHMS, BAMS, and BASLP.
          </p>

          {/* Bottom Bar — Built by Himanshu Singh */}
          <div className="pt-4 border-t border-border-strong/60 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono text-foreground-muted">
            <span>© {new Date().getFullYear()} Anviksha · Unofficial student portal</span>
            <a
              href="https://himanshusinghdangi.vercel.app"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-foreground-secondary hover:text-gold transition-colors font-medium hover:underline"
            >
              <span>Built by Himanshu Singh</span>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
