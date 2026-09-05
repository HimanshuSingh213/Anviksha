"use client";

import { useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
    ShieldCheck,
    AlertTriangle,
    Clock,
    CheckCircle2,
    ArrowUpRight,
    GraduationCap,
    HelpCircle,
} from "lucide-react";
import { getAcademicPromotionStatus, type AcademicYearStatus } from "@/lib/academic/academic-engine";

export type { AcademicYearStatus };

interface Props {
    allResults: any[][];
    customCredit: Record<string, number | null>;
}

const statusTone = {
    PROMOTED: {
        label: "Promoted",
        icon: CheckCircle2,
        card: "border-grade-excellent-border/70 bg-grade-excellent-surface/20",
        text: "text-grade-excellent",
        soft: "border-grade-excellent-border bg-grade-excellent-surface text-grade-excellent",
        bar: "bg-grade-excellent",
    },
    YEAR_BACK_RISK: {
        label: "Year-back risk",
        icon: AlertTriangle,
        card: "border-grade-fail-border/80 bg-grade-fail-surface/20",
        text: "text-grade-fail",
        soft: "border-grade-fail-border bg-grade-fail-surface text-grade-fail",
        bar: "bg-grade-fail",
    },
    IN_PROGRESS: {
        label: "In progress",
        icon: Clock,
        card: "border-cat-blue-border/70 bg-cat-blue-surface/18",
        text: "text-cat-blue",
        soft: "border-cat-blue-border bg-cat-blue-surface text-cat-blue",
        bar: "bg-cat-blue",
    },
    UPCOMING: {
        label: "Upcoming",
        icon: Clock,
        card: "border-border bg-surface-deep/80",
        text: "text-foreground-muted",
        soft: "border-border-strong bg-surface text-foreground-muted",
        bar: "bg-cat-slate",
    },
} as const;

