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
import { getFallbackCredit, getGradeAndPoints, getGradeThemeClasses, getResultState } from "@/helpers/grade-system";
import PixelAvatar from "@/components/dashboard/PixelAvatar";
import CreditTipModal from "@/components/dashboard/CreditTipModal";
import { ApiErrorResponse, ApiSuccessResponse } from "@/types/ApiResponse";

const SEMESTERS = [
    { label: "All", value: "100" },
    { label: "I", value: "1" },
    { label: "II", value: "2" },
    { label: "III", value: "3" },
    { label: "IV", value: "4" },
    { label: "V", value: "5" },
    { label: "VI", value: "6" },
    { label: "VII", value: "7" },
    { label: "VIII", value: "8" },
];

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
            setFullResult(res.data.data);
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

    const allResults = useMemo(() => fullResult?.stresult ?? [], [fullResult?.stresult]);

    const filteredResults = useMemo(() => {
        return allResults.filter(
            (result) => activeSem === "100" || result[0] === Number(activeSem)
        );
    }, [allResults, activeSem]);

    const computeStats = useCallback((rows: any[][]) => {
        let weightedPoints = 0;
        let totalCredits = 0;
        let earnedCredits = 0;
        let backlogs = 0;
        let obtainedMarks = 0;
        let totalMaxMarks = 0;

        rows.forEach((row) => {
            const rawTotal = row[5];
            const statusCode = row[6];
            const paperCode = row[1];
            const subjectTitle = row[2];
            const credit = customCredit[paperCode] ?? getFallbackCredit(subjectTitle);

            const resultState = getResultState(statusCode, rawTotal);
            const { points, pass } = getGradeAndPoints(rawTotal);

            const isPassed = resultState === "CLEARED" || (resultState !== "BACK" && resultState !== "ABSENT" && resultState !== "DETAINED" && pass);
            const effectivePoints = isPassed ? points : 0;
            weightedPoints += credit * effectivePoints;
            totalCredits += credit;

            const numericTotal = Number(rawTotal);
            obtainedMarks += isPassed && !isNaN(numericTotal) ? numericTotal : 0;
            totalMaxMarks += 100;

            if (isPassed) {
                earnedCredits += credit;
            } else {
                backlogs += 1;
            }
        });

        const gpa = totalCredits > 0 ? weightedPoints / totalCredits : 0;
        return { gpa, totalCredits, earnedCredits, backlogs, obtainedMarks, totalMaxMarks };
    }, [customCredit]);

    const semStats = useMemo(() => computeStats(filteredResults), [computeStats, filteredResults]);
    const overallStats = useMemo(() => computeStats(allResults), [computeStats, allResults]);

    const activeGpa = activeSem === "100" ? overallStats.gpa : semStats.gpa;
    const gpaLabel = activeSem === "100" ? "Overall CGPA" : `Sem ${activeSem} SGPA`;
    const percentLabel = activeSem === "100" ? "Equivalent %" : `Sem ${activeSem} Equivalent %`;
    const formulaSub = activeSem === "100" ? "CGPA × 10 (Ordinance 11)" : "SGPA × 10 (Ordinance 11)";

    const displayGpa = useMemo(() => activeGpa.toFixed(2), [activeGpa]);
    const displayPercentage = useMemo(() => (activeGpa * 10).toFixed(2), [activeGpa]);

    const profile = useMemo(() => fullResult?.stprofile, [fullResult?.stprofile]);

    if (loading && !fullResult) return <Skeleton />;

    return (
        <div className="relative min-h-screen bg-background text-foreground overflow-hidden">
            {/* Ambient background glow */}
            <div className="pointer-events-none absolute -top-32 -left-24 h-96 w-96 rounded-full bg-gold opacity-[0.06] blur-3xl" aria-hidden="true" />

            <AppNavbar profile={profile} />
            <CreditTipModal />

            <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">

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
                                    sub: "out of 10.00",
                                    color: "text-cat-violet",
                                    icon: <BarChart2 size={13} className="text-cat-violet opacity-70" />,
                                },
                                {
                                    label: percentLabel,
                                    value: `${displayPercentage}%`,
                                    sub: formulaSub,
                                    color: "text-cat-blue",
                                    icon: <Percent size={13} className="text-cat-blue opacity-70" />,
                                },
                                {
                                    label: "Credits Earned",
                                    value: `${overallStats.earnedCredits}`,
                                    valueSuffix: ` / ${overallStats.totalCredits}`,
                                    sub: "overall",
                                    color: "text-cat-teal",
                                    icon: <BookOpen size={13} className="text-cat-teal opacity-70" />,
                                },
                                {
                                    label: "Status",
                                    value: overallStats.backlogs > 0 ? String(overallStats.backlogs) : "✓",
                                    sub: overallStats.backlogs > 0 ? `backlog${overallStats.backlogs > 1 ? "s" : ""}` : "all cleared",
                                    color: overallStats.backlogs > 0 ? "text-grade-fail" : "text-grade-excellent",
                                    icon: overallStats.backlogs > 0
                                        ? <AlertTriangle size={13} className="text-grade-fail opacity-80" />
                                        : <CheckCircle2 size={13} className="text-grade-excellent opacity-80" />,
                                    bgClass: overallStats.backlogs > 0
                                        ? "bg-grade-fail-surface border-grade-fail-border"
                                        : "bg-grade-excellent-surface border-grade-excellent-border",
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
                                        <span className="text-[10px] font-mono uppercase tracking-widest text-foreground-secondary font-bold truncate pr-1">{card.label}</span>
                                        {card.icon}
                                    </div>
                                    <div>
                                        <div className={`text-2xl sm:text-4xl font-bold font-mono ${card.color}`}>
                                            {card.value}
                                            {card.valueSuffix && (
                                                <span className="text-sm sm:text-xl text-foreground-secondary font-semibold">{card.valueSuffix}</span>
                                            )}
                                        </div>
                                        <div className="text-[10px] text-foreground-secondary font-mono font-medium mt-1.5 sm:mt-2 truncate">{card.sub}</div>
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
                    <div className="flex sm:inline-flex items-center justify-between sm:justify-start gap-0.5 sm:gap-0.5 bg-surface-deep border border-border-strong rounded-md p-1 w-full sm:w-auto">
                        {SEMESTERS.map((sem) => (
                            <button
                                key={sem.value}
                                onClick={() => setActiveSem(sem.value)}
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
                                    {filteredResults?.length ?? 0} subjects
                                </span>
                            </div>
                            <span className="sm:hidden text-[10px] font-mono text-foreground-muted italic shrink-0">Scroll sideways →</span>
                        </div>

                        <div className="flex items-center gap-1.5 text-[11px] sm:text-[11px] font-mono text-gold bg-gold-surface border border-gold-border px-2.5 py-1 rounded-md shadow-sm w-full sm:w-auto">
                            <Pencil size={11} className="animate-pulse shrink-0" />
                            <span>Click any credit value to edit & recalculate GPA</span>
                        </div>
                    </div>

                    <div className="bg-surface border border-border-strong rounded-lg overflow-hidden hover:border-gold-border/80 transition-all duration-200 shadow-xs">
                        <AnimatePresence mode="wait">
                            {filteredResults && filteredResults.length > 0 ? (
                                <motion.div
                                    key={activeSem}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="overflow-x-auto"
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
                                                            <span className="inline-flex items-center justify-center gap-1" title="Click input values in this column to adjust credits">
                                                                Credits <Pencil size={9} />
                                                            </span>
                                                        ) : h}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredResults.map((row, idx) => {
                                                const rawTotal = row[5];
                                                const statusCode = row[6];
                                                const resultState = getResultState(statusCode, rawTotal);
                                                const gradeInfo = getGradeAndPoints(rawTotal);
                                                const themeClasses = getGradeThemeClasses(gradeInfo.grade);
                                                const paperCode = row[1];
                                                const subjectTitle = row[2];
                                                const currentCredit = customCredit[paperCode] ?? getFallbackCredit(subjectTitle);
                                                const isPassed = resultState === "CLEARED" || (resultState !== "BACK" && resultState !== "ABSENT" && resultState !== "DETAINED" && gradeInfo.pass);

                                                return (
                                                    <motion.tr
                                                        key={idx}
                                                        initial={{ opacity: 0, x: -6 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: idx * 0.025, duration: 0.25 }}
                                                        className="border-b border-border-strong/40 last:border-0 hover:bg-surface-elevated/80 hover:border-gold-border/40 transition-colors duration-150"
                                                    >
                                                        <td className="px-4 py-3.5 text-xs font-mono text-foreground-secondary font-medium">{row[0]}</td>
                                                        <td className="px-4 py-3.5 text-xs font-mono font-bold text-gold">{paperCode}</td>
                                                        <td className="px-4 py-3.5 text-sm font-medium text-foreground flex items-center gap-2">
                                                            <span>{subjectTitle}</span>
                                                            {(subjectTitle.toUpperCase().includes("LAB") || subjectTitle.toUpperCase().includes("PRACTICAL")) && (
                                                                <span className="text-[9px] font-mono font-bold text-cat-teal bg-cat-teal-surface border border-cat-teal-border px-1.5 py-0.5 rounded-sm tracking-wider uppercase">
                                                                    LAB
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="px-4 py-3.5 text-xs font-mono text-center text-foreground-secondary font-medium">{row[3] || "–"}</td>
                                                        <td className="px-4 py-3.5 text-xs font-mono text-center text-foreground-secondary font-medium">{row[4] || "–"}</td>
                                                        <td className="px-4 py-3.5 text-xs font-mono text-center font-bold text-foreground">{row[5] || "–"}</td>
                                                        <td className="px-4 py-3.5 text-center">
                                                            <input
                                                                type="number"
                                                                min={0}
                                                                max={10}
                                                                value={currentCredit}
                                                                aria-label={`Edit credit value for ${subjectTitle}`}
                                                                title="Click to edit credits for custom GPA calculation"
                                                                onKeyDown={(e) => {
                                                                    if (e.key === "ArrowUp" || e.key === "ArrowDown") {
                                                                        e.preventDefault();
                                                                    }
                                                                }}
                                                                onWheel={(e) => (e.target as HTMLInputElement).blur()}
                                                                onChange={(e) => setCustomCredit(paperCode, Number(e.target.value))}
                                                                className="w-10 text-center bg-surface-deep border border-border-strong hover:border-gold/60 focus:border-gold focus:ring-1 focus:ring-gold/30 rounded-sm py-0.5 font-mono text-xs font-bold text-foreground outline-none transition-all cursor-pointer focus:cursor-text [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                            />
                                                            {!isPassed && (
                                                                <div className="text-[9px] font-mono text-grade-fail font-semibold mt-0.5" title="Backlog: 0 credits earned until cleared">
                                                                    0 earned
                                                                </div>
                                                            )}
                                                        </td>
                                                        <td className="px-4 py-3.5 text-center">
                                                            <span className={`inline-flex items-center justify-center min-w-9 px-1.5 h-6 rounded-sm border font-mono text-[11px] font-bold ${themeClasses}`}>
                                                                {gradeInfo.grade}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3.5 text-center">
                                                            <span className={`text-[10px] font-mono font-bold uppercase tracking-wider ${
                                                                resultState === "CLEARED" ? "text-grade-excellent" :
                                                                resultState === "ABSENT" ? "text-foreground-muted" :
                                                                resultState === "DETAINED" ? "text-grade-fail" :
                                                                "text-grade-fail"
                                                            }`}>
                                                                {resultState === "CLEARED" ? "Pass" :
                                                                 resultState === "ABSENT" ? "Absent" :
                                                                 resultState === "DETAINED" ? "Detained" : "Back"}
                                                            </span>
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
                    {filteredResults && filteredResults.length > 0 && (
                        <motion.section
                            key="summary"
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 12 }}
                            transition={{ duration: 0.3 }}
                            className="bg-surface border border-border-strong rounded-lg overflow-hidden hover:border-gold-border/80 transition-all duration-200 shadow-xs"
                        >
                            <div className="bg-surface-deep border-b border-border-strong px-5 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div>
                                    <div className="text-[10px] font-mono uppercase tracking-widest text-foreground-secondary font-bold mb-1">
                                        {activeSem === "100" ? "Overall Summary" : `Semester ${activeSem} Summary`}
                                    </div>
                                    {semStats.backlogs > 0 ? (
                                        <div className="flex items-center gap-1.5 text-xs font-mono text-foreground font-medium">
                                            <AlertTriangle size={13} className="text-grade-fail shrink-0" />
                                            <span>
                                                <strong className="text-grade-fail font-bold">{semStats.backlogs}</strong> backlog subject{semStats.backlogs > 1 ? "s" : ""} detected
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
                                            value: `${semStats.earnedCredits}/${semStats.totalCredits}`,
                                            containerClass: "bg-cat-teal-surface/50 border-cat-teal-border",
                                            labelClass: "text-cat-teal",
                                            valueClass: "text-foreground",
                                        },
                                        {
                                            label: "Marks",
                                            value: `${semStats.obtainedMarks}/${semStats.totalMaxMarks}`,
                                            containerClass: "bg-cat-pink-surface/50 border-cat-pink-border",
                                            labelClass: "text-cat-pink",
                                            valueClass: "text-foreground",
                                        },
                                        {
                                            label: "Equiv.",
                                            value: `${displayPercentage}%`,
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

                            {semStats.backlogs > 0 && (
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
                                        {filteredResults
                                            .filter((row) => !getGradeAndPoints(Number(row[5])).pass)
                                            .map((row, i) => (
                                                <div
                                                    key={i}
                                                    className="text-xs font-mono px-3 py-1.5 rounded bg-surface border border-border-strong flex items-center gap-2.5 shadow-xs"
                                                >
                                                    <span className="font-bold text-gold">{row[1]}</span>
                                                    <span className="text-foreground font-medium">{row[2]}</span>
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

            </main>
        </div>
    );
}