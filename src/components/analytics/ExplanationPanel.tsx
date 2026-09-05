"use client";

import { ShieldCheck, BookOpen, AlertTriangle, Scale } from "lucide-react";
import type { EngineResult } from "@/lib/academic/academic-engine";

const STATUS_STYLE: Record<string, { label: string; shortLabel: string; className: string }> = {
  VERIFIED: {
    label: "Verified",
    shortLabel: "Verified",
    className: "bg-positive-surface text-positive border-positive-border",
  },
  RESULT_DERIVED: {
    label: "RESULT DERIVED",
    shortLabel: "Derived",
    className: "bg-chart-cyan-surface text-chart-cyan border-chart-cyan-border",
  },
  WARNING: {
    label: "WARNING",
    shortLabel: "Warning",
    className: "bg-gold-surface text-gold border-gold-border",
  },
  UNAVAILABLE: {
    label: "N/A",
    shortLabel: "N/A",
    className: "bg-surface text-foreground-muted border-border-strong",
  },
  NOT_APPLICABLE: {
    label: "NOT APPLICABLE",
    shortLabel: "N/A",
    className: "bg-surface text-foreground-muted border-border-strong",
  },
  AMBIGUOUS: {
    label: "AMBIGUOUS",
    shortLabel: "Ambiguous",
    className: "bg-warning-surface text-warning border-warning-border",
  },
};

