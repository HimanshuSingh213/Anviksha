import useResultStore from "@/store/result-store";
import {
  ACADEMIC_DB,
  findOrdinance,
  findProgramme,
  getSubjectMaxMarks,
  type ExaminationSystem,
  type GradeBand,
  type OrdinanceEntry,
  type ProgrammeEntry,
  type SupportState,
  type Verification,
} from "./academic-db";

export type StatusSemantic =
  | "PASS" | "NOT_CLEARED" | "ABSENT" | "DETAINED" | "CANCELLED"
  | "RESULT_LATER" | "CREDIT_SECURED" | "ALREADY_PASSED" | "UNKNOWN";

export interface Metric<T = number | string | boolean> {
  value: T | null;
  status: SupportState;
  reason?: string;
  sources: string[];
}
export type MetricResult<T> = Metric<T>;

export interface ExamWebProfile {
  nrollno?: string | number;
  stname?: string;
  byoa?: string | number;
  yoa?: string | number;
  prgcode?: string | number;
  prgname?: string;
  icode?: string | number;
  iname?: string;
}

export interface ExamWebResult {
  stprofile?: ExamWebProfile;
  stresult?: unknown[][];
}

export type ResultDeliverySource =
  | "EXAMWEB"
  | "STUDENT_PORTAL"
  | "RESULT_PDF"
  | "OTHER"
  | "UNKNOWN";

export interface EngineCourse {
  period: number | string;
  rawCode: string;
  name: string;
  internal?: number;
  external?: number;
  total?: number;
  rawTotal: string;
  rawStatus: string;
  rawStatusCode: string;
  normalizedStatus: StatusSemantic | null;
  examMonthYear: string;
  declaredDate: string;
  maxMarks: number | null;
  marksPercent: number | null;
  semantic: StatusSemantic;
  credits: {
    value: number | null;
    source: "SCHEME" | "USER" | "UNAVAILABLE";
    status: SupportState;
    verification: Verification | "USER_PROVIDED";
  };
  grade: { value: string; point: number; status: SupportState; sources: string[] } | null;
  gradePointUsedForGpa: number | null;
  courseVerification: "UNKNOWN" | "RESULT_DERIVED" | "VERIFIED";
  ruleCheck: "PASS" | "FAIL" | "UNTESTABLE";
  rawResultUsable: true;
}

export interface EnginePromotionYear {
  yearNumber: number;
  yearLabel: string;
  totalCredits: number;
  earnedCredits: number;
  requiredCredits: number;
  standing: "PROMOTED" | "NOT_PROMOTED" | "ACADEMIC_BREAK" | "UNKNOWN";
  progressPercent: number;
}

export interface MetricWarning {
  severity: "INFO" | "WARNING" | "HIGH";
  message: string;
}

export interface EngineResult {
  programme: {
    programmeCode: string;
    programmeName: string;
    programmeFamily: string | null;
    examinationSystem: ExaminationSystem | null;
    instituteCode: string;
    instituteName: string;
    cohort: number | null;
    ordinance: string | null;
    scheme: string | null;
    known: boolean;
    isTech: boolean;
    dbVerification: Verification | null;
    resultDeliverySource: ResultDeliverySource;
  };
  courses: EngineCourse[];
  analytics: {
    paperCount: Metric<number>;
    numericMarksCount: Metric<number>;
    averageMarks: Metric<number>;
    averagePercentage: Metric<number>;
    highestMarks: Metric<number>;
    lowestMarks: Metric<number>;
    passedOrClearedCount: Metric<number>;
    notClearedCount: Metric<number>;
    statusCounts: Metric<Record<string, number>>;
    passRate: Metric<number>;
    distinctionCount: Metric<number>;
    internalAverage: Metric<number>;
    externalAverage: Metric<number>;
    periodSummaries: Metric<Array<{
      period: number | string;
      paperCount: number;
      numericMarksCount: number;
      averageMarks: number | null;
      averagePercentage: number | null;
      highestMarks: number | null;
      lowestMarks: number | null;
    }>>;
    grade: Metric<boolean | null>;
    coursePassRule: Metric<string | null>;
    framework: Metric<string | null>;
    sgpaByPeriod: Array<{ period: number | string; sgpa: Metric<number | null> }>;
    sgpa: Metric<number | null>;
    cgpa: Metric<number | null>;
    percentage: Metric<number | null>;
    division: Metric<string | null>;
    promotion: Metric<EnginePromotionYear[] | null>;
    warnings: MetricWarning[];
  };
  warnings: MetricWarning[];
}

