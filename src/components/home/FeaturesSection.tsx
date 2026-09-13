"use client";

import { motion } from "framer-motion";
import { Award, Briefcase, Calculator, Calendar, CheckCircle2, FileDown, PieChart, TrendingUp } from "lucide-react";
import SectionHead from "./SectionHead";

const SAMPLE_SUBJECTS = [
  { code: "ICT-204", name: "Data Structures", credits: 4, grade: "A+", gradePoints: 9, gradeStyle: "text-grade-excellent border-grade-excellent-border bg-grade-excellent-surface" },
  { code: "ICT-202", name: "Mathematics II", credits: 4, grade: "A", gradePoints: 8, gradeStyle: "text-grade-good border-grade-good-border bg-grade-good-surface" },
  { code: "ICT-201", name: "Communication Skills", credits: 2, grade: "B+", gradePoints: 7, gradeStyle: "text-grade-good border-grade-good-border bg-grade-good-surface" },
];

const SAMPLE_CGPA = 8.41;
const SAMPLE_PERCENT = SAMPLE_CGPA * 10; // Cl. 13: equivalent percentage = CGPA × 10
const PLACEMENT_CUTOFFS = [60, 65, 70, 75];

const SEMESTER_SGPAS = [
  { label: "Sem 1", sgpa: 7.4 },
  { label: "Sem 2", sgpa: 7.9 },
  { label: "Sem 3", sgpa: 8.2 },
  { label: "Sem 4", sgpa: 8.72 },
];

const MARK_SPLITS = [
  { label: "Internal assessment", percent: 87, barColor: "bg-cat-teal" },
  { label: "External examination", percent: 81, barColor: "bg-gold" },
];

const GRADE_COUNTS = [
  { grade: "O", count: 1, barColor: "bg-grade-excellent", chipStyle: "border-grade-excellent-border bg-grade-excellent-surface text-grade-excellent" },
  { grade: "A+", count: 3, barColor: "bg-grade-excellent", chipStyle: "border-grade-excellent-border bg-grade-excellent-surface text-grade-excellent" },
  { grade: "A", count: 5, barColor: "bg-grade-good", chipStyle: "border-grade-good-border bg-grade-good-surface text-grade-good" },
  { grade: "B+", count: 4, barColor: "bg-grade-good", chipStyle: "border-grade-good-border bg-grade-good-surface text-grade-good" },
  { grade: "B", count: 2, barColor: "bg-grade-average", chipStyle: "border-grade-average-border bg-grade-average-surface text-grade-average" },
  { grade: "C", count: 1, barColor: "bg-grade-average", chipStyle: "border-grade-average-border bg-grade-average-surface text-grade-average" },
  { grade: "P", count: 0, barColor: "bg-grade-pass", chipStyle: "border-grade-pass-border bg-grade-pass-surface text-grade-pass" },
  { grade: "F", count: 0, barColor: "bg-grade-fail", chipStyle: "border-grade-fail-border bg-grade-fail-surface text-grade-fail" },
];

const DIVISION_BANDS = [
  { label: "Exemplary Performance · CGPA 10.00, first chance in every course", isCurrentStanding: false },
  { label: "First Division · CGPA ≥ 6.50", isCurrentStanding: true },
  { label: "Second Division · CGPA 5.00–6.49", isCurrentStanding: false },
  { label: "Third Division · CGPA 4.00–4.99", isCurrentStanding: false },
];

const panelClass = "analytics-panel p-4 sm:p-6";
const iconBoxClass = "rounded-md border p-1.5";

function TrendChart({ semesters }: { semesters: typeof SEMESTER_SGPAS }) {
  const latestIndex = semesters.length - 1;

  return (
    <div className="mt-5">
      <div className="relative h-28">
        <div className="absolute inset-0 flex flex-col justify-between" aria-hidden="true">
          {[0, 1, 2, 3].map((lineIndex) => (
            <div key={lineIndex} className="border-t border-dashed border-border/60" />
          ))}
        </div>

        <div className="absolute inset-0 flex items-end gap-2 sm:gap-3">
          {semesters.map((semester, index) => (
            <div
              key={semester.label}
              className="group flex h-full flex-1 flex-col items-center justify-end"
              title={`${semester.label}: SGPA ${semester.sgpa.toFixed(2)}`}
            >
              <span className="tnum mb-1 font-mono text-[10px] text-foreground-muted transition-colors group-hover:text-gold-bright">
                {semester.sgpa.toFixed(2)}
              </span>
              <motion.div
                initial={{ height: 0 }}
                whileInView={{ height: `${(semester.sgpa / 10) * 100}%` }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: index * 0.08, ease: "easeOut" }}
                className={
                  index === latestIndex
                    ? "w-full max-w-9 rounded-t bg-linear-to-t from-gold-dim via-gold/85 to-gold-bright shadow-[0_0_18px_rgba(201,169,97,0.25)]"
                    : "w-full max-w-9 rounded-t bg-linear-to-t from-gold-dim/40 to-gold-dim transition-colors group-hover:to-gold/70"
                }
              />
            </div>
          ))}
        </div>
      </div>

      <div className="mt-2 flex gap-2 border-t border-border pt-2 sm:gap-3">
        {semesters.map((semester, index) => (
          <span key={semester.label} className={`flex-1 text-center font-mono text-[9px] ${index === latestIndex ? "text-gold" : "text-foreground-muted"}`}>
            {semester.label.replace("Sem ", "S")}
          </span>
        ))}
      </div>
    </div>
  );
}

