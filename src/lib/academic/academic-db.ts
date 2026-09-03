export type GradeBand = {
  minimumMarks: number;
  maximumMarks: number;
  grade: string;
  gradePoint: number;
};

export type Verification = "UNKNOWN" | "INFERRED" | "VERIFIED" | "VERIFIED_2";
export type SupportState =
  | "VERIFIED"
  | "RESULT_DERIVED"
  | "WARNING"
  | "UNAVAILABLE"
  | "AMBIGUOUS"
  | "NOT_APPLICABLE";
export type ExaminationSystem = "ANNUAL" | "SEMESTER" | "TRIMESTER";

export interface FrameworkCapabilities {
  marks: boolean;
  courseStatus: boolean;
  grade: boolean;
  gradePoint: boolean;
  credits: boolean;
  sgpa: boolean;
  cgpa: boolean;
  division: boolean;
  promotion: boolean;
  percentage: boolean;
}

export interface OrdinanceDefinition {
  ordinanceCode: string;
  ordinanceName: string;
  examinationSystem: ExaminationSystem;
  verification: Verification;
  sources: string[];
  capabilities: FrameworkCapabilities;
  rules: {
    standardMaxMarks?: number;
    gradeFromTotalMarks?: {
      ruleName: string;
      passingGrade: string;
      bands: GradeBand[];
      sources: string[];
    };
    coursePassByTotalMarks?: {
      ruleName: string;
      minimumTotalPercent: number;
      sources: string[];
    };
    componentPass?: {
      ruleName: string;
      minimumAggregatePercent: number;
      minimumTheoryPercent: number;
      minimumPracticalPercent: number;
      sources: string[];
    };
    sgpa?: {
      ruleName: string;
      formula: string;
      sources: string[];
    };
    cgpa?: {
      ruleName: string;
      formula: string;
      sources: string[];
    };
    percentageFromCGPA?: {
      ruleName: string;
      formula: string;
      sources: string[];
    };
    divisionFromCGPA?: {
      ruleName: string;
      bands: Array<{ minimumCGPA: number; maximumCGPA: number | null; division: string; note?: string }>;
      sources: string[];
    };
    divisionFromCpi?: {
      ruleName: string;
      bands: Array<{ minimumCGPA: number; maximumCGPA: number | null; division: string; note?: string }>;
      sources: string[];
    };
    divisionFromPercentage?: {
      ruleName: string;
      bands: Array<{ minimumPercent: number; division: string; note?: string }>;
      sources: string[];
    };
    promotionByAcademicYearCredits?: {
      ruleName: string;
      minimumEarnedCreditShare: number;
      sources: string[];
    };
    promotionByAllCourses?: {
      ruleName: string;
      sources: string[];
    };
    duration?: {
      text: string;
      sources: string[];
    };
    internship?: {
      months: number;
      sources: string[];
    };
    noLetterGrades?: {
      reason: string;
      sources: string[];
    };
    noDivision?: {
      reason: string;
      sources: string[];
    };
    courseDistinction?: {
      minimumPercentExclusive: number;
      label: string;
      sources: string[];
    };
    cpi?: {
      ruleName: string;
      formula: string;
      onlyPassedCreditCourses: boolean;
      minimumCourseMarksPercent: number;
      sources: string[];
    };
    [key: string]: unknown;
  };
}

export type OrdinanceEntry = OrdinanceDefinition;

export interface ProgrammeEntry {
  officialProgrammeName: string;
  programmeFamily: string;
  examinationSystem: ExaminationSystem;
  ordinanceCode: string;
  ordinance: OrdinanceDefinition | null;
  isTech: boolean;
  verification: Verification;
  sources: string[];
  examWebProgrammeCode?: string;
}

