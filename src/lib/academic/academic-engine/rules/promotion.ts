import type { OrdinanceEntry, SupportState } from "../../academic-db";
import {
  createMetric,
  decodeStatus,
  getDefaultCredit,
  isSubjectPassed,
} from "../subject-results";
import type {
  AcademicPromotionStatus,
  AcademicYearStatus,
  EnginePromotionYear,
  Metric,
  SubjectResult,
} from "../types";

/**
 * Type guard verifying whether an input array consists of domain SubjectResult objects.
 *
 * @param items - Array of unknown objects
 * @returns True if array contains parsed SubjectResult objects
 */
function isSubjectResults(items: unknown[]): items is SubjectResult[] {
  return (
    items.length > 0 &&
    typeof items[0] === "object" &&
    items[0] !== null &&
    "semantic" in items[0]
  );
}

/**
 * Evaluates academic promotion standing according to statutory university ordinance rules
 * (e.g. 50% annual credits requirement under Ordinance 11, or passing all subjects under Ordinance 31).
 *
 * @param subjectResults - Parsed subject records
 * @param ordinance - Authoritative Ordinance definition
 * @returns A Metric containing year-by-year promotion status and audit metadata
 */
export function evaluatePromotion(
  subjectResults: SubjectResult[],
  ordinance: OrdinanceEntry | null
): Metric<EnginePromotionYear[] | null> {
  const allCoursesPassRule = ordinance?.rules.promotionByAllCourses;
  if (allCoursesPassRule) {
    const semesterList = [...new Set(subjectResults.map((subject) => subject.semester))];
    const promotionYears = semesterList.map((sem, index) => {
      const semesterSubjects = subjectResults.filter((subject) => subject.semester === sem);
      const passedInSemester = semesterSubjects.filter((subject) => isSubjectPassed(subject.semantic));
      const failedInSemester = semesterSubjects.filter((subject) => !isSubjectPassed(subject.semantic));
      const standing = failedInSemester.length === 0 ? ("PROMOTED" as const) : ("NOT_PROMOTED" as const);
      return {
        yearNumber: index + 1,
        yearLabel: `Year ${index + 1}`,
        totalCredits: semesterSubjects.reduce((sum, s) => sum + (s.credits.value ?? 0), 0),
        earnedCredits: passedInSemester.reduce((sum, s) => sum + (s.credits.value ?? 0), 0),
        requiredCredits: 0,
        standing,
        progressPercent: semesterSubjects.length
          ? Math.round((passedInSemester.length / semesterSubjects.length) * 1000) / 10
          : 0,
      };
    });
    return createMetric(
      promotionYears,
      "WARNING",
      "Promotion under Ordinance 31 Clause 15(a) requires passing all subjects/courses. Up to 2 failed courses are eligible for supplementary examination (Clause 15e); 3 or more failures require term repeat (Clause 15d). Evaluated with warning since supplementary exam and component breakdowns require official verification.",
      allCoursesPassRule.sources
    );
  }

  const creditShareRule = ordinance?.rules.promotionByAcademicYearCredits;
  if (!creditShareRule) {
    return createMetric<EnginePromotionYear[] | null>(
      null,
      "UNAVAILABLE",
      "Promotion rule is not defined for this programme."
    );
  }

  const hasAnyCredits = subjectResults.some((s) => s.credits.value !== null && s.credits.value > 0);
  if (!hasAnyCredits) {
    return createMetric<EnginePromotionYear[] | null>(
      null,
      "UNAVAILABLE",
      "Promotion requires authoritative subject credits."
    );
  }

  const academicYearsMap = new Map<
    number,
    { totalCredits: number; earnedCredits: number; hasOdd: boolean; hasEven: boolean }
  >();
  for (const subject of subjectResults) {
    if (subject.credits.value === null || subject.credits.value <= 0) continue;
    const sem = Number(subject.semester);
    const yearNumber = Math.ceil(sem / 2);
    if (!Number.isFinite(yearNumber) || yearNumber < 1) continue;

    const currentYearStats = academicYearsMap.get(yearNumber) ?? {
      totalCredits: 0,
      earnedCredits: 0,
      hasOdd: false,
      hasEven: false,
    };
    currentYearStats.totalCredits += subject.credits.value;
    if (isSubjectPassed(subject.semantic)) currentYearStats.earnedCredits += subject.credits.value;
    if (sem % 2 === 1) currentYearStats.hasOdd = true;
    if (sem % 2 === 0) currentYearStats.hasEven = true;
    academicYearsMap.set(yearNumber, currentYearStats);
  }

  const sortedYears = [...academicYearsMap.entries()].sort(([a], [b]) => a - b);
  let hasIncompleteYear = false;

  const promotionYears = sortedYears.map(([yearNumber, creditStats]) => {
    const isYearComplete = creditStats.hasOdd && creditStats.hasEven;
    if (!isYearComplete) hasIncompleteYear = true;

    const requiredCredits = Math.ceil(
      creditStats.totalCredits * creditShareRule.minimumEarnedCreditShare
    );
    const meetsEnsuingYear = creditStats.earnedCredits >= requiredCredits;
    const standing = isYearComplete && meetsEnsuingYear ? ("PROMOTED" as const) : ("NOT_PROMOTED" as const);

    return {
      yearNumber,
      yearLabel: `Year ${yearNumber}`,
      totalCredits: creditStats.totalCredits,
      earnedCredits: creditStats.earnedCredits,
      requiredCredits,
      standing,
      progressPercent: creditStats.totalCredits
        ? Math.round((creditStats.earnedCredits / creditStats.totalCredits) * 1000) / 10
        : 0,
    };
  });

  const status: SupportState = hasIncompleteYear ? "WARNING" : "RESULT_DERIVED";
  const explanation = hasIncompleteYear
    ? "Evaluated with warning: the transcript does not contain both semesters of every academic year, so the annual 50% credit baseline cannot be fully confirmed."
    : `Derived under the applicable ordinance baseline: minimum ${Math.round(
        creditShareRule.minimumEarnedCreditShare * 100
      )}% of the academic year's credits must be earned. Additional programme-scheme promotion conditions may apply and are not verified.`;

  return createMetric(promotionYears, status, explanation, creditShareRule.sources);
}

