"use client";

import Link from "next/link";
import { motion } from "framer-motion";
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
  CheckCircle2,
  RefreshCw,
  ExternalLink,
} from "lucide-react";
import HeroDashboardPreview from "@/components/home/HeroDashboardPreview";

export const FAQS = [
  {
    q: "How can I check my GGSIPU Semester Results on Anviksha?",
    a: "Simply enter your GGSIPU student enrollment number and password. Anviksha securely connects to the official university exam servers via direct proxy to fetch your complete semester marks, grade points, and academic standing instantly.",
  },
  {
    q: "Does Anviksha work for all GGSIPU programmes and streams?",
    a: "Anviksha shows your result for any programme declared on GGSIPU's ExamWeb server — every affiliated institute is supported. Deep analytics are computed under each programme's own ordinance: Ordinance 11 for B.Tech, BCA, BBA, MBA, BA LLB, BBA LLB and other semester degrees, with separate verified frameworks for MBBS, BPT, BHMS, BAMS and BASLP. Where a rule isn't verified yet, we show the raw marks and say so instead of guessing.",
  },
  {
    q: "How is SGPA and CGPA calculated in GGSIPU under Ordinance 11?",
    a: "Under GGSIPU Ordinance 11 (Clause 13), SGPA is the credit-weighted average: the sum of (Subject Credits × Grade Points) divided by total semester credits. CGPA is the cumulative credit-weighted average across all completed semesters. Equivalent percentage is computed as CGPA × 10.",
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
  { icon: Calculator, accent: "blue", title: "Instant SGPA & CGPA", desc: "Calculated the second your result loads — exact to Ordinance 11." },
  { icon: ShieldCheck, accent: "green", title: "50% Promotion Standing", desc: "Tracks your annual credits so a year-back never catches you off guard." },
  { icon: Briefcase, accent: "gold", title: "Placement Gatekeeper", desc: "See where you stand against the 60/65/70/75% recruiter cutoffs." },
  { icon: Calendar, accent: "teal", title: "Odd/Even Reappear Planner", desc: "Know if a backlog falls in the Nov/Dec or May/June exam window." },
  { icon: FileDown, accent: "violet", title: "Consolidated Master Transcript", desc: "One-click, QR-verified transcript across every semester you've cleared." },
  { icon: Award, accent: "gold", title: "Division & Distinction", desc: "Auto-classified into First Division with Distinction, First, or Second." },
  { icon: TrendingUp, accent: "blue", title: "Semester Trends", desc: "Watch your SGPA curve and internal-vs-external split over time." },
  { icon: PieChart, accent: "pink", title: "Grade Breakdown", desc: "Full O-to-F distribution, with your best and worst subjects flagged." },
];

const STEPS = [
  { n: "01", title: "Sign in", desc: "Enter your enrollment number and password — the same ones you use on the GGSIPU portal." },
  { n: "02", title: "We fetch, not store", desc: "Your session is proxied directly to GGSIPU's server. No credentials or marks touch a database." },
  { n: "03", title: "See everything", desc: "Your dashboard, analytics, and transcript are ready instantly, recalculated live in your browser." },
];

const STREAMS = [
  {
    category: "Engineering & Tech",
    badge: "B.Tech · BCA · MCA",
    courses: ["B.Tech (CSE, IT, ECE, AI/ML, Mech, Civil)", "BCA", "MCA (SE)", "M.Tech"],
    accent: "text-chart-cyan border-cat-blue-border bg-cat-blue-surface",
  },
  {
    category: "Business & Management",
    badge: "BBA · MBA · B.Com",
    courses: ["BBA (General & Banking)", "MBA (All Specs)", "B.Com (Hons)", "B.A. Economics (Hons)"],
    accent: "text-gold border-gold-border bg-gold-surface",
  },
  {
    category: "Law & Legal Studies",
    badge: "BA LLB · BBA LLB",
    courses: ["BA LLB (Hons)", "BBA LLB (Hons)", "LLM (Corporate & Cyber)"],
    accent: "text-cat-violet border-cat-violet-border bg-cat-violet-surface",
  },
  {
    category: "Medical & Allied Health",
    badge: "B.Sc · BPT · B.Pharm",
    courses: ["B.Sc Nursing", "BPT (Physiotherapy)", "B.Pharm", "BMLT", "BOT"],
    accent: "text-grade-excellent border-grade-excellent-border bg-grade-excellent-surface",
  },
  {
    category: "Media & Humanities",
    badge: "BA JMC · B.Ed · B.Voc",
    courses: ["BA (Journalism & Mass Comm)", "B.Ed", "B.Voc (Applied Tech)", "Design"],
    accent: "text-cat-pink border-cat-pink-border bg-cat-pink-surface",
  },
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
  "+ 35 More Affiliated Colleges",
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

const ctaClasses =
  "inline-flex items-center gap-2.5 rounded-md border border-white bg-white px-6 py-3.5 font-mono text-xs font-bold uppercase tracking-wider text-black shadow-[0_0_20px_rgba(255,255,255,0.15)] transition-all duration-150 ease-out hover:-translate-y-0.5 hover:bg-neutral-200 active:scale-95 focus-visible:ring-2 focus-visible:ring-gold";

interface LandingPageViewProps {
  isAuthenticated: boolean;
  cta: { label: string; href: string };
}

export default function LandingPageView({ isAuthenticated, cta }: LandingPageViewProps) {
  return (
    <main className="relative z-10 flex-1">
      {/* Hero Section */}
      <section className="mx-auto max-w-6xl px-6 pb-16 pt-16 lg:pb-24 lg:pt-24">
        <div className="grid grid-cols-1 items-center gap-14 lg:grid-cols-2">
          {/* Left: Messaging with Framer Motion Stagger */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="space-y-6"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1 font-mono text-xs text-foreground-muted"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-gold animate-pulse" />
              Unofficial · Built for GGSIPU Students
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.15 }}
              className="max-w-lg text-4xl font-semibold leading-tight tracking-tight text-foreground sm:text-5xl"
            >
              GGSIPU result &amp; SGPA/CGPA calculator,{" "}
              <span className="text-gold">actually explained.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="max-w-md text-base leading-7 text-foreground-secondary"
            >
              The official portal gives you a table of marks. Anviksha turns it into your SGPA, CGPA, promotion standing, and placement eligibility — the second you log in.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.25 }}
              className="flex flex-wrap items-center gap-4 pt-2"
            >
              <Link href={cta.href} className={ctaClasses}>
                {cta.label}
                <ArrowRight size={14} aria-hidden="true" />
              </Link>
              <Link
                href="/notices"
                className="inline-flex items-center gap-1.5 font-mono text-xs font-semibold text-foreground-secondary transition-colors hover:text-gold focus-visible:ring-2 focus-visible:ring-gold rounded px-2 py-1"
              >
                <Bell size={13} aria-hidden="true" />
                Live circulars
                <ArrowRight size={12} aria-hidden="true" />
              </Link>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="flex items-center gap-2 font-mono text-xs text-foreground-muted"
            >
              <ShieldCheck size={14} className="text-positive shrink-0" aria-hidden="true" />
              {isAuthenticated
                ? "Welcome back — pick up right where you left off"
                : "No signup · Nothing stored · Under 10 seconds"}
            </motion.p>
          </motion.div>

          {/* Right: Live Dashboard Preview */}
          <HeroDashboardPreview />
        </div>
      </section>

      {/* Privacy & Trust Strip */}
      <section className="border-y border-border bg-surface/60">
        <div className="mx-auto max-w-6xl px-6 py-6">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="grid grid-cols-1 gap-4 sm:grid-cols-3"
          >
            <motion.div
              whileHover={{ scale: 1.01 }}
              className="flex items-center gap-3 p-2 rounded-lg text-foreground-secondary transition-colors hover:bg-surface-elevated/40"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-grade-excellent-surface border border-grade-excellent-border">
                <ShieldCheck size={16} className="text-positive" aria-hidden="true" />
              </div>
              <span className="text-xs">
                <strong className="text-foreground">Zero-database. </strong>Nothing is ever saved or recorded on any server.
              </span>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.01 }}
              className="flex items-center gap-3 p-2 rounded-lg text-foreground-secondary transition-colors hover:bg-surface-elevated/40"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gold-surface border border-gold-border">
                <Lock size={16} className="text-gold" aria-hidden="true" />
              </div>
              <span className="text-xs">
                <strong className="text-foreground">Direct proxy. </strong>Credentials go straight to GGSIPU, never cached.
              </span>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.01 }}
              className="flex items-center gap-3 p-2 rounded-lg text-foreground-secondary transition-colors hover:bg-surface-elevated/40"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-cat-blue-surface border border-cat-blue-border">
                <Timer size={16} className="text-chart-cyan" aria-hidden="true" />
              </div>
              <span className="text-xs">
                <strong className="text-foreground">Session clears </strong>the moment you log out or close the browser tab.
              </span>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Universal Support: Every Stream & College */}
      <section aria-labelledby="universal-support-heading" className="border-b border-border bg-surface/30">
        <div className="mx-auto max-w-6xl px-6 py-16 sm:py-20 space-y-12">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="max-w-2xl mx-auto text-center space-y-3"
          >
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold-surface border border-gold-border font-mono text-[11px] font-bold uppercase tracking-wider text-gold">
              Universal Stream &amp; College Support
            </span>
            <h2 id="universal-support-heading" className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Works for Every Programme, Stream &amp; Affiliated College
            </h2>
            <p className="text-sm leading-6 text-foreground-secondary">
              Whether you&apos;re studying computer science, corporate law, business administration, physiotherapy, or medicine — if your results are declared on GGSIPU&apos;s server, Anviksha shows your complete marks and applies the right ordinance for your programme: Ordinance 11 for semester degrees, with dedicated frameworks for MBBS, BPT, and other professional courses.
            </p>
          </motion.div>

          {/* Stream Cards Grid */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {STREAMS.map((stream, idx) => (
              <motion.div
                key={stream.category}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: idx * 0.06 }}
                whileHover={{ y: -3, scale: 1.01 }}
                className="rounded-xl border border-border bg-surface p-5 space-y-3 transition-all hover:border-gold-border/70 hover:shadow-lg"
              >
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-sm font-bold text-foreground font-mono">{stream.category}</h3>
                  <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded border shrink-0 whitespace-nowrap ${stream.accent}`}>
                    {stream.badge}
                  </span>
                </div>
                <ul className="space-y-1 text-xs text-foreground-secondary font-mono">
                  {stream.courses.map((c) => (
                    <li key={c} className="flex items-center gap-1.5">
                      <span className="w-1 h-1 rounded-full bg-gold shrink-0" />
                      <span>{c}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}

            {/* 50+ Colleges Summary Card */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: 0.3 }}
              whileHover={{ y: -3, scale: 1.01 }}
              className="rounded-xl border border-gold-border/40 bg-linear-to-br from-gold-surface via-surface to-surface p-5 flex flex-col justify-between space-y-3 hover:shadow-lg transition-all"
            >
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-gold">All 50+ Institutes</span>
                <h3 className="text-sm font-bold text-foreground font-mono mt-1">Delhi NCR Campuses</h3>
                <p className="text-xs text-foreground-secondary mt-1.5 leading-relaxed">
                  Compatible with all university main campus schools (USS) and all affiliated private &amp; government colleges.
                </p>
              </div>
              <div className="text-xs font-mono text-gold flex items-center gap-1 font-semibold">
                <CheckCircle2 size={13} aria-hidden="true" />
                <span>100% GGSIPU ExamWeb Compatibility</span>
              </div>
            </motion.div>
          </div>

          {/* College Badges */}
          <div className="space-y-3">
            <p className="text-center font-mono text-[11px] uppercase tracking-wider text-foreground-muted">
              Popular Affiliated Institutes
            </p>
            <div className="flex flex-wrap justify-center gap-2 max-w-4xl mx-auto">
              {COLLEGES.map((college) => (
                <motion.span
                  key={college}
                  whileHover={{ scale: 1.05, y: -1 }}
                  className="px-3 py-1.5 rounded-full border border-border bg-surface text-xs font-mono font-medium text-foreground-secondary hover:border-gold-border hover:text-foreground transition-colors cursor-default"
                >
                  {college}
                </motion.span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="mx-auto max-w-6xl px-6 py-20 sm:py-24">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="max-w-lg"
        >
          <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Everything your result actually needs to tell you
          </h2>
          <p className="mt-3 text-sm leading-6 text-foreground-secondary">
            Marks alone don&apos;t tell you if you&apos;re getting promoted, where you rank for
            placements, or which paper to clear first. Anviksha calculates all of it, live.
          </p>
        </motion.div>

        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f, idx) => {
            const a = ACCENTS[f.accent];
            return (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: idx * 0.05 }}
                whileHover={{ y: -4, scale: 1.015 }}
                className={`group rounded-lg border border-border bg-surface p-5 transition-all duration-300 ${a.border} hover:shadow-lg`}
              >
                <div className={`inline-flex rounded-md p-2.5 ${a.bg}`}>
                  <f.icon size={18} className={a.icon} aria-hidden="true" />
                </div>
                <h3 className="mt-4 text-sm font-semibold text-foreground group-hover:text-gold transition-colors">{f.title}</h3>
                <p className="mt-1.5 text-xs leading-5 text-foreground-secondary">{f.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="border-t border-border bg-surface/40">
        <div className="mx-auto max-w-6xl px-6 py-20 sm:py-24">
          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl"
          >
            How it works
          </motion.h2>

          <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-3 sm:gap-6">
            {STEPS.map((step, idx) => (
              <motion.div
                key={step.n}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: idx * 0.08 }}
                whileHover={{ y: -2 }}
                className="p-4 rounded-xl border border-border/40 bg-surface/50 space-y-2"
              >
                <span className="font-mono text-3xl font-semibold text-gold-dim">{step.n}</span>
                <h3 className="text-sm font-semibold text-foreground">{step.title}</h3>
                <p className="text-xs leading-6 text-foreground-secondary">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Live Circulars & Notices Minimal Luxury Banner */}
      <section aria-labelledby="live-circulars-heading" className="border-y border-border bg-surface/40">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="relative overflow-hidden rounded-2xl border border-border bg-linear-to-b from-surface via-surface to-surface-deep/90 p-7 sm:p-9 lg:p-10 shadow-lg transition-all duration-300 hover:border-gold-border/50 before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-linear-to-r before:from-transparent before:via-gold/50 before:to-transparent"
          >
            {/* Ambient subtle glow */}
            <div
              className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-gold opacity-[0.06] blur-3xl"
              aria-hidden="true"
            />

            <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              {/* Left: Clean Content */}
              <div className="space-y-3.5 flex-1 max-w-2xl">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gold/10 border border-gold-border/60 text-gold font-mono text-[11px] font-semibold uppercase tracking-wider">
                    <span className="w-1.5 h-1.5 rounded-full bg-gold animate-pulse" aria-hidden="true" />
                    <span>Live Feed</span>
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-surface-deep border border-border text-foreground-secondary font-mono text-[10px]">
                    <RefreshCw size={10} className="shrink-0 animate-spin" style={{ animationDuration: "6s" }} aria-hidden="true" />
                    <span>Updated every 15 min</span>
                  </span>
                </div>

                <h2 id="live-circulars-heading" className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                  GGSIPU Result Circulars, Date-Sheets &amp; Notices
                </h2>

                <p className="text-sm leading-6 text-foreground-secondary">
                  Stay ahead with instant university updates. Browse declared result notifications, end-term examination date-sheets, and evaluated answer script inspection notices in a clean, searchable feed with direct official PDFs.
                </p>

                <div className="flex flex-wrap items-center gap-2 pt-1 font-mono text-xs text-foreground-secondary">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-surface-deep border border-border hover:border-border-strong transition-colors">
                    <span className="w-1.5 h-1.5 rounded-full bg-grade-excellent" />
                    Results Declared
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-surface-deep border border-border hover:border-border-strong transition-colors">
                    <span className="w-1.5 h-1.5 rounded-full bg-chart-cyan" />
                    Date Sheets
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-surface-deep border border-border hover:border-border-strong transition-colors">
                    <span className="w-1.5 h-1.5 rounded-full bg-gold" />
                    Inspection Schedules
                  </span>
                </div>
              </div>

              {/* Right: Refined CTA */}
              <div className="flex flex-col items-start lg:items-center gap-2.5 shrink-0 pt-2 lg:pt-0">
                <Link
                  href="/notices"
                  className="inline-flex items-center gap-2 rounded-lg border border-gold bg-gold px-6 py-3 font-mono text-xs font-bold uppercase tracking-wider text-background shadow-[0_0_20px_rgba(234,179,8,0.18)] transition-all duration-150 hover:-translate-y-0.5 hover:shadow-[0_0_30px_rgba(234,179,8,0.3)] active:scale-95 focus-visible:ring-2 focus-visible:ring-gold"
                >
                  <Bell size={13} aria-hidden="true" />
                  <span>Browse All Circulars</span>
                  <ExternalLink size={12} className="opacity-80" aria-hidden="true" />
                </Link>
                <span className="text-[10px] font-mono text-foreground-muted">
                  No login required · Direct from ipu.ac.in
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Grading scale */}
      <section className="mx-auto max-w-6xl px-6 py-20 sm:py-24">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center"
        >
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              Built on the actual ordinances
            </h2>
            <p className="mt-3 max-w-md text-sm leading-6 text-foreground-secondary">
              Grades, SGPA, CGPA, and divisions follow GGSIPU&apos;s official
              Ordinance 11 semester framework — no approximations, with every
              number badged as verified or estimated.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {GRADE_BADGES.map((g) => (
              <motion.span
                key={g.label}
                whileHover={{ scale: 1.08 }}
                className={`rounded-md border px-3 py-1.5 font-mono text-sm font-medium cursor-default shadow-xs ${g.cls}`}
              >
                {g.label} · {g.points}
              </motion.span>
            ))}
          </div>
        </motion.div>
      </section>

      {/* SEO FAQ Section */}
      <section className="mx-auto max-w-6xl px-6 py-16 sm:py-20 border-t border-border">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
          className="space-y-4 max-w-2xl"
        >
          <p className="text-xs font-mono uppercase tracking-widest text-gold">
            Knowledge Base
          </p>
          <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Frequently Asked Questions about GGSIPU Results
          </h2>
          <p className="text-sm text-foreground-secondary">
            Everything you need to know about GGSIPU semester marks, Ordinance 11 CGPA calculation, 50% credit rules, and transcripts.
          </p>
        </motion.div>

        <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-2">
          {FAQS.map((faq, idx) => (
            <motion.article
              key={idx}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: idx * 0.05 }}
              whileHover={{ y: -2 }}
              className="rounded-xl border border-border bg-surface p-6 space-y-2.5 transition-colors hover:border-gold-border/60 hover:shadow-md"
            >
              <h3 className="text-sm font-semibold text-foreground">
                {faq.q}
              </h3>
              <p className="text-xs leading-6 text-foreground-secondary">
                {faq.a}
              </p>
            </motion.article>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="mx-auto max-w-6xl px-6 pb-24">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-2xl border border-border-strong bg-surface px-8 py-16 text-center shadow-xl"
        >
          <div className="pointer-events-none absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-gold opacity-[0.08] blur-3xl" />
          <h2 className="relative text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            {isAuthenticated ? "Jump back into your dashboard" : "Ready to see where you stand?"}
          </h2>
          <p className="relative mt-3 text-sm text-foreground-secondary max-w-md mx-auto">
            {isAuthenticated
              ? "Your result, analytics, and transcript are right where you left them."
              : "Sign in with your enrollment number — your dashboard loads instantly."}
          </p>
          <div className="pt-2">
            <Link href={cta.href} className={`relative mt-6 ${ctaClasses}`}>
              {cta.label}
              <ArrowRight size={14} aria-hidden="true" />
            </Link>
          </div>
        </motion.div>
      </section>
    </main>
  );
}
