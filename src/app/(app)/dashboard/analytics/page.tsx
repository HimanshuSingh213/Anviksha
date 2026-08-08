"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import useResultStore from "@/store/result-store";
import { getDefaultCredit, getGradeAndPoints } from "@/helpers/grade-system";
import Skeleton from "@/components/dashboard/Skeleton";
import AppNavbar from "@/components/common/AppNavbar";
import SemesterSelector from "@/components/analytics/SemesterSelector";
import AnalyticsOverview from "@/components/analytics/AnalyticsOverview";
import DivisionClassificationCard from "@/components/analytics/DivisionClassificationCard";
import SemesterTrendChart from "@/components/analytics/SemesterTrendChart";
import QuickStatsDistribution from "@/components/analytics/QuickStatsDistribution";

export default function AnalyticsPage() {
    const router = useRouter();
    const fullResult = useResultStore((state) => state.result);
    const customCredit = useResultStore((state) => state.customCredits);
    const [activeSem, setActiveSem] = useState<string>("100");

    useEffect(() => {
        if (!fullResult) router.push("/dashboard");
    }, [fullResult, router]);

    if (!fullResult) return <Skeleton />;

    const allResults = fullResult.stresult ?? [];
    const profile = fullResult.stprofile;

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

    return (
        <div className="min-h-screen bg-background text-foreground">
            <AppNavbar profile={profile} />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-7">

                {/* Semester filter + Marksheet download */}
                <SemesterSelector
                    activeSem={activeSem}
                    onSelectSem={setActiveSem}
                    totalSubjects={filteredResults.length}
                    availableSemesters={availableSemesters}
                />

                {/* Performance overview cards */}
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

                {/* GGSIPU Ordinance 11 Division Classification */}
                <DivisionClassificationCard
                    cgpa={stats.gpa}
                    backlogsCount={stats.backlogs}
                    isOverall={activeSem === "100"}
                />

                {/* Quick stats (Left) & Recharts Donut Chart (Right) */}
                <QuickStatsDistribution
                    rows={filteredResults}
                    totalCredits={stats.totalCredits}
                    earnedCredits={stats.earnedCredits}
                />

                {/* Semester SGPA Trend Curve & Subject-Wise Internal vs External Dual Bar Chart */}
                <SemesterTrendChart
                    allResults={allResults}
                    filteredResults={filteredResults}
                    customCredit={customCredit}
                />

            </main>
        </div>
    );
}
