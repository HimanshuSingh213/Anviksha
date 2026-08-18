"use client";

import { KeyboardEvent, useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { TrendingUp, ShieldCheck, Briefcase, Layers } from "lucide-react";
import useResultStore from "@/store/result-store";
import { getDefaultCredit, getGradeAndPoints } from "@/helpers/grade-system";
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

    const handleViewKeyDown = (
        event: KeyboardEvent<HTMLButtonElement>,
        currentIndex: number,
    ) => {
        const isHorizontalKey = event.key === "ArrowRight" || event.key === "ArrowLeft";
        const isBoundaryKey = event.key === "Home" || event.key === "End";
        if (!isHorizontalKey && !isBoundaryKey) return;

        event.preventDefault();

        let nextIndex = currentIndex;
        if (event.key === "ArrowRight") {
            nextIndex = (currentIndex + 1) % ANALYTICS_VIEWS.length;
        } else if (event.key === "ArrowLeft") {
            nextIndex = (currentIndex - 1 + ANALYTICS_VIEWS.length) % ANALYTICS_VIEWS.length;
        } else if (event.key === "Home") {
            nextIndex = 0;
        } else if (event.key === "End") {
            nextIndex = ANALYTICS_VIEWS.length - 1;
        }

        const nextView = ANALYTICS_VIEWS[nextIndex];
        setActiveView(nextView.id);

        const tabButtons = event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>(
            '[role="tab"]',
        );
        window.requestAnimationFrame(() => tabButtons?.[nextIndex]?.focus());
    };

    useEffect(() => {
        if (!fullResult) router.push("/dashboard");
    }, [fullResult, router]);

    const allResults = useMemo(() => fullResult?.stresult ?? [], [fullResult?.stresult]);
    const profile = fullResult?.stprofile;

    // Available semester list
    const availableSemesters = useMemo(() => {
        const list: number[] = [];
        allResults.forEach((row: any[]) => {
            const semNum = Number(row[0]);
            if (semNum >= 1 && semNum <= 8 && !list.includes(semNum)) {
                list.push(semNum);
            }
        });
        return list;
    }, [allResults]);

    // Semester filtering and stats computation
    const { filteredResults, stats, gpaLabel, gpa, percentage } = useMemo(() => {
        const filtered = allResults.filter((row: any[]) => {
            return activeSem === "100" || row[0] === Number(activeSem);
        });

        let weightedPoints = 0;
        let totalCredits = 0;
        let earnedCredits = 0;
        let backlogs = 0;
        let obtainedMarks = 0;
        let totalMaxMarks = 0;

        filtered.forEach((row) => {
            const rawTotal = Number(row[5]);
            const total = isNaN(rawTotal) ? 0 : rawTotal;
            const paperCode = row[1];
            const subjectTitle = row[2];
            const credit = customCredit[paperCode] ?? getDefaultCredit(subjectTitle);
            const { points, pass } = getGradeAndPoints(total);

            const effectivePoints = pass ? points : 0;
            weightedPoints += credit * effectivePoints;
            totalCredits += credit;
            obtainedMarks += pass ? total : 0;
            totalMaxMarks += 100;

            if (pass) {
                earnedCredits += credit;
            } else {
                backlogs += 1;
            }
        });

        const computedGpa = totalCredits > 0 ? weightedPoints / totalCredits : 0;
        const label = activeSem === "100" ? "Overall CGPA" : `Semester ${activeSem} SGPA`;

        return {
            filteredResults: filtered,
            stats: {
                gpa: computedGpa,
                totalCredits,
                earnedCredits,
                backlogs,
                obtainedMarks,
                totalMaxMarks,
            },
            gpaLabel: label,
            gpa: computedGpa.toFixed(2),
            percentage: (computedGpa * 10).toFixed(2),
        };
    }, [activeSem, allResults, customCredit]);

    if (!fullResult) return <Skeleton />;

    return (
        <div className="min-h-screen bg-background text-foreground">
            <AppNavbar profile={profile} />

            <main className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 sm:py-10 lg:space-y-10">

                {/* Semester filter + Marksheet download */}
                <SemesterSelector
                    activeSem={activeSem}
                    onSelectSem={setActiveSem}
                    totalSubjects={filteredResults.length}
                    availableSemesters={availableSemesters}
                />

                {/* Perspective Navigation Switcher */}
                <div
                    role="tablist"
                    aria-label="Analytics Perspectives"
                    className="flex flex-wrap items-center gap-1.5 p-1.5 bg-surface border border-border-strong rounded-md shadow-xs"
                >
                    {ANALYTICS_VIEWS.map((tab, index) => {
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
                                onClick={() => setActiveView(tab.id)}
                                onKeyDown={(event) => handleViewKeyDown(event, index)}
                                className={`relative flex items-center gap-2 px-3.5 py-1.5 rounded text-xs font-mono font-bold transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-gold focus-visible:outline-none ${
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
                                <span className="relative z-10">{tab.label}</span>
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
                            <AnalyticsOverview
                                gpa={gpa}
                                gpaLabel={gpaLabel}
                                earnedCredits={stats.earnedCredits}
                                totalCredits={stats.totalCredits}
                                obtainedMarks={stats.obtainedMarks}
                                totalMaxMarks={stats.totalMaxMarks}
                                percentage={percentage}
                                backlogsCount={stats.backlogs}
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
                            <DivisionClassificationCard
                                cgpa={stats.gpa}
                                backlogsCount={stats.backlogs}
                                isOverall={activeSem === "100"}
                            />

                            <AcademicPromotionCard
                                allResults={allResults}
                                customCredit={customCredit}
                            />

                            <ReappearSessionPlanner
                                allResults={allResults}
                                customCredit={customCredit}
                            />
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
                            <PlacementEligibilityCard
                                cgpa={stats.gpa}
                                activeBacklogs={stats.backlogs}
                                isOverall={activeSem === "100"}
                            />
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
                            <AnalyticsOverview
                                gpa={gpa}
                                gpaLabel={gpaLabel}
                                earnedCredits={stats.earnedCredits}
                                totalCredits={stats.totalCredits}
                                obtainedMarks={stats.obtainedMarks}
                                totalMaxMarks={stats.totalMaxMarks}
                                percentage={percentage}
                                backlogsCount={stats.backlogs}
                            />

                            <DivisionClassificationCard
                                cgpa={stats.gpa}
                                backlogsCount={stats.backlogs}
                                isOverall={activeSem === "100"}
                            />

                            <AcademicPromotionCard
                                allResults={allResults}
                                customCredit={customCredit}
                            />

                            <ReappearSessionPlanner
                                allResults={allResults}
                                customCredit={customCredit}
                            />

                            <PlacementEligibilityCard
                                cgpa={stats.gpa}
                                activeBacklogs={stats.backlogs}
                                isOverall={activeSem === "100"}
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
                        </motion.div>
                    )}
                </AnimatePresence>

            </main>
        </div>
    );
}
