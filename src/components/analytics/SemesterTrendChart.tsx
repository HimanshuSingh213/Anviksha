"use client";

import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { BarChart3, TrendingUp } from "lucide-react";
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
import type { Metric, SubjectResult } from "@/types/result";

interface Props {
    sgpaBySemester: Array<{ semester: number | string; sgpa: Metric<number | null> }>;
    semesterPerformance: Array<{
        semester: number | string;
        totalCredits: number;
        subjectCount: number;
        backlogCount: number;
    }>;
    subjectResults: SubjectResult[];
}

export default function SemesterTrendChart({
    sgpaBySemester,
    semesterPerformance,
    subjectResults,
}: Props) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Semester curve + tooltip counters
    const { semData, bestSem } = useMemo(() => {
        const data = sgpaBySemester
            .map(({ semester, sgpa }) => {
                const perf = semesterPerformance.find(
                    (p) => String(p.semester) === String(semester),
                );

                return {
                    semLabel: `Sem ${semester}`,
                    sem: semester,
                    sgpa: sgpa.value ?? 0,
                    totalCredits: perf?.totalCredits ?? 0,
                    subjects: perf?.subjectCount ?? 0,
                    backlogs: perf?.backlogCount ?? 0,
                };
            })
            .filter((d) => d.sgpa > 0);

        const best = data.reduce<(typeof data)[number] | null>(
            (acc, cur) => (!acc || cur.sgpa > acc.sgpa ? cur : acc),
            null,
        );

        return { semData: data, bestSem: best };
    }, [sgpaBySemester, semesterPerformance]);

    // Memoize subject-wise internal vs external bar chart data
    const { subjectMarksData, minBarChartWidth } = useMemo(() => {
        const data = subjectResults.map((s) => {
            const paperCode = s.rawCode ?? "";
            const subjectTitle = s.name ?? "";
            const internal = s.internal ?? 0;
            const external = s.external ?? 0;
            const total = s.total ?? 0;

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
    }, [subjectResults]);

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
                        <TrendingUp size={13} className="text-chart-cyan" />
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

            {!mounted ? (
                <div className="h-56 w-full pt-2 font-mono flex items-center justify-center">
                    <div className="h-full w-full rounded bg-surface-deep/40 animate-pulse border border-border-strong/30" />
                </div>
            ) : semData.length > 0 ? (
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

            {!mounted ? (
                <div className="h-56 w-full pt-2 font-mono flex items-center justify-center">
                    <div className="h-full w-full rounded bg-surface-deep/40 animate-pulse border border-border-strong/30" />
                </div>
            ) : subjectMarksData.length > 0 ? (
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
                                    domain={[0, (dataMax: number) => Math.max(75, Math.ceil(dataMax / 25) * 25)]}
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
