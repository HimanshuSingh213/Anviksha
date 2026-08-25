"use client";

import { motion } from "framer-motion";
import { CheckCircle2, ShieldCheck } from "lucide-react";

const METRICS = [
  { label: "CGPA", value: "8.42", accent: "text-cat-violet", bg: "bg-cat-violet-surface", border: "border-cat-violet-border" },
  { label: "SGPA · Sem 6", value: "8.71", accent: "text-cat-teal", bg: "bg-cat-teal-surface", border: "border-cat-teal-border" },
  { label: "Credits", value: "142/160", accent: "text-cat-blue", bg: "bg-cat-blue-surface", border: "border-cat-blue-border" },
];

const TREND = [7.2, 7.6, 7.9, 8.1, 8.4, 8.71];

const GRADES: { label: string; cls: string }[] = [
  { label: "O", cls: "text-grade-excellent bg-grade-excellent-surface border-grade-excellent-border" },
  { label: "A+", cls: "text-grade-excellent bg-grade-excellent-surface border-grade-excellent-border" },
  { label: "A", cls: "text-grade-good bg-grade-good-surface border-grade-good-border" },
  { label: "B+", cls: "text-grade-good bg-grade-good-surface border-grade-good-border" },
  { label: "B", cls: "text-grade-average bg-grade-average-surface border-grade-average-border" },
];

const MAX_GPA = 10;
const BAR_WIDTH = 24;
const BAR_GAP = 10;
const CHART_HEIGHT = 56;

export default function HeroDashboardPreview() {
  return (
    <div
      role="region"
      aria-label="GGSIPU Academic Result and Dashboard Preview"
      className="relative mx-auto w-full max-w-sm lg:max-w-md lg:mx-0"
    >
      {/* Ambient background glow */}
      <div
        className="absolute -inset-6 -z-10 rounded-full bg-gold opacity-[0.14] blur-3xl"
        aria-hidden="true"
      />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="analytics-panel p-4 sm:p-5 shadow-[0_20px_60px_rgba(0,0,0,0.5)] backdrop-blur-xl"
      >
        {/* Window chrome */}
        <div className="mb-4 flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-1.5" aria-hidden="true">
            <span className="h-2 w-2 rounded-full bg-grade-fail/80" />
            <span className="h-2 w-2 rounded-full bg-grade-average/80" />
            <span className="h-2 w-2 rounded-full bg-grade-excellent/80" />
          </div>
          <span className="font-mono text-[10px] text-foreground-secondary">anviksha.app/dashboard</span>
        </div>

        {/* Student row */}
        <div className="mb-4 flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">Semester 6 · CSE</p>
            <p className="font-mono text-[11px] text-foreground-secondary truncate">B.Tech · 2022–26 Batch</p>
          </div>
          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-grade-excellent-border bg-grade-excellent-surface px-2.5 py-1 font-mono text-[10px] font-bold text-grade-excellent shadow-xs">
            <CheckCircle2 size={11} aria-hidden="true" />
            <span>Eligible</span>
          </span>
        </div>

        {/* Metric cards */}
        <div className="mb-4 grid grid-cols-3 gap-2">
          {METRICS.map((m) => (
            <div key={m.label} className={`rounded-md border p-2.5 ${m.bg} ${m.border}`}>
              <p className={`font-mono text-base font-bold leading-none tracking-tight ${m.accent}`}>
                {m.value}
              </p>
              <p className="mt-1.5 truncate font-mono text-[10px] uppercase tracking-wide text-foreground-secondary">
                {m.label}
              </p>
            </div>
          ))}
        </div>

        {/* Trend chart */}
        <div className="mb-4 rounded-md border border-border bg-surface-deep p-3">
          <div className="mb-2.5 flex items-center justify-between">
            <span className="font-mono text-[10px] uppercase tracking-wider text-foreground-secondary">
              SGPA Trend
            </span>
            <span className="font-mono text-[10px] font-bold text-grade-excellent">
              +0.34 this sem
            </span>
          </div>
          <svg
            viewBox={`0 0 ${TREND.length * (BAR_WIDTH + BAR_GAP)} ${CHART_HEIGHT}`}
            preserveAspectRatio="none"
            className="h-14 w-full"
            aria-hidden="true"
          >
            {TREND.map((v, i) => {
              const h = (v / MAX_GPA) * CHART_HEIGHT;
              const isLast = i === TREND.length - 1;
              return (
                <rect
                  key={i}
                  x={i * (BAR_WIDTH + BAR_GAP)}
                  y={CHART_HEIGHT - h}
                  width={BAR_WIDTH}
                  height={h}
                  rx={3}
                  className={isLast ? "fill-gold" : "fill-cat-blue/50"}
                />
              );
            })}
          </svg>
        </div>

        {/* Grade strip */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[10px] font-mono text-foreground-secondary mr-1">Grades:</span>
          {GRADES.map((g) => (
            <span
              key={g.label}
              className={`rounded px-2 py-0.5 font-mono text-[10px] font-bold border ${g.cls}`}
            >
              {g.label}
            </span>
          ))}
        </div>
      </motion.div>

      {/* Floating Ambient Badge 1 */}
      <motion.span
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: [0, -5, 0] }}
        transition={{
          opacity: { delay: 0.3, duration: 0.5 },
          y: { repeat: Infinity, duration: 4, ease: "easeInOut", delay: 0.3 },
        }}
        className="absolute -top-3.5 -right-3 hidden rounded-lg border border-grade-excellent-border bg-grade-excellent-surface px-3 py-1 font-mono text-[11px] font-bold text-grade-excellent shadow-lg backdrop-blur-md sm:flex items-center gap-1.5"
      >
        <CheckCircle2 size={12} aria-hidden="true" />
        <span>0 Active Backlogs</span>
      </motion.span>

      {/* Floating Ambient Badge 2 */}
      <motion.span
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: [0, -5, 0] }}
        transition={{
          opacity: { delay: 0.5, duration: 0.5 },
          y: { repeat: Infinity, duration: 4.5, ease: "easeInOut", delay: 0.5 },
        }}
        className="absolute -bottom-3.5 -left-3 hidden rounded-lg border border-cat-blue-border bg-cat-blue-surface px-3 py-1 font-mono text-[11px] font-bold text-chart-cyan shadow-lg backdrop-blur-md sm:flex items-center gap-1.5"
      >
        <ShieldCheck size={12} aria-hidden="true" />
        <span>50% Credit Rule Passed</span>
      </motion.span>
    </div>
  );
}
