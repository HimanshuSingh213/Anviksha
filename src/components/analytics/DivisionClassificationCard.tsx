"use client";

import { useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { HelpCircle } from "lucide-react";
import type { DivisionPresentation } from "@/types/result";

interface DivisionProps {
    isOverall: boolean;
    divisionName?: string | null;
    divisionStatus?: string;
    ordinanceName?: string | null;
    reason?: string | null;
    presentation: DivisionPresentation;
}

const SCALE_LABEL: Record<DivisionPresentation["scale"], string> = {
    PERCENTAGE: "Percentage",
    CGPA: "CGPA",
    CPI: "CPI",
    NONE: "",
};

export default function DivisionClassificationCard({
    isOverall,
    divisionName,
    divisionStatus,
    ordinanceName,
    reason,
    presentation,
}: DivisionProps) {
    const { scale, score, max, tiers } = presentation;

    // Bar segments are derived from the ordinance's declared bands.
    const segments = useMemo(() => {
        if (!tiers || !max) return [];
        return tiers.map((tier, index) => {
            const nextMin = tiers[index + 1]?.min ?? max;
            const from = (tier.min / max) * 100;
            const to = (nextMin / max) * 100;
            return {
                ...tier,
                from,
                width: Math.max(0, to - from),
                label: tier.division ?? `Below ${tiers.find((t) => !t.isFail)?.min ?? 0}`,
            };
        });
    }, [tiers, max]);

    const passFloor = tiers?.find((t) => !t.isFail)?.min ?? 0;
    const isPass = score !== null && score >= passFloor;
    const activeFillColor = isPass ? "bg-foreground" : "bg-grade-fail";
    const progressPercent =
        score !== null && max ? Math.min(100, Math.max(0, (score / max) * 100)) : 0;
    const scoreDisplay =
        score !== null
            ? scale === "PERCENTAGE"
                ? `${score.toFixed(2)}%`
                : `${score.toFixed(2)} ${SCALE_LABEL[scale] || "Score"}`
            : "—";
    const nextTierMessage = reason ?? "—";

    if (divisionStatus === "NOT_APPLICABLE" || !divisionName || !tiers) {
        return null;
    }

    let ordLabel = "Ordinance 11";
    if (ordinanceName) {
        ordLabel = ordinanceName.startsWith("ORD_")
            ? `Ordinance ${ordinanceName.replace("ORD_", "")}`
            : ordinanceName;
    }

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
                <div className="relative h-4 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-foreground-secondary">
                    {segments.map((segment, i) => (
                        <span
                            key={`lbl-${i}`}
                            className={`absolute whitespace-nowrap ${
                                segment.isFail
                                    ? "left-0 text-grade-fail font-bold"
                                    : i === segments.length - 1
                                      ? "right-0 text-foreground font-bold"
                                      : "-translate-x-1/2 text-foreground-secondary"
                            }`}
                            style={i === segments.length - 1 || segment.isFail ? undefined : { left: `${segment.from}%` }}
                        >
                            <span className="hidden sm:inline">{segment.label}</span>
                            <span className="sm:hidden">
                                {segment.division ? segment.division.split(" ")[0] : "Fail"}
                            </span>
                        </span>
                    ))}
                </div>

                <div className="relative h-3.5 bg-surface-deep rounded-full border border-border-strong overflow-hidden">
                    <div className="absolute inset-0 flex">
                        {segments.map((segment, i) => (
                            <div
                                key={`seg-${i}`}
                                className={`${segment.isFail ? "bg-grade-fail/10" : "bg-foreground/10"} ${
                                    i === segments.length - 1 ? "" : "border-r-2 sm:border-r-3 border-border-strong"
                                }`}
                                style={{ width: `${segment.width}%` }}
                                title={
                                    segment.max !== null
                                        ? `${segment.label} (${segment.min} - ${segment.max})`
                                        : `${segment.label} (≥ ${segment.min})`
                                }
                            />
                        ))}
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