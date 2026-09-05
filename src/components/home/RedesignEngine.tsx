"use client";

import { motion } from "framer-motion";
import { Award, Briefcase, Calculator, Calendar, CheckCircle2, FileDown, PieChart, TrendingUp } from "lucide-react";
import SectionHead from "./SectionHead";

const MARKS = [
  { code: "ICT-204", name: "Data Structures", cr: 4, grade: "A+", pts: 9, cls: "text-grade-excellent border-grade-excellent-border bg-grade-excellent-surface" },
  { code: "ICT-202", name: "Mathematics II", cr: 4, grade: "A", pts: 8, cls: "text-grade-good border-grade-good-border bg-grade-good-surface" },
  { code: "ICT-201", name: "Communication Skills", cr: 2, grade: "B+", pts: 7, cls: "text-grade-good border-grade-good-border bg-grade-good-surface" },
];

const CUTOFFS = ["60", "65", "70", "75"];

const TREND = [
  { l: "Sem 1", v: 7.4 }, { l: "Sem 2", v: 7.9 }, { l: "Sem 3", v: 8.2 }, { l: "Sem 4", v: 8.72 },
];

const SPLIT = [
  { l: "Internal assessment", v: 87, cls: "bg-cat-teal" },
  { l: "External examination", v: 81, cls: "bg-gold" },
];

const DIST = [
  { g: "O", c: 1, cls: "bg-grade-excellent" },
  { g: "A+", c: 3, cls: "bg-grade-excellent" },
  { g: "A", c: 5, cls: "bg-grade-good" },
  { g: "B+", c: 4, cls: "bg-grade-good" },
  { g: "B", c: 2, cls: "bg-grade-average" },
  { g: "C", c: 1, cls: "bg-grade-average" },
  { g: "P", c: 0, cls: "bg-grade-pass" },
  { g: "F", c: 0, cls: "bg-grade-fail" },
];

const DIVISIONS = [
  { label: "Exemplary Performance · CGPA 10.00, first chance in every course", awarded: false, muted: true },
  { label: "First Division · CGPA ≥ 6.50", awarded: true, muted: false },
  { label: "Second Division · CGPA 5.00–6.49", awarded: false, muted: false },
  { label: "Third Division · CGPA 4.00–4.99", awarded: false, muted: false },
];

const panel = "analytics-panel p-4 sm:p-6";
const iconBox = "rounded-md border p-1.5";

