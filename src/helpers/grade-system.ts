// Centralised GGSIPU Academic Rules & Grading Engine
// Follows GGSIPU Ordinance 11 (amended) and official ExamWeb data specifications

export type ResultState = "CLEARED" | "BACK" | "ABSENT" | "DETAINED" | "UNKNOWN";

/**
 * Resolves official result state from GGSIPU status code and raw total value.
 * Status '08' = CLEARED
 * Status '09' = NOT CLEARED (distinguished by total: ABS -> ABSENT, DET -> DETAINED, numeric -> BACK)
 */
export function getResultState(
    status: string | number | undefined,
    rawTotal: string | number | undefined
): ResultState {
    const s = String(status ?? "").trim();
    const tot = String(rawTotal ?? "").trim().toUpperCase();

    if (s === "08") {
        return "CLEARED";
    }

    if (s === "09") {
        if (tot === "ABS" || tot.includes("ABS")) return "ABSENT";
        if (tot === "DET" || tot.includes("DET")) return "DETAINED";
        if (!isNaN(Number(tot))) return "BACK";
        return "UNKNOWN";
    }

    // Fallback if status code is missing
    if (tot === "ABS" || tot.includes("ABS")) return "ABSENT";
    if (tot === "DET" || tot.includes("DET")) return "DETAINED";

    const num = Number(tot);
    if (!isNaN(num)) {
        return num >= 40 ? "CLEARED" : "BACK";
    }

    return "UNKNOWN";
}

/**
 * Maps numeric official marks to GGSIPU Ordinance 11 Grade and Grade Points.
 * P (4) is the Ordinance 11 passing grade unless the programme scheme specifies otherwise.
 */
export function getGradeAndPoints(rawTotal: string | number | undefined) {
    const totStr = String(rawTotal ?? "").trim().toUpperCase();

    if (totStr === "ABS" || totStr.includes("ABS")) {
        return { grade: "ABS", points: 0, pass: false, isNumeric: false };
    }
    if (totStr === "DET" || totStr.includes("DET")) {
        return { grade: "DET", points: 0, pass: false, isNumeric: false };
    }

    const total = Number(totStr);
    if (isNaN(total)) {
        return { grade: "F", points: 0, pass: false, isNumeric: false };
    }

    if (total >= 90) return { grade: "O", points: 10, pass: true, isNumeric: true };
    if (total >= 75) return { grade: "A+", points: 9, pass: true, isNumeric: true };
    if (total >= 65) return { grade: "A", points: 8, pass: true, isNumeric: true };
    if (total >= 55) return { grade: "B+", points: 7, pass: true, isNumeric: true };
    if (total >= 50) return { grade: "B", points: 6, pass: true, isNumeric: true };
    if (total >= 45) return { grade: "C", points: 5, pass: true, isNumeric: true };
    if (total >= 40) return { grade: "P", points: 4, pass: true, isNumeric: true };
    return { grade: "F", points: 0, pass: false, isNumeric: true };
}

export function getGradeThemeClasses(grade: string) {
    switch (grade) {
        case "O":
        case "A+":
            return "bg-grade-excellent-surface text-grade-excellent border-grade-excellent-border";
        case "A":
        case "B+":
            return "bg-grade-good-surface text-grade-good border-grade-good-border";
        case "B":
        case "C":
            return "bg-grade-average-surface text-grade-average border-grade-average-border";
        case "P":
            return "bg-grade-pass-surface text-grade-pass border-grade-pass-border";
        case "ABS":
        case "DET":
            return "bg-surface-deep text-foreground-muted border-border-strong";
        default:
            return "bg-grade-fail-surface text-grade-fail border-grade-fail-border";
    }
}

/**
 * Fallback credit heuristic when official scheme credits are not available.
 * Marked as estimated in calculations.
 */
export function getFallbackCredit(subjectTitle: string): number {
    const title = (subjectTitle || "").toUpperCase();
    if (title.includes("LAB") || title.includes("PRACTICAL") || title.includes("STUDIO")) return 1;
    return 3;
}

// Backward compatibility alias
export const getDefaultCredit = getFallbackCredit;

export interface AcademicYearStatus {
    yearNumber: number;
    yearLabel: string;
    semesters: number[];
    totalCredits: number;
    earnedCredits: number;
    percentage: number;
    status: "PROMOTED" | "YEAR_BACK_RISK" | "IN_PROGRESS" | "UPCOMING";
    hasOddSem: boolean;
    hasEvenSem: boolean;
    requiredCredits: number;
    creditsDeficit: number;
}

