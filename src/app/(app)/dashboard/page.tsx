"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, AlertTriangle, CheckCircle2, Percent, BarChart2, BookOpen } from "lucide-react";
import { toast } from "sonner";
import Skeleton from "@/components/dashboard/Skeleton";
import { LogoutButton } from "@/components/dashboard/LogoutButton";
import useResultStore from "@/store/result-store";
import { ResultData } from "@/types/result";
import { getDefaultCredit, getGradeAndPoints, getGradeThemeClasses } from "@/helpers/grade-system";

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

function PixelAvatar({ name }: { name: string }) {
    const seed = name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
    const size = 5;
    const cells = Array.from({ length: size * size }, (_, i) => {
        const col = i % size;
        const mirrorCol = Math.min(col, size - 1 - col);
        const row = Math.floor(i / size);
        return ((seed * (row * 3 + mirrorCol + 1) * 2654435761) >>> 0) % 3 !== 0;
    });

    const colors = [
        "rgba(139,124,219,0.9)",
        "rgba(76,141,218,0.85)",
        "rgba(69,184,199,0.8)",
    ];
    const accentColor = colors[seed % colors.length];

    return (
        <div
            className="w-12 h-12 rounded-md p-1.5 flex-shrink-0"
            style={{
                background: "#08080c",
                boxShadow: `0 0 0 1px rgba(139,124,219,0.2), 0 0 12px rgba(139,124,219,0.06)`,
            }}
        >
            <div
                className="w-full h-full"
                style={{
                    display: "grid",
                    gridTemplateColumns: `repeat(${size}, 1fr)`,
                    gap: "1.5px",
                }}
            >
                {cells.map((lit, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: lit ? 1 : 0 }}
                        transition={{ delay: i * 0.012, duration: 0.3 }}
                        style={{
                            borderRadius: "1px",
                            background: lit ? accentColor : "rgba(255,255,255,0.03)",
                        }}
                    />
                ))}
            </div>
        </div>
    );
}

export default function DashboardPage() {
    const router = useRouter();

    const [activeSem, setActiveSem] = useState("100");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

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

        rows.forEach((row) => {
            const total = Number(row[5]);
            const paperCode = row[1];
            const subjectTitle = row[2];
            const credit = customCredit[paperCode] ?? getDefaultCredit(subjectTitle);
            const { points, pass } = getGradeAndPoints(total);

            weightedPoints += credit * points;
            totalCredits += credit;
            if (pass) earnedCredits += credit;
            else backlogs += 1;
        });

        const gpa = totalCredits > 0 ? weightedPoints / totalCredits : 0;
        return { gpa, totalCredits, earnedCredits, backlogs };
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

            {/* Navigation */}
            <motion.header
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="sticky top-0 z-20 border-b border-border bg-surface-deep/90 backdrop-blur-md"
            >
                <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <span className="text-gold font-mono font-bold text-sm tracking-widest uppercase">Anviksha</span>
                        <span className="text-border-strong text-xs">·</span>
                        <span className="text-foreground-muted text-xs font-mono">Academic Results</span>
                    </div>
                    <div className="flex items-center gap-4">
                        {profile && (
                            <span className="text-foreground-muted text-xs font-mono hidden sm:block truncate max-w-48">
                                {profile.stname}
                            </span>
                        )}
                        <LogoutButton />
                    </div>
                </div>
            </motion.header>

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
                                className={`relative px-3.5 py-1.5 text-xs font-mono font-medium transition-colors duration-100 disabled:opacity-40 rounded-sm ${
                                    activeSem === sem.value
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
                    <div className="flex items-center justify-between mb-2.5">
                        <div className="text-[10px] font-mono uppercase tracking-widest text-foreground-muted">
                            {activeSem === "100" ? "All Semesters" : `Semester ${activeSem}`}
                            <span className="mx-2 text-border-strong">·</span>
                            {filteredResults?.length ?? 0} subjects
                        </div>
                        {loading && fullResult && (
                            <div className="flex items-center gap-1.5 text-[10px] text-foreground-muted font-mono">
                                <Loader2 size={11} className="animate-spin text-cat-teal" />
                                Loading...
                            </div>
                        )}
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
                                                        className={`px-4 py-3 text-[10px] font-mono uppercase tracking-widest text-foreground-muted ${["Int.", "Ext.", "Total", "Credits", "Grade", "Status"].includes(h) ? "text-center" : "text-left"}`}
                                                    >
                                                        {h}
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
                                                        <td className="px-4 py-3.5 text-xs font-mono font-semibold text-cat-blue">{paperCode}</td>
                                                        <td className="px-4 py-3.5 text-sm text-foreground">{subjectTitle}</td>
                                                        <td className="px-4 py-3.5 text-xs font-mono text-center text-foreground-secondary">{row[3]}</td>
                                                        <td className="px-4 py-3.5 text-xs font-mono text-center text-foreground-secondary">{row[4]}</td>
                                                        <td className="px-4 py-3.5 text-xs font-mono text-center font-bold text-foreground">{row[5]}</td>
                                                        <td className="px-4 py-3.5 text-center">
                                                            <input
                                                                type="number"
                                                                min={0}
                                                                max={10}
                                                                value={currentCredit}
                                                                onChange={(e) => setCustomCredit(paperCode, Number(e.target.value))}
                                                                className="w-10 text-center bg-surface-deep border border-border rounded-sm py-0.5 font-mono text-xs text-foreground outline-none focus:border-cat-violet transition-colors"
                                                            />
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

                                <div className="flex flex-wrap gap-2">
                                    {[
                                        { label: activeSem === "100" ? "CGPA" : "SGPA", value: sgpa, bg: "bg-cat-violet-surface border-cat-violet-border", text: "text-cat-violet", subtext: "text-cat-violet/70" },
                                        { label: "Credits", value: `${semStats.earnedCredits}/${semStats.totalCredits}`, bg: "bg-cat-teal-surface border-cat-teal-border", text: "text-cat-teal", subtext: "text-cat-teal/70" },
                                        { label: "Equiv.", value: `${percentage}%`, bg: "bg-cat-blue-surface border-cat-blue-border", text: "text-cat-blue", subtext: "text-cat-blue/70" },
                                    ].map((pill) => (
                                        <div key={pill.label} className={`flex items-center gap-2 border rounded-sm px-3 py-1.5 ${pill.bg}`}>
                                            <span className={`text-[10px] font-mono uppercase tracking-wider ${pill.subtext}`}>{pill.label}</span>
                                            <span className={`text-sm font-bold font-mono ${pill.text}`}>{pill.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {semStats.backlogs > 0 && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="px-5 py-4 flex flex-wrap gap-2"
                                >
                                    {filteredResults
                                        .filter((row) => !getGradeAndPoints(Number(row[5])).pass)
                                        .map((row, i) => (
                                            <span key={i} className="text-[11px] font-mono px-2.5 py-1 rounded-sm bg-surface-deep border border-grade-fail-border text-grade-fail">
                                                {row[1]} · {row[2]}
                                            </span>
                                        ))}
                                </motion.div>
                            )}
                        </motion.section>
                    )}
                </AnimatePresence>

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