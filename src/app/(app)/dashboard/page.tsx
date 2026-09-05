"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import axios, { AxiosError } from "axios";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { AlertTriangle, CheckCircle2, Percent, BarChart2, BookOpen, Pencil, ArrowRight, FileDown } from "lucide-react";
import { toast } from "sonner";
import Skeleton from "@/components/dashboard/Skeleton";
import AppNavbar from "@/components/common/AppNavbar";
import useResultStore from "@/store/result-store";
import { ResultData } from "@/types/result";
import { analyzeResult } from "@/lib/academic/academic-engine";
import { ProvenanceChip } from "@/components/analytics/ProvenanceChip";
import ExplanationPanel from "@/components/analytics/ExplanationPanel";
import PixelAvatar from "@/components/dashboard/PixelAvatar";
import CreditTipModal from "@/components/dashboard/CreditTipModal";
import Tooltip from "@/components/common/Tooltip";
import { ApiErrorResponse, ApiSuccessResponse } from "@/types/ApiResponse";

const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];

const STATUS_LABEL: Record<string, { label: string; className: string }> = {
    PASS: { label: "Pass", className: "text-grade-excellent" },
    CREDIT_SECURED: { label: "Credit Secured", className: "text-grade-excellent" },
    ALREADY_PASSED: { label: "Already Passed", className: "text-grade-excellent" },
    NOT_CLEARED: { label: "Back", className: "text-grade-fail" },
    ABSENT: { label: "Absent", className: "text-foreground-muted" },
    DETAINED: { label: "Detained", className: "text-grade-fail" },
    CANCELLED: { label: "Cancelled", className: "text-destructive" },
    RESULT_LATER: { label: "Result Later", className: "text-chart-cyan" },
    UNKNOWN: { label: "Unknown", className: "text-foreground-muted" },
};

interface CreditInputCellProps {
    paperCode: string;
    courseName: string;
    creditValue: number | null;
    isPassed: boolean;
    onSetCredit: (code: string, val: number | null) => void;
}

