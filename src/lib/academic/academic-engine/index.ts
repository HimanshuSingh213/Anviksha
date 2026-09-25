import {
  findOrdinance,
  findProgramme,
  verificationAsStatus,
  type SupportState,
  type OrdinanceEntry,
  type ProgrammeEntry,
} from "../academic-db";
import {
  average,
  calculateWeightedGpa,
  createMetric,
  isSubjectPassed,
  parseSubjectResults,
  toCleanNumber,
  toCleanString,
} from "./subject-results";
import { evaluatePromotion, getAcademicPromotionStatus } from "./rules/promotion";
import { getReappearSessionPlan } from "./rules/reappear";
import { determineDivisionPresentation } from "./rules/division";
import type {
  AnalyzeOptions,
  EnginePromotionYear,
  EngineResult,
  DivisionPresentation,
  ExamWebResult,
  Metric,
  MetricWarning,
  SubjectResult,
} from "@/types/result";

/**
 * Audits marksheet records against official pass criteria and marksheet mapping.
 * Flags discrepancies (e.g. marks below threshold but marked cleared, or unmapped degrees).
 *
 * @param subjectResults - Array of parsed and graded SubjectResult domain objects
 * @param programme - The resolved ProgrammeEntry, or null if degree is unmapped
 * @param programmeName - Official degree/programme name string from marksheet
 * @param programmeCode - Official degree/programme code string from marksheet
 * @returns Array of MetricWarning objects detailing any statutory or mapping discrepancies
 */
function auditSubjectDiscrepancies(
  subjectResults: SubjectResult[],
  programme: ProgrammeEntry | null,
  programmeName: string,
  programmeCode: string
): MetricWarning[] {
  const warnings: MetricWarning[] = [];

  if (!programme) {
    warnings.push({
      severity: "INFO",
      message: `Programme "${programmeName || programmeCode || "Unknown"}" is not mapped in the database. Generic rules will be used where applicable.`,
    });
  }

  for (const subject of subjectResults) {
    if (
      subject.ruleCheck === "FAIL" &&
      (subject.semantic === "PASS" ||
        subject.semantic === "CREDIT_SECURED" ||
        subject.semantic === "ALREADY_PASSED")
    ) {
      warnings.push({
        severity: "WARNING",
        message: `${subject.rawCode} is marked cleared by ExamWeb but falls below the statutory pass threshold.`,
      });
    }

    if (
      subject.ruleCheck === "PASS" &&
      (subject.semantic === "NOT_CLEARED" ||
        subject.semantic === "ABSENT" ||
        subject.semantic === "DETAINED" ||
        subject.semantic === "CANCELLED")
    ) {
      warnings.push({
        severity: "WARNING",
        message: `${subject.rawCode} meets the subject pass threshold but ExamWeb reports it as not cleared.`,
      });
    }
  }

  return warnings;
}

/**
 * Computes descriptive statistics (counts, averages, semester breakdowns).
 * Aggregates numeric totals, percentages, internal/external marks, and builds per-semester summaries.
 *
 * @param subjectResults - Array of parsed SubjectResult domain objects
 * @returns Aggregated statistics object containing numericTotals, percentages, mark lists, status counts, passed subjects, and semesterSummaries
 */
function calculateBasicStatistics(subjectResults: SubjectResult[]) {
  const numericTotals = subjectResults
    .map((s) => s.total)
    .filter((value): value is number => value !== undefined);

  const percentages = subjectResults
    .map((s) => s.marksPercent)
    .filter((value): value is number => value !== null);

  const internalMarksList = subjectResults
    .map((s) => s.internal)
    .filter((value): value is number => value !== undefined);

  const externalMarksList = subjectResults
    .map((s) => s.external)
    .filter((value): value is number => value !== undefined);

  const statusCounts = subjectResults.reduce<Record<string, number>>((acc, s) => {
    acc[s.semantic] = (acc[s.semantic] ?? 0) + 1;
    return acc;
  }, {});

  const passedSubjects = subjectResults.filter((s) => isSubjectPassed(s.semantic));
  const distinctionCount = subjectResults.filter((s) => s.grade?.value === "Distinction").length;

  const semesterList = [...new Set(subjectResults.map((s) => s.semester))];
  const semesterSummaries = semesterList.map((sem) => {
    const semSubjects = subjectResults.filter((s) => s.semester === sem);
    const marks = semSubjects
      .map((s) => s.total)
      .filter((value): value is number => value !== undefined);
    const pcts = semSubjects
      .map((s) => s.marksPercent)
      .filter((value): value is number => value !== null);

    return {
      semester: sem,
      paperCount: semSubjects.length,
      numericMarksCount: marks.length,
      averageMarks: average(marks),
      averagePercentage: average(pcts),
      highestMarks: marks.length > 0 ? Math.max(...marks) : null,
      lowestMarks: marks.length > 0 ? Math.min(...marks) : null,
    };
  });

  return {
    numericTotals,
    percentages,
    internalMarksList,
    externalMarksList,
    statusCounts,
    passedSubjects,
    distinctionCount,
    semesterList,
    semesterSummaries,
  };
}

