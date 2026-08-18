"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Award, BookOpen, Percent, FileText, AlertTriangle, CheckCircle2 } from "lucide-react";

interface Props {
    gpa: string;
    gpaLabel: string;
    earnedCredits: number;
    totalCredits: number;
    obtainedMarks: number;
    totalMaxMarks: number;
    percentage: string;
    backlogsCount: number;
}

const getCards = (props: Props) => [
    {
        label: props.gpaLabel,
        value: props.gpa,
        sub: "out of 10.0 scale",
        icon: Award,
        accent: "text-cat-violet",
        border: "border-cat-violet-border",
        bg: "bg-cat-violet-surface",
    },
    {
        label: "Credits Earned",
        value: `${props.earnedCredits}/${props.totalCredits}`,
        sub: `${props.totalCredits - props.earnedCredits} credits pending`,
        icon: BookOpen,
        accent: "text-cat-teal",
        border: "border-cat-teal-border",
        bg: "bg-cat-teal-surface",
    },
    {
        label: "Marks Obtained",
        value: `${props.obtainedMarks}/${props.totalMaxMarks}`,
        sub: props.totalMaxMarks > 0
            ? `${((props.obtainedMarks / props.totalMaxMarks) * 100).toFixed(1)}% raw score`
            : "—",
        icon: FileText,
        accent: "text-cat-pink",
        border: "border-cat-pink-border",
        bg: "bg-cat-pink-surface",
    },
    {
        label: "Percentage",
        value: `${props.percentage}%`,
        sub: "CGPA × 10 (GGSIPU Ordinance 11)",
        icon: Percent,
        accent: "text-cat-blue",
        border: "border-cat-blue-border",
        bg: "bg-cat-blue-surface",
    },
];

export default function AnalyticsOverview(props: Props) {
    // Memoize the array of metric cards to prevent object recreation on every render
    const metricCards = useMemo(() => getCards(props), [
        props.gpa, 
        props.gpaLabel, 
        props.earnedCredits, 
        props.totalCredits, 
        props.obtainedMarks, 
        props.totalMaxMarks, 
        props.percentage
    ]);

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {metricCards.map((card, i) => {
                    const Icon = card.icon;
                    return (
                        <motion.div
                            key={card.label}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05, duration: 0.25 }}
                            className="p-4 bg-surface border border-border-strong rounded-md space-y-3 shadow-xs"
                        >
                            <div className={`w-7 h-7 rounded-sm flex items-center justify-center border ${card.bg} ${card.border} ${card.accent}`}>
                                <Icon size={13} />
                            </div>

                            <div>
                                <div className="text-2xl font-bold font-mono tracking-tight text-foreground leading-none">
                                    {card.value}
                                </div>
                                <div className="text-[11px] font-mono text-foreground-secondary mt-1">
                                    {card.sub}
                                </div>
                            </div>

                            <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-foreground-secondary border-t border-border pt-2">
                                {card.label}
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {props.backlogsCount > 0 ? (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-3 p-3.5 rounded-md bg-surface-elevated border border-border-strong text-foreground shadow-xs"
                >
                    <div className="p-2 rounded-sm bg-grade-fail-surface border border-grade-fail-border text-grade-fail shrink-0">
                        <AlertTriangle size={15} />
                    </div>
                    <div>
                        <div className="text-xs font-mono font-bold text-foreground flex items-center gap-2">
                            <span className="text-grade-fail font-extrabold">{props.backlogsCount} Backlog{props.backlogsCount > 1 ? "s" : ""} Active</span>
                            <span className="text-[10px] font-normal text-foreground-muted">(Re-appear required)</span>
                        </div>
                        <div className="text-[11px] font-mono text-foreground-secondary mt-0.5">
                            Backlog subjects carry 0 grade points — clear them in re-appear exams to raise GPA.
                        </div>
                    </div>
                </motion.div>
            ) : (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center gap-2.5 p-3 rounded-md bg-surface border border-grade-excellent-border text-grade-excellent text-xs font-mono font-bold"
                >
                    <CheckCircle2 size={14} className="shrink-0 text-grade-excellent" />
                    <span>Clean academic standing — 0 backlogs in this view!</span>
                </motion.div>
            )}
        </div>
    );
}
