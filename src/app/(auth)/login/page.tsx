"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  Hash,
  KeyRound,
  ChevronDown,
  Info,
  Calculator,
  ShieldCheck,
  Bell,
} from "lucide-react";
import { LoginForm } from "@/components/login/LoginForm";

// Floating grade pills in background
const FLOATING_PILLS = [
  { label: "O · 10 pts", cls: "text-grade-excellent bg-grade-excellent-surface border-grade-excellent-border top-[12%] left-[4%]", delay: 0 },
  { label: "A+ · 9 pts", cls: "text-grade-excellent bg-grade-excellent-surface border-grade-excellent-border top-[28%] left-[3%]", delay: 0.3 },
  { label: "SGPA 8.9 ▲", cls: "text-gold bg-gold-surface border-gold-border top-[48%] left-[5%]", delay: 0.6 },
  { label: "Sem 6", cls: "text-cat-blue bg-cat-blue-surface border-cat-blue-border top-[68%] left-[4%]", delay: 0.9 },
  { label: "B+ · 7 pts", cls: "text-grade-good bg-grade-good-surface border-grade-good-border top-[16%] right-[4%]", delay: 0.2 },
  { label: "Rank #3", cls: "text-cat-violet bg-cat-violet-surface border-cat-violet-border top-[34%] right-[3%]", delay: 0.5 },
  { label: "9.1 CGPA", cls: "text-gold-bright bg-gold-surface border-gold-border top-[54%] right-[4%]", delay: 0.8 },
  { label: "0 Backlogs", cls: "text-grade-excellent bg-grade-excellent-surface border-grade-excellent-border top-[74%] right-[3%]", delay: 1.1 },
];

// Grade scale legend items
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

