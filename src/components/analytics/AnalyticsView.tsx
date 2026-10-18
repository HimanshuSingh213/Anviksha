"use client";

import { ReactNode, useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, ShieldCheck, Briefcase, Layers, FlaskConical, AlertTriangle, X, ArrowLeft } from "lucide-react";
import type { EngineResult } from "@/types/result";
import SemesterTabs from "@/components/dashboard/SemesterTabs";
import ExportMenu from "@/components/analytics/ExportMenu";
import AnalyticsOverview from "@/components/analytics/AnalyticsOverview";
import DivisionClassificationCard from "@/components/analytics/DivisionClassificationCard";
import AcademicPromotionCard from "@/components/analytics/AcademicPromotionCard";
import PlacementEligibilityCard from "@/components/analytics/PlacementEligibilityCard";
import ReappearSessionPlanner from "@/components/analytics/ReappearSessionPlanner";
import SemesterTrendChart from "@/components/analytics/SemesterTrendChart";
import QuickStatsDistribution from "@/components/analytics/QuickStatsDistribution";
import ExplanationPanel from "@/components/analytics/ExplanationPanel";
import { SpecialAnnualAnalytics, SpecialAnnualStanding } from "@/components/analytics/AnnualPanels";

// Staggered reveal animation wrapper.
function Reveal({ children, order = 0, className = "" }: { children: ReactNode; order?: number; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut", delay: order * 0.06 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// The four views. `label` shows on desktop, `shortLabel` on phones.
const ANALYTICS_VIEWS = [
  { id: "performance", label: "Performance & Trends", shortLabel: "Performance", icon: TrendingUp },
  { id: "standing", label: "Promotion & Standing", shortLabel: "Standing", icon: ShieldCheck },
  { id: "placement", label: "Placement Gatekeeper", shortLabel: "Placement", icon: Briefcase },
  { id: "all", label: "All Insights", shortLabel: "All Insights", icon: Layers },
] as const;

type ViewId = (typeof ANALYTICS_VIEWS)[number]["id"];

const ROMAN = ["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];

export default function AnalyticsView({ engine }: { engine: EngineResult }) {
  const [activeSem, setActiveSem] = useState("100");
  const [activeView, setActiveView] = useState<ViewId>("performance");
  const [showHighWarning, setShowHighWarning] = useState(true);

  const { analytics, programme, subjectResults, warnings } = engine;
  const isTech = programme.isTech;
  const isAnnual = programme.examinationSystem === "ANNUAL";
  const isOrd11 = programme.ordinance === "ORD_11";
  const isOverall = activeSem === "100";

  // Placement view only exists for technical programmes (B.Tech, BCA, MCA, M.Tech).
  const availableViews = ANALYTICS_VIEWS.filter((tab) => isTech || tab.id !== "placement");

  // If the placement view was open and the student is non-tech, fall back to performance.
  useEffect(() => {
    if (!isTech && activeView === "placement") {
      setActiveView("performance");
    }
  }, [isTech, activeView]);

  // The semesters that actually have results (1-10), sorted oldest first.
  const availableSemesters: number[] = [];
  for (const subject of subjectResults) {
    const sem = Number(subject.semester);
    if (sem >= 1 && sem <= 10 && !availableSemesters.includes(sem)) {
      availableSemesters.push(sem);
    }
  }
  availableSemesters.sort((a, b) => a - b);

  // "All" plus one tab per semester that has results.
  const semesterTabs = [
    { label: "All", value: "100" },
    ...availableSemesters.map((sem) => ({ label: ROMAN[sem] ?? String(sem), value: String(sem) })),
  ];

  // "100" (All) shows everything; otherwise just that one semester.
  const visibleSubjects = subjectResults.filter((s) => isOverall || String(s.semester) === activeSem);

  // The headline GPA: overall uses CGPA, a single semester uses that semester's SGPA.
  const semesterGpa = analytics.sgpaBySemester?.find((p) => String(p.semester) === activeSem)?.sgpa.value;
  const gpa = isOverall ? analytics.cgpa.value : semesterGpa !== undefined ? semesterGpa : null;
  const gpaLabel = isOverall ? "Overall CGPA" : `Semester ${activeSem} SGPA`;

  // Subjects whose kept attempt is still not cleared.
  const backlogs = visibleSubjects.filter(
    (s) => s.semantic === "NOT_CLEARED" || s.semantic === "ABSENT" || s.semantic === "DETAINED"
  );

  const highWarnings = warnings.filter((w) => w.severity === "HIGH");

  // Small totals used by the overview and the placement card.
  const passedSubjects = visibleSubjects.filter((s) => s.semantic === "PASS" || s.semantic === "CREDIT_SECURED" || s.semantic === "ALREADY_PASSED");
  let obtainedMarks = 0;
  for (const subject of passedSubjects) {
    obtainedMarks += subject.total !== undefined ? subject.total : 0;
  }
  let totalMaxMarks = 0;
  for (const subject of visibleSubjects) {
    totalMaxMarks += subject.maxMarks !== null ? subject.maxMarks : 100;
  }
  let earnedCredits = 0;
  let totalCredits = 0;
  for (const subject of visibleSubjects) {
    if (subject.credits.value !== null) {
      totalCredits += subject.credits.value;
      if (passedSubjects.includes(subject)) earnedCredits += subject.credits.value;
    }
  }
  const stats = {
    gpa,
    earnedCredits,
    totalCredits,
    obtainedMarks,
    totalMaxMarks,
    backlogs: backlogs.length,
    passedCount: visibleSubjects.length - backlogs.length,
    totalSubjects: visibleSubjects.length,
  };

  // Percentage follows the selected scope: overall = CGPA × 10 (Ordinance 11)
  // or the annual average; a single semester = that semester's own numbers.
  let percentage: number | null = null;
  if (isOverall) {
    const overallPct = analytics.percentage.value;
    const annualAvg = isAnnual ? analytics.averagePercentage.value : null;
    percentage = overallPct !== null ? overallPct : annualAvg;
  } else {
    const semPercentMetric = analytics.sgpaBySemester?.find((p) => String(p.semester) === activeSem)?.sgpa;
    if (isOrd11 && semPercentMetric?.value !== null && semPercentMetric?.value !== undefined) {
      percentage = Math.round(semPercentMetric.value * 10 * 100) / 100;
    } else {
      const semSummary = analytics.semesterSummaries.value?.find((p) => String(p.semester) === activeSem);
      percentage = semSummary?.averagePercentage !== undefined ? semSummary.averagePercentage : null;
    }
  }

  const isPromotionVerified = isOrd11 && (analytics.promotion.status === "VERIFIED" || analytics.promotion.status === "RESULT_DERIVED");
  const isDivisionVerified = (analytics.division.status === "VERIFIED" || analytics.division.status === "RESULT_DERIVED") && analytics.division.value !== null;
  let percentSub = analytics.percentage.reason ?? "Statutory scheme";
  if (isOrd11) {
    percentSub = isOverall ? "CGPA × 10 (Ordinance 11)" : "SGPA × 10 (Ordinance 11)";
  }

  // ── The sections of the page. Each one is shown inside the views further down. ──

  const overview = (
    <AnalyticsOverview
      gpa={stats.gpa !== null ? stats.gpa.toFixed(2) : "—"}
      gpaLabel={gpaLabel}
      earnedCredits={stats.earnedCredits}
      totalCredits={stats.totalCredits}
      obtainedMarks={stats.obtainedMarks}
      totalMaxMarks={stats.totalMaxMarks}
      percentage={percentage !== null ? percentage.toFixed(2) : "—"}
      backlogsCount={stats.backlogs}
      percentSub={percentSub}
    />
  );

  const quickStats = <QuickStatsDistribution subjectResults={visibleSubjects} totalSubjects={stats.totalSubjects} />;

  // The marks chart follows the selected semester, the SGPA trend always shows every semester.
  const trendCharts = (
    <SemesterTrendChart
      sgpaBySemester={analytics.sgpaBySemester}
      semesterPerformance={analytics.semesterPerformance}
      subjectResults={visibleSubjects}
    />
  );

  // Division + promotion + re-appear (not for annual programmes).
  const divisionCard = isDivisionVerified && (
    <DivisionClassificationCard
      isOverall={isOverall}
      divisionName={analytics.division.value}
      divisionStatus={analytics.division.status}
      ordinanceName={programme.ordinance}
      reason={analytics.division.reason}
      presentation={analytics.divisionPresentation}
    />
  );
  const promotionCard = isPromotionVerified && (
    <AcademicPromotionCard promotion={analytics.academicPromotion} />
  );
  const reappearCard = isPromotionVerified && (
    <ReappearSessionPlanner plan={analytics.reappearPlan} />
  );
  const standingCards = [divisionCard, promotionCard, reappearCard];

  const noStandingRules = !isDivisionVerified && !isPromotionVerified && (
    <div className="home-panel p-6 text-sm leading-6 text-foreground-muted">
      Academic promotion criteria and division classification rules are governed specifically by {programme.ordinance ?? "statutory regulations"} for {programme.programmeName}.
    </div>
  );

  const placementCard = isTech && stats.gpa !== null && (
    <PlacementEligibilityCard
      cgpa={stats.gpa}
      activeBacklogs={stats.backlogs}
      isOverall={isOverall}
    />
  );

  const noPlacementGpa = (
    <div className="home-panel p-6 text-sm leading-6 text-foreground-muted">
      Placement benchmarks require a valid cumulative GPA.
    </div>
  );

  // What the current view shows, from top to bottom.
  let sections: ReactNode[] = [];
  if (activeView === "performance") {
    sections = isAnnual ? [<SpecialAnnualAnalytics key="annual" engine={engine} />] : [overview, quickStats, trendCharts];
  } else if (activeView === "standing") {
    sections = isAnnual ? [<SpecialAnnualStanding key="annual" engine={engine} />] : [...standingCards, noStandingRules];
  } else if (activeView === "placement") {
    sections = [stats.gpa !== null ? placementCard : noPlacementGpa];
  } else {
    sections = isAnnual
      ? [<SpecialAnnualAnalytics key="annual" engine={engine} />, <SpecialAnnualStanding key="standing" engine={engine} />]
      : [overview, ...standingCards, placementCard, quickStats, trendCharts];
  }
  sections = sections.filter(Boolean);

  return (
    <div className="min-h-screen bg-background text-foreground">

      <main id="main-content" className="mx-auto max-w-7xl space-y-6 px-4 py-10 sm:px-6 lg:space-y-8 lg:py-12">

        {/* Page title */}
        <div className="flex items-end justify-between gap-4">
          <h1 className="text-2xl font-semibold tracking-[-0.02em] sm:text-3xl">Analytics</h1>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 pb-1 font-mono text-xs text-foreground-muted transition-colors hover:text-foreground"
          >
            <ArrowLeft size={13} aria-hidden="true" />
            Back to results
          </Link>
        </div>

        {/* HIGH-severity warning notice */}
        {highWarnings.length > 0 && showHighWarning && (
          <div className="flex items-start gap-3 rounded-md border border-gold-border bg-gold-surface p-4 text-sm leading-6 text-gold">
            <AlertTriangle size={15} className="mt-1 shrink-0" aria-hidden="true" />
            <span className="flex-1">{highWarnings[0].message}</span>
            <button
              type="button"
              onClick={() => setShowHighWarning(false)}
              className="mt-1 shrink-0 cursor-pointer opacity-70 transition-opacity hover:opacity-100"
              aria-label="Dismiss notice"
            >
              <X size={14} aria-hidden="true" />
            </button>
          </div>
        )}

        {/* Controls: semester tabs, then the view switcher and the download menu */}
        <div className="space-y-5">
          <SemesterTabs tabs={semesterTabs} active={activeSem} onChange={setActiveSem} />

          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            {/* Perspective tabs. The highlight slides to the selected one. */}
            <div className="flex w-full rounded-xl border border-border bg-surface p-1 sm:w-fit">
              {availableViews.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeView === tab.id;

                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveView(tab.id)}
                    className={`relative flex flex-1 cursor-pointer flex-col items-center justify-center gap-1 rounded-lg px-1 py-2 font-mono text-[11px] font-semibold leading-tight transition-colors sm:flex-none sm:flex-row sm:gap-2 sm:px-4 sm:text-xs ${
                      isActive ? "text-foreground" : "text-foreground-muted hover:text-foreground-secondary"
                    }`}
                  >
                    {isActive && (
                      <motion.span
                        layoutId="analyticsViewTab"
                        transition={{ type: "spring", stiffness: 450, damping: 35 }}
                        className="absolute inset-0 rounded-lg bg-surface-elevated ring-1 ring-inset ring-border-strong"
                      />
                    )}
                    <Icon
                      size={15}
                      aria-hidden="true"
                      className={`relative shrink-0 transition-colors ${isActive ? "text-gold" : ""}`}
                    />
                    <span className="relative hidden sm:inline">{tab.label}</span>
                    <span className="relative text-center sm:hidden">{tab.shortLabel}</span>
                  </button>
                );
              })}
            </div>

            <ExportMenu availableSemesters={availableSemesters} />
          </div>
        </div>

        {/* The selected view. Sections fade in one after another. */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeView}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="space-y-4 lg:space-y-6"
          >
            {sections.map((section, index) => (
              <Reveal key={index} order={index}>
                {section}
              </Reveal>
            ))}
          </motion.div>
        </AnimatePresence>

        {/* Bottom: how everything above was calculated */}
        <section className="space-y-4 border-t border-border pt-8" aria-label="Calculation details">
          <h2 className="flex items-center gap-2.5 text-base font-semibold tracking-[-0.01em] text-foreground">
            <FlaskConical size={16} className="text-gold" aria-hidden="true" />
            Details — How This Analysis Was Calculated
          </h2>
          <ExplanationPanel engine={engine} />
        </section>

      </main>
    </div>
  );
}
