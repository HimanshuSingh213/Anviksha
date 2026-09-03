"use client";

import { KeyboardEvent, useEffect, useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, ShieldCheck, Briefcase, Layers, FlaskConical, AlertTriangle } from "lucide-react";
import { track } from "@vercel/analytics";
import useResultStore from "@/store/result-store";
import { analyzeResult } from "@/lib/academic/academic-engine";
import Skeleton from "@/components/dashboard/Skeleton";
import AppNavbar from "@/components/common/AppNavbar";
import SemesterSelector from "@/components/analytics/SemesterSelector";
import AnalyticsOverview from "@/components/analytics/AnalyticsOverview";
import DivisionClassificationCard from "@/components/analytics/DivisionClassificationCard";
import AcademicPromotionCard from "@/components/analytics/AcademicPromotionCard";
import PlacementEligibilityCard from "@/components/analytics/PlacementEligibilityCard";
import ReappearSessionPlanner from "@/components/analytics/ReappearSessionPlanner";
import SemesterTrendChart from "@/components/analytics/SemesterTrendChart";
import QuickStatsDistribution from "@/components/analytics/QuickStatsDistribution";
import ExplanationPanel from "@/components/analytics/ExplanationPanel";

const ANALYTICS_VIEWS = [
    { id: "performance", label: "Performance & Trends", icon: TrendingUp },
    { id: "standing", label: "Promotion & Standing", icon: ShieldCheck },
    { id: "placement", label: "Placement Gatekeeper", icon: Briefcase },
    { id: "all", label: "All Insights", icon: Layers },
] as const;

type AnalyticsViewType = (typeof ANALYTICS_VIEWS)[number]["id"];