export default function AcademicPromotionCard({
    allResults,
    customCredit,
}: Props) {
    const promotion = useMemo(
        () => getAcademicPromotionStatus(allResults, customCredit),
        [allResults, customCredit],
    );

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

    if (allResults.length === 0) return null;

    const { years, hasDetentionRisk, activeYear } = promotion;

    return (
        <motion.section
            aria-labelledby="academic-promotion-heading"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="analytics-panel space-y-4 sm:space-y-5 p-3.5 sm:p-5 lg:p-6"
        >
            <header className="flex flex-col gap-3 sm:gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="max-w-3xl space-y-2 sm:space-y-2.5">
                    <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-md border border-gold-border bg-gold-surface text-gold shrink-0">
                            <GraduationCap size={16} strokeWidth={1.8} aria-hidden="true" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-gold">
                                    Academic Standing
                                </div>
                                <Link
                                    href="/calculations#promotion"
                                    title="How is promotion calculated?"
                                    className="inline-flex items-center gap-1 text-[10px] font-mono text-foreground-muted hover:text-gold transition-colors"
                                >
                                    <HelpCircle size={11} />
                                    <span className="hidden sm:inline">How is this calculated?</span>
                                </Link>
                            </div>
                            <h2
                                id="academic-promotion-heading"
                                className="mt-0.5 text-base sm:text-lg font-semibold tracking-tight text-foreground"
                            >
                                Promotion & Year-Back Assessment
                            </h2>
                        </div>
                    </div>
                    <p className="max-w-2xl text-xs sm:text-sm leading-5 text-foreground-secondary">
                        Annual standing based on the 50% credit threshold, with current academic year and recovery deficit surfaced separately.
                    </p>
                </div>

                <div
                    className={`inline-flex w-fit items-center gap-2 rounded-md border px-2.5 py-1.5 text-[10px] sm:text-[11px] font-semibold ${
                        hasDetentionRisk
                            ? "border-grade-fail-border bg-grade-fail-surface text-grade-fail"
                            : "border-grade-excellent-border bg-grade-excellent-surface text-grade-excellent"
                    }`}
                >
                    {hasDetentionRisk ? (
                        <AlertTriangle size={13} aria-hidden="true" />
                    ) : (
                        <ShieldCheck size={13} aria-hidden="true" />
                    )}
                    {hasDetentionRisk ? "Action required" : "Standing clear"}
                </div>
            </header>

            <div className="grid gap-2.5 sm:grid-cols-3">
                <div className="analytics-card p-3 sm:p-3.5">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-foreground-muted">
                        Credit progress
                    </p>
                    <p className="mt-1 font-mono text-xl sm:text-2xl font-semibold text-foreground">
                        {summary.earnedCredits}
                        <span className="text-sm font-normal text-foreground-muted">
                            /{summary.totalCredits}
                        </span>
                    </p>
                    <p className="mt-0.5 text-[10px] sm:text-[11px] text-foreground-secondary">
                        {summary.overallPercent}% credit completion
                    </p>
                </div>

                <div className="analytics-card p-3 sm:p-3.5">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-foreground-muted">
                        Promoted years
                    </p>
                    <p className="mt-1 font-mono text-xl sm:text-2xl font-semibold text-foreground">
                        {summary.promotedYears}
                        <span className="text-sm font-normal text-foreground-muted">
                            /{summary.evaluatedYears || 0}
                        </span>
                    </p>
                    <p className="mt-0.5 text-[10px] sm:text-[11px] text-foreground-secondary">
                        Completed annual checkpoints
                    </p>
                </div>

                <div
                    className={`rounded-lg border p-3 sm:p-3.5 ${
                        summary.deficit > 0
                            ? "border-grade-fail-border bg-grade-fail-surface/25"
                            : "border-accent-mint-border bg-accent-mint-surface"
                    }`}
                >
                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-foreground-muted">
                        Recovery deficit
                    </p>
                    <p
                        className={`mt-1 font-mono text-xl sm:text-2xl font-semibold ${
                            summary.deficit > 0 ? "text-grade-fail" : "text-accent-mint"
                        }`}
                    >
                        {summary.deficit} cr
                    </p>
                    <p className="mt-0.5 text-[10px] sm:text-[11px] text-foreground-secondary">
                        Credits needed to restore promotion safety
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-2.5 sm:gap-3 md:grid-cols-2 xl:grid-cols-4">
                {years.map((year: AcademicYearStatus) => {
                    const tone = statusTone[year.status];
                    const StatusIcon = tone.icon;
                    const isUpcoming = year.status === "UPCOMING";
                    const isActive = year.yearNumber === activeYear;

                    return (
                        <article
                            key={year.yearNumber}
                            aria-label={`${year.yearLabel} promotion status: ${tone.label}`}
                            className={`flex min-h-fit flex-col justify-between rounded-lg border p-3.5 sm:p-4 transition-colors hover:border-border-strong ${tone.card}`}
                        >
                            <div className="space-y-3 sm:space-y-3.5">
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-foreground-muted">
                                            Year {year.yearNumber}
                                        </p>
                                        <h3 className="mt-0.5 text-sm sm:text-base font-semibold text-foreground">
                                            {year.yearLabel}
                                        </h3>
                                        <p className="mt-0.5 font-mono text-[10px] sm:text-[11px] text-foreground-muted">
                                            Sem {year.semesters[0]} / Sem {year.semesters[1]}
                                        </p>
                                    </div>

                                    {isActive && (
                                        <span className="rounded-md border border-gold-border bg-gold-surface px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.12em] text-gold">
                                            Current
                                        </span>
                                    )}
                                </div>

                                <span
                                    className={`inline-flex w-fit items-center gap-1.5 rounded-md border px-2 py-0.5 text-[10px] font-semibold ${tone.soft}`}
                                >
                                    <StatusIcon size={12} aria-hidden="true" />
                                    {tone.label}
                                </span>

                                {isUpcoming ? (
                                    <div className="rounded-md border border-dashed border-border-strong bg-surface/60 px-3 py-4 text-center">
                                        <Clock size={15} className="mx-auto text-foreground-muted" aria-hidden="true" />
                                        <p className="mt-1.5 text-[11px] text-foreground-muted">
                                            Awaiting semester results
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-2.5">
                                        <div className="flex items-end justify-between gap-3">
                                            <div>
                                                <p className="text-[10px] uppercase tracking-[0.14em] text-foreground-muted">
                                                    Earned
                                                </p>
                                                <p className="mt-0.5 font-mono text-xl sm:text-2xl font-semibold leading-none text-foreground">
                                                    {year.earnedCredits}
                                                    <span className="text-xs sm:text-sm font-normal text-foreground-muted">
                                                        /{year.totalCredits}
                                                    </span>
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className={`font-mono text-base sm:text-lg font-semibold ${tone.text}`}>
                                                    {year.percentage}%
                                                </p>
                                                <p className="text-[10px] text-foreground-muted">
                                                    min 50%
                                                </p>
                                            </div>
                                        </div>

                                        <div
                                            className="relative h-2 overflow-hidden rounded-full bg-surface"
                                            title={`Ordinance 11: Requires ≥50% annual credits (${year.requiredCredits} cr) to clear year-back detention`}
                                        >
                                            <div
                                                role="progressbar"
                                                aria-label={`${year.yearLabel} earned credit percentage`}
                                                aria-valuemin={0}
                                                aria-valuemax={100}
                                                aria-valuenow={year.percentage}
                                                aria-valuetext={`${year.percentage}% credits earned. Minimum 50% required (${year.requiredCredits} credits).`}
                                                className={`h-full rounded-full transition-all duration-700 ${tone.bar}`}
                                                style={{ width: `${Math.min(100, Math.max(0, year.percentage))}%` }}
                                            />
                                            <span className="absolute inset-y-0 left-1/2 w-px bg-foreground/70" aria-hidden="true" title="50% Annual Credit Threshold" />
                                        </div>

                                        <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                                            <div className="rounded-md border border-border bg-surface/70 px-2.5 py-1.5">
                                                <p className="text-foreground-muted">Annual (50%)</p>
                                                <p className="mt-0.5 font-mono font-semibold text-foreground">
                                                    {year.requiredCredits} cr
                                                </p>
                                            </div>
                                            <div className="rounded-md border border-border bg-surface/70 px-2.5 py-1.5">
                                                <p className="text-foreground-muted">Annual Deficit</p>
                                                <p className={`mt-0.5 font-mono font-semibold ${year.creditsDeficit > 0 ? "text-grade-fail" : "text-grade-excellent"}`}>
                                                    {year.creditsDeficit} cr
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {!isUpcoming && (
                                <div className="mt-4 flex items-start gap-1.5 border-t border-border pt-2.5 text-[10px] sm:text-[11px] leading-4.5">
                                    {year.status === "PROMOTED" ? (
                                        <>
                                            <CheckCircle2 size={12} className="mt-0.5 shrink-0 text-grade-excellent" aria-hidden="true" />
                                            <span className="text-foreground-secondary">
                                                Promotion threshold cleared for this academic year.
                                            </span>
                                        </>
                                    ) : year.status === "YEAR_BACK_RISK" ? (
                                        <>
                                            <AlertTriangle size={12} className="mt-0.5 shrink-0 text-grade-fail" aria-hidden="true" />
                                            <span className="text-foreground-secondary">
                                                Annual credit deficit: Clear <strong className="font-mono text-grade-fail">{year.creditsDeficit} credits</strong> through re-appear to meet the 50% promotion rule.
                                            </span>
                                        </>
                                    ) : (
                                        <>
                                            <ArrowUpRight size={12} className="mt-0.5 shrink-0 text-cat-blue" aria-hidden="true" />
                                            <span className="text-foreground-secondary">
                                                Partial year evaluated. Final standing updates after Sem {year.semesters[1]}.
                                            </span>
                                        </>
                                    )}
                                </div>
                            )}
                        </article>
                    );
                })}
            </div>
        </motion.section>
    );
}
