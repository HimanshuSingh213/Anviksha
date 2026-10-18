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

// Summary cards displaying key academic metrics: GPA, credits, raw marks, and percentage.
export default function AnalyticsOverview(props: Props) {
    const metricCards = useMemo(() => getCards(props), [props]);

    return (
        <section className="home-panel overflow-hidden" aria-label="Overview">
            <div className="grid grid-cols-2 gap-px bg-border lg:grid-cols-4">
                {metricCards.map((card, i) => {
                    const Icon = card.icon;
                    return (
                        <div key={card.label} className="bg-surface p-4 sm:p-5">
                            <motion.div
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, ease: "easeOut", delay: 0.1 + i * 0.06 }}
                            >
                                <div className="flex items-center justify-between">
                                    <div
                                        className={`flex size-8 items-center justify-center rounded-lg border ${card.bg} ${card.border} ${card.accent}`}
                                    >
                                        <Icon size={15} aria-hidden="true" />
                                    </div>
                                    <Link
                                        href={card.href}
                                        title={`How is ${card.label} calculated?`}
                                        aria-label={`How is ${card.label} calculated?`}
                                        className="p-1 text-foreground-muted transition-colors hover:text-gold"
                                    >
                                        <HelpCircle size={14} aria-hidden="true" />
                                    </Link>
                                </div>

                                <p className="mt-4 text-xs text-foreground-secondary">{card.label}</p>
                                <p className="tnum mt-1 truncate font-mono text-xl font-semibold tracking-tight text-foreground sm:text-3xl">
                                    {card.value}
                                </p>
                                <p className="mt-1.5 text-xs leading-5 text-foreground-muted">{card.sub}</p>
                            </motion.div>
                        </div>
                    );
                })}
            </div>

            {props.backlogsCount > 0 ? (
                <div className="flex items-start gap-3 border-t border-border px-4 py-3.5 sm:px-5">
                    <AlertTriangle size={15} className="mt-1 shrink-0 text-grade-fail" aria-hidden="true" />
                    <p className="text-sm leading-6 text-foreground-secondary">
                        <span className="font-semibold text-grade-fail">
                            {props.backlogsCount} Backlog{props.backlogsCount > 1 ? "s" : ""} Active
                        </span>
                        <span className="text-foreground-muted"> (Re-appear required)</span>
                        <span className="block sm:ml-2 sm:inline">
                            Backlog subjects carry 0 grade points — clear them in re-appear exams to raise GPA.
                        </span>
                    </p>
                </div>
            ) : (
                <div className="flex items-center gap-3 border-t border-border px-4 py-3.5 sm:px-5">
                    <CheckCircle2 size={15} className="shrink-0 text-grade-excellent" aria-hidden="true" />
                    <p className="text-sm font-medium text-grade-excellent">
                        Clean academic standing — 0 backlogs in this view!
                    </p>
                </div>
            )}
        </section>
    );
}
