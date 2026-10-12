"use client";

import { useState, type KeyboardEvent } from "react";
import { motion } from "framer-motion";
import { PLACEMENT_CUTOFFS, SEMESTERS, TONE, calculateSgpa, divisionFor } from "./sample-data";

// Sparkline geometry. The y axis spans SGPA 6 to 9 so a rising term is visible.
const SPARK_W = 184;
const SPARK_H = 84;
const SPARK_TOP = 12;
const SPARK_BASE = 62;
const sparkX = (index: number) => 12 + index * ((SPARK_W - 24) / (SEMESTERS.length - 1));
const sparkY = (sgpa: number | null) => {
  const clamped = Math.min(9, Math.max(6, sgpa ?? 6));
  return SPARK_BASE - ((clamped - 6) / 3) * (SPARK_BASE - SPARK_TOP);
};

export default function DossierCard() {
  const [activeSemester, setActiveSemester] = useState(SEMESTERS.length - 1);

  // SGPA per semester, straight from the sample rows.
  const semesterSgpas = SEMESTERS.map((semester) => calculateSgpa(semester));
  const activeSgpa = semesterSgpas[activeSemester];
  const activeSubjects = SEMESTERS[activeSemester];

  // CGPA = same weighting over every semester shown so far.
  let cumulativeQualityPoints = 0;
  let cumulativeCredits = 0;
  for (let semesterIndex = 0; semesterIndex <= activeSemester; semesterIndex++) {
    SEMESTERS[semesterIndex].forEach((subject) => {
      cumulativeQualityPoints += subject.credits * subject.gradePoints;
      cumulativeCredits += subject.credits;
    });
  }
  const cumulativeCgpa = cumulativeCredits > 0 ? cumulativeQualityPoints / cumulativeCredits : null;
  const equivalentPercent = cumulativeCgpa === null ? null : cumulativeCgpa * 10;
  const division = divisionFor(cumulativeCgpa);
  const clearedCutoff = equivalentPercent === null ? undefined : PLACEMENT_CUTOFFS.find((cutoff) => equivalentPercent >= cutoff);

  // The selected semester belongs to one academic year; promotion needs 50%
  // of that year's credits earned (Clause 11.3(v)).
  const activeYear = Math.floor(activeSemester / 2);
  const yearSemesterIndexes = [activeYear * 2, activeYear * 2 + 1].filter((index) => index < SEMESTERS.length);
  const yearCreditsOffered = yearSemesterIndexes.reduce(
    (sum, semesterIndex) => sum + SEMESTERS[semesterIndex].reduce((a, subject) => a + subject.credits, 0),
    0
  );
  const yearCreditsEarned = yearSemesterIndexes.reduce(
    (sum, semesterIndex) =>
      sum + SEMESTERS[semesterIndex].reduce((s, subject) => s + (subject.grade === "F" ? 0 : subject.credits), 0),
    0
  );
  const yearPercentEarned = yearCreditsOffered > 0 ? Math.round((yearCreditsEarned / yearCreditsOffered) * 100) : 0;
  const isPromoted = yearPercentEarned >= 50;

  function handleTabKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const lastIndex = SEMESTERS.length - 1;
    let next: number | null = null;
    if (event.key === "ArrowRight") next = activeSemester === lastIndex ? 0 : activeSemester + 1;
    if (event.key === "ArrowLeft") next = activeSemester === 0 ? lastIndex : activeSemester - 1;
    if (event.key === "Home") next = 0;
    if (event.key === "End") next = lastIndex;
    if (next === null) return;
    event.preventDefault();
    setActiveSemester(next);
    document.getElementById(`dossier-tab-${next}`)?.focus();
  }

  const sparkPoints = semesterSgpas.map((sgpa, index) => ({ x: sparkX(index), y: sparkY(sgpa) }));
  const linePath = sparkPoints.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
  const fillPath = `${linePath} L${sparkPoints[sparkPoints.length - 1].x},${SPARK_BASE} L${sparkPoints[0].x},${SPARK_BASE} Z`;

  return (
    <div className="home-panel p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <div className="flex items-center gap-2.5">
          <h2 className="whitespace-nowrap text-sm font-semibold text-foreground">Semester dossier</h2>
          <span className="whitespace-nowrap rounded border border-border-strong px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wide text-foreground-muted">
            Sample data
          </span>
        </div>
      </div>

      <p className="mt-2 text-[13px] text-foreground-secondary">B.Tech CSE · Sem {activeSemester + 1} · USICT</p>

      <div
        role="tablist"
        aria-label="Sample semesters"
        onKeyDown={handleTabKeyDown}
        className="mt-5 flex border-b border-border"
      >
        {SEMESTERS.map((_, semesterIndex) => {
          const isSelected = activeSemester === semesterIndex;
          return (
            <button
              key={semesterIndex}
              id={`dossier-tab-${semesterIndex}`}
              type="button"
              role="tab"
              aria-selected={isSelected}
              aria-controls="dossier-panel"
              tabIndex={isSelected ? 0 : -1}
              onClick={() => setActiveSemester(semesterIndex)}
              className={`relative px-4 py-2.5 font-mono text-xs font-semibold transition-colors ${
                isSelected ? "text-foreground" : "text-foreground-muted hover:text-foreground-secondary"
              }`}
            >
              Sem {semesterIndex + 1}
              {isSelected && (
                <motion.span
                  layoutId="home-dossier-tab"
                  transition={{ duration: 0.35, ease: "easeOut" }}
                  className="absolute inset-x-3 -bottom-px h-px bg-gold"
                  aria-hidden="true"
                />
              )}
            </button>
          );
        })}
      </div>

      <div id="dossier-panel" role="tabpanel" aria-labelledby={`dossier-tab-${activeSemester}`}>
        {/* Headline numbers + trend */}
        <div className="mt-6 grid grid-cols-2 items-end gap-x-6 gap-y-6 sm:grid-cols-[auto_auto_1fr]">
          <div>
            <p className="font-mono text-xs text-foreground-muted">SGPA</p>
            <p className="tnum mt-1.5 text-4xl font-semibold leading-none tracking-[-0.04em] text-gold-bright sm:text-5xl">
              {activeSgpa === null ? "--" : activeSgpa.toFixed(2)}
            </p>
          </div>
          <div>
            <p className="font-mono text-xs text-foreground-muted">
              CGPA{equivalentPercent === null ? "" : ` · ${equivalentPercent.toFixed(1)}%`}
            </p>
            <p className="tnum mt-1.5 text-4xl font-semibold leading-none tracking-[-0.04em] text-foreground sm:text-5xl">
              {cumulativeCgpa === null ? "--" : cumulativeCgpa.toFixed(2)}
            </p>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <svg viewBox={`0 0 ${SPARK_W} ${SPARK_H}`} className="h-20 w-full" role="img" aria-label="SGPA across the four sample semesters">
              <defs>
                <linearGradient id="home-spark-area" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--gold)" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="var(--gold)" stopOpacity="0" />
                </linearGradient>
              </defs>
              <line x1="0" x2={SPARK_W} y1={SPARK_BASE} y2={SPARK_BASE} stroke="var(--border-strong)" strokeWidth="1" />
              <path d={fillPath} fill="url(#home-spark-area)" />
              <path
                d={linePath}
                fill="none"
                stroke="var(--gold)"
                strokeWidth="1.75"
                strokeLinecap="round"
              />
              {sparkPoints.map((point, index) => (
                <circle
                  key={index}
                  cx={point.x}
                  cy={point.y}
                  r={index === activeSemester ? 4 : 2.5}
                  fill={index === activeSemester ? "var(--gold-bright)" : "var(--surface)"}
                  stroke={index === activeSemester ? "none" : "var(--gold-dim)"}
                  strokeWidth="1.5"
                />
              ))}
              {sparkPoints.map((point, index) => (
                <text
                  key={`label-${index}`}
                  x={point.x}
                  y={SPARK_H - 4}
                  textAnchor="middle"
                  fontSize="9"
                  className="font-mono"
                  fill={index === activeSemester ? "var(--gold)" : "var(--foreground-muted)"}
                >
                  S{index + 1}
                </text>
              ))}
            </svg>
          </div>
        </div>

        {/* Promotion */}
        <div className="mt-7">
          <div className="flex items-center justify-between font-mono text-xs">
            <span className="text-foreground-muted">Year {activeYear + 1} · 50% credit rule</span>
            <span className={`font-bold tracking-wider ${isPromoted ? "text-grade-excellent" : "text-grade-fail"}`}>
              {isPromoted ? "PROMOTED" : "AT RISK"}
            </span>
          </div>
          <div className="relative mt-2.5 h-1.5 w-full rounded-full bg-border-strong">
            <motion.div
              animate={{ width: `${yearPercentEarned}%` }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className={`h-full rounded-full ${isPromoted ? "bg-grade-excellent" : "bg-grade-fail"}`}
            />
            <span className="absolute -bottom-1 -top-1 left-1/2 w-px bg-foreground-secondary" aria-hidden="true" />
          </div>
          <p className="mt-2 text-xs text-foreground-secondary">
            {yearCreditsEarned} of {yearCreditsOffered} annual credits cleared
          </p>
        </div>

        {/* Subjects */}
        <div className="mt-6 border-t border-border pt-4">
          <div className="flex items-center justify-between pb-1 font-mono text-[11px] text-foreground-muted">
            <p>Subjects · Clause 11.5 grades</p>
            <p>Credits</p>
          </div>
          <ul className="divide-y divide-border">
            {activeSubjects.map((subject, subjectIndex) => (
              <motion.li
                key={`${activeSemester}-${subject.code}`}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.28, delay: subjectIndex * 0.04, ease: "easeOut" }}
                className="flex items-center gap-3 py-2.5"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] text-foreground-secondary">
                    <span className="font-mono text-[11px] text-foreground-muted">{subject.code}</span>
                    <span className="mx-1.5 text-foreground-muted" aria-hidden="true">·</span>
                    {subject.name}
                  </p>
                </div>
                <span className="tnum w-4 shrink-0 text-center text-[13px] text-foreground">
                  {subject.credits}
                </span>
                <span className={`w-10 shrink-0 rounded-md px-2 py-1 text-center text-xs font-semibold ring-1 ring-inset ${TONE[subject.tone]}`}>
                  {subject.grade}
                </span>
              </motion.li>
            ))}
          </ul>
        </div>

        {/* Verdicts derived from the same numbers */}
        <dl className="mt-5 grid grid-cols-2 divide-x divide-border border-y border-border">
          <div className="py-3 pr-4">
            <dt className="font-mono text-[11px] text-foreground-muted">Division</dt>
            <dd className="mt-1 text-sm font-medium text-foreground">{division ?? "Not classified"}</dd>
          </div>
          <div className="py-3 pl-4">
            <dt className="font-mono text-[11px] text-foreground-muted">Placement</dt>
            <dd className="mt-1 text-sm font-medium text-foreground">
              {clearedCutoff ? `Eligible · ≥ ${clearedCutoff}%` : "Below 60% cutoff"}
            </dd>
          </div>
        </dl>
      </div>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-foreground-muted">Sample numbers — sign in and your own SGPA recomputes live.</p>
        <div className="flex shrink-0 items-center gap-2">
          <span className="rounded border border-gold-border px-1.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wide text-gold">Estimate</span>
          <span className="whitespace-nowrap text-xs text-foreground-muted">Ordinance 11, Cl. 13</span>
        </div>
      </div>

      <p className="mt-3 text-xs text-foreground-muted">Computed client-side · nothing leaves your session</p>
    </div>
  );
}