/**
 * Determines whether letter grades apply to this degree under its statutory framework.
 * Evaluates Ordinance 10-point scale for CBCS programs, or flags NOT_APPLICABLE for non-letter degrees.
 *
 * @param programme - The resolved ProgrammeEntry, or null
 * @param ordinance - The governing OrdinanceEntry, or null
 * @returns Metric indicating whether letter grading applies, with verification state and sources
 */
function determineGradeMetric(
  programme: ProgrammeEntry | null,
  ordinance: OrdinanceEntry | null
): Metric<boolean | null> {
  const capabilities = ordinance?.capabilities;
  const generalGradeRule = ordinance?.rules.gradeFromTotalMarks;
  const noLetterGradesRule = ordinance?.rules.noLetterGrades;

  if (programme?.verification === "INFERRED") {
    return createMetric(
      null,
      "AMBIGUOUS",
      "Letter grade scale is ambiguous because the exact degree scheme is not established from the generic programme name."
    );
  }

  if (capabilities && !capabilities.grade) {
    return createMetric(
      null,
      "NOT_APPLICABLE",
      noLetterGradesRule?.reason ?? "Letter grades are not applicable to this programme.",
      noLetterGradesRule?.sources ?? ordinance?.sources ?? []
    );
  }

  if (generalGradeRule && programme) {
    return createMetric(
      true,
      "RESULT_DERIVED",
      "Evaluated from marksheet total marks using Ordinance 10-point grade scale.",
      generalGradeRule.sources
    );
  }

  if (noLetterGradesRule) {
    return createMetric(
      null,
      "NOT_APPLICABLE",
      noLetterGradesRule.reason,
      noLetterGradesRule.sources
    );
  }

  return createMetric(
    null,
    "UNAVAILABLE",
    "No verified letter-grade rule is defined for this programme."
  );
}

/**
 * Summarizes the official passing rule for a subject based on the governing ordinance.
 *
 * @param programme - The resolved ProgrammeEntry, or null
 * @param ordinance - The governing OrdinanceEntry, or null
 * @returns Metric containing descriptive pass rule text, verification status, and sources
 */
function determinePassRuleMetric(
  programme: ProgrammeEntry | null,
  ordinance: OrdinanceEntry | null
): Metric<string | null> {
  const passRule = ordinance?.rules.coursePassByTotalMarks ?? ordinance?.rules.componentPass;

  if (programme?.verification === "INFERRED") {
    return createMetric(
      null,
      "AMBIGUOUS",
      "Pass rule is ambiguous without specific programme scheme evidence."
    );
  }

  if (passRule && "minimumTotalPercent" in passRule && programme) {
    return createMetric(
      `Minimum ${passRule.minimumTotalPercent}% aggregate marks in each subject.`,
      "VERIFIED",
      undefined,
      passRule.sources
    );
  }

  if (passRule && "minimumAggregatePercent" in passRule && programme) {
    return createMetric(
      `Minimum ${passRule.minimumAggregatePercent}% aggregate, ${passRule.minimumTheoryPercent}% theory including oral, and ${passRule.minimumPracticalPercent}% practical.`,
      "VERIFIED",
      "Professional component passing rule under Ordinance 15.",
      passRule.sources
    );
  }

  return createMetric(
    null,
    "UNAVAILABLE",
    "No programme-specific subject pass rule is loaded."
  );
}

