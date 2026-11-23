"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { AlertTriangle, ArrowRight, BarChart2, ClipboardList } from "lucide-react";
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
  const hasSubjects = engine.subjectResults.length > 0;

  return (
    <div className="min-h-screen bg-background text-foreground">
      {hasSubjects && hasCreditColumn && <CreditTipModal />}

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

        {hasSubjects ? (
          <>
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
          </>
        ) : (
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="home-panel p-6 sm:p-8"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-gold-border bg-gold-surface text-gold">
                <ClipboardList size={16} aria-hidden="true" />
              </span>
              <h2 className="text-lg font-bold tracking-tight text-foreground">
                No results declared yet
              </h2>
            </div>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-foreground-secondary">
              GGSIPU has not published any semester result for this enrollment yet. If you are in your
              first semester or waiting for a recent declaration, your grades are still with the university.
            </p>
            <Link
              href="/rc"
              className="group mt-5 inline-flex items-center justify-center gap-2 rounded-md border border-foreground bg-foreground px-5 py-2.5 font-mono text-xs font-bold uppercase tracking-wider text-background transition-opacity hover:opacity-90"
            >
              View Appearing List
              <ArrowRight size={14} aria-hidden="true" className="transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
          </motion.section>
        )}

        <section className="flex flex-col items-start justify-between gap-5 border-t border-border pt-8 sm:flex-row sm:items-center">
          <p className="max-w-xl text-sm leading-6 text-foreground-secondary">
            Promotion standing, placement eligibility, semester grade sheets and the master transcript are on the analytics page. Your appearing list (RC) lives on its own page.
          </p>
          <div className="flex w-full shrink-0 flex-col sm:flex-row sm:w-auto items-center justify-center gap-3">
            <Link
              href="/rc"
              className="group inline-flex w-full sm:w-auto items-center justify-center gap-3 rounded-md border border-border-strong bg-surface px-6 py-3 font-mono text-xs font-bold uppercase tracking-wider text-foreground-secondary transition-colors duration-200 hover:border-gold-border hover:text-gold text-center"
            >
              <ClipboardList size={15} aria-hidden="true" />
              View Appearing List
              <ArrowRight size={14} aria-hidden="true" className="transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
            <Link
              href="/dashboard/analytics"
              className="group inline-flex w-full sm:w-auto items-center justify-center gap-3 rounded-md border border-foreground bg-foreground px-6 py-3 font-mono text-xs font-bold uppercase tracking-wider text-background transition-colors duration-200 hover:bg-foreground/85 text-center"
            >
              <BarChart2 size={15} aria-hidden="true" />
              View Full Analytics
              <ArrowRight size={14} aria-hidden="true" className="transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
          </div>
        </section>

        {hasSubjects && <ExplanationPanel engine={engine} />}
      </main>
    </div>
  );
}
