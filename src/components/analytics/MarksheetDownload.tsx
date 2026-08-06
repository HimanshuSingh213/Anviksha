"use client";

import { motion } from "framer-motion";
import { Download, FileText, ChevronDown } from "lucide-react";
import { useState } from "react";

const DOWNLOAD_OPTIONS = [
    { label: "Overall Marksheet (All Semesters)", value: "all" },
    { label: "Semester I Marksheet", value: "1" },
    { label: "Semester II Marksheet", value: "2" },
    { label: "Semester III Marksheet", value: "3" },
    { label: "Semester IV Marksheet", value: "4" },
    { label: "Semester V Marksheet", value: "5" },
    { label: "Semester VI Marksheet", value: "6" },
    { label: "Semester VII Marksheet", value: "7" },
    { label: "Semester VIII Marksheet", value: "8" },
];

interface Props {
    studentName?: string;
    availableSemesters: number[];
}

export default function MarksheetDownload({ studentName, availableSemesters }: Props) {
    const [selected, setSelected] = useState<string>("all");
    const [open, setOpen] = useState(false);

    const selectedLabel = DOWNLOAD_OPTIONS.find((o) => o.value === selected)?.label ?? "Overall Marksheet";

    const options = DOWNLOAD_OPTIONS.filter(
        (o) => o.value === "all" || availableSemesters.includes(Number(o.value))
    );

    const handleDownload = () => {
        console.log("Download requested for:", selected, studentName);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="p-5 bg-surface border border-border-strong rounded-md shadow-xs space-y-4"
        >
            <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-sm bg-sky-500/10 border border-sky-500/30 text-sky-300">
                    <FileText size={15} />
                </div>
                <div>
                    <h3 className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                        Export Official Marksheet
                    </h3>
                    <p className="text-[11px] font-mono text-neutral-400 mt-0.5">
                        Download formatted academic transcript document
                    </p>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="relative flex-1">
                    <button
                        onClick={() => setOpen((p) => !p)}
                        className="w-full flex items-center justify-between gap-2 px-3.5 py-2.5 bg-surface-deep border border-border-strong rounded-sm text-xs font-mono font-medium text-white hover:border-neutral-500 transition-colors cursor-pointer"
                    >
                        <span>{selectedLabel}</span>
                        <ChevronDown
                            size={14}
                            className={`text-neutral-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
                        />
                    </button>

                    {open && (
                        <motion.div
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="absolute top-full mt-1.5 left-0 right-0 z-20 bg-[#18181b] border border-[#3f3f46] rounded-sm overflow-hidden shadow-xl"
                        >
                            {options.map((o) => (
                                <button
                                    key={o.value}
                                    onClick={() => { setSelected(o.value); setOpen(false); }}
                                    className={`w-full text-left px-3.5 py-2.5 text-xs font-mono transition-colors cursor-pointer ${
                                        selected === o.value
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
                    whileTap={{ scale: 0.97 }}
                    onClick={handleDownload}
                    className="flex items-center justify-center gap-2 px-6 py-2.5 bg-white text-black text-xs font-mono font-bold rounded-sm border border-white hover:bg-neutral-200 transition-colors cursor-pointer shrink-0 uppercase tracking-wider shadow-sm"
                >
                    <Download size={14} />
                    <span>Download</span>
                </motion.button>
            </div>

            <div className="text-[10px] font-mono text-neutral-400 border-t border-border-strong pt-2.5">
                Note: Download logic placeholder active. PDF generation script will attach to this button.
            </div>
        </motion.div>
    );
}
