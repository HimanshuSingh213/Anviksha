"use client";

import { useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { HelpCircle } from "lucide-react";
import { getDivisionClassification } from "@/helpers/grade-system";

interface DivisionProps {
    cgpa: number;
    backlogsCount: number;
    isOverall: boolean;
}

export default function DivisionClassificationCard({ cgpa, backlogsCount, isOverall }: DivisionProps) {
    const { divisionName, activeFillColor, nextTierMessage, progressPercent } = useMemo(() => {
        const result = getDivisionClassification(cgpa, backlogsCount);
        const activeFillColor = result.isPass ? "bg-foreground" : "bg-grade-fail";
        return {
            divisionName: result.division,
            activeFillColor,
            nextTierMessage: result.nextTierMessage,
            progressPercent: result.progressPercent,
        };
    }, [cgpa, backlogsCount]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="p-4 sm:p-5 bg-surface border border-border-strong rounded-lg space-y-4 shadow-xs font-mono"
        >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border-strong pb-4">
                <div>
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-foreground">
                            {isOverall ? "Degree Division Classification" : "Semester Academic Tier"}
                        </span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-surface-deep border border-border-strong text-foreground-secondary shrink-0">
                            Ordinance 11
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
                    <p className="text-xs text-foreground-secondary mt-1">
                        Academic classification standing specified by revised GGSIPU Ordinance 11.
                    </p>
                </div>

                <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-surface-deep border border-border-strong text-xs font-mono shadow-xs max-w-full overflow-hidden">
                    <span className={`w-2 h-2 rounded-full shrink-0 ${cgpa >= 4.00 ? "bg-gold animate-pulse" : "bg-grade-fail animate-pulse"}`} />
                    <span className="text-[10px] text-foreground-secondary uppercase tracking-wider font-bold shrink-0">
                        Standing:
                    </span>
                    <motion.span
                        key={divisionName}
                        initial={{ opacity: 0, scale: 0.9, y: 2 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                        className={`text-xs sm:text-sm font-extrabold tracking-wider uppercase truncate ${
                            cgpa >= 4.00 ? "text-foreground" : "text-grade-fail"
                        }`}
                    >
                        {divisionName}
                    </motion.span>
                </div>
            </div>

            <div className="space-y-2 pt-1">
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

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs pt-1">
                    <span className="text-foreground font-bold">
                        Score: <span className="text-gold font-extrabold">{cgpa.toFixed(2)} CGPA</span>
                    </span>
                    <span className="text-foreground-secondary font-semibold text-[11px] sm:text-xs">
                        {nextTierMessage}
                    </span>
                </div>
            </div>
        </motion.div>
    );
}