"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    CalendarDays,
    Clock3,
    AlertTriangle,
    ShieldCheck,
    ArrowRight,
    BookOpenCheck,
} from "lucide-react";
import Chip from "@/components/analytics/Chip";
import PanelHeader from "@/components/analytics/PanelHeader";
import type { ReappearSubject, ReappearSessionPlan } from "@/types/result";

export type { ReappearSubject, ReappearSessionPlan };

const tabs = [
    ["ALL", "All"],
    ["ODD", "Odd"],
    ["EVEN", "Even"],
] as const;

// Plans and categorizes backlog examinations into Odd and Even semester exam windows.
export default function ReappearSessionPlanner({ plan }: { plan: ReappearSessionPlan }) {
    const [selectedTab, setSelectedTab] = useState<"ALL" | "ODD" | "EVEN">("ALL");

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

    return (
        <section className="home-panel space-y-6 p-5 sm:p-6">
            <PanelHeader
                icon={CalendarDays}
                iconClass="border-cat-blue-border bg-cat-blue-surface text-cat-blue"
                kicker="Examination Planning"
                kickerClass="text-cat-blue"
                title="Odd vs Even Re-appear Planner"
                helpHref="/calculations#result-states"
                helpTitle="How are backlog states determined?"
                right={
                    <Chip tone={plan.cleanRecord ? "good" : "bad"} className="self-start">
                        {plan.cleanRecord ? (
                            <ShieldCheck size={13} aria-hidden="true" />
                        ) : (
                            <AlertTriangle size={13} aria-hidden="true" />
                        )}
                        {plan.cleanRecord
                            ? "No re-appear pending"
                            : `${plan.totalBacklogs} backlog${plan.totalBacklogs !== 1 ? "s" : ""} / ${plan.totalCreditsAtRisk} credits`}
                    </Chip>
                }
            />

            <p className="max-w-3xl text-sm leading-6 text-foreground-secondary">
                Backlog papers are grouped by the typical exam window they can be cleared in. Actual dates and registrations are notified officially by GGSIPU.
            </p>

            {plan.cleanRecord ? (
                <div className="flex flex-col items-center justify-center rounded-xl border border-accent-mint-border bg-accent-mint-surface px-4 py-10 text-center">
                    <motion.div
                        initial={{ scale: 0.6, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.1 }}
                        className="flex size-12 items-center justify-center rounded-xl border border-accent-mint-border bg-surface text-accent-mint"
                    >
                        <BookOpenCheck size={22} aria-hidden="true" />
                    </motion.div>
                    <h3 className="mt-4 text-base font-semibold text-foreground">All academic semesters cleared</h3>
                    <p className="mt-1.5 max-w-md text-sm leading-6 text-foreground-secondary">
                        No active backlog subject is currently queued for Odd or Even term re-appearance registration.
                    </p>
                </div>
            ) : (
                <>
                    {/* Odd and Even semester examination window queues */}
                    <div className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-border bg-border">
                        <SessionWindowCard
                            title="Odd term queue"
                            subtitle="Sem 1 / 3 / 5 / 7"
                            window="Typical Nov - Dec winter examination window"
                            count={plan.oddTermBacklogs.length}
                            credits={plan.oddTermCredits}
                            accentClass="text-gold"
                        />
                        <SessionWindowCard
                            title="Even term queue"
                            subtitle="Sem 2 / 4 / 6 / 8"
                            window="Typical May - Jun summer examination window"
                            count={plan.evenTermBacklogs.length}
                            credits={plan.evenTermCredits}
                            accentClass="text-cat-blue"
                        />
                    </div>

                    <div>
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <h3 className="text-sm font-semibold text-foreground">
                                Re-appear queue <span className="tnum font-mono text-foreground-muted">/ {activeList.length}</span>
                            </h3>

                            {/* Backlog window selector: All, Odd term, or Even term */}
                            <div className="flex w-full rounded-lg border border-border bg-surface p-0.5 sm:inline-flex sm:w-auto">
                                {tabs.map(([value, label]) => (
                                    <button
                                        key={value}
                                        type="button"
                                        onClick={() => setSelectedTab(value)}
                                        className={`relative flex-1 cursor-pointer rounded-md px-3 py-1.5 text-center text-xs font-semibold transition-colors sm:flex-initial ${
                                            selectedTab === value ? "text-background" : "text-foreground-muted hover:text-foreground"
                                        }`}
                                    >
                                        {selectedTab === value && (
                                            <motion.span
                                                layoutId="reappearFilter"
                                                transition={{ type: "spring", stiffness: 450, damping: 35 }}
                                                className="absolute inset-0 rounded-md bg-foreground"
                                            />
                                        )}
                                        <span className="relative">
                                            {label} <span className="tnum font-mono">({tabCounts[value]})</span>
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Backlog subject cards with examination priority */}
                        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
                            <AnimatePresence mode="popLayout">
                                {activeList.map((subject: ReappearSubject) => (
                                    <motion.article
                                        key={`${subject.semester}-${subject.paperCode}`}
                                        layout
                                        initial={{ opacity: 0, scale: 0.97 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.97 }}
                                        transition={{ duration: 0.2 }}
                                        className="flex flex-col rounded-xl border border-border p-4 transition-colors hover:border-border-strong"
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="min-w-0">
                                                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-xs text-foreground-muted">
                                                    <span className="font-semibold text-gold">
                                                        {subject.paperCode || "NO-CODE"}
                                                    </span>
                                                    <span>Sem {subject.semester}</span>
                                                    <span>{subject.credit} cr</span>
                                                    {subject.resultState === "ABSENT" && (
                                                        <span className="rounded bg-surface-elevated px-1.5 py-px font-semibold">
                                                            ABSENT
                                                        </span>
                                                    )}
                                                    {subject.resultState === "DETAINED" && (
                                                        <span className="rounded bg-grade-fail-surface px-1.5 py-px font-semibold text-grade-fail">
                                                            DETAINED
                                                        </span>
                                                    )}
                                                </div>
                                                <h4 className="mt-1.5 text-sm font-semibold leading-5 text-foreground">
                                                    {subject.subjectTitle}
                                                </h4>
                                            </div>

                                            <PriorityBadge priority={subject.priority} />
                                        </div>

                                        <p className="mt-2 text-xs leading-5 text-foreground-secondary">
                                            {subject.priorityReason}
                                        </p>

                                        <div className="mt-auto flex items-center justify-between gap-3 border-t border-border pt-3 text-xs">
                                            <div className="min-w-0">
                                                <p className="text-foreground-muted">Eligible examination window</p>
                                                <p className="mt-0.5 truncate font-medium text-foreground">
                                                    {subject.sessionWindow}
                                                </p>
                                            </div>
                                            <Chip tone="muted" className="font-mono">
                                                {typeof subject.marks === "number" ? `${subject.marks}/${subject.maxMarks}` : subject.marks}
                                                <ArrowRight size={11} aria-hidden="true" />
                                            </Chip>
                                        </div>
                                    </motion.article>
                                ))}
                            </AnimatePresence>
                        </div>
                    </div>

                    <p className="text-xs leading-5 text-foreground-muted">
                        <span className="font-semibold text-foreground-secondary">Priority guideline:</span>{" "}
                        First-year and high-credit backlogs impact promotion standing most directly and should be prioritized.
                    </p>
                </>
            )}
        </section>
    );
}

function SessionWindowCard({
    title,
    subtitle,
    window,
    count,
    credits,
    accentClass,
}: {
    title: string;
    subtitle: string;
    window: string;
    count: number;
    credits: number;
    accentClass: string;
}) {
    return (
        <div className="bg-surface p-4">
            <div className="flex flex-col items-start gap-1.5 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                <p className="flex items-center gap-2 text-xs font-medium text-foreground-secondary">
                    <Clock3 size={14} className={accentClass} aria-hidden="true" />
                    {title}
                </p>
                <span className="font-mono text-[11px] text-foreground-muted">{subtitle}</span>
            </div>

            <div className="mt-3 flex items-end justify-between gap-3">
                <div>
                    <p className="tnum font-mono text-3xl font-semibold leading-none text-foreground">{count}</p>
                    <p className="mt-1.5 text-xs text-foreground-muted">subject{count !== 1 ? "s" : ""} queued</p>
                </div>
                <p className={`tnum shrink-0 whitespace-nowrap font-mono text-sm font-semibold ${accentClass}`}>{credits} credits</p>
            </div>

            <p className="mt-3 text-xs leading-5 text-foreground-secondary">{window}</p>
        </div>
    );
}

function PriorityBadge({ priority }: { priority: ReappearSubject["priority"] }) {
    if (priority === "HIGH") return <Chip tone="bad">High</Chip>;
    if (priority === "MEDIUM") return <Chip tone="gold">Upcoming</Chip>;
    return <Chip tone="muted">Standard</Chip>;
}
