"use client";

import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import type { EngineCourse } from "@/lib/academic/academic-engine";

// Quick Stats + Grade Distribution donut chart

const STATUS_COLORS: Record<string, string> = {
    PASS: "var(--grade-excellent)",
    CREDIT_SECURED: "var(--grade-excellent)",
    ALREADY_PASSED: "var(--grade-excellent)",
    NOT_CLEARED: "var(--grade-fail)",
    ABSENT: "var(--cat-slate)",
    DETAINED: "var(--grade-fail)",
    CANCELLED: "var(--cat-slate)",
    RESULT_LATER: "var(--cat-blue)",
    UNKNOWN: "var(--cat-slate)",
};

const GRADE_COLORS: Record<string, string> = {
    O: "var(--grade-excellent)",
    "A+": "var(--grade-excellent)",
    A: "var(--grade-good)",
    "B+": "var(--grade-good)",
    B: "var(--grade-average)",
    C: "var(--grade-average)",
    P: "var(--grade-pass)",
    F: "var(--grade-fail)",
    ABS: "var(--cat-slate)",
    DET: "var(--grade-fail)",
};

const GRADE_ORDER = ["O", "A+", "A", "B+", "B", "C", "P", "F", "ABS", "DET"];

interface DistributionSlice {
    label: string;
    grade?: string;
    value: number;
    color: string;
}

interface Props {
    courses: EngineCourse[];
    totalCredits: number;
    earnedCredits: number;
}

