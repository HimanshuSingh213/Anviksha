"use client";

import Link from "next/link";
import { useEffect, useState, type KeyboardEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, Search, ShieldCheck } from "lucide-react";
import SectionHead from "./SectionHead";

interface Notice { title: string; url: string; }
interface Props { notices?: Notice[]; }

const STREAMS = [
  { category: "Engineering & Tech", badge: "B.Tech · BCA · MCA", accent: "var(--chart-cyan)", courses: ["B.Tech (CSE, IT, ECE, AI/ML, Mech, EE)", "BCA", "MCA (SE)", "M.Tech"] },
  { category: "Business & Management", badge: "BBA · MBA · B.Com", accent: "var(--gold)", courses: ["BBA (General & Banking)", "MBA (All Specs)", "B.Com (Hons)", "B.A. Economics (Hons)"] },
  { category: "Law & Legal Studies", badge: "BA LLB · BBA LLB", accent: "var(--cat-violet)", courses: ["BA LLB (Hons)", "BBA LLB (Hons)", "LLM (Corporate & Cyber)"] },
  { category: "Medical & Allied Health", badge: "B.Sc · BPT · B.Pharm", accent: "var(--grade-excellent)", courses: ["B.Sc Nursing", "BPT (Physiotherapy)", "B.Pharm", "BMLT", "BOT"] },
  { category: "Media & Humanities", badge: "BA JMC · B.Ed · B.Voc", accent: "var(--cat-pink)", courses: ["BA (Journalism & Mass Comm)", "B.Ed", "B.Voc (Applied Tech)", "Design"] },
];

const COLLEGES = ["USICT", "MAIT", "MSIT", "BVCOE", "BPIT", "GTBIT", "VIPS", "ADGITM", "JIMS", "DTC", "GNDIT", "MERI", "HMRITM", "CPJ-CHS", "IITM", "BCIPS", "TIIPS", "FIMT", "IINTM", "+ 35 more"];

const CIRC_CATS = [
  { label: "Results declared", dot: "bg-grade-excellent" },
  { label: "Date sheets", dot: "bg-chart-cyan" },
  { label: "Inspection schedules", dot: "bg-gold" },
];

