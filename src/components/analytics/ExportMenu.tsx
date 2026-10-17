"use client";

import { useRef, useState, useMemo, useCallback, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Download, ChevronDown, FileText, Check } from "lucide-react";
import html2canvas from "html2canvas-pro";
import jsPDF from "jspdf";
import useResultStore from "@/store/result-store";
import { toast } from "sonner";
import { ResultGradeSheet } from "../export/ResultGradeSheet";
import { ConsolidatedMasterTranscript } from "../export/ConsolidatedMasterTranscript";

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
    availableSemesters: number[];
}

// Marksheet and consolidated transcript PDF export dropdown menu.
export default function ExportMenu({ availableSemesters }: Props) {
    const [downloadSem, setDownloadSem] = useState<string>("master_transcript");
    const [openDownloadDropdown, setOpenDownloadDropdown] = useState<boolean>(false);
    const menuRef = useRef<HTMLDivElement>(null);

    const selectedDownloadLabel = useMemo(() => {
        return DOWNLOAD_OPTIONS.find((o) => o.value === downloadSem)?.label ?? "Consolidated Transcript";
    }, [downloadSem]);

    const downloadOptions = useMemo(() => {
        return DOWNLOAD_OPTIONS.filter(
            (o) => o.value === "master_transcript" || o.value === "100" || availableSemesters.includes(Number(o.value))
        );
    }, [availableSemesters]);

    // Close the dropdown when you click somewhere else or press Escape
    useEffect(() => {
        if (!openDownloadDropdown) return;

        const closeOnOutsideClick = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setOpenDownloadDropdown(false);
            }
        };
        const closeOnEscape = (event: globalThis.KeyboardEvent) => {
            if (event.key === "Escape") setOpenDownloadDropdown(false);
        };

        document.addEventListener("mousedown", closeOnOutsideClick);
        document.addEventListener("keydown", closeOnEscape);
        return () => {
            document.removeEventListener("mousedown", closeOnOutsideClick);
            document.removeEventListener("keydown", closeOnEscape);
        };
    }, [openDownloadDropdown]);

    const printRef = useRef<HTMLDivElement>(null);
    const masterTranscriptRef = useRef<HTMLDivElement>(null);
    const [isExporting, setIsExporting] = useState(false);
    const engineResult = useResultStore((state) => state.engineResult);

    const downloadResults = useMemo(() => {
        if (!engineResult) return [];
        return downloadSem === "100"
            ? engineResult.subjectResults
            : engineResult.subjectResults.filter(
                  (s) => String(s.semester) === String(downloadSem),
              );
    }, [engineResult, downloadSem]);

    // Headline score on the ordinance's own scale.
    const downloadScore = useMemo(() => {
        if (!engineResult) return null;
        const { analytics } = engineResult;
        const scale = analytics.divisionPresentation.scale;
        const usesCgpa = scale === "CGPA" || scale === "CPI";

        if (downloadSem === "100") {
            return {
                value: usesCgpa ? analytics.cgpa.value : analytics.percentage.value,
                label: usesCgpa
                    ? "Overall CGPA"
                    : "Overall Percentage",
            };
        }

        const semKey = String(downloadSem);
        if (usesCgpa) {
            return {
                value:
                    analytics.sgpaBySemester.find((g) => String(g.semester) === semKey)?.sgpa
                        .value ?? null,
                label: "SGPA",
            };
        }

        return {
            value:
                analytics.semesterPerformance.find((p) => String(p.semester) === semKey)
                    ?.averagePercentage ?? null,
            label: "Semester Percentage",
        };
    }, [engineResult, downloadSem]);

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

            const safeName = (engineResult?.profile?.stname || "Student").trim().replace(/[^a-zA-Z0-9_-]/g, "_").replace(/_+/g, "_");
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
    }, [downloadSem, engineResult]);

    return (
        <>
            <div style={{ position: "absolute", left: "-9999px", top: "-9999px" }}>
                <ResultGradeSheet
                    ref={printRef}
                    profile={engineResult?.profile}
                    subjectResults={downloadResults}
                    activeSem={downloadSem}
                    gpa={downloadScore?.value ?? null}
                    gpaLabel={downloadScore?.label ?? "Score"}
                />
            </div>

            <div style={{ position: "absolute", left: "-9999px", top: "-9999px" }}>
                <ConsolidatedMasterTranscript
                    ref={masterTranscriptRef}
                    profile={engineResult?.profile}
                    engine={engineResult!}
                />
            </div>

            <div className="flex w-full items-center gap-2 font-mono sm:w-auto">
                <div ref={menuRef} className="relative min-w-0 flex-1 sm:w-64 sm:flex-none">
                    <button
                        type="button"
                        aria-haspopup="listbox"
                        aria-expanded={openDownloadDropdown}
                        onClick={() => setOpenDownloadDropdown((p) => !p)}
                        className="flex w-full min-w-0 cursor-pointer items-center justify-between gap-2 rounded-lg border border-border-strong bg-surface px-3 py-2.5 text-xs text-foreground transition-colors duration-200 hover:border-gold-border hover:text-gold"
                    >
                        <span className="flex min-w-0 items-center gap-2">
                            <FileText size={14} className="shrink-0 text-chart-cyan" aria-hidden="true" />
                            <span className="truncate">{selectedDownloadLabel}</span>
                        </span>
                        <ChevronDown
                            size={14}
                            aria-hidden="true"
                            className={`shrink-0 text-foreground-muted transition-transform duration-200 ${openDownloadDropdown ? "rotate-180" : ""}`}
                        />
                    </button>

                    <AnimatePresence>
                        {openDownloadDropdown && (
                            <motion.div
                                role="listbox"
                                initial={{ opacity: 0, y: -6, scale: 0.98 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -6, scale: 0.98 }}
                                transition={{ duration: 0.15, ease: "easeOut" }}
                                style={{ transformOrigin: "top" }}
                                className="absolute right-0 top-full z-30 mt-1.5 w-full space-y-0.5 overflow-hidden rounded-lg border border-border-strong bg-surface-elevated p-1 shadow-xl"
                            >
                                {downloadOptions.map((o) => {
                                    const selected = downloadSem === o.value;
                                    return (
                                        <button
                                            key={o.value}
                                            type="button"
                                            role="option"
                                            aria-selected={selected}
                                            onClick={() => {
                                                setDownloadSem(o.value);
                                                setOpenDownloadDropdown(false);
                                            }}
                                            className={`flex w-full cursor-pointer items-center justify-between gap-2 rounded-md px-3 py-2 text-left text-xs transition-colors ${
                                                selected
                                                    ? "bg-cat-blue-surface font-semibold text-chart-cyan"
                                                    : "text-foreground-secondary hover:bg-surface-hover hover:text-foreground"
                                            }`}
                                        >
                                            {o.label}
                                            {selected && <Check size={13} aria-hidden="true" />}
                                        </button>
                                    );
                                })}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <motion.button
                    type="button"
                    whileTap={{ scale: 0.97 }}
                    disabled={isExporting}
                    onClick={handleDownloadPDF}
                    className="inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 rounded-lg border border-white bg-white px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-black transition-colors duration-200 hover:bg-neutral-200 disabled:opacity-50"
                >
                    <Download size={14} aria-hidden="true" />
                    <span>{isExporting ? "Exporting..." : "Download"}</span>
                </motion.button>
            </div>
        </>
    );
}