export const PROGRAMME_FAMILIES = [
  { family: "MTECH", ordinance: "ORD_11", system: "SEMESTER" as const, isTech: true,  keywords: ["master of technology", "m.tech", "mtech"] },
  { family: "BTECH", ordinance: "ORD_11", system: "SEMESTER" as const, isTech: true,  keywords: ["bachelor of technology", "b.tech", "btech", "027"] },
  { family: "MCA",   ordinance: "ORD_11", system: "SEMESTER" as const, isTech: true,  keywords: ["master of computer applications", "mca", "045"] },
  { family: "BCA",   ordinance: "ORD_11", system: "SEMESTER" as const, isTech: true,  keywords: ["bachelor of computer applications", "bca", "020"] },
  { family: "MBA",   ordinance: "ORD_11", system: "SEMESTER" as const, isTech: false, keywords: ["master of business administration", "mba", "039"] },
  { family: "BBA",   ordinance: "ORD_11", system: "SEMESTER" as const, isTech: false, keywords: ["bachelor of business administration", "bba", "017"] },
  { family: "BCOM",  ordinance: "ORD_11", system: "SEMESTER" as const, isTech: false, keywords: ["bachelor of commerce", "b.com", "bcom", "888"] },
  { family: "LAW",   ordinance: "ORD_11", system: "SEMESTER" as const, isTech: false, keywords: ["bachelor of law", "bachelor of laws", "master of law", "master of laws", "b.a.ll.b", "b.a. ll.b", "ba llb", "ballb", "b.b.a.ll.b", "b.b.a. ll.b", "bba llb", "bballb", "ll.b", "llb", "ll.m", "llm", "law", "038", "035", "037", "040"] },
  { family: "BA",    ordinance: "ORD_11", system: "SEMESTER" as const, isTech: false, keywords: ["bachelor of arts", "bjmc", "b.a. (", "ba (", "b.a. jmc", "bajmc", "ba", "024"] },
  { family: "MBBS",  ordinance: "ORD_15", system: "ANNUAL" as const,   isTech: false, keywords: ["bachelor of medicine and bachelor of surgery", "bachelor of medicine", "mbbs", "001"] },
  { family: "BPT",   ordinance: "ORD_31", system: "ANNUAL" as const,   isTech: false, keywords: ["bachelor of physiotherapy", "physiotherapy", "bpt", "bot", "025"] },
  { family: "BHMS",  ordinance: "ORD_22", system: "ANNUAL" as const,   isTech: false, keywords: ["bachelor of homeopathic medicine", "homeopathic", "bhms", "053"] },
  { family: "BASLP", ordinance: "ORD_24", system: "SEMESTER" as const, isTech: false, keywords: ["bachelor of audiology and speech language pathology", "speech language", "baslp", "090"] },
  { family: "BAMS",  ordinance: "ORD_38", system: "ANNUAL" as const,   isTech: false, keywords: ["bachelor of ayurvedic medicine", "ayurvedic", "bams", "054"] },
];

export const ORD_11_GRADE_BANDS: GradeBand[] = [
  { minimumMarks: 90, maximumMarks: 100, grade: "O",  gradePoint: 10 },
  { minimumMarks: 75, maximumMarks: 89,  grade: "A+", gradePoint: 9 },
  { minimumMarks: 65, maximumMarks: 74,  grade: "A",  gradePoint: 8 },
  { minimumMarks: 55, maximumMarks: 64,  grade: "B+", gradePoint: 7 },
  { minimumMarks: 50, maximumMarks: 54,  grade: "B",  gradePoint: 6 },
  { minimumMarks: 45, maximumMarks: 49,  grade: "C",  gradePoint: 5 },
  { minimumMarks: 40, maximumMarks: 44,  grade: "P",  gradePoint: 4 },
  { minimumMarks: 0,  maximumMarks: 39,  grade: "F",  gradePoint: 0 },
];

export const ORD_11_DIVISION_BANDS = [
  { minimumCGPA: 10.0, maximumCGPA: null, division: "Exemplary Performance", note: "Requires passing on first attempt with 10.00 CGPA." },
  { minimumCGPA: 6.5, maximumCGPA: 9.99, division: "First Division" },
  { minimumCGPA: 5.0, maximumCGPA: 6.49, division: "Second Division" },
  { minimumCGPA: 4.0, maximumCGPA: 4.99, division: "Third Division" },
];

