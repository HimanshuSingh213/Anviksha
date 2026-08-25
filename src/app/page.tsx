import Link from "next/link";
import Image from "next/image";
import { cookies } from "next/headers";
import {
  ArrowRight,
  ShieldCheck,
  Lock,
  Timer,
  Calculator,
  TrendingUp,
  PieChart,
  Award,
  FileDown,
  Briefcase,
  Calendar,
  Bell,
  RefreshCw,
  ExternalLink,
} from "lucide-react";
import HeroFeatureGrid from "@/components/home/HeroFeatureGrid";

/* ---------------------------------- data ---------------------------------- */

type Accent = "blue" | "violet" | "teal" | "pink" | "gold" | "green";

const ACCENTS: Record<Accent, { icon: string; bg: string; border: string }> = {
  blue: { icon: "text-cat-blue", bg: "bg-cat-blue-surface", border: "group-hover:border-cat-blue-border" },
  violet: { icon: "text-cat-violet", bg: "bg-cat-violet-surface", border: "group-hover:border-cat-violet-border" },
  teal: { icon: "text-cat-teal", bg: "bg-cat-teal-surface", border: "group-hover:border-cat-teal-border" },
  pink: { icon: "text-cat-pink", bg: "bg-cat-pink-surface", border: "group-hover:border-cat-pink-border" },
  gold: { icon: "text-gold", bg: "bg-gold-surface", border: "group-hover:border-gold-border" },
  green: { icon: "text-grade-excellent", bg: "bg-grade-excellent-surface", border: "group-hover:border-grade-excellent-border" },
};

const FEATURES: { icon: typeof Calculator; accent: Accent; title: string; desc: string }[] = [
  { icon: Calculator, accent: "blue", title: "Instant SGPA & CGPA", desc: "Calculated the moment your result loads, exactly per GGSIPU Ordinance 11." },
  { icon: ShieldCheck, accent: "green", title: "50% Promotion Standing", desc: "Monitors annual credit accumulation to prevent year-back detentions under Ordinance 11." },
  { icon: Briefcase, accent: "gold", title: "Placement Gatekeeper", desc: "Evaluates your standing against 60%, 65%, 70%, and 75% corporate recruiter cutoffs." },
  { icon: Calendar, accent: "teal", title: "Odd/Even Reappear Planner", desc: "Intelligently schedules failed papers into Nov/Dec winter and May/June summer exam windows." },
  { icon: FileDown, accent: "violet", title: "Consolidated Master Transcript", desc: "Generate a single-page consolidated academic transcript with QR code verification in one click." },
  { icon: Award, accent: "gold", title: "Division & Distinction", desc: "Auto-classified First Division with Distinction, First Division, or Second Division." },
  { icon: TrendingUp, accent: "blue", title: "Semester Trends", desc: "Track SGPA progression curves and internal vs. external exam distributions." },
  { icon: PieChart, accent: "pink", title: "Grade Breakdown", desc: "Comprehensive O to F grade distributions with highest and lowest scoring highlights." },
];

const STEPS = [
  { n: "01", title: "Sign in", desc: "Enter your enrollment number and password — the same ones you use on the GGSIPU portal." },
  { n: "02", title: "We fetch, not store", desc: "Your session is proxied directly to GGSIPU's server. No credentials or marks touch a database." },
  { n: "03", title: "See everything", desc: "Your dashboard, analytics, and transcript are ready instantly, recalculated live in your browser." },
];

const COLLEGES = [
  "USICT",
  "MAIT",
  "MSIT",
  "BVCOE",
  "BPIT",
  "GTBIT",
  "VIPS",
  "ADGITM",
  "JIMS",
  "DTC",
  "GNDIT",
  "MERI",
  "HMRITM",
  "CPJ-CHS",
  "IITM",
  "BCIPS",
  "TIIPS",
  "FIMT",
  "IINTM",
  "+ 30 More Affiliated Colleges",
];