/**
 * Computes per-semester credit, subject, and backlog rollups.
 * Sibling to calculateGpaMetrics: produces the per-semester counters the analytics
 * UI renders (tooltip credits/subjects/backlogs, overview tiles) so those values
 * are derived once from the parsed domain objects instead of re-aggregated downstream.
 *
 * @param subjectResults - Array of parsed SubjectResult objects
 * @param semesterList - List of unique semester identifiers present on the marksheet
 * @returns One rollup per semester: credit totals, subject count, backlog count, and mark sums
 */
function calculateSemesterPerformance(
  subjectResults: SubjectResult[],
  semesterList: Array<string | number>,
  semesterSummaries: Array<{ semester: string | number; averagePercentage: number | null }>
) {
  return semesterList.map((sem) => {
    const semSubjects = subjectResults.filter((s) => s.semester === sem);

    const knownCredits = semSubjects.filter((s) => s.credits.value !== null);
    const totalCredits = knownCredits.reduce((sum, s) => sum + (s.credits.value ?? 0), 0);
    const earnedCredits = knownCredits
      .filter((s) => isSubjectPassed(s.semantic))
      .reduce((sum, s) => sum + (s.credits.value ?? 0), 0);

    const passedSubjects = semSubjects.filter((s) => isSubjectPassed(s.semantic));

    return {
      semester: sem,
      totalCredits,
      earnedCredits,
      subjectCount: semSubjects.length,
      passedCount: passedSubjects.length,
      backlogCount:
        semSubjects.length -
        passedSubjects.length,
      obtainedMarks: passedSubjects.reduce((sum, s) => sum + (s.total ?? 0), 0),
      totalMaxMarks: semSubjects.reduce((sum, s) => sum + (s.maxMarks ?? 100), 0),
      averagePercentage:
        semesterSummaries.find((x) => x.semester === sem)?.averagePercentage ?? null,
    };
  });
}

/**
 * Calculates Semester Grade Point Average (SGPA) and Cumulative GPA (CGPA).
 * Applies weighted formula: Σ(credits × gradePoints) / Σ(credits), factoring in user overrides and estimation heuristics.
 *
 * @param subjectResults - Array of parsed SubjectResult objects
 * @param semesterList - List of unique semester identifiers present on the marksheet
 * @param programme - The resolved ProgrammeEntry, or null
 * @param ordinance - The governing OrdinanceEntry, or null
 * @returns Object containing per-semester SGPA metrics, overall latest SGPA, cumulative CGPA, and GPA audit status/reason
 */