/**
 * Evaluates Ordinance 11 50% annual credit promotion baseline.
 * Rule: Student must obtain >= 50% of the total credits offered in the academic year.
 */
export function getAcademicPromotionStatus(
    allResults: any[][],
    customCredit: Record<string, number> = {}
): {
    years: AcademicYearStatus[];
    hasDetentionRisk: boolean;
    activeYear: number;
} {
    const yearPairs: [number, number][] = [
        [1, 2],
        [3, 4],
        [5, 6],
        [7, 8],
    ];

    const yearLabels = ["1st Year", "2nd Year", "3rd Year", "4th Year"];
    let hasDetentionRisk = false;
    let maxSemFound = 0;

    const years: AcademicYearStatus[] = yearPairs.map(([oddSem, evenSem], index) => {
        const yearNumber = index + 1;
        const yearLabel = yearLabels[index];

        const oddRows = allResults.filter((r) => Number(r[0]) === oddSem);
        const evenRows = allResults.filter((r) => Number(r[0]) === evenSem);

        const hasOddSem = oddRows.length > 0;
        const hasEvenSem = evenRows.length > 0;

        if (hasOddSem && oddSem > maxSemFound) maxSemFound = oddSem;
        if (hasEvenSem && evenSem > maxSemFound) maxSemFound = evenSem;

        if (!hasOddSem && !hasEvenSem) {
            return {
                yearNumber,
                yearLabel,
                semesters: [oddSem, evenSem],
                totalCredits: 0,
                earnedCredits: 0,
                percentage: 0,
                status: "UPCOMING",
                hasOddSem: false,
                hasEvenSem: false,
                requiredCredits: 0,
                creditsDeficit: 0,
            };
        }

        let totalCredits = 0;
        let earnedCredits = 0;

        const allYearRows = [...oddRows, ...evenRows];
        allYearRows.forEach((row) => {
            const rawTotal = row[5];
            const statusCode = row[6];
            const paperCode = row[1];
            const subjectTitle = row[2];
            const credit = customCredit[paperCode] ?? getFallbackCredit(subjectTitle);

            const resultState = getResultState(statusCode, rawTotal);
            const { pass } = getGradeAndPoints(rawTotal);

            totalCredits += credit;
            // Passed if result state is CLEARED or numeric pass
            if (resultState === "CLEARED" || (resultState !== "BACK" && resultState !== "ABSENT" && resultState !== "DETAINED" && pass)) {
                earnedCredits += credit;
            }
        });

        const percentage = totalCredits > 0 ? (earnedCredits / totalCredits) * 100 : 0;
        const requiredCredits = Math.ceil(totalCredits * 0.5);
        const creditsDeficit = Math.max(0, requiredCredits - earnedCredits);

        let status: AcademicYearStatus["status"] = "IN_PROGRESS";

        if (hasOddSem && hasEvenSem) {
            if (percentage >= 50) {
                status = "PROMOTED";
            } else {
                status = "YEAR_BACK_RISK";
                hasDetentionRisk = true;
            }
        } else if (hasOddSem && !hasEvenSem) {
            status = "IN_PROGRESS";
        }

        return {
            yearNumber,
            yearLabel,
            semesters: [oddSem, evenSem],
            totalCredits,
            earnedCredits,
            percentage: Number(percentage.toFixed(1)),
            status,
            hasOddSem,
            hasEvenSem,
            requiredCredits,
            creditsDeficit,
        };
    });

    const activeYear = Math.max(1, Math.ceil(maxSemFound / 2));

    return {
        years,
        hasDetentionRisk,
        activeYear,
    };
}

export interface PlacementTier {
    id: string;
    name: string;
    benchmarkLabel: string;
    minCgpa: number;
    minPercentage: number;
    maxActiveBacklogs: number;
    description: string;
    exampleCompanies: string[];
    isEligible: boolean;
    cgpaDeficit: number;
    backlogDeficit: number;
    statusReason: string;
}

export interface PlacementEligibilitySummary {
    cgpa: number;
    percentage: number;
    activeBacklogs: number;
    eligibleTierCount: number;
    totalTierCount: number;
    overallEligibilityRate: number;
    highestUnlockedTier: string | null;
    nextTargetTier: PlacementTier | null;
    tiers: PlacementTier[];
}

