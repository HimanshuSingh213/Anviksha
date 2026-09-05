"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Bell, ShieldCheck } from "lucide-react";

interface Cta { label: string; href: string; }
interface Notice { title: string; url: string; }
interface Props { isAuthenticated: boolean; cta: Cta; notices?: Notice[]; }

const GOLD_BTN =
  "inline-flex items-center gap-2 rounded-md border border-gold bg-gold px-6 py-3 font-mono text-xs font-bold uppercase tracking-wider text-background shadow-[0_0_24px_rgba(201,169,97,0.22)] transition-all duration-150 hover:-translate-y-0.5 hover:border-gold-bright hover:bg-gold-bright active:scale-95";

const TICKER = [
  "Ordinance 11 verified", "Every affiliated institute", "15-min circulars sync",
  "Zero-database architecture", "Clause-cited calculations", "Odd / even reappear planning",
  "Placement cutoff benchmarks", "Universal programme support",
];

const STATS = [
  { value: "10s", prefix: "under", label: "from sign-in to full dossier" },
  { value: "9", prefix: "", label: "ordinances in the verified registry" },
  { value: "15", prefix: "min", label: "circulars refresh cycle" },
  { value: "0", prefix: "", label: "bytes of your data stored" },
];

const MARKS = [
  { code: "ICT-204", name: "Data Structures", cr: "4", grade: "A+", cls: "text-grade-excellent border-grade-excellent-border bg-grade-excellent-surface" },
  { code: "ICT-202", name: "Mathematics II", cr: "4", grade: "A", cls: "text-grade-good border-grade-good-border bg-grade-good-surface" },
  { code: "ICT-201", name: "Communication Skills", cr: "2", grade: "B+", cls: "text-grade-good border-grade-good-border bg-grade-good-surface" },
];

const TREND = [
  { l: "S1", v: 7.4 }, { l: "S2", v: 7.9 }, { l: "S3", v: 8.2 }, { l: "S4", v: 8.72 },
];

