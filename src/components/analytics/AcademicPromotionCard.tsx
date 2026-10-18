"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import {
    ShieldCheck,
    AlertTriangle,
    Clock,
    CheckCircle2,
    ArrowUpRight,
    GraduationCap,
} from "lucide-react";
import Chip, { type ChipTone } from "@/components/analytics/Chip";
import PanelHeader from "@/components/analytics/PanelHeader";
import type { AcademicPromotionStatus, AcademicYearStatus } from "@/types/result";

export type { AcademicYearStatus };

// Status styling and icons for each academic progression state.
const statusTone: Record<
    AcademicYearStatus["status"],
    { label: string; icon: typeof CheckCircle2; chip: ChipTone; text: string; bar: string }
> = {
    PROMOTED: {
        label: "Promoted",
        icon: CheckCircle2,
        chip: "good",
        text: "text-grade-excellent",
        bar: "bg-grade-excellent",
    },
    YEAR_BACK_RISK: {
        label: "Year-back risk",
        icon: AlertTriangle,
        chip: "bad",
        text: "text-grade-fail",
        bar: "bg-grade-fail",
    },
    IN_PROGRESS: {
        label: "In progress",
        icon: Clock,
        chip: "blue",
        text: "text-cat-blue",
        bar: "bg-cat-blue",
    },
    UPCOMING: {
        label: "Upcoming",
        icon: Clock,
        chip: "muted",
        text: "text-foreground-muted",
        bar: "bg-cat-slate",
    },
};