export const PLACEMENT_TIERS_CONFIG: Array<Omit<PlacementTier, "isEligible" | "cgpaDeficit" | "backlogDeficit" | "statusReason">> = [
    {
        id: "benchmark_60",
        name: "60% Base Benchmark",
        benchmarkLabel: "≥ 6.00 CGPA (60%)",
        minCgpa: 6.0,
        minPercentage: 60.0,
        maxActiveBacklogs: 0,
        description: "Common baseline threshold for corporate drives & mass recruitment eligibility.",
        exampleCompanies: ["TCS", "Infosys", "Wipro", "Cognizant", "Capgemini", "Tech Mahindra"],
    },
    {
        id: "benchmark_65",
        name: "65% Consulting & IT Benchmark",
        benchmarkLabel: "≥ 6.50 CGPA (65%)",
        minCgpa: 6.5,
        minPercentage: 65.0,
        maxActiveBacklogs: 0,
        description: "Standard threshold for consulting, financial technology, and IT analyst roles.",
        exampleCompanies: ["Deloitte", "Accenture", "IBM", "EY", "HCLTech", "Nagarro"],
    },
    {
        id: "benchmark_70",
        name: "70% Product & Core Benchmark",
        benchmarkLabel: "≥ 7.00 CGPA (70%)",
        minCgpa: 7.0,
        minPercentage: 70.0,
        maxActiveBacklogs: 0,
        description: "Standard baseline for core engineering, product divisions, and R&D roles.",
        exampleCompanies: ["Amazon", "Microsoft", "Cisco", "Samsung", "Oracle", "Qualcomm"],
    },
    {
        id: "benchmark_75",
        name: "75%+ Premium Tier Benchmark",
        benchmarkLabel: "≥ 7.50 CGPA (75%)",
        minCgpa: 7.5,
        minPercentage: 75.0,
        maxActiveBacklogs: 0,
        description: "Benchmark for competitive quantitative, specialized research, and high-tier technical drives.",
        exampleCompanies: ["Google", "Tower Research", "D.E. Shaw", "Goldman Sachs", "Sprinklr", "Atlassian"],
    },
];

export function getPlacementEligibility(
    cgpa: number,
    activeBacklogs: number
): PlacementEligibilitySummary {
    const validCgpa = isNaN(cgpa) ? 0 : Math.max(0, cgpa);
    const validBacklogs = isNaN(activeBacklogs) ? 0 : Math.max(0, activeBacklogs);
    const percentage = Number((validCgpa * 10).toFixed(2));

    const evaluatedTiers: PlacementTier[] = PLACEMENT_TIERS_CONFIG.map((tier) => {
        const cgpaMet = validCgpa >= tier.minCgpa;
        const backlogMet = validBacklogs <= tier.maxActiveBacklogs;
        const isEligible = cgpaMet && backlogMet;

        const cgpaDeficit = cgpaMet ? 0 : Number((tier.minCgpa - validCgpa).toFixed(2));
        const backlogDeficit = backlogMet ? 0 : validBacklogs - tier.maxActiveBacklogs;

        let statusReason = "Meets benchmark requirements (0 active backlogs)";
        if (!cgpaMet && !backlogMet) {
            statusReason = `Requires +${cgpaDeficit} CGPA & clearing ${backlogDeficit} backlog(s)`;
        } else if (!cgpaMet) {
            statusReason = `Requires +${cgpaDeficit} CGPA to reach benchmark`;
        } else if (!backlogMet) {
            statusReason = `Requires clearing ${backlogDeficit} active backlog(s)`;
        }

        return {
            ...tier,
            isEligible,
            cgpaDeficit,
            backlogDeficit,
            statusReason,
        };
    });

    const eligibleTiers = evaluatedTiers.filter((t) => t.isEligible);
    const eligibleTierCount = eligibleTiers.length;
    const totalTierCount = evaluatedTiers.length;
    const overallEligibilityRate = Number(((eligibleTierCount / totalTierCount) * 100).toFixed(0));

    const highestUnlockedTier = eligibleTiers.length > 0 ? eligibleTiers[eligibleTiers.length - 1].name : null;
    const nextTargetTier = evaluatedTiers.find((t) => !t.isEligible) || null;

    return {
        cgpa: validCgpa,
        percentage,
        activeBacklogs: validBacklogs,
        eligibleTierCount,
        totalTierCount,
        overallEligibilityRate,
        highestUnlockedTier,
        nextTargetTier,
        tiers: evaluatedTiers,
    };
}

export interface ReappearSubject {
    semester: number;
    paperCode: string;
    subjectTitle: string;
    marks: number | string;
    maxMarks: number;
    credit: number;
    isOddSem: boolean;
    resultState: ResultState;
    sessionType: "ODD_TERM" | "EVEN_TERM";
    sessionWindow: string;
    priority: "HIGH" | "MEDIUM" | "STANDARD";
    priorityReason: string;
}