export default function RedesignHero({ isAuthenticated, cta, notices = [] }: Props) {
  const tickerItems = notices.length > 0 ? notices.slice(-8).map((n) => n.title) : TICKER;

  return (
    <>
      <section className="relative w-full">
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
          <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle,var(--color-border-strong)_1px,transparent_1px)] bg-size-[28px_28px] mask-[radial-gradient(ellipse_80%_60%_at_50%_0%,black_20%,transparent_100%)]" />
          <div className="absolute -top-32 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-gold opacity-[0.07] blur-3xl" />
        </div>

        <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-14 px-4 pb-20 pt-10 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:pb-24 lg:pt-14">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: "easeOut" }} className="space-y-6">
            <p className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1 font-mono text-[11px] uppercase tracking-wider text-foreground-muted">
              अन्वीक्षा · noun: analytical enquiry
            </p>

            <h1 className="max-w-lg text-3xl font-semibold leading-tight tracking-tight text-foreground sm:text-5xl">
              GGSIPU gives you a marksheet.
              <span className="block text-gold">Anviksha gives you the verdict.</span>
            </h1>

            <p className="max-w-md text-base leading-7 text-foreground-secondary">
              A results engine for GGSIPU students: SGPA and CGPA under Ordinance 11, promotion standing against the 50% credit rule, placement eligibility at 60 / 65 / 70 / 75, and a consolidated master transcript, in under ten seconds.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link href={cta.href} className={GOLD_BTN}>
                {cta.label}
                <ArrowRight size={14} aria-hidden="true" />
              </Link>
              <Link href="/notices" className="inline-flex items-center gap-1.5 font-mono text-xs font-semibold text-foreground-secondary transition-colors hover:text-gold">
                <Bell size={13} aria-hidden="true" />
                Live circulars
                <ArrowRight size={12} aria-hidden="true" />
              </Link>
            </div>

            <p className="flex items-center gap-2 font-mono text-xs text-foreground-muted">
              <ShieldCheck size={14} className="shrink-0 text-positive" aria-hidden="true" />
              {isAuthenticated ? "Welcome back: your dossier is where you left it." : "No signup · Nothing stored · Under 10 seconds"}
            </p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.15, ease: "easeOut" }}>
            <div className="rounded-xl border border-border-strong bg-surface p-6 shadow-xl">
              <div className="flex items-center justify-between gap-3">
                <span className="font-mono text-[10px] uppercase tracking-wider text-foreground-muted">Semester dossier</span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-grade-excellent-border bg-grade-excellent-surface px-2 py-0.5 font-mono text-[10px] text-grade-excellent">
                  Live
                </span>
              </div>

              <div className="mt-3 flex items-center justify-between gap-3">
                <p className="font-mono text-xs text-foreground-secondary">B.Tech CSE · Sem 4 · USICT</p>
                <span className="font-mono text-[9px] uppercase tracking-wider text-foreground-muted">Sample data</span>
              </div>
              <p className="mt-1 font-mono text-[10px] text-foreground-muted">Ordinance 11</p>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="analytics-card p-3 sm:p-4">
                  <p className="font-mono text-[10px] uppercase tracking-wider text-foreground-muted">SGPA</p>
                  <p className="tnum mt-1.5 text-3xl font-semibold text-gold-bright sm:text-4xl">8.72</p>
                </div>
                <div className="analytics-card p-3 sm:p-4">
                  <p className="font-mono text-[10px] uppercase tracking-wider text-foreground-muted">CGPA</p>
                  <p className="tnum mt-1.5 text-3xl font-semibold text-foreground sm:text-4xl">8.41</p>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-[1fr_auto] items-end gap-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between font-mono text-[10px] text-foreground-muted">
                    <span>50% credit rule · promotion standing</span>
                    <span className="font-mono font-bold tracking-wider text-grade-excellent">PROMOTED</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-hover">
                    <div className="h-full rounded-full bg-grade-excellent" style={{ width: "78%" }} />
                  </div>
                  <p className="font-mono text-[10px] text-foreground-secondary">14 of 18 annual credits cleared</p>
                </div>
                <div className="flex h-14 items-end gap-1.5" aria-hidden="true">
                  {TREND.map((t) => (
                    <div key={t.l} className="flex flex-col items-center gap-1">
                      <div className="w-2 rounded-t bg-gold-dim" style={{ height: (t.v * 4) + "px" }} />
                      <span className="font-mono text-[8px] text-foreground-muted">{t.l}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 space-y-1.5 border-t border-border pt-4">
                {MARKS.map((m) => (
                  <div key={m.code} className="flex items-center justify-between gap-3 font-mono text-[11px]">
                    <span className="truncate text-foreground-secondary">{m.code} · {m.name}</span>
                    <span className="flex shrink-0 items-center gap-2">
                      <span className="text-foreground-muted">{m.cr} cr</span>
                      <span className={"rounded border px-1.5 py-0.5 " + m.cls}>{m.grade}</span>
                    </span>
                  </div>
                ))}
              </div>

              <p className="mt-4 border-t border-border pt-3 font-mono text-[10px] text-foreground-muted">
                Computed client-side · nothing leaves your session
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="relative overflow-hidden border-y border-border bg-surface/60">
        <Link
          href="/notices"
          className="absolute left-0 top-0 z-10 flex h-full items-center gap-1.5 border-r border-border bg-surface px-3 font-mono text-[11px] uppercase tracking-wider text-foreground-secondary transition-colors hover:text-gold sm:px-6"
        >
          <Bell size={13} aria-hidden="true" />
          <span className="hidden sm:inline">View all circulars</span>
          <span className="sm:hidden">Circulars</span>
        </Link>
        <div className="ticker-track flex w-max items-center gap-8 pl-28 pr-6 py-3 sm:pl-48 sm:pr-6" aria-hidden="true">
          {tickerItems.concat(tickerItems).map((t, i) => (
            <span key={i} className="flex items-center gap-8 whitespace-nowrap font-mono text-[11px] uppercase tracking-wider text-foreground-muted">
              {t}
              <span className="text-gold-dim">·</span>
            </span>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20">
        <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
          {STATS.map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: i * 0.06 }}>
              <p className="tnum text-3xl font-semibold text-foreground sm:text-4xl">
                {s.prefix ? <span className="mr-1 text-base font-normal text-foreground-muted">{s.prefix}</span> : null}
                {s.value}
              </p>
              <p className="mt-2 font-mono text-xs leading-5 text-foreground-secondary">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </section>
    </>
  );
}