// Tracks annual credit progress and evaluates promotion standing against the 50% threshold.
export default function AcademicPromotionCard({ promotion }: { promotion: AcademicPromotionStatus }) {

    const summary = useMemo(() => {
        let evaluatedYears = 0;
        let promotedYears = 0;
        let totalCredits = 0;
        let earnedCredits = 0;

        for (const year of promotion.years) {
            if (year.status === "UPCOMING") continue;
            evaluatedYears++;
            if (year.status === "PROMOTED") promotedYears++;
            totalCredits += year.totalCredits;
            earnedCredits += year.earnedCredits;
        }

        const requiredCredits = Math.ceil(totalCredits * 0.5);
        const deficit = Math.max(0, requiredCredits - earnedCredits);
        const overallPercent = totalCredits > 0
            ? Number(((earnedCredits / totalCredits) * 100).toFixed(1))
            : 0;

        return {
            evaluatedYears,
            promotedYears,
            totalCredits,
            earnedCredits,
            deficit,
            overallPercent,
        };
    }, [promotion.years]);

    if (promotion.years.length === 0) return null;

    const { years, hasDetentionRisk, activeYear } = promotion;

    const summaryCells = [
        {
            label: "Credit progress",
            value: String(summary.earnedCredits),
            suffix: `/${summary.totalCredits}`,
            note: `${summary.overallPercent}% credit completion`,
            color: "text-foreground",
        },
        {
            label: "Promoted years",
            value: String(summary.promotedYears),
            suffix: `/${summary.evaluatedYears || 0}`,
            note: "Completed annual checkpoints",
            color: "text-foreground",
        },
        {
            label: "Recovery deficit",
            value: `${summary.deficit} cr`,
            suffix: "",
            note: "Credits needed to restore promotion safety",
            color: summary.deficit > 0 ? "text-grade-fail" : "text-accent-mint",
        },
    ];

    return (
        <section aria-labelledby="academic-promotion-heading" className="home-panel space-y-6 p-5 sm:p-6">
            <PanelHeader
                icon={GraduationCap}
                iconClass="border-gold-border bg-gold-surface text-gold"
                kicker="Academic Standing"
                kickerClass="text-gold"
                title="Promotion & Year-Back Assessment"
                helpHref="/calculations#promotion"
                helpTitle="How is promotion calculated?"
                right={
                    <Chip tone={hasDetentionRisk ? "bad" : "good"} className="self-start">
                        {hasDetentionRisk ? (
                            <AlertTriangle size={13} aria-hidden="true" />
                        ) : (
                            <ShieldCheck size={13} aria-hidden="true" />
                        )}
                        {hasDetentionRisk ? "Action required" : "Standing clear"}
                    </Chip>
                }
            />

            <div className="grid grid-cols-3 gap-px overflow-hidden rounded-lg border border-border bg-border">
                {summaryCells.map((cell) => (
                    <div key={cell.label} className="bg-surface p-3 sm:p-4">
                        <p className="text-xs text-foreground-secondary">{cell.label}</p>
                        <p className={`tnum mt-1.5 font-mono text-xl font-semibold sm:text-2xl ${cell.color}`}>
                            {cell.value}
                            {cell.suffix && (
                                <span className="text-sm font-medium text-foreground-muted">{cell.suffix}</span>
                            )}
                        </p>
                        <p className="mt-1 hidden text-xs leading-5 text-foreground-muted sm:block">{cell.note}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
                {years.map((year: AcademicYearStatus, index) => {
                    const tone = statusTone[year.status];
                    const StatusIcon = tone.icon;
                    const isUpcoming = year.status === "UPCOMING";
                    const isActive = year.yearNumber === activeYear;
                    const barPercent = Math.min(100, Math.max(0, year.percentage));

                    return (
                        <motion.article
                            key={year.yearNumber}
                            aria-label={`${year.yearLabel} promotion status: ${tone.label}`}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, ease: "easeOut", delay: 0.1 + index * 0.06 }}
                            className={`flex flex-col rounded-xl border p-4 ${
                                isUpcoming
                                    ? "border-border"
                                    : year.status === "PROMOTED"
                                      ? "border-grade-excellent-border/60 bg-grade-excellent-surface/20"
                                      : year.status === "YEAR_BACK_RISK"
                                        ? "border-grade-fail-border/70 bg-grade-fail-surface/20"
                                        : "border-cat-blue-border/60 bg-cat-blue-surface/20"
                            }`}
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <p className="font-mono text-xs text-foreground-muted">Year {year.yearNumber}</p>
                                    <h3 className="mt-0.5 text-base font-semibold text-foreground">{year.yearLabel}</h3>
                                    <p className="mt-0.5 font-mono text-xs text-foreground-muted">
                                        Sem {year.semesters[0]} / Sem {year.semesters[1]}
                                    </p>
                                </div>
                                {isActive && <Chip tone="gold">Current</Chip>}
                            </div>

                            <Chip tone={tone.chip} className="mt-3 self-start">
                                <StatusIcon size={12} aria-hidden="true" />
                                {tone.label}
                            </Chip>

                            {isUpcoming ? (
                                <p className="mt-4 text-sm text-foreground-muted">Awaiting semester results</p>
                            ) : (
                                <>
                                    <div className="mt-4 flex items-end justify-between gap-3">
                                        <div>
                                            <p className="text-xs text-foreground-muted">Earned</p>
                                            <p className="tnum mt-0.5 font-mono text-2xl font-semibold leading-none text-foreground">
                                                {year.earnedCredits}
                                                <span className="text-sm font-medium text-foreground-muted">
                                                    /{year.totalCredits}
                                                </span>
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className={`tnum font-mono text-lg font-semibold ${tone.text}`}>
                                                {year.percentage}%
                                            </p>
                                            <p className="text-xs text-foreground-muted">min 50%</p>
                                        </div>
                                    </div>

                                    <div
                                        className="relative mt-3 h-1.5 overflow-hidden rounded-full bg-border-strong"
                                        title={`Ordinance 11: Requires ≥50% annual credits (${year.requiredCredits} cr) to clear year-back detention`}
                                    >
                                        <motion.div
                                            role="progressbar"
                                            aria-label={`${year.yearLabel} earned credit percentage`}
                                            aria-valuemin={0}
                                            aria-valuemax={100}
                                            aria-valuenow={year.percentage}
                                            aria-valuetext={`${year.percentage}% credits earned. Minimum 50% required (${year.requiredCredits} credits).`}
                                            initial={{ width: 0 }}
                                            whileInView={{ width: `${barPercent}%` }}
                                            viewport={{ once: true }}
                                            transition={{ duration: 0.9, ease: "easeOut" }}
                                            className={`h-full rounded-full ${tone.bar}`}
                                        />
                                        <span
                                            className="absolute inset-y-0 left-1/2 w-px bg-foreground/70"
                                            aria-hidden="true"
                                            title="50% Annual Credit Threshold"
                                        />
                                    </div>

                                    <dl className="mt-4 grid grid-cols-2 divide-x divide-border border-t border-border pt-3 text-xs">
                                        <div>
                                            <dt className="text-foreground-muted">Annual (50%)</dt>
                                            <dd className="tnum mt-0.5 font-mono text-sm font-semibold text-foreground">
                                                {year.requiredCredits} cr
                                            </dd>
                                        </div>
                                        <div className="pl-3">
                                            <dt className="text-foreground-muted">Annual Deficit</dt>
                                            <dd
                                                className={`tnum mt-0.5 font-mono text-sm font-semibold ${
                                                    year.creditsDeficit > 0 ? "text-grade-fail" : "text-grade-excellent"
                                                }`}
                                            >
                                                {year.creditsDeficit} cr
                                            </dd>
                                        </div>
                                    </dl>

                                    {year.status === "YEAR_BACK_RISK" && (
                                        <p className="mt-3 flex items-start gap-2 text-xs leading-5 text-foreground-secondary">
                                            <AlertTriangle size={13} className="mt-0.5 shrink-0 text-grade-fail" aria-hidden="true" />
                                            <span>
                                                Annual credit deficit: Clear{" "}
                                                <strong className="font-mono text-grade-fail">{year.creditsDeficit} credits</strong>{" "}
                                                through re-appear to meet the 50% promotion rule.
                                            </span>
                                        </p>
                                    )}
                                    {year.status === "IN_PROGRESS" && (
                                        <p className="mt-3 flex items-start gap-2 text-xs leading-5 text-foreground-secondary">
                                            <ArrowUpRight size={13} className="mt-0.5 shrink-0 text-cat-blue" aria-hidden="true" />
                                            <span>Partial year evaluated. Final standing updates after Sem {year.semesters[1]}.</span>
                                        </p>
                                    )}
                                </>
                            )}
                        </motion.article>
                    );
                })}
            </div>
        </section>
    );
}
