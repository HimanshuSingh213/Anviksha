"use client";

import { useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
    BriefcaseBusiness,
    CheckCircle2,
    Target,
    ShieldCheck,
    AlertTriangle,
    ArrowUpRight,
    Lock,
    HelpCircle,
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
            className="analytics-panel space-y-6 sm:space-y-8 p-4 sm:p-6 lg:p-8"
        >
            <header className="flex flex-col gap-4 sm:gap-6 lg:flex-row lg:items-start lg:justify-between">
                <div className="max-w-3xl space-y-3 sm:space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-md border border-accent-copper-border bg-accent-copper-surface text-accent-copper shrink-0">
                            <BriefcaseBusiness size={18} strokeWidth={1.8} />
                        </div>
                        <div>
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-accent-copper">
                                    Career Readiness
                                </span>
                                <span className="rounded-md border border-border-strong bg-surface-deep px-2 py-0.5 font-mono text-[9px] text-foreground-muted">
                                    {isOverall ? "Cumulative" : "Semester"}
                                </span>
                                <Link
                                    href="/calculations#placement"
                                    title="How are placement benchmarks calculated?"
                                    className="inline-flex items-center gap-1 text-[10px] font-mono text-foreground-muted hover:text-gold transition-colors"
                                >
                                    <HelpCircle size={11} />
                                    <span className="hidden sm:inline">How is this calculated?</span>
                                </Link>
                            </div>
                            <h2 className="mt-0.5 text-base sm:text-xl font-semibold tracking-tight text-foreground">
                                Anviksha Placement Benchmarks
                            </h2>
                        </div>
                    </div>
                    <p className="max-w-2xl text-xs sm:text-sm leading-5 sm:leading-6 text-foreground-secondary">
                        Application benchmarks modeled on common recruitment brackets. These are not universal GGSIPU rules — actual criteria depend on the specific employer, role, and drive.
                    </p>
                </div>

                <div
                    className={`inline-flex w-fit items-center gap-2 rounded-md border px-3 py-1.5 sm:py-2 text-[10px] sm:text-[11px] font-semibold ${
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

            <div className="rounded-lg border border-border bg-surface-deep/75 p-3.5 sm:p-4">
                <div className="flex items-center justify-between gap-3">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-foreground-muted">
                        Cutoff track
                    </p>
                    <p className="font-mono text-[10px] sm:text-[11px] text-foreground-secondary">
                        {summary.eligibleTierCount}/{summary.totalTierCount} cleared
                    </p>
                </div>

                <div className="mt-3 sm:mt-4 grid grid-cols-4 gap-1.5 sm:gap-2">
                    {summary.tiers.map((tier) => (
                        <div key={tier.id} className="space-y-1.5 sm:space-y-2">
                            <div className="h-1.5 sm:h-2 overflow-hidden rounded-full bg-surface">
                                <div
                                    className={`h-full rounded-full ${
                                        tier.isEligible ? "bg-grade-excellent" : "bg-border-strong"
                                    }`}
                                />
                            </div>
                            <div className="text-[9px] sm:text-[10px] leading-3.5 sm:leading-4">
                                <p className={tier.isEligible ? "text-grade-excellent font-semibold" : "text-foreground-muted"}>
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

                            <p className="mt-3 text-[12px] leading-5 text-foreground-secondary">
                                {tier.description}
                            </p>

                            {tier.exampleCompanies && tier.exampleCompanies.length > 0 && (
                                <div className="mt-3 flex flex-wrap items-center gap-1.5">
                                    <span className="text-[9px] font-mono uppercase tracking-wider text-foreground-muted mr-1 font-semibold">
                                        Typical Recruiters:
                                    </span>
                                    {tier.exampleCompanies.map((company) => (
                                        <span
                                            key={company}
                                            className="rounded border border-border-strong bg-surface-deep px-1.5 py-0.5 font-mono text-[9px] text-foreground-secondary"
                                        >
                                            {company}
                                        </span>
                                    ))}
                                </div>
                            )}

                            <div className="mt-5 flex flex-col gap-3 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
                                <span className="inline-flex items-start gap-2 text-[11px] leading-5">
                                    {isEligible ? (
                                        <>
                                            <CheckCircle2 size={12} className="mt-0.5 shrink-0 text-grade-excellent" />
                                            <span className="text-grade-excellent">
                                                Benchmark and backlog gate cleared.
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