export const ORDINANCES: Record<string, OrdinanceDefinition> = {
  ORD_10: {
    ordinanceCode: "ORD_10",
    ordinanceName: "Conduct and Evaluation of Examinations for Programmes leading to all Bachelor's Degrees following the Annual System of Examination",
    examinationSystem: "ANNUAL",
    verification: "VERIFIED",
    sources: ["GGSIPU Ordinance 10"],
    capabilities: {
      marks: true,
      courseStatus: true,
      grade: false,
      gradePoint: false,
      credits: false,
      sgpa: false,
      cgpa: false,
      division: true,
      promotion: true,
      percentage: true,
    },
    rules: {
      coursePassByTotalMarks: {
        ruleName: "Minimum 40% Aggregate Marks",
        minimumTotalPercent: 40,
        sources: ["GGSIPU Ordinance 10"],
      },
      divisionFromPercentage: {
        ruleName: "Annual Division Classification",
        bands: [
          { minimumPercent: 75, division: "First Division with Distinction" },
          { minimumPercent: 60, division: "First Division" },
          { minimumPercent: 50, division: "Second Division" },
          { minimumPercent: 40, division: "Pass Division" },
        ],
        sources: ["GGSIPU Ordinance 10"],
      },
      noLetterGrades: {
        reason: "Ordinance 10 uses numerical percentage and division marks rather than a 10-point letter grade scale.",
        sources: ["GGSIPU Ordinance 10"],
      },
      duration: {
        text: "Annual examination framework under Ordinance 10",
        sources: ["GGSIPU Ordinance 10"],
      },
    },
  },
  ORD_11: {
    ordinanceCode: "ORD_11",
    ordinanceName: "Conduct and Evaluation of Examinations for Programmes leading to all Bachelor's / Master's Degrees and Under-Graduate/Post-Graduate Diplomas following the Semester System",
    examinationSystem: "SEMESTER",
    verification: "VERIFIED_2",
    sources: ["GGSIPU Ordinance 11"],
    capabilities: {
      marks: true,
      courseStatus: true,
      grade: true,
      gradePoint: true,
      credits: true,
      sgpa: true,
      cgpa: true,
      division: true,
      promotion: true,
      percentage: true,
    },
    rules: {
      gradeFromTotalMarks: {
        ruleName: "10-Point Letter Grade Scale",
        passingGrade: "P",
        bands: ORD_11_GRADE_BANDS,
        sources: ["GGSIPU Ordinance 11, Clause 11.2"],
      },
      coursePassByTotalMarks: {
        ruleName: "Minimum 40% Marks",
        minimumTotalPercent: 40,
        sources: ["GGSIPU Ordinance 11, Clause 11.1"],
      },
      sgpa: {
        ruleName: "Weighted SGPA",
        formula: "Σ(Ci × Gi) / ΣCi",
        sources: ["GGSIPU Ordinance 11, Clause 11.4"],
      },
      cgpa: {
        ruleName: "Cumulative CGPA",
        formula: "Σ(Cni × Gi) / ΣCni",
        sources: ["GGSIPU Ordinance 11, Clause 11.5"],
      },
      percentageFromCGPA: {
        ruleName: "Equivalent Percentage",
        formula: "CGPA × 10",
        sources: ["GGSIPU Ordinance 11, Clause 11.6"],
      },
      divisionFromCGPA: {
        ruleName: "Division Classification",
        bands: ORD_11_DIVISION_BANDS,
        sources: ["GGSIPU Ordinance 11, Clause 13.1"],
      },
      promotionByAcademicYearCredits: {
        ruleName: "Minimum 50% Annual Credits",
        minimumEarnedCreditShare: 0.5,
        sources: ["GGSIPU Ordinance 11, Clause 12"],
      },
      duration: {
        text: "Choice Based Credit System (CBCS) semester framework",
        sources: ["GGSIPU Ordinance 11, Clause 3"],
      },
    },
  },
  ORD_15: {
    ordinanceCode: "ORD_15",
    ordinanceName: "Conduct and Evaluation of Examinations for the programme leading to M.B.B.S. (Bachelor of Medicine & Bachelor of Surgery)",
    examinationSystem: "ANNUAL",
    verification: "VERIFIED",
    sources: ["GGSIPU Ordinance 15"],
    capabilities: {
      marks: true,
      courseStatus: true,
      grade: false,
      gradePoint: false,
      credits: false,
      sgpa: false,
      cgpa: false,
      division: false,
      promotion: true,
      percentage: true,
    },
    rules: {
      componentPass: {
        ruleName: "50% Theory & 50% Practical Passing Rule",
        minimumAggregatePercent: 50,
        minimumTheoryPercent: 50,
        minimumPracticalPercent: 50,
        sources: ["GGSIPU Ordinance 15"],
      },
      duration: {
        text: "4½ years professional study followed by 1 year internship",
        sources: ["GGSIPU Ordinance 15"],
      },
      internship: {
        months: 12,
        sources: ["GGSIPU Ordinance 15"],
      },
      noLetterGrades: {
        reason: "MBBS uses percentage marks rather than a 10-point letter grade table.",
        sources: ["GGSIPU Ordinance 15"],
      },
      noDivision: {
        reason: "There are no divisions for the MBBS programme.",
        sources: ["GGSIPU Ordinance 15"],
      },
      courseDistinction: {
        minimumPercentExclusive: 75,
        label: "Distinction",
        sources: ["GGSIPU Ordinance 15"],
      },
      subjectMaxMarks: {
        "HUMAN ANATOMY": 200,
        "HUMAN PHYSIOLOGY": 200,
        "BIOCHEMISTRY": 200,
        "PATHOLOGY": 200,
        "MICROBIOLOGY": 200,
        "PHARMACOLOGY": 200,
        "FORENSIC MEDICINE": 100,
        "OPHTHALMOLOGY": 200,
        "OTO-RHINO-LARYNGOLOGY": 100,
        "COMMUNITY MEDICINE": 200,
      },
    },
  },
  ORD_16: {
    ordinanceCode: "ORD_16",
    ordinanceName: "Conduct and Evaluation of Examinations for programmes leading to Post Graduate Diplomas, Post Graduate Degrees (MD/MS) and Post Doctoral Degrees (DM/MCh)",
    examinationSystem: "ANNUAL",
    verification: "VERIFIED",
    sources: ["GGSIPU Ordinance 16"],
    capabilities: {
      marks: true,
      courseStatus: true,
      grade: false,
      gradePoint: false,
      credits: false,
      sgpa: false,
      cgpa: false,
      division: false,
      promotion: true,
      percentage: true,
    },
    rules: {
      duration: {
        text: "3-year postgraduate medical degree framework",
        sources: ["GGSIPU Ordinance 16"],
      },
      noLetterGrades: {
        reason: "Medical PG programmes use percentage evaluation rather than CBCS letter grades.",
        sources: ["GGSIPU Ordinance 16"],
      },
      noDivision: {
        reason: "Postgraduate medical degree programmes (MD/MS/DM/MCh) award pass/fail status without division classification under Ordinance 16 Clauses 23 & 24.",
        sources: ["GGSIPU Ordinance 16, Clauses 23 & 24"],
      },
    },
  },
  ORD_22: {
    ordinanceCode: "ORD_22",
    ordinanceName: "Conduct and Evaluation of Examinations for the programme leading to B.H.M.S. (Bachelor of Homoeopathic Medicine and Surgery)",
    examinationSystem: "ANNUAL",
    verification: "VERIFIED",
    sources: ["GGSIPU Ordinance 22"],
    capabilities: {
      marks: true,
      courseStatus: true,
      grade: false,
      gradePoint: false,
      credits: false,
      sgpa: false,
      cgpa: false,
      division: false,
      promotion: true,
      percentage: true,
    },
    rules: {
      duration: {
        text: "5½ years including 1 year internship",
        sources: ["GGSIPU Ordinance 22"],
      },
      internship: {
        months: 12,
        sources: ["GGSIPU Ordinance 22"],
      },
      noLetterGrades: {
        reason: "BHMS uses percentage marks rather than a 10-point letter grade table.",
        sources: ["GGSIPU Ordinance 22"],
      },
      noDivision: {
        reason: "Ordinance 22 evaluates BHMS on a percentage pass/fail basis with subject distinction (≥75%), without overall division classification.",
        sources: ["GGSIPU Ordinance 22"],
      },
    },
  },
  ORD_24: {
    ordinanceCode: "ORD_24",
    ordinanceName: "Conduct and Evaluation of Examinations for the programme leading to B.A.S.L.P. (Bachelor of Audiology and Speech-Language Pathology)",
    examinationSystem: "SEMESTER",
    verification: "VERIFIED",
    sources: ["GGSIPU Ordinance 24"],
    capabilities: {
      marks: true,
      courseStatus: true,
      grade: true,
      gradePoint: true,
      credits: true,
      sgpa: true,
      cgpa: true,
      division: true,
      promotion: true,
      percentage: true,
    },
    rules: {
      standardMaxMarks: 100,
      duration: {
        text: "4-year professional degree framework (including internship)",
        sources: ["GGSIPU Ordinance 24"],
      },
      divisionFromPercentage: {
        ruleName: "Division Classification under Ordinance 24",
        bands: [
          { minimumPercent: 90, division: "Exemplary Performance", note: "Cumulative percentage ≥ 90 in first attempt" },
          { minimumPercent: 75, division: "First Division with Distinction", note: "CPI / Cumulative percentage ≥ 75 in first attempt" },
          { minimumPercent: 60, division: "First Division" },
          { minimumPercent: 50, division: "Second Division" },
        ],
        sources: ["GGSIPU Ordinance 24, Clause 13 / Gazette Notification 10.03.2005"],
      },
    },
  },
  ORD_25: {
    ordinanceCode: "ORD_25",
    ordinanceName: "Conduct and Evaluation of Examinations for Programmes leading to all Bachelor's / Master's Degrees and Under-Graduate/Post-Graduate Diplomas following the Weekend Semester System",
    examinationSystem: "SEMESTER",
    verification: "VERIFIED",
    sources: ["GGSIPU Ordinance 25"],
    capabilities: {
      marks: true,
      courseStatus: true,
      grade: true,
      gradePoint: true,
      credits: true,
      sgpa: true,
      cgpa: true,
      division: true,
      promotion: true,
      percentage: true,
    },
    rules: {
      duration: {
        text: "Weekend semester framework",
        sources: ["GGSIPU Ordinance 25"],
      },
    },
  },
  ORD_31: {
    ordinanceCode: "ORD_31",
    ordinanceName: "Conduct and Evaluation of Examinations for programmes leading to Bachelor of Physiotherapy (BPT) and Bachelor of Occupational Therapy (BOT)",
    examinationSystem: "ANNUAL",
    verification: "VERIFIED",
    sources: ["GGSIPU Ordinance 31"],
    capabilities: {
      marks: true,
      courseStatus: true,
      grade: false,
      gradePoint: false,
      credits: true,
      sgpa: false,
      cgpa: false,
      division: true,
      promotion: true,
      percentage: true,
    },
    rules: {
      standardMaxMarks: 100,
      coursePassByTotalMarks: {
        ruleName: "Minimum 50% Aggregate Marks",
        minimumTotalPercent: 50,
        sources: ["GGSIPU Ordinance 31, Clause 15(b)"],
      },
      promotionByAllCourses: {
        ruleName: "Promotion Requires Passing All Subjects",
        sources: ["GGSIPU Ordinance 31, Clause 15(a)"],
      },
      duration: {
        text: "4½ years including 6 months internship",
        sources: ["GGSIPU Ordinance 31"],
      },
      internship: {
        months: 6,
        sources: ["GGSIPU Ordinance 31"],
      },
      cpi: {
        ruleName: "Cumulative Performance Index",
        formula: "Σ(Cn × Mn) / ΣCn",
        onlyPassedCreditCourses: true,
        minimumCourseMarksPercent: 50,
        sources: ["GGSIPU Ordinance 31, Clause 18"],
      },
      divisionFromCpi: {
        ruleName: "Division Classification from CPI",
        bands: [
          { minimumCGPA: 90, maximumCGPA: null,   division: "Exemplary Performance", note: "CPI ≥ 90 in first attempt" },
          { minimumCGPA: 75, maximumCGPA: 89.99, division: "First Division with Distinction", note: "CPI ≥ 75 in first attempt" },
          { minimumCGPA: 60, maximumCGPA: 74.99, division: "First Division" },
          { minimumCGPA: 50, maximumCGPA: 59.99, division: "Second Division" },
        ],
        sources: ["GGSIPU Ordinance 31, Clause 17(e)"],
      },
      noLetterGrades: {
        reason: "Ordinance 31 uses percentage CPI rather than the 10-point letter grade table.",
        sources: ["GGSIPU Ordinance 31, Clause 18"],
      },
    },
  },
  ORD_38: {
    ordinanceCode: "ORD_38",
    ordinanceName: "Conduct and Evaluation of Examinations for the programme leading to B.A.M.S. (Bachelor of Ayurvedic Medicine and Surgery)",
    examinationSystem: "ANNUAL",
    verification: "VERIFIED",
    sources: ["GGSIPU Ordinance 38"],
    capabilities: {
      marks: true,
      courseStatus: true,
      grade: false,
      gradePoint: false,
      credits: false,
      sgpa: false,
      cgpa: false,
      division: false,
      promotion: true,
      percentage: true,
    },
    rules: {
      duration: {
        text: "5½ years including 1 year internship",
        sources: ["GGSIPU Ordinance 38"],
      },
      internship: {
        months: 12,
        sources: ["GGSIPU Ordinance 38"],
      },
      noLetterGrades: {
        reason: "BAMS uses percentage marks rather than a 10-point letter grade table.",
        sources: ["GGSIPU Ordinance 38"],
      },
      noDivision: {
        reason: "Ordinance 38 evaluates BAMS on a percentage pass/fail basis with subject distinction, without overall division classification.",
        sources: ["GGSIPU Ordinance 38"],
      },
    },
  },
};

