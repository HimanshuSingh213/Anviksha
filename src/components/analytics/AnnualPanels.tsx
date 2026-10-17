"use client";

import ProvenanceChip from "@/components/analytics/ProvenanceChip";
import type { EngineResult } from "@/types/result";

// Analytics panels for annual programmes (MBBS, BPT, BHMS, BAMS).

export function SpecialAnnualAnalytics({ engine }: { engine: EngineResult }) {
    const a = engine.analytics;
    const hasDistinction = (a.distinctionCount.value ?? 0) > 0;
    const hasCpi = a.division.status !== "NOT_APPLICABLE" && a.division.value !== null;
    const pctValue = a.percentage.value ?? a.averagePercentage.value;

    const cards = [
        {
            label: "Aggregate Percentage",
            value: pctValue !== null ? `${pctValue.toFixed(2)}%` : "—",
            status: a.percentage.status !== "UNAVAILABLE" ? a.percentage.status : a.averagePercentage.status,
            reason: a.percentage.reason ?? a.averagePercentage.reason ?? "Aggregated course marks normalized by subject maxima.",
        },
        {
            label: "Pass Rate",
            value: a.passRate.value !== null ? `${a.passRate.value.toFixed(1)}%` : "—",
            status: a.passRate.status,
            reason: "Calculated from official course results.",
        },
        {
            label: "Internal Average",
            value: a.internalAverage.value !== null ? a.internalAverage.value.toFixed(1) : "—",
            status: a.internalAverage.status,
            reason: "Average of internal assessment marks.",
        },
        {
            label: "External Average",
            value: a.externalAverage.value !== null ? a.externalAverage.value.toFixed(1) : "—",
            status: a.externalAverage.status,
            reason: "Average of university end-term examination marks.",
        },
        ...(hasDistinction ? [{
            label: "Distinction Courses",
            value: String(a.distinctionCount.value ?? 0),
            status: a.distinctionCount.status,
            reason: "Distinction awarded for exceeding 75% marks.",
        }] : []),
        ...(hasCpi ? [{
            label: "CPI / Division",
            value: a.division.value ?? "—",
            status: a.division.status,
            reason: a.division.reason ?? "Performance index under programme regulations.",
        }] : []),
        {
            label: "Backlogs",
            value: String(a.notClearedCount.value ?? 0),
            status: a.notClearedCount.status,
            reason: "Count of courses not cleared/absent/detained in the loaded result.",
        },
    ];

    const lastCardPhoneSpan = cards.length % 2 === 1 ? "col-span-2" : "";
    const lastCardDesktopSpan = ["lg:col-span-1", "lg:col-span-2", "lg:col-span-3"][(3 - (cards.length % 3)) % 3];

    return (
        <section className="space-y-4 lg:space-y-6">
            <div className="home-panel overflow-hidden">
                <div className="grid grid-cols-2 gap-px bg-border lg:grid-cols-3">
                    {cards.map((card, index) => (
                        <div
                            key={card.label}
                            className={`flex flex-col bg-surface p-4 sm:p-5 ${
                                index === cards.length - 1 ? `${lastCardPhoneSpan} ${lastCardDesktopSpan}` : ""
                            }`}
                        >
                            <p className="text-xs text-foreground-secondary">{card.label}</p>
                            <p className="tnum mt-2 font-mono text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                                {card.value}
                            </p>
                            <p className="mt-2 text-xs leading-5 text-foreground-muted">{card.reason ?? "—"}</p>
                            <div className="mt-3">
                                <ProvenanceChip state={card.status} tooltip={card.reason ?? "—"} />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="home-panel p-5 sm:p-6">
                <h3 className="text-base font-semibold tracking-[-0.01em] text-foreground">
                    Professional Framework Regulations
                </h3>
                <p className="mt-2 text-sm leading-6 text-foreground-secondary">
                    {a.subjectPassRule.value ?? a.subjectPassRule.reason ?? "Programme-specific passing criteria loaded."}
                </p>
                <p className="mt-2 text-xs leading-5 text-foreground-muted">
                    Official marksheet totals prevail; component sub-breakups are evaluated directly from university examination records.
                </p>
            </div>
        </section>
    );
}

// Academic standing, division classification, and progression under annual regulations.
export function SpecialAnnualStanding({ engine }: { engine: EngineResult }) {
    const a = engine.analytics;
    const hasDivision = a.division.status !== "NOT_APPLICABLE" && a.division.value !== null;
    const progression = a.promotion.value?.[0]?.standing ?? "UNKNOWN";

    const columns = [
        {
            label: "Subject Pass Rule",
            value: a.subjectPassRule.value ?? "Unavailable",
            note: a.subjectPassRule.sources.join(" · "),
        },
        ...(hasDivision ? [{
            label: "Division Classification",
            value: a.division.value ?? "",
            note: a.division.reason ?? "Programme-specific classification rule.",
        }] : []),
        {
            label: "Progression",
            value: progression === "PROMOTED" ? "All subjects cleared" : progression === "NOT_PROMOTED" ? "Subjects pending" : "Official result required",
            note: a.promotion.reason ?? "Professional progression is determined under annual regulations.",
        },
    ];

    return (
        <section className="home-panel flex flex-col divide-y divide-border md:flex-row md:divide-x md:divide-y-0">
            {columns.map((column) => (
                <div key={column.label} className="p-5 sm:p-6 md:flex-1">
                    <p className="text-xs text-foreground-secondary">{column.label}</p>
                    <p className="mt-2 text-lg font-semibold tracking-[-0.01em] text-foreground">{column.value}</p>
                    <p className="mt-2 text-xs leading-5 text-foreground-muted">{column.note}</p>
                </div>
            ))}
        </section>
    );
}
