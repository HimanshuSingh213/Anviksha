"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { ShieldCheck, AlertTriangle, Clock, CheckCircle2 } from "lucide-react";
import { getAcademicPromotionStatus, AcademicYearStatus } from "@/helpers/grade-system";

interface Props {
    allResults: any[][];
    customCredit: Record<string, number>;
}

export default function AcademicPromotionCard({ allResults, customCredit }: Props) {
    const { years, hasDetentionRisk, activeYear } = useMemo(() => {
        return getAcademicPromotionStatus(allResults, customCredit);
    }, [allResults, customCredit]);

    // Don't render if there are no results yet
    if (allResults.length === 0) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="p-5 bg-surface border border-border-strong rounded-md shadow-xs space-y-4 font-mono"
        >
            {/* Card Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border-strong pb-4">
                <div>
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold uppercase tracking-wider text-foreground">
                            Promotion & Year-Back Standing
                        </span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-surface-deep border border-border-strong text-foreground-secondary">
                            50% Annual Credit Rule (Ordinance 11)
                        </span>
                    </div>
                    <p className="text-[11px] text-foreground-secondary mt-1">
                        GGSIPU requires passing ≥ 50% of total credits offered across an academic year for promotion.
                    </p>
                </div>

                {/* Overall Standing Badge */}
                <div className="flex items-center gap-2 px-3 py-1.5 rounded bg-surface-deep border border-border-strong text-xs shrink-0">
                    {hasDetentionRisk ? (
                        <>
                            <AlertTriangle size={14} className="text-grade-fail shrink-0 animate-pulse" />
                            <span className="text-[11px] font-bold text-grade-fail uppercase">
                                Year-Back Risk Detected
                            </span>
                        </>
                    ) : (
                        <>
                            <ShieldCheck size={14} className="text-grade-excellent shrink-0" />
                            <span className="text-[11px] font-bold text-foreground uppercase">
                                Good Academic Standing
                            </span>
                        </>
                    )}
                </div>
            </div>

            {/* Year-by-Year Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
                {years.map((year: AcademicYearStatus) => {
                    const isCompleted = year.status === "PROMOTED";
                    const isRisk = year.status === "YEAR_BACK_RISK";
                    const isInProgress = year.status === "IN_PROGRESS";
                    const isUpcoming = year.status === "UPCOMING";

                    let badgeColor = "bg-surface-deep text-foreground-muted border-border";
                    let badgeLabel = "Upcoming";
                    let IconComponent = Clock;

                    if (isCompleted) {
                        badgeColor = "bg-grade-excellent-surface text-grade-excellent border-grade-excellent-border";
                        badgeLabel = "Promoted";
                        IconComponent = CheckCircle2;
                    } else if (isRisk) {
                        badgeColor = "bg-grade-fail-surface text-grade-fail border-grade-fail-border";
                        badgeLabel = "Detention Risk";
                        IconComponent = AlertTriangle;
                    } else if (isInProgress) {
                        badgeColor = "bg-cat-blue-surface text-chart-cyan border-chart-cyan/30";
                        badgeLabel = "In Progress";
                        IconComponent = Clock;
                    }

                    return (
                        <div
                            key={year.yearNumber}
                            className={`p-3.5 rounded border transition-colors ${
                                year.yearNumber === activeYear
                                    ? "bg-surface border-gold-border/60 shadow-xs"
                                    : "bg-surface-deep border-border-strong"
                            } space-y-3 flex flex-col justify-between`}
                        >
                            {/* Year Header & Status */}
                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between gap-1.5">
                                    <span className="text-xs font-bold text-foreground">
                                        {year.yearLabel}
                                    </span>
                                    <span className="text-[10px] text-foreground-muted">
                                        Sem {year.semesters[0]} & {year.semesters[1]}
                                    </span>
                                </div>

                                <div className="flex items-center gap-1.5">
                                    <span
                                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border ${badgeColor}`}
                                    >
                                        <IconComponent size={10} />
                                        {badgeLabel}
                                    </span>
                                    {year.yearNumber === activeYear && (
                                        <span className="text-[9px] uppercase tracking-wider text-gold font-bold px-1.5 py-0.5 rounded bg-gold-surface border border-gold-border">
                                            Current
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Credits Details & Progress Bar */}
                            {!isUpcoming ? (
                                <div className="space-y-2 pt-1 border-t border-border">
                                    <div className="flex items-center justify-between text-[11px]">
                                        <span className="text-foreground-secondary">Credits Earned:</span>
                                        <span className="font-bold text-foreground">
                                            {year.earnedCredits} / {year.totalCredits}
                                        </span>
                                    </div>

                                    {/* Progress Bar with 50% Threshold Mark */}
                                    <div className="relative h-2 bg-surface rounded-full border border-border overflow-hidden">
                                        <div
                                            className={`h-full transition-all duration-500 ${
                                                isCompleted
                                                    ? "bg-grade-excellent"
                                                    : isRisk
                                                    ? "bg-grade-fail"
                                                    : "bg-chart-cyan"
                                            }`}
                                            style={{ width: `${Math.min(100, Math.max(0, year.percentage))}%` }}
                                        />
                                        {/* 50% threshold line */}
                                        <div
                                            className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-foreground-muted/40 z-10"
                                            title="50% Minimum Passing Threshold"
                                        />
                                    </div>

                                    <div className="flex items-center justify-between text-[10px] text-foreground-muted">
                                        <span>{year.percentage}% cleared</span>
                                        <span>Min 50% needed</span>
                                    </div>

                                    {/* Dynamic Helper Text */}
                                    <div className="text-[10px] leading-tight pt-1">
                                        {isCompleted && (
                                            <span className="text-grade-excellent flex items-center gap-1">
                                                <CheckCircle2 size={11} className="shrink-0" />
                                                <span>50% threshold met. Promoted.</span>
                                            </span>
                                        )}
                                        {isRisk && (
                                            <span className="text-grade-fail font-semibold flex items-center gap-1">
                                                <AlertTriangle size={11} className="shrink-0" />
                                                <span>Under 50% credits. Clear {year.creditsDeficit} credits in re-appear.</span>
                                            </span>
                                        )}
                                        {isInProgress && (
                                            <span className="text-foreground-secondary flex items-center gap-1">
                                                <Clock size={11} className="shrink-0" />
                                                <span>Sem {year.semesters[0]} evaluated. Full status pending Sem {year.semesters[1]}.</span>
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="py-4 text-center text-[11px] text-foreground-muted border-t border-border flex items-center justify-center gap-1">
                                    <span>Pending enrollment</span>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </motion.div>
    );
}