export const COURSE_MAX_MARKS: Record<string, number> = {
  "HUMAN ANATOMY": 200,
  "HUMAN PHYSIOLOGY": 200,
  "BIOCHEMISTRY": 200,
  "PATHOLOGY": 200,
  "MICROBIOLOGY": 200,
  "PHARMACOLOGY": 200,
  "FORENSIC MEDICINE": 100,
  "OPHTHALMOLOGY": 200,
  "OTO-RHINO-LARYNGOLOGY": 100,
  "COMMUNITY MEDICINE": 200,
};

export const STATUSES = {
  numericStatus: {
    "08": { semantic: "PASS" },
    "09": { semantic: "NOT_CLEARED" },
  },
  totalLegends: {
    ABS: { semantic: "ABSENT" },
    DET: { semantic: "DETAINED" },
    CAN: { semantic: "CANCELLED" },
    RL: { semantic: "RESULT_LATER" },
    CS: { semantic: "CREDIT_SECURED" },
    AP: { semantic: "ALREADY_PASSED" },
  },
};

export const ACADEMIC_DB = {
  ordinances: ORDINANCES,
  statuses: STATUSES,
};

const GENERIC_TITLES = new Set([
  "ba",
  "bachelor of arts",
  "law",
  "bachelor of law",
  "bachelor of laws",
]);