export default function RedesignEngine() {
  return (
    <section id="engine" className="w-full border-t border-border bg-surface/40">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24">
        <SectionHead
          index="01"
          kicker="The engine"
          title="Not a marks table. A reading of the ordinance."
          desc="Eight modules compute the things a marksheet never tells you, each badged verified where the ordinance is confirmed, labelled published where it is not."
        />

        <div className="mt-10 grid grid-cols-1 gap-4 lg:grid-cols-12">
          {/* Ordinance 11 computation */}
          <motion.div initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4 }} className={panel + " lg:col-span-7"}>
            <div className="flex items-center justify-between gap-3">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <span className={iconBox + " border-gold-border bg-gold-surface text-gold"}><Calculator size={14} aria-hidden="true" /></span>
                Instant SGPA &amp; CGPA
              </h3>
              <span className="font-mono text-[10px] text-foreground-muted">Sample excerpt · Ord. 11, Cl. 13</span>
            </div>
            <div className="mt-5 space-y-2">
              {MARKS.map((m) => (
                <div key={m.code} className="flex items-center justify-between gap-3 rounded-md border border-border bg-surface-deep px-3 py-2.5 font-mono text-[11px]">
                  <span className="truncate text-foreground-secondary">{m.code} · {m.name}</span>
                  <span className="flex shrink-0 items-center gap-3">
                    <span className="tnum text-foreground-muted">{m.cr} cr × {m.pts}</span>
                    <span className={"rounded border px-1.5 py-0.5 " + m.cls}>{m.grade}</span>
                  </span>
                </div>
              ))}
            </div>
            <p className="mt-4 font-mono text-[11px] leading-5 text-foreground-muted">
              SGPA = Σ (credits × grade points) / Σ credits · CGPA = cumulative across cleared semesters · % = CGPA × 10
            </p>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
              <span className="tnum font-mono text-[11px] text-foreground-secondary">Semester: <span className="text-gold-bright">8.72</span> · Cumulative: <span className="text-foreground">8.41</span> · Equivalent: <span className="text-foreground">84.1%</span></span>
              <span className="rounded border border-gold-border bg-gold-surface px-2 py-0.5 font-mono text-[10px] text-gold">VERIFIED RULE</span>
            </div>
          </motion.div>

          {/* Placement gatekeeper */}
          <motion.div initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: 0.06 }} className={panel + " lg:col-span-5"}>
            <div className="flex items-start justify-between gap-3">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <span className={iconBox + " border-gold-border bg-gold-surface text-gold"}><Briefcase size={14} aria-hidden="true" /></span>
                Placement gatekeeper
              </h3>
              <span className="shrink-0 font-mono text-[10px] text-foreground-muted">Recruitment cutoffs</span>
            </div>
            <p className="mt-2 text-xs leading-5 text-foreground-secondary">Your CGPA read against standard campus-recruitment cutoffs.</p>
            <div className="mt-4 space-y-2">
              {CUTOFFS.map((c) => (
                <div key={c} className="flex items-center justify-between rounded-md border border-border bg-surface-deep px-3 py-2.5 font-mono text-[11px]">
                  <span className="tnum text-foreground-secondary">{c}% cutoff</span>
                  <span className="flex items-center gap-1.5 text-grade-excellent">
                    <CheckCircle2 size={12} aria-hidden="true" />
                    Eligible
                  </span>
                </div>
              ))}
            </div>
            <p className="mt-4 font-mono text-[10px] text-foreground-muted">84.1% equivalent clears every standard gate.</p>
          </motion.div>

          {/* Promotion standing */}
          <motion.div initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4 }} className={panel + " lg:col-span-4"}>
            <div className="flex items-center justify-between gap-3">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <span className={iconBox + " border-grade-excellent-border bg-grade-excellent-surface text-grade-excellent"}><CheckCircle2 size={14} aria-hidden="true" /></span>
                Promotion standing
              </h3>
              <span className="font-mono text-[10px] text-foreground-muted">Cl. 11.3(v)</span>
            </div>
            <p className="mt-4 font-mono text-2xl font-bold tracking-wider text-grade-excellent sm:text-3xl">PROMOTED</p>
            <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-surface-hover">
              <div className="h-full rounded-full bg-grade-excellent" style={{ width: "78%" }} />
            </div>
            <p className="mt-2 font-mono text-[11px] text-foreground-secondary">14 / 18 annual credits · the verified 50% promotion baseline (Clause 11.3(v)).</p>
          </motion.div>

          {/* Reappear planner */}
          <motion.div initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: 0.06 }} className={panel + " lg:col-span-4"}>
            <div className="flex items-start justify-between gap-3">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <span className={iconBox + " border-cat-teal-border bg-cat-teal-surface text-cat-teal"}><Calendar size={14} aria-hidden="true" /></span>
                Reappear planner
              </h3>
              <span className="shrink-0 font-mono text-[10px] text-foreground-muted">Odd / even windows</span>
            </div>
            <p className="mt-2 text-xs leading-5 text-foreground-secondary">Backlogs mapped to the correct examination window.</p>
            <div className="mt-4 space-y-2 font-mono text-[11px]">
              <div className="rounded-md border border-border bg-surface-deep px-3 py-2.5 text-foreground-secondary">Sem 3 paper (odd) → <span className="text-cat-teal">Nov / Dec</span></div>
              <div className="rounded-md border border-border bg-surface-deep px-3 py-2.5 text-foreground-secondary">Sem 4 paper (even) → <span className="text-cat-teal">May / June</span></div>
            </div>
          </motion.div>

          {/* Division & distinction */}
          <motion.div initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: 0.12 }} className={panel + " lg:col-span-4"}>
            <div className="flex items-start justify-between gap-3">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <span className={iconBox + " border-gold-border bg-gold-surface text-gold"}><Award size={14} aria-hidden="true" /></span>
                Division classification
              </h3>
              <span className="shrink-0 font-mono text-[10px] text-foreground-muted">Ord. 11, Cl. 13</span>
            </div>
            <p className="mt-2 text-xs leading-5 text-foreground-secondary">Straight from Clause 13: no invented tiers.</p>
            <div className="mt-4 space-y-2">
              {DIVISIONS.map((d) => (
                <div
                  key={d.label}
                  className={
                    d.awarded
                      ? "rounded-md border border-gold-border bg-gold-surface px-3 py-2 font-mono text-[11px] text-gold"
                      : "rounded-md border border-border bg-surface-deep px-3 py-2 font-mono text-[11px] text-foreground-muted"
                  }
                >
                  {d.label}
                  {d.awarded ? " · standing" : ""}
                </div>
              ))}
            </div>
          </motion.div>

          {/* Semester trends */}
          <motion.div initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4 }} className={panel + " lg:col-span-6"}>
            <div className="flex items-start justify-between gap-3">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <span className={iconBox + " border-cat-blue-border bg-cat-blue-surface text-chart-cyan"}><TrendingUp size={14} aria-hidden="true" /></span>
                Semester trends
              </h3>
              <span className="shrink-0 font-mono text-[10px] text-foreground-muted">SGPA · Sem 1–4</span>
            </div>
            <div className="mt-5 flex h-24 items-end gap-3" aria-hidden="true">
              {TREND.map((t) => (
                <div key={t.l} className="flex flex-1 flex-col items-center gap-1.5">
                  <span className="tnum font-mono text-[10px] text-foreground-secondary">{t.v.toFixed(2)}</span>
                  <div className="w-full rounded-t bg-linear-to-t from-gold-dim to-gold" style={{ height: (t.v * 9) + "px" }} />
                  <span className="font-mono text-[9px] text-foreground-muted">{t.l}</span>
                </div>
              ))}
            </div>
            <div className="mt-5 space-y-2.5 border-t border-border pt-4">
              {SPLIT.map((s) => (
                <div key={s.l}>
                  <div className="flex items-center justify-between font-mono text-[10px] text-foreground-muted">
                    <span>{s.l}</span>
                    <span className="tnum">{s.v}%</span>
                  </div>
                  <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-surface-hover">
                    <div className={"h-full rounded-full " + s.cls} style={{ width: s.v + "%" }} />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Grade breakdown */}
          <motion.div initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4, delay: 0.06 }} className={panel + " lg:col-span-6"}>
            <div className="flex items-start justify-between gap-3">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <span className={iconBox + " border-cat-pink-border bg-cat-pink-surface text-cat-pink"}><PieChart size={14} aria-hidden="true" /></span>
                Grade breakdown
              </h3>
              <span className="shrink-0 font-mono text-[10px] text-foreground-muted">Grades O–F</span>
            </div>
            <div className="mt-5 space-y-2">
              {DIST.map((d) => (
                <div key={d.g} className="flex items-center gap-3 font-mono text-[10px]">
                  <span className="w-6 shrink-0 text-foreground-secondary">{d.g}</span>
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-hover">
                    <div className={"h-full rounded-full " + d.cls} style={{ width: (d.c * 20) + "%" }} />
                  </div>
                  <span className="tnum w-4 shrink-0 text-right text-foreground-muted">{d.c > 0 ? d.c : "-"}</span>
                </div>
              ))}
            </div>
            <p className="mt-4 border-t border-border pt-3 font-mono text-[10px] text-foreground-muted">
              Flagged best: Data Structures · Flagged watch: Communication Skills
            </p>
          </motion.div>

          {/* Transcript strip */}
          <motion.div initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.4 }} className={panel + " lg:col-span-12"}>
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="max-w-xl">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    <span className={iconBox + " border-cat-violet-border bg-cat-violet-surface text-cat-violet"}><FileDown size={14} aria-hidden="true" /></span>
                    Consolidated master transcript
                  </h3>
                  <span className="shrink-0 font-mono text-[10px] text-foreground-muted">Client-side</span>
                </div>
                <p className="mt-2 text-xs leading-5 text-foreground-secondary">
                  One click produces an institutional-grade, single-page transcript across every cleared semester, plus per-semester grade sheets. Generated entirely in your browser, never on a server.
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