export default function ExplanationPanel({
  engine,
}: {
  engine: EngineResult;
}) {
  const p = engine.programme;
  const a = engine.analytics;
  const isAnnual = p.examinationSystem === "ANNUAL";

  // Per-metric calculation rules, reasons, and statutory citations
  const metrics: Array<{
    name: string;
    shortName?: string;
    status: string;
    reason: string;
    sources: string[];
  }> = [
    {
      name: "Grades",
      status: a.grade.status,
      reason: a.grade.reason ?? (isAnnual ? "Annual numerical/professional marking framework" : "10-point scale: O(10), A+(9), A(8), B+(7), B(6), C(5), P(4), F(0)"),
      sources: a.grade.sources.length ? a.grade.sources : [p.ordinance ? `GGSIPU ${p.ordinance}` : "University Scheme"],
    },
    {
      name: isAnnual ? "Performance Index / CPI" : "SGPA / CGPA",
      shortName: isAnnual ? "CPI" : "GPA",
      status: a.sgpa.status,
      reason: a.sgpa.reason ?? (isAnnual ? "Performance index evaluated under annual programme regulations" : "Weighted GPA = Σ(Credits × Grade Points) / Σ Credits"),
      sources: a.sgpa.sources.length ? a.sgpa.sources : [p.ordinance ? `GGSIPU ${p.ordinance}` : "University Ordinance"],
    },
    {
      name: isAnnual ? "Aggregate Percentage" : "Equivalent / Aggregate %",
      shortName: isAnnual ? "Aggregate %" : "Equiv %",
      status: a.percentage.status,
      reason: a.percentage.reason ?? (isAnnual ? "Average percentage = course marks normalized by course maxima" : "Percentage = CGPA × 10"),
      sources: a.percentage.sources.length ? a.percentage.sources : [p.ordinance ? `GGSIPU ${p.ordinance}` : "University Scheme"],
    },
    {
      name: "Division",
      status: a.division.status,
      reason: a.division.reason ?? "Classification is evaluated from cumulative academic performance.",
      sources: a.division.sources.length ? a.division.sources : [p.ordinance ? `GGSIPU ${p.ordinance}` : "Degree Award Regulations"],
    },
    {
      name: "Framework",
      status: a.framework.status,
      reason: a.framework.reason ?? a.framework.value ?? "Programme-specific duration and curriculum framework.",
      sources: a.framework.sources,
    },
    {
      name: "Course Pass",
      status: a.coursePassRule.status,
      reason: a.coursePassRule.reason ?? a.coursePassRule.value ?? "Programme-specific course passing criteria.",
      sources: a.coursePassRule.sources,
    },
    {
      name: "Promotion",
      status: a.promotion.status,
      reason: a.promotion.reason ?? "Programme-specific progression rule.",
      sources: a.promotion.sources,
    },
  ];

  return (
    <section className="rounded-lg border border-border-strong bg-surface-deep/40 text-foreground overflow-hidden shadow-xs font-mono text-xs">
      <div className="border-b border-border-strong bg-surface-deep/80 px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Scale size={14} className="text-gold shrink-0" />
          <h2 className="font-bold text-foreground uppercase tracking-wider text-xs">
            Academic Calculation Sources & Verification
          </h2>
          <span className="text-border-strong">·</span>
          <span className="font-semibold text-gold">
            {p.ordinance ? `GGSIPU ${p.ordinance}` : "University Ordinance"}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-foreground-secondary">
          <span>
            Programme: <strong className="text-foreground font-semibold">{p.programmeName ? p.programmeName.split("(")[0].trim() : (p.programmeCode || "—")}</strong>
          </span>
          <span className="text-border-strong hidden sm:inline">·</span>
          <span>
            System: <strong className="text-foreground font-semibold">{isAnnual ? "Annual Scheme" : "CBCS Semester"}</strong>
          </span>
          {p.cohort && (
            <>
              <span className="text-border-strong hidden sm:inline">·</span>
              <span>Batch: <strong className="text-foreground font-semibold">{p.cohort}</strong></span>
            </>
          )}
        </div>
      </div>

      {/* ── Per-Metric Verification & Statutory Sources Table ── */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[480px] sm:min-w-full">
          <thead>
            <tr className="bg-surface-deep border-b border-border-strong text-[10px] uppercase tracking-wider text-foreground-secondary font-bold">
              <th className="py-2.5 px-2 sm:px-4 w-[13%] sm:w-[16%]">Metric</th>
              <th className="py-2.5 px-1.5 sm:px-3 w-[11%] sm:w-[12%]">Status</th>
              <th className="py-2.5 px-3 sm:px-4 w-[52%] sm:w-[42%]">
                <span className="sm:hidden">Logic &amp; Criteria</span>
                <span className="hidden sm:inline">Calculation Logic &amp; Criteria</span>
              </th>
              <th className="py-2.5 px-2 sm:px-4 w-[24%] sm:w-[30%]">
                <span className="sm:hidden">Sources</span>
                <span className="hidden sm:inline">Statutory Sources</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-strong/40">
            {metrics.map((m) => {
              const badge = STATUS_STYLE[m.status] ?? STATUS_STYLE.UNAVAILABLE;
              return (
                <tr key={m.name} className="hover:bg-surface/50 transition-colors">
                  <td className="py-2.5 px-2 sm:py-3 sm:px-4 font-semibold sm:font-bold text-foreground text-[11px] sm:text-xs align-top">
                    {m.shortName ? (
                      <>
                        <span className="sm:hidden">{m.shortName}</span>
                        <span className="hidden sm:inline">{m.name}</span>
                      </>
                    ) : (
                      m.name
                    )}
                  </td>
                  <td className="py-2.5 px-1.5 sm:py-3 sm:px-3 align-top">
                    <span className={`inline-block px-1.5 py-0.5 sm:px-2 rounded text-[9px] sm:text-[10px] font-bold border leading-tight ${badge.className}`}>
                      <span className="sm:hidden">{badge.shortLabel ?? badge.label}</span>
                      <span className="hidden sm:inline">{badge.label}</span>
                    </span>
                  </td>
                  <td className="py-3 px-3 sm:py-3 sm:px-4 text-foreground-secondary text-[11px] sm:text-xs leading-5 sm:leading-relaxed align-top">
                    {m.reason}
                  </td>
                  <td className="py-3 px-2 sm:py-3 sm:px-4 align-top">
                    <div className="flex flex-wrap gap-1.5">
                      {Array.from(new Set(m.sources)).length > 0 ? (
                        Array.from(new Set(m.sources)).map((src, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 rounded bg-surface border border-border-strong px-1.5 py-0.5 sm:px-2 text-[9px] sm:text-[10px] font-mono text-foreground-secondary hover:border-gold-border transition-colors"
                          >
                            <BookOpen size={9} className="text-gold shrink-0" />
                            <span>{src}</span>
                          </span>
                        ))
                      ) : (
                        <span className="text-foreground-muted text-[11px]">—</span>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {engine.warnings.length > 0 && (
        <div className="p-3 sm:p-3 border-t border-border-strong bg-surface-deep/60 space-y-2 sm:space-y-1.5">
          {engine.warnings.map((w, i) => (
            <div
              key={i}
              className={`flex items-start gap-2 p-2.5 sm:p-2 rounded border text-[11px] leading-5 sm:leading-normal ${
                w.severity === "HIGH"
                  ? "border-grade-fail-border bg-grade-fail-surface text-grade-fail"
                  : w.severity === "WARNING"
                  ? "border-gold-border bg-gold-surface text-gold"
                  : "border-border-strong bg-surface text-foreground-secondary"
              }`}
            >
              <AlertTriangle size={13} className="shrink-0 mt-0.5" />
              <span className="leading-5 sm:leading-normal">{w.message}</span>
            </div>
          ))}
        </div>
      )}

      {p.programmeFamily && (
        <div className="border-t border-border-strong bg-surface-deep/40 px-4 py-2.5 sm:py-2 text-[11px] leading-5 sm:leading-normal text-foreground-secondary">
          {p.programmeName ? p.programmeName.split("(")[0].trim() : (p.programmeCode || "Programme")} program is generalized in {p.programmeFamily} family.
        </div>
      )}

      <div className="border-t border-border-strong bg-surface px-4 py-3.5 sm:py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-2 text-[11px] text-foreground-muted">
        <div className="flex items-start sm:items-center gap-2">
          <ShieldCheck size={13} className="text-positive shrink-0 mt-0.5 sm:mt-0" />
          <span className="leading-5 sm:leading-relaxed">
            Anviksha is an independent student platform and is not affiliated with or endorsed by GGSIPU. Official university marksheets and gazette notifications always supersede online calculations.
          </span>
        </div>
        <span className="text-foreground-secondary font-medium shrink-0 pt-0.5 sm:pt-0">
          Badges reflect per-rule verification
        </span>
      </div>
    </section>
  );
}