export function findProgramme(degreeOrFamilyName?: string | null): ProgrammeEntry | null {
  const searchQuery = String(degreeOrFamilyName ?? "").trim().toLowerCase();
  if (!searchQuery) return null;

  const words = searchQuery.split(/[^a-z0-9]+/);

  let matchedFamily = PROGRAMME_FAMILIES.find((family) => searchQuery === family.family.toLowerCase());

  if (!matchedFamily) {
    matchedFamily = PROGRAMME_FAMILIES.find((family) =>
      family.keywords.some((keyword) => {
        const kw = keyword.toLowerCase();
        if (kw.length <= 4 && !kw.includes(" ")) {
          return words.includes(kw);
        }
        return searchQuery.includes(kw);
      })
    );
  }

  if (!matchedFamily) return null;

  const verification: Verification = GENERIC_TITLES.has(searchQuery) ? "INFERRED" : "VERIFIED";
  const ordinance = ORDINANCES[matchedFamily.ordinance] ?? null;

  return {
    examWebProgrammeCode: matchedFamily.family,
    officialProgrammeName: String(degreeOrFamilyName).trim() || matchedFamily.family,
    programmeFamily: matchedFamily.family,
    examinationSystem: matchedFamily.system,
    ordinanceCode: matchedFamily.ordinance,
    ordinance,
    isTech: matchedFamily.isTech,
    verification,
    sources: verification === "VERIFIED"
      ? [`GGSIPU Ordinance (${matchedFamily.ordinance})`]
      : [`Inferred mapping (${matchedFamily.family} → ${matchedFamily.ordinance}); requires scheme verification`],
  };
}