function calculateGpaMetrics(
  subjectResults: SubjectResult[],
  semesterList: Array<string | number>,
  programme: ProgrammeEntry | null,
  ordinance: OrdinanceEntry | null
) {
  const capabilities = ordinance?.capabilities;
  const generalGradeRule = ordinance?.rules.gradeFromTotalMarks;
  const noLetterGradesRule = ordinance?.rules.noLetterGrades;

  const hasAnyCredits =
    subjectResults.length > 0 &&
    subjectResults.some((s) => s.credits.value !== null && s.credits.value > 0);

  const sgpaApplicable = capabilities
    ? capabilities.sgpa
    : Boolean(generalGradeRule?.bands && ordinance?.rules.sgpa);

  const cgpaApplicable = capabilities
    ? capabilities.cgpa
    : Boolean(generalGradeRule?.bands && ordinance?.rules.cgpa);

  const usesEstimatedCredits = subjectResults.some((s) => s.credits.source === "ESTIMATED");
  const usesUserCredits = subjectResults.some((s) => s.credits.source === "USER");
  const gpaStatus: SupportState =
    usesEstimatedCredits || usesUserCredits ? "WARNING" : "RESULT_DERIVED";
  const gpaReason =
    usesUserCredits && !usesEstimatedCredits
      ? "Calculated with user-provided credits. Official scheme credits would change this number."
      : "Calculated with estimated credits (theory 3 / practical 1 heuristic). Official scheme credits are not available on the marksheet.";

  const sgpaBySemester = semesterList.map((sem) => {
    const semSubjects = subjectResults.filter((s) => s.semester === sem);

    if (programme?.verification === "INFERRED") {
      return {
        semester: sem,
        sgpa: createMetric<number>(
          null,
          "AMBIGUOUS",
          "SGPA is not calculated because the programme framework is ambiguous."
        ),
      };
    }

    if (!sgpaApplicable) {
      return {
        semester: sem,
        sgpa: createMetric<number>(
          null,
          "NOT_APPLICABLE",
          noLetterGradesRule?.reason ?? "SGPA is not applicable to this programme.",
          noLetterGradesRule?.sources ?? ordinance?.sources ?? []
        ),
      };
    }

    const semHasCredits = semSubjects.some(
      (s) => s.credits.value !== null && s.credits.value > 0
    );
    if (!semHasCredits) {
      return {
        semester: sem,
        sgpa: createMetric<number>(
          null,
          "UNAVAILABLE",
          "Authoritative subject credits are not available."
        ),
      };
    }

    const semGpa = calculateWeightedGpa(semSubjects);
    if (semGpa === null) {
      return {
        semester: sem,
        sgpa: createMetric<number>(
          null,
          "UNAVAILABLE",
          "No verified grade-point formula is loaded for this programme."
        ),
      };
    }

    return {
      semester: sem,
      sgpa: createMetric(
        semGpa,
        gpaStatus,
        gpaReason,
        ordinance?.rules.sgpa?.sources ?? ["GGSIPU Ordinance 11"]
      ),
    };
  });

  const latestSgpa = sgpaBySemester[sgpaBySemester.length - 1]?.sgpa ?? null;
  const fallbackSgpa =
    programme?.verification === "INFERRED"
      ? createMetric<number>(
          null,
          "AMBIGUOUS",
          "SGPA is not calculated because the programme framework is ambiguous."
        )
      : !sgpaApplicable
      ? createMetric<number>(
          null,
          "NOT_APPLICABLE",
          noLetterGradesRule?.reason ?? "SGPA is not applicable to this programme.",
          noLetterGradesRule?.sources ?? ordinance?.sources ?? []
        )
      : createMetric<number>(
          null,
          "UNAVAILABLE",
          "Authoritative subject credits are not available."
        );

  const sgpa = latestSgpa ?? fallbackSgpa;

  let cgpa: Metric<number | null>;
  if (programme?.verification === "INFERRED") {
    cgpa = createMetric<number>(
      null,
      "AMBIGUOUS",
      "CGPA is not calculated because the programme framework is ambiguous."
    );
  } else if (!cgpaApplicable) {
    cgpa = createMetric<number>(
      null,
      "NOT_APPLICABLE",
      "CGPA is not applicable under this academic framework.",
      ordinance?.sources ?? []
    );
  } else if (!hasAnyCredits) {
    cgpa = createMetric<number>(
      null,
      "UNAVAILABLE",
      "Authoritative subject credits are not available across all semesters."
    );
  } else {
    const cgpaValue = calculateWeightedGpa(subjectResults);
    if (cgpaValue === null) {
      cgpa = createMetric<number>(
        null,
        "UNAVAILABLE",
        "No verified grade-point formula is loaded for this programme."
      );
    } else {
      cgpa = createMetric(
        cgpaValue,
        gpaStatus,
        gpaReason,
        ordinance?.rules.cgpa?.sources ?? ["GGSIPU Ordinance 11"]
      );
    }
  }

  return {
    sgpaBySemester,
    sgpa,
    cgpa,
    gpaStatus,
    gpaReason,
  };
}

/**
 * Calculates student percentage, either from CGPA (e.g. CGPA × 10 under Ordinance 11) or from raw marks.
 *
 * @param subjectResults - Array of parsed SubjectResult domain objects
 * @param cgpa - Computed CGPA Metric
 * @param percentages - Array of individual subject percentage scores
 * @param programme - The resolved ProgrammeEntry, or null
 * @param ordinance - The governing OrdinanceEntry, or null
 * @param gpaStatus - SupportState inherited from GPA calculation
 * @param gpaReason - Contextual reason or note inherited from GPA calculation
 * @returns Metric containing calculated percentage, support status, and audit sources
 */
