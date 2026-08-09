"use client";

import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { getGradeAndPoints } from "@/helpers/grade-system";

interface Props {
    rows: any[][];
    totalCredits: number;
    earnedCredits: number;
}

const GRADE_COLORS: Record<string, string> = {
    O: "var(--grade-excellent)",
    "A+": "var(--grade-excellent)",
    A: "var(--grade-good)",
    "B+": "var(--grade-good)",
    B: "var(--grade-average)",
    C: "var(--grade-average)",
    P: "var(--grade-pass)",
    F: "var(--grade-fail)",
};

export default function QuickStatsDistribution({ rows, totalCredits, earnedCredits }: Props) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Memoize stats and grade donut data for 0ms latency
    const { totalSubjects, totalMarks, highest, lowest, backlogs, highestSubject, lowestSubject, chartData } = useMemo(() => {
        const totalSub = rows.length;
        let hi = -Infinity;
        let lo = Infinity;
        let bl = 0;
        let totalM = 0;

        const counts: Record<string, number> = {
            O: 0, "A+": 0, A: 0, "B+": 0, B: 0, C: 0, P: 0, F: 0
        };

        rows.forEach((row) => {
            const total = isNaN(Number(row[5])) ? 0 : Number(row[5]);
            const { pass, grade } = getGradeAndPoints(total);

            if (grade in counts) counts[grade]++;
            else counts["F"]++;

            if (pass) {
                totalM += total;
                if (total > hi) hi = total;
                if (total < lo) lo = total;
            } else {
                bl++;
            }
        });

        const passedRows = rows.filter((r) => getGradeAndPoints(Number(r[5])).pass);
        const hiSubject = passedRows.find((r) => Number(r[5]) === hi);
        const loSubject = passedRows.find((r) => Number(r[5]) === lo);

        const data = Object.entries(counts)
            .filter(([, count]) => count > 0)
            .map(([grade, count]) => ({
                name: `Grade ${grade}`,
                grade,
                value: count,
                percentage: totalSub > 0 ? ((count / totalSub) * 100).toFixed(1) : "0",
                color: GRADE_COLORS[grade] || "var(--cat-slate)",
            }));

        return {
            totalSubjects: totalSub,
            totalMarks: totalM,
            highest: hi,
            lowest: lo,
            backlogs: bl,
            highestSubject: hiSubject,
            lowestSubject: loSubject,
            chartData: data,
        };
    }, [rows]);

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
                                <span className="text-[11px] text-foreground-muted"> / {totalSubjects * 100}</span>
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
                                <div className="text-[10px] text-foreground-muted leading-tight font-mono">
                                    {highestSubject ? String(highestSubject[2]) : "N/A"}
                                </div>
                            </div>
                            <span className="text-xs font-bold text-gold shrink-0">
                                {highest > -Infinity ? `${highest} pts` : "—"}
                            </span>
                        </div>

                        {/* Lowest Score */}
                        <div className="flex items-center justify-between gap-3 py-1.5 border-b border-border-strong">
                            <div className="min-w-0 flex-1">
                                <div className="text-xs font-medium text-foreground-secondary">Lowest Score</div>
                                <div className="text-[10px] text-foreground-muted leading-tight font-mono">
                                    {lowestSubject ? String(lowestSubject[2]) : "N/A"}
                                </div>
                            </div>
                            <span className="text-xs font-bold text-cat-blue shrink-0">
                                {lowest < Infinity ? `${lowest} pts` : "—"}
                            </span>
                        </div>

                        {/* Backlogs */}
                        <div className="flex items-center justify-between py-1.5">
                            <span className="text-xs font-medium text-foreground-secondary">Backlogs</span>
                            <span className={`text-xs font-bold ${backlogs > 0 ? "text-grade-fail" : "text-grade-excellent"}`}>
                                {backlogs} {backlogs === 1 ? "subject" : "subjects"}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Right: Recharts Donut Chart */}
                <div className="space-y-3 lg:border-l lg:border-border-strong lg:pl-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-foreground">
                            Grade Distribution
                        </h3>
                        <span className="text-[10px] font-mono text-foreground-secondary px-2 py-0.5 rounded-sm bg-surface-deep border border-border-strong">
                            {totalSubjects} Subjects
                        </span>
                    </div>

                    {mounted && chartData.length > 0 ? (
                        <div className="relative h-44 w-full flex items-center justify-center">
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
                                            <Cell key={entry.grade} fill={entry.color} />
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
                                                            {data.name}
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
                            No grade data available
                        </div>
                    )}

                    <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1">
                        {chartData.map((item) => (
                            <div
                                key={item.grade}
                                className="flex items-center gap-1.5 px-2 py-0.5 rounded-sm bg-surface-deep border border-border-strong text-[11px] font-mono"
                            >
                                <span
                                    className="w-2 h-2 rounded-full inline-block"
                                    style={{ backgroundColor: item.color }}
                                />
                                <span className="font-bold text-foreground">{item.grade}</span>
                                <span className="text-foreground-muted">({item.value})</span>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </motion.div>
    );
}