function CreditInputCell({
    paperCode,
    courseName,
    creditValue,
    isPassed,
    onSetCredit,
}: CreditInputCellProps) {
    const [localValue, setLocalValue] = useState<string>(
        creditValue != null ? String(creditValue) : ""
    );
    const [isFocused, setIsFocused] = useState(false);

    // Synchronize from store/props ONLY when user is not actively typing/focused
    useEffect(() => {
        if (!isFocused) {
            setLocalValue(creditValue != null ? String(creditValue) : "");
        }
    }, [creditValue, isFocused]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value.trim();

        // When user clears the field with backspace / delete:
        if (val === "") {
            setLocalValue("");
            onSetCredit(paperCode, null);
            return;
        }

        // Allow only valid numeric digits up to 2 digits (0 to 20)
        if (/^\d{1,2}$/.test(val)) {
            const num = parseInt(val, 10);
            if (num <= 20) {
                setLocalValue(val);
                onSetCredit(paperCode, num);
            }
        }
    };

    const handleBlur = () => {
        setIsFocused(false);
        if (localValue === "") {
            onSetCredit(paperCode, null);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "ArrowUp") {
            e.preventDefault();
            const cur = parseInt(localValue, 10) || 0;
            const next = Math.min(20, cur + 1);
            setLocalValue(String(next));
            onSetCredit(paperCode, next);
        } else if (e.key === "ArrowDown") {
            e.preventDefault();
            const cur = parseInt(localValue, 10) || 0;
            const next = Math.max(0, cur - 1);
            setLocalValue(String(next));
            onSetCredit(paperCode, next);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center">
            <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={localValue}
                placeholder="–"
                aria-label={`Edit credit value for ${courseName}`}
                title="Click to edit credits for custom GPA calculation"
                onFocus={() => setIsFocused(true)}
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
                onWheel={(e) => (e.target as HTMLInputElement).blur()}
                onChange={handleChange}
                className="w-10 text-center bg-surface-deep border border-border-strong hover:border-gold/60 focus:border-gold focus:ring-1 focus:ring-gold/30 rounded-sm py-0.5 font-mono text-xs font-bold text-foreground outline-none transition-all cursor-pointer focus:cursor-text"
            />
            {!isPassed && (
                <div className="text-[9px] font-mono text-grade-fail font-semibold mt-0.5" title="Backlog: 0 credits earned until cleared">
                    0 earned
                </div>
            )}
        </div>
    );
}

function getGradeThemeClasses(grade: string) {
    switch (grade) {
        case "O":
        case "A+":
            return "bg-grade-excellent-surface text-grade-excellent border-grade-excellent-border";
        case "A":
        case "B+":
            return "bg-grade-good-surface text-grade-good border-grade-good-border";
        case "B":
        case "C":
            return "bg-grade-average-surface text-grade-average border-grade-average-border";
        case "P":
            return "bg-grade-pass-surface text-grade-pass border-grade-pass-border";
        case "ABS":
        case "DET":
            return "bg-surface-deep text-foreground-muted border-border-strong";
        default:
            return "bg-grade-fail-surface text-grade-fail border-grade-fail-border";
    }
}

export default function DashboardPage() {
    const router = useRouter();

    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [activeSem, setActiveSem] = useState<string>("100");

    const setFullResult = useResultStore((state) => state.setResult);
    const fullResult = useResultStore((state) => state.result);
    const clearResult = useResultStore((state) => state.clearResult);
    const customCredit = useResultStore((state) => state.customCredits);
    const setCustomCredit = useResultStore((state) => state.setCustomCredit);

    const fetchResults = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const res = await axios.get<ApiSuccessResponse<ResultData>>(`/api/result?euno=100`);
            if (res.data?.data) {
                setFullResult(res.data.data);
            }
        } catch (err: any) {
            const error = err as AxiosError<ApiErrorResponse>;
            const apiErr = error.response?.data;

            if (apiErr && !apiErr.success) {
                switch (apiErr.code) {
                    case "SESSION_EXPIRED":
                        clearResult();
                        router.push("/login?expired=true");
                        break;

                    case "RATE_LIMITED":
                        toast.error(apiErr.error || "Account access locked. Try again later.");
                        break;

                    case "VALIDATION_ERROR":
                        toast.error(apiErr.error || "Validation failed.");
                        break;

                    case "UPSTREAM_ERROR":
                    case "NETWORK_ERROR":
                        toast.error(apiErr.error || "GGSIPU portal is unreachable.");
                        break;

                    default:
                        toast.error(apiErr.error || "An unexpected error occurred.");
                }
            } else {
                toast.error("Network error. Please check your connection.");
            }

            setError("Failed to load results");
        } finally {
            setLoading(false);
        }
    }, [clearResult, router, setFullResult]);

    useEffect(() => {
        const hasAuthCookie = typeof document !== "undefined" && document.cookie.split("; ").some((c) => c.startsWith("auth_session="));
        if (!fullResult && hasAuthCookie) {
            fetchResults();
        } else {
            setLoading(false);
        }
    }, [fullResult, fetchResults]);

    const engine = useMemo(
        () => analyzeResult(fullResult, customCredit),
        [fullResult, customCredit]
    );

    const { analytics, programme, courses } = engine;

    const visibleCourses = useMemo(() => {
        return activeSem === "100"
            ? courses
            : courses.filter((c) => String(c.period) === activeSem);
    }, [courses, activeSem]);

    const availableSemesters = useMemo(() => {
        const semSet = new Set<string>();
        for (const c of courses) {
            if (c.period !== undefined && c.period !== null && String(c.period).trim() !== "") {
                semSet.add(String(c.period).trim());
            }
        }
        const sorted = [...semSet].sort((a, b) => Number(a) - Number(b));
        if (sorted.length === 0) {
            return [
                { label: "All", value: "100" },
                { label: "I", value: "1" },
                { label: "II", value: "2" },
            ];
        }
        return [
            { label: "All", value: "100" },
            ...sorted.map((sem) => {
                const num = Number(sem);
                const label = Number.isInteger(num) && num >= 1 && num <= 10 ? ROMAN[num - 1] : `Sem ${sem}`;
                return { label, value: sem };
            }),
        ];
    }, [courses]);

    const isPercentageFramework = programme.ordinance !== "ORD_11" || analytics.cgpa.status === "NOT_APPLICABLE";

    const activeGpaMetric = useMemo(() => {
        if (activeSem === "100") {
            return analytics.cgpa;
        }
        const semGpa = analytics.sgpaByPeriod?.find((p) => String(p.period) === activeSem)?.sgpa;
        return semGpa ?? analytics.sgpa;
    }, [activeSem, analytics]);

    const displayGpa = activeGpaMetric.status === "NOT_APPLICABLE"
        ? "N/A"
        : (activeGpaMetric.value !== null ? activeGpaMetric.value.toFixed(2) : "—");

    const activePercentMetric = useMemo(() => {
        if (activeSem === "100") {
            if (analytics.percentage.value !== null) return analytics.percentage;
            if (analytics.averagePercentage.value !== null) return analytics.averagePercentage;
            return analytics.percentage;
        }
        if (activeGpaMetric.value !== null && programme.ordinance === "ORD_11") {
            return {
                value: Math.round(activeGpaMetric.value * 10 * 100) / 100,
                status: activeGpaMetric.status,
                sources: ["GGSIPU Ordinance 11, Clause 13"],
            };
        }
        const periodSummary = analytics.periodSummaries?.value?.find((p) => String(p.period) === activeSem);
        if (periodSummary?.averagePercentage !== null && periodSummary?.averagePercentage !== undefined) {
            return {
                value: periodSummary.averagePercentage,
                status: "RESULT_DERIVED" as const,
                sources: ["Period course marks normalized by subject maxima"],
            };
        }
        return analytics.percentage.value !== null ? analytics.percentage : analytics.averagePercentage;
    }, [activeSem, activeGpaMetric, analytics.percentage, analytics.averagePercentage, analytics.periodSummaries, programme.ordinance]);

    const displayPercentage = activePercentMetric.value !== null ? `${activePercentMetric.value.toFixed(2)}%` : "—";

    // Determine friendly labels based on active semester and academic framework
    const gpaLabel = (() => {
        if (activeSem === "100") return "Overall CGPA";
        if (programme.examinationSystem === "ANNUAL") return `Year ${activeSem} GPA`;
        return `Sem ${activeSem} SGPA`;
    })();

    const percentLabel = (() => {
        if (activeSem === "100") {
            return isPercentageFramework ? "Aggregate %" : "Equivalent %";
        }
        if (isPercentageFramework) {
            return programme.examinationSystem === "ANNUAL" ? `Year ${activeSem} %` : `Sem ${activeSem} %`;
        }
        return `Sem ${activeSem} Equivalent %`;
    })();

    const formulaSub = (() => {
        const isOrd11 = programme.ordinance === "ORD_11";
        if (activeSem === "100") {
            return isOrd11 ? "CGPA × 10 (Ordinance 11)" : (analytics.framework.value ?? "Statutory Regulations");
        }
        if (isOrd11) {
            return "SGPA × 10 (Ordinance 11)";
        }
        return programme.examinationSystem === "ANNUAL" ? `Year ${activeSem} marks` : `Semester ${activeSem} marks`;
    })();

    // Credits calculations
    const allKnownCredits = courses.filter((c) => c.credits.value !== null);
    const totalOfferedCredits = allKnownCredits.reduce((sum, c) => sum + (c.credits.value ?? 0), 0);
    const totalEarnedCredits = allKnownCredits
        .filter((c) => c.semantic === "PASS" || c.semantic === "CREDIT_SECURED" || c.semantic === "ALREADY_PASSED")
        .reduce((sum, c) => sum + (c.credits.value ?? 0), 0);

    const semKnownCredits = visibleCourses.filter((c) => c.credits.value !== null);
    const semOfferedCredits = semKnownCredits.reduce((sum, c) => sum + (c.credits.value ?? 0), 0);
    const semEarnedCredits = semKnownCredits
        .filter((c) => c.semantic === "PASS" || c.semantic === "CREDIT_SECURED" || c.semantic === "ALREADY_PASSED")
        .reduce((sum, c) => sum + (c.credits.value ?? 0), 0);

    // Backlogs
    const allBacklogs = courses.filter(
        (c) => c.semantic === "NOT_CLEARED" || c.semantic === "ABSENT" || c.semantic === "DETAINED"
    );
    const semBacklogs = visibleCourses.filter(
        (c) => c.semantic === "NOT_CLEARED" || c.semantic === "ABSENT" || c.semantic === "DETAINED"
    );
    const activeBacklogs = activeSem === "100" ? allBacklogs : semBacklogs;

    // Marks for active selection
    const semNumericCourses = visibleCourses.filter((c) => c.total !== undefined);
    const semPassedCourses = semNumericCourses.filter(
        (c) => c.semantic === "PASS" || c.semantic === "CREDIT_SECURED" || c.semantic === "ALREADY_PASSED"
    );
    const semObtainedMarks = semPassedCourses.reduce((sum, c) => sum + (c.total ?? 0), 0);
    const semTotalMaxMarks = visibleCourses.reduce((sum, c) => sum + (c.maxMarks ?? 100), 0);

    const hasCredits = allKnownCredits.length > 0;
    const earnedCreditsDisplay = activeSem === "100" ? totalEarnedCredits : semEarnedCredits;
    const offeredCreditsDisplay = activeSem === "100" ? totalOfferedCredits : semOfferedCredits;
    const hasBacklogs = activeBacklogs.length > 0;
    const backlogsCount = activeBacklogs.length;
    const backlogsSub = hasBacklogs
        ? (backlogsCount === 1 ? "1 backlog" : `${backlogsCount} backlogs`)
        : "all cleared";

    const profile = useMemo(() => fullResult?.stprofile, [fullResult?.stprofile]);

    if (loading && !fullResult) return <Skeleton />;

    return (
        <div className="relative min-h-screen bg-background text-foreground overflow-hidden">
            {/* Ambient background glow */}
            <div className="pointer-events-none absolute -top-32 -left-24 h-96 w-96 rounded-full bg-gold opacity-[0.06] blur-3xl" aria-hidden="true" />

            <AppNavbar profile={profile} />
            <CreditTipModal />

            <main id="main-content" className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">

                {/* Error Banner */}
                <AnimatePresence>
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="flex items-center gap-3 p-4 bg-grade-fail-surface border border-grade-fail-border rounded-md text-grade-fail text-xs font-mono font-bold"
                        >
                            <AlertTriangle size={14} />
                            {error}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Academic Engine Statutory Warnings */}
                {engine.warnings.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-3.5 sm:p-4 rounded-md bg-gold-surface border border-gold-border text-xs font-mono text-gold flex items-start gap-2.5 shadow-xs"
                    >
                        <AlertTriangle size={15} className="shrink-0 mt-0.5 text-gold" />
                        <div className="space-y-1">
                            {engine.warnings.map((w, idx) => (
                                <p key={idx} className="leading-relaxed font-medium">{w.message}</p>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* Profile & Overview Stats */}
                {profile && (
                    <motion.section
                        initial="hidden"
                        animate="show"
                        variants={{
                            hidden: {},
                            show: { transition: { staggerChildren: 0.07 } },
                        }}
                        className="grid grid-cols-1 lg:grid-cols-3 gap-4"
                    >
                        {/* Profile Card */}
                        <motion.div
                            variants={{
                                hidden: { opacity: 0, y: 20 },
                                show: { opacity: 1, y: 0 },
                            }}
                            className="lg:col-span-1 bg-surface border border-border-strong rounded-lg p-5 sm:p-6 flex flex-col justify-between gap-5 hover:border-gold-border transition-all duration-200 shadow-xs"
                        >
                            <div>
                                <div className="flex items-start gap-3 mb-4">
                                    <PixelAvatar name={profile.stname ?? "?"} />
                                    <div className="min-w-0">
                                        <h1 className="text-sm font-bold text-foreground leading-snug">{profile.stname}</h1>
                                        <p className="text-foreground-secondary text-[11px] font-mono font-medium mt-1 leading-relaxed">{profile.prgname}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-md overflow-hidden border border-border-strong text-xs font-mono">
                                {[
                                    { label: "Enrollment", value: profile.nrollno, color: "text-cat-teal" },
                                    { label: "Batch", value: profile.byoa, color: "text-foreground-secondary font-semibold" },
                                    { label: "Program", value: profile.prgcode, color: "text-foreground-secondary font-semibold" },
                                    { label: "Institute", value: profile.iname, color: "text-foreground-secondary font-semibold", truncate: true },
                                ].map((item, i, arr) => (
                                    <div
                                        key={item.label}
                                        className={`flex justify-between items-center px-3 py-2.5 bg-surface-deep ${i < arr.length - 1 ? "border-b border-border-strong" : ""}`}
                                    >
                                        <span className="text-foreground-secondary text-[10px] uppercase tracking-wider font-bold">{item.label}</span>
                                        <span className={`${item.color} font-semibold ${item.truncate ? "max-w-36 truncate text-right" : ""}`} title={item.truncate ? item.value : undefined}>
                                            {item.value}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </motion.div>

                        {/* Stat Cards Grid */}
                        <div className="lg:col-span-2 grid grid-cols-2 gap-3 sm:gap-4">
                            {[
                                {
                                    label: gpaLabel,
                                    value: displayGpa,
                                    sub: activeGpaMetric.status === "NOT_APPLICABLE" ? "Percentage scheme" : "out of 10.00",
                                    color: "text-cat-violet",
                                    icon: <BarChart2 size={13} className="text-cat-violet opacity-70" />,
                                    provenance: activeGpaMetric.status,
                                    tooltip: activeGpaMetric.reason ?? "Derived from semester course marks and credits using Ordinance formula.",
                                },
                                {
                                    label: percentLabel,
                                    value: displayPercentage,
                                    sub: formulaSub,
                                    color: "text-cat-blue",
                                    icon: <Percent size={13} className="text-cat-blue opacity-70" />,
                                    provenance: activePercentMetric.status,
                                    tooltip: activePercentMetric.reason ?? "Percentage derived under university regulations.",
                                },
                                {
                                    label: hasCredits ? "Credits Earned" : "Courses Cleared",
                                    value: hasCredits ? String(earnedCreditsDisplay) : String(semPassedCourses.length),
                                    valueSuffix: hasCredits ? ` / ${offeredCreditsDisplay}` : ` / ${visibleCourses.length}`,
                                    sub: (() => {
                                        if (hasCredits) {
                                            return activeSem === "100" ? "overall degree credits" : `Semester ${activeSem} credits`;
                                        }
                                        if (activeSem === "100") return "total courses cleared";
                                        return programme.examinationSystem === "ANNUAL" ? `Year ${activeSem} cleared` : `Semester ${activeSem} cleared`;
                                    })(),
                                    color: "text-cat-teal",
                                    icon: <BookOpen size={13} className="text-cat-teal opacity-70" />,
                                    provenance: "RESULT_DERIVED" as const,
                                    tooltip: hasCredits
                                        ? "Credits earned across cleared course examinations."
                                        : "Count of cleared courses in examination result.",
                                },
                                {
                                    label: "Status",
                                    value: hasBacklogs ? String(backlogsCount) : "✓",
                                    sub: backlogsSub,
                                    color: hasBacklogs ? "text-grade-fail" : "text-grade-excellent",
                                    icon: hasBacklogs
                                        ? <AlertTriangle size={13} className="text-grade-fail opacity-80" />
                                        : <CheckCircle2 size={13} className="text-grade-excellent opacity-80" />,
                                    bgClass: hasBacklogs
                                        ? "bg-grade-fail-surface border-grade-fail-border"
                                        : "bg-grade-excellent-surface border-grade-excellent-border",
                                    provenance: "RESULT_DERIVED" as const,
                                    tooltip: "Subject clearance evaluated from official result status.",
                                },
                            ].map((card) => (
                                <motion.div
                                    key={card.label}
                                    variants={{
                                        hidden: { opacity: 0, y: 20 },
                                        show: { opacity: 1, y: 0 },
                                    }}
                                    whileHover={{ scale: 1.015, transition: { duration: 0.15 } }}
                                    className={`bg-surface border border-border-strong hover:border-gold-border transition-all duration-200 shadow-xs rounded-lg p-4 sm:p-5 flex flex-col justify-between cursor-default ${card.bgClass ?? ""}`}
                                >
                                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                                        <span className="text-[10px] font-mono uppercase tracking-widest text-foreground-secondary font-bold truncate">
                                            {card.label}
                                        </span>
                                        {card.icon}
                                    </div>
                                    <div>
                                        <div className={`text-2xl sm:text-4xl font-bold font-mono ${card.color}`}>
                                            {card.value}
                                            {card.valueSuffix && (
                                                <span className="text-sm sm:text-xl text-foreground-secondary font-semibold">{card.valueSuffix}</span>
                                            )}
                                        </div>
                                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between items-start gap-1.5 sm:gap-2 mt-1.5 sm:mt-2">
                                            <span className="text-[10px] text-foreground-secondary font-mono font-medium truncate w-full sm:w-auto">
                                                {card.sub}
                                            </span>
                                            <div className="shrink-0">
                                                <ProvenanceChip state={card.provenance} tooltip={card.tooltip} />
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.section>
                )}

                {/* Semester Tabs */}
                <motion.section
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                    <div className="flex sm:inline-flex items-center justify-between sm:justify-start gap-0.5 sm:gap-0.5 bg-surface-deep border border-border-strong rounded-md p-1 w-full sm:w-auto overflow-x-auto">
                        {availableSemesters.map((sem) => (
                            <button
                                key={sem.value}
                                onClick={() => {
                                    setActiveSem(sem.value);
                                }}
                                disabled={loading}
                                className={`relative flex-1 sm:flex-none text-center px-1.5 sm:px-3.5 py-1.5 text-[11px] sm:text-xs font-mono font-semibold transition-colors duration-100 disabled:opacity-40 rounded-sm cursor-pointer ${activeSem === sem.value
                                    ? "text-background font-bold"
                                    : "text-foreground-secondary hover:text-foreground"
                                    }`}
                            >
                                {activeSem === sem.value && (
                                    <motion.span
                                        layoutId="tab-bg"
                                        className="absolute inset-0 bg-gold rounded-sm"
                                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                    />
                                )}
                                <span className="relative z-10">{sem.label}</span>
                            </button>
                        ))}
                    </div>

                    <Link
                        href="/dashboard/analytics"
                        title="Go to Analytics & PDF Export"
                        className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-border-strong bg-surface text-xs font-mono font-semibold text-foreground-secondary hover:text-gold hover:border-gold-border transition-colors duration-200 shadow-xs cursor-pointer shrink-0"
                    >
                        <FileDown size={13} className="text-chart-cyan" />
                        <span>Download Marksheet</span>
                        <ArrowRight size={12} className="opacity-70" />
                    </Link>
                </motion.section>

                {/* Results Table */}
                <motion.section
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 mb-3">
                        <div className="flex items-center justify-between sm:justify-start gap-2 w-full sm:w-auto">
                            <div className="flex items-center gap-2">
                                <span className="px-2.5 py-1 rounded-md bg-surface-deep border border-border-strong text-xs font-mono font-bold text-foreground tracking-wider uppercase shadow-sm">
                                    {activeSem === "100" ? "All Semesters" : `Semester ${activeSem}`}
                                </span>
                                <span className="px-2.5 py-1 rounded-md bg-cat-teal-surface border border-cat-teal-border text-xs font-mono font-bold text-cat-teal shadow-sm">
                                    {visibleCourses.length} subjects
                                </span>
                            </div>
                            <span className="sm:hidden text-[10px] font-mono text-foreground-muted italic shrink-0">Scroll sideways →</span>
                        </div>

                        <div className="flex items-center gap-1.5 text-[11px] font-mono text-gold bg-gold-surface border border-gold-border px-2.5 py-1 rounded-md shadow-sm w-full sm:w-auto">
                            <Pencil size={11} className="animate-pulse shrink-0" />
                            <span>Click any credit value to edit & recalculate</span>
                        </div>
                    </div>

                    <div className="bg-surface border border-border-strong rounded-lg hover:border-gold-border/80 transition-all duration-200 shadow-xs">
                        <AnimatePresence mode="wait">
                            {visibleCourses && visibleCourses.length > 0 ? (
                                <motion.div
                                    key={activeSem}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="overflow-x-auto rounded-lg"
                                >
                                    <table className="w-full">
                                        <caption className="sr-only">Detailed Subject Results and Grades</caption>
                                        <thead>
                                            <tr className="bg-surface-deep border-b border-border-strong">
                                                {["Sem", "Code", "Subject", "Int.", "Ext.", "Total", "Credits", "Grade", "Status"].map((h) => (
                                                    <th
                                                        key={h}
                                                        className={`px-4 py-3 text-[10px] font-mono uppercase tracking-widest ${h === "Credits" ? "text-gold font-bold" : "text-foreground-secondary font-bold"} ${["Int.", "Ext.", "Total", "Credits", "Grade", "Status"].includes(h) ? "text-center" : "text-left"}`}
                                                    >
                                                        {h === "Credits" ? (
                                                            <Tooltip content="Click any value in this column to adjust credits & recalculate" position="top">
                                                                <span className="inline-flex items-center justify-center gap-1 cursor-help">
                                                                    Credits <Pencil size={9} />
                                                                </span>
                                                            </Tooltip>
                                                        ) : h}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {visibleCourses.map((c, idx) => {
                                                const status = STATUS_LABEL[c.semantic] ?? STATUS_LABEL.UNKNOWN;
                                                const isPassed = c.semantic === "PASS" || c.semantic === "CREDIT_SECURED" || c.semantic === "ALREADY_PASSED";
                                                const themeClasses = getGradeThemeClasses(c.grade?.value ?? "");

                                                return (
                                                    <motion.tr
                                                        key={`${c.period}-${c.rawCode}-${idx}`}
                                                        initial={{ opacity: 0, x: -6 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: Math.min(idx * 0.02, 0.25), duration: 0.2 }}
                                                        className="border-b border-border-strong/40 last:border-0 hover:bg-surface-elevated/80 hover:border-gold-border/40 transition-colors duration-150"
                                                    >
                                                        <td className="px-4 py-3.5 text-xs font-mono text-foreground-secondary font-medium">{c.period}</td>
                                                        <td className="px-4 py-3.5 text-xs font-mono font-bold text-gold">{c.rawCode}</td>
                                                        <td className="px-4 py-3.5 text-sm font-medium text-foreground flex items-center gap-2">
                                                            <span>{c.name}</span>
                                                            {(c.name.toUpperCase().includes("LAB") || c.name.toUpperCase().includes("PRACTICAL")) && (
                                                                <span className="text-[9px] font-mono font-bold text-cat-teal bg-cat-teal-surface border border-cat-teal-border px-1.5 py-0.5 rounded-sm tracking-wider uppercase">
                                                                    LAB
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="px-4 py-3.5 text-xs font-mono text-center text-foreground-secondary font-medium">{c.internal ?? "–"}</td>
                                                        <td className="px-4 py-3.5 text-xs font-mono text-center text-foreground-secondary font-medium">{c.external ?? "–"}</td>
                                                        <td className="px-4 py-3.5 text-xs font-mono text-center font-bold text-foreground">
                                                            {c.rawTotal || (c.total !== undefined ? String(c.total) : "–")}
                                                            {c.maxMarks !== null && c.rawTotal && c.total !== undefined && (
                                                                <span className="ml-1 text-[9px] text-foreground-muted font-normal">/ {c.maxMarks}</span>
                                                            )}
                                                        </td>
                                                        <td className="px-4 py-3.5 text-center">
                                                            <CreditInputCell
                                                                paperCode={c.rawCode}
                                                                courseName={c.name}
                                                                creditValue={c.credits.value}
                                                                isPassed={isPassed}
                                                                onSetCredit={(code, val) => setCustomCredit(code, val)}
                                                            />
                                                        </td>
                                                        <td className="px-4 py-3.5 text-center">
                                                            {c.grade ? (
                                                                <Tooltip content={c.grade.value === "Distinction" ? "More than 75% in the course qualifies for distinction under Ordinance 15." : "Letter grade determined by the applicable GGSIPU ordinance."} position="top">
                                                                    <span className={`inline-flex items-center justify-center min-w-9 px-1.5 h-6 rounded-sm border font-mono text-[11px] font-bold cursor-help ${themeClasses}`}>
                                                                        {c.grade.value}
                                                                    </span>
                                                                </Tooltip>
                                                            ) : (
                                                                <Tooltip content={analytics.grade.reason ?? "A letter-grade table is not applicable to this programme."} position="top">
                                                                    <span className="text-[10px] font-mono text-foreground-muted cursor-help">–</span>
                                                                </Tooltip>
                                                            )}
                                                        </td>
                                                        <td className="px-4 py-3.5 text-center">
                                                            <div className="inline-flex items-center justify-center gap-1.5">
                                                                <span className={`text-[10px] font-mono font-bold uppercase tracking-wider ${status.className}`}>
                                                                    {status.label}
                                                                </span>
                                                                {c.ruleCheck === "FAIL" && isPassed && (
                                                                    <Tooltip content="Displayed marks are below the loaded programme pass threshold, while ExamWeb reports PASS. Raw result is preserved; verify the official marksheet." position="top">
                                                                        <AlertTriangle size={11} className="text-gold cursor-help" aria-label="Rule mismatch" />
                                                                    </Tooltip>
                                                                )}
                                                            </div>
                                                        </td>
                                                    </motion.tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="empty"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="p-12 text-center text-foreground-secondary text-xs font-mono font-semibold"
                                >
                                    No results found for this selection.
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </motion.section>

                {/* Summary Bar */}
                <AnimatePresence>
                    {visibleCourses && visibleCourses.length > 0 && (
                        <motion.section
                            key="summary"
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 12 }}
                            transition={{ duration: 0.3 }}
                            className="bg-surface border border-border-strong rounded-lg overflow-hidden hover:border-gold-border/80 transition-all duration-200 shadow-xs relative z-20"
                        >
                            <div className={`bg-surface-deep ${activeBacklogs.length > 0 ? "border-b border-border-strong" : ""} px-5 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3`}>
                                <div>
                                    <div className="text-[10px] font-mono uppercase tracking-widest text-foreground-secondary font-bold mb-1">
                                        {activeSem === "100" ? "Overall Summary" : `Semester ${activeSem} Summary`}
                                    </div>
                                    {activeBacklogs.length > 0 ? (
                                        <div className="flex items-center gap-1.5 text-xs font-mono text-foreground font-medium">
                                            <AlertTriangle size={13} className="text-grade-fail shrink-0" />
                                            <span>
                                                <strong className="text-grade-fail font-bold">{activeBacklogs.length}</strong> backlog subject{activeBacklogs.length > 1 ? "s" : ""} detected
                                            </span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-1.5 text-grade-excellent text-xs font-mono font-bold">
                                            <CheckCircle2 size={13} className="shrink-0" />
                                            All subjects cleared
                                        </div>
                                    )}
                                </div>

                                <div className="flex flex-wrap gap-2.5">
                                    {[
                                        {
                                            label: activeSem === "100" ? "CGPA" : "SGPA",
                                            value: displayGpa,
                                            containerClass: "bg-cat-violet-surface/50 border-cat-violet-border",
                                            labelClass: "text-cat-violet",
                                            valueClass: "text-foreground",
                                        },
                                        {
                                            label: "Credits",
                                            value: activeSem === "100"
                                                ? `${totalEarnedCredits}/${totalOfferedCredits}`
                                                : `${semEarnedCredits}/${semOfferedCredits}`,
                                            containerClass: "bg-cat-teal-surface/50 border-cat-teal-border",
                                            labelClass: "text-cat-teal",
                                            valueClass: "text-foreground",
                                        },
                                        {
                                            label: "Marks",
                                            value: `${semObtainedMarks}/${semTotalMaxMarks}`,
                                            containerClass: "bg-cat-pink-surface/50 border-cat-pink-border",
                                            labelClass: "text-cat-pink",
                                            valueClass: "text-foreground",
                                        },
                                        {
                                            label: "Equiv.",
                                            value: displayPercentage,
                                            containerClass: "bg-cat-blue-surface/50 border-cat-blue-border",
                                            labelClass: "text-cat-blue",
                                            valueClass: "text-foreground",
                                        },
                                    ].map((pill) => (
                                        <div
                                            key={pill.label}
                                            className={`flex items-center gap-2.5 border px-4 py-2 rounded-md shadow-sm backdrop-blur-sm ${pill.containerClass}`}
                                        >
                                            <span className={`text-[10px] font-mono uppercase tracking-widest font-bold ${pill.labelClass}`}>
                                                {pill.label}
                                            </span>
                                            <span className={`text-base font-bold font-mono tracking-tight ${pill.valueClass}`}>
                                                {pill.value}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {activeBacklogs.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="px-5 py-3.5 border-t border-border-strong space-y-2.5 bg-surface-deep/60"
                                >
                                    <div className="text-[11px] font-mono text-foreground-secondary flex items-center gap-2 font-medium">
                                        <AlertTriangle size={13} className="text-grade-fail shrink-0" />
                                        <span>Backlog papers carry 0 earned credits until cleared in re-appear examinations:</span>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {activeBacklogs.map((c, i) => (
                                            <div
                                                key={i}
                                                className="text-xs font-mono px-3 py-1.5 rounded bg-surface border border-border-strong flex items-center gap-2.5 shadow-xs"
                                            >
                                                <span className="font-bold text-gold">{c.rawCode}</span>
                                                <span className="text-foreground font-medium">{c.name}</span>
                                                <span className="text-[10px] font-bold text-grade-fail bg-grade-fail-surface border border-grade-fail-border px-1.5 py-0.5 rounded shrink-0">
                                                    Backlog (0 pts)
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </motion.section>
                    )}
                </AnimatePresence>

                {/* View Full Analytics Button */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex justify-center pt-2"
                >
                    <motion.button
                        whileHover={{ scale: 1.03, y: -1 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => router.push("/dashboard/analytics")}
                        className="px-6 py-3 bg-white text-black font-mono text-xs font-bold rounded-sm shadow-[0_0_20px_rgba(255,255,255,0.2)] flex items-center justify-center gap-3 hover:bg-neutral-200 transition-all group cursor-pointer border border-white uppercase tracking-wider"
                    >
                        <BarChart2 size={15} />
                        <span>View Full Analytics</span>
                        <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform duration-200" />
                    </motion.button>
                </motion.div>

                {/* Academic Regulation Policy & Statutory Provenance */}
                <section className="pt-8 border-t border-border-strong" aria-label="Academic Regulations and Policy">
                    <ExplanationPanel engine={engine} />
                </section>

            </main>
        </div>
    );
}