"use client";

import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import type { SubjectResult } from "@/types/result";

// Displays summary academic marks and a grade/status distribution chart across subjects.

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
    subjectResults: SubjectResult[];
    totalSubjects: number;
}

export default function QuickStatsDistribution({ subjectResults, totalSubjects }: Props) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const { totalMarks, totalMaxMarks, highest, lowest, highestCourse, lowestCourse, chartData } = useMemo(() => {
        // Distribution = one bucket per subject: engine letter grade when the
        // programme has one, official result status otherwise.
        const gradeBuckets = new Map<string, DistributionSlice>();
        const statusBuckets = new Map<string, DistributionSlice>();
        let marksSum = 0;
        let maxMarksSum = 0;
        let highestValue = -Infinity;
        let lowestValue = Infinity;
        let highestItem: SubjectResult | null = null;
        let lowestItem: SubjectResult | null = null;

        for (const subject of subjectResults) {
            if (subject.grade) {
                const gradeValue = subject.grade.value;
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
                const label = subject.semantic.replace(/_/g, " ");
                const slice = statusBuckets.get(label) ?? {
                    label,
                    grade: label,
                    value: 0,
                    color: STATUS_COLORS[subject.semantic] ?? "var(--cat-slate)",
                };
                slice.value += 1;
                statusBuckets.set(label, slice);
            }

            if (subject.total !== undefined) {
                marksSum += subject.total;
                if (highestValue < subject.total) {
                    highestValue = subject.total;
                    highestItem = subject;
                }
                if (lowestValue > subject.total) {
                    lowestValue = subject.total;
                    lowestItem = subject;
                }
            }
            if (subject.maxMarks !== null) maxMarksSum += subject.maxMarks;
        }

        const totalCount = subjectResults.length;
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
            totalMarks: marksSum,
            totalMaxMarks: maxMarksSum,
            highest: highestItem ? (highestItem.total as number) : null,
            lowest: lowestItem ? (lowestItem.total as number) : null,
            highestCourse: highestItem,
            lowestCourse: lowestItem,
            chartData: chartSlices,
        };
    }, [subjectResults]);

    // Normalizes legend bar lengths relative to the largest grade count
    const biggestSlice = Math.max(1, ...chartData.map((slice) => slice.value));

    const stats = [
        {
            label: "Total Marks",
            note: null,
            value: String(totalMarks),
            suffix: totalMaxMarks > 0 ? ` / ${totalMaxMarks}` : "",
            color: "text-cat-teal",
        },
        {
            label: "Highest Score",
            note: highestCourse?.name ?? "N/A",
            value: highest !== null ? `${highest} pts` : "—",
            suffix: "",
            color: "text-gold",
        },
        {
            label: "Lowest Score",
            note: lowestCourse?.name ?? "N/A",
            value: lowest !== null ? `${lowest} pts` : "—",
            suffix: "",
            color: "text-cat-blue",
        },
    ];

    return (
        <section className="home-panel p-5 sm:p-6">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-5 lg:gap-0">

                {/* Summary metrics: total marks, highest score, lowest score */}
                <div className="lg:col-span-2 lg:pr-8">
                    <h3 className="text-base font-semibold tracking-[-0.01em] text-foreground">Quick Stats Overview</h3>

                    <ul className="mt-4 divide-y divide-border">
                        {stats.map((stat) => (
                            <li key={stat.label} className="flex items-center justify-between gap-4 py-3.5">
                                <div className="min-w-0">
                                    <p className="text-sm text-foreground-secondary">{stat.label}</p>
                                    {stat.note && (
                                        <p className="mt-0.5 truncate text-xs text-foreground-muted" title={stat.note}>
                                            {stat.note}
                                        </p>
                                    )}
                                </div>
                                <p className={`tnum shrink-0 font-mono text-xl font-semibold ${stat.color}`}>
                                    {stat.value}
                                    {stat.suffix && (
                                        <span className="text-sm font-medium text-foreground-muted">{stat.suffix}</span>
                                    )}
                                </p>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Donut chart and grade breakdown legend */}
                <div className="lg:col-span-3 lg:border-l lg:border-border lg:pl-8">
                    <h3 className="text-base font-semibold tracking-[-0.01em] text-foreground">
                        {chartData.some((slice) => slice.label.startsWith("Grade")) ? "Grade Distribution" : "Result Status"}
                    </h3>

                    <div className="mt-4 flex flex-col items-center gap-6 sm:flex-row sm:gap-8">
                        {!mounted ? (
                            <div className="size-44 shrink-0 animate-pulse rounded-full border-[14px] border-border-strong/30" />
                        ) : chartData.length > 0 ? (
                            <div
                                role="img"
                                aria-label={`Distribution donut chart showing breakdown across ${totalSubjects} subjects`}
                                className="relative size-44 shrink-0"
                            >
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={chartData}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={58}
                                            outerRadius={80}
                                            paddingAngle={3}
                                            cornerRadius={4}
                                            dataKey="value"
                                            stroke="none"
                                            animationDuration={800}
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
                                                        <div className="rounded-lg border border-border-strong bg-surface-elevated px-3 py-2 text-xs shadow-xl">
                                                            <div className="flex items-center gap-2 font-semibold text-foreground">
                                                                <span
                                                                    className="inline-block size-2 rounded-full"
                                                                    style={{ backgroundColor: data.color }}
                                                                />
                                                                {data.label}
                                                            </div>
                                                            <div className="tnum mt-0.5 font-mono text-foreground-secondary">
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

                                {/* Total subject count centered in donut ring */}
                                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
                                    <span className="tnum font-mono text-3xl font-semibold leading-none text-foreground">
                                        {totalSubjects}
                                    </span>
                                    <span className="mt-1 text-xs text-foreground-muted">Total</span>
                                </div>
                            </div>
                        ) : (
                            <div className="flex size-44 shrink-0 items-center justify-center rounded-full border border-dashed border-border-strong text-center text-xs text-foreground-muted">
                                No result data available
                            </div>
                        )}

                        {/* Grade distribution breakdown bars */}
                        <ul className="w-full min-w-0 flex-1 divide-y divide-border">
                            {chartData.map((item, index) => (
                                <li key={item.label} className="flex items-center gap-3 py-2 text-sm">
                                    <span className="flex w-16 shrink-0 items-center gap-2 font-semibold text-foreground">
                                        <span
                                            className="inline-block size-2 shrink-0 rounded-full"
                                            style={{ backgroundColor: item.color }}
                                        />
                                        <span className="truncate">{item.grade ?? item.label}</span>
                                    </span>
                                    <div className="h-1 flex-1 overflow-hidden rounded-full bg-border-strong">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            whileInView={{ width: `${(item.value / biggestSlice) * 100}%` }}
                                            viewport={{ once: true }}
                                            transition={{ duration: 0.7, delay: index * 0.04, ease: "easeOut" }}
                                            className="h-full rounded-full"
                                            style={{ backgroundColor: item.color }}
                                        />
                                    </div>
                                    <span className="tnum w-5 shrink-0 text-right font-mono text-xs text-foreground-secondary">
                                        {item.value}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

            </div>
        </section>
    );
}
