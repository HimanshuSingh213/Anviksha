"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Bell, ExternalLink, Search, ShieldCheck } from "lucide-react";
import SectionHead from "./SectionHead";

const STREAMS = [
  { category: "Engineering & Tech", badge: "B.Tech · BCA · MCA", accent: "text-chart-cyan border-cat-blue-border bg-cat-blue-surface", courses: ["B.Tech (CSE, IT, ECE, AI/ML, Mech, EE)", "BCA", "MCA (SE)", "M.Tech"] },
  { category: "Business & Management", badge: "BBA · MBA · B.Com", accent: "text-gold border-gold-border bg-gold-surface", courses: ["BBA (General & Banking)", "MBA (All Specs)", "B.Com (Hons)", "B.A. Economics (Hons)"] },
  { category: "Law & Legal Studies", badge: "BA LLB · BBA LLB", accent: "text-cat-violet border-cat-violet-border bg-cat-violet-surface", courses: ["BA LLB (Hons)", "BBA LLB (Hons)", "LLM (Corporate & Cyber)"] },
  { category: "Medical & Allied Health", badge: "B.Sc · BPT · B.Pharm", accent: "text-grade-excellent border-grade-excellent-border bg-grade-excellent-surface", courses: ["B.Sc Nursing", "BPT (Physiotherapy)", "B.Pharm", "BMLT", "BOT"] },
  { category: "Media & Humanities", badge: "BA JMC · B.Ed · B.Voc", accent: "text-cat-pink border-cat-pink-border bg-cat-pink-surface", courses: ["BA (Journalism & Mass Comm)", "B.Ed", "B.Voc (Applied Tech)", "Design"] },
];

const COLLEGES = ["USICT","MAIT","MSIT","BVCOE","BPIT","GTBIT","VIPS","ADGITM","JIMS","DTC","GNDIT","MERI","HMRITM","CPJ-CHS","IITM","BCIPS","TIIPS","FIMT","IINTM","+ 35 more"];

const CIRC_CATS = [
  { label: "Results declared", dot: "bg-grade-excellent" },
  { label: "Date sheets", dot: "bg-chart-cyan" },
  { label: "Inspection schedules", dot: "bg-gold" },
];

export default function RedesignCoverage() {
  return (
    <section id="coverage" className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 sm:py-24">
      <SectionHead
        index="02"
        kicker="Universal coverage"
        title="One portal for every programme on ExamWeb."
        desc="If your result is declared on the GGSIPU server, Anviksha renders it in full, applying the right ordinance for your programme. Where a rule is not verified yet, we show marks as published and say so. Never a guessed number."
      />

      <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {STREAMS.map((s, i) => (
          <motion.div key={s.category} initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.35, delay: i * 0.05 }} className="rounded-xl border border-border bg-surface p-5 transition-all hover:border-gold-border/70 hover:shadow-lg">
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-mono text-sm font-bold text-foreground">{s.category}</h3>
              <span className={"shrink-0 whitespace-nowrap rounded border px-1.5 py-0.5 font-mono text-[9px] font-semibold " + s.accent}>{s.badge}</span>
            </div>
            <ul className="mt-3 space-y-1 font-mono text-xs text-foreground-secondary">
              {s.courses.map((c) => (
                <li key={c} className="flex items-center gap-1.5">
                  <span className="h-1 w-1 shrink-0 rounded-full bg-gold" aria-hidden="true" />
                  {c}
                </li>
              ))}
            </ul>
          </motion.div>
        ))}

        <motion.div initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.35, delay: 0.25 }} className="flex flex-col justify-between rounded-xl border border-gold-border/40 bg-surface p-5 transition-colors hover:border-gold-border/70 hover:shadow-lg">
          <div>
            <span className="flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-wider text-gold">
              <ShieldCheck size={12} aria-hidden="true" />
              Honest by design
            </span>
            <p className="mt-3 text-xs leading-5 text-foreground-secondary">
              Separate verified frameworks for MBBS, BPT, BHMS, BAMS and BASLP. Anything unverified is rendered as published: raw marks, clearly labelled.
            </p>
          </div>
          <p className="mt-4 font-mono text-[11px] font-semibold text-gold">100% GGSIPU ExamWeb compatibility</p>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="mt-10">
        <p className="text-center font-mono text-[11px] uppercase tracking-wider text-foreground-muted">Every affiliated institute</p>
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {COLLEGES.map((c) => (
            <span key={c} className="cursor-default rounded-full border border-border bg-surface px-3 py-1.5 font-mono text-xs text-foreground-secondary transition-colors hover:border-gold-border hover:text-foreground">
              {c}
            </span>
          ))}
        </div>
      </motion.div>

      {/* Circulars banner */}
      <motion.div initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4 }} className="relative mt-16 overflow-hidden rounded-2xl border border-border bg-linear-to-b from-surface via-surface to-surface-deep/90 p-5 shadow-lg transition-colors hover:border-gold-border/50 sm:p-9">
        <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-gold opacity-[0.06] blur-3xl" aria-hidden="true" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl space-y-3.5">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-gold-border/60 bg-gold/10 px-3 py-1 font-mono text-[11px] font-semibold uppercase tracking-wider text-gold">
                Live feed
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface-deep px-2.5 py-0.5 font-mono text-[10px] text-foreground-secondary">
                <Bell size={10} aria-hidden="true" />
                Synced every 15 min · ISR
              </span>
            </div>
            <h3 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">Circulars, date-sheets and notices, before the notice board.</h3>
            <p className="text-sm leading-6 text-foreground-secondary">
              Result declarations, end-term date-sheets and script-inspection schedules, straight from ipu.ac.in with keyword search and category filters.
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-1 font-mono text-xs text-foreground-secondary">
              {CIRC_CATS.map((c) => (
                <span key={c.label} className="inline-flex items-center gap-1.5 rounded-md border border-border bg-surface-deep px-2.5 py-1">
                  <span className={"h-1.5 w-1.5 rounded-full " + c.dot} aria-hidden="true" />
                  {c.label}
                </span>
              ))}
              <span className="inline-flex items-center gap-1.5 rounded-md border border-border bg-surface-deep px-2.5 py-1">
                <Search size={11} aria-hidden="true" />
                Keyword search
              </span>
            </div>
          </div>
          <div className="flex shrink-0 flex-col items-start gap-2.5 lg:items-center">
            <Link href="/notices" className="inline-flex items-center gap-2 rounded-md border border-gold bg-gold px-6 py-3 font-mono text-xs font-bold uppercase tracking-wider text-background shadow-[0_0_20px_rgba(201,169,97,0.18)] transition-all duration-150 hover:-translate-y-0.5 hover:bg-gold-bright active:scale-95">
              Browse all circulars
              <ExternalLink size={12} className="opacity-80" aria-hidden="true" />
            </Link>
            <span className="font-mono text-[10px] text-foreground-muted">No login required · Direct from ipu.ac.in</span>
          </div>
        </div>
      </motion.div>
    </section>
  );
}