const GRADE_BADGES = [
  { label: "O", points: 10, cls: "text-grade-excellent bg-grade-excellent-surface border-grade-excellent-border" },
  { label: "A+", points: 9, cls: "text-grade-excellent bg-grade-excellent-surface border-grade-excellent-border" },
  { label: "A", points: 8, cls: "text-grade-good bg-grade-good-surface border-grade-good-border" },
  { label: "B+", points: 7, cls: "text-grade-good bg-grade-good-surface border-grade-good-border" },
  { label: "B", points: 6, cls: "text-grade-average bg-grade-average-surface border-grade-average-border" },
  { label: "C", points: 5, cls: "text-grade-average bg-grade-average-surface border-grade-average-border" },
  { label: "P", points: 4, cls: "text-grade-pass bg-grade-pass-surface border-grade-pass-border" },
  { label: "F", points: 0, cls: "text-grade-fail bg-grade-fail-surface border-grade-fail-border" },
];

const FAQS = [
  {
    q: "How can I check my GGSIPU Semester Results 2026 on Anviksha?",
    a: "Simply sign in using your GGSIPU student enrollment number and password. Anviksha securely connects to the university exam servers to fetch and parse your complete semester results, marks breakdown, and credit points live into an interactive dashboard.",
  },
  {
    q: "How is SGPA and CGPA calculated in GGSIPU under Ordinance 11?",
    a: "GGSIPU uses the Choice Based Credit System (CBCS) defined in Ordinance 11. SGPA is calculated by taking the sum of (Subject Credits × Grade Points) divided by the total semester credits. CGPA is the cumulative credit-weighted average across all completed semesters. Percentage is calculated as CGPA × 10.0.",
  },
  {
    q: "What is the GGSIPU 50% Credit Rule for Academic Promotion?",
    a: "Under GGSIPU Ordinance 11 regulations, a student must clear at least 50% of the total credits offered across both semesters of an academic year (e.g. Sem 1 + Sem 2 for Year 1) to be eligible for promotion to the next academic year without facing detention (year-back).",
  },
  {
    q: "What are the common Campus Placement Cutoff Benchmarks for IPU students?",
    a: "Most corporate recruiters shortlisting at GGSIPU affiliated colleges enforce thresholds of 60% (6.00 CGPA) for IT services & analysts, 65% (6.50 CGPA) for consulting & product tracks, 70% (7.00 CGPA) for core engineering & tier-1 tech firms, and 75%+ (7.50 CGPA) for high-compensation R&D drives, alongside a strict 0 active backlog policy.",
  },
  {
    q: "How does the Odd vs Even Re-appear Examination Cycle work in GGSIPU?",
    a: "GGSIPU examination windows strictly separate semesters: backlogs from Odd semesters (1st, 3rd, 5th, 7th) can only be given during the November/December winter exam cycle, while Even semester backlogs (2nd, 4th, 6th, 8th) can only be given during the May/June summer exam cycle.",
  },
];



const ctaClasses =
  "inline-flex items-center gap-2.5 rounded-md border border-white bg-white px-6 py-3 font-mono text-xs font-bold uppercase tracking-wider text-black shadow-[0_0_20px_rgba(255,255,255,0.15)] transition-transform duration-150 ease-out hover:-translate-y-0.5 hover:bg-neutral-200 active:scale-95";

/* ----------------------------------- page ----------------------------------- */

