"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
    CalendarDays,
    Clock3,
    AlertTriangle,
    ShieldCheck,
    Filter,
    ArrowRight,
    BookOpenCheck,
    HelpCircle,
} from "lucide-react";
import { track } from "@vercel/analytics";
import {
    getReappearSessionPlan,
    ReappearSubject,
} from "@/helpers/grade-system";

interface Props {
    allResults: any[][];
    customCredit: Record<string, number>;
}

const tabs = [
    ["ALL", "All"],
    ["ODD", "Odd"],
    ["EVEN", "Even"],
] as const;

export default function ReappearSessionPlanner({
    allResults,
    customCredit,
}: Props) {
    const [selectedTab, setSelectedTab] = useState<"ALL" | "ODD" | "EVEN">("ALL");

    const plan = useMemo(
        () => getReappearSessionPlan(allResults, customCredit),
        [allResults, customCredit],
    );

    const activeList = useMemo(() => {
        if (selectedTab === "ODD") return plan.oddTermBacklogs;
        if (selectedTab === "EVEN") return plan.evenTermBacklogs;
        return [...plan.oddTermBacklogs, ...plan.evenTermBacklogs];
    }, [plan, selectedTab]);

    const tabCounts = {
        ALL: plan.totalBacklogs,
        ODD: plan.oddTermBacklogs.length,
        EVEN: plan.evenTermBacklogs.length,
    };

    if (allResults.length === 0) return null;

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
                        <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-md border border-cat-blue-border bg-cat-blue-surface text-cat-blue shrink-0">
                            <CalendarDays size={18} strokeWidth={1.8} />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-cat-blue">
                                    Examination Planning
                                </div>
                                <Link
                                    href="/calculations#result-states"
                                    title="How are backlog states determined?"
                                    className="inline-flex items-center gap-1 text-[10px] font-mono text-foreground-muted hover:text-gold transition-colors"
                                >
                                    <HelpCircle size={11} />
                                    <span className="hidden sm:inline">How is this calculated?</span>
                                </Link>
                            </div>
                            <h2 className="mt-0.5 text-base sm:text-xl font-semibold tracking-tight text-foreground">
                                Odd vs Even Re-appear Planner
                            </h2>
                        </div>
                    </div>
                    <p className="max-w-2xl text-xs sm:text-sm leading-5 sm:leading-6 text-foreground-secondary">
                        Backlog papers are grouped by the typical exam window they can be cleared in. Actual dates and registrations are notified officially by GGSIPU.
                    </p>
                </div>

                <div
                    className={`inline-flex w-fit items-center gap-2 rounded-md border px-3 py-1.5 sm:py-2 text-[10px] sm:text-[11px] font-semibold ${
                        plan.cleanRecord
                            ? "border-grade-excellent-border bg-grade-excellent-surface text-grade-excellent"
                            : "border-grade-fail-border bg-grade-fail-surface text-grade-fail"
                    }`}
                >
                    {plan.cleanRecord ? <ShieldCheck size={14} /> : <AlertTriangle size={14} />}
                    {plan.cleanRecord
                        ? "No re-appear pending"
                        : `${plan.totalBacklogs} backlog${plan.totalBacklogs !== 1 ? "s" : ""} / ${plan.totalCreditsAtRisk} credits`}
                </div>
            </header>

            {plan.cleanRecord ? (
                <div className="flex flex-col items-center justify-center rounded-lg border border-accent-mint-border bg-accent-mint-surface px-4 sm:px-6 py-10 sm:py-14 text-center">
                    <div className="flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-md border border-accent-mint-border bg-surface text-accent-mint">
                        <BookOpenCheck size={23} />
                    </div>
                    <h3 className="mt-4 sm:mt-5 text-sm sm:text-base font-semibold text-foreground">
                        All academic semesters cleared
                    </h3>
                    <p className="mt-2 max-w-md text-xs sm:text-sm leading-5 sm:leading-6 text-foreground-secondary">
                        No active backlog subject is currently queued for Odd or Even term re-appearance registration.
                    </p>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 gap-3 sm:gap-4 lg:grid-cols-2">
                        <SessionWindowCard
                            title="Odd term queue"
                            subtitle="Sem 1 / 3 / 5 / 7"
                            window="Typical Nov - Dec winter examination window"
                            count={plan.oddTermBacklogs.length}
                            credits={plan.oddTermCredits}
                            accentClass="text-gold"
                            surfaceClass="border-gold-border bg-gold-surface/25"
                        />
                        <SessionWindowCard
                            title="Even term queue"
                            subtitle="Sem 2 / 4 / 6 / 8"
                            window="Typical May - Jun summer examination window"
                            count={plan.evenTermBacklogs.length}
                            credits={plan.evenTermCredits}
                            accentClass="text-cat-blue"
                            surfaceClass="border-cat-blue-border bg-cat-blue-surface/25"
                        />
                    </div>

                    <div className="flex flex-col gap-3 sm:gap-4 border-y border-border py-4 sm:py-5 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-2">
                            <Filter size={13} className="text-foreground-muted" />
                            <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-foreground-muted">
                                Re-appear queue / {activeList.length}
                            </span>
                        </div>

                        <div className="flex sm:inline-flex w-full sm:w-auto rounded-md border border-border bg-surface-deep p-1">
                            {tabs.map(([value, label]) => (
                                <button
                                    key={value}
                                    type="button"
                                    onClick={() => {
                                        track("toggle_reappear_tab", { tab: value });
                                        setSelectedTab(value);
                                    }}
                                    className={`flex-1 sm:flex-initial text-center rounded px-2.5 sm:px-3 py-1.5 text-[10px] font-semibold transition-colors cursor-pointer ${
                                        selectedTab === value
                                            ? "bg-foreground text-background"
                                            : "text-foreground-muted hover:bg-surface-hover hover:text-foreground"
                                    }`}
                                >
                                    {label} ({tabCounts[value]})
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2">
                        <AnimatePresence mode="popLayout">
                            {activeList.map((subject: ReappearSubject) => (
                                <motion.article
                                    key={`${subject.semester}-${subject.paperCode}`}
                                    layout
                                    initial={{ opacity: 0, scale: 0.98 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.98 }}
                                    transition={{ duration: 0.2 }}
                                    className="analytics-card flex min-h-fit sm:min-h-44 flex-col justify-between p-4 sm:p-5 transition-colors hover:border-border-strong"
                                >
                                    <div className="space-y-3 sm:space-y-4">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="min-w-0">
                                                <div className="flex flex-wrap items-center gap-2 font-mono text-[10px]">
                                                    <span className="font-semibold text-gold">
                                                        {subject.paperCode || "NO-CODE"}
                                                    </span>
                                                    <span className="text-foreground-muted">/</span>
                                                    <span className="text-foreground-muted">
                                                        Sem {subject.semester}
                                                    </span>
                                                    <span className="text-foreground-muted">/</span>
                                                    <span className="text-foreground-muted">
                                                        {subject.credit} cr
                                                    </span>
                                                    {subject.resultState === "ABSENT" && (
                                                        <span className="px-1.5 py-0.2 rounded bg-surface-deep text-foreground-muted font-bold">
                                                            ABSENT
                                                        </span>
                                                    )}
                                                    {subject.resultState === "DETAINED" && (
                                                        <span className="px-1.5 py-0.2 rounded bg-grade-fail-surface text-grade-fail font-bold border border-grade-fail-border">
                                                            DETAINED
                                                        </span>
                                                    )}
                                                </div>
                                                <h3 className="mt-1.5 sm:mt-2 text-xs sm:text-sm font-semibold leading-5 text-foreground">
                                                    {subject.subjectTitle}
                                                </h3>
                                            </div>

                                            <PriorityBadge priority={subject.priority} />
                                        </div>

                                        <p className="text-[11px] sm:text-[12px] leading-5 sm:leading-6 text-foreground-secondary">
                                            {subject.priorityReason}
                                        </p>
                                    </div>

                                    <div className="mt-4 sm:mt-5 grid gap-2 sm:gap-3 border-t border-border pt-3.5 sm:pt-4 text-[10px] sm:text-[11px] grid-cols-[1fr_auto] items-center">
                                        <div className="min-w-0">
                                            <p className="text-foreground-muted text-[10px]">Eligible examination window</p>
                                            <p className="mt-0.5 font-medium text-foreground truncate">
                                                {subject.sessionWindow}
                                            </p>
                                        </div>
                                        <span className="inline-flex shrink-0 w-fit items-center gap-1 rounded-md border border-border-strong bg-surface px-2 sm:px-2.5 py-1 font-mono text-[10px] text-foreground-secondary">
                                            {typeof subject.marks === "number" ? `${subject.marks}/${subject.maxMarks}` : subject.marks}
                                            <ArrowRight size={10} />
                                        </span>
                                    </div>
                                </motion.article>
                            ))}
                        </AnimatePresence>
                    </div>

                    <footer className="grid gap-3 rounded-lg border border-border bg-surface-deep/70 p-3.5 sm:p-4 text-[10px] sm:text-[11px] leading-5 text-foreground-secondary sm:grid-cols-2 sm:gap-6">
                        <div>
                            <span className="font-semibold text-foreground">Term heuristic:</span>{" "}
                            Odd semester papers typically re-appear in Winter (Nov-Dec) windows, and even semester papers in Summer (May-June) windows.
                        </div>
                        <div>
                            <span className="font-semibold text-foreground">Priority guideline:</span>{" "}
                            First-year and high-credit backlogs impact promotion standing most directly and should be prioritized.
                        </div>
                    </footer>
                </>
            )}
        </motion.section>
    );
}

function SessionWindowCard({
    title,
    subtitle,
    window,
    count,
    credits,
    accentClass,
    surfaceClass,
}: {
    title: string;
    subtitle: string;
    window: string;
    count: number;
    credits: number;
    accentClass: string;
    surfaceClass: string;
}) {
    return (
        <div className={`rounded-lg border p-5 ${surfaceClass}`}>
            <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-foreground-muted">
                    <Clock3 size={13} className={accentClass} />
                    {title}
                </div>
                <span className="rounded-md border border-border-strong bg-surface px-2.5 py-1 font-mono text-[9px] text-foreground-muted">
                    {subtitle}
                </span>
            </div>
            <div className="mt-7 flex items-end justify-between gap-4">
                <div>
                    <p className="font-mono text-4xl font-semibold leading-none text-foreground">
                        {count}
                    </p>
                    <p className="mt-2 text-[11px] text-foreground-muted">
                        subject{count !== 1 ? "s" : ""} queued
                    </p>
                </div>
                <p className={`font-mono text-sm font-semibold ${accentClass}`}>
                    {credits} credits
                </p>
            </div>
            <p className="mt-5 text-[12px] leading-5 text-foreground-secondary">
                {window}
            </p>
        </div>
    );
}

function PriorityBadge({ priority }: { priority: ReappearSubject["priority"] }) {
    if (priority === "HIGH") {
        return (
            <span className="shrink-0 rounded-md border border-grade-fail-border bg-grade-fail-surface px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.12em] text-grade-fail">
                High
            </span>
        );
    }

    if (priority === "MEDIUM") {
        return (
            <span className="shrink-0 rounded-md border border-gold-border bg-gold-surface px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.12em] text-gold">
                Upcoming
            </span>
        );
    }

    return (
        <span className="shrink-0 rounded-md border border-border-strong bg-surface px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.12em] text-foreground-muted">
            Standard
        </span>
    );
}