function calculatePercentageMetric(
  subjectResults: SubjectResult[],
  cgpa: Metric<number | null>,
  percentages: number[],
  programme: ProgrammeEntry | null,
  ordinance: OrdinanceEntry | null,
  gpaStatus: SupportState,
  gpaReason: string
): Metric<number | null> {
  const capabilities = ordinance?.capabilities;

  if (programme?.verification === "INFERRED") {
    return createMetric(
      null,
      "AMBIGUOUS",
      "Percentage is ambiguous without specific programme scheme evidence."
    );
  }

  if (capabilities && !capabilities.percentage) {
    return createMetric(
      null,
      "NOT_APPLICABLE",
      "Percentage calculation is not applicable under this framework.",
      ordinance?.sources ?? []
    );
  }

  if (ordinance?.rules.percentageFromCGPA && cgpa.value !== null) {
    return createMetric(
      Math.round(cgpa.value * 10 * 100) / 100,
      gpaStatus,
      gpaReason,
      ordinance.rules.percentageFromCGPA.sources
    );
  }

  if (
    percentages.length === subjectResults.length &&
    subjectResults.length > 0 &&
    subjectResults.every((s) => s.maxMarks !== null)
  ) {
    const avg =
      Math.round((percentages.reduce((sum, val) => sum + val, 0) / percentages.length) * 100) /
      100;
    return createMetric(
      avg,
      "RESULT_DERIVED",
      "Average percentage from verified subject maximum marks.",
      ordinance?.sources ?? []
    );
  }

  return createMetric(
    null,
    "UNAVAILABLE",
    "No verified percentage formula or complete subject maximum-mark data is available."
  );
}

/**
 * Evaluates degree honors / division classification (Exemplary, First, Second, Third Division).
 * Supports CGPA bands (Ordinance 11), CPI bands (Ordinance 31), or raw percentage bands (Ordinance 24).
 *
 * @param subjectResults - Array of parsed SubjectResult domain objects
 * @param cgpa - Computed CGPA Metric
 * @param percentage - Computed Percentage Metric
 * @param numericTotals - Array of numeric total marks
 * @param programme - The resolved ProgrammeEntry, or null
 * @param ordinance - The governing OrdinanceEntry, or null
 * @param gpaStatus - SupportState inherited from GPA calculation
 * @param gpaReason - Contextual note inherited from GPA calculation
 * @returns Metric containing division classification title, support status, and ordinance sources
 */
