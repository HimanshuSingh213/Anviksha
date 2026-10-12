"use client";

import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { TONE_COLOR, type Tone } from "./sample-data";
import { buildTranscript } from "./sample-data";

/* Drawn-on-view charts: flat fills, no glow. Motion is only the draw itself. */

/* ───────────── Semester trend: line over an honest 6–9 axis ───────────── */

interface TrendPoint { label: string; sgpa: number; }

interface Pt { x: number; y: number; }

/**
 * Straight line through the points. Same shape every render, so it can animate.
 */
function lineThrough(points: Pt[]): string {
  return points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
}

const TREND = { w: 480, h: 220, padLeft: 34, padRight: 18, padTop: 26, padBottom: 30, inset: 30, min: 6, max: 9 };
const TREND_TICKS = [6, 7, 8, 9];

export function TrendChart({ semesters }: { semesters: TrendPoint[] }) {
  const { w, h, padLeft, padRight, padTop, padBottom, inset, min, max } = TREND;
  // `inset` keeps the first and last points (and their labels) clear of the axis numbers and the right edge.
  const x = (index: number) => padLeft + inset + (index * (w - padLeft - padRight - inset * 2)) / (semesters.length - 1);
  const y = (value: number) => padTop + (1 - (value - min) / (max - min)) * (h - padTop - padBottom);
  const points: Pt[] = semesters.map((semester, index) => ({ x: x(index), y: y(semester.sgpa) }));
  const baseline = h - padBottom;
  const latest = semesters.length - 1;

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className="mt-6 h-auto w-full overflow-visible"
      role="img"
      aria-label={`SGPA by semester: ${semesters.map((s) => `${s.label} ${s.sgpa.toFixed(2)}`).join(", ")}`}
    >
      <defs>
        <linearGradient id="home-trend-area" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--gold)" stopOpacity="0.22" />
          <stop offset="100%" stopColor="var(--gold)" stopOpacity="0" />
        </linearGradient>
      </defs>
      {TREND_TICKS.map((tick) => (
        <g key={tick}>
          <line x1={padLeft} x2={w - padRight} y1={y(tick)} y2={y(tick)} stroke="var(--border)" />
          <text x={padLeft - 10} y={y(tick) + 3} textAnchor="end" fontSize="10" fill="var(--foreground-muted)" className="tnum font-mono">
            {tick}
          </text>
        </g>
      ))}

      <motion.path
        d={`${lineThrough(points)} L${points[points.length - 1].x},${baseline} L${points[0].x},${baseline} Z`}
        fill="url(#home-trend-area)"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1, delay: 0.5 }}
      />
      <motion.path
        d={lineThrough(points)}
        fill="none"
        stroke="var(--gold)"
        strokeWidth="2"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.4, ease: "easeOut" }}
      />

      {semesters.map((semester, index) => {
        const isLatest = index === latest;
        return (
          <g key={semester.label}>
            <title>{`${semester.label}: SGPA ${semester.sgpa.toFixed(2)}`}</title>
            <motion.circle
              cx={points[index].x}
              cy={points[index].y}
              r={isLatest ? 5 : 3.5}
              fill={isLatest ? "var(--gold-bright)" : "var(--surface)"}
              stroke={isLatest ? "none" : "var(--gold)"}
              strokeWidth="2"
              initial={{ scale: 0, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: 0.3 + index * 0.25 }}
              style={{ transformBox: "fill-box", transformOrigin: "center" }}
            />
            <text
              x={points[index].x}
              y={points[index].y - 14}
              textAnchor="middle"
              fontSize="11"
              fontWeight={isLatest ? 600 : 400}
              fill={isLatest ? "var(--gold-bright)" : "var(--foreground-secondary)"}
              className="tnum font-mono"
            >
              {semester.sgpa.toFixed(2)}
            </text>
            <text x={points[index].x} y={h - 8} textAnchor="middle" fontSize="11" className="font-mono" fill={isLatest ? "var(--gold)" : "var(--foreground-muted)"}>
              {semester.label.replace("Sem ", "S")}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

/* ───────────── Grade breakdown: stacked bar + per-grade rows ───────────── */

interface GradeCount { grade: string; count: number; tone: Tone; }

export function GradeBreakdown({ counts }: { counts: GradeCount[] }) {
  const total = counts.reduce((sum, entry) => sum + entry.count, 0);
  const biggest = Math.max(...counts.map((entry) => entry.count));

  return (
    <div className="mt-6">
      <div className="flex h-2.5 w-full gap-0.5 overflow-hidden rounded-full" role="img" aria-label={`${total} subjects by grade`}>
        {counts
          .filter((entry) => entry.count > 0)
          .map((entry, index) => (
            <motion.div
              key={entry.grade}
              initial={{ flexGrow: 0 }}
              whileInView={{ flexGrow: entry.count }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: index * 0.06, ease: "easeOut" }}
              style={{ background: TONE_COLOR[entry.tone], flexBasis: 0 }}
              title={`${entry.grade}: ${entry.count}`}
            />
          ))}
      </div>

      <ul className="mt-5 divide-y divide-border">
        {counts.map((entry, index) => (
          <li key={entry.grade} className="flex items-center gap-4 py-2 text-sm">
            <span className="w-8 shrink-0 font-semibold" style={{ color: TONE_COLOR[entry.tone] }}>
              {entry.grade}
            </span>
            <div className="h-1 flex-1 overflow-hidden rounded-full bg-border-strong">
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: `${(entry.count / biggest) * 100}%` }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: index * 0.04, ease: "easeOut" }}
                className="h-full rounded-full"
                style={{ background: TONE_COLOR[entry.tone] }}
              />
            </div>
            <span className="tnum w-5 shrink-0 text-right font-mono text-xs text-foreground-secondary">{entry.count}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ───────────── Promotion: ring with the 50% ordinance tick ───────────── */

export function PromotionRing({ percent }: { percent: number }) {
  const size = 132;
  const stroke = 9;
  const radius = (size - stroke) / 2;
  const center = size / 2;

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg viewBox={`0 0 ${size} ${size}`} className="size-full" role="img" aria-label={`${percent}% of annual credits cleared; promotion needs 50%`}>
        <circle cx={center} cy={center} r={radius} fill="none" stroke="var(--border-strong)" strokeWidth={stroke} />
        <motion.circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="var(--grade-excellent)"
          strokeWidth={stroke}
          strokeLinecap="round"
          transform={`rotate(-90 ${center} ${center})`}
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: percent / 100 }}
          viewport={{ once: true }}
          transition={{ duration: 1.3, ease: "easeOut" }}
        />
        {/* 50% threshold sits at the bottom of the ring */}
        <line x1={center} x2={center} y1={size - stroke - 5} y2={size + 1} stroke="var(--foreground)" strokeWidth="2" strokeLinecap="round" opacity="0.7" />
      </svg>
      <div className="absolute inset-0 grid place-items-center">
        <span className="tnum text-3xl font-semibold leading-none tracking-[-0.03em] text-foreground">{percent}%</span>
      </div>
    </div>
  );
}

/* ───────────── Placement: a track from 50% to 100% with the cutoffs on it ───────────── */

const TRACK_MIN = 50;
const trackPosition = (value: number) => `${((value - TRACK_MIN) / (100 - TRACK_MIN)) * 100}%`;

export function PlacementTrack({ percent, cutoffs }: { percent: number; cutoffs: number[] }) {
  return (
    <div className="relative mt-8 h-12">
      <div className="absolute inset-x-0 top-3 h-1.5 rounded-full bg-border-strong" />
      <motion.div
        initial={{ width: 0 }}
        whileInView={{ width: trackPosition(percent) }}
        viewport={{ once: true }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="absolute left-0 top-3 h-1.5 rounded-full bg-gold"
      />
      {cutoffs.map((cutoff) => (
        <div key={cutoff} className="absolute top-1.5 -translate-x-1/2" style={{ left: trackPosition(cutoff) }}>
          <span className="block h-4.5 w-px bg-foreground-muted" />
          <span className="tnum mt-1.5 block text-center font-mono text-[11px] text-foreground-muted">{cutoff}</span>
        </div>
      ))}
      <motion.div
        initial={{ left: 0, opacity: 0 }}
        whileInView={{ left: trackPosition(percent), opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="absolute top-3.75 -translate-x-1/2 -translate-y-1/2"
      >
        <span className="block size-3.5 rounded-full border-2 border-surface bg-gold-bright" />
        <span className="tnum absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded border border-gold-border bg-surface px-1.5 py-0.5 font-mono text-[11px] font-semibold text-gold-bright">
          {percent.toFixed(1)}%
        </span>
      </motion.div>
    </div>
  );
}

export function EligibleRow({ cutoff, margin }: { cutoff: number; margin: number }) {
  return (
    <li className="flex flex-1 items-center justify-between gap-3 py-3 text-sm">
      <span className="tnum font-mono text-foreground-secondary">≥ {cutoff}%</span>
      <span className="flex items-center gap-3">
        <span className="tnum font-mono text-xs text-foreground-muted">+{margin.toFixed(1)} pts</span>
        <span className="flex items-center gap-1.5 text-grade-excellent">
          <CheckCircle2 size={14} aria-hidden="true" />
          Eligible
        </span>
      </span>
    </li>
  );
}

/* ───────────── Reappear planner: the year, with the two windows marked ───────────── */

const MONTHS = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];
const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const WINDOW_MONTHS = new Set([4, 5, 10, 11]); // May/June (even) and Nov/Dec (odd)

export function ReappearYear() {
  return (
    <ol className="mt-5 grid min-h-28 flex-1 grid-cols-12 gap-1 pb-5" aria-label="Examination windows across the year">
      {MONTHS.map((letter, index) => {
        const marked = WINDOW_MONTHS.has(index);
        return (
          <li key={MONTH_NAMES[index]} className="flex flex-col items-center gap-1.5">
            <motion.span
              initial={{ scaleY: 0.3, opacity: 0.5 }}
              whileInView={{ scaleY: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.035, ease: "easeOut" }}
              style={{ transformOrigin: "bottom" }}
              className={`w-full flex-1 rounded-sm ${marked ? "bg-cat-teal" : "bg-border-strong"}`}
              title={`${MONTH_NAMES[index]}${marked ? " · examination window" : ""}`}
            />
            <span className={`font-mono text-[10px] ${marked ? "text-cat-teal" : "text-foreground-muted"}`}>{letter}</span>
          </li>
        );
      })}
    </ol>
  );
}

/* ───────────── Transcript: the printed sheet, with the real rows ───────────── */

export function TranscriptSheet() {
  const rows = buildTranscript();
  const last = rows[rows.length - 1];

  return (
    <div className="relative mx-auto w-full max-w-sm select-none py-3" role="img" aria-label="Preview of the consolidated transcript, stamped unofficial">
      <div className="home-paper absolute inset-x-0 inset-y-3 -translate-x-2 -rotate-3" style={{ background: "var(--paper-shade)" }} aria-hidden="true" />
      <div className="home-paper absolute inset-x-0 inset-y-3 translate-x-1.5 rotate-2 opacity-90" aria-hidden="true" />
      <div className="home-paper relative p-5 pb-14 sm:p-6 sm:pb-16" aria-hidden="true">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-lg font-semibold leading-none tracking-[-0.02em]">Consolidated transcript</p>
            <p className="mt-2 font-mono text-[10px] text-paper-ink/60">B.Tech CSE · USICT · All semesters, one page</p>
          </div>
          <span className="mt-0.5 size-7 shrink-0 rounded-full border border-paper-rule" />
        </div>

        <table className="tnum mt-5 w-full border-collapse text-left font-mono text-[11px]">
          <thead>
            <tr className="border-y border-paper-rule text-[9px] uppercase tracking-wide text-paper-ink/60">
              <th className="py-1.5 font-medium">Semester</th>
              <th className="py-1.5 text-right font-medium">Credits</th>
              <th className="py-1.5 text-right font-medium">SGPA</th>
              <th className="py-1.5 text-right font-medium">CGPA</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label} className="border-b border-paper-rule">
                <td className="py-2">{row.label}</td>
                <td className="py-2 text-right">{row.credits}</td>
                <td className="py-2 text-right">{row.sgpa.toFixed(2)}</td>
                <td className="py-2 text-right font-semibold">{row.cgpa.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="tnum mt-3 font-mono text-[10px] text-paper-ink/70">
          {last.totalCredits} credits · CGPA {last.cgpa.toFixed(2)} · {(last.cgpa * 10).toFixed(1)}% equivalent
        </p>

        <div className="absolute bottom-5 right-5 -rotate-12 rounded border-2 border-paper-stamp px-3 py-1 font-mono text-[11px] font-bold tracking-[0.2em] text-paper-stamp opacity-85 mix-blend-multiply sm:bottom-6 sm:right-6">
          UNOFFICIAL
        </div>
      </div>
    </div>
  );
}