export interface ReappearSessionPlan {
    totalBacklogs: number;
    totalCreditsAtRisk: number;
    oddTermBacklogs: ReappearSubject[];
    evenTermBacklogs: ReappearSubject[];
    oddTermCredits: number;
    evenTermCredits: number;
    nextRecommendedSession: "ODD" | "EVEN" | "NONE";
    nextSessionLabel: string;
    cleanRecord: boolean;
}

export function getReappearSessionPlan(
    allResults: any[][],
    customCredits: Record<string, number> = {}
): ReappearSessionPlan {
    const oddTermBacklogs: ReappearSubject[] = [];
    const evenTermBacklogs: ReappearSubject[] = [];
    let totalCreditsAtRisk = 0;

    let maxSemEvaluated = 0;
    allResults.forEach((row) => {
        const semNum = Number(row[0]);
        if (!isNaN(semNum) && semNum >= 1 && semNum <= 8 && semNum > maxSemEvaluated) {
            maxSemEvaluated = semNum;
        }
    });

    allResults.forEach((row) => {
        const semNum = Number(row[0]);
        if (isNaN(semNum) || semNum < 1 || semNum > 8) return;

        const rawTotal = row[5];
        const statusCode = row[6];
        const paperCode = String(row[1] ?? "");
        const subjectTitle = String(row[2] ?? "");
        const credit = customCredits[paperCode] ?? getFallbackCredit(subjectTitle);

        const resultState = getResultState(statusCode, rawTotal);
        const { pass } = getGradeAndPoints(rawTotal);

        const isUnsuccessful = resultState === "BACK" || resultState === "ABSENT" || resultState === "DETAINED" || !pass;

        if (isUnsuccessful) {
            const isOddSem = semNum % 2 !== 0;
            totalCreditsAtRisk += credit;

            let priority: "HIGH" | "MEDIUM" | "STANDARD" = "STANDARD";
            let priorityReason = "Standard re-appear timeline";

            if (resultState === "DETAINED") {
                priority = "HIGH";
                priorityReason = "Attendance / Course Detention (Registration Required)";
            } else if (semNum <= 2 && maxSemEvaluated >= 3) {
                priority = "HIGH";
                priorityReason = "First Year Backlog (Promotional Standing Critical)";
            } else if (credit >= 4) {
                priority = "HIGH";
                priorityReason = `High Credit Weight (${credit} Credits Impact)`;
            } else if (semNum % 2 !== maxSemEvaluated % 2) {
                priority = "MEDIUM";
                priorityReason = "Immediate Upcoming Exam Window";
            }

            const item: ReappearSubject = {
                semester: semNum,
                paperCode,
                subjectTitle,
                marks: isNaN(Number(rawTotal)) ? String(rawTotal || "–") : Number(rawTotal),
                maxMarks: 100,
                credit,
                isOddSem,
                resultState,
                sessionType: isOddSem ? "ODD_TERM" : "EVEN_TERM",
                sessionWindow: isOddSem ? "Typical Nov - Dec Winter Window" : "Typical May - Jun Summer Window",
                priority,
                priorityReason,
            };

            if (isOddSem) {
                oddTermBacklogs.push(item);
            } else {
                evenTermBacklogs.push(item);
            }
        }
    });

    // Sort high priority first
    const priorityOrder = { HIGH: 0, MEDIUM: 1, STANDARD: 2 };
    oddTermBacklogs.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority] || a.semester - b.semester);
    evenTermBacklogs.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority] || a.semester - b.semester);

    const oddTermCredits = oddTermBacklogs.reduce((acc, curr) => acc + curr.credit, 0);
    const evenTermCredits = evenTermBacklogs.reduce((acc, curr) => acc + curr.credit, 0);
    const totalBacklogs = oddTermBacklogs.length + evenTermBacklogs.length;
    const cleanRecord = totalBacklogs === 0;

    let nextRecommendedSession: "ODD" | "EVEN" | "NONE" = "NONE";
    let nextSessionLabel = "All Semesters Cleared";

    if (!cleanRecord) {
        const nextIsEven = maxSemEvaluated % 2 !== 0;
        if (nextIsEven) {
            nextRecommendedSession = evenTermBacklogs.length > 0 ? "EVEN" : oddTermBacklogs.length > 0 ? "ODD" : "NONE";
            nextSessionLabel = "Typical Upcoming: May - Jun (Even Term Re-appear)";
        } else {
            nextRecommendedSession = oddTermBacklogs.length > 0 ? "ODD" : evenTermBacklogs.length > 0 ? "EVEN" : "NONE";
            nextSessionLabel = "Typical Upcoming: Nov - Dec (Odd Term Re-appear)";
        }
    }

    return {
        totalBacklogs,
        totalCreditsAtRisk,
        oddTermBacklogs,
        evenTermBacklogs,
        oddTermCredits,
        evenTermCredits,
        nextRecommendedSession,
        nextSessionLabel,
        cleanRecord,
    };
}

