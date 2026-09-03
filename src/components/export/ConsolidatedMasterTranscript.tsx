"use client";

import React, { forwardRef, useMemo } from "react";
import { StudentProfile } from "@/types/result";
import { decodeStatus } from "@/lib/academic/academic-engine";
import { AnvikshaWatermark } from "./AnvikshaWatermark";

function getGradeAndPoints(rawTotal: string | number | undefined) {
    const total = Number(rawTotal);
    if (isNaN(total)) return { grade: "F", points: 0, pass: false };
    if (total >= 90) return { grade: "O", points: 10, pass: true };
    if (total >= 75) return { grade: "A+", points: 9, pass: true };
    if (total >= 65) return { grade: "A", points: 8, pass: true };
    if (total >= 55) return { grade: "B+", points: 7, pass: true };
    if (total >= 50) return { grade: "B", points: 6, pass: true };
    if (total >= 45) return { grade: "C", points: 5, pass: true };
    if (total >= 40) return { grade: "P", points: 4, pass: true };
    return { grade: "F", points: 0, pass: false };
}

function getFallbackCredit(subjectTitle: string): number {
    const title = (subjectTitle || "").toUpperCase();
    if (title.includes("LAB") || title.includes("PRACTICAL") || title.includes("STUDIO")) return 1;
    return 3;
}

function getDivision(cgpa: number, backlogs: number): string {
    if (cgpa >= 10.0 && backlogs === 0) return "Exemplary Performance";
    if (cgpa >= 6.50) return "First Division";
    if (cgpa >= 5.00) return "Second Division";
    if (cgpa >= 4.00) return "Third Division";
    return "Unqualified for Degree (< 4.00)";
}

interface Props {
    profile?: StudentProfile | null;
    allResults: any[][];
    customCredits?: Record<string, number | null>;
}