export default async function Home() {
  const cookieStore = await cookies();
  const isAuthenticated = Boolean(cookieStore.get("auth_session")?.value);

  const cta = isAuthenticated
    ? { label: "Go to Dashboard", href: "/dashboard" }
    : { label: "View My Result", href: "/login" };

  return (
    <div className="relative flex flex-1 flex-col overflow-hidden bg-background text-foreground">

      {/* Ambient background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle,var(--color-border-strong)_1.5px,transparent_1.5px)] bg-size-[28px_28px] mask-[radial-gradient(ellipse_80%_60%_at_50%_0%,black_20%,transparent_100%)]" />
        <div className="absolute -top-32 -left-24 h-96 w-96 rounded-full bg-gold opacity-[0.08] blur-3xl" />
        <div className="absolute top-1/4 -right-24 h-96 w-96 rounded-full bg-cat-violet opacity-[0.06] blur-3xl" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center shrink-0">
            <Image
              src="/navbar-logo.png"
              alt="Anviksha"
              width={150}
              height={40}
              className="h-8 w-auto object-contain"
              priority
            />
          </Link>

          <nav className="hidden items-center gap-7 font-mono text-xs text-foreground-secondary sm:flex">
            <Link href="/notices" className="transition-colors hover:text-gold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" />
              <span>Exam Circulars</span>
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

      <main className="relative z-10 flex-1">
        {/* Hero */}
        <section className="mx-auto max-w-6xl px-6 pb-16 pt-16 lg:pb-24 lg:pt-24">
          <div className="grid grid-cols-1 items-center gap-14 lg:grid-cols-2">
            {/* Left: Messaging */}
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1 font-mono text-xs text-foreground-muted">
                <span className="h-1.5 w-1.5 rounded-full bg-gold animate-pulse" />
                Unofficial · GGSIPU Exam Portal
              </span>

              <h1 className="mt-5 max-w-lg text-4xl font-semibold leading-tight tracking-tight text-foreground sm:text-5xl">
                GGSIPU Results &amp; SGPA Calculator,{" "}
                <span className="text-gold">made simple.</span>
              </h1>

              <p className="mt-5 max-w-md text-base leading-7 text-foreground-secondary">
                A modern academic portal for GGSIPU students. Live semester results, automated Ordinance 11 SGPA/CGPA, promotion standing, placement cutoffs, and transcript exports — all in one place.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link href={cta.href} className={ctaClasses}>
                  {cta.label}
                  <ArrowRight size={14} />
                </Link>
                <Link
                  href="/notices"
                  className="inline-flex items-center gap-2 rounded-md border border-gold-border bg-gold-surface px-5 py-3 font-mono text-xs font-bold uppercase tracking-wider text-gold transition-transform duration-150 hover:-translate-y-0.5 active:scale-95"
                >
                  <Bell size={13} className="animate-pulse" />
                  Live Circulars
                </Link>
              </div>

              <p className="mt-5 flex items-center gap-2 font-mono text-xs text-foreground-muted">
                <ShieldCheck size={14} className="text-positive" />
                {isAuthenticated
                  ? "Welcome back — pick up right where you left off"
                  : "No signup · Takes less than 10 seconds"}
              </p>
            </div>

            {/* Right: Feature Grid */}
            <HeroFeatureGrid />
          </div>
        </section>

        {/* Privacy & Trust Strip */}
        <section className="border-y border-border bg-surface/60">
          <div className="mx-auto max-w-6xl px-6 py-5">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="flex items-center gap-2.5 text-foreground-secondary">
                <ShieldCheck size={15} className="shrink-0 text-positive" />
                <span className="text-xs"><strong className="text-foreground">Zero-database.</strong> Nothing is ever stored on our servers.</span>
              </div>
              <div className="flex items-center gap-2.5 text-foreground-secondary">
                <Lock size={15} className="shrink-0 text-gold" />
                <span className="text-xs"><strong className="text-foreground">Direct proxy.</strong> Credentials go straight to GGSIPU, never cached.</span>
              </div>
              <div className="flex items-center gap-2.5 text-foreground-secondary">
                <Timer size={15} className="shrink-0 text-chart-cyan" />
                <span className="text-xs"><strong className="text-foreground">Session clears</strong> the moment you log out or close the tab.</span>
              </div>
            </div>
          </div>
        </section>

        {/* Supported Colleges */}
        <section className="border-b border-border bg-surface/30">
          <div className="mx-auto max-w-6xl px-6 py-12">
            <div className="max-w-lg mx-auto text-center mb-8">
              <span className="font-mono text-xs uppercase tracking-widest text-gold">
                Universal Support
              </span>
              <h2 className="mt-2 text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
                Just Like the Official Portal, Works for Every College
              </h2>
              <p className="mt-2 text-xs leading-5 text-foreground-secondary">
                If your results are on GGSIPU&apos;s server, they work seamlessly on Anviksha — covering all 50+ affiliated institutes across Delhi NCR.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-2 max-w-4xl mx-auto">
              {COLLEGES.map((college) => (
                <span
                  key={college}
                  className="px-3 py-1.5 rounded-full border border-border bg-surface text-xs font-mono font-medium text-foreground-secondary hover:border-gold-border hover:text-foreground transition-colors"
                >
                  {college}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="mx-auto max-w-6xl px-6 py-24">
          <div className="max-w-lg">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              Everything GGSIPU students need in one portal
            </h2>
            <p className="mt-3 text-sm leading-6 text-foreground-secondary">
              The official GGSIPU result page gives you raw numbers in a table. Anviksha gives you
              the full picture — SGPA/CGPA analytics, promotion standing, placement benchmarks, and
              downloadable transcripts built for how IPU students actually check results.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => {
              const a = ACCENTS[f.accent];
              return (
                <div
                  key={f.title}
                  className={`group rounded-lg border border-border bg-surface p-5 transition-colors duration-300 ${a.border}`}
                >
                  <div className={`inline-flex rounded-md p-2 ${a.bg}`}>
                    <f.icon size={18} className={a.icon} />
                  </div>
                  <h3 className="mt-4 text-sm font-medium text-foreground">{f.title}</h3>
                  <p className="mt-1.5 text-sm leading-6 text-foreground-secondary">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="border-t border-border bg-surface/40">
          <div className="mx-auto max-w-6xl px-6 py-24">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              How it works
            </h2>

            <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-3 sm:gap-6">
              {STEPS.map((step) => (
                <div key={step.n}>
                  <span className="font-mono text-3xl font-semibold text-gold-dim">{step.n}</span>
                  <h3 className="mt-3 text-sm font-medium text-foreground">{step.title}</h3>
                  <p className="mt-1.5 text-sm leading-6 text-foreground-secondary">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Live Circulars & Notices — Prominent CTA */}
        <section className="border-y border-border bg-surface/60">
          <div className="mx-auto max-w-6xl px-6 py-16">
            <div className="rounded-xl border border-gold-border bg-gradient-to-br from-gold-surface/80 via-surface to-surface p-6 sm:p-8 lg:p-10 shadow-sm">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
                {/* Left: Content */}
                <div className="space-y-4 flex-1 max-w-2xl">
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gold/10 border border-gold-border text-gold font-mono text-[11px] font-bold uppercase tracking-wider">
                      <Bell size={13} className="animate-pulse" />
                      <span>Live Feed</span>
                    </div>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface border border-border text-foreground-muted font-mono text-[10px]">
                      <RefreshCw size={10} className="animate-spin" style={{ animationDuration: "6s" }} />
                      <span>Updated every 15 min</span>
                    </div>
                  </div>

                  <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                    GGSIPU Result Circulars, Date-Sheets & Notices
                  </h2>

                  <p className="text-sm leading-6 text-foreground-secondary">
                    Stay ahead of your batch — browse every official GGSIPU examination circular, declared result notification, end-term date-sheet, and answer sheet inspection schedule in one feed. Direct PDF downloads, instant keyword search, and auto-categorized by type.
                  </p>

                  <div className="flex flex-wrap items-center gap-2 pt-1 text-xs font-mono text-foreground-muted">
                    <span className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-grade-excellent-surface border border-grade-excellent-border text-grade-excellent">
                      <span className="w-1.5 h-1.5 rounded-full bg-grade-excellent" />
                      Results Declared
                    </span>
                    <span className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-cat-blue-surface border border-cat-blue-border text-chart-cyan">
                      <span className="w-1.5 h-1.5 rounded-full bg-chart-cyan" />
                      Date Sheets
                    </span>
                    <span className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-gold-surface border border-gold-border text-gold">
                      <span className="w-1.5 h-1.5 rounded-full bg-gold" />
                      Inspection
                    </span>
                    <span className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-cat-violet-surface border border-cat-violet-border text-cat-violet">
                      <span className="w-1.5 h-1.5 rounded-full bg-cat-violet" />
                      General Notices
                    </span>
                  </div>
                </div>

                {/* Right: CTA Button */}
                <div className="flex flex-col items-start lg:items-center gap-3 shrink-0">
                  <Link
                    href="/notices"
                    className="inline-flex items-center gap-2.5 rounded-lg border border-gold bg-gold px-6 py-3.5 font-mono text-xs font-bold uppercase tracking-wider text-background shadow-[0_0_20px_rgba(234,179,8,0.15)] transition-all duration-150 hover:-translate-y-0.5 hover:shadow-[0_0_30px_rgba(234,179,8,0.25)] active:scale-95"
                  >
                    <Bell size={14} />
                    <span>Browse All Circulars</span>
                    <ExternalLink size={12} className="opacity-70" />
                  </Link>
                  <span className="text-[10px] font-mono text-foreground-muted text-center">
                    No login required · Direct from ipu.ac.in
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Grading scale */}
        <section className="mx-auto max-w-6xl px-6 py-24">
          <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                Built exactly to Ordinance 11
              </h2>
              <p className="mt-3 max-w-md text-sm leading-6 text-foreground-secondary">
                Every grade, credit, and division follows GGSIPU&apos;s official
                credit-based semester system — no approximations.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {GRADE_BADGES.map((g) => (
                <span
                  key={g.label}
                  className={`rounded-md border px-3 py-1.5 font-mono text-sm font-medium ${g.cls}`}
                >
                  {g.label} · {g.points}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* SEO FAQ Section */}
        <section className="mx-auto max-w-6xl px-6 py-16 sm:py-20 border-t border-border">
          <div className="space-y-4 max-w-2xl">
            <p className="text-xs font-mono uppercase tracking-widest text-gold">
              Knowledge Base
            </p>
            <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              Frequently Asked Questions about GGSIPU Results
            </h2>
            <p className="text-sm text-foreground-secondary">
              Everything you need to know about GGSIPU semester marks, Ordinance 11 CGPA calculation, 50% credit rules, and transcripts.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-2">
            {FAQS.map((faq, idx) => (
              <article
                key={idx}
                className="rounded-xl border border-border bg-surface p-6 space-y-2.5 transition-colors hover:border-border-strong"
              >
                <h3 className="text-sm font-semibold text-foreground">
                  {faq.q}
                </h3>
                <p className="text-xs leading-6 text-foreground-secondary">
                  {faq.a}
                </p>
              </article>
            ))}
          </div>
        </section>

        {/* Final CTA */}
        <section className="mx-auto max-w-6xl px-6 pb-24">
          <div className="relative overflow-hidden rounded-2xl border border-border-strong bg-surface px-8 py-16 text-center">
            <div className="pointer-events-none absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-gold opacity-[0.08] blur-3xl" />
            <h2 className="relative text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              {isAuthenticated ? "Jump back into your dashboard" : "Ready to see where you stand?"}
            </h2>
            <p className="relative mt-3 text-sm text-foreground-secondary">
              {isAuthenticated
                ? "Your result, analytics, and transcript are right where you left them."
                : "Sign in with your enrollment number — your dashboard loads instantly."}
            </p>
            <Link href={cta.href} className={`relative mt-7 ${ctaClasses}`}>
              {cta.label}
              <ArrowRight size={14} />
            </Link>
          </div>
        </section>
      </main>

      <footer className="relative z-10 border-t border-border">
        <div className="mx-auto max-w-6xl px-6 py-8 space-y-4">
          <div className="flex flex-col items-center justify-between gap-3 text-center sm:flex-row sm:text-left">
            <span className="text-xs text-foreground-muted">
              Anviksha · GGSIPU Results, SGPA/CGPA Calculator & Transcript Portal · Unofficial, not affiliated with GGSIPU
            </span>
            <div className="flex flex-wrap items-center justify-center gap-3 font-mono text-xs text-foreground-muted">
              <Link
                href="/notices"
                className="transition-colors hover:text-gold"
              >
                Live Circulars & Notices
              </Link>
              <span className="text-border-strong">·</span>
              <Link
                href="/calculations"
                className="transition-colors hover:text-gold"
              >
                How Calculations Work
              </Link>
              <span className="text-border-strong">·</span>
              <Link
                href="/report"
                className="transition-colors hover:text-gold"
              >
                Report a Problem
              </Link>
              <span className="text-border-strong">·</span>
              <a
                href="https://himanshusinghdangi.vercel.app"
                target="_blank"
                rel="noreferrer"
                className="transition-colors hover:text-foreground"
              >
                Built by Himanshu Singh
              </a>
            </div>
          </div>
          <p className="text-center text-[10px] leading-5 text-foreground-muted/60 sm:text-left">
            Anviksha is a modern, student-centric GGSIPU results and academic analytics portal for students of Guru Gobind Singh Indraprastha University (IPU).
            Works with all affiliated colleges including USICT, MAIT, MSIT, BVCOE, BPIT, GTBIT, VIPS, ADGITM, JIMS, and more.
            Supports B.Tech, BCA, BBA, MBA, and other IPU programmes.
          </p>
        </div>
      </footer>
    </div>
  );
}
