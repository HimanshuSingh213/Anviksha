import type { ExaminationSystem, SupportState } from "../academic-db";

export type StatusSemantic =
  | "PASS"
  | "NOT_CLEARED"
  | "ABSENT"
  | "DETAINED"
  | "CANCELLED"
  | "RESULT_LATER"
  | "CREDIT_SECURED"
  | "ALREADY_PASSED"
  | "UNKNOWN";

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

export interface SubjectResult {
  semester: number | string;
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

export type ResultState = "CLEARED" | "BACK" | "ABSENT" | "DETAINED" | "UNKNOWN";

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

export interface AcademicPromotionStatus {
  years: AcademicYearStatus[];
  hasDetentionRisk: boolean;
  activeYear: number;
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

export interface DivisionClassification {
  division: string;
  divisionCode: "EXEMPLARY" | "FIRST" | "SECOND" | "THIRD" | "UNQUALIFIED";
  minCgpa: number;
  nextTierMessage: string;
  progressPercent: number;
  isPass: boolean;
  exemplaryStatus?: "ELIGIBLE" | "INELIGIBLE" | "UNDETERMINED";
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

export interface AnalyzeOptions {
  allowFallbackCredits?: boolean;
  customCredits?: Record<string, number | null>;
}

export interface EngineResult {
  student: {
    name: string;
    rollNumber: string;
  };
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
  subjectResults: SubjectResult[];
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
    semesterSummaries: Metric<Array<{
      semester: number | string;
      paperCount: number;
      numericMarksCount: number;
      averageMarks: number | null;
      averagePercentage: number | null;
      highestMarks: number | null;
      lowestMarks: number | null;
    }>>;
    grade: Metric<boolean | null>;
    subjectPassRule: Metric<string | null>;
    framework: Metric<string | null>;
    sgpaBySemester: Array<{ semester: number | string; sgpa: Metric<number | null> }>;
    sgpa: Metric<number | null>;
    cgpa: Metric<number | null>;
    percentage: Metric<number | null>;
    division: Metric<string | null>;
    promotion: Metric<EnginePromotionYear[] | null>;
    academicPromotion?: AcademicPromotionStatus;
    reappearPlan?: ReappearSessionPlan;
    warnings: MetricWarning[];
  };
  warnings: MetricWarning[];
}
