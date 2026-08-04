"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Loader2, User, GraduationCap, Building2, Calendar, Award } from "lucide-react";
import { toast } from "sonner";
import Skeleton from "@/components/dashboard/Skeleton";
import { LogoutButton } from "@/components/dashboard/LogoutButton";

interface StudentProfile {
    nrollno: string;
    stname: string;
    byoa: number;
    yoa: number;
    prgcode: string;
    prgname: string;
    icode: string;
    iname: string;
}

interface ResultData {
    report?: string;
    stprofile?: StudentProfile;
    header?: string[];
    stresult?: any[][];
}

const SEMESTERS = [
    { label: "All Semesters", value: "100" },
    { label: "Sem 1", value: "1" },
    { label: "Sem 2", value: "2" },
    { label: "Sem 3", value: "3" },
    { label: "Sem 4", value: "4" },
    { label: "Sem 5", value: "5" },
    { label: "Sem 6", value: "6" },
    { label: "Sem 7", value: "7" },
    { label: "Sem 8", value: "8" },
];

export default function DashboardPage() {
    const router = useRouter();

    const [data, setData] = useState<ResultData | null>(null);
    const [activeSem, setActiveSem] = useState("100");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("")

    const fetchResults = async (euno: string) => {
        setLoading(true);
        setError('');

        try {
            const res = await axios.get(`/api/result?euno=${euno}`);
            setData(res.data);
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
        fetchResults(activeSem);
    }, [activeSem]);

    // Skeleton Loader State
    if (loading && !data) {
        return (
            <Skeleton />
        );
    }

    return (
        <div className="min-h-screen bg-background text-foreground p-6">
            <div className="max-w-5xl mx-auto space-y-6">
                {/* Top Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-5">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                            <GraduationCap className="text-gold" size={28} />
                            Academic Dashboard
                        </h1>
                        <p className="text-foreground-muted text-xs font-mono mt-1">
                            GGSIPU Examination Results & Grade Breakdown
                        </p>
                    </div>
                    <LogoutButton />
                </div>

                {/* Error State */}
                {error && (
                    <div className="p-4 bg-grade-fail-surface border border-grade-fail-border rounded-xl text-grade-fail text-xs font-mono">
                        {error}
                    </div>
                )}

                {/* Student Profile Card */}
                {data?.stprofile && (
                    <div className="bg-surface border border-border-strong rounded-2xl p-6 shadow-lg backdrop-blur-md">
                        <div className="flex items-center gap-2 mb-1">
                            <User size={18} className="text-gold" />
                            <h2 className="text-xl font-bold text-foreground">
                                {data.stprofile.stname}
                            </h2>
                        </div>
                        <p className="text-foreground-secondary text-xs mb-5 font-mono">
                            {data.stprofile.prgname}
                        </p>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono">
                            <div className="bg-background p-3.5 rounded-xl border border-border-strong">
                                <div className="text-foreground-muted text-[10px] uppercase tracking-wider mb-1 flex items-center gap-1">
                                    <Award size={12} className="text-gold" /> Enrollment
                                </div>
                                <div className="font-bold text-gold">{data.stprofile.nrollno}</div>
                            </div>

                            <div className="bg-background p-3.5 rounded-xl border border-border-strong">
                                <div className="text-foreground-muted text-[10px] uppercase tracking-wider mb-1 flex items-center gap-1">
                                    <Building2 size={12} className="text-foreground-secondary" /> Institute
                                </div>
                                <div className="text-foreground truncate">{data.stprofile.iname}</div>
                            </div>

                            <div className="bg-background p-3.5 rounded-xl border border-border-strong">
                                <div className="text-foreground-muted text-[10px] uppercase tracking-wider mb-1 flex items-center gap-1">
                                    <Calendar size={12} className="text-foreground-secondary" /> Admission Batch
                                </div>
                                <div className="text-foreground">{data.stprofile.byoa}</div>
                            </div>

                            <div className="bg-background p-3.5 rounded-xl border border-border-strong">
                                <div className="text-foreground-muted text-[10px] uppercase tracking-wider mb-1">
                                    Program Code
                                </div>
                                <div className="text-foreground-secondary font-bold">{data.stprofile.prgcode}</div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Semester Selection Tabs */}
                <div className="flex flex-wrap gap-2">
                    {SEMESTERS.map((sem) => (
                        <button
                            key={sem.value}
                            onClick={() => setActiveSem(sem.value)}
                            disabled={loading}
                            className={`px-3.5 py-2 rounded-xl text-xs font-mono font-medium transition duration-200 ${activeSem === sem.value
                                ? "bg-gold text-background font-bold shadow-md"
                                : "bg-surface text-foreground-secondary hover:bg-surface-elevated hover:text-foreground border border-border"
                                } disabled:opacity-50`}
                        >
                            {sem.label}
                        </button>
                    ))}
                </div>

                {/* Results Table */}
                <div className="bg-surface border border-border-strong rounded-2xl overflow-hidden shadow-md">
                    {loading && data ? (
                        <div className="p-8 text-center text-foreground-muted text-xs font-mono flex items-center justify-center gap-2">
                            <Loader2 className="animate-spin text-gold" size={16} />
                            Fetching semester data...
                        </div>
                    ) : data?.stresult && data.stresult.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-xs font-mono">
                                <thead>
                                    <tr className="bg-background border-b border-border text-foreground-secondary text-left">
                                        <th className="p-3.5 font-semibold">Sem</th>
                                        <th className="p-3.5 font-semibold">Paper Code</th>
                                        <th className="p-3.5 font-semibold">Subject Title</th>
                                        <th className="p-3.5 font-semibold text-center">Internal</th>
                                        <th className="p-3.5 font-semibold text-center">External</th>
                                        <th className="p-3.5 font-semibold text-center">Total</th>
                                        <th className="p-3.5 font-semibold">Session</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/50">
                                    {data.stresult.map((row, idx) => (
                                        <tr
                                            key={idx}
                                            className="hover:bg-background/60 transition duration-150"
                                        >
                                            <td className="p-3.5 text-foreground-muted">{row[0]}</td>
                                            <td className="p-3.5 text-gold font-semibold">{row[1]}</td>
                                            <td className="p-3.5 text-foreground font-sans">{row[2]}</td>
                                            <td className="p-3.5 text-center text-foreground-secondary">{row[3]}</td>
                                            <td className="p-3.5 text-center text-foreground-secondary">{row[4]}</td>
                                            <td className="p-3.5 text-center font-bold text-positive">
                                                {row[5]}
                                            </td>
                                            <td className="p-3.5 text-foreground-muted text-[11px]">{row[7]}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="p-8 text-center text-foreground-muted text-xs font-mono">
                            No results found for this semester selection.
                        </div>
                    )}
                </div>

                {/* Raw JSON Debug Viewer */}
                <details className="bg-surface border border-border-strong rounded-2xl p-4">
                    <summary className="text-xs text-foreground-muted font-mono cursor-pointer hover:text-foreground">
                        Show Raw JSON Response (Debug)
                    </summary>
                    <pre className="mt-3 text-[11px] font-mono text-foreground-secondary bg-background p-3 rounded-xl overflow-auto max-h-96 border border-border">
                        {JSON.stringify(data, null, 2)}
                    </pre>
                </details>
            </div>
        </div>
    );
}