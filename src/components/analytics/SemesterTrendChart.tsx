"use client";

import { useEffect, useState, useMemo } from "react";
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
    LabelList,
} from "recharts";
import Chip from "@/components/analytics/Chip";
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

const TOOLTIP_CLASS = "rounded-lg border border-border-strong bg-surface-elevated px-3 py-2 text-xs shadow-xl";
const AXIS_TICK = { fill: "var(--foreground-muted)", fontSize: 11 };

// Displays semester SGPA progression trends and subject-wise internal versus external marks distribution.
export default function SemesterTrendChart({
    sgpaBySemester,
    semesterPerformance,
    subjectResults,
}: Props) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Semester curve data points and best semester identifier
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

    // Subject-wise internal vs external marks comparison
    const { subjectMarksData, minBarChartWidth } = useMemo(() => {
        const data = subjectResults.map((s) => {
            const paperCode = s.rawCode ?? "";
            const subjectTitle = s.name ?? "";
            const internal = s.internal ?? 0;
            const external = s.external ?? 0;
            const total = s.total ?? 0;
            const maxMarks = s.maxMarks ?? 100;

            const label = paperCode.length > 0 ? paperCode : subjectTitle.slice(0, 8);

            return {
                label,
                paperCode,
                subjectTitle,
                internal,
                external,
                total,
                maxMarks,
            };
        });

        const minWidth = Math.max(100, data.length * 46);
        return { subjectMarksData: data, minBarChartWidth: minWidth };
    }, [subjectResults]);

    return (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-5 lg:gap-6">

            {/* Semester SGPA progression trend */}
            <section className="home-panel flex flex-col p-5 sm:p-6 lg:col-span-2">
                <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
                    <h3 className="flex items-center gap-2.5 text-base font-semibold tracking-[-0.01em] text-foreground">
                        <TrendingUp size={16} className="text-chart-cyan" aria-hidden="true" />
                        Semester SGPA Trend
                    </h3>
                    {bestSem && (
                        <Chip tone="gold" className="font-mono">
                            Best: Sem {bestSem.sem} ({bestSem.sgpa.toFixed(2)})
                        </Chip>
                    )}
                </div>

                {!mounted ? (
                    <div className="mt-5 min-h-60 flex-1 animate-pulse rounded-lg bg-surface-elevated/60" />
                ) : semData.length > 0 ? (
                    <div className="relative mt-5 min-h-60 flex-1 font-mono">
                        <div className="absolute inset-0">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={semData} margin={{ top: 16, right: 12, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="cyanGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="var(--chart-cyan)" stopOpacity={0.28} />
                                            <stop offset="100%" stopColor="var(--chart-cyan)" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid stroke="var(--border)" vertical={false} />
                                    <XAxis
                                        dataKey="semLabel"
                                        tick={AXIS_TICK}
                                        padding={{ left: 20, right: 20 }}
                                        tickLine={false}
                                        axisLine={{ stroke: "var(--border-strong)" }}
                                    />
                                    <YAxis
                                        domain={[0, 10]}
                                        ticks={[0, 2, 4, 6, 8, 10]}
                                        width={28}
                                        tick={AXIS_TICK}
                                        tickLine={false}
                                        axisLine={false}
                                    />

                                    <Tooltip
                                        cursor={{ stroke: "var(--border-strong)" }}
                                        content={({ active, payload }) => {
                                            if (active && payload && payload.length) {
                                                const data = payload[0].payload;
                                                return (
                                                    <div className={TOOLTIP_CLASS}>
                                                        <div className="font-semibold text-foreground">
                                                            Semester {data.sem} Performance
                                                        </div>
                                                        <div className="tnum mt-1 font-mono text-sm font-semibold text-chart-cyan">
                                                            SGPA: {Number(data.sgpa).toFixed(2)} / 10.0
                                                        </div>
                                                        <div className="mt-0.5 text-foreground-secondary">
                                                            {data.totalCredits} Credits · {data.subjects} Subjects
                                                            {data.backlogs > 0 && (
                                                                <span className="ml-1 font-semibold text-grade-fail">
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
                                        strokeWidth={2}
                                        fillOpacity={1}
                                        fill="url(#cyanGradient)"
                                        animationDuration={900}
                                        dot={(dot) => {
                                            // Highlights the student's highest SGPA semester with a distinct gold indicator
                                            const isBest = bestSem !== null && dot.payload.sem === bestSem.sem;
                                            return (
                                                <circle
                                                    key={dot.index}
                                                    cx={dot.cx}
                                                    cy={dot.cy}
                                                    r={isBest ? 5 : 3.5}
                                                    fill={isBest ? "var(--gold)" : "var(--surface)"}
                                                    stroke={isBest ? "var(--surface)" : "var(--chart-cyan)"}
                                                    strokeWidth={2}
                                                />
                                            );
                                        }}
                                        activeDot={{ r: 5, fill: "var(--chart-cyan)", stroke: "var(--surface)", strokeWidth: 2 }}
                                    >
                                        <LabelList
                                            dataKey="sgpa"
                                            position="top"
                                            offset={10}
                                            fill="var(--foreground-secondary)"
                                            fontSize={11}
                                            formatter={(value) => Number(value).toFixed(2)}
                                        />
                                    </Area>
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                ) : (
                    <div className="mt-5 flex min-h-60 flex-1 items-center justify-center rounded-lg border border-dashed border-border-strong text-sm text-foreground-muted">
                        No semester data available
                    </div>
                )}
            </section>

            {/* Subject-wise internal vs external marks distribution */}
            <section className="home-panel flex flex-col p-5 sm:p-6 lg:col-span-3">
                <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
                    <h3 className="flex items-center gap-2.5 text-base font-semibold tracking-[-0.01em] text-foreground">
                        <BarChart3 size={16} className="text-chart-purple" aria-hidden="true" />
                        Subject-Wise Internal vs External Marks
                    </h3>

                    {/* Legend placed in header to allow maximum vertical chart space */}
                    <div className="flex items-center gap-4 text-xs text-foreground-secondary">
                        <span className="flex items-center gap-1.5">
                            <span className="inline-block size-2 rounded-full bg-chart-purple" />
                            Internal
                        </span>
                        <span className="flex items-center gap-1.5">
                            <span className="inline-block size-2 rounded-full bg-chart-amber" />
                            External
                        </span>
                        {subjectMarksData.length > 5 && (
                            <span className={`text-foreground-muted ${subjectMarksData.length > 16 ? "" : "sm:hidden"}`}>
                                Scroll →
                            </span>
                        )}
                    </div>
                </div>

                {!mounted ? (
                    <div className="mt-5 min-h-60 flex-1 animate-pulse rounded-lg bg-surface-elevated/60" />
                ) : subjectMarksData.length > 0 ? (
                    <div className="relative mt-5 min-h-60 flex-1 font-mono">
                        <div className="custom-h-scrollbar absolute inset-0">
                            <div style={{ minWidth: `${minBarChartWidth}px`, width: "100%", height: "100%" }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={subjectMarksData} margin={{ top: 16, right: 12, left: 0, bottom: 0 }} barGap={3}>
                                        <CartesianGrid stroke="var(--border)" vertical={false} />
                                        <XAxis
                                            dataKey="label"
                                            tick={{ ...AXIS_TICK, fontSize: 10 }}
                                            tickLine={false}
                                            axisLine={{ stroke: "var(--border-strong)" }}
                                        />
                                        <YAxis
                                            domain={[0, (dataMax: number) => Math.max(75, Math.ceil(dataMax / 25) * 25)]}
                                            width={28}
                                            tick={AXIS_TICK}
                                            tickLine={false}
                                            axisLine={false}
                                        />

                                        <Tooltip
                                            cursor={{ fill: "var(--surface-elevated)" }}
                                            content={({ active, payload }) => {
                                                if (active && payload && payload.length) {
                                                    const data = payload[0].payload;
                                                    return (
                                                        <div className={TOOLTIP_CLASS}>
                                                            <div className="font-semibold text-foreground">{data.subjectTitle}</div>
                                                            <div className="mt-0.5 font-mono text-foreground-muted">{data.paperCode}</div>
                                                            <div className="tnum mt-2 space-y-0.5 font-mono">
                                                                <div className="text-chart-purple">Internal: {data.internal}</div>
                                                                <div className="text-chart-amber">External: {data.external}</div>
                                                            </div>
                                                            <div className="tnum mt-2 border-t border-border pt-2 font-mono font-semibold text-foreground">
                                                                Total: {data.total} / {data.maxMarks}
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
                                            barSize={11}
                                            radius={[4, 4, 0, 0]}
                                            animationDuration={700}
                                        />
                                        <Bar
                                            dataKey="external"
                                            name="External"
                                            fill="var(--chart-amber)"
                                            barSize={11}
                                            radius={[4, 4, 0, 0]}
                                            animationDuration={700}
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="mt-5 flex min-h-60 flex-1 items-center justify-center rounded-lg border border-dashed border-border-strong text-sm text-foreground-muted">
                        No subject data available
                    </div>
                )}
            </section>

        </div>
    );
}
