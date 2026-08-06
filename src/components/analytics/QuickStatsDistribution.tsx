"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { getGradeAndPoints } from "@/helpers/grade-system";

interface Props {
    rows: any[][];
    totalCredits: number;
    earnedCredits: number;
}

const GRADE_COLORS: Record<string, string> = {
    O: "#34d399",
    "A+": "#34d399",
    A: "#a3e635",
    "B+": "#a3e635",
    B: "#fbbf24",
    C: "#fbbf24",
    P: "#fb923c",
    F: "#f87171",
};

export default function QuickStatsDistribution({ rows, totalCredits, earnedCredits }: Props) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const totalSubjects = rows.length;

    let highest = -Infinity;
    let lowest = Infinity;
    let backlogs = 0;
    let totalMarks = 0;

    const counts: Record<string, number> = {
        O: 0, "A+": 0, A: 0, "B+": 0, B: 0, C: 0, P: 0, F: 0
    };

    rows.forEach((row) => {
        const total = isNaN(Number(row[5])) ? 0 : Number(row[5]);
        const { pass, grade } = getGradeAndPoints(total);

        if (grade in counts) counts[grade]++;
        else counts["F"]++;

        if (pass) {
            totalMarks += total;
            if (total > highest) highest = total;
            if (total < lowest) lowest = total;
        } else {
            backlogs++;
        }
    });

    const passedRows = rows.filter((r) => getGradeAndPoints(Number(r[5])).pass);
    const highestSubject = passedRows.find((r) => Number(r[5]) === highest);
    const lowestSubject = passedRows.find((r) => Number(r[5]) === lowest);

    const chartData = Object.entries(counts)
        .filter(([_, count]) => count > 0)
        .map(([grade, count]) => ({
            name: `Grade ${grade}`,
            grade,
            value: count,
            percentage: totalSubjects > 0 ? ((count / totalSubjects) * 100).toFixed(1) : "0",
            color: GRADE_COLORS[grade] || "#9ca3af",
        }));

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="p-5 bg-surface border border-border-strong rounded-md shadow-xs"
        >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
                
                {/* Left: Quick Stats */}
                <div className="space-y-4">
                    <div>
                        <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                            Quick Stats Overview
                        </h3>
                        <p className="text-[11px] font-mono text-neutral-400 mt-0.5">
                            Key metrics summary for current view
                        </p>
                    </div>

                    <div className="space-y-2.5 font-mono">
                        {/* Total Marks */}
                        <div className="flex items-center justify-between py-1.5 border-b border-border-strong">
                            <span className="text-xs font-medium text-neutral-300">Total Marks</span>
                            <div className="text-right">
                                <span className="text-xs font-bold text-teal-300">{totalMarks}</span>
                                <span className="text-[11px] text-neutral-400"> / {totalSubjects * 100}</span>
                            </div>
                        </div>

                        {/* Credits Earned */}
                        <div className="flex items-center justify-between py-1.5 border-b border-border-strong">
                            <span className="text-xs font-medium text-neutral-300">Credits Earned</span>
                            <div className="text-right">
                                <span className="text-xs font-bold text-purple-300">{earnedCredits}</span>
                                <span className="text-[11px] text-neutral-400"> / {totalCredits}</span>
                            </div>
                        </div>

                        {/* Highest Score */}
                        <div className="flex items-center justify-between py-1.5 border-b border-border-strong">
                            <div>
                                <div className="text-xs font-medium text-neutral-300">Highest Score</div>
                                <div className="text-[10px] text-neutral-400 truncate max-w-44">
                                    {highestSubject ? String(highestSubject[2]) : "N/A"}
                                </div>
                            </div>
                            <span className="text-xs font-bold text-amber-300">
                                {highest > -Infinity ? `${highest} pts` : "—"}
                            </span>
                        </div>

                        {/* Lowest Score */}
                        <div className="flex items-center justify-between py-1.5 border-b border-border-strong">
                            <div>
                                <div className="text-xs font-medium text-neutral-300">Lowest Score</div>
                                <div className="text-[10px] text-neutral-400 truncate max-w-44">
                                    {lowestSubject ? String(lowestSubject[2]) : "N/A"}
                                </div>
                            </div>
                            <span className="text-xs font-bold text-sky-300">
                                {lowest < Infinity ? `${lowest} pts` : "—"}
                            </span>
                        </div>

                        {/* Backlogs */}
                        <div className="flex items-center justify-between py-1.5">
                            <span className="text-xs font-medium text-neutral-300">Backlogs</span>
                            <span className={`text-xs font-bold ${backlogs > 0 ? "text-rose-400" : "text-emerald-400"}`}>
                                {backlogs} {backlogs === 1 ? "subject" : "subjects"}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Right: Recharts Donut Chart */}
                <div className="space-y-3 lg:border-l lg:border-border-strong lg:pl-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                            Grade Distribution
                        </h3>
                        <span className="text-[10px] font-mono text-neutral-300 px-2 py-0.5 rounded-sm bg-surface-deep border border-border-strong">
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
                                        stroke="#060608"
                                        strokeWidth={2}
                                    >
                                        {chartData.map((entry) => (
                                            <Cell key={entry.grade} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    
                                    <Tooltip
                                        content={({ active, payload }) => {
                                            if (active && payload && payload.length) {
                                                const data = payload[0].payload;
                                                return (
                                                    <div className="bg-[#18181b] border border-[#3f3f46] px-3 py-1.5 rounded-sm text-xs font-mono shadow-md">
                                                        <div className="font-bold text-white mb-0.5 flex items-center gap-1.5">
                                                            <span
                                                                className="w-2 h-2 rounded-full inline-block"
                                                                style={{ backgroundColor: data.color }}
                                                            />
                                                            {data.name}
                                                        </div>
                                                        <div className="text-xs text-neutral-300 font-medium">
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

                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                                <span className="text-lg font-bold font-mono text-white">
                                    {totalSubjects}
                                </span>
                                <span className="text-[9px] font-mono uppercase text-neutral-400">
                                    Total
                                </span>
                            </div>
                        </div>
                    ) : (
                        <div className="h-44 rounded-sm bg-surface-deep border border-dashed border-border-strong flex items-center justify-center text-xs font-mono text-neutral-400">
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
                                <span className="font-bold text-white">{item.grade}</span>
                                <span className="text-neutral-400">({item.value})</span>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </motion.div>
    );
}
