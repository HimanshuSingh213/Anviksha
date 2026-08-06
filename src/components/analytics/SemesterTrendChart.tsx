"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { TrendingUp, Award, BarChart3 } from "lucide-react";
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

    // Group rows by semester for SGPA trend
    const semMap: Record<number, any[]> = {};
    allResults.forEach((row) => {
        const sem = Number(row[0]);
        if (sem >= 1 && sem <= 8) {
            if (!semMap[sem]) semMap[sem] = [];
            semMap[sem].push(row);
        }
    });

    const semKeys = Object.keys(semMap).map(Number).sort((a, b) => a - b);

    const semData = semKeys.map((semNum) => {
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

    // Subject-wise Internal vs External data
    const subjectMarksData = filteredResults.map((row) => {
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

    // Calculate minimum chart width to prevent bar crushing and enable horizontal scroll
    const minBarChartWidth = Math.max(100, subjectMarksData.length * 64);

    let bestSem: typeof semData[0] | null = null;
    semData.forEach((s) => {
        if (!bestSem || s.sgpa > bestSem.sgpa) {
            bestSem = s;
        }
    });

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
                        <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
                            <TrendingUp size={13} className="text-sky-400" />
                            Semester SGPA Trend
                        </h3>
                        <p className="text-[11px] font-mono text-neutral-400 mt-0.5">
                            Grade-point progression across semesters
                        </p>
                    </div>
                    {bestSem && (
                        <div className="flex items-center gap-1 px-2.5 py-1 rounded-sm bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] font-mono font-bold shrink-0">
                            <Award size={12} />
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
                                        <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.4} />
                                        <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a32" vertical={false} />
                                <XAxis
                                    dataKey="semLabel"
                                    stroke="#9ca3af"
                                    fontSize={11}
                                    tickLine={false}
                                    axisLine={{ stroke: "#2a2a32" }}
                                />
                                <YAxis
                                    domain={[0, 10]}
                                    ticks={[0, 2, 4, 6, 8, 10]}
                                    stroke="#9ca3af"
                                    fontSize={11}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                
                                <Tooltip
                                    cursor={{ fill: "#141418" }}
                                    content={({ active, payload }) => {
                                        if (active && payload && payload.length) {
                                            const data = payload[0].payload;
                                            return (
                                                <div className="bg-[#18181b] border border-[#3f3f46] px-3.5 py-2 rounded-sm text-xs font-mono shadow-xl">
                                                    <div className="font-bold text-white mb-0.5">
                                                        Semester {data.sem} Performance
                                                    </div>
                                                    <div className="text-sky-300 font-bold text-sm">
                                                        SGPA: {data.sgpa} / 10.0
                                                    </div>
                                                    <div className="text-neutral-300 text-[11px] mt-0.5">
                                                        {data.totalCredits} Credits · {data.subjects} Subjects
                                                        {data.backlogs > 0 && (
                                                            <span className="text-rose-400 font-bold ml-1">
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
                                    stroke="#38bdf8"
                                    strokeWidth={2.5}
                                    fillOpacity={1}
                                    fill="url(#cyanGradient)"
                                    activeDot={{ r: 6, fill: "#38bdf8", stroke: "#ffffff", strokeWidth: 2 }}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                ) : (
                    <div className="h-56 rounded-sm bg-surface-deep border border-dashed border-border-strong flex items-center justify-center text-xs font-mono text-neutral-400">
                        No semester data available
                    </div>
                )}

                <div className="flex items-center justify-between text-[11px] font-mono border-t border-border-strong pt-2.5">
                    <span className="flex items-center gap-1.5 text-neutral-300">
                        <span className="w-2.5 h-0.5 bg-sky-400 inline-block" />
                        SGPA Curve
                    </span>
                    <span className="text-neutral-400">Scale: 0.0 - 10.0</span>
                </div>
            </motion.div>

            {/* Subject-wise internal vs external bar chart with custom horizontal scrollbar and no vertical scroll */}
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: 0.05 }}
                className="p-5 bg-surface border border-border-strong rounded-md shadow-xs space-y-4"
            >
                <div className="flex items-center justify-between gap-2">
                    <div>
                        <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider flex items-center gap-2">
                            <BarChart3 size={13} className="text-purple-300" />
                            Subject-Wise Internal vs External Marks
                        </h3>
                        <p className="text-[11px] font-mono text-neutral-400 mt-0.5">
                            Individual subject internal & external breakdown ({subjectMarksData.length} subjects)
                        </p>
                    </div>
                </div>

                {mounted && subjectMarksData.length > 0 ? (
                    <div className="h-56 w-full pt-2 font-mono custom-h-scrollbar">
                        <div style={{ minWidth: `${minBarChartWidth}px`, width: "100%", height: "100%" }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={subjectMarksData} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#2a2a32" vertical={false} />
                                    <XAxis
                                        dataKey="label"
                                        stroke="#9ca3af"
                                        fontSize={10}
                                        tickLine={false}
                                        axisLine={{ stroke: "#2a2a32" }}
                                    />
                                    <YAxis
                                        domain={[0, 75]}
                                        stroke="#9ca3af"
                                        fontSize={11}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    
                                    <Tooltip
                                        cursor={{ fill: "#141418" }}
                                        content={({ active, payload }) => {
                                            if (active && payload && payload.length) {
                                                const data = payload[0].payload;
                                                return (
                                                    <div className="bg-[#18181b] border border-[#3f3f46] px-3.5 py-2 rounded-sm text-xs font-mono shadow-xl">
                                                        <div className="font-bold text-white mb-1">
                                                            {data.subjectTitle}
                                                        </div>
                                                        <div className="text-[11px] text-neutral-400 mb-1">
                                                            Code: {data.paperCode}
                                                        </div>
                                                        <div className="text-purple-300 font-bold">
                                                            Internal Marks: {data.internal}
                                                        </div>
                                                        <div className="text-orange-300 font-bold">
                                                            External Marks: {data.external}
                                                        </div>
                                                        <div className="text-white font-bold border-t border-border-strong mt-1 pt-1">
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
                                        fill="#c084fc"
                                        barSize={12}
                                        radius={[3, 3, 0, 0]}
                                    />
                                    <Bar
                                        dataKey="external"
                                        name="External"
                                        fill="#fb923c"
                                        barSize={12}
                                        radius={[3, 3, 0, 0]}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                ) : (
                    <div className="h-56 rounded-sm bg-surface-deep border border-dashed border-border-strong flex items-center justify-center text-xs font-mono text-neutral-400">
                        No subject data available
                    </div>
                )}

                <div className="flex items-center justify-between text-[11px] font-mono border-t border-border-strong pt-2.5">
                    <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1.5 text-neutral-300">
                            <span className="w-2.5 h-2.5 bg-purple-400 rounded-xs inline-block" />
                            Internal Marks
                        </span>
                        <span className="flex items-center gap-1.5 text-neutral-300">
                            <span className="w-2.5 h-2.5 bg-orange-400 rounded-xs inline-block" />
                            External Marks
                        </span>
                    </div>
                    {subjectMarksData.length > 8 && (
                        <span className="text-neutral-400 text-[10px] uppercase">Scroll →</span>
                    )}
                </div>
            </motion.div>

        </div>
    );
}
