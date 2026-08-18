"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import {
    BriefcaseBusiness,
    CheckCircle2,
    Target,
    ShieldCheck,
    AlertTriangle,
    ArrowUpRight,
    Lock,
} from "lucide-react";
import {
    getPlacementEligibility,
    PlacementTier,
} from "@/helpers/grade-system";

interface Props {
    cgpa: number;
    activeBacklogs: number;
    isOverall: boolean;
}

export default function PlacementEligibilityCard({
    cgpa,
    activeBacklogs,
    isOverall,
}: Props) {
    const summary = useMemo(
        () => getPlacementEligibility(cgpa, activeBacklogs),
        [cgpa, activeBacklogs],
    );

    const gateOpen = summary.activeBacklogs === 0;

    return (
        <motion.section
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="analytics-panel space-y-8 p-5 sm:p-7 lg:p-8"
        >
            <header className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                <div className="max-w-3xl space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-md border border-accent-copper-border bg-accent-copper-surface text-accent-copper">
                            <BriefcaseBusiness size={19} strokeWidth={1.8} />
                        </div>
                        <div>
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-accent-copper">
                                    Career Readiness
                                </span>
                                <span className="rounded-md border border-border-strong bg-surface-deep px-2 py-0.5 font-mono text-[9px] text-foreground-muted">
                                    {isOverall ? "Cumulative" : "Semester"}
                                </span>
                            </div>
                            <h2 className="mt-1 text-lg font-semibold tracking-tight text-foreground sm:text-xl">
                                Campus Placement Eligibility
                            </h2>
                        </div>
                    </div>
                    <p className="max-w-2xl text-sm leading-6 text-foreground-secondary">
                        Recruitment cutoff readiness across common aggregate brackets,
                        with backlog gatekeeping separated from CGPA progress.
                    </p>
                </div>

                <div
                    className={`inline-flex w-fit items-center gap-2 rounded-md border px-3 py-2 text-[11px] font-semibold ${
                        gateOpen
                            ? "border-grade-excellent-border bg-grade-excellent-surface text-grade-excellent"
                            : "border-grade-fail-border bg-grade-fail-surface text-grade-fail"
                    }`}
                >
                    {gateOpen ? <ShieldCheck size={14} /> : <Lock size={14} />}
                    {gateOpen ? "0-backlog gate open" : "Backlog gate locked"}
                </div>
            </header>

            <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
                <div className="analytics-card p-5">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-foreground-muted">
                        Current aggregate
                    </p>
                    <div className="mt-3 flex items-end gap-2">
                        <span className="font-mono text-3xl font-semibold leading-none text-foreground">
                            {summary.cgpa.toFixed(2)}
                        </span>
                        <span className="pb-0.5 text-sm text-foreground-muted">
                            CGPA / {summary.percentage}%
                        </span>
                    </div>
                    <div className="mt-4 h-2 overflow-hidden rounded-full bg-surface">
                        <div
                            className="h-full rounded-full bg-accent-copper"
                            style={{ width: `${Math.min(100, Math.max(0, summary.percentage))}%` }}
                        />
                    </div>
                </div>

                <div
                    className={`rounded-lg border p-5 ${
                        gateOpen
                            ? "border-grade-excellent-border bg-grade-excellent-surface/25"
                            : "border-grade-fail-border bg-grade-fail-surface/25"
                    }`}
                >
                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-foreground-muted">
                        Backlog gate
                    </p>
                    <div className="mt-3 flex items-end gap-2">
                        <span
                            className={`font-mono text-3xl font-semibold leading-none ${
                                gateOpen ? "text-grade-excellent" : "text-grade-fail"
                            }`}
                        >
                            {summary.activeBacklogs}
                        </span>
                        <span className="pb-0.5 text-sm text-foreground-muted">active</span>
                    </div>
                    <p
                        className={`mt-3 text-[11px] leading-5 ${
                            gateOpen ? "text-grade-excellent" : "text-grade-fail"
                        }`}
                    >
                        {gateOpen
                            ? "Eligible for zero-backlog recruitment screens."
                            : "Clear active backlog subjects before applying this gate."}
                    </p>
                </div>

                <div className="analytics-card p-5">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-foreground-muted">
                        Next milestone
                    </p>
                    <p className="mt-3 text-base font-semibold text-foreground">
                        {summary.nextTargetTier
                            ? summary.nextTargetTier.name
                            : "All benchmarks met"}
                    </p>
                    <p className="mt-2 text-[11px] leading-5 text-foreground-secondary">
                        {summary.nextTargetTier
                            ? summary.nextTargetTier.statusReason
                            : "Highest available benchmark bracket is cleared."}
                    </p>
                </div>
            </div>

            <div className="rounded-lg border border-border bg-surface-deep/75 p-4">
                <div className="flex items-center justify-between gap-3">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-foreground-muted">
                        Cutoff track
                    </p>
                    <p className="font-mono text-[11px] text-foreground-secondary">
                        {summary.eligibleTierCount}/{summary.totalTierCount} cleared
                    </p>
                </div>

                <div className="mt-4 grid grid-cols-4 gap-2">
                    {summary.tiers.map((tier) => (
                        <div key={tier.id} className="space-y-2">
                            <div className="h-2 overflow-hidden rounded-full bg-surface">
                                <div
                                    className={`h-full rounded-full ${
                                        tier.isEligible ? "bg-grade-excellent" : "bg-border-strong"
                                    }`}
                                />
                            </div>
                            <div className="text-[10px] leading-4">
                                <p className={tier.isEligible ? "text-grade-excellent" : "text-foreground-muted"}>
                                    {tier.minPercentage}%
                                </p>
                                <p className="truncate text-foreground-secondary">
                                    {tier.isEligible ? "Cleared" : "Target"}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {summary.tiers.map((tier: PlacementTier) => {
                    const isEligible = tier.isEligible;

                    return (
                        <article
                            key={tier.id}
                            className={`rounded-lg border p-5 transition-colors hover:border-border-strong ${
                                isEligible
                                    ? "border-grade-excellent-border/70 bg-grade-excellent-surface/15"
                                    : "border-border bg-surface-deep/80"
                            }`}
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div className="min-w-0">
                                    <p className="text-sm font-semibold text-foreground">
                                        {tier.name}
                                    </p>
                                    <p className="mt-1 font-mono text-[11px] text-accent-copper">
                                        {tier.benchmarkLabel}
                                    </p>
                                </div>

                                <span
                                    className={`inline-flex shrink-0 items-center gap-1.5 rounded-md border px-2.5 py-1 text-[10px] font-semibold ${
                                        isEligible
                                            ? "border-grade-excellent-border bg-grade-excellent-surface text-grade-excellent"
                                            : "border-accent-copper-border bg-accent-copper-surface text-accent-copper"
                                    }`}
                                >
                                    {isEligible ? (
                                        <>
                                            <CheckCircle2 size={11} />
                                            Eligible
                                        </>
                                    ) : (
                                        <>
                                            <Target size={11} />
                                            Target
                                        </>
                                    )}
                                </span>
                            </div>

                            <p className="mt-4 text-[12px] leading-6 text-foreground-secondary">
                                {tier.description}
                            </p>

                            <div className="mt-5 flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
                                <span className="inline-flex items-start gap-2 text-[11px] leading-5">
                                    {isEligible ? (
                                        <>
                                            <CheckCircle2 size={12} className="mt-0.5 shrink-0 text-grade-excellent" />
                                            <span className="text-grade-excellent">
                                                Cutoff and backlog gate cleared.
                                            </span>
                                        </>
                                    ) : (
                                        <>
                                            <AlertTriangle size={12} className="mt-0.5 shrink-0 text-grade-fail" />
                                            <span className="text-foreground-secondary">
                                                {tier.statusReason}
                                            </span>
                                        </>
                                    )}
                                </span>

                                {!isEligible && tier.cgpaDeficit > 0 && (
                                    <span className="inline-flex w-fit items-center gap-1 rounded-md border border-gold-border bg-gold-surface px-2 py-1 font-mono text-[10px] font-bold text-gold">
                                        +{tier.cgpaDeficit} CGPA
                                        <ArrowUpRight size={10} />
                                    </span>
                                )}
                            </div>
                        </article>
                    );
                })}
            </div>
        </motion.section>
    );
}
