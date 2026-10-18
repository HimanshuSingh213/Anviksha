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
import { getPlacementEligibility } from "@/lib/academic/academic-engine";
import Chip from "@/components/analytics/Chip";
import PanelHeader from "@/components/analytics/PanelHeader";
import type { PlacementTier } from "@/types/result";

export type { PlacementTier };

interface Props {
    cgpa: number;
    activeBacklogs: number;
    isOverall: boolean;
}

const TRACK_START = 50;
const trackPosition = (percent: number) =>
    `${Math.min(100, Math.max(0, ((percent - TRACK_START) / (100 - TRACK_START)) * 100))}%`;

// Evaluates campus recruitment cutoffs (60%, 65%, 70%, 75%) and zero-backlog eligibility gates.
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
        <section className="home-panel space-y-6 p-5 sm:p-6">
            <PanelHeader
                icon={BriefcaseBusiness}
                iconClass="border-accent-copper-border bg-accent-copper-surface text-accent-copper"
                kicker="Career Readiness"
                kickerClass="text-accent-copper"
                tag={isOverall ? "Cumulative" : "Semester"}
                title="Anviksha Placement Benchmarks"
                helpHref="/calculations#placement"
                helpTitle="How are placement benchmarks calculated?"
                right={
                    <Chip tone={gateOpen ? "good" : "bad"} className="self-start">
                        {gateOpen ? <ShieldCheck size={13} aria-hidden="true" /> : <Lock size={13} aria-hidden="true" />}
                        {gateOpen ? "0-backlog gate open" : "Backlog gate locked"}
                    </Chip>
                }
            />

            <p className="max-w-3xl text-sm leading-6 text-foreground-secondary">
                Application benchmarks modeled on common recruitment brackets. These are not universal GGSIPU rules — actual criteria depend on the specific employer, role, and drive.
            </p>

            <div className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-border bg-border lg:grid-cols-3">
                <div className="bg-surface p-4">
                    <p className="text-xs text-foreground-secondary">Current aggregate</p>
                    <p className="mt-1.5 flex items-baseline gap-2">
                        <span className="tnum font-mono text-2xl font-semibold text-foreground">
                            {summary.cgpa.toFixed(2)}
                        </span>
                        <span className="text-xs text-foreground-muted">CGPA / {summary.percentage}%</span>
                    </p>
                    <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-border-strong">
                        <motion.div
                            initial={{ width: 0 }}
                            whileInView={{ width: `${Math.min(100, Math.max(0, summary.percentage))}%` }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.9, ease: "easeOut" }}
                            className="h-full rounded-full bg-accent-copper"
                        />
                    </div>
                </div>

                <div className="bg-surface p-4">
                    <p className="text-xs text-foreground-secondary">Backlog gate</p>
                    <p className="mt-1.5 flex items-baseline gap-2">
                        <span
                            className={`tnum font-mono text-2xl font-semibold ${
                                gateOpen ? "text-grade-excellent" : "text-grade-fail"
                            }`}
                        >
                            {summary.activeBacklogs}
                        </span>
                        <span className="text-xs text-foreground-muted">active</span>
                    </p>
                    <p className={`mt-2 text-xs leading-5 ${gateOpen ? "text-grade-excellent" : "text-grade-fail"}`}>
                        {gateOpen
                            ? "Eligible for zero-backlog recruitment screens."
                            : "Clear active backlog subjects before applying this gate."}
                    </p>
                </div>

                <div className="col-span-2 bg-surface p-4 lg:col-span-1">
                    <p className="text-xs text-foreground-secondary">Next milestone</p>
                    <p className="mt-1.5 text-base font-semibold text-foreground">
                        {summary.nextTargetTier ? summary.nextTargetTier.name : "All benchmarks met"}
                    </p>
                    <p className="mt-1 text-xs leading-5 text-foreground-secondary">
                        {summary.nextTargetTier
                            ? summary.nextTargetTier.statusReason
                            : "Highest available benchmark bracket is cleared."}
                    </p>
                </div>
            </div>

            <div>
                <div className="flex items-center justify-between gap-3">
                    <h3 className="text-sm font-semibold text-foreground">Cutoff track</h3>
                    <p className="tnum font-mono text-xs text-foreground-secondary">
                        {summary.eligibleTierCount}/{summary.totalTierCount} cleared
                    </p>
                </div>

                <div className="relative mx-3 mt-10 h-12">
                    <div className="absolute inset-x-0 top-3 h-1.5 rounded-full bg-border-strong" />
                    <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: trackPosition(summary.percentage) }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.1, ease: "easeOut" }}
                        className="absolute left-0 top-3 h-1.5 rounded-full bg-accent-copper"
                    />

                    {summary.tiers.map((tier) => (
                        <div
                            key={tier.id}
                            className="absolute top-1.5 -translate-x-1/2"
                            style={{ left: trackPosition(tier.minPercentage) }}
                        >
                            <span
                                className={`block h-4.5 w-px ${tier.isEligible ? "bg-grade-excellent" : "bg-foreground-muted"}`}
                            />
                            <span
                                className={`tnum mt-1.5 block text-center font-mono text-xs ${
                                    tier.isEligible ? "font-semibold text-grade-excellent" : "text-foreground-muted"
                                }`}
                            >
                                {tier.minPercentage}%
                            </span>
                        </div>
                    ))}

                    <motion.div
                        initial={{ left: 0, opacity: 0 }}
                        whileInView={{ left: trackPosition(summary.percentage), opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.1, ease: "easeOut" }}
                        className="absolute top-3.75 -translate-x-1/2 -translate-y-1/2"
                    >
                        <span className="block size-3.5 rounded-full border-2 border-surface bg-gold-bright" />
                        <span className="tnum absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded border border-gold-border bg-surface px-1.5 py-0.5 font-mono text-xs font-semibold text-gold-bright">
                            {summary.percentage}%
                        </span>
                    </motion.div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {summary.tiers.map((tier: PlacementTier, index) => {
                    const isEligible = tier.isEligible;

                    return (
                        <motion.article
                            key={tier.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, ease: "easeOut", delay: 0.1 + index * 0.06 }}
                            className={`flex flex-col rounded-xl border p-4 ${
                                isEligible
                                    ? "border-grade-excellent-border/60 bg-grade-excellent-surface/20"
                                    : "border-border"
                            }`}
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                    <h3 className="text-sm font-semibold text-foreground">{tier.name}</h3>
                                    <p className="mt-0.5 font-mono text-xs text-accent-copper">{tier.benchmarkLabel}</p>
                                </div>

                                {isEligible ? (
                                    <Chip tone="good">
                                        <CheckCircle2 size={12} aria-hidden="true" />
                                        Eligible
                                    </Chip>
                                ) : (
                                    <Chip tone="copper">
                                        <Target size={12} aria-hidden="true" />
                                        Target
                                    </Chip>
                                )}
                            </div>

                            <p className="mt-2.5 text-sm leading-6 text-foreground-secondary">{tier.description}</p>

                            {tier.exampleCompanies && tier.exampleCompanies.length > 0 && (
                                <p className="mt-2 text-xs leading-5 text-foreground-muted">
                                    <span className="font-medium text-foreground-secondary">Typical recruiters: </span>
                                    {tier.exampleCompanies.join(", ")}
                                </p>
                            )}

                            <div className="mt-auto flex items-start justify-between gap-3 border-t border-border pt-3 text-xs leading-5">
                                {isEligible ? (
                                    <span className="flex items-start gap-2 text-grade-excellent">
                                        <CheckCircle2 size={13} className="mt-0.5 shrink-0" aria-hidden="true" />
                                        Benchmark and backlog gate cleared.
                                    </span>
                                ) : (
                                    <span className="flex items-start gap-2 text-foreground-secondary">
                                        <AlertTriangle size={13} className="mt-0.5 shrink-0 text-grade-fail" aria-hidden="true" />
                                        {tier.statusReason}
                                    </span>
                                )}

                                {!isEligible && tier.cgpaDeficit > 0 && (
                                    <Chip tone="gold" className="font-mono">
                                        +{tier.cgpaDeficit} CGPA
                                        <ArrowUpRight size={11} aria-hidden="true" />
                                    </Chip>
                                )}
                            </div>
                        </motion.article>
                    );
                })}
            </div>
        </section>
    );
}