export interface DivisionClassification {
    division: string;
    divisionCode: "EXEMPLARY" | "FIRST" | "SECOND" | "THIRD" | "UNQUALIFIED";
    minCgpa: number;
    nextTierMessage: string;
    progressPercent: number;
    isPass: boolean;
    exemplaryStatus?: "ELIGIBLE" | "INELIGIBLE" | "UNDETERMINED";
}

/**
 * Classifies academic division under revised GGSIPU Ordinance 11:
 * - 4.00–4.99: Third Division
 * - 5.00–6.49: Second Division
 * - 6.50+: First Division
 * - 10.00: Exemplary Performance ONLY if first-attempt and no academic break are verified.
 */
export function getDivisionClassification(
    cgpa: number,
    backlogsCount: number = 0,
    history?: { hasPassedAllFirstAttempt?: boolean; hasAcademicBreak?: boolean }
): DivisionClassification {
    const validCgpa = isNaN(cgpa) ? 0 : Math.max(0, cgpa);
    const validBacklogs = isNaN(backlogsCount) ? 0 : Math.max(0, backlogsCount);

    let division = "Unqualified for Degree (< 4.00)";
    let divisionCode: DivisionClassification["divisionCode"] = "UNQUALIFIED";
    let minCgpa = 0.0;
    let nextTierMessage = "";
    let isPass = false;
    let exemplaryStatus: DivisionClassification["exemplaryStatus"] = "UNDETERMINED";

    if (validCgpa >= 10.0 && validBacklogs === 0) {
        if (history?.hasPassedAllFirstAttempt === true && history?.hasAcademicBreak === false) {
            division = "Exemplary Performance";
            divisionCode = "EXEMPLARY";
            exemplaryStatus = "ELIGIBLE";
            minCgpa = 10.0;
            nextTierMessage = "Maximum distinction achieved (1st attempt verified)!";
        } else if (history?.hasPassedAllFirstAttempt === false || history?.hasAcademicBreak === true) {
            division = "First Division";
            divisionCode = "FIRST";
            exemplaryStatus = "INELIGIBLE";
            minCgpa = 6.5;
            nextTierMessage = "First Division (Exemplary requires 1st attempt clear & no academic break)";
        } else {
            // Historical attempt data cannot be conclusively determined from single marksheet
            division = "First Division";
            divisionCode = "FIRST";
            exemplaryStatus = "UNDETERMINED";
            minCgpa = 6.5;
            nextTierMessage = "CGPA 10.00 meets First Division (Exemplary requires 1st attempt history verification)";
        }
        isPass = true;
    } else if (validCgpa >= 6.50) {
        division = "First Division";
        divisionCode = "FIRST";
        minCgpa = 6.5;
        const gap = (10.0 - validCgpa).toFixed(2);
        nextTierMessage = validBacklogs > 0
            ? "Clear active backlogs for clean standing"
            : `+${gap} CGPA to reach 10.00 scale max`;
        isPass = true;
    } else if (validCgpa >= 5.00) {
        division = "Second Division";
        divisionCode = "SECOND";
        minCgpa = 5.0;
        const gap = (6.50 - validCgpa).toFixed(2);
        nextTierMessage = `+${gap} CGPA needed for First Division (6.50)`;
        isPass = true;
    } else if (validCgpa >= 4.00) {
        division = "Third Division";
        divisionCode = "THIRD";
        minCgpa = 4.0;
        const gap = (5.00 - validCgpa).toFixed(2);
        nextTierMessage = `+${gap} CGPA needed for Second Division (5.00)`;
        isPass = true;
    } else {
        division = "Unqualified for Degree (< 4.00)";
        divisionCode = "UNQUALIFIED";
        minCgpa = 0.0;
        const gap = (4.00 - validCgpa).toFixed(2);
        nextTierMessage = `+${gap} CGPA needed for passing threshold (4.00)`;
        isPass = false;
    }

    const progressPercent = Math.min(100, Math.max(0, (validCgpa / 10) * 100));

    return {
        division,
        divisionCode,
        minCgpa,
        nextTierMessage,
        progressPercent,
        isPass,
        exemplaryStatus,
    };
}