"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import useResultStore from "@/store/result-store";
import { getDefaultCredit, getGradeAndPoints } from "@/helpers/grade-system";
import Skeleton from "@/components/dashboard/Skeleton";
import AnalyticsNavbar from "@/components/analytics/AnalyticsNavbar";
import SemesterSelector from "@/components/analytics/SemesterSelector";
import AnalyticsOverview from "@/components/analytics/AnalyticsOverview";
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

    // Filter results by selected semester ("100" means show all semesters)
    const filteredResults = allResults.filter((row: any[]) => {
        return activeSem === "100" || row[0] === Number(activeSem);
    });

    // Find all semester numbers (1 to 8) that exist in the student's results
    const availableSemesters: number[] = [];
    allResults.forEach((row: any[]) => {
        const semNum = Number(row[0]);
        if (semNum >= 1 && semNum <= 8 && !availableSemesters.includes(semNum)) {
            availableSemesters.push(semNum);
        }
    });

    // Calculate total GPA, credits, marks, and backlogs
    function computeStats(rows: any[][]) {
        let weightedPoints = 0;
        let totalCredits = 0;
        let earnedCredits = 0;
        let backlogs = 0;
        let obtainedMarks = 0;
        let totalMaxMarks = 0;

        rows.forEach((row) => {
            const rawTotal = Number(row[5]);
            const total = isNaN(rawTotal) ? 0 : rawTotal;
            const paperCode = row[1];
            const subjectTitle = row[2];
            const credit = customCredit[paperCode] ?? getDefaultCredit(subjectTitle);
            const { points, pass } = getGradeAndPoints(total);

            weightedPoints += credit * (pass ? points : 0);
            totalCredits += credit;
            obtainedMarks += pass ? total : 0;
            totalMaxMarks += 100;

            if (pass) {
                earnedCredits += credit;
            } else {
                backlogs += 1;
            }
        });

        const gpa = totalCredits > 0 ? weightedPoints / totalCredits : 0;
        return { gpa, totalCredits, earnedCredits, backlogs, obtainedMarks, totalMaxMarks };
    }

    const stats = computeStats(filteredResults);
    const gpaLabel = activeSem === "100" ? "Overall CGPA" : `Semester ${activeSem} SGPA`;
    const gpa = stats.gpa.toFixed(2);
    const percentage = (stats.gpa * 9.5).toFixed(2);

    return (
        <div className="min-h-screen bg-background text-foreground">
            {/* Header navbar */}
            <AnalyticsNavbar profile={profile} />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-7">

                {/* Top Controls: Semester filter + Marksheet download */}
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
