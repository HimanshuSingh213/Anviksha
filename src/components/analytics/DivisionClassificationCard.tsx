"use client";

import { useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { HelpCircle } from "lucide-react";
import { findOrdinance } from "@/lib/academic/academic-db";

interface DivisionProps {
    cgpa?: number | null;
    percentage?: number | null;
    backlogsCount: number;
    isOverall: boolean;
    divisionName?: string | null;
    divisionStatus?: string;
    ordinanceName?: string | null;
    reason?: string | null;
}

export default function DivisionClassificationCard({
    cgpa,
    percentage,
    backlogsCount,
    isOverall,
    divisionName: propDivisionName,
    divisionStatus,
    ordinanceName,
}: DivisionProps) {
    const ordinance = useMemo(() => findOrdinance(ordinanceName), [ordinanceName]);
    const isPercentageScale = Boolean(
        ordinance?.rules?.divisionFromPercentage ||
        ordinance?.rules?.divisionFromCpi ||
        (cgpa === null && percentage !== null)
    );

    const { divisionName, activeFillColor, nextTierMessage, progressPercent, scoreDisplay, isPass } = useMemo(() => {
        if (isPercentageScale) {
            const scoreValue = percentage ?? ((cgpa ?? 0) * 10);
            const isPass = scoreValue >= 50;
            const activeFillColor = isPass ? "bg-foreground" : "bg-grade-fail";
            const progressPercent = Math.min(100, Math.max(0, scoreValue));
            const scoreDisplay = `${scoreValue.toFixed(2)}%`;

            let nextTierMessage = "";
            if (scoreValue >= 90) {
                nextTierMessage = "Maximum exemplary performance tier achieved (≥90%)";
            } else if (scoreValue >= 75) {
                const gap = (90 - scoreValue).toFixed(2);
                nextTierMessage = `+${gap}% needed for Distinction (90%)`;
            } else if (scoreValue >= 60) {
                const gap = (75 - scoreValue).toFixed(2);
                nextTierMessage = `+${gap}% needed for Distinction (75%)`;
            } else if (scoreValue >= 50) {
                const gap = (60 - scoreValue).toFixed(2);
                nextTierMessage = `+${gap}% needed for First Division (60%)`;
            } else {
                const gap = (50 - scoreValue).toFixed(2);
                nextTierMessage = `+${gap}% needed to clear passing threshold (50%)`;
            }

            return {
                divisionName: propDivisionName ?? (isPass ? "Passed" : "Failed"),
                activeFillColor,
                nextTierMessage,
                progressPercent,
                scoreDisplay,
                isPass,
            };
        }

        // Standard CGPA-based division (e.g. Ordinance 11)
        const validCgpa = cgpa ?? 0;
        let division = "Unqualified for Degree (< 4.00)";
        let nextTierMessage = "";
        let isPass = false;

        if (validCgpa >= 10.0 && backlogsCount === 0) {
            division = "Exemplary Performance";
            nextTierMessage = "Maximum distinction tier achieved (CGPA 10.00)";
            isPass = true;
        } else if (validCgpa >= 6.50) {
            division = "First Division";
            const gap = (10.0 - validCgpa).toFixed(2);
            nextTierMessage = backlogsCount > 0 ? "Clear active backlogs for clean standing" : `+${gap} CGPA to reach 10.00 scale max`;
            isPass = true;
        } else if (validCgpa >= 5.00) {
            division = "Second Division";
            const gap = (6.50 - validCgpa).toFixed(2);
            nextTierMessage = `+${gap} CGPA needed for First Division (6.50)`;
            isPass = true;
        } else if (validCgpa >= 4.00) {
            division = "Third Division";
            const gap = (5.00 - validCgpa).toFixed(2);
            nextTierMessage = `+${gap} CGPA needed for Second Division (5.00)`;
            isPass = true;
        } else {
            division = "Unqualified for Degree (< 4.00)";
            const gap = (4.00 - validCgpa).toFixed(2);
            nextTierMessage = `+${gap} CGPA needed for passing threshold (4.00)`;
            isPass = false;
        }

        const effectiveName = propDivisionName ?? division;
        const activeFillColor = isPass ? "bg-foreground" : "bg-grade-fail";
        const progressPercent = Math.min(100, Math.max(0, (validCgpa / 10) * 100));

        return {
            divisionName: effectiveName,
            activeFillColor,
            nextTierMessage,
            progressPercent,
            scoreDisplay: `${validCgpa.toFixed(2)} CGPA`,
            isPass,
        };
    }, [isPercentageScale, percentage, cgpa, backlogsCount, propDivisionName]);

    if (divisionStatus === "NOT_APPLICABLE" || !divisionName) {
        return null;
    }

    const ordLabel = ordinanceName
        ? (ordinanceName.startsWith("ORD_") ? `Ordinance ${ordinanceName.replace("ORD_", "")}` : ordinanceName)
        : "Ordinance 11";

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="p-3.5 sm:p-4 bg-surface border border-border-strong rounded-lg space-y-3 shadow-xs font-mono"
        >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 border-b border-border-strong pb-3">
                <div>
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-foreground">
                            {isOverall ? "Degree Division Classification" : "Semester Academic Tier"}
                        </span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-surface-deep border border-border-strong text-foreground-secondary shrink-0">
                            {ordLabel}
                        </span>
                        <Link
                            href="/calculations#division"
                            title="How is division calculated?"
                            className="inline-flex items-center gap-1 text-[10px] text-foreground-muted hover:text-gold transition-colors"
                        >
                            <HelpCircle size={12} />
                            <span className="hidden sm:inline">How is this calculated?</span>
                        </Link>
                    </div>
                    <p className="text-xs text-foreground-secondary mt-0.5">
                        Academic classification standing specified by revised GGSIPU {ordLabel}.
                    </p>
                </div>

                <div className="flex items-center gap-2 px-2.5 py-1 rounded-md bg-surface-deep border border-border-strong text-xs font-mono shadow-xs max-w-full overflow-hidden">
                    <span className={`w-2 h-2 rounded-full shrink-0 ${isPass ? "bg-gold animate-pulse" : "bg-grade-fail animate-pulse"}`} />
                    <span className="text-[10px] text-foreground-secondary uppercase tracking-wider font-bold shrink-0">
                        Standing:
                    </span>
                    <motion.span
                        key={divisionName}
                        initial={{ opacity: 0, scale: 0.9, y: 2 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                        className={`text-xs sm:text-sm font-extrabold tracking-wider uppercase truncate ${
                            isPass ? "text-foreground" : "text-grade-fail"
                        }`}
                    >
                        {divisionName}
                    </motion.span>
                </div>
            </div>

            <div className="space-y-1.5 pt-0.5">
                {isPercentageScale ? (
                    <>
                        <div className="relative h-4 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-foreground-secondary">
                            <span className="absolute left-0 text-grade-fail font-bold">Fail (&lt;50%)</span>
                            <span className="absolute left-[50%] -translate-x-1/2">
                                <span className="hidden sm:inline">2nd (50%)</span>
                                <span className="sm:hidden">2nd</span>
                            </span>
                            <span className="absolute left-[60%] -translate-x-1/2">
                                <span className="hidden sm:inline">1st (60%)</span>
                                <span className="sm:hidden">1st</span>
                            </span>
                            <span className="absolute left-[75%] -translate-x-1/2">
                                <span className="hidden sm:inline">Dist. (75%)</span>
                                <span className="sm:hidden">Dist.</span>
                            </span>
                            <span className="absolute right-0 text-foreground font-bold">
                                <span className="hidden sm:inline">Exemplary (90%)</span>
                                <span className="sm:hidden">Top (90%)</span>
                            </span>
                        </div>

                        <div className="relative h-3.5 bg-surface-deep rounded-full border border-border-strong overflow-hidden">
                            <div className="absolute inset-0 flex">
                                <div className="w-[50%] bg-grade-fail/10 border-r-2 sm:border-r-3 border-border-strong" title="Fail (< 50%)" />
                                <div className="w-[10%] bg-foreground/10 border-r-2 sm:border-r-3 border-border-strong" title="2nd Division (50% - 59.99%)" />
                                <div className="w-[15%] bg-foreground/10 border-r-2 sm:border-r-3 border-border-strong" title="First Division (60% - 74.99%)" />
                                <div className="w-[15%] bg-foreground/10 border-r-2 sm:border-r-3 border-border-strong" title="Distinction (75% - 89.99%)" />
                                <div className="w-[10%] bg-foreground/10" title="Exemplary (≥ 90%)" />
                            </div>

                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${progressPercent}%` }}
                                transition={{ duration: 0.6, ease: "easeOut" }}
                                className={`h-full ${activeFillColor}`}
                            />
                        </div>
                    </>
                ) : (
                    <>
                        <div className="relative h-4 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-foreground-secondary">
                            <span className="absolute left-0 text-grade-fail font-bold">Fail (&lt;4.0)</span>
                            <span className="absolute left-[40%] -translate-x-1/2">
                                <span className="hidden sm:inline">3rd (4.0)</span>
                                <span className="sm:hidden">3rd</span>
                            </span>
                            <span className="absolute left-[50%] -translate-x-1/2">
                                <span className="hidden sm:inline">2nd (5.0)</span>
                                <span className="sm:hidden">2nd</span>
                            </span>
                            <span className="absolute left-[65%] -translate-x-1/2">
                                <span className="hidden sm:inline">1st (6.5)</span>
                                <span className="sm:hidden">1st</span>
                            </span>
                            <span className="absolute right-0 text-foreground font-bold">
                                <span className="hidden sm:inline">Exemplary (10.0)</span>
                                <span className="sm:hidden">Top (10.0)</span>
                            </span>
                        </div>

                        <div className="relative h-3.5 bg-surface-deep rounded-full border border-border-strong overflow-hidden">
                            <div className="absolute inset-0 flex">
                                <div className="w-[40%] bg-grade-fail/10 border-r-2 sm:border-r-3 border-border-strong" title="Fail (< 4.00)" />
                                <div className="w-[10%] bg-foreground/10 border-r-2 sm:border-r-3 border-border-strong" title="3rd Division (4.00 - 4.99)" />
                                <div className="w-[15%] bg-foreground/10 border-r-2 sm:border-r-3 border-border-strong" title="2nd Division (5.00 - 6.49)" />
                                <div className="w-[35%] bg-foreground/10" title="1st Division (6.50 - 10.00)" />
                            </div>

                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${progressPercent}%` }}
                                transition={{ duration: 0.6, ease: "easeOut" }}
                                className={`h-full ${activeFillColor}`}
                            />
                        </div>
                    </>
                )}

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs pt-1">
                    <span className="text-foreground font-bold">
                        Score: <span className="text-gold font-extrabold">{scoreDisplay}</span>
                    </span>
                    <span className="text-foreground-secondary font-semibold text-[11px] sm:text-xs">
                        {nextTierMessage}
                    </span>
                </div>
            </div>
        </motion.div>
    );
}