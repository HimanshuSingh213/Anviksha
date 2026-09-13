"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Bell, ShieldCheck } from "lucide-react";
import DossierCard from "./DossierCard";

interface Cta { label: string; href: string; }
interface Notice { title: string; url: string; }
interface Props { isAuthenticated: boolean; cta: Cta; notices?: Notice[]; }

const GOLD_BTN =
  "inline-flex items-center gap-2 rounded-md border border-gold bg-gold px-6 py-3 font-mono text-xs font-bold uppercase tracking-wider text-background shadow-[0_0_24px_rgba(201,169,97,0.22)] transition-all duration-150 hover:-translate-y-0.5 hover:border-gold-bright hover:bg-gold-bright active:scale-95";

const FALLBACK_CIRCULAR_TITLES = [
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

export default function HeroSection({ isAuthenticated, cta, notices = [] }: Props) {
  const circularTitles = notices.length > 0 ? notices.slice(0, 8).map((notice) => notice.title) : FALLBACK_CIRCULAR_TITLES;

  return (
    <>
      <section className="relative w-full">
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
          <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle,var(--color-border-strong)_1px,transparent_1px)] bg-size-[28px_28px] mask-[radial-gradient(ellipse_80%_60%_at_50%_0%,black_20%,transparent_100%)]" />
          <div className="absolute -top-32 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-gold opacity-[0.07] blur-3xl" />
        </div>

        <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-4 pb-20 pt-10 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14 lg:pb-24 lg:pt-14">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="flex flex-col items-center space-y-6 text-center lg:items-start lg:text-left"
          >
            <p className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1 font-mono text-[11px] uppercase tracking-wider text-foreground-muted">
              अन्वीक्षा · noun: analytical enquiry
            </p>

            <h1 className="w-full max-w-2xl text-3xl font-semibold leading-tight tracking-tight text-foreground sm:text-5xl lg:max-w-lg">
              GGSIPU gives you a marksheet.
              <span className="block text-gold">Anviksha gives you the verdict.</span>
            </h1>

            <p className="w-full max-w-2xl text-base leading-7 text-foreground-secondary sm:text-lg lg:max-w-md lg:text-base">
              A results engine for GGSIPU students: SGPA and CGPA under Ordinance 11, promotion standing against the 50% credit rule, placement eligibility at 60 / 65 / 70 / 75, and a consolidated master transcript, in under ten seconds.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 pt-2 lg:justify-start">
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

            <p className="flex items-center justify-center gap-2 font-mono text-xs text-foreground-muted lg:justify-start">
              <ShieldCheck size={14} className="shrink-0 text-positive" aria-hidden="true" />
              {isAuthenticated ? "Welcome back: your dossier is where you left it." : "No signup · Nothing stored · Under 10 seconds"}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.15, ease: "easeOut" }}
            className="w-full max-w-2xl mx-auto lg:max-w-none"
          >
            <DossierCard />
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
          {circularTitles.concat(circularTitles).map((title, i) => (
            <span key={i} className="flex items-center gap-8 whitespace-nowrap font-mono text-[11px] uppercase tracking-wider text-foreground-muted">
              {title}
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