function determineDivisionMetric(
  subjectResults: SubjectResult[],
  cgpa: Metric<number | null>,
  percentage: Metric<number | null>,
  numericTotals: number[],
  programme: ProgrammeEntry | null,
  ordinance: OrdinanceEntry | null,
  gpaStatus: SupportState,
  gpaReason: string
): Metric<string | null> {
  const capabilities = ordinance?.capabilities;

  if (programme?.verification === "INFERRED") {
    return createMetric(
      null,
      "AMBIGUOUS",
      "Division classification is ambiguous without specific programme scheme evidence."
    );
  }

  if (capabilities && !capabilities.division) {
    return createMetric(
      null,
      "NOT_APPLICABLE",
      ordinance?.rules.noDivision?.reason ?? "Divisions are not awarded for this programme.",
      ordinance?.rules.noDivision?.sources ?? ordinance?.sources ?? []
    );
  }

  if (ordinance?.rules.noDivision) {
    return createMetric(
      null,
      "NOT_APPLICABLE",
      ordinance.rules.noDivision.reason,
      ordinance.rules.noDivision.sources
    );
  }

  // Division from CPI (e.g. BPT under Ordinance 31)
  if (ordinance?.rules.divisionFromCpi) {
    let cpiValue: number | null = null;
    const passedCreditSubjects = subjectResults.filter(
      (s) => isSubjectPassed(s.semantic) && s.credits.value !== null && s.total !== undefined
    );
    if (passedCreditSubjects.length > 0) {
      const totalCredits = passedCreditSubjects.reduce((sum, s) => sum + (s.credits.value ?? 0), 0);
      const totalCreditMarks = passedCreditSubjects.reduce(
        (sum, s) => sum + (s.credits.value ?? 0) * (s.total ?? 0),
        0
      );
      cpiValue = totalCredits > 0 ? Math.round((totalCreditMarks / totalCredits) * 100) / 100 : null;
    }

    const evalValue = cpiValue ?? cgpa.value;
    if (evalValue !== null) {
      const band = ordinance.rules.divisionFromCpi.bands.find(
        (b) => evalValue >= b.minimumCGPA && (b.maximumCGPA === null || evalValue <= b.maximumCGPA)
      );
      return createMetric(
        band?.division ?? null,
        "RESULT_DERIVED",
        band?.note,
        ordinance.rules.divisionFromCpi.sources
      );
    }

    return createMetric(
      null,
      "UNAVAILABLE",
      "Division classification requires CPI under Ordinance 31.",
      ordinance.rules.divisionFromCpi.sources
    );
  }

  // Division from Percentage (e.g. BASLP under Ordinance 24)
  if (ordinance?.rules.divisionFromPercentage) {
    const averageFromTotals =
      numericTotals.length > 0
        ? Math.round(
            (numericTotals.reduce((sum, val) => sum + val, 0) / numericTotals.length) * 100
          ) / 100
        : null;
    const pctValue = percentage.value ?? averageFromTotals;

    if (pctValue !== null) {
      const band = ordinance.rules.divisionFromPercentage.bands.find(
        (b: any) =>
          pctValue >= b.minimumPercent &&
          (b.maximumPercent === undefined || b.maximumPercent === null || pctValue <= b.maximumPercent)
      );
      return createMetric(
        band?.division ?? null,
        "RESULT_DERIVED",
        band?.note,
        ordinance.rules.divisionFromPercentage.sources
      );
    }

    return createMetric(
      null,
      "UNAVAILABLE",
      "Division classification requires verified percentage marks.",
      ordinance.rules.divisionFromPercentage.sources
    );
  }

  // Division from CGPA (e.g. B.Tech under Ordinance 11)
  if (ordinance?.rules.divisionFromCGPA && cgpa.value !== null) {
    const band = ordinance.rules.divisionFromCGPA.bands.find(
      (b) => cgpa.value! >= b.minimumCGPA && (b.maximumCGPA === null || cgpa.value! <= b.maximumCGPA)
    );
    return createMetric(
      band?.division ?? null,
      gpaStatus,
      band?.note ?? gpaReason,
      ordinance.rules.divisionFromCGPA.sources
    );
  }

  if (ordinance?.rules.divisionFromCGPA) {
    return createMetric(
      null,
      "VERIFIED",
      "Exemplary: 10.00 (1st attempt) · First Div: ≥6.50 · Second Div: 5.00–6.49 · Third Div: 4.00–4.99",
      ordinance.rules.divisionFromCGPA.sources
    );
  }

  return createMetric(
    null,
    "UNAVAILABLE",
    "Division requires the programme's verified CPI/CGPA rule and its required inputs."
  );
}

/**
 * Summarizes the legal degree duration and mandatory internship terms from the governing ordinance.
 *
 * @param programme - The resolved ProgrammeEntry, or null
 * @param ordinance - The governing OrdinanceEntry, or null
 * @returns Metric containing formatted framework summary text (e.g. "4 years · 6-month internship")
 */
function determineFrameworkMetric(
  programme: ProgrammeEntry | null,
  ordinance: OrdinanceEntry | null
): Metric<string | null> {
  const frameworkParts: string[] = [];
  if (ordinance?.rules.duration?.text) frameworkParts.push(ordinance.rules.duration.text);
  if (
    ordinance?.rules.internship?.months &&
    !ordinance.rules.duration?.text?.includes("internship")
  ) {
    frameworkParts.push(`${ordinance.rules.internship.months}-month internship`);
  }

  if (!programme) {
    return createMetric<string>(
      null,
      "UNAVAILABLE",
      "No authoritative programme framework could be safely established."
    );
  }

  if (programme.verification === "INFERRED") {
    return createMetric<string>(
      frameworkParts.length ? frameworkParts.join(" · ") : null,
      "AMBIGUOUS",
      `Generic programme mapping (${programme.officialProgrammeName} → ${programme.ordinanceCode}) is ambiguous without specific discipline or scheme evidence.`,
      programme.sources
    );
  }

  if (frameworkParts.length > 0) {
    return createMetric(frameworkParts.join(" · "), "VERIFIED", undefined, [
      ...new Set(frameworkParts.flatMap(() => ordinance?.sources ?? [])),
    ]);
  }

  return createMetric<string>(
    null,
    "UNAVAILABLE",
    "No programme framework summary is loaded."
  );
}

