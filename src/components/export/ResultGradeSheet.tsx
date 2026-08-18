"use client";

import React, { forwardRef } from "react";
import { StudentProfile } from "@/types/result";
import { getDefaultCredit, getGradeAndPoints } from "@/helpers/grade-system";
import { AnvikshaWatermark } from "./AnvikshaWatermark";

interface ResultGradeSheetProps {
    profile?: StudentProfile | null;
    results: any[][];
    activeSem: string;
    customCredits?: Record<string, number>;
}

export const ResultGradeSheet = forwardRef<HTMLDivElement, ResultGradeSheetProps>(
    ({ profile, results, activeSem, customCredits = {} }, ref) => {
        let totalCredits = 0;
        let earnedCredits = 0;
        let totalPoints = 0;

        const tableRows = results.map((row) => {
            const sem = row[0];
            const paperCode = row[1];
            const subjectTitle = row[2];
            const internalMarks = row[3];
            const externalMarks = row[4];
            const rawTotal = Number(row[5]);
            const totalMarks = isNaN(rawTotal) ? 0 : rawTotal;
            const statusStr = row[6] || "";

            const defaultCredit = getDefaultCredit(subjectTitle);
            const credit = customCredits[paperCode] ?? defaultCredit;
            const { grade, points } = getGradeAndPoints(totalMarks);

            const isPassed = (statusStr === "08" || statusStr === "") && grade !== "F" && totalMarks >= 40;

            totalCredits += credit;
            if (isPassed) {
                earnedCredits += credit;
                totalPoints += points * credit;
            }

            const gradeColorClass =
                grade === "O" || grade === "A+" || grade === "A"
                    ? "text-emerald-700 font-bold"
                    : grade === "B+" || grade === "B" || grade === "C" || grade === "P"
                    ? "text-blue-700 font-bold"
                    : "text-red-700 font-bold";

            return {
                sem,
                paperCode,
                subjectTitle,
                internalMarks,
                externalMarks,
                totalMarks,
                credit,
                grade,
                points,
                gradeColorClass,
            };
        });

        const sgpa = totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : "0.00";

        const isOverall = activeSem === "100";
        const docTitle = isOverall ? "Cumulative Academic Record" : "Semester Grade Sheet";
        const docSub = isOverall ? "All Semesters Summary & Unofficial Transcript" : "Personal Reference Marksheet";
        const semRoman = isOverall ? "All Semesters (Cumulative)" : (
            activeSem === "1" ? "First Semester" :
            activeSem === "2" ? "Second Semester" :
            activeSem === "3" ? "Third Semester" :
            activeSem === "4" ? "Fourth Semester" :
            activeSem === "5" ? "Fifth Semester" :
            activeSem === "6" ? "Sixth Semester" :
            activeSem === "7" ? "Seventh Semester" :
            activeSem === "8" ? "Eighth Semester" : `Semester ${activeSem}`
        );

        return (
            <div
                ref={ref}
                className="relative w-full max-w-205 bg-white text-black font-serif border-t-4 border-t-[#c9a961] border-x border-b border-black p-8 mx-auto overflow-hidden shadow-none print:border-none print:p-0"
            >
                {/* Background SVG Watermark Seal */}
                <div
                    className="absolute inset-0 pointer-events-none flex items-center justify-center p-4"
                    style={{ opacity: 0.14, zIndex: 0 }}
                >
                    <div className="w-112.5 h-112.5 max-w-[85%] max-h-[85%] flex items-center justify-center">
                        <AnvikshaWatermark />
                    </div>
                </div>

                <div className="relative z-10 space-y-5 text-black">
                    {/* Header */}
                    <div className="text-center border-b-2 border-black pb-4 space-y-1.5">
                        <div className="flex items-center justify-between font-sans mb-1 text-[10.5px]">
                            <span className="uppercase tracking-widest text-neutral-600 font-medium">
                                Prepared with <strong className="text-black font-bold">Anviksha</strong>
                            </span>
                            <span className="font-mono font-bold text-[#c9a961] bg-[#060608] px-2 py-0.5 rounded text-[10px]">
                                https://anviksha-eta.vercel.app
                            </span>
                        </div>
                        <h1 className="text-2xl font-bold uppercase tracking-wider text-black">
                            {docTitle}
                        </h1>
                        <p className="text-xs text-neutral-600 font-sans italic">
                            {docSub}
                        </p>
                        <p className="text-xs font-bold text-black uppercase tracking-wide pt-1">
                            {profile?.prgname || "Bachelor of Technology"}
                        </p>
                    </div>

                    {/* Student Info Grid */}
                    <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-xs font-sans border-b border-black pb-4">
                        <div className="flex items-start gap-3">
                            <span className="text-neutral-600 min-w-28 font-medium shrink-0">Name :</span>
                            <span className="font-bold uppercase text-black leading-tight break-words">{profile?.stname || "N/A"}</span>
                        </div>
                        <div className="flex items-start gap-3">
                            <span className="text-neutral-600 min-w-28 font-medium shrink-0">Semester :</span>
                            <span className="font-bold text-black leading-tight">{semRoman}</span>
                        </div>
                        <div className="flex items-start gap-3">
                            <span className="text-neutral-600 min-w-28 font-medium shrink-0">Enrollment No :</span>
                            <span className="font-bold text-black leading-tight">{profile?.nrollno || "N/A"}</span>
                        </div>
                        <div className="flex items-start gap-3">
                            <span className="text-neutral-600 min-w-28 font-medium shrink-0">Institution :</span>
                            <span className="font-bold text-black leading-snug break-words">{profile?.iname || "GGSIPU"}</span>
                        </div>
                    </div>

                    {/* Subject Table */}
                    <table className="w-full text-xs font-sans border-collapse border border-black text-center">
                        <caption className="sr-only">Academic Marks Breakdown Table</caption>
                        <thead>
                            <tr className="bg-[#18181b] text-white uppercase text-[10px] font-bold border-b border-black">
                                <th className="border border-black p-2 text-left">Code</th>
                                <th className="border border-black p-2 text-left">Paper Title</th>
                                <th className="border border-black p-2">Credit</th>
                                <th className="border border-black p-2">INT</th>
                                <th className="border border-black p-2">EXT</th>
                                <th className="border border-black p-2">Total</th>
                                <th className="border border-black p-2">Grade</th>
                                <th className="border border-black p-2">GP</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tableRows.map((row, idx) => (
                                <tr key={idx} className="border-b border-neutral-300">
                                    <td className="border border-black p-1.5 text-left font-bold">{row.paperCode}</td>
                                    <td className="border border-black p-1.5 text-left font-medium">{row.subjectTitle}</td>
                                    <td className="border border-black p-1.5">{row.credit}</td>
                                    <td className="border border-black p-1.5 text-neutral-700">{row.internalMarks || "–"}</td>
                                    <td className="border border-black p-1.5 text-neutral-700">{row.externalMarks || "–"}</td>
                                    <td className="border border-black p-1.5 font-bold">{row.totalMarks}</td>
                                    <td className={`border border-black p-1.5 ${row.gradeColorClass}`}>{row.grade}</td>
                                    <td className="border border-black p-1.5 font-semibold">{row.points}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Summary Box */}
                    <div className="border border-black border-dashed p-3.5 font-sans flex justify-around text-xs text-center rounded-sm">
                        <div>
                            <span className="block text-[10px] text-neutral-600 uppercase font-bold">Total Credits</span>
                            <span className="font-bold text-sm text-black">{totalCredits}</span>
                        </div>
                        <div>
                            <span className="block text-[10px] text-neutral-600 uppercase font-bold">Earned Credits</span>
                            <span className="font-bold text-sm text-emerald-800">{earnedCredits}</span>
                        </div>
                        <div>
                            <span className="block text-[10px] text-neutral-600 uppercase font-bold">
                                {isOverall ? "Overall CGPA" : "SGPA"}
                            </span>
                            <span className="font-extrabold text-base text-amber-700">{sgpa}</span>
                        </div>
                    </div>

                    {/* Disclaimer Footer */}
                    <div className="pt-2 text-[10px] font-sans text-neutral-600 text-center border-t border-black">
                        <p>
                            <strong>UNOFFICIAL COPY:</strong> Reproduced from student result data for personal reference. Not an official transcript issued by GGSIPU.
                        </p>
                    </div>
                </div>
            </div>
        );
    }
);

ResultGradeSheet.displayName = "ResultGradeSheet";
