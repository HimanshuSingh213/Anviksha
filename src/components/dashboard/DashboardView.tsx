"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { AlertTriangle, ArrowRight, BarChart2 } from "lucide-react";
import ExplanationPanel from "@/components/analytics/ExplanationPanel";
import CreditTipModal from "./CreditTipModal";
import MetricsStrip from "./MetricsStrip";
import ResultsSummary from "./ResultsSummary";
import ResultsTable from "./ResultsTable";
import SemesterTabs from "./SemesterTabs";
import StudentHeader from "./StudentHeader";
import { ALL, getDashboardMetrics, getSemesterTabs } from "./dashboard-metrics";
import type { EngineResult } from "@/types/result";

export default function DashboardView({ engine }: { engine: EngineResult }) {
  const [activeSem, setActiveSem] = useState(ALL);

  const tabs = getSemesterTabs(engine.subjectResults);
  const metrics = getDashboardMetrics(engine, activeSem);
  const hasCreditColumn = !metrics.isPercentageFramework;

  return (
    <div className="min-h-screen bg-background text-foreground">
      {hasCreditColumn && <CreditTipModal />}

      <main id="main-content" className="mx-auto max-w-7xl space-y-8 px-4 py-10 sm:px-6 lg:py-12">
        {engine.warnings.length > 0 && (
          <div className="flex items-start gap-3 rounded-md border border-gold-border bg-gold-surface p-4 text-sm leading-6 text-gold">
            <AlertTriangle size={15} className="mt-1 shrink-0" aria-hidden="true" />
            <div className="space-y-1">
              {engine.warnings.map((w, i) => (
                <p key={i}>{w.message}</p>
              ))}
            </div>
          </div>
        )}

        {engine.profile && <StudentHeader profile={engine.profile} />}

        <section>
          <SemesterTabs tabs={tabs} active={activeSem} onChange={setActiveSem} />
          <div className="mt-6">
            <MetricsStrip metrics={metrics} />
          </div>
        </section>

        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut", delay: 0.16 }}
          className="home-panel overflow-hidden"
        >
          <ResultsTable
            key={activeSem}
            scope={metrics.scope}
            subjects={metrics.subjects}
            hasCreditColumn={hasCreditColumn}
            noGradeReason={engine.analytics.grade.reason}
          />
          {metrics.subjects.length > 0 && <ResultsSummary metrics={metrics} />}
        </motion.section>

        <section className="flex flex-col items-start justify-between gap-5 border-t border-border pt-8 sm:flex-row sm:items-center">
          <p className="max-w-xl text-sm leading-6 text-foreground-secondary">
            Promotion standing, placement eligibility, semester grade sheets and the master transcript are on the analytics page.
          </p>
          <Link
            href="/dashboard/analytics"
            className="group inline-flex shrink-0 items-center justify-center gap-3 rounded-md border border-white bg-white px-6 py-3 font-mono text-xs font-bold uppercase tracking-wider text-black transition-colors duration-200 hover:bg-neutral-200"
          >
            <BarChart2 size={15} aria-hidden="true" />
            View Full Analytics
            <ArrowRight size={14} aria-hidden="true" className="transition-transform duration-200 group-hover:translate-x-1" />
          </Link>
        </section>

        <ExplanationPanel engine={engine} />
      </main>
    </div>
  );
}
