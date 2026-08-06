"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { SlidersHorizontal, Download, ChevronDown, FileText } from "lucide-react";

const SEMESTERS = [
    { label: "All Sems", value: "100" },
    { label: "Sem I", value: "1" },
    { label: "Sem II", value: "2" },
    { label: "Sem III", value: "3" },
    { label: "Sem IV", value: "4" },
    { label: "Sem V", value: "5" },
    { label: "Sem VI", value: "6" },
    { label: "Sem VII", value: "7" },
    { label: "Sem VIII", value: "8" },
];

const DOWNLOAD_OPTIONS = [
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
    const [downloadSem, setDownloadSem] = useState<string>("100");
    const [openDownloadDropdown, setOpenDownloadDropdown] = useState<boolean>(false);

    const activeLabel = activeSem === "100" ? "All Semesters" : `Semester ${activeSem}`;
    const selectedDownloadLabel =
        DOWNLOAD_OPTIONS.find((o) => o.value === downloadSem)?.label ?? "Overall Marksheet";

    const downloadOptions = DOWNLOAD_OPTIONS.filter(
        (o) => o.value === "100" || availableSemesters.includes(Number(o.value))
    );

    const handleDownload = () => {
        console.log("Download requested for:", downloadSem);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="space-y-3"
        >
            {/* Top row: viewing status and download controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                
                {/* Active semester view indicator */}
                <div className="flex items-center gap-2">
                    <SlidersHorizontal size={13} className="text-purple-300" />
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                        Viewing: {activeLabel}
                    </span>
                    <span className="text-[10px] font-mono text-neutral-300 px-2 py-0.5 rounded-sm bg-surface-deep border border-border-strong">
                        {totalSubjects} subjects
                    </span>
                </div>

                {/* Marksheet download selector and button */}
                <div className="flex items-center gap-2 font-mono">
                    <div className="relative">
                        <button
                            onClick={() => setOpenDownloadDropdown((p) => !p)}
                            className="flex items-center gap-2 px-2.5 py-1.5 bg-surface-deep border border-border-strong rounded-sm text-xs text-white hover:border-neutral-400 transition-colors cursor-pointer"
                        >
                            <FileText size={12} className="text-sky-300" />
                            <span>{selectedDownloadLabel}</span>
                            <ChevronDown
                                size={12}
                                className={`text-neutral-400 transition-transform duration-200 ${
                                    openDownloadDropdown ? "rotate-180" : ""
                                }`}
                            />
                        </button>

                        {/* Semester dropdown list */}
                        {openDownloadDropdown && (
                            <motion.div
                                initial={{ opacity: 0, y: -4 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="absolute right-0 top-full mt-1 z-30 w-48 bg-[#18181b] border border-[#3f3f46] rounded-sm overflow-hidden shadow-xl"
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
                                                ? "bg-sky-500/15 text-sky-300 font-bold border-l-2 border-sky-400"
                                                : "text-neutral-300 hover:bg-surface-elevated hover:text-white border-l-2 border-transparent"
                                        }`}
                                    >
                                        {o.label}
                                    </button>
                                ))}
                            </motion.div>
                        )}
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.96 }}
                        onClick={handleDownload}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-black text-xs font-bold rounded-sm border border-white hover:bg-neutral-200 transition-colors cursor-pointer uppercase tracking-wider shadow-xs"
                    >
                        <Download size={12} />
                        <span>Download</span>
                    </motion.button>
                </div>
            </div>

            {/* Semester filter tab bar */}
            <div className="flex flex-wrap gap-1 p-1 bg-surface border border-border-strong rounded-sm">
                {SEMESTERS.map((sem) => {
                    const active = activeSem === sem.value;
                    return (
                        <button
                            key={sem.value}
                            onClick={() => onSelectSem(sem.value)}
                            className={`relative px-3 py-1.5 rounded-sm text-xs font-mono font-semibold transition-colors duration-150 cursor-pointer ${
                                active
                                    ? "text-white"
                                    : "text-neutral-400 hover:text-neutral-200"
                            }`}
                        >
                            {active && (
                                <motion.div
                                    layoutId="semTab"
                                    className="absolute inset-0 bg-surface-elevated border border-border-strong rounded-sm"
                                    transition={{ type: "spring", stiffness: 400, damping: 32 }}
                                />
                            )}
                            <span className="relative z-10">{sem.label}</span>
                        </button>
                    );
                })}
            </div>
        </motion.div>
    );
}