/**
 * Computes comprehensive academic year promotion standing, year-back risk, and credit deficits for the UI dossier.
 *
 * @param allResults - List of SubjectResults or raw marksheet rows
 * @param customCredit - Optional map of user-overridden paper credits
 * @returns Detailed AcademicPromotionStatus with year-by-year breakdown and detention risk flags
 */
export function getAcademicPromotionStatus(
  allResults: SubjectResult[] | any[][],
  customCredit: Record<string, number | null> = {}
): AcademicPromotionStatus {
  // Fast path: if already parsed subject results are provided, evaluate without re-parsing
  if (isSubjectResults(allResults)) {
    let maxSemester = 8;
    for (const s of allResults) {
      const sem = Number(s.semester);
      if (Number.isInteger(sem) && sem > maxSemester) {
        maxSemester = sem;
      }
    }
    const yearCount = Math.max(4, Math.ceil(maxSemester / 2));
    const yearLabels = ["1st Year", "2nd Year", "3rd Year", "4th Year", "5th Year", "6th Year"];
    let hasDetentionRisk = false;
    let maxSemFound = 0;

    const years: AcademicYearStatus[] = Array.from({ length: yearCount }, (_, index) => {
      const yearNumber = index + 1;
      const oddSem = index * 2 + 1;
      const evenSem = oddSem + 1;
      const yearLabel = yearLabels[index] ?? `${yearNumber}th Year`;

      const oddSubjects = allResults.filter((s) => Number(s.semester) === oddSem);
      const evenSubjects = allResults.filter((s) => Number(s.semester) === evenSem);

      const hasOddSem = oddSubjects.length > 0;
      const hasEvenSem = evenSubjects.length > 0;

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
          status: "UPCOMING" as const,
          hasOddSem: false,
          hasEvenSem: false,
          requiredCredits: 0,
          creditsDeficit: 0,
        };
      }

      let totalCredits = 0;
      let earnedCredits = 0;

      for (const subject of [...oddSubjects, ...evenSubjects]) {
        const credit = subject.credits.value ?? 0;
        if (credit <= 0) continue;
        totalCredits += credit;
        if (isSubjectPassed(subject.semantic)) {
          earnedCredits += credit;
        }
      }

      const percentage = totalCredits > 0 ? (earnedCredits / totalCredits) * 100 : 0;
      const requiredCredits = Math.ceil(totalCredits * 0.5);
      const creditsDeficit = Math.max(0, requiredCredits - earnedCredits);
      const meetsCurrentYearRule = percentage >= 50;

      let status: AcademicYearStatus["status"] = "IN_PROGRESS";
      if (hasOddSem && hasEvenSem) {
        if (meetsCurrentYearRule) {
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

  // Fallback path: parse raw rows
  let maxSemester = 8;
  for (const row of allResults) {
    const sem = Number(row[0]);
    if (Number.isInteger(sem) && sem > maxSemester) {
      maxSemester = sem;
    }
  }
  const yearCount = Math.max(4, Math.ceil(maxSemester / 2));
  const yearLabels = ["1st Year", "2nd Year", "3rd Year", "4th Year", "5th Year", "6th Year"];
  let hasDetentionRisk = false;
  let maxSemFound = 0;

  const years: AcademicYearStatus[] = Array.from({ length: yearCount }, (_, index) => {
    const yearNumber = index + 1;
    const oddSem = index * 2 + 1;
    const evenSem = oddSem + 1;
    const yearLabel = yearLabels[index] ?? `${yearNumber}th Year`;

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
    for (const row of allYearRows) {
      const rawTotal = row[5];
      const statusCode = row[6];
      const paperCode = String(row[1] ?? "");
      const subjectTitle = String(row[2] ?? "");

      let credit = 0;
      if (paperCode in customCredit) {
        credit = customCredit[paperCode] ?? 0;
      } else if (paperCode.toUpperCase() in customCredit) {
        credit = customCredit[paperCode.toUpperCase()] ?? 0;
      } else {
        credit = getDefaultCredit(subjectTitle);
      }

      if (credit <= 0) continue;

      const semantic = decodeStatus(statusCode, rawTotal);
      const isPassed = isSubjectPassed(semantic);

      totalCredits += credit;
      if (isPassed) {
        earnedCredits += credit;
      }
    }

    const percentage = totalCredits > 0 ? (earnedCredits / totalCredits) * 100 : 0;
    const requiredCredits = Math.ceil(totalCredits * 0.5);
    const creditsDeficit = Math.max(0, requiredCredits - earnedCredits);
    const meetsCurrentYearRule = percentage >= 50;

    let status: AcademicYearStatus["status"] = "IN_PROGRESS";

    if (hasOddSem && hasEvenSem) {
      if (meetsCurrentYearRule) {
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
