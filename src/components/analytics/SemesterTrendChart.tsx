"use client";

import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { BarChart3 } from "lucide-react";
import {
    ResponsiveContainer,
    AreaChart,
    Area,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
} from "recharts";
import { getDefaultCredit, getGradeAndPoints } from "@/helpers/grade-system";

interface Props {
    allResults: any[][];
    filteredResults: any[][];
    customCredit: Record<string, number>;
}

export default function SemesterTrendChart({ allResults, filteredResults, customCredit }: Props) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Memoize SGPA semester curve calculation
    const { semData, bestSem } = useMemo(() => {
        const semMap: Record<number, any[]> = {};
        allResults.forEach((row) => {
            const sem = Number(row[0]);
            if (sem >= 1 && sem <= 8) {
                if (!semMap[sem]) semMap[sem] = [];
                semMap[sem].push(row);
            }
        });

        const semKeys = Object.keys(semMap).map(Number).sort((a, b) => a - b);

        const data = semKeys.map((semNum) => {
            let weighted = 0;
            let credits = 0;
            let backlogs = 0;

            semMap[semNum].forEach((row) => {
                const total = isNaN(Number(row[5])) ? 0 : Number(row[5]);
                const credit = customCredit[row[1]] ?? getDefaultCredit(row[2]);
                const { points, pass } = getGradeAndPoints(total);

                weighted += credit * (pass ? points : 0);
                credits += credit;
                if (!pass) backlogs += 1;
            });

            const sgpa = credits > 0 ? Number((weighted / credits).toFixed(2)) : 0;

            return {
                semLabel: `Sem ${semNum}`,
                sem: semNum,
                sgpa,
                backlogs,
                subjects: semMap[semNum].length,
                totalCredits: credits,
            };
        });

        let best: typeof data[0] | null = null;
        data.forEach((s) => {
            if (!best || s.sgpa > best.sgpa) {
                best = s;
            }
        });

        return { semData: data, bestSem: best };
    }, [allResults, customCredit]);

    // Memoize subject-wise internal vs external bar chart data
    const { subjectMarksData, minBarChartWidth } = useMemo(() => {
        const data = filteredResults.map((row) => {
            const paperCode = String(row[1] || "").trim();
            const subjectTitle = String(row[2] || "").trim();
            const internal = isNaN(Number(row[3])) ? 0 : Number(row[3]);
            const external = isNaN(Number(row[4])) ? 0 : Number(row[4]);
            const total = isNaN(Number(row[5])) ? 0 : Number(row[5]);

            const label = paperCode.length > 0 ? paperCode : subjectTitle.slice(0, 8);

            return {
                label,
                paperCode,
                subjectTitle,
                internal,
                external,
                total,
            };
        });

        const minWidth = Math.max(100, data.length * 64);
        return { subjectMarksData: data, minBarChartWidth: minWidth };
    }, [filteredResults]);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* SGPA progression curve */}
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className="p-5 bg-surface border border-border-strong rounded-md shadow-xs space-y-4"
            >
                <div className="flex items-center justify-between gap-2">
                    <div>
                        <h3 className="text-xs font-mono font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                            Semester SGPA Trend
                        </h3>
                        <p className="text-[11px] font-mono text-foreground-secondary mt-0.5">
                            Grade-point progression across semesters
                        </p>
                    </div>
                    {bestSem && (
                        <div className="flex items-center gap-1 px-2.5 py-1 rounded-sm bg-gold-surface border border-gold-border text-gold text-[11px] font-mono font-bold shrink-0">
                            <span>Best: Sem {(bestSem as any).sem} ({(bestSem as any).sgpa})</span>
                        </div>
                    )}
                </div>

                {mounted && semData.length > 0 ? (
                    <div className="h-56 w-full pt-2 font-mono">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={semData} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="cyanGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--chart-cyan)" stopOpacity={0.4} />
                                        <stop offset="95%" stopColor="var(--chart-cyan)" stopOpacity={0.0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-strong)" vertical={false} />
                                <XAxis
                                    dataKey="semLabel"
                                    stroke="var(--foreground-secondary)"
                                    fontSize={11}
                                    tickLine={false}
                                    axisLine={{ stroke: "var(--border-strong)" }}
                                />
                                <YAxis
                                    domain={[0, 10]}
                                    ticks={[0, 2, 4, 6, 8, 10]}
                                    stroke="var(--foreground-secondary)"
                                    fontSize={11}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                
                                <Tooltip
                                    cursor={{ fill: "var(--surface-elevated)" }}
                                    content={({ active, payload }) => {
                                        if (active && payload && payload.length) {
                                            const data = payload[0].payload;
                                            return (
                                                <div className="bg-surface-elevated border border-border-strong px-3.5 py-2 rounded-sm text-xs font-mono shadow-xl">
                                                    <div className="font-bold text-foreground mb-0.5">
                                                        Semester {data.sem} Performance
                                                    </div>
                                                    <div className="text-chart-cyan font-bold text-sm">
                                                        SGPA: {data.sgpa} / 10.0
                                                    </div>
                                                    <div className="text-foreground-secondary text-[11px] mt-0.5">
                                                        {data.totalCredits} Credits · {data.subjects} Subjects
                                                        {data.backlogs > 0 && (
                                                            <span className="text-grade-fail font-bold ml-1">
                                                                ({data.backlogs} Backlog)
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        }
                                        return null;
                                    }}
                                />

                                <Area
                                    type="monotone"
                                    dataKey="sgpa"
                                    stroke="var(--chart-cyan)"
                                    strokeWidth={2.5}
                                    fillOpacity={1}
                                    fill="url(#cyanGradient)"
                                    activeDot={{ r: 6, fill: "var(--chart-cyan)", stroke: "#ffffff", strokeWidth: 2 }}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                ) : (
                    <div className="h-56 rounded-sm bg-surface-deep border border-dashed border-border-strong flex items-center justify-center text-xs font-mono text-foreground-muted">
                        No semester data available
                    </div>
                )}

                <div className="flex items-center justify-between text-[11px] font-mono border-t border-border-strong pt-2.5">
                    <span className="flex items-center gap-1.5 text-foreground-secondary">
                        <span className="w-2.5 h-0.5 bg-chart-cyan inline-block" />
                        SGPA Curve
                    </span>
                    <span className="text-foreground-muted">Scale: 0.0 - 10.0</span>
                </div>
            </motion.div>

            {/* Subject-wise internal vs external bar chart */}
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: 0.05 }}
                className="p-5 bg-surface border border-border-strong rounded-md shadow-xs space-y-4"
            >
                <div className="flex items-center justify-between gap-2">
                    <div>
                        <h3 className="text-xs font-mono font-bold text-foreground uppercase tracking-wider flex items-center gap-2">
                            <BarChart3 size={13} className="text-chart-purple" />
                            Subject-Wise Internal vs External Marks
                        </h3>
                        <p className="text-[11px] font-mono text-foreground-secondary mt-0.5">
                            Individual subject internal & external breakdown ({subjectMarksData.length} subjects)
                        </p>
                    </div>
                </div>

                {mounted && subjectMarksData.length > 0 ? (
                    <div className="h-56 w-full pt-2 font-mono custom-h-scrollbar">
                        <div style={{ minWidth: `${minBarChartWidth}px`, width: "100%", height: "100%" }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={subjectMarksData} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-strong)" vertical={false} />
                                    <XAxis
                                        dataKey="label"
                                        stroke="var(--foreground-secondary)"
                                        fontSize={10}
                                        tickLine={false}
                                        axisLine={{ stroke: "var(--border-strong)" }}
                                    />
                                    <YAxis
                                        domain={[0, 75]}
                                        stroke="var(--foreground-secondary)"
                                        fontSize={11}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    
                                    <Tooltip
                                        cursor={{ fill: "var(--surface-elevated)" }}
                                        content={({ active, payload }) => {
                                            if (active && payload && payload.length) {
                                                const data = payload[0].payload;
                                                return (
                                                    <div className="bg-surface-elevated border border-border-strong px-3.5 py-2 rounded-sm text-xs font-mono shadow-xl">
                                                        <div className="font-bold text-foreground mb-1">
                                                            {data.subjectTitle}
                                                        </div>
                                                        <div className="text-[11px] text-foreground-secondary mb-1">
                                                            Code: {data.paperCode}
                                                        </div>
                                                        <div className="text-chart-purple font-bold">
                                                            Internal Marks: {data.internal}
                                                        </div>
                                                        <div className="text-chart-amber font-bold">
                                                            External Marks: {data.external}
                                                        </div>
                                                        <div className="text-foreground font-bold border-t border-border-strong mt-1 pt-1">
                                                            Total Score: {data.total} / 100
                                                        </div>
                                                    </div>
                                                );
                                            }
                                            return null;
                                        }}
                                    />

                                    <Bar
                                        dataKey="internal"
                                        name="Internal"
                                        fill="var(--chart-purple)"
                                        barSize={12}
                                        radius={[3, 3, 0, 0]}
                                    />
                                    <Bar
                                        dataKey="external"
                                        name="External"
                                        fill="var(--chart-amber)"
                                        barSize={12}
                                        radius={[3, 3, 0, 0]}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                ) : (
                    <div className="h-56 rounded-sm bg-surface-deep border border-dashed border-border-strong flex items-center justify-center text-xs font-mono text-foreground-muted">
                        No subject data available
                    </div>
                )}

                <div className="flex items-center justify-between text-[11px] font-mono border-t border-border-strong pt-2.5">
                    <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1.5 text-foreground-secondary">
                            <span className="w-2.5 h-2.5 bg-chart-purple rounded-xs inline-block" />
                            Internal Marks
                        </span>
                        <span className="flex items-center gap-1.5 text-foreground-secondary">
                            <span className="w-2.5 h-2.5 bg-chart-amber rounded-xs inline-block" />
                            External Marks
                        </span>
                    </div>
                    {subjectMarksData.length > 8 && (
                        <span className="text-foreground-muted text-[10px] uppercase">Scroll →</span>
                    )}
                </div>
            </motion.div>

        </div>
    );
}