export default function QuickStatsDistribution({ courses, totalCredits, earnedCredits }: Props) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const { totalSubjects, totalMarks, totalMaxMarks, highest, lowest, backlogs, highestCourse, lowestCourse, chartData } = useMemo(() => {
        // Distribution = one bucket per course: engine letter grade when the
        // programme has one, official result status otherwise.
        const gradeBuckets = new Map<string, DistributionSlice>();
        const statusBuckets = new Map<string, DistributionSlice>();
        let marksSum = 0;
        let maxMarksSum = 0;
        let highestValue = -Infinity;
        let lowestValue = Infinity;
        let highestItem: EngineCourse | null = null;
        let lowestItem: EngineCourse | null = null;
        let backlogCount = 0;

        for (const course of courses) {
            if (course.grade) {
                const gradeValue = course.grade.value;
                const label = `Grade ${gradeValue}`;
                const slice = gradeBuckets.get(label) ?? {
                    label,
                    grade: gradeValue,
                    value: 0,
                    color: GRADE_COLORS[gradeValue] ?? "var(--cat-slate)",
                };
                slice.value += 1;
                gradeBuckets.set(label, slice);
            } else {
                const label = course.semantic.replace(/_/g, " ");
                const slice = statusBuckets.get(label) ?? {
                    label,
                    grade: label,
                    value: 0,
                    color: STATUS_COLORS[course.semantic] ?? "var(--cat-slate)",
                };
                slice.value += 1;
                statusBuckets.set(label, slice);
            }

            if (course.total !== undefined) {
                marksSum += course.total;
                if (highestValue < course.total) {
                    highestValue = course.total;
                    highestItem = course;
                }
                if (lowestValue > course.total) {
                    lowestValue = course.total;
                    lowestItem = course;
                }
            }
            if (course.maxMarks !== null) maxMarksSum += course.maxMarks;
            if (course.semantic === "NOT_CLEARED" || course.semantic === "ABSENT" || course.semantic === "DETAINED") {
                backlogCount += 1;
            }
        }

        const totalCount = courses.length;
        const withGrades = [...gradeBuckets.values()].sort((a, b) => {
            const indexA = GRADE_ORDER.indexOf(a.grade ?? "");
            const indexB = GRADE_ORDER.indexOf(b.grade ?? "");
            const orderA = indexA === -1 ? 999 : indexA;
            const orderB = indexB === -1 ? 999 : indexB;
            return orderA - orderB;
        });
        const slices = withGrades.length > 0 ? withGrades : [...statusBuckets.values()];
        const chartSlices = slices.map((slice) => ({
            ...slice,
            percentage: totalCount > 0 ? ((slice.value / totalCount) * 100).toFixed(1) : "0",
        }));

        return {
            totalSubjects: totalCount,
            totalMarks: marksSum,
            totalMaxMarks: maxMarksSum,
            highest: highestItem ? (highestItem.total as number) : null,
            lowest: lowestItem ? (lowestItem.total as number) : null,
            backlogs: backlogCount,
            highestCourse: highestItem,
            lowestCourse: lowestItem,
            chartData: chartSlices,
        };
    }, [courses]);

    const passedCount = totalSubjects - backlogs;

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="p-5 bg-surface border border-border-strong rounded-md shadow-xs"
        >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">

                {/* Left: Quick Performance Stats */}
                <div className="space-y-4">
                    <div>
                        <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-foreground">
                            Quick Stats Overview
                        </h3>
                        <p className="text-[11px] font-mono text-foreground-secondary mt-0.5">
                            Key metrics summary for current view
                        </p>
                    </div>

                    <div className="space-y-2.5 font-mono">
                        {/* Total Marks */}
                        <div className="flex items-center justify-between py-1.5 border-b border-border-strong">
                            <span className="text-xs font-medium text-foreground-secondary">Total Marks</span>
                            <div className="text-right">
                                <span className="text-xs font-bold text-cat-teal">{totalMarks}</span>
                                {totalMaxMarks > 0 && (
                                    <span className="text-[11px] text-foreground-muted"> / {totalMaxMarks}</span>
                                )}
                            </div>
                        </div>

                        {/* Credits Earned */}
                        <div className="flex items-center justify-between py-1.5 border-b border-border-strong">
                            <span className="text-xs font-medium text-foreground-secondary">Credits Earned</span>
                            <div className="text-right">
                                <span className="text-xs font-bold text-cat-violet">{earnedCredits}</span>
                                <span className="text-[11px] text-foreground-muted"> / {totalCredits}</span>
                            </div>
                        </div>

                        {/* Highest Score */}
                        <div className="flex items-center justify-between gap-3 py-1.5 border-b border-border-strong">
                            <div className="min-w-0 flex-1">
                                <div className="text-xs font-medium text-foreground-secondary">Highest Score</div>
                                <div className="text-[10px] text-foreground-muted leading-tight font-mono truncate" title={highestCourse?.name}>
                                    {highestCourse?.name ?? "N/A"}
                                </div>
                            </div>
                            <span className="text-xs font-bold text-gold shrink-0">
                                {highest !== null ? `${highest} pts` : "—"}
                            </span>
                        </div>

                        {/* Lowest Score */}
                        <div className="flex items-center justify-between gap-3 py-1.5 border-b border-border-strong">
                            <div className="min-w-0 flex-1">
                                <div className="text-xs font-medium text-foreground-secondary">Lowest Score</div>
                                <div className="text-[10px] text-foreground-muted leading-tight font-mono truncate" title={lowestCourse?.name}>
                                    {lowestCourse?.name ?? "N/A"}
                                </div>
                            </div>
                            <span className="text-xs font-bold text-cat-blue shrink-0">
                                {lowest !== null ? `${lowest} pts` : "—"}
                            </span>
                        </div>

                        {/* Cleared / Backlogs */}
                        <div className="flex items-center justify-between py-1.5">
                            <span className="text-xs font-medium text-foreground-secondary">Cleared</span>
                            <span className={`text-xs font-bold ${backlogs > 0 ? "text-grade-fail" : "text-grade-excellent"}`}>
                                {passedCount}/{totalSubjects} · {backlogs} backlog{backlogs === 1 ? "" : "s"}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Right: Recharts Donut Chart */}
                <div className="space-y-3 lg:border-l lg:border-border-strong lg:pl-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-foreground">
                            {chartData.some((slice) => slice.label.startsWith("Grade")) ? "Grade Distribution" : "Result Status"}
                        </h3>
                        <span className="text-[10px] font-mono text-foreground-secondary px-2 py-0.5 rounded-sm bg-surface-deep border border-border-strong">
                            {totalSubjects} Subjects
                        </span>
                    </div>

                    {mounted && chartData.length > 0 ? (
                        <div
                            role="img"
                            aria-label={`Distribution donut chart showing breakdown across ${totalSubjects} subjects`}
                            className="relative h-44 w-full flex items-center justify-center"
                        >
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={chartData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={48}
                                        outerRadius={72}
                                        paddingAngle={3}
                                        dataKey="value"
                                        stroke="var(--color-background)"
                                        strokeWidth={2}
                                    >
                                        {chartData.map((entry) => (
                                            <Cell key={entry.label} fill={entry.color} />
                                        ))}
                                    </Pie>

                                    <Tooltip
                                        wrapperStyle={{ zIndex: 50 }}
                                        content={({ active, payload }) => {
                                            if (active && payload && payload.length) {
                                                const data = payload[0].payload;
                                                return (
                                                    <div className="relative z-50 bg-surface-elevated border border-border-strong px-3.5 py-2 rounded-sm text-xs font-mono shadow-2xl">
                                                        <div className="font-bold text-foreground mb-0.5 flex items-center gap-1.5">
                                                            <span
                                                                className="w-2 h-2 rounded-full inline-block"
                                                                style={{ backgroundColor: data.color }}
                                                            />
                                                            {data.label}
                                                        </div>
                                                        <div className="text-xs text-foreground-secondary font-medium">
                                                            {data.value} {data.value === 1 ? "subject" : "subjects"} ({data.percentage}%)
                                                        </div>
                                                    </div>
                                                );
                                            }
                                            return null;
                                        }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>

                            {/* Hollow Donut Center Label with z-0 so Tooltip stays on top */}
                            <div className="absolute inset-0 z-0 flex flex-col items-center justify-center pointer-events-none text-center">
                                <span className="text-lg font-bold font-mono text-foreground">
                                    {totalSubjects}
                                </span>
                                <span className="text-[9px] font-mono uppercase text-foreground-muted">
                                    Total
                                </span>
                            </div>
                        </div>
                    ) : (
                        <div className="h-44 rounded-sm bg-surface-deep border border-dashed border-border-strong flex items-center justify-center text-xs font-mono text-foreground-muted">
                            No result data available
                        </div>
                    )}

                    <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1">
                        {chartData.map((item) => (
                            <div
                                key={item.label}
                                className="flex items-center gap-1.5 px-2 py-0.5 rounded-sm bg-surface-deep border border-border-strong text-[11px] font-mono"
                            >
                                <span
                                    className="w-2 h-2 rounded-full inline-block"
                                    style={{ backgroundColor: item.color }}
                                />
                                <span className="font-bold text-foreground">{item.grade ?? item.label}</span>
                                <span className="text-foreground-muted">({item.value})</span>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </motion.div>
    );
}