export function findOrdinance(identifier?: ProgrammeEntry | string | null): OrdinanceDefinition | null {
  if (!identifier) return null;

  if (typeof identifier === "object" && identifier.ordinance) {
    return identifier.ordinance;
  }

  const query = String(typeof identifier === "string" ? identifier : identifier.programmeFamily || identifier.ordinanceCode || "").trim().toUpperCase();

  if (ORDINANCES[query]) {
    return ORDINANCES[query];
  }

  const ordKey = `ORD_${query}`;
  if (ORDINANCES[ordKey]) {
    return ORDINANCES[ordKey];
  }

  const matchedFamily = PROGRAMME_FAMILIES.find((family) =>
    family.family === query
  );
  if (matchedFamily && ORDINANCES[matchedFamily.ordinance]) {
    return ORDINANCES[matchedFamily.ordinance];
  }

  return null;
}

export function getSubjectMaxMarks(subjectName?: string, programmeFamily?: string): number | null {
  if (!programmeFamily) return null;

  const ordinance = findOrdinance(programmeFamily);
  if (!ordinance?.rules) return null;

  const subjectMap = ordinance.rules.subjectMaxMarks as Record<string, number> | undefined;
  if (subjectMap && subjectName) {
    const clean = String(subjectName).toUpperCase().trim();
    if (subjectMap[clean] !== undefined) {
      return subjectMap[clean];
    }
  }

  return (ordinance.rules.standardMaxMarks as number | undefined) ?? null;
}

export function isVerified(item?: unknown): boolean {
  if (!item) return false;
  const status = typeof item === "string" ? item : (item as { verification?: string })?.verification;
  return status === "VERIFIED" || status === "VERIFIED_2";
}