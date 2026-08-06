"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, AlertTriangle, CheckCircle2, Percent, BarChart2, BookOpen, Pencil, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import Skeleton from "@/components/dashboard/Skeleton";
import Navbar from "@/components/dashboard/Navbar";
import useResultStore from "@/store/result-store";
import { ResultData } from "@/types/result";
import { getDefaultCredit, getGradeAndPoints, getGradeThemeClasses } from "@/helpers/grade-system";
import PixelAvatar from "@/components/dashboard/PixelAvatar";

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
    const customCredit = useResultStore((state) => state.customCredits);
    const setCustomCredit = useResultStore((state) => state.setCustomCredit);

    const fetchResults = async () => {
        setLoading(true);
        setError("");
        try {
            const res = await axios.get<ResultData>(`/api/result?euno=100`);
            setFullResult(res.data);
        } catch (err: any) {
            const status = err.response?.status;
            const expired = err.response?.data?.expired;
            if (status === 401 || expired) {
                toast.error("Session expired. Please sign in again.");
                router.push("/login");
                return;
            } else {
                toast.error(err.response?.data?.error || "Failed to load results");
            }
            setError("Failed to load results");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchResults();
    }, []);

    const filteredResults = fullResult?.stresult?.filter(
        (result) => activeSem === "100" || result[0] === Number(activeSem)
    );

    const allResults = fullResult?.stresult ?? [];

    function computeStats(rows: any[][]) {
        let weightedPoints = 0;
        let totalCredits = 0;
        let earnedCredits = 0;
        let backlogs = 0;
        let obtainedMarks = 0;
        let totalMaxMarks = 0;

        rows.forEach((row) => {
            const rawTotal = Number(row[5]);
            const total = isNaN(rawTotal) ? 0 : rawTotal;
            const paperCode = row[1];
            const subjectTitle = row[2];
            const credit = customCredit[paperCode] ?? getDefaultCredit(subjectTitle);
            const { points, pass } = getGradeAndPoints(total);

            const effectivePoints = pass ? points : 0;
            weightedPoints += credit * effectivePoints;
            totalCredits += credit;
            obtainedMarks += pass ? total : 0;
            totalMaxMarks += 100;

            if (pass) {
                earnedCredits += credit;
            } else {
                backlogs += 1;
            }
        });

        const gpa = totalCredits > 0 ? weightedPoints / totalCredits : 0;
        return { gpa, totalCredits, earnedCredits, backlogs, obtainedMarks, totalMaxMarks };
    }

    const semStats = computeStats(filteredResults ?? []);
    const overallStats = computeStats(allResults);

    const sgpa = semStats.gpa.toFixed(2);
    const cgpa = overallStats.gpa.toFixed(2);
    const percentage = (overallStats.gpa * 9.5).toFixed(2);

    if (loading && !fullResult) return <Skeleton />;

    const profile = fullResult?.stprofile;

    return (
        <div className="min-h-screen bg-background text-foreground">

            <Navbar profile={profile} />

            <main className="max-w-7xl mx-auto px-6 py-8 space-y-6">

                {/* Error Banner */}
                <AnimatePresence>
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="flex items-center gap-3 p-4 bg-grade-fail-surface border border-grade-fail-border rounded-md text-grade-fail text-xs font-mono"
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
                            className="lg:col-span-1 bg-surface border border-border-strong rounded-lg p-6 flex flex-col justify-between gap-5"
                        >
                            <div>
                                <div className="flex items-start gap-3 mb-4">
                                    <PixelAvatar name={profile.stname ?? "?"} />
                                    <div className="min-w-0">
                                        <h1 className="text-sm font-bold text-foreground leading-snug">{profile.stname}</h1>
                                        <p className="text-foreground-muted text-[11px] font-mono mt-1 leading-relaxed">{profile.prgname}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-md overflow-hidden border border-border text-xs font-mono">
                                {[
                                    { label: "Enrollment", value: profile.nrollno, color: "text-cat-teal" },
                                    { label: "Batch", value: profile.byoa, color: "text-foreground-secondary" },
                                    { label: "Program", value: profile.prgcode, color: "text-foreground-secondary" },
                                    { label: "Institute", value: profile.iname, color: "text-foreground-secondary", truncate: true },
                                ].map((item, i, arr) => (
                                    <div
                                        key={item.label}
                                        className={`flex justify-between items-center px-3 py-2.5 bg-surface-deep ${i < arr.length - 1 ? "border-b border-border" : ""}`}
                                    >
                                        <span className="text-foreground-muted text-[10px] uppercase tracking-wider">{item.label}</span>
                                        <span className={`${item.color} font-semibold ${item.truncate ? "max-w-36 truncate text-right" : ""}`} title={item.truncate ? item.value : undefined}>
                                            {item.value}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </motion.div>

                        {/* Stat Cards Grid */}
                        <div className="lg:col-span-2 grid grid-cols-2 gap-4">
                            {[
                                {
                                    label: "Overall CGPA",
                                    value: cgpa,
                                    sub: "out of 10.00",
                                    color: "text-cat-violet",
                                    icon: <BarChart2 size={13} className="text-cat-violet opacity-50" />,
                                },
                                {
                                    label: "Equivalent %",
                                    value: `${percentage}%`,
                                    sub: "CGPA × 9.5",
                                    color: "text-cat-blue",
                                    icon: <Percent size={13} className="text-cat-blue opacity-50" />,
                                },
                                {
                                    label: "Credits Earned",
                                    value: `${overallStats.earnedCredits}`,
                                    valueSuffix: ` / ${overallStats.totalCredits}`,
                                    sub: "overall",
                                    color: "text-cat-teal",
                                    icon: <BookOpen size={13} className="text-cat-teal opacity-50" />,
                                },
                                {
                                    label: "Status",
                                    value: overallStats.backlogs > 0 ? String(overallStats.backlogs) : "✓",
                                    sub: overallStats.backlogs > 0 ? `backlog${overallStats.backlogs > 1 ? "s" : ""}` : "all cleared",
                                    color: overallStats.backlogs > 0 ? "text-grade-fail" : "text-grade-excellent",
                                    icon: overallStats.backlogs > 0
                                        ? <AlertTriangle size={13} className="text-grade-fail opacity-60" />
                                        : <CheckCircle2 size={13} className="text-grade-excellent opacity-60" />,
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
                                    className={`bg-surface border border-border-strong rounded-lg p-5 flex flex-col justify-between cursor-default ${card.bgClass ?? ""}`}
                                >
                                    <div className="flex items-center justify-between mb-4">
                                        <span className="text-[10px] font-mono uppercase tracking-widest text-foreground-muted">{card.label}</span>
                                        {card.icon}
                                    </div>
                                    <div>
                                        <div className={`text-4xl font-bold font-mono ${card.color}`}>
                                            {card.value}
                                            {card.valueSuffix && (
                                                <span className="text-xl text-foreground-muted">{card.valueSuffix}</span>
                                            )}
                                        </div>
                                        <div className="text-[10px] text-foreground-muted font-mono mt-2">{card.sub}</div>
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
                >
                    <div className="inline-flex items-center gap-0.5 bg-surface-deep border border-border rounded-md p-1 flex-wrap">
                        {SEMESTERS.map((sem) => (
                            <button
                                key={sem.value}
                                onClick={() => setActiveSem(sem.value)}
                                disabled={loading}
                                className={`relative px-3.5 py-1.5 text-xs font-mono font-medium transition-colors duration-100 disabled:opacity-40 rounded-sm ${activeSem === sem.value
                                        ? "text-background font-bold"
                                        : "text-foreground-muted hover:text-foreground"
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
                </motion.section>

                {/* Results Table */}
                <motion.section
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                        <div className="flex items-center gap-2">
                            <span className="px-2.5 py-1 rounded-md bg-surface-deep border border-border-strong text-xs font-mono font-bold text-foreground tracking-wider uppercase shadow-sm">
                                {activeSem === "100" ? "All Semesters" : `Semester ${activeSem}`}
                            </span>
                            <span className="px-2.5 py-1 rounded-md bg-cat-teal-surface border border-cat-teal-border text-xs font-mono font-semibold text-cat-teal shadow-sm">
                                {filteredResults?.length ?? 0} subjects
                            </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[11px] font-mono text-gold bg-gold-surface border border-gold-border px-2.5 py-1 rounded-md shadow-sm">
                            <Pencil size={11} className="animate-pulse" />
                            <span>Click any credit value to edit & recalculate GPA</span>
                        </div>
                    </div>

                    <div className="bg-surface border border-border-strong rounded-lg overflow-hidden">
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
                                        <thead>
                                            <tr className="bg-surface-deep border-b border-border-strong">
                                                {["Sem", "Code", "Subject", "Int.", "Ext.", "Total", "Credits", "Grade", "Status"].map((h) => (
                                                    <th
                                                        key={h}
                                                        className={`px-4 py-3 text-[10px] font-mono uppercase tracking-widest ${h === "Credits" ? "text-gold" : "text-foreground-muted"} ${["Int.", "Ext.", "Total", "Credits", "Grade", "Status"].includes(h) ? "text-center" : "text-left"}`}
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
                                                const total = Number(row[5]);
                                                const gradeInfo = getGradeAndPoints(total);
                                                const themeClasses = getGradeThemeClasses(gradeInfo.grade);
                                                const paperCode = row[1];
                                                const subjectTitle = row[2];
                                                const currentCredit = customCredit[paperCode] ?? getDefaultCredit(subjectTitle);

                                                return (
                                                    <motion.tr
                                                        key={idx}
                                                        initial={{ opacity: 0, x: -6 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: idx * 0.025, duration: 0.25 }}
                                                        className="border-b border-border/40 last:border-0 hover:bg-surface-elevated/50 transition-colors duration-75"
                                                    >
                                                        <td className="px-4 py-3.5 text-xs font-mono text-foreground-muted">{row[0]}</td>
                                                        <td className="px-4 py-3.5 text-xs font-mono font-semibold text-gold">{paperCode}</td>
                                                        <td className="px-4 py-3.5 text-sm font-medium text-foreground flex items-center gap-2">
                                                            <span>{subjectTitle}</span>
                                                            {(subjectTitle.toUpperCase().includes("LAB") || subjectTitle.toUpperCase().includes("PRACTICAL")) && (
                                                                <span className="text-[9px] font-mono font-bold text-cat-teal bg-cat-teal-surface border border-cat-teal-border px-1.5 py-0.5 rounded-sm tracking-wider uppercase">
                                                                    LAB
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td className="px-4 py-3.5 text-xs font-mono text-center text-foreground-secondary">{row[3]}</td>
                                                        <td className="px-4 py-3.5 text-xs font-mono text-center text-foreground-secondary">{row[4]}</td>
                                                        <td className="px-4 py-3.5 text-xs font-mono text-center font-bold text-foreground">{row[5]}</td>
                                                        <td className="px-4 py-3.5 text-center">
                                                            <input
                                                                type="number"
                                                                min={0}
                                                                max={10}
                                                                value={currentCredit}
                                                                title="Click to edit credits for custom GPA calculation"
                                                                onChange={(e) => setCustomCredit(paperCode, Number(e.target.value))}
                                                                className="w-10 text-center bg-surface-deep border border-border-strong hover:border-gold/60 focus:border-gold focus:ring-1 focus:ring-gold/30 rounded-sm py-0.5 font-mono text-xs text-foreground outline-none transition-all cursor-pointer focus:cursor-text [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                            />
                                                            {!gradeInfo.pass && (
                                                                <div className="text-[9px] font-mono text-grade-fail mt-0.5" title="Backlog: 0 credits earned until cleared">
                                                                    0 earned
                                                                </div>
                                                            )}
                                                        </td>
                                                        <td className="px-4 py-3.5 text-center">
                                                            <span className={`inline-flex items-center justify-center w-9 h-6 rounded-sm border font-mono text-[11px] font-bold ${themeClasses}`}>
                                                                {gradeInfo.grade}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-3.5 text-center">
                                                            <span className={`text-[10px] font-mono font-bold uppercase tracking-wider ${gradeInfo.pass ? "text-grade-excellent" : "text-grade-fail"}`}>
                                                                {gradeInfo.pass ? "Pass" : "Back"}
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
                                    className="p-12 text-center text-foreground-muted text-xs font-mono"
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
                            className="bg-surface border border-border-strong rounded-lg overflow-hidden"
                        >
                            <div className="bg-surface-deep border-b border-border px-5 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div>
                                    <div className="text-[10px] font-mono uppercase tracking-widest text-foreground-muted mb-1">
                                        {activeSem === "100" ? "Overall Summary" : `Semester ${activeSem} Summary`}
                                    </div>
                                    {semStats.backlogs > 0 ? (
                                        <div className="flex items-center gap-1.5 text-grade-fail text-xs font-mono">
                                            <AlertTriangle size={11} />
                                            {semStats.backlogs} backlog subject{semStats.backlogs > 1 ? "s" : ""}
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-1.5 text-grade-excellent text-xs font-mono">
                                            <CheckCircle2 size={11} />
                                            All subjects cleared
                                        </div>
                                    )}
                                </div>

                                <div className="flex flex-wrap gap-2.5">
                                    {[
                                        {
                                            label: activeSem === "100" ? "CGPA" : "SGPA",
                                            value: sgpa,
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
                                            value: `${percentage}%`,
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
                                    className="px-5 py-4 border-t border-border-strong space-y-3"
                                >
                                    <div className="text-[11px] font-mono text-foreground flex items-center gap-2 font-medium">
                                        <AlertTriangle size={13} className="text-grade-fail shrink-0" />
                                        <span>0 credits & 0 points counted for backlog subjects. Clear these subjects in re-appear exams to boost your GPA!</span>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {filteredResults
                                            .filter((row) => !getGradeAndPoints(Number(row[5])).pass)
                                            .map((row, i) => (
                                                <span key={i} className="text-[11px] font-mono px-2.5 py-1 rounded-sm bg-surface border border-grade-fail-border text-grade-fail flex items-center gap-1.5 shadow-xs">
                                                    <span className="font-bold">{row[1]}</span> · {row[2]}
                                                    <span className="text-[9px] opacity-90 bg-grade-fail-surface px-1 py-0.5 rounded border border-grade-fail-border font-semibold">(0 pts)</span>
                                                </span>
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

                {/* Debug JSON */}
                <details className="border border-border rounded-md overflow-hidden">
                    <summary className="px-4 py-2.5 bg-surface-deep text-[10px] text-foreground-muted font-mono cursor-pointer hover:text-foreground uppercase tracking-wider">
                        Debug · Raw JSON Response
                    </summary>
                    <pre className="text-[10px] font-mono text-foreground-secondary bg-background p-4 overflow-auto max-h-96">
                        {JSON.stringify(fullResult, null, 2)}
                    </pre>
                </details>

            </main>
        </div>
    );
}