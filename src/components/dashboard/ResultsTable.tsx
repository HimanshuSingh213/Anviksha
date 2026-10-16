"use client";

import { Fragment, useState } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, ChevronRight, Pencil } from "lucide-react";
import Tooltip from "@/components/common/Tooltip";
import useResultStore from "@/store/result-store";
import type { SubjectResult } from "@/types/result";
import CreditInput from "./CreditInput";
import { isCleared } from "./dashboard-metrics";

// Status labels
const STATUS: Record<string, { label: string; className: string }> = {
  PASS: { label: "Pass", className: "text-grade-excellent" },
  CREDIT_SECURED: { label: "Credit Secured", className: "text-grade-excellent" },
  ALREADY_PASSED: { label: "Already Passed", className: "text-grade-excellent" },
  NOT_CLEARED: { label: "Back", className: "text-grade-fail" },
  ABSENT: { label: "Absent", className: "text-foreground-muted" },
  DETAINED: { label: "Detained", className: "text-grade-fail" },
  CANCELLED: { label: "Cancelled", className: "text-destructive" },
  RESULT_LATER: { label: "Result Later", className: "text-chart-cyan" },
  UNKNOWN: { label: "Unknown", className: "text-foreground-muted" },
};

// Grade badge styles
function gradeClasses(grade: string) {
  switch (grade) {
    case "O":
    case "A+":
      return "bg-grade-excellent-surface text-grade-excellent border-grade-excellent-border";
    case "A":
    case "B+":
      return "bg-grade-good-surface text-grade-good border-grade-good-border";
    case "B":
    case "C":
      return "bg-grade-average-surface text-grade-average border-grade-average-border";
    case "P":
      return "bg-grade-pass-surface text-grade-pass border-grade-pass-border";
    case "ABS":
    case "DET":
      return "bg-surface-deep text-foreground-muted border-border-strong";
    default:
      return "bg-grade-fail-surface text-grade-fail border-grade-fail-border";
  }
}

const HEADERS = ["Sem", "Code", "Subject", "Int.", "Ext.", "Total", "Credits", "Grade", "Status"];
const CENTERED = ["Int.", "Ext.", "Total", "Credits", "Grade", "Status"];

interface Props {
  scope: string;
  subjects: SubjectResult[];
  hasCreditColumn: boolean;
  noGradeReason?: string;
}

const td = "px-4 py-3 align-middle";

function getTotal(s: SubjectResult) {
  return s.rawTotal || (s.total !== undefined ? String(s.total) : "–");
}

