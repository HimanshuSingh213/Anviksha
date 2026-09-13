"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

const EXCELLENT = "text-grade-excellent border-grade-excellent-border bg-grade-excellent-surface";
const GOOD = "text-grade-good border-grade-good-border bg-grade-good-surface";
const AVERAGE = "text-grade-average border-grade-average-border bg-grade-average-surface";
const PASS = "text-grade-pass border-grade-pass-border bg-grade-pass-surface";

// Sample B.Tech CSE marksheet. The card runs the real Clause 13 formula on
// these rows, so every number it shows is honestly computed.
const SEMESTERS: Array<Array<{ code: string; name: string; credits: number; grade: string; gradePoints: number; gradeStyle: string }>> = [
  [
    { code: "ICT-101", name: "Engineering Mathematics I", credits: 4, grade: "A", gradePoints: 8, gradeStyle: GOOD },
    { code: "ICT-103", name: "Programming Fundamentals", credits: 4, grade: "O", gradePoints: 10, gradeStyle: EXCELLENT },
    { code: "ICT-105", name: "Digital Design", credits: 3, grade: "B+", gradePoints: 7, gradeStyle: GOOD },
    { code: "ICT-151", name: "Physics Lab", credits: 1, grade: "A", gradePoints: 8, gradeStyle: GOOD },
  ],
  [
    { code: "ICT-201", name: "Object Oriented Programming", credits: 4, grade: "A+", gradePoints: 9, gradeStyle: EXCELLENT },
    { code: "ICT-203", name: "Discrete Structures", credits: 4, grade: "A", gradePoints: 8, gradeStyle: GOOD },
    { code: "ICT-205", name: "Computer Architecture", credits: 3, grade: "B+", gradePoints: 7, gradeStyle: GOOD },
    { code: "HS-201", name: "Humanities Elective", credits: 2, grade: "P", gradePoints: 4, gradeStyle: PASS },
  ],
  [
    { code: "ICT-301", name: "Data Structures", credits: 4, grade: "A+", gradePoints: 9, gradeStyle: EXCELLENT },
    { code: "ICT-303", name: "Operating Systems", credits: 4, grade: "A", gradePoints: 8, gradeStyle: GOOD },
    { code: "ICT-305", name: "Theory of Computation", credits: 3, grade: "B", gradePoints: 6, gradeStyle: AVERAGE },
    { code: "ICT-351", name: "Data Structures Lab", credits: 1, grade: "O", gradePoints: 10, gradeStyle: EXCELLENT },
  ],
  [
    { code: "ICT-401", name: "DBMS", credits: 4, grade: "A", gradePoints: 8, gradeStyle: GOOD },
    { code: "ICT-403", name: "Design & Analysis of Algorithms", credits: 4, grade: "A+", gradePoints: 9, gradeStyle: EXCELLENT },
    { code: "ITME-401", name: "Microprocessors", credits: 3, grade: "B+", gradePoints: 7, gradeStyle: GOOD },
    { code: "ICT-451", name: "DBMS Lab", credits: 1, grade: "A+", gradePoints: 9, gradeStyle: EXCELLENT },
  ],
];

// SGPA = Σ(credits × gradePoints) / Σ credits, per Ordinance 11, Clause 13.
function calculateSgpa(subjects: typeof SEMESTERS[number], credits: number[]) {
  const qualityPoints = subjects.reduce((sum, subject, index) => sum + credits[index] * subject.gradePoints, 0);
  const totalCredits = credits.reduce((sum, credit) => sum + credit, 0);
  return totalCredits > 0 ? qualityPoints / totalCredits : null;
}