export default function LoginPage() {
  const [showHelper, setShowHelper] = useState(false);


  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-background text-foreground">
      {/* Background Dot Grid */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle,var(--color-border-strong)_1.5px,transparent_1.5px)] bg-size-[28px_28px] mask-[radial-gradient(ellipse_80%_80%_at_50%_50%,black_30%,transparent_100%)]" />
      </div>

      {/* Ambient background glows */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute -top-32 -left-20 h-96 w-96 rounded-full bg-gold opacity-20 filter blur-3xl" />
        <div className="absolute top-1/3 -right-20 h-96 w-96 rounded-full bg-cat-violet opacity-10 filter blur-3xl" />
      </div>

      {/* Floating Grade Badges in Background */}
      <div className="pointer-events-none absolute inset-0 hidden xl:block overflow-hidden">
        {FLOATING_PILLS.map((pill, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: pill.delay, duration: 0.6 }}
            className={`absolute border rounded-lg px-3 py-1 text-xs font-mono font-medium backdrop-blur-md shadow-md ${pill.cls}`}
          >
            <motion.span
              animate={{ y: [0, -6, 0] }}
              transition={{ repeat: Infinity, duration: 3.5 + idx * 0.4, ease: "easeInOut" }}
              className="block"
            >
              {pill.label}
            </motion.span>
          </motion.div>
        ))}
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link href="/" title="Go to Homepage" className="flex items-center gap-3 group cursor-pointer">
            <div className="h-9 w-9 overflow-hidden rounded-lg border border-border shadow-sm transition-opacity group-hover:opacity-85">
              <Image
                src="/favicon.png"
                alt="Anviksha"
                width={36}
                height={36}
                className="object-cover"
                priority
              />
            </div>
            <div>
              <span className="font-mono text-xs font-semibold tracking-widest text-foreground transition-colors group-hover:text-gold">
                ANVIKSHA
              </span>
              <p className="font-mono text-[10px] text-foreground-muted">
                GGSIPU Exam Portal
              </p>
            </div>
          </Link>

          <div className="flex items-center gap-2.5">
            <Link
              href="/notices"
              title="Live GGSIPU Result Circulars & Date-Sheets"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-border-strong bg-surface text-xs font-mono font-semibold text-foreground-secondary hover:text-gold hover:border-gold-border transition-colors shadow-xs"
            >
              <Bell size={13} className="text-gold" />
              <span className="hidden sm:inline">Exam Circulars</span>
            </Link>

            <div className="flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-xs text-foreground-muted">
              <ShieldCheck size={14} className="text-positive" />
              <span className="font-mono text-[11px]">Secure Access</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="relative z-10 flex flex-1 items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">

          {/* Title */}
          <div className="mb-6 text-center">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Sign In to <span className="text-gold">Exam Portal</span>
            </h1>
            <p className="mt-2 text-sm text-foreground-secondary">
              Enter your GGSIPU credentials to fetch your semester results.
            </p>
          </div>

          {/* Collapsible Login Credentials Guide Bar */}
          <div className="mb-5 rounded-xl border border-border-strong bg-surface backdrop-blur-md overflow-hidden">
            <button
              type="button"
              onClick={() => setShowHelper(!showHelper)}
              suppressHydrationWarning
              className="flex w-full items-center justify-between px-4 py-3 text-xs font-semibold text-foreground-secondary hover:text-foreground transition"
            >
              <span className="flex items-center gap-2">
                <Info size={14} className="text-gold" />
                Login Credentials & Default Password Guide
              </span>
              <motion.span
                animate={{ rotate: showHelper ? 180 : 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
              >
                <ChevronDown size={16} />
              </motion.span>
            </button>

            {/* info roller div */}
            <AnimatePresence initial={false}>
              {showHelper && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: [0.25, 1, 0.5, 1] }}
                  className="overflow-hidden"
                >
                  <div className="border-t border-border bg-background/40 px-4 py-3 text-xs leading-relaxed text-foreground-secondary">
                    <p className="mb-2 flex items-center gap-1.5 font-medium text-foreground">
                      <Hash size={14} className="text-gold" />
                      <strong className="text-gold">Username:</strong> Your 11-digit GGSIPU Enrollment Number.
                    </p>
                    <p className="flex items-center gap-1.5 font-medium text-foreground">
                      <KeyRound size={14} className="text-gold" />
                      <strong className="text-gold">Default Password:</strong> Your father&apos;s full name with spaces between first, middle, and surname (if not changed by you).
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Login Card */}
          <div className="rounded-2xl border border-border-strong bg-surface p-8 backdrop-blur-xl shadow-[0_12px_40px_rgba(0,0,0,0.45)]">
            <LoginForm/>
          </div>

          {/* Grades Section */}
          <div className="mt-8 flex flex-col items-center gap-3">
            <span className="font-mono text-xs uppercase tracking-widest text-foreground-muted">
              GGSIPU Grading Scale
            </span>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {GRADE_BADGES.map((grade) => (
                <span
                  key={grade.label}
                  className={`rounded-md border px-2.5 py-1 font-mono text-xs font-medium shadow-sm ${grade.cls}`}
                >
                  {grade.label} · {grade.points}
                </span>
              ))}
            </div>
          </div>

          {/* SGPA & CGPA Calculation Formula Card */}
          <div className="mt-6 rounded-xl border border-border bg-surface/80 p-4 text-xs backdrop-blur-md">
            <div className="flex items-center gap-2 font-semibold text-gold mb-2">
              <Calculator size={15} />
              GGSIPU Calculation Formulas
            </div>
            <div className="flex flex-col gap-2 font-mono text-[11px] text-foreground-secondary">
              <div className="rounded-lg border border-border-strong bg-background p-2.5">
                <span className="text-foreground font-semibold">SGPA Formula:</span> Σ(Subject Credits × Grade Points) / Σ(Total Semester Credits)
              </div>
              <div className="rounded-lg border border-border-strong bg-background p-2.5">
                <span className="text-foreground font-semibold">CGPA Formula:</span> Total Quality Points / Total Registered Credits
              </div>
              <div className="rounded-lg border border-border-strong bg-background p-2.5 text-gold">
                <span className="text-foreground font-semibold">Percentage (%):</span> CGPA × 10.0 [Ordinance 11]
              </div>
            </div>
            <div className="mt-2.5 pt-2 border-t border-border text-center">
              <Link
                href="/calculations"
                className="text-[11px] font-mono text-gold hover:underline"
              >
                Learn how all calculations work →
              </Link>
            </div>
          </div>

        </div>
      </main>

      {/* Simple Footer */}
      <footer className="relative z-10 border-t border-border py-4 text-center text-xs text-foreground-muted flex flex-wrap items-center justify-center gap-3">
        <span>Anviksha · Unofficial GGSIPU Results Portal</span>
        <span className="text-border-strong">·</span>
        <Link href="/notices" className="hover:text-gold transition-colors">
          Live Circulars & Notices
        </Link>
        <span className="text-border-strong">·</span>
        <Link href="/calculations" className="hover:text-gold transition-colors">
          How Calculations Work
        </Link>
        <span className="text-border-strong">·</span>
        <Link href="/" className="hover:text-gold transition-colors">
          Home
        </Link>
      </footer>
    </div>
  );
}
