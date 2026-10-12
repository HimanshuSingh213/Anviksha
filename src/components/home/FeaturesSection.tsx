"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { Award, Briefcase, Calculator, Calendar, CheckCircle2, FileDown, PieChart, TrendingUp, type LucideIcon } from "lucide-react";
import SectionHead from "./SectionHead";
import { PLACEMENT_CUTOFFS, SEMESTERS, TONE, buildTranscript, type Tone } from "./sample-data";
import { EligibleRow, GradeBreakdown, PlacementTrack, PromotionRing, ReappearYear, TranscriptSheet, TrendChart } from "./FeatureVisuals";

// Everything below the promotion tile comes from the same sample marksheet as the hero card.
const TRANSCRIPT = buildTranscript();
const LATEST = TRANSCRIPT[TRANSCRIPT.length - 1];
const LATEST_SUBJECTS = SEMESTERS[SEMESTERS.length - 1];
const SAMPLE_CGPA = LATEST.cgpa;
const SAMPLE_PERCENT = SAMPLE_CGPA * 10; // Cl. 13: equivalent percentage = CGPA × 10
const CUTOFFS_ASCENDING = [...PLACEMENT_CUTOFFS].sort((a, b) => a - b);
const SEMESTER_SGPAS = TRANSCRIPT.map((row) => ({ label: row.label, sgpa: row.sgpa }));

const MARK_SPLITS = [
  { label: "Internal assessment", percent: 87, color: "var(--cat-teal)" },
  { label: "External examination", percent: 81, color: "var(--gold)" },
];

const GRADE_COUNTS: { grade: string; count: number; tone: Tone }[] = [
  { grade: "O", count: 1, tone: "excellent" },
  { grade: "A+", count: 3, tone: "excellent" },
  { grade: "A", count: 5, tone: "good" },
  { grade: "B+", count: 4, tone: "good" },
  { grade: "B", count: 2, tone: "average" },
  { grade: "C", count: 1, tone: "average" },
  { grade: "P", count: 0, tone: "pass" },
  { grade: "F", count: 0, tone: "fail" },
];

const DIVISION_BANDS = [
  { label: "Exemplary Performance · CGPA 10.00, first chance in every course", isCurrentStanding: false },
  { label: "First Division · CGPA ≥ 6.50", isCurrentStanding: true },
  { label: "Second Division · CGPA 5.00–6.49", isCurrentStanding: false },
  { label: "Third Division · CGPA 4.00–4.99", isCurrentStanding: false },
];

function Tile({ span, children, className = "" }: { span: string; children: ReactNode; className?: string }) {
  return <div className={`home-panel p-6 sm:p-7 ${span} ${className}`}>{children}</div>;
}

function TileHead({ icon: Icon, title, meta, iconClass = "text-gold" }: { icon: LucideIcon; title: ReactNode; meta?: ReactNode; iconClass?: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <h3 className="flex items-center gap-2.5 text-base font-semibold text-foreground">
        <Icon size={16} className={`shrink-0 ${iconClass}`} aria-hidden="true" />
        {title}
      </h3>
      {meta ? <span className="shrink-0 pt-1 text-right font-mono text-[11px] text-foreground-muted">{meta}</span> : null}
    </div>
  );
}