export default function CoverageSection({ notices = [] }: Props) {
  const [active, setActive] = useState(0);
  const stream = STREAMS[active];
  const feed = notices.slice(0, 5);

  // Auto-rotate every 2 seconds, looping back to the first stream.
  // Restarts after every change, so a click resets the wait.
  useEffect(() => {
    const timer = setTimeout(() => {
      setActive((prev) => (prev + 1) % STREAMS.length);
    }, 2000);
    return () => clearTimeout(timer);
  }, [active]);

  return (
    <section id="coverage" className="relative w-full border-y border-border bg-surface/40">
      <div className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 sm:py-20">
        <SectionHead
          kicker="Universal coverage"
          title="One portal for every programme on ExamWeb."
          desc="If your result is declared on the GGSIPU server, Anviksha renders it in full, applying the right ordinance for your programme. Where a rule is not verified yet, we show marks as published and say so. Never a guessed number."
        />

        {/* Stream explorer */}
        <div className="mt-14 grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
          <div
            role="tablist"
            aria-orientation="vertical"
            aria-label="Programme streams"
            className="flex flex-col gap-1"
          >
            {STREAMS.map((item, index) => {
              const isSelected = index === active;
              return (
                <button
                  key={item.category}
                  id={`stream-tab-${index}`}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  aria-controls="stream-panel"
                  tabIndex={isSelected ? 0 : -1}
                  onClick={() => setActive(index)}
                  className="group relative rounded-lg px-4 py-3.5 text-left"
                >
                  {isSelected && (
                    <motion.span
                      layoutId="home-stream-pill"
                      transition={{ duration: 0.35, ease: "easeOut" }}
                      className="absolute inset-0 rounded-lg border border-border-strong bg-surface-elevated"
                      aria-hidden="true"
                    />
                  )}
                  <span className="relative flex items-center gap-4">
                    <span
                      className={`size-2 shrink-0 rounded-full transition-opacity ${isSelected ? "" : "opacity-40"}`}
                      style={{ background: item.accent }}
                      aria-hidden="true"
                    />
                    <span className="min-w-0">
                      <span className={`block text-[15px] font-medium transition-colors ${isSelected ? "text-foreground" : "text-foreground-secondary group-hover:text-foreground"}`}>
                        {item.category}
                      </span>
                      <span className="mt-0.5 block font-mono text-[11px] text-foreground-muted">{item.badge}</span>
                    </span>
                  </span>
                </button>
              );
            })}
          </div>

          <div id="stream-panel" role="tabpanel" aria-labelledby={`stream-tab-${active}`} className="home-panel min-h-80 p-7 sm:p-10">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={active}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                <p className="font-mono text-xs text-foreground-muted">{stream.category}</p>
                <p className="mt-3 text-3xl font-semibold leading-tight tracking-[-0.03em] sm:text-4xl" style={{ color: stream.accent }}>
                  {stream.badge}
                </p>
                <ul className="mt-8 grid gap-x-10 border-t border-border sm:grid-cols-2">
                  {stream.courses.map((course, index) => (
                    <motion.li
                      key={course}
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.35, delay: 0.06 + index * 0.04, ease: "easeOut" }}
                      className="flex items-center gap-3 border-b border-border py-3.5 text-sm text-foreground-secondary"
                    >
                      <span className="size-1.5 shrink-0 rounded-full" style={{ background: stream.accent }} aria-hidden="true" />
                      {course}
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Honest by design */}
        <div className="home-panel mt-4 flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:justify-between sm:gap-10 sm:p-7">
          <div>
            <h3 className="flex items-center gap-2.5 text-base font-semibold text-foreground">
              <ShieldCheck size={16} className="shrink-0 text-gold" aria-hidden="true" />
              Honest by design
            </h3>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-foreground-secondary">
              Separate verified frameworks for MBBS, BPT, BHMS, BAMS and BASLP. Anything unverified is rendered as published, with raw marks clearly labelled.
            </p>
          </div>
          <p className="shrink-0 font-mono text-xs font-semibold text-gold">100% GGSIPU ExamWeb compatibility</p>
        </div>

        {/* Institutes */}
        <div className="mt-16">
          <p className="font-mono text-xs text-foreground-muted">Every affiliated institute</p>
          <ul className="mt-5 flex flex-wrap gap-2">
            {COLLEGES.map((name, index) => (
              <li
                key={name}
                className={`rounded-md border px-3 py-1.5 font-mono text-xs ${
                  index === COLLEGES.length - 1 ? "border-gold-border text-gold" : "border-border-strong text-foreground-secondary"
                }`}
              >
                {name}
              </li>
            ))}
          </ul>
        </div>

        {/* Circulars */}
        <div className="home-panel mt-16 p-6 sm:p-10">
          <div className="grid gap-10 lg:grid-cols-[1fr_0.9fr] lg:items-center lg:gap-14">
            <div>
              <p className="flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-xs">
                <span className="font-semibold text-gold">Live feed</span>
                <span className="text-foreground-muted">Synced every 15 min · ISR</span>
              </p>
              <h3 className="mt-5 text-2xl font-semibold leading-tight tracking-tight text-foreground text-balance sm:text-3xl">
                Circulars, date-sheets and notices, before the notice board.
              </h3>
              <p className="mt-4 max-w-lg text-base leading-7 text-foreground-secondary">
                Result declarations, end-term date-sheets and script-inspection schedules, straight from ipu.ac.in with keyword search and category filters.
              </p>
              <ul className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-foreground-secondary">
                {CIRC_CATS.map((category) => (
                  <li key={category.label} className="inline-flex items-center gap-2">
                    <span className={`size-1.5 rounded-full ${category.dot}`} aria-hidden="true" />
                    {category.label}
                  </li>
                ))}
                <li className="inline-flex items-center gap-2">
                  <Search size={12} aria-hidden="true" />
                  Keyword search
                </li>
              </ul>
              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
                <Link href="/notices" className="group inline-flex items-center justify-center gap-2 rounded-md border border-gold-bright/40 bg-linear-to-b from-gold-bright to-gold px-6 py-3 font-mono text-[13px] font-semibold whitespace-nowrap text-background shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_1px_2px_rgba(0,0,0,0.5)] transition-[filter,transform,color,border-color] duration-200 hover:brightness-110 active:scale-[0.98]">
                  Browse all circulars
                  <ArrowUpRight size={14} aria-hidden="true" className="transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </Link>
                <span className="text-xs text-foreground-muted">No login required · Direct from ipu.ac.in</span>
              </div>
            </div>

            {feed.length > 0 && (
              <ul className="divide-y divide-border border-y border-border" aria-label="Latest circulars">
                {feed.map((notice, index) => (
                  <li key={`${index}-${notice.title}`}>
                    <a
                      href={notice.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex items-start gap-3 py-4 text-sm leading-6 text-foreground-secondary transition-colors hover:text-foreground"
                    >
                      <span className="min-w-0 flex-1">{notice.title}</span>
                      <ArrowUpRight size={14} className="mt-1.5 shrink-0 text-foreground-muted transition-colors group-hover:text-gold" aria-hidden="true" />
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
