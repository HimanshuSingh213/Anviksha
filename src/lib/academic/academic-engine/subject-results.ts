import {
  ACADEMIC_DB,
  getSubjectMaxMarks,
  type GradeBand,
  type OrdinanceEntry,
  type ProgrammeEntry,
  type SupportState,
} from "../academic-db";
import type {
  Metric,
  ResultState,
  StatusSemantic,
  SubjectResult,
} from "./types";

/**
 * Helper to wrap a computed value into a structured Metric object with support status and audit sources.
 *
 * @param value - The calculated metric value
 * @param status - The statutory verification state (e.g. "VERIFIED", "RESULT_DERIVED", "WARNING")
 * @param reason - Optional explanatory note or caveat
 * @param sources - Legal sources or ordinance clauses supporting this metric
 * @returns Structured Metric domain object containing value, status, reason, and unique sources
 */
export function createMetric<T>(
  value: T | null,
  status: SupportState,
  reason?: string,
  sources: string[] = []
): Metric<T> {
  const uniqueSources = Array.from(new Set(sources.filter(Boolean)));
  return { value, status, reason, sources: uniqueSources };
}

/**
 * Sanitizes an unknown input into a trimmed string, converting null/undefined to an empty string.
 *
 * @param value - Raw input value
 * @returns Clean trimmed string
 */
export function toCleanString(value: unknown): string {
  return String(value ?? "").trim();
}

/**
 * Safely parses an unknown value into a finite number, returning undefined for empty or non-numeric values.
 *
 * @param value - Raw input value
 * @returns Parsed number or undefined
 */
