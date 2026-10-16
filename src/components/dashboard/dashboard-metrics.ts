import type { EngineResult, Metric, SubjectResult } from "@/types/result";

// Value representing the "All" tab
export const ALL = "100";

const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"];

export const isCleared = (s: SubjectResult) =>
  s.semantic === "PASS" || s.semantic === "CREDIT_SECURED" || s.semantic === "ALREADY_PASSED";

export const isBacklog = (s: SubjectResult) =>
  s.semantic === "NOT_CLEARED" || s.semantic === "ABSENT" || s.semantic === "DETAINED";

// Generates semester selector tabs: "All" plus one per semester present
export function getSemesterTabs(subjects: SubjectResult[]) {
  const found = new Set<string>();
  for (const s of subjects) {
    const sem = String(s.semester ?? "").trim();
    if (sem !== "") found.add(sem);
  }

  const sorted = [...found].sort((a, b) => Number(a) - Number(b));
  return [
    { label: "All", value: ALL },
    ...sorted.map((sem) => {
      const n = Number(sem);
      const label = Number.isInteger(n) && n >= 1 && n <= 10 ? ROMAN[n - 1] : `Sem ${sem}`;
      return { label, value: sem };
    }),
  ];
}

// Computes dashboard metrics for the active tab (GPA, percentage, credits, backlogs, marks)
export function getDashboardMetrics(engine: EngineResult, activeSem: string) {
  const { analytics, programme, subjectResults } = engine;
  const isAll = activeSem === ALL;
  const isAnnual = programme.examinationSystem === "ANNUAL";
  const isOrd11 = programme.ordinance === "ORD_11";

  const subjects = isAll ? subjectResults : subjectResults.filter((s) => String(s.semester) === activeSem);

  // Percentage schemes do not show GPA or credits
  const isPercentageFramework = !isOrd11 || analytics.cgpa.status === "NOT_APPLICABLE";

  // GPA
  const gpaMetric: Metric<number | null> = isAll
    ? analytics.cgpa
    : (analytics.sgpaBySemester?.find((p) => String(p.semester) === activeSem)?.sgpa ?? analytics.sgpa);

  const gpaDisplay =
    gpaMetric.status === "NOT_APPLICABLE" ? "N/A" : gpaMetric.value !== null ? gpaMetric.value.toFixed(2) : "—";

  const gpaLabel = isAll ? "Overall CGPA" : isAnnual ? `Year ${activeSem} GPA` : `Sem ${activeSem} SGPA`;

  // Percentage
  let percentMetric: Metric<number | null>;
  if (isAll) {
    percentMetric =
      analytics.percentage.value === null && analytics.averagePercentage.value !== null
        ? analytics.averagePercentage
        : analytics.percentage;
  } else if (gpaMetric.value !== null && isOrd11) {
    percentMetric = {
      value: Math.round(gpaMetric.value * 10 * 100) / 100,
      status: gpaMetric.status,
      sources: ["GGSIPU Ordinance 11, Clause 13"],
    };
  } else {
    const summary = analytics.semesterSummaries?.value?.find((p) => String(p.semester) === activeSem);
    if (summary?.averagePercentage != null) {
      percentMetric = {
        value: summary.averagePercentage,
        status: "RESULT_DERIVED",
        sources: ["Semester subject marks normalized by subject maxima"],
      };
    } else {
      percentMetric = analytics.percentage.value !== null ? analytics.percentage : analytics.averagePercentage;
    }
  }

  const percentDisplay = percentMetric.value !== null ? `${percentMetric.value.toFixed(2)}%` : "—";

  const percentLabel = isAll
    ? isPercentageFramework ? "Aggregate %" : "Equivalent %"
    : isPercentageFramework
      ? isAnnual ? `Year ${activeSem} %` : `Sem ${activeSem} %`
      : `Sem ${activeSem} Equivalent %`;

  const percentNote = isAll
    ? isOrd11 ? "CGPA × 10 (Ordinance 11)" : (analytics.framework.value ?? "Statutory Regulations")
    : isOrd11
      ? "SGPA × 10 (Ordinance 11)"
      : isAnnual ? `Year ${activeSem} marks` : `Semester ${activeSem} marks`;

  // Credits and cleared count
  const hasCredits = subjectResults.some((s) => s.credits.value !== null);
  const withCredits = subjects.filter((s) => s.credits.value !== null);
  const offered = withCredits.reduce((sum, s) => sum + (s.credits.value ?? 0), 0);
  const earned = withCredits.filter(isCleared).reduce((sum, s) => sum + (s.credits.value ?? 0), 0);

  // Marks
  const clearedWithMarks = subjects.filter((s) => s.total !== undefined && isCleared(s));
  const marksObtained = clearedWithMarks.reduce((sum, s) => sum + (s.total ?? 0), 0);
  const marksMax = subjects.reduce((sum, s) => sum + (s.maxMarks ?? 100), 0);

  const backlogs = subjects.filter(isBacklog);

  const unit = isAnnual ? "Year" : "Semester";

  return {
    subjects,
    backlogs,
    isPercentageFramework,
    scope: isAll ? `All ${unit.toLowerCase()}s` : `${unit} ${activeSem}`,
    gpa: { label: gpaLabel, display: gpaDisplay, metric: gpaMetric },
    percent: { label: percentLabel, display: percentDisplay, note: percentNote, metric: percentMetric },
    credits: {
      hasCredits,
      earned,
      offered,
      clearedCount: clearedWithMarks.length,
      note: hasCredits
        ? isAll ? "overall degree credits" : `Semester ${activeSem} credits`
        : isAll ? "total courses cleared" : isAnnual ? `Year ${activeSem} cleared` : `Semester ${activeSem} cleared`,
    },
    marks: { obtained: marksObtained, max: marksMax },
  };
}
