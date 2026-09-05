"use client";

import { useRef, useState, useMemo, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { SlidersHorizontal, Download, ChevronDown, FileText } from "lucide-react";
import html2canvas from "html2canvas-pro";
import jsPDF from "jspdf";
import useResultStore from "@/store/result-store";
import { toast } from "sonner";
import { ResultGradeSheet } from "../export/ResultGradeSheet";
import { ConsolidatedMasterTranscript } from "../export/ConsolidatedMasterTranscript";

const SEMESTERS = [
    { label: "All Sems", shortLabel: "All", value: "100" },
    { label: "Sem I", shortLabel: "I", value: "1" },
    { label: "Sem II", shortLabel: "II", value: "2" },
    { label: "Sem III", shortLabel: "III", value: "3" },
    { label: "Sem IV", shortLabel: "IV", value: "4" },
    { label: "Sem V", shortLabel: "V", value: "5" },
    { label: "Sem VI", shortLabel: "VI", value: "6" },
    { label: "Sem VII", shortLabel: "VII", value: "7" },
    { label: "Sem VIII", shortLabel: "VIII", value: "8" },
];

const DOWNLOAD_OPTIONS = [
    { label: "Consolidated Transcript", value: "master_transcript" },
    { label: "Overall Marksheet", value: "100" },
    { label: "Sem I Marksheet", value: "1" },
    { label: "Sem II Marksheet", value: "2" },
    { label: "Sem III Marksheet", value: "3" },
    { label: "Sem IV Marksheet", value: "4" },
    { label: "Sem V Marksheet", value: "5" },
    { label: "Sem VI Marksheet", value: "6" },
    { label: "Sem VII Marksheet", value: "7" },
    { label: "Sem VIII Marksheet", value: "8" },
];

interface Props {
    activeSem: string;
    onSelectSem: (sem: string) => void;
    totalSubjects: number;
    availableSemesters: number[];
}

export default function SemesterSelector({
    activeSem,
    onSelectSem,
    totalSubjects,
    availableSemesters,
}: Props) {
    const [downloadSem, setDownloadSem] = useState<string>("master_transcript");
    const [openDownloadDropdown, setOpenDownloadDropdown] = useState<boolean>(false);

    const activeLabel = activeSem === "100" ? "All Semesters" : `Semester ${activeSem}`;
    const selectedDownloadLabel = useMemo(() => {
        return DOWNLOAD_OPTIONS.find((o) => o.value === downloadSem)?.label ?? "Consolidated Transcript";
    }, [downloadSem]);

    const downloadOptions = useMemo(() => {
        return DOWNLOAD_OPTIONS.filter(
            (o) => o.value === "master_transcript" || o.value === "100" || availableSemesters.includes(Number(o.value))
        );
    }, [availableSemesters]);

    const SemseterOptions = useMemo(() => {
        return SEMESTERS.filter(
            (sem) => sem.value === "100" || availableSemesters.includes(Number(sem.value))
        );
    }, [availableSemesters]);

    const printRef = useRef<HTMLDivElement>(null);
    const masterTranscriptRef = useRef<HTMLDivElement>(null);
    const [isExporting, setIsExporting] = useState(false);
    const profile = useResultStore((state) => state.result?.stprofile);
    const rawResults = useResultStore((state) => state.result?.stresult);
    const allResults = useMemo(() => rawResults ?? [], [rawResults]);
    const customCredits = useResultStore((state) => state.customCredits);

    const downloadResults = useMemo(() => {
        return allResults.filter(
            (row) => downloadSem === "100" || row[0] === Number(downloadSem)
        );
    }, [allResults, downloadSem]);

    const handleDownloadPDF = useCallback(async () => {
        const isMaster = downloadSem === "master_transcript";
        const targetNode = isMaster ? masterTranscriptRef.current : printRef.current;
        if (!targetNode) return;

        setIsExporting(true);
        toast.info(isMaster ? "Preparing Consolidated Transcript..." : "Preparing the Marksheet for you...");
        try {
            const canvas = await html2canvas(targetNode, {
                scale: 2,
                useCORS: true,
                backgroundColor: "#ffffff",
            });

            const imgData = canvas.toDataURL("image/png");
            const pdf = new jsPDF("p", "mm", "a4");
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

            pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);

            const safeName = (profile?.stname || "Student").trim().replace(/[^a-zA-Z0-9_-]/g, "_").replace(/_+/g, "_");
            let fileName = "";
            if (isMaster) {
                fileName = `${safeName}_Consolidated_Transcript.pdf`;
            } else {
                const isOverallDownload = downloadSem === "100";
                const docName = isOverallDownload ? "Overall_Cumulative_Record" : `Semester_${downloadSem}_Marksheet`;
                fileName = `${safeName}_${docName}.pdf`;
            }

            pdf.save(fileName);

            toast.success(
                isMaster
                    ? "Consolidated Transcript PDF downloaded!"
                    : downloadSem === "100"
                    ? "Overall Transcript PDF downloaded!"
                    : "Marksheet PDF downloaded!"
            );
        } catch {
            toast.error("Failed to generate PDF. Please try again.");
        } finally {
            setIsExporting(false);
        }
    }, [downloadSem, profile]);

    return (
        <>
            {/* Hidden off-screen grade sheet DOM node for detailed PDF export */}
            <div style={{ position: "absolute", left: "-9999px", top: "-9999px" }}>
                <ResultGradeSheet
                    ref={printRef}
                    profile={profile}
                    results={downloadResults}
                    activeSem={downloadSem}
                    customCredits={customCredits}
                />
            </div>

            {/* Hidden off-screen 1-page master transcript DOM node for placement PDF export */}
            <div style={{ position: "absolute", left: "-9999px", top: "-9999px" }}>
                <ConsolidatedMasterTranscript
                    ref={masterTranscriptRef}
                    profile={profile}
                    allResults={allResults}
                    customCredits={customCredits}
                />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className="space-y-3"
            >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                        <SlidersHorizontal size={13} className="text-cat-violet shrink-0" />
                        <span className="text-xs font-mono font-bold uppercase tracking-wider text-foreground">
                            Viewing: {activeLabel}
                        </span>
                        <span className="text-[10px] font-mono text-foreground-secondary px-2 py-0.5 rounded-sm bg-surface-deep border border-border-strong shrink-0">
                            {totalSubjects} subjects
                        </span>
                    </div>

                    <div className="flex items-center gap-2 font-mono w-full sm:w-auto">
                        <div className="relative flex-1 sm:flex-initial min-w-0">
                            <button
                                onClick={() => setOpenDownloadDropdown((p) => !p)}
                                className="w-full sm:w-auto min-w-0 flex items-center justify-between gap-2 px-2.5 py-1.5 bg-surface-deep border border-border-strong rounded-sm text-xs text-foreground hover:border-gold-border hover:text-gold transition-colors duration-200 cursor-pointer"
                            >
                                <span className="flex items-center gap-2 truncate">
                                    <FileText size={12} className="text-chart-cyan shrink-0" />
                                    <span className="truncate">{selectedDownloadLabel}</span>
                                </span>
                                <ChevronDown
                                    size={12}
                                    className={`text-foreground-muted shrink-0 transition-transform duration-200 ${openDownloadDropdown ? "rotate-180" : ""}`}
                                />
                            </button>

                            <AnimatePresence>
                                {openDownloadDropdown && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -4 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -4 }}
                                        transition={{ duration: 0.15 }}
                                        className="absolute right-0 top-full mt-1 z-30 w-full sm:w-52 bg-surface-elevated border border-border-strong rounded-sm overflow-hidden shadow-xl"
                                    >
                                        {downloadOptions.map((o) => (
                                             <button
                                                key={o.value}
                                                onClick={() => {
                                                    setDownloadSem(o.value);
                                                    setOpenDownloadDropdown(false);
                                                }}
                                                className={`w-full text-left px-3 py-2 text-xs font-mono transition-colors cursor-pointer ${
                                                    downloadSem === o.value
                                                        ? "bg-cat-blue-surface text-chart-cyan font-bold border-l-2 border-chart-cyan"
                                                        : "text-foreground-secondary hover:bg-surface hover:text-foreground border-l-2 border-transparent"
                                                }`}
                                            >
                                                {o.label}
                                            </button>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.96 }}
                            disabled={isExporting}
                            onClick={handleDownloadPDF}
                            className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-foreground text-background text-xs font-bold rounded-sm border border-foreground hover:bg-foreground-secondary disabled:opacity-50 transition-colors cursor-pointer uppercase tracking-wider shadow-xs shrink-0"
                        >
                            <Download size={12} />
                            <span>{isExporting ? "Exporting..." : "Download"}</span>
                        </motion.button>
                    </div>
                </div>

                <div role="tablist" aria-label="Semester Selection Tabs" className="flex items-center justify-between sm:justify-start gap-1 p-1 bg-surface border border-border-strong rounded-sm w-full sm:w-auto overflow-x-auto custom-h-scrollbar">
                    {SemseterOptions.map((sem) => {
                        const active = activeSem === sem.value;
                        return (
                            <button
                                key={sem.value}
                                role="tab"
                                aria-selected={active}
                                onClick={() => {
                                    onSelectSem(sem.value);
                                }}
                                className={`relative flex-1 sm:flex-none min-w-[28px] sm:min-w-0 text-center px-1.5 sm:px-3 py-1.5 rounded-sm text-[11px] sm:text-xs font-mono font-semibold transition-colors duration-150 cursor-pointer focus-visible:ring-2 focus-visible:ring-gold ${
                                    active ? "text-background font-bold" : "text-foreground-muted hover:text-foreground"
                                }`}
                            >
                                {active && (
                                    <motion.div
                                        layoutId="semTab"
                                        className="absolute inset-0 bg-gold rounded-sm"
                                        transition={{ type: "spring", stiffness: 400, damping: 32 }}
                                    />
                                )}
                                <span className="relative z-10 hidden sm:inline">{sem.label}</span>
                                <span className="relative z-10 sm:hidden">{sem.shortLabel}</span>
                            </button>
                        );
                    })}
                </div>
            </motion.div>
        </>
    );
}
