"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { PieChart as PieIcon } from "lucide-react";
import { getGradeAndPoints } from "@/helpers/grade-system";

interface Props {
    rows: any[][];
}

const GRADE_COLORS: Record<string, string> = {
    O: "#34b37a",
    "A+": "#34b37a",
    A: "#8fbf4d",
    "B+": "#8fbf4d",
    B: "#e0a639",
    C: "#e0a639",
    P: "#e07b39",
    F: "#e1504b",
};

export default function GradeDistributionChart({ rows }: Props) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const total = rows.length;

    // Aggregate grade counts
    const counts: Record<string, number> = {
        O: 0,
        "A+": 0,
        A: 0,
        "B+": 0,
        B: 0,
        C: 0,
        P: 0,
        F: 0,
    };

    rows.forEach((row) => {
        const { grade } = getGradeAndPoints(Number(row[5]));
        if (grade in counts) counts[grade]++;
        else counts["F"]++;
    });

    // Format data for Recharts PieChart (only include grades with > 0 count)
    const chartData = Object.entries(counts)
        .filter(([_, count]) => count > 0)
        .map(([grade, count]) => ({
            name: `Grade ${grade}`,
            grade,
            value: count,
            percentage: total > 0 ? ((count / total) * 100).toFixed(1) : "0",
            color: GRADE_COLORS[grade] || "#7c8591",
        }));

    return (
        <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="p-5 bg-surface border border-border-strong rounded-xl space-y-4 h-full flex flex-col justify-between"
        >
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <div className="flex items-center gap-2 text-xs font-mono font-bold text-foreground uppercase tracking-wider">
                        <PieIcon size={13} className="text-cat-pink" />
                        Grade Distribution Donut
                    </div>
                    <p className="text-[10px] font-mono text-foreground-muted mt-0.5">
                        Proportional grade share across {total} subject{total !== 1 ? "s" : ""}
                    </p>
                </div>
                <span className="text-[10px] font-mono text-foreground-muted px-2 py-0.5 rounded-md bg-surface-deep border border-border">
                    {total} Total
                </span>
            </div>

            {/* Donut Chart Display */}
            {mounted && chartData.length > 0 ? (
                <div className="relative h-48 w-full flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={chartData}
                                cx="50%"
                                cy="50%"
                                innerRadius={55}
                                outerRadius={80}
                                paddingAngle={3}
                                dataKey="value"
                                stroke="#0d0d10"
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
                                            <div className="bg-surface-elevated border border-border-strong px-3 py-1.5 rounded-md text-xs font-mono shadow-xl">
                                                <div className="font-bold text-foreground" style={{ color: data.color }}>
                                                    {data.name}
                                                </div>
                                                <div className="text-[11px] text-foreground-secondary">
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

                    {/* Hollow Donut Center Label */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                        <span className="text-lg font-bold font-mono text-foreground">
                            {total}
                        </span>
                        <span className="text-[9px] font-mono uppercase text-foreground-muted">
                            Subjects
                        </span>
                    </div>
                </div>
            ) : (
                <div className="h-48 rounded-lg bg-surface-deep border border-dashed border-border-strong flex items-center justify-center text-xs font-mono text-foreground-muted">
                    No data available for chart
                </div>
            )}

            {/* Color Legend Pills */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-2 border-t border-border">
                {chartData.map((item) => (
                    <div
                        key={item.grade}
                        className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-surface-deep border border-border text-[10px] font-mono"
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
        </motion.div>
    );
}