export default function AnalyticsPage() {
    const router = useRouter();
    const fullResult = useResultStore((state) => state.result);
    const customCredit = useResultStore((state) => state.customCredits);
    const [activeSem, setActiveSem] = useState<string>("100");
    const [activeView, setActiveView] = useState<AnalyticsViewType>("performance");
    const [showHighWarning, setShowHighWarning] = useState<boolean>(true);

    useEffect(() => {
        if (!fullResult) router.push("/dashboard");
    }, [fullResult, router]);

    const engine = useMemo(
        () => analyzeResult(fullResult, customCredit),
        [fullResult, customCredit]
    );

    const profile = useMemo(() => fullResult?.stprofile, [fullResult?.stprofile]);
    const allResults = useMemo(() => fullResult?.stresult ?? [], [fullResult?.stresult]);
    const { analytics, programme, courses } = engine;
    const isTech = programme.isTech;
    const isAnnual = programme.examinationSystem === "ANNUAL";

    // Filter perspectives: only show Placement Eligibility for technical programmes (B.Tech, BCA, MCA, M.Tech)
    const availableViews = useMemo(() => {
        return ANALYTICS_VIEWS.filter((tab) => {
            if (tab.id === "placement") return isTech;
            return true;
        });
    }, [isTech]);

    // If active perspective was placement and student is non-tech, fallback to performance
    useEffect(() => {
        if (!isTech && activeView === "placement") {
            setActiveView("performance");
        }
    }, [isTech, activeView]);

    const handleViewKeyDown = useCallback((
        event: KeyboardEvent<HTMLButtonElement>,
        currentIndex: number,
    ) => {
        const isHorizontalKey = event.key === "ArrowRight" || event.key === "ArrowLeft";
        const isBoundaryKey = event.key === "Home" || event.key === "End";
        if (!isHorizontalKey && !isBoundaryKey) return;

        event.preventDefault();

        let nextIndex = currentIndex;
        if (event.key === "ArrowRight") {
            nextIndex = (currentIndex + 1) % availableViews.length;
        } else if (event.key === "ArrowLeft") {
            nextIndex = (currentIndex - 1 + availableViews.length) % availableViews.length;
        } else if (event.key === "Home") {
            nextIndex = 0;
        } else if (event.key === "End") {
            nextIndex = availableViews.length - 1;
        }

        const nextView = availableViews[nextIndex];
        setActiveView(nextView.id);

        const tabButtons = event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>(
            '[role="tab"]',
        );
        window.requestAnimationFrame(() => tabButtons?.[nextIndex]?.focus());
    }, [availableViews]);

    const availableSemesters = useMemo(() => {
        const list: number[] = [];
        courses.forEach((c) => {
            const semNum = Number(c.period);
            if (semNum >= 1 && semNum <= 10 && !list.includes(semNum)) {
                list.push(semNum);
            }
        });
        return list.sort((a, b) => a - b);
    }, [courses]);

    const visibleCourses = useMemo(
        () => activeSem === "100" ? courses : courses.filter((c) => String(c.period) === activeSem),
        [courses, activeSem]
    );

    const filteredResults = useMemo(
        () => allResults.filter((row: any[]) => activeSem === "100" || String(row[0]) === activeSem),
        [allResults, activeSem]
    );

    const perSemesterSgpa = activeSem === "100"
        ? analytics.cgpa.value
        : analytics.sgpaByPeriod?.find((p) => String(p.period) === activeSem)?.sgpa.value ?? null;

    const gpaLabel = activeSem === "100" ? "Overall CGPA" : `Semester ${activeSem} SGPA`;
    const isOverall = activeSem === "100";

    const backlogs = courses.filter(
        (c) => c.semantic === "NOT_CLEARED" || c.semantic === "ABSENT" || c.semantic === "DETAINED"
    );

    const highWarnings = engine.warnings.filter((w) => w.severity === "HIGH");

    const stats = useMemo(() => {
        const rawGpa = activeSem === "100" ? analytics.cgpa.value : perSemesterSgpa;
        const numericCourses = visibleCourses.filter((c) => c.total !== undefined);
        const passedCourses = numericCourses.filter(
            (c) => c.semantic === "PASS" || c.semantic === "CREDIT_SECURED" || c.semantic === "ALREADY_PASSED"
        );
        const obtainedMarks = passedCourses.reduce((sum, c) => sum + (c.total ?? 0), 0);
        const totalMaxMarks = visibleCourses.reduce((sum, c) => sum + (c.maxMarks ?? 100), 0);
        const knownCredits = visibleCourses.filter((c) => c.credits.value !== null);
        const totalCredits = knownCredits.reduce((s, c) => s + (c.credits.value ?? 0), 0);
        const earnedCredits = knownCredits
            .filter((c) => c.semantic === "PASS" || c.semantic === "CREDIT_SECURED" || c.semantic === "ALREADY_PASSED")
            .reduce((s, c) => s + (c.credits.value ?? 0), 0);

        return {
            gpa: rawGpa,
            earnedCredits,
            totalCredits,
            obtainedMarks,
            totalMaxMarks,
            backlogs: backlogs.length,
        };
    }, [activeSem, analytics.cgpa.value, perSemesterSgpa, visibleCourses, backlogs.length]);

    const percentage = analytics.percentage.value ?? (isAnnual ? analytics.averagePercentage.value : null);

    const isOrd11 = programme.ordinance === "ORD_11";
    const isPromotionVerified = isOrd11 && (engine.analytics.promotion.status === "VERIFIED" || engine.analytics.promotion.status === "RESULT_DERIVED");
    const isDivisionVerified = (engine.analytics.division.status === "VERIFIED" || engine.analytics.division.status === "RESULT_DERIVED") && engine.analytics.division.value !== null;
    const percentSub = isOrd11
        ? (isOverall ? "CGPA × 10 (Ordinance 11)" : "SGPA × 10 (Ordinance 11)")
        : (engine.analytics.percentage.reason ?? "Statutory scheme");

    if (!fullResult) return <Skeleton />;

    return (
        <div className="min-h-screen bg-background text-foreground">
            <AppNavbar profile={profile} />

            <main className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 sm:py-10 lg:space-y-10">

                {/* HIGH-severity warning notice */}
                {highWarnings.length > 0 && showHighWarning && (
                    <div className="flex items-start gap-2 rounded-md border border-gold-border/60 bg-gold-surface/60 px-4 py-2 text-[11px] font-mono text-gold">
                        <AlertTriangle size={12} className="shrink-0 mt-0.5" aria-hidden />
                        <span className="flex-1">{highWarnings[0].message}</span>
                        <button
                            type="button"
                            onClick={() => setShowHighWarning(false)}
                            className="shrink-0 opacity-70 hover:opacity-100"
                            aria-label="Dismiss notice"
                        >
                            ✕
                        </button>
                    </div>
                )}

                {/* Semester filter + Marksheet download */}
                <SemesterSelector
                    activeSem={activeSem}
                    onSelectSem={setActiveSem}
                    totalSubjects={visibleCourses.length}
                    availableSemesters={availableSemesters}
                />

                {/* Perspective Navigation Switcher */}
                <div
                    role="tablist"
                    aria-label="Analytics Perspectives"
                    className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-1.5 p-1.5 bg-surface border border-border-strong rounded-md shadow-xs"
                >
                    {availableViews.map((tab, index) => {
                        const Icon = tab.icon;
                        const isActive = activeView === tab.id;

                        return (
                            <button
                                key={tab.id}
                                id={`tab-${tab.id}`}
                                role="tab"
                                aria-selected={isActive}
                                aria-controls={`panel-${tab.id}`}
                                tabIndex={isActive ? 0 : -1}
                                type="button"
                                onClick={() => {
                                    track("switch_analytics_view", { view: tab.id });
                                    setActiveView(tab.id);
                                }}
                                onKeyDown={(event) => handleViewKeyDown(event, index)}
                                className={`relative flex items-center justify-center sm:justify-start gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-2 sm:py-1.5 rounded text-xs font-mono font-bold transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-gold focus-visible:outline-none ${
                                    isActive
                                        ? "text-background font-bold"
                                        : "text-foreground-secondary hover:text-foreground hover:bg-surface-elevated/70"
                                }`}
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="analyticsViewTab"
                                        className="absolute inset-0 bg-gold rounded"
                                        transition={{ type: "spring", stiffness: 450, damping: 35 }}
                                    />
                                )}
                                <Icon size={13} className="relative z-10 shrink-0" aria-hidden="true" />
                                <span className="relative z-10 hidden sm:inline">{tab.label}</span>
                                <span className="relative z-10 sm:hidden">
                                    {tab.id === "performance" ? "Performance" :
                                     tab.id === "standing" ? "Standing" :
                                     tab.id === "placement" ? "Placement" : "All Insights"}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {/* Tab Views */}
                <AnimatePresence mode="wait">
                    {/* Perspective 1: Performance & Trends */}
                    {activeView === "performance" && (
                        <motion.div
                            key="view-performance"
                            id="panel-performance"
                            role="tabpanel"
                            aria-labelledby="tab-performance"
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.18 }}
                            className="space-y-7 lg:space-y-8"
                        >
                            {isAnnual ? (
                                <SpecialAnnualAnalytics engine={engine} />
                            ) : (
                                <>
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

                                    <QuickStatsDistribution
                                        rows={filteredResults}
                                        totalCredits={stats.totalCredits}
                                        earnedCredits={stats.earnedCredits}
                                    />

                                    <SemesterTrendChart
                                        allResults={allResults}
                                        filteredResults={filteredResults}
                                        customCredit={customCredit}
                                    />
                                </>
                            )}
                        </motion.div>
                    )}

                    {/* Perspective 2: Promotion & Standing */}
                    {activeView === "standing" && (
                        <motion.div
                            key="view-standing"
                            id="panel-standing"
                            role="tabpanel"
                            aria-labelledby="tab-standing"
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.18 }}
                            className="space-y-7 lg:space-y-8"
                        >
                            {isAnnual ? (
                                <SpecialAnnualStanding engine={engine} />
                            ) : (
                                <>
                                    {isDivisionVerified && (
                                        <DivisionClassificationCard
                                            cgpa={stats.gpa}
                                            percentage={percentage}
                                            backlogsCount={stats.backlogs}
                                            isOverall={isOverall}
                                            divisionName={engine.analytics.division.value}
                                            divisionStatus={engine.analytics.division.status}
                                            ordinanceName={programme.ordinance}
                                            reason={engine.analytics.division.reason}
                                        />
                                    )}

                                    {isPromotionVerified && (
                                        <>
                                            <AcademicPromotionCard
                                                allResults={allResults}
                                                customCredit={customCredit}
                                            />

                                            <ReappearSessionPlanner
                                                allResults={allResults}
                                                customCredit={customCredit}
                                            />
                                        </>
                                    )}

                                    {!isDivisionVerified && !isPromotionVerified && (
                                        <div className="p-6 text-sm text-foreground-muted font-mono rounded-lg border border-border-strong bg-surface">
                                            Academic promotion criteria and division classification rules are governed specifically by {programme.ordinance ?? "statutory regulations"} for {programme.programmeName}.
                                        </div>
                                    )}
                                </>
                            )}
                        </motion.div>
                    )}

                    {/* Perspective 3: Placement Gatekeeper */}
                    {activeView === "placement" && (
                        <motion.div
                            key="view-placement"
                            id="panel-placement"
                            role="tabpanel"
                            aria-labelledby="tab-placement"
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.18 }}
                            className="space-y-7 lg:space-y-8"
                        >
                            {stats.gpa !== null ? (
                                <PlacementEligibilityCard
                                    cgpa={stats.gpa}
                                    activeBacklogs={stats.backlogs}
                                    isOverall={isOverall}
                                />
                            ) : (
                                <div className="p-6 text-sm text-foreground-muted font-mono rounded-lg border border-border-strong bg-surface">
                                    Placement benchmarks require a valid cumulative GPA.
                                </div>
                            )}
                        </motion.div>
                    )}

                    {/* Perspective 4: All Insights (Full Dossier) */}
                    {activeView === "all" && (
                        <motion.div
                            key="view-all"
                            id="panel-all"
                            role="tabpanel"
                            aria-labelledby="tab-all"
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.18 }}
                            className="space-y-7 lg:space-y-8"
                        >
                            {isAnnual ? (
                                <SpecialAnnualAnalytics engine={engine} />
                            ) : (
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
                            )}

                            {isAnnual ? (
                                <SpecialAnnualStanding engine={engine} />
                            ) : (
                                <>
                                    {isDivisionVerified && (
                                        <DivisionClassificationCard
                                            cgpa={stats.gpa}
                                            percentage={percentage}
                                            backlogsCount={stats.backlogs}
                                            isOverall={isOverall}
                                            divisionName={engine.analytics.division.value}
                                            divisionStatus={engine.analytics.division.status}
                                            ordinanceName={programme.ordinance}
                                            reason={engine.analytics.division.reason}
                                        />
                                    )}

                                    {isPromotionVerified && (
                                        <>
                                            <AcademicPromotionCard
                                                allResults={allResults}
                                                customCredit={customCredit}
                                            />

                                            <ReappearSessionPlanner
                                                allResults={allResults}
                                                customCredit={customCredit}
                                            />
                                        </>
                                    )}
                                </>
                            )}

                            {isTech && stats.gpa !== null && (
                                <PlacementEligibilityCard
                                    cgpa={stats.gpa}
                                    activeBacklogs={stats.backlogs}
                                    isOverall={isOverall}
                                />
                            )}

                            <QuickStatsDistribution
                                rows={filteredResults}
                                totalCredits={stats.totalCredits}
                                earnedCredits={stats.earnedCredits}
                            />

                            <SemesterTrendChart
                                allResults={allResults}
                                filteredResults={filteredResults}
                                customCredit={customCredit}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Details Section at Bottom: Provenance & Statutory Audit */}
                <section className="pt-6 border-t-2 border-dashed border-gold-border/50 space-y-4" aria-label="Calculation details">
                    <div className="flex items-center gap-2.5">
                        <FlaskConical size={14} className="text-gold" aria-hidden />
                        <h2 className="text-xs font-bold uppercase tracking-widest font-mono text-gold">
                            Details — How This Analysis Was Calculated
                        </h2>
                    </div>
                    <ExplanationPanel engine={engine} />
                </section>

            </main>
        </div>
    );
}

