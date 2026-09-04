import {
  ACADEMIC_DB,
  findOrdinance,
  findProgramme,
  getSubjectMaxMarks,
  verificationAsStatus,
  type ExaminationSystem,
  type GradeBand,
  type OrdinanceEntry,
  type ProgrammeEntry,
  type SupportState,
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

export interface EngineCourse {
  period: number | string;
  rawCode: string;
  name: string;
  internal?: number;
  external?: number;
  total?: number;
  rawTotal: string;
  examMonthYear: string;
  declaredDate: string;
  maxMarks: number | null;
  marksPercent: number | null;
  semantic: StatusSemantic;
  credits: {
    value: number | null;
    source: "USER" | "ESTIMATED" | "UNAVAILABLE";
  };
  grade: { value: string; point: number } | null;
  gradePointUsedForGpa: number | null;
  ruleCheck: "PASS" | "FAIL" | "UNTESTABLE";
}

export interface EnginePromotionYear {
  yearNumber: number;
  yearLabel: string;
  totalCredits: number;
  earnedCredits: number;
  requiredCredits: number;
  standing: "PROMOTED" | "NOT_PROMOTED";
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
    known: boolean;
    isTech: boolean;
    dbVerification: SupportState | null;
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
  const uniqueSources = Array.from(new Set(sources.filter(Boolean)));
  return { value, status, reason, sources: uniqueSources };
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
  let gradedCourseCount = 0;
  for (const course of courses) {
    if (course.credits.value === null || course.credits.value === undefined || course.credits.value <= 0) continue;
    if (course.gradePointUsedForGpa === null) continue;
    totalWeightedPoints += course.credits.value * course.gradePointUsedForGpa;
    totalCredits += course.credits.value;
    gradedCourseCount += 1;
  }
  if (gradedCourseCount === 0) return null;
  return Math.round((totalWeightedPoints / totalCredits) * 100) / 100;
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

  const hasAnyCredits = courses.some((c) => c.credits.value !== null && c.credits.value > 0);
  if (!hasAnyCredits) {
    return createMetric<EnginePromotionYear[] | null>(null, "UNAVAILABLE", "Promotion requires authoritative course credits.");
  }

  const academicYearsMap = new Map<number, { totalCredits: number; earnedCredits: number; hasOdd: boolean; hasEven: boolean }>();
  for (const course of courses) {
    if (course.credits.value === null || course.credits.value <= 0) continue;
    const period = Number(course.period);
    const yearNumber = Math.ceil(period / 2);
    if (!Number.isFinite(yearNumber) || yearNumber < 1) continue;

    const currentYearStats = academicYearsMap.get(yearNumber) ?? { totalCredits: 0, earnedCredits: 0, hasOdd: false, hasEven: false };
    currentYearStats.totalCredits += course.credits.value;
    if (isCoursePassed(course.semantic)) currentYearStats.earnedCredits += course.credits.value;
    if (period % 2 === 1) currentYearStats.hasOdd = true;
    if (period % 2 === 0) currentYearStats.hasEven = true;
    academicYearsMap.set(yearNumber, currentYearStats);
  }

  const sortedYears = [...academicYearsMap.entries()].sort(([a], [b]) => a - b);
  let hasIncompleteYear = false;

  const promotionYears = sortedYears.map(([yearNumber, creditStats]) => {
    const isYearComplete = creditStats.hasOdd && creditStats.hasEven;
    if (!isYearComplete) hasIncompleteYear = true;

    const requiredCredits = Math.ceil(creditStats.totalCredits * creditShareRule.minimumEarnedCreditShare);
    const meetsEnsuingYear = creditStats.earnedCredits >= requiredCredits;
    const standing = (isYearComplete && meetsEnsuingYear) ? ("PROMOTED" as const) : ("NOT_PROMOTED" as const);

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

  const status: SupportState = hasIncompleteYear ? "WARNING" : "RESULT_DERIVED";
  const explanation = hasIncompleteYear
    ? "Evaluated with warning: the transcript does not contain both semesters of every academic year, so the annual 50% credit baseline cannot be fully confirmed."
    : `Derived under the applicable ordinance baseline: minimum ${Math.round(creditShareRule.minimumEarnedCreditShare * 100)}% of the academic year's credits must be earned. Additional programme-scheme promotion conditions may apply and are not verified.`;

  return createMetric(promotionYears, status, explanation, creditShareRule.sources);
}

export interface AnalyzeOptions {
  allowFallbackCredits?: boolean;
}

function buildCourses(
  marksheetRows: unknown[][],
  ordinance: OrdinanceEntry | null,
  programme: ProgrammeEntry | null,
  userCredits: Record<string, number | null>,
  allowFallbackCredits: boolean = true
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
    const semantic = decodeStatus(rawStatusCode, rawTotal);

    const maxMarks = getSubjectMaxMarks(name, programme?.programmeFamily);
    const isAmbiguous = programme?.verification === "INFERRED" || !programme;
    const ruleCheck = !isAmbiguous && coursePassRule && numericTotal !== undefined && maxMarks
      ? (numericTotal / maxMarks * 100 >= coursePassRule.minimumTotalPercent ? "PASS" as const : "FAIL" as const)
      : "UNTESTABLE" as const;
    const marksPercent = numericTotal !== undefined && maxMarks ? Math.round((numericTotal / maxMarks) * 10000) / 100 : null;

    const hasExplicitCredit = rawCode in userCredits || (typeof rawCode === "string" && rawCode.toUpperCase() in userCredits);
    const userCredit = userCredits[rawCode] !== undefined ? userCredits[rawCode] : (typeof rawCode === "string" ? userCredits[rawCode.toUpperCase()] : undefined);
    const gradeRuleApplies = Boolean(programme && gradeRule && ordinance?.capabilities?.grade !== false && programme.verification === "VERIFIED");
    const calculatedGrade = gradeRuleApplies && numericTotal !== undefined && numericTotal <= 100 ? getGradeFromMarks(numericTotal, gradeRule!.bands) : null;

    let grade: EngineCourse["grade"] = null;
    if (gradeRuleApplies && calculatedGrade) {
      grade = {
        value: isCoursePassed(semantic) ? calculatedGrade.value : "F",
        point: isCoursePassed(semantic) ? calculatedGrade.point : 0,
      };
    } else if (ordinance?.rules.noLetterGrades && numericTotal !== undefined && isCoursePassed(semantic) && ordinance.rules.courseDistinction && maxMarks) {
      const percentageScore = (numericTotal / maxMarks) * 100;
      if (percentageScore > ordinance.rules.courseDistinction.minimumPercentExclusive) {
        grade = { value: ordinance.rules.courseDistinction.label, point: 0 };
      }
    }

    const gradePointUsedForGpa = gradeRuleApplies
      ? (calculatedGrade ? calculatedGrade.point : null)
      : null;

    const defaultCredit = getDefaultCredit(name);
    const usesCredits = ordinance?.capabilities?.credits !== false;

    let credits: EngineCourse["credits"];
    if (hasExplicitCredit && userCredit === null) {
      // User explicitly cleared this credit — exclude it from calculations.
      credits = { value: null, source: "USER" };
    } else if (hasExplicitCredit && typeof userCredit === "number" && Number.isFinite(userCredit)) {
      credits = { value: Math.max(0, userCredit), source: "USER" };
    } else if (allowFallbackCredits && usesCredits) {
      credits = { value: defaultCredit, source: "ESTIMATED" };
    } else {
      credits = { value: null, source: "UNAVAILABLE" };
    }

    return {
      period: periodNumber as number | string,
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
  });
}

export function analyzeResult(
  rawResult: ExamWebResult | null | undefined,
  userEditedCredits: Record<string, number | null> = {},
  options: AnalyzeOptions = { allowFallbackCredits: true }
): EngineResult {
  const allowFallbackCredits = options?.allowFallbackCredits !== false;
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

  const courses = buildCourses(marksheetRows, ordinance, programme, userEditedCredits, allowFallbackCredits);
  for (const course of courses) {
    if (course.ruleCheck === "FAIL" && isCoursePassed(course.semantic)) {
      warnings.push({
        severity: "WARNING",
        message: `${course.rawCode} is marked cleared by ExamWeb, but its displayed total is below the verified programme pass threshold. The raw ExamWeb status is preserved; verify the official marksheet.`,
      });
    }
    if (course.ruleCheck === "PASS" && !isCoursePassed(course.semantic)) {
      warnings.push({
        severity: "WARNING",
        message: `${course.rawCode} meets the course pass threshold but ExamWeb reports it as not cleared.`,
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

  const hasAnyCredits = courses.length > 0 && courses.some((course) => course.credits.value !== null && course.credits.value > 0);
  const sgpaApplicable = capabilities ? capabilities.sgpa : Boolean(generalGradeRule?.bands && ordinance?.rules.sgpa);
  const cgpaApplicable = capabilities ? capabilities.cgpa : Boolean(generalGradeRule?.bands && ordinance?.rules.cgpa);

  const usesEstimatedCredits = courses.some((course) => course.credits.source === "ESTIMATED");
  const usesUserCredits = courses.some((course) => course.credits.source === "USER");
  const gpaStatus: SupportState =
    (usesEstimatedCredits || usesUserCredits) ? "WARNING" : "RESULT_DERIVED";
  const gpaReason = usesUserCredits && !usesEstimatedCredits
    ? "Calculated with user-provided credits. Official scheme credits would change this number."
    : "Calculated with estimated credits (theory 3 / practical 1 heuristic). Official scheme credits are not available on the marksheet.";

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
    const periodHasCredits = periodCourses.some((course) => course.credits.value !== null && course.credits.value > 0);
    if (!periodHasCredits) {
      return {
        period,
        sgpa: createMetric<number>(null, "UNAVAILABLE", "Authoritative course credits are not available."),
      };
    }
    const periodGpa = calculateWeightedGpa(periodCourses);
    if (periodGpa === null) {
      // Credits exist but no verified grade-point rule produced any points.
      return {
        period,
        sgpa: createMetric<number>(null, "UNAVAILABLE", "No verified grade-point formula is loaded for this programme."),
      };
    }
    return {
      period,
      sgpa: createMetric(
        periodGpa,
        gpaStatus,
        gpaReason,
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
      : !hasAnyCredits
        ? createMetric<number>(null, "UNAVAILABLE", "Authoritative course credits are not available across all periods.")
        : (() => {
            const cgpaValue = calculateWeightedGpa(courses);
            if (cgpaValue === null) {
              return createMetric<number>(null, "UNAVAILABLE", "No verified grade-point formula is loaded for this programme.");
            }
            return createMetric(cgpaValue, gpaStatus, gpaReason, ordinance?.rules.cgpa?.sources ?? ["GGSIPU Ordinance 11"]);
          })();

  let percentage: Metric<number | null>;
  if (programme?.verification === "INFERRED") {
    percentage = createMetric(null, "AMBIGUOUS", "Percentage is ambiguous without specific programme scheme evidence.");
  } else if (capabilities && !capabilities.percentage) {
    percentage = createMetric(null, "NOT_APPLICABLE", "Percentage calculation is not applicable under this framework.", ordinance?.sources ?? []);
  } else if (ordinance?.rules.percentageFromCGPA && cgpa.value !== null) {
    percentage = createMetric(
      Math.round(cgpa.value * 10 * 100) / 100,
      gpaStatus,
      gpaReason,
      ordinance.rules.percentageFromCGPA.sources
    );
  } else if (percentages.length === courses.length && courses.length > 0 && courses.every((course) => course.maxMarks !== null)) {
    percentage = createMetric(
      Math.round(percentages.reduce((sum, val) => sum + val, 0) / percentages.length * 100) / 100,
      "RESULT_DERIVED",
      "Average percentage from verified course maximum marks.",
      ordinance?.sources ?? []
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
    division = createMetric(band?.division ?? null, gpaStatus, band?.note ?? gpaReason, ordinance.rules.divisionFromCGPA.sources);
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
      known: Boolean(programme),
      isTech: programme?.isTech ?? false,
      dbVerification: verificationAsStatus(programme?.verification ?? null),
    },
    courses,    analytics: {
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

// ==========================================
// Academic Calculation Helpers & Rule Engine
// ==========================================

export type ResultState = "CLEARED" | "BACK" | "ABSENT" | "DETAINED" | "UNKNOWN";

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

export function getDefaultCredit(subjectTitle: string): number {
  const title = (subjectTitle || "").toUpperCase();
  if (title.includes("LAB") || title.includes("PRACTICAL") || title.includes("STUDIO")) return 1;
  if (title.includes("PROJECT") || title.includes("VIVA") || title.includes("DISSERTATION")) return 2;
  return 3;
}

export const getFallbackCredit = getDefaultCredit;

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

export function getGradeThemeClasses(grade: string): string {
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

export interface DivisionClassification {
  division: string;
  divisionCode: "EXEMPLARY" | "FIRST" | "SECOND" | "THIRD" | "UNQUALIFIED";
  minCgpa: number;
  nextTierMessage: string;
  progressPercent: number;
  isPass: boolean;
  exemplaryStatus?: "ELIGIBLE" | "INELIGIBLE" | "UNDETERMINED";
}

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
  priorYearsTotalCredits: number;
  priorYearsEarnedCredits: number;
  priorYearsRequiredCredits: number;
  priorYearsDeficit: number;
  meetsCurrentYearRule: boolean;
  meetsPriorYearsRule: boolean;
}

export function getAcademicPromotionStatus(
  allResults: any[][],
  customCredit: Record<string, number | null> = {}
): {
  years: AcademicYearStatus[];
  hasDetentionRisk: boolean;
  activeYear: number;
} {
  // Find the highest semester number present in the results
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

  let cumulativePriorTotal = 0;
  let cumulativePriorEarned = 0;

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

    const priorYearsTotalCredits = cumulativePriorTotal;
    const priorYearsEarnedCredits = cumulativePriorEarned;
    const priorYearsRequiredCredits = Math.ceil(priorYearsTotalCredits * 0.9);
    const priorYearsDeficit = Math.max(0, priorYearsRequiredCredits - priorYearsEarnedCredits);
    const meetsPriorYearsRule = priorYearsTotalCredits === 0 || priorYearsEarnedCredits >= priorYearsRequiredCredits;

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
        priorYearsTotalCredits,
        priorYearsEarnedCredits,
        priorYearsRequiredCredits,
        priorYearsDeficit,
        meetsCurrentYearRule: true,
        meetsPriorYearsRule,
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

      // Check if user set custom credits
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
      const isPassed = semantic === "PASS" || semantic === "CREDIT_SECURED" || semantic === "ALREADY_PASSED";

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
      if (meetsCurrentYearRule && meetsPriorYearsRule) {
        status = "PROMOTED";
      } else {
        status = "YEAR_BACK_RISK";
        hasDetentionRisk = true;
      }
      cumulativePriorTotal += totalCredits;
      cumulativePriorEarned += earnedCredits;
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
      priorYearsTotalCredits,
      priorYearsEarnedCredits,
      priorYearsRequiredCredits,
      priorYearsDeficit,
      meetsCurrentYearRule,
      meetsPriorYearsRule,
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
  resultState: StatusSemantic | string;
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
  customCredits: Record<string, number | null> = {}
): ReappearSessionPlan {
  const oddTermBacklogs: ReappearSubject[] = [];
  const evenTermBacklogs: ReappearSubject[] = [];
  let totalCreditsAtRisk = 0;

  let maxSemEvaluated = 0;
  allResults.forEach((row) => {
    const semNum = Number(row[0]);
    if (!isNaN(semNum) && semNum >= 1 && semNum > maxSemEvaluated) {
      maxSemEvaluated = semNum;
    }
  });

  allResults.forEach((row) => {
    const semNum = Number(row[0]);
    if (isNaN(semNum) || semNum < 1) return;

    const rawTotal = row[5];
    const statusCode = row[6];
    const paperCode = String(row[1] ?? "");
    const subjectTitle = String(row[2] ?? "");
    const hasCustom = paperCode in customCredits || paperCode.toUpperCase() in customCredits;
    const customVal = customCredits[paperCode] !== undefined ? customCredits[paperCode] : customCredits[paperCode.toUpperCase()];
    const credit = hasCustom ? (customVal ?? 0) : getDefaultCredit(subjectTitle);

    const semantic = decodeStatus(statusCode, rawTotal);
    const isPassed = semantic === "PASS" || semantic === "CREDIT_SECURED" || semantic === "ALREADY_PASSED";

    if (!isPassed) {
      const isOddSem = semNum % 2 !== 0;
      totalCreditsAtRisk += credit;

      let priority: "HIGH" | "MEDIUM" | "STANDARD" = "STANDARD";
      let priorityReason = "Standard re-appear timeline";

      if (semantic === "DETAINED") {
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
        resultState: semantic,
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

export function getEffectiveCredits(
  fullResult: ExamWebResult | null | undefined,
  customCredits: Record<string, number | null> = {}
): Record<string, number> {
  const result: Record<string, number> = {};
  const rows = fullResult?.stresult ?? [];
  for (const row of rows) {
    const code = String(row[1] ?? "").trim();
    const name = String(row[2] ?? "").trim();
    if (!code) continue;
    const hasCustom = code in customCredits || code.toUpperCase() in customCredits;
    const customVal = customCredits[code] !== undefined ? customCredits[code] : customCredits[code.toUpperCase()];
    if (hasCustom) {
      if (customVal !== null && customVal !== undefined && customVal > 0) {
        result[code] = customVal;
      }
    } else {
      result[code] = getDefaultCredit(name);
    }
  }
  return result;
}

