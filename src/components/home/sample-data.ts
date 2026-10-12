/** Grade badge styles (text + tinted fill + inset ring), keyed by tone. */
export const TONE = {
  excellent: "text-grade-excellent bg-grade-excellent-surface ring-grade-excellent-border",
  good: "text-grade-good bg-grade-good-surface ring-grade-good-border",
  average: "text-grade-average bg-grade-average-surface ring-grade-average-border",
  pass: "text-grade-pass bg-grade-pass-surface ring-grade-pass-border",
  fail: "text-grade-fail bg-grade-fail-surface ring-grade-fail-border",
} as const;

export type Tone = keyof typeof TONE;

/** Raw colour per tone, for bars and charts. */
export const TONE_COLOR: Record<Tone, string> = {
  excellent: "var(--grade-excellent)",
  good: "var(--grade-good)",
  average: "var(--grade-average)",
  pass: "var(--grade-pass)",
  fail: "var(--grade-fail)",
};

export interface Subject {
  code: string;
  name: string;
  credits: number;
  grade: string;
  gradePoints: number;
  tone: Tone;
}

// Sample B.Tech CSE marksheet. Every number on the homepage (hero card, engine
// tiles, transcript sheet) is computed from these rows with the real Clause 13
// formula, so the page never contradicts itself.
export const SEMESTERS: Subject[][] = [
  [
    { code: "ICT-101", name: "Engineering Mathematics I", credits: 4, grade: "B+", gradePoints: 7, tone: "good" },
    { code: "ICT-103", name: "Programming Fundamentals", credits: 4, grade: "A", gradePoints: 8, tone: "good" },
    { code: "ICT-105", name: "Digital Design", credits: 3, grade: "B", gradePoints: 6, tone: "average" },
    { code: "ICT-151", name: "Physics Lab", credits: 1, grade: "O", gradePoints: 10, tone: "excellent" },
  ],
  [
    { code: "ICT-201", name: "Object Oriented Programming", credits: 4, grade: "A+", gradePoints: 9, tone: "excellent" },
    { code: "ICT-203", name: "Discrete Structures", credits: 4, grade: "A", gradePoints: 8, tone: "good" },
    { code: "ICT-205", name: "Computer Architecture", credits: 3, grade: "A", gradePoints: 8, tone: "good" },
    { code: "HS-201", name: "Humanities Elective", credits: 2, grade: "P", gradePoints: 4, tone: "pass" },
  ],
  [
    { code: "ICT-301", name: "Data Structures", credits: 4, grade: "A+", gradePoints: 9, tone: "excellent" },
    { code: "ICT-303", name: "Operating Systems", credits: 4, grade: "A", gradePoints: 8, tone: "good" },
    { code: "ICT-305", name: "Theory of Computation", credits: 3, grade: "B", gradePoints: 6, tone: "average" },
    { code: "ICT-351", name: "Data Structures Lab", credits: 1, grade: "O", gradePoints: 10, tone: "excellent" },
  ],
  [
    { code: "ICT-401", name: "DBMS", credits: 4, grade: "A", gradePoints: 8, tone: "good" },
    { code: "ICT-403", name: "Design & Analysis of Algorithms", credits: 4, grade: "A+", gradePoints: 9, tone: "excellent" },
    { code: "ITME-401", name: "Microprocessors", credits: 3, grade: "B+", gradePoints: 7, tone: "good" },
    { code: "ICT-451", name: "DBMS Lab", credits: 1, grade: "O", gradePoints: 10, tone: "excellent" },
  ],
];

/** Highest first, so the first cutoff a student clears is the best one. */
export const PLACEMENT_CUTOFFS = [75, 70, 65, 60];

/**
 * SGPA = Σ(credits × gradePoints) / Σ credits (Ord. 11, Cl. 13).
 */
export function calculateSgpa(subjects: Subject[]) {
  const qualityPoints = subjects.reduce((sum, subject) => sum + subject.credits * subject.gradePoints, 0);
  const totalCredits = subjects.reduce((sum, subject) => sum + subject.credits, 0);
  return totalCredits > 0 ? qualityPoints / totalCredits : null;
}

/**
 * Division bands (Ord. 11, Cl. 13). "Exemplary" needs first-chance history, never inferred here.
 */
export function divisionFor(cgpa: number | null) {
  if (cgpa === null) return null;
  if (cgpa >= 6.5) return "First Division";
  if (cgpa >= 5) return "Second Division";
  if (cgpa >= 4) return "Third Division";
  return null;
}

/**
 * Per-semester rows with the running CGPA after each semester.
 */
export function buildTranscript() {
  let cumulativeQuality = 0;
  let cumulativeCredits = 0;
  return SEMESTERS.map((subjects, index) => {
    const credits = subjects.reduce((sum, subject) => sum + subject.credits, 0);
    const quality = subjects.reduce((sum, subject) => sum + subject.credits * subject.gradePoints, 0);
    cumulativeQuality += quality;
    cumulativeCredits += credits;
    return {
      label: `Sem ${index + 1}`,
      credits,
      quality,
      sgpa: quality / credits,
      cgpa: cumulativeQuality / cumulativeCredits,
      totalCredits: cumulativeCredits,
    };
  });
}