function SpecialAnnualAnalytics({ engine }: { engine: ReturnType<typeof analyzeResult> }) {
    const a = engine.analytics;
    const hasDistinction = (a.distinctionCount.value ?? 0) > 0;
    const hasCpi = a.division.status !== "NOT_APPLICABLE" && a.division.value !== null;
    const pctValue = a.percentage.value ?? a.averagePercentage.value;

    const cards = [
        {
            label: "Aggregate Percentage",
            value: pctValue !== null ? `${pctValue.toFixed(2)}%` : "—",
            status: a.percentage.status !== "UNAVAILABLE" ? a.percentage.status : a.averagePercentage.status,
            reason: a.percentage.reason ?? a.averagePercentage.reason ?? "Aggregated course marks normalized by subject maxima.",
        },
        {
            label: "Pass Rate",
            value: a.passRate.value !== null ? `${a.passRate.value.toFixed(1)}%` : "—",
            status: a.passRate.status,
            reason: "Calculated from official course results.",
        },
        {
            label: "Internal Average",
            value: a.internalAverage.value !== null ? a.internalAverage.value.toFixed(1) : "—",
            status: a.internalAverage.status,
            reason: "Average of internal assessment marks.",
        },
        {
            label: "External Average",
            value: a.externalAverage.value !== null ? a.externalAverage.value.toFixed(1) : "—",
            status: a.externalAverage.status,
            reason: "Average of university end-term examination marks.",
        },
        ...(hasDistinction ? [{
            label: "Distinction Courses",
            value: String(a.distinctionCount.value ?? 0),
            status: a.distinctionCount.status,
            reason: "Distinction awarded for exceeding 75% marks.",
        }] : []),
        ...(hasCpi ? [{
            label: "CPI / Division",
            value: a.division.value ?? "—",
            status: a.division.status,
            reason: a.division.reason ?? "Performance index under programme regulations.",
        }] : []),
        {
            label: "Backlogs",
            value: String(a.notClearedCount.value ?? 0),
            status: a.notClearedCount.status,
            reason: "Count of courses not cleared/absent/detained in the loaded result.",
        },
    ];

    return (
        <section className="space-y-4">
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {cards.map((card) => (
                    <div key={card.label} className="p-3.5 sm:p-4 bg-surface border border-border-strong rounded-lg shadow-xs">
                        <div className="flex items-center justify-between gap-2">
                            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-foreground-secondary">{card.label}</span>
                            <span className={`text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded border ${card.status === "VERIFIED" ? "bg-positive-surface text-positive border-positive-border" : card.status === "RESULT_DERIVED" ? "bg-chart-cyan-surface text-chart-cyan border-chart-cyan-border" : "bg-gold-surface text-gold border-gold-border"}`}>{card.status === "RESULT_DERIVED" ? "RESULT DERIVED" : card.status}</span>
                        </div>
                        <div className="mt-2.5 sm:mt-3 text-2xl font-mono font-bold text-foreground">{card.value}</div>
                        <p className="mt-1 text-[10px] font-mono text-foreground-muted leading-relaxed">{card.reason ?? "—"}</p>
                    </div>
                ))}
            </div>
            <div className="p-3.5 sm:p-4 rounded-lg border border-border-strong bg-surface font-mono">
                <div className="text-xs font-bold text-foreground uppercase tracking-wider">Professional Framework Regulations</div>
                <p className="mt-2 text-[11px] text-foreground-secondary leading-relaxed">{a.coursePassRule.value ?? a.coursePassRule.reason ?? "Programme-specific passing criteria loaded."}</p>
                <div className="mt-2 text-[10px] text-foreground-muted">Official marksheet totals prevail; component sub-breakups are evaluated directly from university examination records.</div>
            </div>
        </section>
    );
}

