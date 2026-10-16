"use client";

import { motion } from "framer-motion";
import { ProvenanceChip } from "@/components/analytics/ProvenanceChip";
import type { getDashboardMetrics } from "./dashboard-metrics";

type Metrics = ReturnType<typeof getDashboardMetrics>;

// Summary metrics strip (GPA, percentage, credits, backlogs)
export default function MetricsStrip({ metrics }: { metrics: Metrics }) {
  const { gpa, percent, credits, backlogs, subjects } = metrics;

  const gpaApplies = gpa.metric.status !== "NOT_APPLICABLE";
  const backlogNote =
    backlogs.length === 0 ? "all cleared" : backlogs.length === 1 ? "1 backlog" : `${backlogs.length} backlogs`;

  // Highlights GPA or percentage based on programme scheme
  const cells = [
    {
      label: gpa.label,
      value: gpa.display,
      note: gpaApplies ? "out of 10.00" : "Percentage scheme",
      tone: gpaApplies ? "text-gold" : "text-foreground-muted",
      status: gpa.metric.status,
      tip: gpa.metric.reason ?? "Derived from semester course marks and credits using Ordinance formula.",
    },
    {
      label: percent.label,
      value: percent.display,
      note: percent.note,
      tone: gpaApplies ? "text-foreground" : "text-gold",
      status: percent.metric.status,
      tip: percent.metric.reason ?? "Percentage derived under university regulations.",
    },
    {
      label: credits.hasCredits ? "Credits earned" : "Subjects cleared",
      value: String(credits.hasCredits ? credits.earned : credits.clearedCount),
      suffix: ` / ${credits.hasCredits ? credits.offered : subjects.length}`,
      note: credits.note,
      tone: "text-foreground",
      status: "RESULT_DERIVED" as const,
      tip: credits.hasCredits
        ? "Credits earned across cleared course examinations."
        : "Count of cleared courses in examination result.",
    },
    {
      label: "Backlogs",
      value: String(backlogs.length),
      note: backlogNote,
      tone: backlogs.length > 0 ? "text-grade-fail" : "text-grade-excellent",
      status: "RESULT_DERIVED" as const,
      tip: "Subject clearance evaluated from official result status.",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut", delay: 0.08 }}
      className="home-panel overflow-hidden"
    >
      <div className="grid grid-cols-2 gap-px bg-border lg:grid-cols-4">
        {cells.map((cell) => (
          <div key={cell.label} className="flex flex-col bg-surface p-5 sm:p-6">
            <p className="text-xs text-foreground-secondary">{cell.label}</p>
            <p className={`tnum mt-3 font-mono text-3xl font-semibold tracking-tight sm:text-4xl ${cell.tone}`}>
              {cell.value}
              {cell.suffix && <span className="text-lg font-medium text-foreground-muted sm:text-xl">{cell.suffix}</span>}
            </p>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
              <span className="text-xs text-foreground-muted">{cell.note}</span>
              <ProvenanceChip state={cell.status} tooltip={cell.tip} />
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