/**
 * Evaluates formal university ordinance promotion regulations (e.g. Ordinance 31 / 11 clauses).
 * Checks framework eligibility and delegates to the statutory promotion rules engine.
 *
 * @param subjectResults - Array of parsed SubjectResult domain objects
 * @param programme - The resolved ProgrammeEntry, or null
 * @param ordinance - The governing OrdinanceEntry, or null
 * @returns Metric containing annual promotion standing array or null if inapplicable
 */
function determinePromotionMetric(
  subjectResults: SubjectResult[],
  programme: ProgrammeEntry | null,
  ordinance: OrdinanceEntry | null
): Metric<EnginePromotionYear[] | null> {
  const capabilities = ordinance?.capabilities;

  if (programme?.verification === "INFERRED") {
    return createMetric<EnginePromotionYear[] | null>(
      null,
      "AMBIGUOUS",
      "Promotion rules cannot be applied because the programme framework is ambiguous."
    );
  }

  if (capabilities && !capabilities.promotion) {
    return createMetric<EnginePromotionYear[] | null>(
      null,
      "NOT_APPLICABLE",
      "Promotion rules are not applicable under this framework.",
      ordinance?.sources ?? []
    );
  }

  return evaluatePromotion(subjectResults, ordinance);
}

/**
 * Main academic analysis engine entry point.
 * Orchestrates parsing, auditing, metric derivation, and degree classification into a unified dossier.
 *
 * @param rawResult - Raw marksheet response from ExamWeb portal
 * @param userEditedCredits - Optional map of user-overridden paper credits (e.g. { "ETCS-101": 4 })
 * @param options - Analysis configuration options (e.g. allowFallbackCredits)
 * @returns Comprehensive EngineResult dossier with student info, graded subjects, and derived analytics
 */