function GradeBars({ counts }: { counts: typeof GRADE_COUNTS }) {
  const biggestCount = Math.max(...counts.map((entry) => entry.count));

  return (
    <div className="mt-5 space-y-2">
      {counts.map((entry, index) => (
        <div key={entry.grade} className="group flex items-center gap-3 font-mono text-[10px]">
          <span className={`w-8 shrink-0 rounded border px-1 py-0.5 text-center font-bold transition-transform group-hover:scale-105 ${entry.chipStyle}`}>
            {entry.grade}
          </span>
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface-hover">
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: `${(entry.count / biggestCount) * 100}%` }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.04, ease: "easeOut" }}
              className={"h-full rounded-full " + entry.barColor}
            />
          </div>
          <span className="tnum w-4 shrink-0 text-right text-foreground-muted transition-colors group-hover:text-foreground-secondary">
            {entry.count > 0 ? entry.count : "0"}
          </span>
        </div>
      ))}
    </div>
  );
}

function PromotionBar({ percent }: { percent: number }) {
  return (
    <div className="relative mt-3 h-1.5 w-full overflow-hidden rounded-full bg-surface-hover">
      <motion.div
        initial={{ width: 0 }}
        whileInView={{ width: `${percent}%` }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="h-full rounded-full bg-grade-excellent"
      />
      {/* the 50% ordinance threshold sits at the middle of the track */}
      <span className="absolute inset-y-0 left-1/2 w-px bg-foreground/60" aria-hidden="true" />
    </div>
  );
}

export default function FeaturesSection() {
  return (
    <section id="engine" className="w-full border-t border-border bg-surface/40">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24">
        <SectionHead
          index="01"
          kicker="The engine"
          title="Not a marks table. A reading of the ordinance."
          desc="The engine computes the things a marksheet never tells you, each result badged verified where the ordinance is confirmed, labelled published where it is not."
        />

        <div className="mt-10 grid grid-cols-1 gap-4 lg:grid-cols-12">
          {/* SGPA worked example from real ordinance math */}
          <motion.div initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4 }} className={panelClass + " lg:col-span-7"}>
            <div className="flex items-center justify-between gap-3">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <span className={iconBoxClass + " border-gold-border bg-gold-surface text-gold"}><Calculator size={14} aria-hidden="true" /></span>
                Instant SGPA &amp; CGPA
              </h3>
              <span className="font-mono text-[10px] text-foreground-muted">Sample excerpt · Ord. 11, Cl. 13</span>
            </div>
            <div className="mt-5 space-y-2">
              {SAMPLE_SUBJECTS.map((subject) => (
                <div key={subject.code} className="flex items-center justify-between gap-3 rounded-md border border-border bg-surface-deep px-3 py-2.5 font-mono text-[11px] transition-colors hover:border-border-strong hover:bg-surface">
                  <span className="truncate text-foreground-secondary">{subject.code} · {subject.name}</span>
                  <span className="flex shrink-0 items-center gap-3">
                    <span className="tnum text-foreground-muted">{subject.credits} cr × {subject.gradePoints} pts</span>
                    <span className={"rounded border px-1.5 py-0.5 font-bold " + subject.gradeStyle}>{subject.grade}</span>
                  </span>
                </div>
              ))}
            </div>
            <p className="mt-4 font-mono text-[11px] leading-5 text-foreground-muted">
              SGPA = Σ (credits × grade points) / Σ credits · CGPA = cumulative across cleared semesters · % = CGPA × 10
            </p>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
              <span className="tnum font-mono text-[11px] text-foreground-secondary">
                Semester: <span className="text-gold-bright">8.72</span> · Cumulative: <span className="text-foreground">{SAMPLE_CGPA.toFixed(2)}</span> · Equivalent: <span className="text-foreground">{SAMPLE_PERCENT.toFixed(1)}%</span>
              </span>
              <span className="rounded border border-gold-border bg-gold-surface px-2 py-0.5 font-mono text-[10px] text-gold">VERIFIED RULE</span>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: 0.06 }} className={panelClass + " lg:col-span-5"}>
            <div className="flex items-start justify-between gap-3">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <span className={iconBoxClass + " border-gold-border bg-gold-surface text-gold"}><Briefcase size={14} aria-hidden="true" /></span>
                Placement gatekeeper
              </h3>
              <span className="shrink-0 font-mono text-[10px] text-foreground-muted">Recruitment cutoffs</span>
            </div>
            <p className="mt-2 text-xs leading-5 text-foreground-secondary">Your CGPA read against standard campus-recruitment cutoffs.</p>
            <div className="mt-4 space-y-2">
              {PLACEMENT_CUTOFFS.map((cutoffPercent) => (
                <div key={cutoffPercent} className="flex items-center justify-between gap-3 rounded-md border border-border bg-surface-deep px-3 py-2.5 font-mono text-[11px] transition-colors hover:border-grade-excellent-border/70">
                  <span className="tnum text-foreground-secondary">≥ {cutoffPercent}%</span>
                  <span className="flex items-center gap-2">
                    <span className="tnum text-[10px] text-foreground-muted">+{(SAMPLE_PERCENT - cutoffPercent).toFixed(1)} pts</span>
                    <span className="flex items-center gap-1 text-grade-excellent">
                      <CheckCircle2 size={12} aria-hidden="true" />
                      Eligible
                    </span>
                  </span>
                </div>
              ))}
            </div>
            <p className="mt-4 border-t border-border pt-3 font-mono text-[10px] text-foreground-muted">
              {SAMPLE_PERCENT.toFixed(1)}% equivalent clears every standard gate · benchmarks, not university rules.
            </p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4 }} className={panelClass + " lg:col-span-4"}>
            <div className="flex items-center justify-between gap-3">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <span className={iconBoxClass + " border-grade-excellent-border bg-grade-excellent-surface text-grade-excellent"}><CheckCircle2 size={14} aria-hidden="true" /></span>
                Promotion standing
              </h3>
              <span className="font-mono text-[10px] text-foreground-muted">Cl. 11.3(v)</span>
            </div>
            <div className="mt-4 flex items-baseline justify-between gap-3">
              <p className="font-mono text-2xl font-bold tracking-wider text-grade-excellent sm:text-3xl">PROMOTED</p>
              <p className="tnum font-mono text-sm text-foreground-secondary">78%</p>
            </div>
            <PromotionBar percent={78} />
            <p className="mt-2 font-mono text-[11px] text-foreground-secondary">
              14 / 18 annual credits · the verified 50% promotion baseline (Clause 11.3(v)).
            </p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: 0.06 }} className={panelClass + " lg:col-span-4"}>
            <div className="flex items-start justify-between gap-3">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <span className={iconBoxClass + " border-cat-teal-border bg-cat-teal-surface text-cat-teal"}><Calendar size={14} aria-hidden="true" /></span>
                Reappear planner
              </h3>
              <span className="shrink-0 font-mono text-[10px] text-foreground-muted">Odd / even windows</span>
            </div>
            <p className="mt-2 text-xs leading-5 text-foreground-secondary">Backlogs mapped to the correct examination window.</p>
            <div className="mt-4 space-y-2 font-mono text-[11px]">
              <div className="flex items-center justify-between gap-3 rounded-md border border-border bg-surface-deep px-3 py-2.5 text-foreground-secondary transition-colors hover:border-cat-teal-border/70">
                <span>Sem 3 paper · odd</span>
                <span className="rounded border border-cat-teal-border bg-cat-teal-surface px-1.5 py-0.5 text-cat-teal">Nov / Dec</span>
              </div>
              <div className="flex items-center justify-between gap-3 rounded-md border border-border bg-surface-deep px-3 py-2.5 text-foreground-secondary transition-colors hover:border-cat-teal-border/70">
                <span>Sem 4 paper · even</span>
                <span className="rounded border border-cat-teal-border bg-cat-teal-surface px-1.5 py-0.5 text-cat-teal">May / June</span>
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: 0.12 }} className={panelClass + " lg:col-span-4"}>
            <div className="flex items-start justify-between gap-3">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <span className={iconBoxClass + " border-gold-border bg-gold-surface text-gold"}><Award size={14} aria-hidden="true" /></span>
                Division classification
              </h3>
              <span className="shrink-0 font-mono text-[10px] text-foreground-muted">Ord. 11, Cl. 13</span>
            </div>
            <p className="mt-2 text-xs leading-5 text-foreground-secondary">Straight from Clause 13: no invented tiers.</p>
            <div className="mt-4 space-y-2">
              {DIVISION_BANDS.map((band) => (
                <div
                  key={band.label}
                  className={
                    band.isCurrentStanding
                      ? "flex items-center justify-between gap-2 rounded-md border border-gold-border bg-gold-surface px-3 py-2 font-mono text-[11px] text-gold"
                      : "flex items-center justify-between gap-2 rounded-md border border-border bg-surface-deep px-3 py-2 font-mono text-[11px] text-foreground-muted"
                  }
                >
                  <span className="truncate">{band.label}</span>
                  {band.isCurrentStanding && <span className="shrink-0 font-bold tracking-wider">STANDING</span>}
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4 }} className={panelClass + " lg:col-span-6"}>
            <div className="flex items-start justify-between gap-3">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <span className={iconBoxClass + " border-cat-blue-border bg-cat-blue-surface text-chart-cyan"}><TrendingUp size={14} aria-hidden="true" /></span>
                Semester trends
              </h3>
              <span className="shrink-0 rounded border border-grade-excellent-border bg-grade-excellent-surface px-1.5 py-0.5 font-mono text-[10px] text-grade-excellent">
                +{(SEMESTER_SGPAS[SEMESTER_SGPAS.length - 1].sgpa - SEMESTER_SGPAS[0].sgpa).toFixed(2)} over Sem 1
              </span>
            </div>
            <TrendChart semesters={SEMESTER_SGPAS} />
            <div className="mt-4 space-y-2.5 border-t border-border pt-4">
              {MARK_SPLITS.map((split) => (
                <div key={split.label} className="group flex items-center gap-3">
                  <span className="w-40 shrink-0 font-mono text-[10px] text-foreground-muted">{split.label}</span>
                  <div className="h-1 flex-1 overflow-hidden rounded-full bg-surface-hover">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${split.percent}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.7, ease: "easeOut" }}
                      className={"h-full rounded-full " + split.barColor}
                    />
                  </div>
                  <span className="tnum w-8 shrink-0 text-right font-mono text-[10px] text-foreground-secondary">{split.percent}%</span>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: 0.06 }} className={panelClass + " lg:col-span-6"}>
            <div className="flex items-start justify-between gap-3">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <span className={iconBoxClass + " border-cat-pink-border bg-cat-pink-surface text-cat-pink"}><PieChart size={14} aria-hidden="true" /></span>
                Grade breakdown
              </h3>
              <span className="shrink-0 font-mono text-[10px] text-foreground-muted">
                {GRADE_COUNTS.reduce((sum, entry) => sum + entry.count, 0)} subjects · O–F
              </span>
            </div>
            <GradeBars counts={GRADE_COUNTS} />
            <p className="mt-4 border-t border-border pt-3 font-mono text-[10px] text-foreground-muted">
              Flagged best: Data Structures · Flagged watch: Communication Skills
            </p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4 }} className={panelClass + " lg:col-span-12"}>
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="max-w-xl">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    <span className={iconBoxClass + " border-cat-violet-border bg-cat-violet-surface text-cat-violet"}><FileDown size={14} aria-hidden="true" /></span>
                    Consolidated master transcript
                  </h3>
                  <span className="shrink-0 font-mono text-[10px] text-foreground-muted">Client-side</span>
                </div>
                <p className="mt-2 text-xs leading-5 text-foreground-secondary">
                  One click produces a single-page transcript across every cleared semester, plus per-semester grade sheets. Generated entirely in your browser, never on a server.
                </p>
              </div>
              <ul className="shrink-0 space-y-1.5 font-mono text-[11px] text-foreground-secondary">
                <li className="flex items-center gap-1.5"><span className="h-1 w-1 rounded-full bg-gold" aria-hidden="true" />Marked unofficial, by design</li>
                <li className="flex items-center gap-1.5"><span className="h-1 w-1 rounded-full bg-gold" aria-hidden="true" />All semesters, one page</li>
                <li className="flex items-center gap-1.5"><span className="h-1 w-1 rounded-full bg-gold" aria-hidden="true" />Client-side PDF export</li>
              </ul>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
