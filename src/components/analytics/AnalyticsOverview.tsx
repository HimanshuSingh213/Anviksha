"use client";

import { useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Award, BookOpen, Percent, FileText, AlertTriangle, CheckCircle2, HelpCircle } from "lucide-react";

interface Props {
    gpa: string;
    gpaLabel: string;
    earnedCredits: number;
    totalCredits: number;
    obtainedMarks: number;
    totalMaxMarks: number;
    percentage: string;
    backlogsCount: number;
    percentSub?: string;
}

const formatPercentage = (val: string) => {
    if (!val || val === "—") return "—";
    return val.endsWith("%") ? val : `${val}%`;
};

const getCards = (props: Props) => {
    const isGpaApplicable = props.gpa !== "N/A" && props.gpa !== "—";
    const hasCredits = props.totalCredits > 0;

    return [
        {
            label: props.gpaLabel,
            value: props.gpa,
            sub: isGpaApplicable ? "out of 10.0 scale" : "Percentage scheme",
            icon: Award,
            accent: "text-cat-violet",
            border: "border-cat-violet-border",
            bg: "bg-cat-violet-surface",
            href: "/calculations#sgpa",
        },
        {
            label: hasCredits ? "Credits Earned" : "Credits Status",
            value: hasCredits ? `${props.earnedCredits}/${props.totalCredits}` : "Non-credit",
            sub: hasCredits
                ? `${props.totalCredits - props.earnedCredits} credits pending`
                : "Evaluated by course marks",
            icon: BookOpen,
            accent: "text-cat-teal",
            border: "border-cat-teal-border",
            bg: "bg-cat-teal-surface",
            href: "/calculations#credits",
        },
        {
            label: "Marks Obtained",
            value: props.totalMaxMarks > 0 ? `${props.obtainedMarks}/${props.totalMaxMarks}` : `${props.obtainedMarks}`,
            sub: props.totalMaxMarks > 0
                ? `${((props.obtainedMarks / props.totalMaxMarks) * 100).toFixed(1)}% raw score`
                : "—",
            icon: FileText,
            accent: "text-cat-pink",
            border: "border-cat-pink-border",
            bg: "bg-cat-pink-surface",
            href: "/calculations#grades",
        },
        (() => {
            const defaultSub = props.gpaLabel.includes("SGPA")
                ? "SGPA × 10 (Ordinance 11)"
                : "CGPA × 10 (Ordinance 11)";
            return {
                label: isGpaApplicable ? "Equivalent %" : "Aggregate %",
                value: formatPercentage(props.percentage),
                sub: props.percentSub ?? defaultSub,
                icon: Percent,
                accent: "text-cat-blue",
                border: "border-cat-blue-border",
                bg: "bg-cat-blue-surface",
                href: "/calculations#percentage",
            };
        })(),
    ];
};

export default function AnalyticsOverview(props: Props) {
    const metricCards = useMemo(() => getCards(props), [props]);

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {metricCards.map((card, i) => {
                    const Icon = card.icon;
                    return (
                        <motion.div
                            key={card.label}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05, duration: 0.25 }}
                            className="p-3.5 sm:p-4 bg-surface border border-border-strong rounded-md space-y-2.5 sm:space-y-3 shadow-xs relative group"
                        >
                            <div className="flex items-center justify-between">
                                <div className={`w-7 h-7 rounded-sm flex items-center justify-center border ${card.bg} ${card.border} ${card.accent}`}>
                                    <Icon size={13} />
                                </div>
                                <Link
                                    href={card.href}
                                    title={`How is ${card.label} calculated?`}
                                    className="text-foreground-muted hover:text-gold transition-colors p-1"
                                >
                                    <HelpCircle size={12} />
                                </Link>
                            </div>

                            <div className="min-w-0">
                                <div className="text-xl sm:text-2xl font-bold font-mono tracking-tight text-foreground leading-none truncate">
                                    {card.value}
                                </div>
                                <div className="text-[10px] sm:text-[11px] font-mono text-foreground-secondary mt-1 truncate">
                                    {card.sub}
                                </div>
                            </div>

                            <div className="text-[9px] sm:text-[10px] font-mono font-bold uppercase tracking-wider text-foreground-secondary border-t border-border pt-2 truncate flex items-center justify-between">
                                <span>{card.label}</span>
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
