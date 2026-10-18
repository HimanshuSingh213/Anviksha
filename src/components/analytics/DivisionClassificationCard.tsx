"use client";

import { useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { HelpCircle } from "lucide-react";
import Chip from "@/components/analytics/Chip";
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

const passFloorOf = (tiers: DivisionPresentation["tiers"]) =>
    Math.min(...(tiers ?? []).filter((t) => !t.isFail).map((t) => t.min));

// Displays degree division classification or semester academic tier based on statutory ordinance bands.
export default function DivisionClassificationCard({
    isOverall,
    divisionName,
    divisionStatus,
    ordinanceName,
    reason,
    presentation,
}: DivisionProps) {
    const { scale, score, max, tiers } = presentation;

    const segments = useMemo(() => {
        if (!tiers || !max) return [];
        const sorted = [...tiers].sort((a, b) => a.min - b.min);
        return sorted.map((tier, index) => {
            const nextMin = sorted[index + 1]?.min ?? max;
            const from = (tier.min / max) * 100;
            const to = (nextMin / max) * 100;
            return {
                ...tier,
                from,
                width: Math.max(0, to - from),
                label: tier.division ?? `Below ${passFloorOf(tiers)}`,
            };
        });
    }, [tiers, max]);

    const passFloor = tiers ? passFloorOf(tiers) : 0;
    const isPass = score !== null && score >= passFloor;
    const progressPercent =
        score !== null && max ? Math.min(100, Math.max(0, (score / max) * 100)) : 0;

    const activeIndex =
        score === null ? -1 : segments.reduce((found, segment, i) => (score >= segment.min ? i : found), -1);

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
        <section className="home-panel p-5 sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
                        <h3 className="text-base font-semibold tracking-[-0.01em] text-foreground">
                            {isOverall ? "Degree Division Classification" : "Semester Academic Tier"}
                        </h3>
                        <Chip tone="muted" className="font-mono">
                            {ordLabel}
                        </Chip>
                        <Link
                            href="/calculations#division"
                            title="How is division calculated?"
                            aria-label="How is division calculated?"
                            className="text-foreground-muted transition-colors hover:text-gold"
                        >
                            <HelpCircle size={14} aria-hidden="true" />
                        </Link>
                    </div>
                    <p className="mt-1.5 text-sm leading-6 text-foreground-secondary">
                        Academic classification standing specified by revised GGSIPU {ordLabel}.
                    </p>
                </div>

                <div className="shrink-0 sm:text-right">
                    <p className="text-xs text-foreground-muted">Standing</p>
                    <motion.p
                        key={divisionName}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ type: "spring", stiffness: 400, damping: 28 }}
                        className={`text-lg font-semibold tracking-[-0.01em] ${isPass ? "text-foreground" : "text-grade-fail"}`}
                    >
                        {divisionName}
                    </motion.p>
                </div>
            </div>

            <div className="mt-6">
                <div className="relative h-5 text-[11px] font-semibold sm:text-xs">
                    {segments.map((segment, i) => (
                        <span
                            key={`lbl-${i}`}
                            className={`absolute whitespace-nowrap transition-colors ${
                                i === activeIndex
                                    ? segment.isFail
                                        ? "text-grade-fail"
                                        : "text-foreground"
                                    : "text-foreground-muted"
                            } ${segment.isFail ? "left-0" : i === segments.length - 1 ? "right-0" : ""}`}
                            style={i === segments.length - 1 || segment.isFail ? undefined : { left: `${segment.from}%` }}
                        >
                            <span className="hidden sm:inline">{segment.label}</span>
                            <span className="sm:hidden">
                                {segment.division ? segment.division.split(" ")[0] : "Fail"}
                            </span>
                        </span>
                    ))}
                </div>

                <div className="relative mt-2 h-2.5 overflow-hidden rounded-full bg-border-strong">
                    <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${progressPercent}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.9, ease: "easeOut" }}
                        className={`h-full rounded-full ${isPass ? "bg-gold" : "bg-grade-fail"}`}
                    />
                    {segments
                        .filter((segment) => segment.from > 0 && segment.from < 99)
                        .map((segment, i) => (
                            <span
                                key={`line-${i}`}
                                className="absolute inset-y-0 w-0.5 -translate-x-1/2 bg-surface"
                                style={{ left: `${segment.from}%` }}
                                title={segment.label}
                            />
                        ))}
                </div>

                <div className="mt-4 flex flex-col gap-1 text-sm sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                    <span className="text-foreground-secondary">
                        Score: <span className="tnum font-mono font-semibold text-gold">{scoreDisplay}</span>
                    </span>
                    <span className="text-foreground-secondary">{nextTierMessage}</span>
                </div>
            </div>
        </section>
    );
}