export function analyzeResult(
  rawResult: ExamWebResult | null | undefined,
  userEditedCredits: Record<string, number | null> = {},
  options: AnalyzeOptions = { allowFallbackCredits: true }
): EngineResult {
  const allowFallbackCredits = options?.allowFallbackCredits !== false;
  const studentProfile = rawResult?.stprofile;
  const rawMarksheetRows = rawResult?.stresult ?? [];

  // Identify student, degree programme, and statutory ordinance
  const programmeCode = toCleanString(studentProfile?.prgcode);
  const programmeName = toCleanString(studentProfile?.prgname);
  const programme = findProgramme(programmeName || programmeCode);
  const ordinance = findOrdinance(programme);
  const cohort = toCleanNumber(studentProfile?.yoa) ?? toCleanNumber(studentProfile?.byoa) ?? null;

  // Parse raw marksheet rows into structured subject results
  const subjectResults = parseSubjectResults(
    rawMarksheetRows,
    ordinance,
    programme,
    userEditedCredits,
    allowFallbackCredits
  );

  // Run discrepancy audit between marksheet display vs ordinance thresholds
  const warnings = auditSubjectDiscrepancies(
    subjectResults,
    programme,
    programmeName,
    programmeCode
  );

  // Calculate basic statistics & semester-by-semester summaries
  const stats = calculateBasicStatistics(subjectResults);
  const marksheetSources = ["ExamWeb result"];

  // Evaluate official grading scale and pass rules
  const gradeMetric = determineGradeMetric(programme, ordinance);
  const subjectPassRule = determinePassRuleMetric(programme, ordinance);
  const framework = determineFrameworkMetric(programme, ordinance);

  // Compute Semester SGPA and Cumulative CGPA
  const { sgpaBySemester, sgpa, cgpa, gpaStatus, gpaReason } = calculateGpaMetrics(
    subjectResults,
    stats.semesterList,
    programme,
    ordinance
  );

  // Compute per-semester performance rollups (credits, subjects, backlogs, marks)
  const semesterPerformance = calculateSemesterPerformance(
    subjectResults,
    stats.semesterList,
    stats.semesterSummaries
  );

  // Compute Percentage and Degree Division
  const percentage = calculatePercentageMetric(
    subjectResults,
    cgpa,
    stats.percentages,
    programme,
    ordinance,
    gpaStatus,
    gpaReason
  );

  const division = determineDivisionMetric(
    subjectResults,
    cgpa,
    percentage,
    stats.numericTotals,
    programme,
    ordinance,
    gpaStatus,
    gpaReason
  );

  const divisionPresentation: DivisionPresentation = determineDivisionPresentation(
    ordinance,
    percentage,
    cgpa
  );

  // Evaluate promotion standing, year-back risk, and reappear schedule
  const promotion = determinePromotionMetric(subjectResults, programme, ordinance);
  const academicPromotion = getAcademicPromotionStatus(subjectResults, userEditedCredits);
  const reappearPlan = getReappearSessionPlan(subjectResults, userEditedCredits);

  // Package the unified academic dossier
  return {
    profile: studentProfile?? null,
    programme: {
      programmeCode,
      programmeName,
      programmeFamily: programme?.programmeFamily ?? null,
      examinationSystem: programme?.examinationSystem ?? ordinance?.examinationSystem ?? null,
      instituteCode: toCleanString(studentProfile?.icode),
      instituteName: toCleanString(studentProfile?.iname),
      cohort,
      ordinance: programme?.ordinanceCode ?? null,
      known: Boolean(programme),
      isTech: programme?.isTech ?? false,
      dbVerification: verificationAsStatus(programme?.verification ?? null),
    },
    subjectResults,
    analytics: {
      paperCount: createMetric(subjectResults.length, "RESULT_DERIVED", undefined, marksheetSources),
      numericMarksCount: createMetric(
        stats.numericTotals.length,
        "RESULT_DERIVED",
        undefined,
        marksheetSources
      ),
      averageMarks: createMetric(
        average(stats.numericTotals),
        "RESULT_DERIVED",
        undefined,
        marksheetSources
      ),
      averagePercentage: createMetric(
        average(stats.percentages),
        stats.percentages.length > 0 ? "RESULT_DERIVED" : "UNAVAILABLE",
        stats.percentages.length > 0
          ? "Normalized using verified subject maximum marks."
          : "Subject maximum marks are not available.",
        marksheetSources
      ),
      highestMarks: createMetric(
        stats.numericTotals.length > 0 ? Math.max(...stats.numericTotals) : null,
        "RESULT_DERIVED",
        undefined,
        marksheetSources
      ),
      lowestMarks: createMetric(
        stats.numericTotals.length > 0 ? Math.min(...stats.numericTotals) : null,
        "RESULT_DERIVED",
        undefined,
        marksheetSources
      ),
      passedOrClearedCount: createMetric(
        stats.passedSubjects.length,
        "RESULT_DERIVED",
        undefined,
        marksheetSources
      ),
      notClearedCount: createMetric(
        subjectResults.length - stats.passedSubjects.length,
        "RESULT_DERIVED",
        undefined,
        marksheetSources
      ),
      statusCounts: createMetric(stats.statusCounts, "RESULT_DERIVED", undefined, marksheetSources),
      passRate: createMetric(
        subjectResults.length > 0
          ? Math.round((stats.passedSubjects.length / subjectResults.length) * 10000) / 100
          : null,
        "RESULT_DERIVED",
        undefined,
        marksheetSources
      ),
      distinctionCount: createMetric(
        stats.distinctionCount,
        "RESULT_DERIVED",
        undefined,
        marksheetSources
      ),
      internalAverage: createMetric(
        average(stats.internalMarksList),
        "RESULT_DERIVED",
        undefined,
        marksheetSources
      ),
      externalAverage: createMetric(
        average(stats.externalMarksList),
        "RESULT_DERIVED",
        undefined,
        marksheetSources
      ),
      semesterSummaries: createMetric(
        stats.semesterSummaries,
        "RESULT_DERIVED",
        undefined,
        marksheetSources
      ),
      grade: gradeMetric,
      subjectPassRule,
      framework,
      sgpaBySemester,
      semesterPerformance,
      sgpa,
      cgpa,
      percentage,
      division,
      divisionPresentation,
      promotion,
      academicPromotion,
      reappearPlan,
      warnings,
    },
    warnings,
  };
}

// Re-export all types and domain modules cleanly
export type * from "@/types/result";
export * from "./subject-results";
export * from "./rules/promotion";
export * from "./rules/reappear";
export * from "./rules/division";
export * from "./rules/placement";