export function toCleanNumber(value: unknown): number | undefined {
  if (value === null || value === undefined || value === "") return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

/**
 * Calculates the arithmetic mean of an array of numbers, rounded to two decimal places.
 *
 * @param nums - Array of numeric values
 * @returns The rounded average, or null if the array is empty
 */
export function average(nums: number[]): number | null {
  if (nums.length === 0) return null;
  return Math.round((nums.reduce((sum, val) => sum + val, 0) / nums.length) * 100) / 100;
}

/**
 * Determines whether a semantic status indicates that the subject was cleared/passed.
 *
 * @param semanticStatus - The decoded StatusSemantic
 * @returns True if cleared or passed
 */
export function isSubjectPassed(semanticStatus: StatusSemantic): boolean {
  return (
    semanticStatus === "PASS" ||
    semanticStatus === "CREDIT_SECURED" ||
    semanticStatus === "ALREADY_PASSED"
  );
}

/**
 * Decodes raw marksheet status codes (e.g. "08", "09") and legend tokens ("ABS", "DET", "CAN")
 * into a standardized StatusSemantic enum value.
 *
 * @param status - Raw status code from marksheet
 * @param total - Raw total marks string (may contain legends like "ABS" or "DET")
 * @returns Standardized StatusSemantic
 */
export function decodeStatus(
  status: string | number | undefined,
  total: string | number | undefined
): StatusSemantic {
  const statusCode = toCleanString(status);
  const totalCode = toCleanString(total).toUpperCase();
  const numericMapping = (
    ACADEMIC_DB.statuses.numericStatus as Record<string, { semantic: string }>
  )[statusCode];
  const legendMapping = (
    ACADEMIC_DB.statuses.totalLegends as Record<string, { semantic: string }>
  )[totalCode];
  if (legendMapping) return legendMapping.semantic as StatusSemantic;
  if (numericMapping) return numericMapping.semantic as StatusSemantic;
  return "UNKNOWN";
}

/**
 * Classifies a subject's completion standing into a ResultState ("CLEARED", "BACK", "ABSENT", "DETAINED", "UNKNOWN").
 *
 * @param status - Raw status code
 * @param rawTotal - Raw marks total or legend string
 * @returns ResultState enum value
 */
export function getResultState(
  status: string | number | undefined,
  rawTotal: string | number | undefined
): ResultState {
  const s = String(status ?? "").trim();
  const tot = String(rawTotal ?? "").trim().toUpperCase();

  if (s === "08" || s === "8") {
    return "CLEARED";
  }

  if (s === "09" || s === "9") {
    if (tot === "ABS" || tot.includes("ABS")) return "ABSENT";
    if (tot === "DET" || tot.includes("DET")) return "DETAINED";
    if (!isNaN(Number(tot))) return "BACK";
    return "UNKNOWN";
  }

  if (tot === "ABS" || tot.includes("ABS")) return "ABSENT";
  if (tot === "DET" || tot.includes("DET")) return "DETAINED";

  const num = Number(tot);
  if (!isNaN(num)) {
    return num >= 40 ? "CLEARED" : "BACK";
  }

  return "UNKNOWN";
}

/**
 * Fallback heuristic estimating course credits based on standard subject titles (1 for Lab, 2 for Project, 3 for Theory).
 *
 * @param subjectTitle - Title of the subject/paper
 * @returns Estimated credit value
 */
export function getDefaultCredit(subjectTitle: string): number {
  const title = (subjectTitle || "").toUpperCase();
  if (title.includes("LAB") || title.includes("PRACTICAL") || title.includes("STUDIO")) return 1;
  if (title.includes("PROJECT") || title.includes("VIVA") || title.includes("DISSERTATION")) return 2;
  return 3;
}

/**
 * Alias for getDefaultCredit heuristic.
 */
export const getFallbackCredit = getDefaultCredit;

/**
 * Maps total marks or status codes directly to a 10-point letter grade and grade point.
 *
 * @param rawTotal - Raw marks total or legend
 * @returns Object with grade string, grade points, pass boolean, and isNumeric flag
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

/**
 * Resolves the credit weighting for a given paper code, checking custom overrides first then falling back.
 *
 * @param paperCode - Subject paper code
 * @param customCredits - User-provided custom credits map
 * @param fallbackCredit - Default fallback credit value
 * @returns Resolved numeric credit value
 */
export function resolvePaperCredit(
  paperCode: string | undefined | null,
  customCredits: Record<string, number | null> | undefined,
  fallbackCredit: number
): number {
  if (!paperCode || !customCredits) {
    return fallbackCredit;
  }

  if (paperCode in customCredits) {
    return customCredits[paperCode] ?? 0;
  }

  const upperCode = typeof paperCode === "string" ? paperCode.toUpperCase() : "";
  if (upperCode && upperCode in customCredits) {
    return customCredits[upperCode] ?? 0;
  }

  return fallbackCredit;
}

/**
 * Resolves a letter grade and point by matching total marks against statutory GradeBand ranges.
 *
 * @param totalMarks - Student's total marks (0-100)
 * @param gradeBands - Ordinance GradeBand ranges
 * @returns Grade value and point, or null if no band matched
 */
export function getGradeFromMarks(totalMarks: number, gradeBands: GradeBand[]) {
  for (const band of gradeBands) {
    if (totalMarks >= band.minimumMarks && totalMarks <= band.maximumMarks) {
      return { value: band.grade, point: band.gradePoint };
    }
  }
  return null;
}

/**
 * Calculates weighted Grade Point Average: Σ(credits × gradePoints) / Σ(credits) across graded subjects.
 *
 * @param subjects - Array of SubjectResults
 * @returns Weighted GPA rounded to 2 decimal places, or null if no graded subjects
 */
export function calculateWeightedGpa(subjects: SubjectResult[]): number | null {
  let totalWeightedPoints = 0;
  let totalCredits = 0;
  let gradedSubjectCount = 0;
  for (const subject of subjects) {
    if (subject.credits.value === null || subject.credits.value === undefined || subject.credits.value <= 0) continue;
    if (subject.gradePointUsedForGpa === null) continue;
    totalWeightedPoints += subject.credits.value * subject.gradePointUsedForGpa;
    totalCredits += subject.credits.value;
    gradedSubjectCount += 1;
  }
  if (gradedSubjectCount === 0) return null;
  return Math.round((totalWeightedPoints / totalCredits) * 100) / 100;
}

/**
 * Resolves credit value and attribution source for a single subject.
 * Checks user overrides first, then falls back to title heuristic if enabled, or marks UNAVAILABLE.
 *
 * @param rawPaperCode - Subject paper code from marksheet
 * @param subjectName - Title or subject name string
 * @param userCredits - Map of user-provided credit overrides
 * @param allowFallbackCredits - Whether heuristic title-based credits are permitted
 * @param usesCredits - Whether the academic framework uses credits
 * @returns Credits object with numeric value and source attribution ("USER", "ESTIMATED", or "UNAVAILABLE")
 */
export function resolveSubjectCredit(
  rawPaperCode: string,
  subjectName: string,
  userCredits: Record<string, number | null>,
  allowFallbackCredits: boolean,
  usesCredits: boolean
): SubjectResult["credits"] {
  // Check if user explicitly provided/edited credits (case-insensitive lookup)
  const explicitCredit = userCredits[rawPaperCode] ?? userCredits[rawPaperCode.toUpperCase()];
  if (explicitCredit !== undefined) {
    return {
      value: explicitCredit !== null && Number.isFinite(explicitCredit) ? Math.max(0, explicitCredit) : null,
      source: "USER",
    };
  }

  // Fall back to title-based heuristic if enabled and framework uses credits
  if (allowFallbackCredits && usesCredits) {
    return {
      value: getDefaultCredit(subjectName),
      source: "ESTIMATED",
    };
  }

  return { value: null, source: "UNAVAILABLE" };
}

/**
 * Checks whether the student's marks meet the official university ordinance pass threshold.
 *
 * @param numericTotal - Total numerical marks scored
 * @param maxMarks - Maximum marks possible for the subject
 * @param ordinance - Authoritative OrdinanceEntry or null
 * @param programme - Resolved ProgrammeEntry or null
 * @returns Pass rule status: "PASS", "FAIL", or "UNTESTABLE"
 */
export function checkSubjectPassRule(
  numericTotal: number | undefined,
  maxMarks: number | null,
  ordinance: OrdinanceEntry | null,
  programme: ProgrammeEntry | null
): "PASS" | "FAIL" | "UNTESTABLE" {
  const isAmbiguous = programme?.verification === "INFERRED" || !programme;
  const passRuleByTotalMarks = ordinance?.rules.coursePassByTotalMarks;

  if (!isAmbiguous && passRuleByTotalMarks && numericTotal !== undefined && maxMarks) {
    const scorePercent = (numericTotal / maxMarks) * 100;
    return scorePercent >= passRuleByTotalMarks.minimumTotalPercent ? "PASS" : "FAIL";
  }

  return "UNTESTABLE";
}

/**
 * Evaluates the letter grade and GPA grade point based on ordinance rules.
 * Matches numeric total against statutory GradeBands, handling non-letter distinctions if applicable.
 *
 * @param numericTotal - Total numerical marks scored
 * @param maxMarks - Maximum marks possible for the subject
 * @param isPassed - Whether the subject status indicates cleared/passed
 * @param ordinance - Authoritative OrdinanceEntry or null
 * @param programme - Resolved ProgrammeEntry or null
 * @returns Object containing the evaluated letter Grade object and gradePointUsedForGpa
 */
export function evaluateSubjectGrade(
  numericTotal: number | undefined,
  maxMarks: number | null,
  isPassed: boolean,
  ordinance: OrdinanceEntry | null,
  programme: ProgrammeEntry | null
): {
  grade: SubjectResult["grade"];
  gradePointUsedForGpa: number | null;
} {
  const gradeRule = ordinance?.rules.gradeFromTotalMarks;
  const gradeRuleApplies = Boolean(
    programme &&
      gradeRule &&
      ordinance?.capabilities?.grade !== false &&
      programme.verification === "VERIFIED"
  );

  if (gradeRuleApplies && numericTotal !== undefined && numericTotal <= 100) {
    const calculated = getGradeFromMarks(numericTotal, gradeRule!.bands);
    if (calculated) {
      return {
        grade: {
          value: isPassed ? calculated.value : "F",
          point: isPassed ? calculated.point : 0,
        },
        gradePointUsedForGpa: calculated.point,
      };
    }
  }

  // Distinction for non-letter-grade ordinances (e.g. medical / allied health)
  if (
    ordinance?.rules.noLetterGrades &&
    numericTotal !== undefined &&
    isPassed &&
    ordinance.rules.courseDistinction &&
    maxMarks
  ) {
    const percentageScore = (numericTotal / maxMarks) * 100;
    if (percentageScore > ordinance.rules.courseDistinction.minimumPercentExclusive) {
      return {
        grade: { value: ordinance.rules.courseDistinction.label, point: 0 },
        gradePointUsedForGpa: null,
      };
    }
  }

  return { grade: null, gradePointUsedForGpa: null };
}

/**
 * Parses a single raw marksheet row tuple into a SubjectResult domain object.
 * Extracts semester, subject title, marks, pass criteria, letter grade, and credits.
 *
 * @param row - Raw table row tuple from ExamWeb marksheet
 * @param ordinance - Authoritative OrdinanceEntry or null
 * @param programme - Resolved ProgrammeEntry or null
 * @param userCredits - Map of user-provided credit overrides
 * @param allowFallbackCredits - Whether fallback credit heuristics are enabled (defaults to true)
 * @returns Structured and graded SubjectResult domain object
 */
export function parseSubjectResultRow(
  row: unknown[],
  ordinance: OrdinanceEntry | null,
  programme: ProgrammeEntry | null,
  userCredits: Record<string, number | null>,
  allowFallbackCredits: boolean = true
): SubjectResult {
  const [
    periodNumber,
    paperCode,
    subjectName,
    internalMarks,
    externalMarks,
    totalMarks,
    statusCode,
    examMonthYear,
    declaredDate,
  ] = row;

  const rawCode = toCleanString(paperCode);
  const name = toCleanString(subjectName);
  const rawTotal = toCleanString(totalMarks);
  const numericTotal = toCleanNumber(totalMarks);
  const rawStatusCode = toCleanString(statusCode);

  const semantic = decodeStatus(rawStatusCode, rawTotal);
  const isPassed = isSubjectPassed(semantic);
  const maxMarks = getSubjectMaxMarks(name, programme?.programmeFamily);
  const marksPercent =
    numericTotal !== undefined && maxMarks
      ? Math.round((numericTotal / maxMarks) * 10000) / 100
      : null;

  const ruleCheck = checkSubjectPassRule(numericTotal, maxMarks, ordinance, programme);
  const { grade, gradePointUsedForGpa } = evaluateSubjectGrade(
    numericTotal,
    maxMarks,
    isPassed,
    ordinance,
    programme
  );
  const credits = resolveSubjectCredit(
    rawCode,
    name,
    userCredits,
    allowFallbackCredits,
    ordinance?.capabilities?.credits !== false
  );

  return {
    semester: periodNumber as number | string,
    rawCode,
    name,
    internal: toCleanNumber(internalMarks),
    external: toCleanNumber(externalMarks),
    total: numericTotal,
    rawTotal,
    examMonthYear: toCleanString(examMonthYear),
    declaredDate: toCleanString(declaredDate),
    maxMarks,
    marksPercent,
    semantic,
    credits,
    grade,
    gradePointUsedForGpa,
    ruleCheck,
  };
}

/**
 * Transforms raw marksheet table rows into structured, graded subject results.
 *
 * @param rawMarksheetRows - 2D array of raw marksheet rows from ExamWeb
 * @param ordinance - Authoritative OrdinanceEntry or null
 * @param programme - Resolved ProgrammeEntry or null
 * @param userCredits - Map of user-provided credit overrides
 * @param allowFallbackCredits - Whether fallback credit heuristics are enabled (defaults to true)
 * @returns Array of structured and graded SubjectResult domain objects
 */
export function parseSubjectResults(
  rawMarksheetRows: unknown[][],
  ordinance: OrdinanceEntry | null,
  programme: ProgrammeEntry | null,
  userCredits: Record<string, number | null>,
  allowFallbackCredits: boolean = true
): SubjectResult[] {
  return rawMarksheetRows.map((row) =>
    parseSubjectResultRow(row, ordinance, programme, userCredits, allowFallbackCredits)
  );
}