export default function ResultsTable({ scope, subjects, hasCreditColumn, noGradeReason }: Props) {
  const setCustomCredit = useResultStore((state) => state.setCustomCredit);
  // Currently open history drawer (by row key)
  const [openRowKey, setOpenRowKey] = useState<string | null>(null);
  const headers = hasCreditColumn ? HEADERS : HEADERS.filter((h) => h !== "Credits");

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-b border-border px-5 py-4">
        <h2 className="text-base font-semibold tracking-tight">
          {scope}
          <span className="ml-3 font-mono text-xs font-normal text-foreground-muted">{subjects.length} subjects</span>
        </h2>
        {hasCreditColumn && (
          <p className="flex items-center gap-1.5 font-mono text-xs text-foreground-muted">
            <Pencil size={11} aria-hidden="true" />
            Click any credit value to edit and recalculate
          </p>
        )}
        <p className="font-mono text-[10px] italic text-foreground-muted sm:hidden">Scroll sideways →</p>
      </div>

      {subjects.length === 0 ? (
        <p className="px-5 py-12 text-center text-sm text-foreground-secondary">No results found for this selection.</p>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="overflow-x-auto"
        >
          <table className="w-full">
            <caption className="sr-only">Detailed Subject Results and Grades</caption>
            <thead>
              <tr className="border-b border-border bg-surface-deep">
                {headers.map((h) => (
                  <th
                    key={h}
                    className={`px-4 py-3 font-mono text-[10px] font-bold uppercase tracking-widest ${
                      h === "Credits" ? "text-gold" : "text-foreground-secondary"
                    } ${CENTERED.includes(h) ? "text-center" : "text-left"}`}
                  >
                    {h === "Credits" ? (
                      <Tooltip content="Click any value in this column to adjust credits & recalculate" position="top">
                        <span className="inline-flex cursor-help items-center justify-center gap-1">
                          Credits <Pencil size={9} />
                        </span>
                      </Tooltip>
                    ) : (
                      h
                    )}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {subjects.map((s, i) => {
                const cleared = isCleared(s);
                const status = STATUS[s.semantic] ?? STATUS.UNKNOWN;
                const isLab = /LAB|PRACTICAL/i.test(s.name);

                // Attempts history if subject was repeated
                const attempts = s.attempts ?? [];
                const hasHistory = attempts.length > 1;
                const rowKey = `${s.semester}-${s.rawCode}-${i}`;
                const isOpen = openRowKey === rowKey;
                // Backlog cleared in a later attempt
                const clearedAfterBacklog = cleared && attempts.some((a) => !isCleared(a));

                return (
                  <Fragment key={rowKey}>
                    <tr
                      className={`border-b border-border transition-colors ${
                        isOpen ? "bg-surface-elevated/60" : "hover:bg-surface-elevated/60"
                      }`}
                    >
                      <td className={`${td} font-mono text-xs font-medium text-foreground-secondary`}>{s.semester}</td>
                      <td className={`${td} font-mono text-xs font-bold text-gold`}>{s.rawCode}</td>

                      <td className={`${td} text-sm font-medium text-foreground`}>
                        <div className="flex items-center gap-2">
                          <span>{s.name}</span>
                          {isLab && (
                            <span className="shrink-0 rounded-sm border border-cat-teal-border bg-cat-teal-surface px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider text-cat-teal">
                              LAB
                            </span>
                          )}
                        </div>

                        {/* Reappear history toggle button: gold pill with a round arrow badge. */}
                        {hasHistory && (
                          <button
                            type="button"
                            onClick={() => setOpenRowKey(isOpen ? null : rowKey)}
                            aria-expanded={isOpen}
                            aria-label={`Toggle reappear history for ${s.name}`}
                            className={`group mt-2 inline-flex cursor-pointer items-center gap-2 rounded-full border border-gold-border py-0.5 pl-3 pr-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-gold transition-colors hover:bg-gold/20 ${
                              isOpen ? "bg-gold/20" : "bg-gold/10"
                            }`}
                          >
                            Reappear history
                            {/* Round arrow badge: nudges right on hover, turns down when open. */}
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gold text-background">
                              <ChevronRight
                                size={12}
                                strokeWidth={3}
                                className={`transition-transform duration-200 ${
                                  isOpen ? "rotate-90" : "group-hover:translate-x-0.5"
                                }`}
                                aria-hidden="true"
                              />
                            </span>
                          </button>
                        )}
                      </td>

                      <td className={`${td} text-center font-mono text-xs font-medium text-foreground-secondary`}>{s.internal ?? "–"}</td>
                      <td className={`${td} text-center font-mono text-xs font-medium text-foreground-secondary`}>{s.external ?? "–"}</td>

                      <td className={`${td} text-center font-mono text-xs font-bold text-foreground`}>
                        {getTotal(s)}
                        {s.maxMarks !== null && s.rawTotal && s.total !== undefined && (
                          <span className="ml-1 text-[9px] font-normal text-foreground-muted">/ {s.maxMarks}</span>
                        )}
                      </td>

                      {hasCreditColumn && (
                        <td className={`${td} text-center`}>
                          <CreditInput code={s.rawCode} name={s.name} value={s.credits.value} isCleared={cleared} onChange={setCustomCredit} />
                        </td>
                      )}

                      <td className={`${td} text-center`}>
                        {s.grade ? (
                          <Tooltip
                            content={
                              s.grade.value === "Distinction"
                                ? "More than 75% in the subject qualifies for distinction under Ordinance 15."
                                : "Letter grade determined by the applicable GGSIPU ordinance."
                            }
                            position="top"
                          >
                            <span className={`inline-flex h-6 min-w-9 cursor-help items-center justify-center rounded-sm border px-1.5 font-mono text-[11px] font-bold ${gradeClasses(s.grade.value)}`}>
                              {s.grade.value}
                            </span>
                          </Tooltip>
                        ) : (
                          <Tooltip content={noGradeReason ?? "A letter-grade table is not applicable to this programme."} position="top">
                            <span className="cursor-help font-mono text-[10px] text-foreground-muted">–</span>
                          </Tooltip>
                        )}
                      </td>

                      <td className={`${td} text-center`}>
                        <div className="inline-flex items-center justify-center gap-1.5">
                          {clearedAfterBacklog ? (
                            <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-grade-excellent">
                              Backlog cleared
                            </span>
                          ) : (
                            <span className={`font-mono text-[10px] font-bold uppercase tracking-wider ${status.className}`}>{status.label}</span>
                          )}
                          {s.ruleCheck === "FAIL" && cleared && (
                            <Tooltip
                              content="Displayed marks are below the loaded programme pass threshold, while ExamWeb reports PASS. Raw result is preserved; verify the official marksheet."
                              position="top"
                            >
                              <AlertTriangle size={11} className="cursor-help text-gold" aria-label="Rule mismatch" />
                            </Tooltip>
                          )}
                        </div>
                      </td>
                    </tr>

                    {/* Expandable history drawer */}
                    {isOpen && <HistoryDrawer attempts={attempts} colCount={headers.length} />}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </motion.div>
      )}
    </div>
  );
}

interface HistoryDrawerProps {
  attempts: SubjectResult[];
  colCount: number;
}

// Minimal history drawer showing individual attempt marks and status
function HistoryDrawer({ attempts, colCount }: HistoryDrawerProps) {
  const cell = "px-3 py-2 font-mono text-xs";

  return (
    <tr className="border-b border-border bg-surface-deep/60">
      <td colSpan={colCount} className="p-0">
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="m-4 border-l-2 border-gold-border pl-4"
        >
          <p className="mb-2 font-mono text-[10px] font-bold uppercase tracking-widest text-foreground-muted">
            Reappear history · {attempts.length} attempts
          </p>

          <table className="w-full">
            <thead>
              <tr className="text-foreground-muted">
                <th className="px-3 py-1.5 text-left font-mono text-[10px] font-semibold uppercase">Attempt</th>
                <th className="px-3 py-1.5 text-left font-mono text-[10px] font-semibold uppercase">Code</th>
                <th className="px-3 py-1.5 text-left font-mono text-[10px] font-semibold uppercase">Subject</th>
                <th className="px-3 py-1.5 text-center font-mono text-[10px] font-semibold uppercase">Int.</th>
                <th className="px-3 py-1.5 text-center font-mono text-[10px] font-semibold uppercase">Ext.</th>
                <th className="px-3 py-1.5 text-center font-mono text-[10px] font-semibold uppercase">Total</th>
                <th className="px-3 py-1.5 text-center font-mono text-[10px] font-semibold uppercase">Result</th>
              </tr>
            </thead>
            <tbody>
              {attempts.map((a, idx) => {
                const status = STATUS[a.semantic] ?? STATUS.UNKNOWN;

                return (
                  <tr key={idx} className="border-t border-border">
                    <td className={`${cell} text-foreground-muted`}>#{idx + 1}</td>
                    <td className={`${cell} font-bold text-gold`}>{a.rawCode}</td>
                    <td className="px-3 py-2 text-xs text-foreground">{a.name}</td>
                    <td className={`${cell} text-center text-foreground-secondary`}>{a.internal ?? "–"}</td>
                    <td className={`${cell} text-center text-foreground-secondary`}>{a.external ?? "–"}</td>
                    <td className={`${cell} text-center font-bold text-foreground`}>{getTotal(a)}</td>
                    <td className={`${cell} text-center font-bold uppercase ${status.className}`}>{status.label}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </motion.div>
      </td>
    </tr>
  );
}
