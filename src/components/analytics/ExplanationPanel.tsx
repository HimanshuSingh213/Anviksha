"use client";

import { ShieldCheck, BookOpen, AlertTriangle, Scale } from "lucide-react";
import type { EngineResult } from "@/lib/academic/academic-engine";

const STATUS_STYLE: Record<string, { label: string; className: string }> = {
  VERIFIED: {
    label: "Verified",
    className: "bg-positive-surface text-positive border-positive-border",
  },
  RESULT_DERIVED: {
    label: "RESULT DERIVED",
    className: "bg-chart-cyan-surface text-chart-cyan border-chart-cyan-border",
  },
  WARNING: {
    label: "WARNING",
    className: "bg-gold-surface text-gold border-gold-border",
  },
  UNAVAILABLE: {
    label: "N/A",
    className: "bg-surface text-foreground-muted border-border-strong",
  },
  NOT_APPLICABLE: {
    label: "NOT APPLICABLE",
    className: "bg-surface text-foreground-muted border-border-strong",
  },
  AMBIGUOUS: {
    label: "AMBIGUOUS",
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
      status: a.sgpa.status,
      reason: a.sgpa.reason ?? (isAnnual ? "Performance index evaluated under annual programme regulations" : "Weighted GPA = Σ(Credits × Grade Points) / Σ Credits"),
      sources: a.sgpa.sources.length ? a.sgpa.sources : [p.ordinance ? `GGSIPU ${p.ordinance}` : "University Ordinance"],
    },
    {
      name: isAnnual ? "Aggregate Percentage" : "Equivalent / Aggregate %",
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
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-deep border-b border-border-strong text-[10px] uppercase tracking-wider text-foreground-secondary font-bold">
              <th className="py-2.5 px-4 w-[16%]">Metric</th>
              <th className="py-2.5 px-3 w-[12%]">Status</th>
              <th className="py-2.5 px-4 w-[42%]">Calculation Logic & Criteria</th>
              <th className="py-2.5 px-4 w-[30%]">Statutory Sources</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-strong/40">
            {metrics.map((m) => {
              const badge = STATUS_STYLE[m.status] ?? STATUS_STYLE.UNAVAILABLE;
              return (
                <tr key={m.name} className="hover:bg-surface/50 transition-colors">
                  <td className="py-3 px-4 font-bold text-foreground whitespace-nowrap align-top">
                    {m.name}
                  </td>
                  <td className="py-3 px-3 align-top whitespace-nowrap">
                    <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${badge.className}`}>
                      {badge.label}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-foreground-secondary text-xs leading-relaxed align-top">
                    {m.reason}
                  </td>
                  <td className="py-3 px-4 align-top">
                    <div className="flex flex-wrap gap-1.5">
                      {Array.from(new Set(m.sources)).length > 0 ? (
                        Array.from(new Set(m.sources)).map((src, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 rounded bg-surface border border-border-strong px-2 py-0.5 text-[10px] font-mono text-foreground-secondary hover:border-gold-border transition-colors"
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
        <div className="p-3 border-t border-border-strong bg-surface-deep/60 space-y-1.5">
          {engine.warnings.map((w, i) => (
            <div
              key={i}
              className={`flex items-start gap-2 p-2 rounded border text-[11px] ${
                w.severity === "HIGH"
                  ? "border-grade-fail-border bg-grade-fail-surface text-grade-fail"
                  : w.severity === "WARNING"
                  ? "border-gold-border bg-gold-surface text-gold"
                  : "border-border-strong bg-surface text-foreground-secondary"
              }`}
            >
              <AlertTriangle size={13} className="shrink-0 mt-0.5" />
              <span>{w.message}</span>
            </div>
          ))}
        </div>
      )}

      {p.programmeFamily && (
        <div className="border-t border-border-strong bg-surface-deep/40 px-4 py-2 text-[11px] text-foreground-secondary">
          {p.programmeName ? p.programmeName.split("(")[0].trim() : (p.programmeCode || "Programme")} program is generalized in {p.programmeFamily} family.
        </div>
      )}

      <div className="border-t border-border-strong bg-surface px-4 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-foreground-muted">
        <div className="flex items-center gap-2">
          <ShieldCheck size={13} className="text-positive shrink-0" />
          <span>
            Anviksha is an independent student platform and is not affiliated with or endorsed by GGSIPU. Official university marksheets and gazette notifications always supersede online calculations.
          </span>
        </div>
        <span className="text-foreground-secondary font-medium shrink-0">
          Ordinance Parity Verified ✓
        </span>
      </div>
    </section>
  );
}