function SpecialAnnualStanding({ engine }: { engine: ReturnType<typeof analyzeResult> }) {
    const a = engine.analytics;
    const hasDivision = a.division.status !== "NOT_APPLICABLE" && a.division.value !== null;
    const progression = a.promotion.value?.[0]?.standing ?? "UNKNOWN";
    return (
        <section className={`grid grid-cols-1 ${hasDivision ? "md:grid-cols-3" : "md:grid-cols-2"} gap-4`}>
            <div className="p-4 sm:p-5 bg-surface border border-border-strong rounded-lg font-mono">
                <div className="text-[10px] uppercase tracking-wider font-bold text-foreground-secondary">Course Pass Rule</div>
                <div className="mt-3 text-sm font-bold text-foreground">{a.coursePassRule.value ?? "Unavailable"}</div>
                <div className="mt-2 text-[10px] text-foreground-muted">{a.coursePassRule.sources.join(" · ")}</div>
            </div>
            {hasDivision && (
                <div className="p-4 sm:p-5 bg-surface border border-border-strong rounded-lg font-mono">
                    <div className="text-[10px] uppercase tracking-wider font-bold text-foreground-secondary">Division Classification</div>
                    <div className="mt-3 text-xl font-bold text-foreground">{a.division.value}</div>
                    <div className="mt-2 text-[10px] text-foreground-muted">{a.division.reason ?? "Programme-specific classification rule."}</div>
                </div>
            )}
            <div className="p-4 sm:p-5 bg-surface border border-border-strong rounded-lg font-mono">
                <div className="text-[10px] uppercase tracking-wider font-bold text-foreground-secondary">Progression</div>
                <div className="mt-3 text-xl font-bold text-foreground">{progression === "PROMOTED" ? "All courses cleared" : progression === "NOT_PROMOTED" ? "Courses pending" : "Official result required"}</div>
                <div className="mt-2 text-[10px] text-foreground-muted">{a.promotion.reason ?? "Professional progression is determined under annual regulations."}</div>
            </div>
        </section>
    );
}
