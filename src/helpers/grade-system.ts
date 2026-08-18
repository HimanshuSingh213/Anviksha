export function getGradeAndPoints(total: number) {
    if (total >= 90) return { grade: "O", points: 10, pass: true };
    if (total >= 75) return { grade: "A+", points: 9, pass: true };
    if (total >= 65) return { grade: "A", points: 8, pass: true };
    if (total >= 55) return { grade: "B+", points: 7, pass: true };
    if (total >= 50) return { grade: "B", points: 6, pass: true };
    if (total >= 45) return { grade: "C", points: 5, pass: true };
    if (total >= 40) return { grade: "P", points: 4, pass: true };
    return { grade: "F", points: 0, pass: false };
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
        default:
            return "bg-grade-fail-surface text-grade-fail border-grade-fail-border";
    }
}

export function getDefaultCredit(subjectTitle: string): number {
    const title = (subjectTitle || "").toUpperCase();
    if (title.includes("LAB") || title.includes("PRACTICAL")) return 1;
    return 3;
}

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
            const rawTotal = Number(row[5]);
            const total = isNaN(rawTotal) ? 0 : rawTotal;
            const paperCode = row[1];
            const subjectTitle = row[2];
            const credit = customCredit[paperCode] ?? getDefaultCredit(subjectTitle);
            const { pass } = getGradeAndPoints(total);

            totalCredits += credit;
            if (pass) {
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