export const ConsolidatedMasterTranscript = forwardRef<HTMLDivElement, Props>(
    ({ profile, allResults, customCredits = {} }, ref) => {
        const {
            semesterSummaries,
            sortedSemesters,
            overallTotalCredits,
            overallEarnedCredits,
            overallCgpa,
            overallPercentage,
            division,
            totalActiveBacklogs,
            currentDate,
        } = useMemo(() => {
            // Group results semester-wise
            const semMap: Record<number, any[]> = {};
            allResults.forEach((row) => {
                const semNum = Number(row[0]);
                if (!semMap[semNum]) semMap[semNum] = [];
                semMap[semNum].push(row);
            });

            const sorted = Object.keys(semMap)
                .map(Number)
                .sort((a, b) => a - b);

            let totalCreds = 0;
            let earnedCreds = 0;
            let weightedPts = 0;
            let activeBacks = 0;

            const summaries = sorted.map((semNum) => {
                const rows = semMap[semNum];
                let semCredits = 0;
                let semEarnedCredits = 0;
                let semPoints = 0;
                let semObtained = 0;
                let semBacklogs = 0;

                rows.forEach((row) => {
                    const rawTotal = row[5];
                    const statusCode = row[6];
                    const paperCode = row[1];
                    const subjectTitle = row[2];
                    const hasCustom = paperCode in customCredits || (typeof paperCode === "string" && paperCode.toUpperCase() in customCredits);
                    const customVal = customCredits[paperCode] !== undefined ? customCredits[paperCode] : (typeof paperCode === "string" ? customCredits[paperCode.toUpperCase()] : undefined);
                    const credit = hasCustom ? (customVal ?? 0) : getFallbackCredit(subjectTitle);

                    const semantic = decodeStatus(statusCode, rawTotal);
                    const { grade, points, pass } = getGradeAndPoints(rawTotal);

                    const isPassed = (semantic === "PASS" || semantic === "CREDIT_SECURED" || semantic === "ALREADY_PASSED") || (pass && grade !== "F" && semantic !== "NOT_CLEARED" && semantic !== "ABSENT" && semantic !== "DETAINED");

                    semCredits += credit;
                    const numTot = Number(rawTotal);
                    semObtained += !isNaN(numTot) ? numTot : 0;

                    if (isPassed) {
                        semEarnedCredits += credit;
                        semPoints += points * credit;
                    } else {
                        semBacklogs += 1;
                        activeBacks += 1;
                    }
                });

                const semSgpa = semCredits > 0 ? (semPoints / semCredits).toFixed(2) : "0.00";
                const semMax = rows.length * 100;

                totalCreds += semCredits;
                earnedCreds += semEarnedCredits;
                weightedPts += semPoints;

                return {
                    semNum,
                    subjectCount: rows.length,
                    totalCredits: semCredits,
                    earnedCredits: semEarnedCredits,
                    sgpa: semSgpa,
                    obtainedMarks: semObtained,
                    maxMarks: semMax,
                    backlogs: semBacklogs,
                    status: semBacklogs === 0 ? "PASS" : `BACK (${semBacklogs})`,
                };
            });

            const cgpa = totalCreds > 0 ? (weightedPts / totalCreds).toFixed(2) : "0.00";
            const percent = (Number(cgpa) * 10).toFixed(2);
            const division = getDivision(Number(cgpa), activeBacks);

            const date = new Date().toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
            });

            return {
                semesterSummaries: summaries,
                sortedSemesters: sorted,
                overallTotalCredits: totalCreds,
                overallEarnedCredits: earnedCreds,
                overallCgpa: cgpa,
                overallPercentage: percent,
                division,
                totalActiveBacklogs: activeBacks,
                currentDate: date,
            };
        }, [allResults, customCredits]);

        return (
            <div
                ref={ref}
                className="relative w-198.5 min-h-280.75 bg-white text-black font-sans border-t-4 border-t-gold p-8 mx-auto overflow-hidden shadow-none box-border flex flex-col justify-between"
            >
                {/* Background Vector Seal */}
                <div
                    className="absolute inset-0 pointer-events-none flex items-center justify-center p-6 opacity-10 z-0"
                >
                    <div className="w-105 h-105 flex items-center justify-center">
                        <AnvikshaWatermark />
                    </div>
                </div>

                <div className="relative z-10 space-y-4">
                    {/* Top Header */}
                    <div className="border-b-2 border-black pb-3">
                        <div className="flex items-center justify-between text-[9px] uppercase tracking-widest text-neutral-500 font-mono mb-1">
                            <span>Guru Gobind Singh Indraprastha University</span>
                            <span>Date of Generation: {currentDate}</span>
                        </div>
                        <div className="text-center space-y-0.5">
                            <h1 className="text-xl font-extrabold uppercase tracking-tight text-black font-sans">
                                Consolidated Academic Transcript
                            </h1>
                            <p className="text-[11px] font-medium text-neutral-600 uppercase tracking-wider font-mono">
                                Cumulative Performance & Academic Standing (Ordinance 11)
                            </p>
                        </div>
                    </div>

                    {/* Student Metadata Box */}
                    <div className="bg-neutral-50 border border-neutral-800 rounded p-3.5 text-[11px] font-mono grid grid-cols-2 gap-x-8 gap-y-2">
                        <div className="flex items-start gap-3 border-b border-neutral-200 pb-1.5">
                            <span className="text-neutral-500 uppercase font-semibold shrink-0 min-w-28">Student Name :</span>
                            <span className="font-bold text-black uppercase leading-tight break-words">{profile?.stname || "N/A"}</span>
                        </div>
                        <div className="flex items-start gap-3 border-b border-neutral-200 pb-1.5">
                            <span className="text-neutral-500 uppercase font-semibold shrink-0 min-w-28">Enrollment No :</span>
                            <span className="font-bold text-black leading-tight">{profile?.nrollno || "N/A"}</span>
                        </div>
                        <div className="flex items-start gap-3 border-b border-neutral-200 pb-1.5">
                            <span className="text-neutral-500 uppercase font-semibold shrink-0 min-w-28">Program :</span>
                            <span className="font-bold text-black leading-tight break-words">{profile?.prgname || "B.Tech"} {profile?.prgcode ? `(${profile.prgcode})` : ""}</span>
                        </div>
                        <div className="flex items-start gap-3 border-b border-neutral-200 pb-1.5">
                            <span className="text-neutral-500 uppercase font-semibold shrink-0 min-w-28">Batch / Year :</span>
                            <span className="font-bold text-black leading-tight">{profile?.byoa || "N/A"}</span>
                        </div>
                        <div className="col-span-2 flex items-start gap-3 pt-0.5">
                            <span className="text-neutral-500 uppercase font-semibold shrink-0 min-w-28">Institution :</span>
                            <span className="font-bold text-black leading-snug break-words">{profile?.iname || "GGSIPU Affiliated College"}</span>
                        </div>
                    </div>

                    {/* Semester-by-Semester Matrix Table */}
                    <div className="space-y-1.5 pt-1">
                        <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-black font-mono">
                            <span>Semester-wise Academic Evaluation</span>
                            <span className="text-neutral-500 font-normal">
                                {sortedSemesters.length} Semesters Evaluated
                            </span>
                        </div>

                        <table className="w-full text-[11px] font-mono border-collapse border border-black text-center print:break-inside-auto">
                            <caption className="sr-only">Official GGSIPU Semester-wise Academic Evaluation Matrix</caption>
                            <thead className="print:table-header-group">
                                <tr className="bg-neutral-900 text-white uppercase text-[9.5px] font-bold tracking-wider">
                                    <th scope="col" className="border border-black p-2 text-left">Semester</th>
                                    <th scope="col" className="border border-black p-2">Subjects</th>
                                    <th scope="col" className="border border-black p-2">Credits Offered</th>
                                    <th scope="col" className="border border-black p-2">Credits Earned</th>
                                    <th scope="col" className="border border-black p-2">Total Score</th>
                                    <th scope="col" className="border border-black p-2">SGPA</th>
                                    <th scope="col" className="border border-black p-2">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {semesterSummaries.map((sem, idx) => (
                                    <tr key={idx} className={`print:break-inside-avoid ${idx % 2 === 0 ? "bg-white" : "bg-neutral-50"}`}>
                                        <th scope="row" className="border border-black p-2 text-left font-bold text-black">
                                            Semester {sem.semNum}
                                        </th>
                                        <td className="border border-black p-2 text-neutral-600">{sem.subjectCount}</td>
                                        <td className="border border-black p-2 font-medium">{sem.totalCredits}</td>
                                        <td className="border border-black p-2 font-bold text-black">{sem.earnedCredits}</td>
                                        <td className="border border-black p-2 text-neutral-700">
                                            {sem.obtainedMarks} / {sem.maxMarks}
                                        </td>
                                        <td className="border border-black p-2 font-extrabold text-amber-700 text-xs">
                                            {sem.sgpa}
                                        </td>
                                        <td className="border border-black p-2 font-bold">
                                            {sem.backlogs === 0 ? (
                                                <span className="text-emerald-800 font-bold">PASS</span>
                                            ) : (
                                                <span className="text-red-700 font-bold">FAIL ({sem.backlogs})</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Official Cumulative Summary Box */}
                    <div className="pt-2">
                        <div className="border-2 border-black bg-neutral-50 rounded-md p-3.5 space-y-3 font-mono">
                            <div className="text-[10px] font-bold uppercase tracking-widest text-neutral-700 border-b border-black pb-1.5 flex justify-between items-center">
                                <span>Cumulative Academic Performance Summary</span>
                                <span className="text-neutral-500 font-normal">GGSIPU Ordinance 11 Standard</span>
                            </div>

                            <div className="grid grid-cols-4 gap-3 text-center">
                                <div className="p-2 border border-neutral-300 rounded bg-white">
                                    <div className="text-[9px] uppercase font-bold text-neutral-500">Cumulative CGPA</div>
                                    <div className="text-xl font-extrabold text-amber-700 mt-0.5 leading-none">{overallCgpa}</div>
                                    <div className="text-[8.5px] text-neutral-400 mt-1">out of 10.0 scale</div>
                                </div>

                                <div className="p-2 border border-neutral-300 rounded bg-white">
                                    <div className="text-[9px] uppercase font-bold text-neutral-500">Equivalent %</div>
                                    <div className="text-xl font-extrabold text-black mt-0.5 leading-none">{overallPercentage}%</div>
                                    <div className="text-[8.5px] text-neutral-400 mt-1">CGPA × 10.0 Formula</div>
                                </div>

                                <div className="p-2 border border-neutral-300 rounded bg-white">
                                    <div className="text-[9px] uppercase font-bold text-neutral-500">Total Credits</div>
                                    <div className="text-xl font-extrabold text-black mt-0.5 leading-none">
                                        {overallEarnedCredits} <span className="text-xs text-neutral-400 font-normal">/ {overallTotalCredits}</span>
                                    </div>
                                    <div className="text-[8.5px] text-neutral-400 mt-1">
                                        {overallTotalCredits > 0 ? `${((overallEarnedCredits / overallTotalCredits) * 100).toFixed(0)}% Earned` : "0%"}
                                    </div>
                                </div>

                                <div className="p-2 border border-neutral-300 rounded bg-white">
                                    <div className="text-[9px] uppercase font-bold text-neutral-500">Academic Standing</div>
                                    <div className="text-xs font-extrabold uppercase text-black mt-1 leading-tight">
                                        {division}
                                    </div>
                                    <div className="text-[8.5px] text-neutral-400 mt-1">
                                        {totalActiveBacklogs === 0 ? "0 Active Backlogs" : `${totalActiveBacklogs} Active Backlog(s)`}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Official Notes for Verification */}
                    <div className="bg-neutral-50 border border-neutral-300 rounded p-2.5 text-[9.5px] font-mono text-neutral-700 space-y-1">
                        <div className="font-bold text-black uppercase tracking-wider text-[10px]">
                            Evaluation & Conversion Guidelines:
                        </div>
                        <ul className="list-disc pl-4 space-y-0.5 leading-tight">
                            <li>
                                <strong>Percentage Formula: </strong>Per GGSIPU Examination Gazette (Ordinance 11), equivalent percentage is computed as <code>Percentage = CGPA × 10.0</code>.
                            </li>
                            <li>
                                <strong>Credit Allocation: </strong>Theory papers carry 3–4 credits, practical/laboratory sessions carry 1 credit per approved scheme.
                            </li>
                            <li>
                                <strong>Passing Threshold: </strong>Ordinance 11 baseline passing grade is Grade P (40% aggregate marks) in each individual subject paper.
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Footer Disclaimer */}
                <div className="relative z-10 pt-3 border-t border-black text-[9px] font-mono text-neutral-500 flex justify-between items-center">
                    <span>Generated via <strong>Anviksha Academic Engine</strong></span>
                    <span>UNOFFICIAL ACADEMIC TRANSCRIPT • FOR VERIFICATION & RECRUITMENT REFERENCE</span>
                </div>
            </div>
        );
    }
);

ConsolidatedMasterTranscript.displayName = "ConsolidatedMasterTranscript";