function createMetric<T>(value: T | null, status: SupportState, reason?: string, sources: string[] = []): Metric<T> {
  return { value, status, reason, sources };
}

function toCleanString(value: unknown): string {
  return String(value ?? "").trim();
}

function toCleanNumber(value: unknown): number | undefined {
  if (value === null || value === undefined || value === "") return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function average(nums: number[]): number | null {
  if (nums.length === 0) return null;
  return Math.round((nums.reduce((sum, val) => sum + val, 0) / nums.length) * 100) / 100;
}

function isCoursePassed(semanticStatus: StatusSemantic): boolean {
  return semanticStatus === "PASS" || semanticStatus === "CREDIT_SECURED" || semanticStatus === "ALREADY_PASSED";
}

export function decodeStatus(status: string | number | undefined, total: string | number | undefined): StatusSemantic {
  const statusCode = toCleanString(status);
  const totalCode = toCleanString(total).toUpperCase();
  const numericMapping = (ACADEMIC_DB.statuses.numericStatus as Record<string, { semantic: string }>)[statusCode];
  const legendMapping = (ACADEMIC_DB.statuses.totalLegends as Record<string, { semantic: string }>)[totalCode];
  if (legendMapping) return legendMapping.semantic as StatusSemantic;
  if (numericMapping) return numericMapping.semantic as StatusSemantic;
  return "UNKNOWN";
}

function getGradeFromMarks(totalMarks: number, gradeBands: GradeBand[]) {
  for (const band of gradeBands) {
    if (totalMarks >= band.minimumMarks && totalMarks <= band.maximumMarks) {
      return { value: band.grade, point: band.gradePoint };
    }
  }
  return null;
}

function calculateWeightedGpa(courses: EngineCourse[]): number | null {
  let totalWeightedPoints = 0;
  let totalCredits = 0;
  for (const course of courses) {
    if (course.credits.value === null || course.gradePointUsedForGpa === null) return null;
    totalWeightedPoints += course.credits.value * course.gradePointUsedForGpa;
    totalCredits += course.credits.value;
  }
  return totalCredits > 0 ? Math.round((totalWeightedPoints / totalCredits) * 100) / 100 : null;
}

function evaluatePromotion(courses: EngineCourse[], ordinance: OrdinanceEntry | null): Metric<EnginePromotionYear[] | null> {
  const allCoursesPassRule = ordinance?.rules.promotionByAllCourses;
  if (allCoursesPassRule) {
    const periodList = [...new Set(courses.map((course) => course.period))];
    const promotionYears = periodList.map((period, index) => {
      const periodCourses = courses.filter((course) => course.period === period);
      const passedInPeriod = periodCourses.filter((course) => isCoursePassed(course.semantic));
      const failedInPeriod = periodCourses.filter((course) => !isCoursePassed(course.semantic));
      const standing = failedInPeriod.length === 0 ? ("PROMOTED" as const) : ("NOT_PROMOTED" as const);
      return {
        yearNumber: index + 1,
        yearLabel: `Year ${index + 1}`,
        totalCredits: periodCourses.reduce((sum, c) => sum + (c.credits.value ?? 0), 0),
        earnedCredits: passedInPeriod.reduce((sum, c) => sum + (c.credits.value ?? 0), 0),
        requiredCredits: 0,
        standing,
        progressPercent: periodCourses.length ? Math.round((passedInPeriod.length / periodCourses.length) * 1000) / 10 : 0,
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
  if (!creditShareRule) return createMetric<EnginePromotionYear[] | null>(null, "UNAVAILABLE", "Promotion rule is not defined for this programme.");

  for (const course of courses) {
    if (course.credits.value === null) {
      return createMetric<EnginePromotionYear[] | null>(null, "UNAVAILABLE", "Promotion requires authoritative course credits.");
    }
  }

  const academicYearsMap = new Map<number, { totalCredits: number; earnedCredits: number; hasOdd: boolean; hasEven: boolean }>();
  for (const course of courses) {
    const period = Number(course.period);
    const yearNumber = Math.ceil(period / 2);
    if (!Number.isFinite(yearNumber) || yearNumber < 1) continue;

    const currentYearStats = academicYearsMap.get(yearNumber) ?? { totalCredits: 0, earnedCredits: 0, hasOdd: false, hasEven: false };
    currentYearStats.totalCredits += course.credits.value!;
    if (isCoursePassed(course.semantic)) currentYearStats.earnedCredits += course.credits.value!;
    if (period % 2 === 1) currentYearStats.hasOdd = true;
    if (period % 2 === 0) currentYearStats.hasEven = true;
    academicYearsMap.set(yearNumber, currentYearStats);
  }

  const sortedYears = [...academicYearsMap.entries()].sort(([a], [b]) => a - b);
  let hasIncompleteYear = false;
  let hasMissingPriorYears = false;
  let cumulativePriorEarned = 0;
  let cumulativePriorTotal = 0;

  const promotionYears = sortedYears.map(([yearNumber, creditStats]) => {
    const isYearComplete = creditStats.hasOdd && creditStats.hasEven;
    if (!isYearComplete) hasIncompleteYear = true;

    for (let y = 1; y < yearNumber; y++) {
      const priorStats = academicYearsMap.get(y);
      if (!priorStats || !priorStats.hasOdd || !priorStats.hasEven) {
        hasMissingPriorYears = true;
      }
    }

    const requiredCredits = Math.ceil(creditStats.totalCredits * creditShareRule.minimumEarnedCreditShare);
    const meetsEnsuingYear = creditStats.earnedCredits >= requiredCredits;
    const meetsPriorYears = cumulativePriorTotal > 0
      ? cumulativePriorEarned >= Math.ceil(cumulativePriorTotal * 0.9)
      : true;

    const standing = (isYearComplete && meetsEnsuingYear && meetsPriorYears) ? ("PROMOTED" as const) : ("NOT_PROMOTED" as const);

    cumulativePriorEarned += creditStats.earnedCredits;
    cumulativePriorTotal += creditStats.totalCredits;

    return {
      yearNumber,
      yearLabel: `Year ${yearNumber}`,
      totalCredits: creditStats.totalCredits,
      earnedCredits: creditStats.earnedCredits,
      requiredCredits,
      standing,
      progressPercent: creditStats.totalCredits ? Math.round((creditStats.earnedCredits / creditStats.totalCredits) * 1000) / 10 : 0,
    };
  });

  const status: SupportState = (hasIncompleteYear || hasMissingPriorYears) ? "WARNING" : "RESULT_DERIVED";
  const explanation = (hasIncompleteYear || hasMissingPriorYears)
    ? "Evaluated with warning: Ordinance 11 Clause 12 requires completion of both semesters of the ensuing academic year (≥50% credits) and ≥90% credits across all prior academic years. Transcript contains incomplete year or missing prior semester data."
    : "Derived under Ordinance 11 Clause 12: minimum 50% credits earned in ensuing academic year and 90% credits across all prior academic years.";

  return createMetric(promotionYears, status, explanation, creditShareRule.sources);
}

function buildCourses(
  marksheetRows: unknown[][],
  ordinance: OrdinanceEntry | null,
  programme: ProgrammeEntry | null,
  userCredits: Record<string, number>
): EngineCourse[] {
  const gradeRule = ordinance?.rules.gradeFromTotalMarks;
  const coursePassRule = ordinance?.rules.coursePassByTotalMarks;

  return marksheetRows.map((row) => {
    const [periodNumber, paperCode, subjectName, internalMarks, externalMarks, totalMarks, statusCode, examMonthYear, declaredDate] = row;
    const rawCode = toCleanString(paperCode);
    const name = toCleanString(subjectName);
    const rawTotal = toCleanString(totalMarks);
    const numericTotal = toCleanNumber(totalMarks);
    const rawStatusCode = toCleanString(statusCode);
    const rawStatus = rawStatusCode;
    const semantic = decodeStatus(rawStatusCode, rawTotal);
    const normalizedStatus = semantic === "UNKNOWN" ? null : semantic;

    const maxMarks = getSubjectMaxMarks(name, programme?.programmeFamily);
    const isAmbiguous = programme?.verification === "INFERRED" || !programme;
    const ruleCheck = !isAmbiguous && coursePassRule && numericTotal !== undefined && maxMarks
      ? (numericTotal / maxMarks * 100 >= coursePassRule.minimumTotalPercent ? "PASS" as const : "FAIL" as const)
      : "UNTESTABLE" as const;
    const marksPercent = numericTotal !== undefined && maxMarks ? Math.round((numericTotal / maxMarks) * 10000) / 100 : null;

    const userCredit = userCredits[rawCode] ?? userCredits[rawCode.toUpperCase()];
    const hasUserCredit = typeof userCredit === "number" && Number.isFinite(userCredit) && userCredit > 0;
    const gradeRuleApplies = Boolean(programme && gradeRule && ordinance?.capabilities?.grade !== false && programme.verification === "VERIFIED");
    const calculatedGrade = gradeRuleApplies && numericTotal !== undefined && numericTotal <= 100 ? getGradeFromMarks(numericTotal, gradeRule!.bands) : null;

    let grade: EngineCourse["grade"] = null;
    if (gradeRuleApplies && calculatedGrade) {
      grade = {
        value: isCoursePassed(semantic) ? calculatedGrade.value : "F",
        point: isCoursePassed(semantic) ? calculatedGrade.point : 0,
        status: "RESULT_DERIVED",
        sources: gradeRule!.sources,
      };
    } else if (ordinance?.rules.noLetterGrades && numericTotal !== undefined && isCoursePassed(semantic) && ordinance.rules.courseDistinction && maxMarks) {
      const percentageScore = (numericTotal / maxMarks) * 100;
      if (percentageScore > ordinance.rules.courseDistinction.minimumPercentExclusive) {
        grade = { value: ordinance.rules.courseDistinction.label, point: 0, status: "VERIFIED", sources: ordinance.rules.courseDistinction.sources };
      }
    }

    const gradePointUsedForGpa = gradeRuleApplies ? (isCoursePassed(semantic) ? (calculatedGrade?.point ?? 0) : 0) : null;

    const credits = hasUserCredit
      ? { value: userCredit, source: "USER" as const, status: "RESULT_DERIVED" as const, verification: "USER_PROVIDED" as const }
      : { value: null, source: "UNAVAILABLE" as const, status: "UNAVAILABLE" as const, verification: "UNKNOWN" as const };

    return {
      period: periodNumber as number | string,
      rawCode,
      name,
      internal: toCleanNumber(internalMarks),
      external: toCleanNumber(externalMarks),
      total: numericTotal,
      rawTotal,
      rawStatus,
      rawStatusCode,
      normalizedStatus,
      examMonthYear: toCleanString(examMonthYear),
      declaredDate: toCleanString(declaredDate),
      maxMarks,
      marksPercent,
      semantic,
      credits,
      grade,
      gradePointUsedForGpa,
      courseVerification: "RESULT_DERIVED",
      ruleCheck,
      rawResultUsable: true as const,
    };
  });
}

export function analyzeResult(rawResult: ExamWebResult | null | undefined, userEditedCredits: Record<string, number> = {}): EngineResult {
  const studentProfile = rawResult?.stprofile;
  const marksheetRows = rawResult?.stresult ?? [];
  const programmeCode = toCleanString(studentProfile?.prgcode);
  const programmeName = toCleanString(studentProfile?.prgname);
  const programme = findProgramme(programmeName || programmeCode);
  const ordinance = findOrdinance(programme);
  const cohort = toCleanNumber(studentProfile?.yoa) ?? toCleanNumber(studentProfile?.byoa) ?? null;
  const warnings: MetricWarning[] = [];

  if (!programme) {
    warnings.push({
      severity: "WARNING",
      message: `Programme "${programmeName || programmeCode || "(unknown)"}" is not mapped. Raw result remains fully available.`,
    });
  }

  const courses = buildCourses(marksheetRows, ordinance, programme, userEditedCredits);
  for (const course of courses) {
    if (course.ruleCheck === "FAIL" && isCoursePassed(course.semantic)) {
      warnings.push({
        severity: "WARNING",
        message: `${course.rawCode} is marked cleared by ExamWeb, but its displayed total is below the verified programme pass threshold. The raw ExamWeb status is preserved; verify the official marksheet.`,
      });
    }
    if (course.ruleCheck === "PASS" && !isCoursePassed(course.semantic) && programme?.programmeFamily === "BPT") {
      warnings.push({
        severity: "WARNING",
        message: `${course.rawCode} meets the loaded BPT/BOT 50% course threshold but ExamWeb reports it as not cleared.`,
      });
    }
  }

  const numericTotals = courses.map((course) => course.total).filter((value): value is number => value !== undefined);
  const percentages = courses.map((course) => course.marksPercent).filter((value): value is number => value !== null);
  const internalMarksList = courses.map((course) => course.internal).filter((value): value is number => value !== undefined);
  const externalMarksList = courses.map((course) => course.external).filter((value): value is number => value !== undefined);
  const marksheetSources = ["ExamWeb result"];

  const statusCounts = courses.reduce<Record<string, number>>((accumulator, course) => {
    accumulator[course.semantic] = (accumulator[course.semantic] ?? 0) + 1;
    return accumulator;
  }, {});

  const passedCourses = courses.filter((course) => isCoursePassed(course.semantic));
  const distinctionCount = courses.filter((course) => course.grade?.value === "Distinction").length;

  const periodList = [...new Set(courses.map((course) => course.period))];
  const periodSummaries = periodList.map((period) => {
    const periodCourses = courses.filter((course) => course.period === period);
    const marks = periodCourses.map((course) => course.total).filter((value): value is number => value !== undefined);
    const pcts = periodCourses.map((course) => course.marksPercent).filter((value): value is number => value !== null);
    return {
      period,
      paperCount: periodCourses.length,
      numericMarksCount: marks.length,
      averageMarks: average(marks),
      averagePercentage: average(pcts),
      highestMarks: marks.length ? Math.max(...marks) : null,
      lowestMarks: marks.length ? Math.min(...marks) : null,
    };
  });

  const capabilities = ordinance?.capabilities;
  const generalGradeRule = ordinance?.rules.gradeFromTotalMarks;
  const noLetterGradesRule = ordinance?.rules.noLetterGrades;

  let gradeMetric: Metric<boolean | null>;
  if (programme?.verification === "INFERRED") {
    gradeMetric = createMetric(null, "AMBIGUOUS", "Letter grade scale is ambiguous because the exact degree scheme is not established from the generic programme name.");
  } else if (capabilities && !capabilities.grade) {
    gradeMetric = createMetric(
      null,
      "NOT_APPLICABLE",
      noLetterGradesRule?.reason ?? "Letter grades are not applicable to this programme.",
      noLetterGradesRule?.sources ?? ordinance?.sources ?? []
    );
  } else if (generalGradeRule && programme) {
    gradeMetric = createMetric(
      true,
      "RESULT_DERIVED",
      "Evaluated from marksheet total marks using Ordinance 10-point grade scale.",
      generalGradeRule.sources
    );
  } else if (noLetterGradesRule) {
    gradeMetric = createMetric(null, "NOT_APPLICABLE", noLetterGradesRule.reason, noLetterGradesRule.sources);
  } else {
    gradeMetric = createMetric(null, "UNAVAILABLE", "No verified letter-grade rule is defined for this programme.");
  }

  const passRule = ordinance?.rules.coursePassByTotalMarks ?? ordinance?.rules.componentPass;
  let coursePassRule: Metric<string | null>;
  if (programme?.verification === "INFERRED") {
    coursePassRule = createMetric(null, "AMBIGUOUS", "Pass rule is ambiguous without specific programme scheme evidence.");
  } else if (passRule && "minimumTotalPercent" in passRule && programme) {
    coursePassRule = createMetric(`Minimum ${passRule.minimumTotalPercent}% aggregate marks in each course.`, "VERIFIED", undefined, passRule.sources);
  } else if (passRule && "minimumAggregatePercent" in passRule && programme) {
    coursePassRule = createMetric(
      `Minimum ${passRule.minimumAggregatePercent}% aggregate, ${passRule.minimumTheoryPercent}% theory including oral, and ${passRule.minimumPracticalPercent}% practical.`,
      "VERIFIED",
      "Professional component passing rule under Ordinance 15.",
      passRule.sources
    );
  } else {
    coursePassRule = createMetric(null, "UNAVAILABLE", "No programme-specific course pass rule is loaded.");
  }

  const hasAllCredits = courses.length > 0 && courses.every((course) => course.credits.value !== null);
  const sgpaApplicable = capabilities ? capabilities.sgpa : Boolean(generalGradeRule?.bands && ordinance?.rules.sgpa);
  const cgpaApplicable = capabilities ? capabilities.cgpa : Boolean(generalGradeRule?.bands && ordinance?.rules.cgpa);

  const sgpaByPeriod = periodList.map((period) => {
    const periodCourses = courses.filter((course) => course.period === period);
    if (programme?.verification === "INFERRED") {
      return {
        period,
        sgpa: createMetric<number>(null, "AMBIGUOUS", "SGPA is not calculated because the programme framework is ambiguous."),
      };
    }
    if (!sgpaApplicable) {
      return {
        period,
        sgpa: createMetric<number>(
          null,
          "NOT_APPLICABLE",
          noLetterGradesRule?.reason ?? "SGPA is not applicable to this programme.",
          noLetterGradesRule?.sources ?? ordinance?.sources ?? []
        ),
      };
    }
    const periodHasAllCredits = periodCourses.length > 0 && periodCourses.every((course) => course.credits.value !== null);
    if (!periodHasAllCredits) {
      return {
        period,
        sgpa: createMetric<number>(null, "UNAVAILABLE", "Authoritative course credits are not available."),
      };
    }
    const periodGpa = calculateWeightedGpa(periodCourses);
    return {
      period,
      sgpa: createMetric(
        periodGpa,
        "RESULT_DERIVED",
        "Weighted GPA derived from semester course marks and credits using Ordinance 11 formula.",
        ordinance?.rules.sgpa?.sources ?? ["GGSIPU Ordinance 11"]
      ),
    };
  });

  // Latest semester SGPA
  const latestSgpa = sgpaByPeriod[sgpaByPeriod.length - 1]?.sgpa;
  const sgpa = latestSgpa ?? (
    programme?.verification === "INFERRED"
      ? createMetric<number>(null, "AMBIGUOUS", "SGPA is not calculated because the programme framework is ambiguous.")
      : !sgpaApplicable
        ? createMetric<number>(
            null,
            "NOT_APPLICABLE",
            noLetterGradesRule?.reason ?? "SGPA is not applicable to this programme.",
            noLetterGradesRule?.sources ?? ordinance?.sources ?? []
          )
        : createMetric<number>(null, "UNAVAILABLE", "Authoritative course credits are not available.")
  );

  // Cumulative CGPA across all completed periods
  const cgpa = programme?.verification === "INFERRED"
    ? createMetric<number>(null, "AMBIGUOUS", "CGPA is not calculated because the programme framework is ambiguous.")
    : !cgpaApplicable
      ? createMetric<number>(
          null,
          "NOT_APPLICABLE",
          "CGPA is not applicable under this academic framework.",
          ordinance?.sources ?? []
        )
      : !hasAllCredits
        ? createMetric<number>(null, "UNAVAILABLE", "Authoritative course credits are not available across all periods.")
        : createMetric(
            calculateWeightedGpa(courses),
            "RESULT_DERIVED",
            "Cumulative GPA derived across all completed periods using Ordinance 11 formula.",
            ordinance?.rules.cgpa?.sources ?? ["GGSIPU Ordinance 11"]
          );

  let percentage: Metric<number | null>;
  if (programme?.verification === "INFERRED") {
    percentage = createMetric(null, "AMBIGUOUS", "Percentage is ambiguous without specific programme scheme evidence.");
  } else if (capabilities && !capabilities.percentage) {
    percentage = createMetric(null, "NOT_APPLICABLE", "Percentage calculation is not applicable under this framework.", ordinance?.sources ?? []);
  } else if (ordinance?.rules.percentageFromCGPA && cgpa.value !== null) {
    percentage = createMetric(
      Math.round(cgpa.value * 10 * 100) / 100,
      "RESULT_DERIVED",
      "Equivalent percentage derived from CGPA × 10 under Ordinance 11.",
      ordinance.rules.percentageFromCGPA.sources
    );
  } else if (percentages.length === courses.length && courses.length > 0 && courses.every((course) => course.maxMarks !== null)) {
    percentage = createMetric(
      Math.round(percentages.reduce((sum, val) => sum + val, 0) / percentages.length * 100) / 100,
      "RESULT_DERIVED",
      "Average percentage from verified course maximum marks.",
      courses.flatMap((course) => course.maxMarks ? (ordinance?.sources ?? []) : [])
    );
  } else {
    percentage = createMetric(null, "UNAVAILABLE", "No verified percentage formula or complete course maximum-mark data is available.");
  }

  let division: Metric<string | null>;
  if (programme?.verification === "INFERRED") {
    division = createMetric(null, "AMBIGUOUS", "Division classification is ambiguous without specific programme scheme evidence.");
  } else if (capabilities && !capabilities.division) {
    division = createMetric(
      null,
      "NOT_APPLICABLE",
      ordinance?.rules.noDivision?.reason ?? "Divisions are not awarded for this programme.",
      ordinance?.rules.noDivision?.sources ?? ordinance?.sources ?? []
    );
  } else if (ordinance?.rules.noDivision) {
    division = createMetric(null, "NOT_APPLICABLE", ordinance.rules.noDivision.reason, ordinance.rules.noDivision.sources);
  } else if (ordinance?.rules.divisionFromCpi) {
    let cpiValue: number | null = null;
    const passedCreditCourses = courses.filter((c) => isCoursePassed(c.semantic) && c.credits.value !== null && c.total !== undefined);
    if (passedCreditCourses.length > 0) {
      const totalC = passedCreditCourses.reduce((sum, c) => sum + (c.credits.value ?? 0), 0);
      const totalCM = passedCreditCourses.reduce((sum, c) => sum + ((c.credits.value ?? 0) * (c.total ?? 0)), 0);
      cpiValue = totalC > 0 ? Math.round((totalCM / totalC) * 100) / 100 : null;
    }
    const evalValue = cpiValue ?? cgpa.value;
    if (evalValue !== null) {
      const band = ordinance.rules.divisionFromCpi.bands.find((b: any) => evalValue >= b.minimumCGPA && (b.maximumCGPA === null || evalValue <= b.maximumCGPA));
      division = createMetric(band?.division ?? null, "RESULT_DERIVED", band?.note, ordinance.rules.divisionFromCpi.sources);
    } else {
      division = createMetric(null, "UNAVAILABLE", "Division classification requires CPI under Ordinance 31.", ordinance.rules.divisionFromCpi.sources);
    }
  } else if (ordinance?.rules.divisionFromPercentage) {
    const pctValue = percentage.value ?? (numericTotals.length > 0 ? Math.round(numericTotals.reduce((sum, val) => sum + val, 0) / numericTotals.length * 100) / 100 : null);
    if (pctValue !== null) {
      const band = ordinance.rules.divisionFromPercentage.bands.find(
        (b: any) => pctValue >= b.minimumPercent && (b.maximumPercent === undefined || b.maximumPercent === null || pctValue <= b.maximumPercent)
      );
      division = createMetric(band?.division ?? null, "RESULT_DERIVED", band?.note, ordinance.rules.divisionFromPercentage.sources);
    } else {
      division = createMetric(null, "UNAVAILABLE", "Division classification requires verified percentage marks.", ordinance.rules.divisionFromPercentage.sources);
    }
  } else if (ordinance?.rules.divisionFromCGPA && cgpa.value !== null) {
    const band = ordinance.rules.divisionFromCGPA.bands.find((b: any) => cgpa.value! >= b.minimumCGPA && (b.maximumCGPA === null || cgpa.value! <= b.maximumCGPA));
    division = createMetric(band?.division ?? null, "RESULT_DERIVED", band?.note, ordinance.rules.divisionFromCGPA.sources);
  } else if (ordinance?.rules.divisionFromCGPA) {
    division = createMetric(null, "VERIFIED", "Exemplary: 10.00 (1st attempt) · First Div: ≥6.50 · Second Div: 5.00–6.49 · Third Div: 4.00–4.99", ordinance.rules.divisionFromCGPA.sources);
  } else {
    division = createMetric(null, "UNAVAILABLE", "Division requires the programme's verified CPI/CGPA rule and its required inputs.");
  }

  const promotion = programme?.verification === "INFERRED"
    ? createMetric<EnginePromotionYear[] | null>(null, "AMBIGUOUS", "Promotion rules cannot be applied because the programme framework is ambiguous.")
    : (capabilities && !capabilities.promotion)
      ? createMetric<EnginePromotionYear[] | null>(null, "NOT_APPLICABLE", "Promotion rules are not applicable under this framework.", ordinance?.sources ?? [])
      : evaluatePromotion(courses, ordinance);
  const frameworkParts: string[] = [];
  if (ordinance?.rules.duration?.text) frameworkParts.push(ordinance.rules.duration.text);
  if (ordinance?.rules.internship?.months && !ordinance.rules.duration?.text?.includes("internship")) {
    frameworkParts.push(`${ordinance.rules.internship.months}-month internship`);
  }

  let framework: Metric<string | null>;
  if (!programme) {
    framework = createMetric<string>(null, "UNAVAILABLE", "No authoritative programme framework could be safely established.");
  } else if (programme.verification === "INFERRED") {
    framework = createMetric<string>(
      frameworkParts.length ? frameworkParts.join(" · ") : null,
      "AMBIGUOUS",
      `Generic programme mapping (${programme.officialProgrammeName} → ${programme.ordinanceCode}) is ambiguous without specific discipline or scheme evidence.`,
      programme.sources
    );
  } else if (frameworkParts.length) {
    framework = createMetric(frameworkParts.join(" · "), "VERIFIED", undefined, [...new Set(frameworkParts.flatMap(() => ordinance?.sources ?? []))]);
  } else {
    framework = createMetric<string>(null, "UNAVAILABLE", "No programme framework summary is loaded.");
  }

  if (programme?.verification === "INFERRED") {
    warnings.push({
      severity: "WARNING",
      message: `Programme "${programme.officialProgrammeName}" is a generic title; statutory framework and grading rules are ambiguous without specific scheme or discipline evidence. Raw ExamWeb marks are preserved.`,
    });
  }

  return {
    programme: {
      programmeCode,
      programmeName,
      programmeFamily: programme?.programmeFamily ?? null,
      examinationSystem: programme?.examinationSystem ?? ordinance?.examinationSystem ?? null,
      instituteCode: toCleanString(studentProfile?.icode),
      instituteName: toCleanString(studentProfile?.iname),
      cohort,
      ordinance: programme?.ordinanceCode ?? null,
      scheme: null,
      known: Boolean(programme),
      isTech: programme?.isTech ?? false,
      dbVerification: programme?.verification ?? null,
      resultDeliverySource: marksheetRows.length > 0 ? "EXAMWEB" as const : "UNKNOWN" as const,
    },
    courses,
    analytics: {
      paperCount: createMetric(courses.length, "RESULT_DERIVED", undefined, marksheetSources),
      numericMarksCount: createMetric(numericTotals.length, "RESULT_DERIVED", undefined, marksheetSources),
      averageMarks: createMetric(average(numericTotals), "RESULT_DERIVED", undefined, marksheetSources),
      averagePercentage: createMetric(
        average(percentages),
        percentages.length > 0 ? "RESULT_DERIVED" : "UNAVAILABLE",
        percentages.length > 0 ? "Normalized using verified course maximum marks." : "Course maximum marks are not available.",
        marksheetSources
      ),
      highestMarks: createMetric(numericTotals.length ? Math.max(...numericTotals) : null, "RESULT_DERIVED", undefined, marksheetSources),
      lowestMarks: createMetric(numericTotals.length ? Math.min(...numericTotals) : null, "RESULT_DERIVED", undefined, marksheetSources),
      passedOrClearedCount: createMetric(passedCourses.length, "RESULT_DERIVED", undefined, marksheetSources),
      notClearedCount: createMetric(courses.length - passedCourses.length, "RESULT_DERIVED", undefined, marksheetSources),
      statusCounts: createMetric(statusCounts, "RESULT_DERIVED", undefined, marksheetSources),
      passRate: createMetric(courses.length ? Math.round((passedCourses.length / courses.length) * 10000) / 100 : null, "RESULT_DERIVED", undefined, marksheetSources),
      distinctionCount: createMetric(distinctionCount, "RESULT_DERIVED", undefined, marksheetSources),
      internalAverage: createMetric(average(internalMarksList), "RESULT_DERIVED", undefined, marksheetSources),
      externalAverage: createMetric(average(externalMarksList), "RESULT_DERIVED", undefined, marksheetSources),
      periodSummaries: createMetric(periodSummaries, "RESULT_DERIVED", undefined, marksheetSources),
      grade: gradeMetric,
      coursePassRule,
      framework,
      sgpaByPeriod,
      sgpa,
      cgpa,
      percentage,
      division,
      promotion,
      warnings,
    },
    warnings,
  };
}

export function analyzeCurrentResult(): EngineResult {
  const storeState = useResultStore.getState();
  return analyzeResult(storeState.result as ExamWebResult | null, storeState.customCredits ?? {});
}