export default function FeaturesSection() {
  return (
    <section id="engine" className="relative w-full">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-20">
        <SectionHead
          kicker="The engine"
          title="Not a marks table. A reading of the ordinance."
          desc="The engine computes the things a marksheet never tells you, each result badged verified where the ordinance is confirmed, labelled published where it is not."
        />

        <div className="mt-14 grid grid-cols-1 gap-4 lg:grid-cols-12">
          {/* SGPA worked example from real ordinance math */}
          <Tile span="lg:col-span-7">
            <TileHead icon={Calculator} title="Instant SGPA & CGPA" meta="Sample excerpt · Ord. 11, Cl. 13" />
            <ul className="mt-5 divide-y divide-border">
              {LATEST_SUBJECTS.map((subject, index) => (
                <li key={subject.code} className="py-3.5">
                  <div className="flex items-center justify-between gap-4 text-sm">
                    <span className="min-w-0 truncate text-foreground-secondary">
                      <span className="font-mono text-xs text-foreground-muted">{subject.code}</span>
                      <span className="mx-1.5 text-foreground-muted" aria-hidden="true">·</span>
                      {subject.name}
                    </span>
                    <span className="flex shrink-0 items-center gap-4">
                      <span className="tnum hidden font-mono text-xs text-foreground-muted sm:inline">
                        {subject.credits} cr × {subject.gradePoints} pts = {subject.credits * subject.gradePoints}
                      </span>
                      <span className={`w-10 rounded-md px-2 py-0.5 text-center text-xs font-semibold ring-1 ring-inset ${TONE[subject.tone]}`}>{subject.grade}</span>
                    </span>
                  </div>
                  <div className="mt-2.5 h-1 overflow-hidden rounded-full bg-border-strong" aria-hidden="true">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${((subject.credits * subject.gradePoints) / 40) * 100}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.9, delay: 0.15 + index * 0.1, ease: "easeOut" }}
                      className="h-full rounded-full bg-gold"
                    />
                  </div>
                </li>
              ))}
            </ul>
            <p className="mt-2 font-mono text-xs leading-5 text-foreground-muted">
              SGPA = Σ (credits × grade points) / Σ credits · CGPA = cumulative across cleared semesters · % = CGPA × 10
            </p>
            <div className="mt-6 flex flex-wrap items-end justify-between gap-x-8 gap-y-5 border-t border-border pt-6">
              <dl className="tnum grid grid-cols-3 gap-6 sm:gap-10">
                <div>
                  <dt className="font-mono text-xs text-foreground-muted">Semester</dt>
                  <dd className="mt-1.5 text-3xl font-semibold leading-none tracking-[-0.03em] text-gold-bright sm:text-4xl">{LATEST.sgpa.toFixed(2)}</dd>
                </div>
                <div>
                  <dt className="font-mono text-xs text-foreground-muted">Cumulative</dt>
                  <dd className="mt-1.5 text-3xl font-semibold leading-none tracking-[-0.03em] text-foreground sm:text-4xl">{SAMPLE_CGPA.toFixed(2)}</dd>
                </div>
                <div>
                  <dt className="font-mono text-xs text-foreground-muted">Equivalent</dt>
                  <dd className="mt-1.5 text-3xl font-semibold leading-none tracking-[-0.03em] text-foreground sm:text-4xl">{SAMPLE_PERCENT.toFixed(1)}%</dd>
                </div>
              </dl>
              <span className="rounded border border-gold-border px-2 py-1 font-mono text-[10px] font-semibold uppercase tracking-wide text-gold">Verified rule</span>
            </div>
          </Tile>

          <Tile span="lg:col-span-5" className="flex flex-col">
            <TileHead icon={Briefcase} title="Placement gatekeeper" meta="Recruitment cutoffs" />
            <p className="mt-4 text-sm leading-6 text-foreground-secondary">Your CGPA read against standard campus-recruitment cutoffs.</p>
            <PlacementTrack percent={SAMPLE_PERCENT} cutoffs={CUTOFFS_ASCENDING} />
            <ul className="mt-4 flex flex-1 flex-col divide-y divide-border border-t border-border">
              {CUTOFFS_ASCENDING.map((cutoff) => (
                <EligibleRow key={cutoff} cutoff={cutoff} margin={SAMPLE_PERCENT - cutoff} />
              ))}
            </ul>
            <p className="border-t border-border pt-4 text-xs leading-5 text-foreground-muted">
              {SAMPLE_PERCENT.toFixed(1)}% equivalent clears every standard gate · benchmarks, not university rules.
            </p>
          </Tile>

          <Tile span="lg:col-span-4" className="flex flex-col">
            <TileHead icon={CheckCircle2} iconClass="text-grade-excellent" title="Promotion standing" meta="Cl. 11.3(v)" />
            <div className="flex flex-1 flex-col items-center gap-6 py-7 text-center sm:flex-row sm:items-center sm:text-left">
              <PromotionRing percent={78} />
              <div className="min-w-0">
                <p className="font-mono text-xl font-bold tracking-wider text-grade-excellent">PROMOTED</p>
                <p className="mt-2 text-xs leading-5 text-foreground-secondary">
                  14 / 18 annual credits · the verified 50% promotion baseline (Clause 11.3(v)).
                </p>
              </div>
            </div>
            {/* 50% of 18 = 9, so 14 cleared is 5 above the line */}
            <dl className="tnum mt-auto grid grid-cols-3 gap-4 border-t border-border pt-5 text-sm">
              {[
                { label: "Offered", value: 18 },
                { label: "Needed", value: 9 },
                { label: "Cleared", value: 14 },
              ].map((item) => (
                <div key={item.label}>
                  <dt className="font-mono text-xs text-foreground-muted">{item.label}</dt>
                  <dd className="mt-1.5 text-2xl font-semibold leading-none tracking-[-0.02em] text-foreground">{item.value}</dd>
                </div>
              ))}
            </dl>
          </Tile>

          <Tile span="lg:col-span-4" className="flex flex-col">
            <TileHead icon={Calendar} iconClass="text-cat-teal" title="Reappear planner" meta="Odd / even windows" />
            <p className="mt-4 text-sm leading-6 text-foreground-secondary">Backlogs mapped to the correct examination window.</p>
            <ReappearYear />
            <ul className="mt-auto divide-y divide-border border-t border-border text-sm">
              {[
                { paper: "Sem 3 paper · odd", window: "Nov / Dec" },
                { paper: "Sem 4 paper · even", window: "May / June" },
              ].map((row) => (
                <li key={row.paper} className="flex items-center justify-between gap-3 py-2.5 text-foreground-secondary">
                  <span>{row.paper}</span>
                  <span className="font-mono text-xs font-medium text-cat-teal">{row.window}</span>
                </li>
              ))}
            </ul>
          </Tile>

          <Tile span="lg:col-span-4" className="flex flex-col">
            <TileHead icon={Award} title="Division classification" meta="Ord. 11, Cl. 13" />
            <p className="mt-4 text-sm leading-6 text-foreground-secondary">Straight from Clause 13: no invented tiers.</p>
            <ul className="mt-5 divide-y divide-border border-y border-border">
              {DIVISION_BANDS.map((band) => {
                const [name, ...rest] = band.label.split(" · ");
                return (
                  <li
                    key={band.label}
                    className={`flex items-center justify-between gap-3 py-3 ${band.isCurrentStanding ? "-mx-3 rounded-md bg-gold-surface px-3" : ""}`}
                  >
                    <span className="min-w-0">
                      <span className={`block text-sm font-medium ${band.isCurrentStanding ? "text-gold-bright" : "text-foreground-secondary"}`}>{name}</span>
                      <span className="mt-0.5 block text-xs leading-5 text-foreground-muted">{rest.join(" · ")}</span>
                    </span>
                    {band.isCurrentStanding && <span className="shrink-0 font-mono text-[10px] font-bold tracking-wider text-gold">STANDING</span>}
                  </li>
                );
              })}
            </ul>
          </Tile>

          <Tile span="lg:col-span-6">
            <TileHead
              icon={TrendingUp}
              title="Semester trends"
              meta={<span className="tnum text-grade-excellent">+{(LATEST.sgpa - TRANSCRIPT[0].sgpa).toFixed(2)} over Sem 1</span>}
            />
            <TrendChart semesters={SEMESTER_SGPAS} />
            <div className="mt-5 space-y-3 border-t border-border pt-5">
              {MARK_SPLITS.map((split) => (
                <div key={split.label} className="flex items-center gap-4 text-xs">
                  <span className="w-28 shrink-0 text-foreground-muted sm:w-36">{split.label}</span>
                  <div className="h-1 flex-1 overflow-hidden rounded-full bg-border-strong">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${split.percent}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.9, ease: "easeOut" }}
                      className="h-full rounded-full"
                      style={{ background: split.color }}
                    />
                  </div>
                  <span className="tnum w-8 shrink-0 text-right font-mono text-foreground-secondary">{split.percent}%</span>
                </div>
              ))}
            </div>
          </Tile>

          <Tile span="lg:col-span-6">
            <TileHead
              icon={PieChart}
              iconClass="text-foreground-secondary"
              title="Grade breakdown"
              meta={`${GRADE_COUNTS.reduce((sum, entry) => sum + entry.count, 0)} subjects · O–F`}
            />
            <GradeBreakdown counts={GRADE_COUNTS} />
            <p className="mt-4 border-t border-border pt-4 text-xs leading-5 text-foreground-muted">
              Flagged best: Data Structures · Flagged watch: Communication Skills
            </p>
          </Tile>

          <Tile span="lg:col-span-12">
            <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
              <div className="max-w-xl">
                <TileHead icon={FileDown} title="Grade sheets & master transcript" meta="Client-side" />
                <p className="mt-5 text-base leading-7 text-foreground-secondary">
                  Per-semester grade sheets plus a single-page transcript across every cleared semester. Generated entirely in your browser, never on a server.
                </p>
                <ul className="mt-6 space-y-2.5 text-sm text-foreground-secondary">
                  {["Per-semester grade sheets", "All semesters, one page", "Marked unofficial, by design"].map((item) => (
                    <li key={item} className="flex items-center gap-2.5">
                      <CheckCircle2 size={15} className="shrink-0 text-gold" aria-hidden="true" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <TranscriptSheet />
            </div>
          </Tile>
        </div>
      </div>
    </section>
  );
}
