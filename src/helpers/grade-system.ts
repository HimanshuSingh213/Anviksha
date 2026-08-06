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