export default function DossierCard() {
  const [activeSemester, setActiveSemester] = useState(3);
  const [editableCredits, setEditableCredits] = useState<number[][]>(() =>
    SEMESTERS.map((semester) => semester.map((subject) => subject.credits))
  );
  const prefersReducedMotion = useReducedMotion();

  const semesterSgpas = SEMESTERS.map((semester, index) => calculateSgpa(semester, editableCredits[index]));
  const activeSgpa = semesterSgpas[activeSemester];

  // CGPA = same weighting over every semester shown so far.
  let cumulativeQualityPoints = 0;
  let cumulativeCredits = 0;
  for (let semesterIndex = 0; semesterIndex <= activeSemester; semesterIndex++) {
    SEMESTERS[semesterIndex].forEach((subject, subjectIndex) => {
      cumulativeQualityPoints += editableCredits[semesterIndex][subjectIndex] * subject.gradePoints;
      cumulativeCredits += editableCredits[semesterIndex][subjectIndex];
    });
  }
  const cumulativeCgpa = cumulativeCredits > 0 ? cumulativeQualityPoints / cumulativeCredits : null;

  // The selected semester belongs to one academic year; promotion needs 50%
  // of that year's credits earned (Clause 11.3(v)).
  const activeYear = Math.floor(activeSemester / 2);
  const yearSemesterIndexes = [activeYear * 2, activeYear * 2 + 1].filter((index) => index < SEMESTERS.length);
  const yearCreditsOffered = yearSemesterIndexes.reduce(
    (sum, semesterIndex) => sum + editableCredits[semesterIndex].reduce((a, b) => a + b, 0),
    0
  );
  const yearCreditsEarned = yearSemesterIndexes.reduce(
    (sum, semesterIndex) =>
      sum + SEMESTERS[semesterIndex].reduce((s, subject, subjectIndex) => s + (subject.grade === "F" ? 0 : editableCredits[semesterIndex][subjectIndex]), 0),
    0
  );
  const yearPercentEarned = yearCreditsOffered > 0 ? Math.round((yearCreditsEarned / yearCreditsOffered) * 100) : 0;
  const isPromoted = yearPercentEarned >= 50;

  function changeCredits(targetSemesterIndex: number, targetSubjectIndex: number, amount: number) {
    setEditableCredits((previousCredits) =>
      previousCredits.map((semesterCredits, semesterIndex) =>
        semesterIndex !== targetSemesterIndex
          ? semesterCredits
          : semesterCredits.map((credit, subjectIndex) =>
              subjectIndex === targetSubjectIndex ? Math.min(6, Math.max(0, credit + amount)) : credit
            )
      )
    );
  }

  return (
    <div className="relative w-full overflow-hidden rounded-xl border border-border-strong bg-linear-to-b from-surface to-surface-deep shadow-[0_30px_80px_-30px_rgba(0,0,0,0.8)]">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-gold/40 to-transparent" aria-hidden="true" />

      <div className="p-5 sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <span className="font-mono text-[10px] uppercase tracking-wider text-foreground-muted">Semester dossier</span>
          <span className="inline-flex items-center rounded-full border border-grade-excellent-border bg-grade-excellent-surface px-2 py-0.5 font-mono text-[10px] text-grade-excellent">
            Computed live
          </span>
        </div>

        <div className="mt-3 flex items-center justify-between gap-3">
          <p className="font-mono text-xs text-foreground-secondary">B.Tech CSE · Sem {activeSemester + 1} · USICT</p>
          <span className="font-mono text-[9px] uppercase tracking-wider text-foreground-muted">Sample data</span>
        </div>

        <div role="tablist" aria-label="Sample semesters" className="mt-4 grid grid-cols-4 gap-1 rounded-lg border border-border bg-surface-deep p-1">
          {SEMESTERS.map((_, semesterIndex) => {
            const isSelected = activeSemester === semesterIndex;
            return (
              <button
                key={semesterIndex}
                type="button"
                role="tab"
                aria-selected={isSelected}
                onClick={() => setActiveSemester(semesterIndex)}
                className={`relative rounded-md px-2 py-1.5 font-mono text-[11px] font-semibold transition-colors ${
                  isSelected ? "text-gold" : "text-foreground-muted hover:text-foreground-secondary"
                }`}
              >
                {isSelected && (
                  <motion.span
                    layoutId="dossier-semester-tab"
                    transition={{ duration: 0.25, ease: "easeOut" }}
                    className="absolute inset-0 rounded-md border border-gold-border bg-gold-surface"
                    aria-hidden="true"
                  />
                )}
                <span className="relative">S{semesterIndex + 1}</span>
              </button>
            );
          })}
        </div>

        <div className="mt-4 grid grid-cols-[1fr_auto] gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="analytics-card p-3 sm:p-4">
              <p className="font-mono text-[10px] uppercase tracking-wider text-foreground-muted">SGPA</p>
              <motion.p
                key={activeSgpa}
                initial={prefersReducedMotion ? false : { opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="tnum mt-1.5 text-3xl font-semibold text-gold-bright sm:text-4xl"
              >
                {activeSgpa === null ? "--" : activeSgpa.toFixed(2)}
              </motion.p>
            </div>
            <div className="analytics-card p-3 sm:p-4">
              <p className="font-mono text-[10px] uppercase tracking-wider text-foreground-muted">CGPA</p>
              <motion.p
                key={cumulativeCgpa}
                initial={prefersReducedMotion ? false : { opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="tnum mt-1.5 text-3xl font-semibold text-foreground sm:text-4xl"
              >
                {cumulativeCgpa === null ? "--" : cumulativeCgpa.toFixed(2)}
              </motion.p>
            </div>
          </div>

          <div className="flex h-full flex-col items-center justify-end gap-1.5 self-stretch" aria-hidden="true">
            <div className="flex h-17.5 items-end gap-1.5">
              {semesterSgpas.map((sgpa, index) => (
                <div key={index} className="flex flex-col items-center gap-1">
                  <motion.div
                    animate={{ height: sgpa === null ? 2 : 14 + (sgpa / 10) * 56 }}
                    transition={{ duration: prefersReducedMotion ? 0 : 0.4, ease: "easeOut" }}
                    className={`w-2.5 rounded-t ${index === activeSemester ? "bg-gold" : "bg-gold-dim/50"}`}
                  />
                  <span className={`font-mono text-[8px] ${index === activeSemester ? "text-gold" : "text-foreground-muted"}`}>
                    {index + 1}
                  </span>
                </div>
              ))}
            </div>
            <span className="font-mono text-[8px] uppercase tracking-wider text-foreground-muted">SGPA trend</span>
          </div>
        </div>

        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between font-mono text-[10px] text-foreground-muted">
            <span>Year {activeYear + 1} · 50% credit rule</span>
            <span className={`font-mono font-bold tracking-wider ${isPromoted ? "text-grade-excellent" : "text-grade-fail"}`}>
              {isPromoted ? "PROMOTED" : "AT RISK"}
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-hover">
            <motion.div
              animate={{ width: `${yearPercentEarned}%` }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.5, ease: "easeOut" }}
              className={`h-full rounded-full ${isPromoted ? "bg-grade-excellent" : "bg-grade-fail"}`}
            />
          </div>
          <p className="font-mono text-[10px] text-foreground-secondary">
            {yearCreditsEarned} of {yearCreditsOffered} annual credits cleared
          </p>
        </div>

        <div className="mt-4 border-t border-border pt-3">
          <div className="flex items-center justify-between pb-1.5">
            <p className="font-mono text-[9px] uppercase tracking-wider text-foreground-muted">Subjects · Clause 11.5 grades</p>
            <p className="font-mono text-[9px] uppercase tracking-wider text-foreground-muted">Credits</p>
          </div>

          <div className="space-y-1.5">
            {SEMESTERS[activeSemester].map((subject, subjectIndex) => (
              <motion.div
                key={`${activeSemester}-${subject.code}`}
                initial={prefersReducedMotion ? false : { opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: subjectIndex * 0.04 }}
                className="flex items-center justify-between gap-2 rounded-md border border-border bg-surface-deep px-2.5 py-2 font-mono text-[11px] transition-colors hover:border-border-strong"
              >
                <span className="min-w-0 flex-1 truncate text-foreground-secondary">
                  <span className="text-foreground-muted">{subject.code}</span> · {subject.name}
                </span>
                <span className="flex shrink-0 items-center gap-1">
                  <button
                    type="button"
                    aria-label={`Decrease credits for ${subject.name}`}
                    onClick={() => changeCredits(activeSemester, subjectIndex, -1)}
                    className="flex h-5 w-5 items-center justify-center rounded border border-border text-foreground-muted transition-colors hover:border-gold-border hover:text-gold"
                  >
                    −
                  </button>
                  <span className="tnum w-4 text-center text-foreground">{editableCredits[activeSemester][subjectIndex]}</span>
                  <button
                    type="button"
                    aria-label={`Increase credits for ${subject.name}`}
                    onClick={() => changeCredits(activeSemester, subjectIndex, 1)}
                    className="flex h-5 w-5 items-center justify-center rounded border border-border text-foreground-muted transition-colors hover:border-gold-border hover:text-gold"
                  >
                    +
                  </button>
                </span>
                <span className={`w-9 shrink-0 rounded border px-1.5 py-0.5 text-center ${subject.gradeStyle}`}>{subject.grade}</span>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="mt-4 flex flex-col gap-1.5 border-t border-border pt-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-mono text-[10px] text-foreground-muted">
            Marksheets don&apos;t print credits. Adjust any value and SGPA recomputes.
          </p>
          <div className="flex shrink-0 items-center gap-2">
            <span className="rounded border border-gold-border bg-gold-surface px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider text-gold">
              Estimate
            </span>
            <span className="font-mono text-[10px] text-foreground-muted">Ordinance 11, Cl. 13</span>
          </div>
        </div>

        <p className="mt-3 font-mono text-[10px] text-foreground-muted">
          Computed client-side · nothing leaves your session
        </p>
      </div>
    </div>
  );
}
