"use client";

import { motion } from "framer-motion";
import { Trophy, BookOpen, AlertTriangle, TrendingDown, TrendingUp, Activity } from "lucide-react";
import { getGradeAndPoints } from "@/helpers/grade-system";

interface Props {
    rows: any[][];
    totalCredits: number;
    earnedCredits: number;
}

export default function QuickStats({ rows, totalCredits, earnedCredits }: Props) {
    if (rows.length === 0) return null;

    // Calculate highest, lowest, backlogs, and total marks
    let highest = -Infinity;
    let lowest = Infinity;
    let backlogs = 0;
    let totalMarks = 0;

    rows.forEach((row) => {
        const total = isNaN(Number(row[5])) ? 0 : Number(row[5]);
        const { pass } = getGradeAndPoints(total);
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

    const statsList = [
        {
            label: "Total Marks Earned",
            value: totalMarks,
            sub: `out of ${rows.length * 100} max marks`,
            icon: TrendingUp,
            color: "text-cat-teal",
        },
        {
            label: "Credits Earned",
            value: `${earnedCredits} / ${totalCredits}`,
            sub: `${totalCredits - earnedCredits} credit drag`,
            icon: BookOpen,
            color: "text-cat-violet",
        },
        {
            label: "Highest Score",
            value: highest > -Infinity ? `${highest} / 100` : "—",
            sub: highestSubject ? String(highestSubject[2]) : "—",
            icon: Trophy,
            color: "text-gold",
        },
        {
            label: "Lowest Score",
            value: lowest < Infinity ? `${lowest} / 100` : "—",
            sub: lowestSubject ? String(lowestSubject[2]) : "—",
            icon: TrendingDown,
            color: "text-grade-average",
        },
        {
            label: "Backlog Subjects",
            value: backlogs,
            sub: backlogs === 0 ? "Clean record (0 backlogs)" : "Requires re-appear exam",
            icon: AlertTriangle,
            color: backlogs > 0 ? "text-grade-fail" : "text-grade-excellent",
        },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="p-5 bg-surface border border-border-strong rounded-xl space-y-4 h-full flex flex-col justify-between"
        >
            {/* Header */}
            <div>
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-foreground uppercase tracking-wider">
                    <Activity size={13} className="text-cat-violet" />
                    Quick Metrics Overview
                </div>
                <p className="text-[10px] font-mono text-foreground-muted mt-0.5">
                    Direct breakdown of score ranges, credits, and subject status
                </p>
            </div>

            {/* Direct list view (no separate individual cards) */}
            <div className="divide-y divide-border/60">
                {statsList.map((s, i) => {
                    const Icon = s.icon;
                    return (
                        <div key={s.label} className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between gap-3 font-mono">
                            <div className="flex items-center gap-2.5 min-w-0">
                                <div className={`p-1.5 rounded-md bg-surface-deep border border-border ${s.color} shrink-0`}>
                                    <Icon size={13} />
                                </div>
                                <div className="min-w-0">
                                    <div className="text-[11px] font-semibold text-foreground-secondary truncate">
                                        {s.label}
                                    </div>
                                    <div className="text-[9px] text-foreground-muted truncate">
                                        {s.sub}
                                    </div>
                                </div>
                            </div>
                            <div className="text-xs font-bold text-foreground shrink-0 font-mono">
                                {s.value}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Bottom footnote */}
            <div className="text-[9px] font-mono text-foreground-muted pt-2 border-t border-border">
                Note: Marks and credits reflect current selected semester scope.
            </div>
        </motion.div>
    );
}
