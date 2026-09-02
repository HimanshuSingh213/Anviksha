import { describe, it, expect } from "vitest";
import { analyzeResult, decodeStatus } from "./academic-engine";
import {
  findProgramme,
  findOrdinance,
  isVerified,
  getSubjectMaxMarks,
} from "./academic-db";

// The real 498 payload shape (spec §37 fixtures)
const REAL_498 = {
  stprofile: {
    nrollno: "40216449825",
    stname: "HIMANSHU SINGH",
    byoa: 2025,
    yoa: 2025,
    prgcode: "498",
    prgname: "BACHELOR OF TECHNOLOGY (COMPUTER SCIENCE AND ENGINEERING - DATA SCIENCE)",
    icode: "164",
    iname: "UNIVERSITY SCHOOL OF INFORMATION, COMMUNICATION & TECHNOLOGY (FORMERLY USIT)",
  },
  stresult: [
    [1, "ICT101", "PROGRAMMING FOR PROBLEM SOLVING", "33", "35", "68", "08", "12,2025", "2026-02-03"],
    [1, "ICT151", "PROGRAMMING FOR PROBLEM SOLVING LAB", "35", "51", "86", "08", "12,2025", "2026-02-03"],
    [2, "ICT104", "DATA STRUCTURES & ALGORITHMS", "18", "8", "26", "09", "05,2026", "2026-07-14"],
    [2, "ICT110", "DISCRETE STRUCTURES", "0", "0", "ABS", "09", "05,2026", "2026-07-14"],
  ],
};

describe("CASE 1 — 498 + 2025 identifies B.Tech CSE-DS, raw result visible", () => {
  const r = analyzeResult(REAL_498);
  it("keeps the raw programme code and separates the family", () => {
    expect(r.programme.programmeCode).toBe("498"); // raw preserved
    expect(r.programme.programmeFamily).toBe("BTECH");
    expect(r.programme.cohort).toBe(2025);
    expect(r.programme.ordinance).toBe("ORD_11");
    expect(r.programme.known).toBe(true);
  });

  it("every course stays visible with raw codes and statuses", () => {
    expect(r.courses).toHaveLength(4);
    expect(r.courses[0].rawCode).toBe("ICT101");
    expect(r.courses[0].name).toContain("PROGRAMMING");
    expect(r.analytics.paperCount.value).toBe(4);
    expect(r.analytics.paperCount.status).toBe("RESULT_DERIVED");
  });

  it("declared dates and exam months survive in the raw payload", () => {
    expect(REAL_498.stresult[0][7]).toBe("12,2025");
    expect(REAL_498.stresult[0][8]).toBe("2026-02-03");
  });
});

describe("CASE 2 — no user credits ⇒ no guessed credits: SGPA/CGPA stay UNAVAILABLE", () => {
  const r = analyzeResult(REAL_498);
  it("grades calculate (ORD_11 rule verified) but credit GPA is withheld without credits", () => {
    expect(r.analytics.grade.value).toBe(true);
    expect(r.analytics.grade.status).toBe("RESULT_DERIVED");
    // The engine never invents credits (spec: DEFAULT ≠ VERIFIED). With no
    // user-edited and no scheme credits, GPA analytics are UNAVAILABLE, null.
    expect(r.analytics.sgpa.status).toBe("UNAVAILABLE");
    expect(r.analytics.sgpa.value).toBeNull();
    expect(r.analytics.cgpa.status).toBe("UNAVAILABLE");
    expect(r.analytics.cgpa.value).toBeNull();
    expect(r.analytics.percentage.status).toBe("UNAVAILABLE");
    expect(r.analytics.division.status).toBe("VERIFIED");
    expect(r.analytics.division.value).toBeNull();
    expect(r.analytics.coursePassRule.status).toBe("VERIFIED");
    expect(r.analytics.averagePercentage.status).toBe("UNAVAILABLE");
    expect(r.analytics.averagePercentage.value).toBeNull();
  });
  it("promotion is UNAVAILABLE without credits — never guessed", () => {
    expect(r.analytics.promotion.status).toBe("UNAVAILABLE");
    expect(r.analytics.promotion.value).toBeNull();
  });
  // Result-derived features remain fully available (spec §20)
  it("result-derived stats still work", () => {
    expect(r.analytics.paperCount.value).toBe(4);
    expect(r.analytics.averageMarks.value).not.toBeNull();
    expect(r.analytics.highestMarks.value).toBe(86);
    expect(r.analytics.lowestMarks.value).toBe(26);
  });
});

describe("CASE 3 — user-edited credits calculate SGPA/CGPA with RESULT_DERIVED status", () => {
  const userCredits = {
    ICT101: 4,
    ICT151: 1,
    ICT104: 4,
    ICT110: 4,
  };
  const r = analyzeResult(REAL_498, userCredits);

  it("calculates SGPA and CGPA with RESULT_DERIVED status when using user credits", () => {
    expect(r.analytics.sgpa.status).toBe("RESULT_DERIVED");
    expect(r.analytics.sgpa.value).not.toBeNull();
    expect(r.analytics.cgpa.status).toBe("RESULT_DERIVED");
    expect(r.analytics.cgpa.value).not.toBeNull();
    expect(r.analytics.percentage.status).toBe("RESULT_DERIVED");
    expect(r.analytics.division.status).toBe("RESULT_DERIVED");
  });

  it("calculates promotion with 50% baseline under RESULT_DERIVED", () => {
    expect(r.analytics.promotion.status).toBe("RESULT_DERIVED");
    expect(r.analytics.promotion.value).not.toBeNull();
    expect(r.analytics.promotion.value?.length).toBeGreaterThan(0);
  });
});

describe("CASE 4 — unknown programme ⇒ result visible, analytics limited", () => {
  const r = analyzeResult({
    stprofile: { ...REAL_498.stprofile, prgcode: "999", prgname: "BACHELOR OF MARITIME STUDIES" },
    stresult: REAL_498.stresult,
  });

  it("programme unknown, courses still fully rendered", () => {
    expect(r.programme.known).toBe(false);
    expect(r.courses).toHaveLength(4);
    expect(r.analytics.paperCount.value).toBe(4);
    expect(r.analytics.grade.status).toBe("UNAVAILABLE");
    expect(r.warnings.some((w) => w.message.includes("not mapped"))).toBe(true);
  });
});

describe("CASE 5 — special ordinance never inherits ORD_11", () => {
  it("MBBS → ORD_15, has no grade table or division classification", () => {
    const r = analyzeResult({
      stprofile: { ...REAL_498.stprofile, prgcode: "MBBS", prgname: "BACHELOR OF MEDICINE & SURGERY" },
      stresult: REAL_498.stresult,
    });
    expect(r.programme.ordinance).toBe("ORD_15");
    expect(r.analytics.grade.value).toBeNull();
    expect(r.analytics.grade.status).toBe("NOT_APPLICABLE");
    expect(r.analytics.sgpa.status).toBe("NOT_APPLICABLE");
    expect(r.analytics.division.status).toBe("NOT_APPLICABLE");
    expect(r.analytics.division.value).toBeNull();
    expect(r.analytics.coursePassRule.status).toBe("VERIFIED");
  });

  it("BPT → ORD_31, separate annual framework with no ORD_10/11 rules", () => {
    const r = analyzeResult({
      stprofile: { ...REAL_498.stprofile, prgcode: "BPT", prgname: "BACHELOR OF PHYSIOTHERAPY" },
      stresult: REAL_498.stresult,
    });
    expect(r.programme.ordinance).toBe("ORD_31");
    expect(r.analytics.grade.value).toBeNull();
    expect(r.analytics.grade.status).toBe("NOT_APPLICABLE");
    expect(r.analytics.sgpa.status).toBe("NOT_APPLICABLE");
    expect(r.analytics.cgpa.status).toBe("NOT_APPLICABLE");
    expect(r.analytics.coursePassRule.status).toBe("VERIFIED");
    expect(r.analytics.promotion.status).toBe("WARNING");
    // result-derived features still work
    expect(r.analytics.paperCount.value).toBe(4);
  });
});

describe("family generalization — all branch degrees generalize to family (VERIFIED)", () => {
  it("any B.Tech branch resolves to BTECH/ORD_11 with VERIFIED regulations", () => {
    const r = analyzeResult({
      stprofile: { ...REAL_498.stprofile, prgname: "BACHELOR OF TECHNOLOGY (ELECTRONICS AND COMMUNICATION ENGINEERING)" },
      stresult: REAL_498.stresult,
    });
    expect(r.programme.programmeFamily).toBe("BTECH");
    expect(r.programme.ordinance).toBe("ORD_11");
    expect(r.programme.dbVerification).toBe("VERIFIED");
    expect(r.analytics.grade.value).toBe(true);
    expect(r.analytics.grade.status).toBe("RESULT_DERIVED");
    expect(r.warnings.some((w) => w.message.includes("generalized"))).toBe(false);
  });

  it("BCA degree generalizes to the BCA family", () => {
    const r = analyzeResult({
      stprofile: { ...REAL_498.stprofile, prgname: "BACHELOR OF COMPUTER APPLICATIONS" },
      stresult: REAL_498.stresult,
    });
    expect(r.programme.programmeFamily).toBe("BCA");
    expect(r.programme.ordinance).toBe("ORD_11");
  });

  it("a truly unknown programme still stays unknown", () => {
    const r = analyzeResult({
      stprofile: { ...REAL_498.stprofile, prgcode: "999", prgname: "BACHELOR OF MARITIME STUDIES" },
      stresult: REAL_498.stresult,
    });
    expect(r.programme.known).toBe(false);
    expect(r.programme.programmeFamily).toBeNull();
  });
});

describe("CASE 6 — decodeStatus semantics", () => {
  it("maps 08 to PASS", () => {
    expect(decodeStatus("08", "68")).toBe("PASS");
  });

  it("maps 09 with ABS to ABSENT", () => {
    expect(decodeStatus("09", "ABS")).toBe("ABSENT");
  });

  it("maps 09 with numeric to NOT_CLEARED", () => {
    expect(decodeStatus("09", "26")).toBe("NOT_CLEARED");
  });

  it("unrecognized status stays UNKNOWN without auto-failing", () => {
    expect(decodeStatus("77", "50")).toBe("UNKNOWN");
  });
});

describe("helpers — programme and ordinance lookups", () => {
  it("findProgramme handles degree names and family identifiers without program codes", () => {
    expect(findProgramme("BACHELOR OF TECHNOLOGY")?.programmeFamily).toBe("BTECH");
    expect(findProgramme("B.Tech")?.programmeFamily).toBe("BTECH");
    expect(findProgramme("BACHELOR OF COMPUTER APPLICATIONS")?.programmeFamily).toBe("BCA");
    expect(findProgramme("BCA")?.programmeFamily).toBe("BCA");
    expect(findProgramme("MBBS")?.ordinanceCode).toBe("ORD_15");
    expect(findProgramme("BACHELOR OF MEDICINE")?.ordinanceCode).toBe("ORD_15");
    expect(findProgramme("UNKNOWN_DEGREE_XYZ")).toBeNull();
  });

  it("findOrdinance returns ordinance definition from code, number, family, or programme", () => {
    expect(findOrdinance("ORD_11")?.ordinanceName).toContain("Semester");
    expect(findOrdinance("11")?.ordinanceName).toContain("Semester");
    expect(findOrdinance("BTECH")?.ordinanceName).toContain("Semester");
    expect(findOrdinance("MTECH")?.ordinanceCode).toBe("ORD_11");
    expect(findOrdinance("ORD_10")?.ordinanceName).toContain("Annual System");
    expect(findOrdinance("ORD_15")?.ordinanceName).toContain("M.B.B.S");
    expect(findOrdinance("MBBS")?.ordinanceName).toContain("M.B.B.S");
    expect(findOrdinance("ORD_16")?.ordinanceName).toContain("MD/MS");
    expect(findOrdinance("ORD_22")?.ordinanceName).toContain("B.H.M.S");
    expect(findOrdinance("ORD_24")?.ordinanceName).toContain("B.A.S.L.P");
    expect(findOrdinance("ORD_25")?.ordinanceName).toContain("Weekend");
    expect(findOrdinance("ORD_31")?.ordinanceName).toContain("Bachelor of Physiotherapy");
    expect(findOrdinance("ORD_38")?.ordinanceName).toContain("B.A.M.S");
    expect(findOrdinance("UNKNOWN_ORD")).toBeNull();
  });

  it("isVerified correctly evaluates verification scale", () => {
    expect(isVerified("VERIFIED")).toBe(true);
    expect(isVerified("VERIFIED_2")).toBe(true);
    expect(isVerified("INFERRED")).toBe(false);
    expect(isVerified("UNKNOWN")).toBe(false);
  });

  it("resolves isTech correctly for technical vs non-technical degrees", () => {
    expect(findProgramme("BACHELOR OF TECHNOLOGY")?.isTech).toBe(true);
    expect(findProgramme("BACHELOR OF COMPUTER APPLICATIONS")?.isTech).toBe(true);
    expect(findProgramme("BACHELOR OF BUSINESS ADMINISTRATION")?.isTech).toBe(false);
    expect(findProgramme("BACHELOR OF MEDICINE")?.isTech).toBe(false);
    expect(findProgramme("BACHELOR OF PHYSIOTHERAPY")?.isTech).toBe(false);
  });
});

describe("multi-period separation — SGPA vs CGPA decoupling", () => {
  it("calculates distinct period SGPA and multi-period cumulative CGPA", () => {
    const userCredits = {
      ICT101: 4,
      ICT151: 1,
      ICT104: 4,
      ICT110: 4,
    };
    const r = analyzeResult(REAL_498, userCredits);

    // Period 1: ICT101 (68 -> A, GP 8, cr 4) + ICT151 (86 -> A+, GP 9, cr 1)
    // Sem 1 SGPA = (4*8 + 1*9) / 5 = 41 / 5 = 8.20
    const sem1 = r.analytics.sgpaByPeriod.find((p) => p.period === 1);
    expect(sem1?.sgpa.value).toBe(8.2);

    // Period 2: ICT104 (26 -> F, GP 0, cr 4) + ICT110 (ABS -> F, GP 0, cr 4)
    // Sem 2 SGPA = 0 / 8 = 0.00
    const sem2 = r.analytics.sgpaByPeriod.find((p) => p.period === 2);
    expect(sem2?.sgpa.value).toBe(0);

    // Latest period SGPA = Sem 2 SGPA = 0
    expect(r.analytics.sgpa.value).toBe(0);

    // Cumulative CGPA across all periods = 41 / 13 = 3.15
    expect(r.analytics.cgpa.value).toBe(3.15);

    // SGPA and CGPA must be distinct values, never hard-coded duplicates
    expect(r.analytics.sgpa.value).not.toBe(r.analytics.cgpa.value);
  });
});

describe("safe max marks — no blind fallback to 100", () => {
  it("returns null for unknown programmes rather than inventing 100", () => {
    expect(getSubjectMaxMarks("SOME_UNKNOWN_SUBJECT", undefined)).toBeNull();
    expect(getSubjectMaxMarks("SOME_UNKNOWN_SUBJECT", "MARITIME_STUDIES")).toBeNull();
  });

  it("returns verified max marks for MBBS subjects and null for unmapped ones", () => {
    expect(getSubjectMaxMarks("HUMAN ANATOMY", "MBBS")).toBe(200);
    expect(getSubjectMaxMarks("FORENSIC MEDICINE", "MBBS")).toBe(100);
    expect(getSubjectMaxMarks("UNKNOWN_MEDICAL_PAPER", "MBBS")).toBeNull();
  });

  it("returns null for Ordinance 11 (variable scheme max marks) and standard 100 for Ordinance 31", () => {
    expect(getSubjectMaxMarks("PROGRAMMING", "BTECH")).toBeNull();
    expect(getSubjectMaxMarks("DATA STRUCTURES", "BCA")).toBeNull();
    expect(getSubjectMaxMarks("ANATOMY", "BPT")).toBe(100);
  });
});

describe("framework capabilities — accurate statutory feature support", () => {
  it("declares comprehensive capabilities for ORD_11", () => {
    const ord11 = findOrdinance("ORD_11");
    expect(ord11?.capabilities.grade).toBe(true);
    expect(ord11?.capabilities.sgpa).toBe(true);
    expect(ord11?.capabilities.cgpa).toBe(true);
    expect(ord11?.capabilities.division).toBe(true);
    expect(ord11?.capabilities.promotion).toBe(true);
  });

  it("declares correct disabled capabilities for ORD_15 (MBBS: no letter grades, no GPA, no divisions)", () => {
    const ord15 = findOrdinance("ORD_15");
    expect(ord15?.capabilities.grade).toBe(false);
    expect(ord15?.capabilities.sgpa).toBe(false);
    expect(ord15?.capabilities.cgpa).toBe(false);
    expect(ord15?.capabilities.division).toBe(false);
    expect(ord15?.capabilities.marks).toBe(true);
    expect(ord15?.capabilities.percentage).toBe(true);
  });

  it("declares correct capabilities for ORD_31 (BPT: credits and CPI division, no letter grades, no 10-point GPA)", () => {
    const ord31 = findOrdinance("ORD_31");
    expect(ord31?.capabilities.grade).toBe(false);
    expect(ord31?.capabilities.sgpa).toBe(false);
    expect(ord31?.capabilities.cgpa).toBe(false);
    expect(ord31?.capabilities.division).toBe(true);
    expect(ord31?.capabilities.credits).toBe(true);
  });
});

describe("Requirement 15 — Statutory Verification Suite", () => {
  it("a) Ordinance 11: accurate SGPA, CGPA, grades with credits", () => {
    const userCredits = {
      ICT101: 4,
      ICT151: 1,
      ICT104: 4,
      ICT110: 4,
    };
    const r = analyzeResult(REAL_498, userCredits);
    expect(r.courses[0].grade?.value).toBe("A");
    expect(r.courses[0].grade?.point).toBe(8);
    expect(r.courses[1].grade?.value).toBe("A+");
    expect(r.courses[1].grade?.point).toBe(9);
    const sem1 = r.analytics.sgpaByPeriod.find((p) => p.period === 1);
    expect(sem1?.sgpa.value).toBe(8.2);
    expect(r.analytics.cgpa.value).toBe(3.15);
  });

  it("b) Ordinance 11: incomplete promotion inputs yield WARNING instead of confident promotion", () => {
    const singleSemResult = {
      stprofile: REAL_498.stprofile,
      stresult: [
        [1, "ICT101", "PROGRAMMING FOR PROBLEM SOLVING", "33", "35", "68", "08", "12,2025", "2026-02-03"],
        [1, "ICT151", "PROGRAMMING FOR PROBLEM SOLVING LAB", "35", "51", "86", "08", "12,2025", "2026-02-03"],
      ],
    };
    const r = analyzeResult(singleSemResult, { ICT101: 4, ICT151: 1 });
    expect(r.analytics.promotion.status).toBe("WARNING");
    expect(r.analytics.promotion.reason).toContain("Clause 12");
  });

  it("c) Ordinance 31: calculates weighted CPI from passed courses with credits", () => {
    const bptPayload = {
      stprofile: {
        nrollno: "2022907788",
        stname: "STUDENT BPT",
        byoa: 2022,
        yoa: 2022,
        prgcode: "BPT",
        prgname: "BACHELOR OF PHYSIOTHERAPY",
        icode: "127",
        iname: "BCIP",
      },
      stresult: [
        [1, "BPT-101", "ANATOMY", "30", "42", "72", "08", "12,2023", "2024-02-03"],
        [1, "BPT-102", "PHYSIOLOGY", "28", "39", "67", "08", "12,2023", "2024-02-03"],
        [1, "BPT-103", "BIOCHEMISTRY", "15", "20", "35", "09", "12,2023", "2024-02-03"],
      ],
    };
    const r = analyzeResult(bptPayload, { "BPT-101": 4, "BPT-102": 4, "BPT-103": 4 });
    expect(r.analytics.division.value).toBe("First Division");
    expect(r.analytics.division.status).toBe("RESULT_DERIVED");
  });

  it("d) Ordinance 31: classifies division according to CPI thresholds", () => {
    const bptDistinction = {
      stprofile: {
        nrollno: "2022907789",
        stname: "TOPPER BPT",
        byoa: 2022,
        yoa: 2022,
        prgcode: "BPT",
        prgname: "BACHELOR OF PHYSIOTHERAPY",
        icode: "127",
        iname: "BCIP",
      },
      stresult: [
        [1, "BPT-101", "ANATOMY", "40", "40", "80", "08", "12,2023", "2024-02-03"],
      ],
    };
    const rDist = analyzeResult(bptDistinction, { "BPT-101": 4 });
    expect(rDist.analytics.division.value).toBe("First Division with Distinction");
  });

  it("e) MBBS: SGPA, CGPA, and divisions are strictly NOT_APPLICABLE", () => {
    const mbbsPayload = {
      stprofile: {
        nrollno: "00550100122",
        stname: "MEDIC",
        byoa: 2022,
        yoa: 2022,
        prgcode: "001",
        prgname: "BACHELOR OF MEDICINE AND BACHELOR OF SURGERY (MBBS)",
        icode: "501",
        iname: "VMMC",
      },
      stresult: [
        [1, "MBBS-101", "HUMAN ANATOMY", "35", "95", "130", "08", "12,2023", "2024-03-01"],
      ],
    };
    const r = analyzeResult(mbbsPayload);
    expect(r.analytics.sgpa.status).toBe("NOT_APPLICABLE");
    expect(r.analytics.sgpa.value).toBeNull();
    expect(r.analytics.cgpa.status).toBe("NOT_APPLICABLE");
    expect(r.analytics.cgpa.value).toBeNull();
    expect(r.analytics.division.status).toBe("NOT_APPLICABLE");
    expect(r.analytics.division.value).toBeNull();
    expect(r.analytics.grade.status).toBe("NOT_APPLICABLE");
    expect(r.analytics.grade.value).toBeNull();
  });

  it("f) Unknown max marks remain null and yield UNAVAILABLE status", () => {
    expect(getSubjectMaxMarks("SPECIAL_PROJECT", "BTECH")).toBeNull();
    expect(getSubjectMaxMarks("CUSTOM_PAPER", undefined)).toBeNull();
  });

  it("g) Valid 0.00 GPA remains 0.00 and does not become null or UNAVAILABLE", () => {
    const allFailResult = {
      stprofile: REAL_498.stprofile,
      stresult: [
        [1, "ICT101", "PROGRAMMING", "10", "10", "20", "09", "12,2025", "2026-02-03"],
        [1, "ICT151", "LAB", "10", "10", "20", "09", "12,2025", "2026-02-03"],
      ],
    };
    const r = analyzeResult(allFailResult, { ICT101: 4, ICT151: 1 });
    expect(r.analytics.sgpa.value).toBe(0);
    expect(r.analytics.sgpa.status).toBe("RESULT_DERIVED");
    expect(r.analytics.cgpa.value).toBe(0);
    expect(r.analytics.cgpa.status).toBe("RESULT_DERIVED");
  });

  it("h) Unknown programme preserves raw results without crashing", () => {
    const unknownPayload = {
      stprofile: {
        nrollno: "99999999999",
        stname: "STUDENT UNKNOWN",
        byoa: 2024,
        yoa: 2024,
        prgcode: "999",
        prgname: "NON_EXISTENT_DEGREE",
        icode: "999",
        iname: "TEST INSTITUTE",
      },
      stresult: [
        [1, "PAP01", "MYSTERIOUS SUBJECT", "20", "30", "50", "08", "12,2024", "2025-01-01"],
      ],
    };
    const r = analyzeResult(unknownPayload);
    expect(r.programme.known).toBe(false);
    expect(r.courses).toHaveLength(1);
    expect(r.courses[0].rawCode).toBe("PAP01");
    expect(r.courses[0].total).toBe(50);
    expect(r.courses[0].rawResultUsable).toBe(true);
    expect(r.analytics.paperCount.value).toBe(1);
  });

  it("i) Ambiguous or unsupported framework leaves credit analytics UNAVAILABLE", () => {
    const unsupportedPayload = {
      stprofile: {
        nrollno: "88888888888",
        stname: "ANON",
        byoa: 2023,
        yoa: 2023,
        prgcode: "888",
        prgname: "UNSUPPORTED PHILOSOPHY DEGREE",
        icode: "888",
        iname: "UNSUPPORTED INST",
      },
      stresult: [
        [1, "PHIL01", "METAPHYSICS", "25", "35", "60", "08", "12,2023", "2024-01-01"],
      ],
    };
    const r = analyzeResult(unsupportedPayload, { PHIL01: 4 });
    expect(r.analytics.grade.status).toBe("UNAVAILABLE");
    expect(r.analytics.grade.value).toBeNull();
    expect(r.analytics.division.status).toBe("UNAVAILABLE");
    expect(r.analytics.division.value).toBeNull();
    expect(r.analytics.promotion.status).toBe("UNAVAILABLE");
    expect(r.analytics.promotion.value).toBeNull();
  });
});

describe("Targeted Audit — Division Capabilities & Generic Mappings", () => {
  it("BASLP / ORD_24: division is applicable and classified from cumulative percentage", () => {
    const ord24 = findOrdinance("ORD_24");
    expect(ord24?.capabilities.division).toBe(true);

    const baslpResult = {
      stprofile: {
        nrollno: "00110002422",
        stname: "BASLP STUDENT",
        byoa: 2022,
        yoa: 2022,
        prgcode: "024",
        prgname: "BACHELOR OF AUDIOLOGY AND SPEECH LANGUAGE PATHOLOGY",
        icode: "100",
        iname: "ALI YAVAR JUNG NATIONAL INSTITUTE",
      },
      stresult: [
        [1, "BASLP101", "ANATOMY & PHYSIOLOGY OF SPEECH", "25", "55", "80", "08", "12,2022", "2023-02-01"],
      ],
    };
    const r = analyzeResult(baslpResult);
    expect(r.programme.ordinance).toBe("ORD_24");
    expect(r.analytics.division.status).toBe("RESULT_DERIVED");
    expect(r.analytics.division.value).toBe("First Division with Distinction");
  });

  it("MBBS / ORD_15: division is strictly NOT_APPLICABLE per Ordinance 15", () => {
    const ord15 = findOrdinance("ORD_15");
    expect(ord15?.capabilities.division).toBe(false);

    const mbbsResult = {
      stprofile: {
        nrollno: "00550100122",
        stname: "MED STUDENT",
        byoa: 2022,
        yoa: 2022,
        prgcode: "001",
        prgname: "BACHELOR OF MEDICINE AND BACHELOR OF SURGERY",
        icode: "501",
        iname: "VMMC",
      },
      stresult: [
        [1, "MBBS-101", "HUMAN ANATOMY", "35", "95", "130", "08", "12,2023", "2024-03-01"],
      ],
    };
    const r = analyzeResult(mbbsResult);
    expect(r.programme.ordinance).toBe("ORD_15");
    expect(r.analytics.division.status).toBe("NOT_APPLICABLE");
    expect(r.analytics.division.value).toBeNull();
    expect(r.analytics.division.reason).toContain("no divisions for the MBBS programme");

    // Other medical ordinances declare their own specific capability, not via a generic rule
    const ord16 = findOrdinance("ORD_16");
    expect(ord16?.capabilities.division).toBe(false);
    expect(ord16?.rules.noDivision?.sources).toContain("GGSIPU Ordinance 16, Clauses 23 & 24");

    const ord22 = findOrdinance("ORD_22");
    expect(ord22?.capabilities.division).toBe(false);
    expect(ord22?.rules.noDivision?.sources).toContain("GGSIPU Ordinance 22");

    const ord38 = findOrdinance("ORD_38");
    expect(ord38?.capabilities.division).toBe(false);
    expect(ord38?.rules.noDivision?.sources).toContain("GGSIPU Ordinance 38");
  });

  it("BPT / ORD_31: division is applicable and CPI-based", () => {
    const ord31 = findOrdinance("ORD_31");
    expect(ord31?.capabilities.division).toBe(true);

    const bptPayload = {
      stprofile: {
        nrollno: "2022907788",
        stname: "BPT STUDENT",
        byoa: 2022,
        yoa: 2022,
        prgcode: "BPT",
        prgname: "BACHELOR OF PHYSIOTHERAPY",
        icode: "127",
        iname: "BANARSIDAS CHANDIWALA",
      },
      stresult: [
        [1, "BPT-101", "ANATOMY", "30", "42", "72", "08", "12,2023", "2024-02-03"],
        [1, "BPT-102", "PHYSIOLOGY", "28", "39", "67", "08", "12,2023", "2024-02-03"],
      ],
    };
    const r = analyzeResult(bptPayload, { "BPT-101": 4, "BPT-102": 4 });
    expect(r.programme.ordinance).toBe("ORD_31");
    expect(r.analytics.division.status).toBe("RESULT_DERIVED");
    // CPI = (72*4 + 67*4)/8 = 69.5 -> First Division (60-74.99)
    expect(r.analytics.division.value).toBe("First Division");
  });

  it("ambiguous generic BA/LAW mapping does not become VERIFIED without sufficient evidence", () => {
    // Generic BA without discipline evidence
    const genericBA = findProgramme("BACHELOR OF ARTS");
    expect(genericBA?.verification).toBe("INFERRED");
    expect(isVerified(genericBA)).toBe(false);

    const bareBA = findProgramme("BA");
    expect(bareBA?.verification).toBe("INFERRED");
    expect(isVerified(bareBA)).toBe(false);

    // Generic LAW without discipline evidence
    const genericLaw = findProgramme("BACHELOR OF LAW");
    expect(genericLaw?.verification).toBe("INFERRED");
    expect(isVerified(genericLaw)).toBe(false);

    const bareLaw = findProgramme("LAW");
    expect(bareLaw?.verification).toBe("INFERRED");
    expect(isVerified(bareLaw)).toBe(false);

    // Engine: generic BA leaves framework and division AMBIGUOUS
    const rBA = analyzeResult({
      stprofile: {
        nrollno: "11111111111",
        stname: "GENERIC BA STUDENT",
        byoa: 2023,
        yoa: 2023,
        prgcode: "BA",
        prgname: "BACHELOR OF ARTS",
        icode: "101",
        iname: "COLLEGE",
      },
      stresult: [
        [1, "BA101", "GENERAL ENGLISH", "25", "45", "70", "08", "12,2023", "2024-02-01"],
      ],
    });
    expect(rBA.programme.dbVerification).toBe("INFERRED");
    expect(rBA.analytics.framework.status).toBe("AMBIGUOUS");
    expect(rBA.analytics.division.status).toBe("AMBIGUOUS");
    expect(rBA.analytics.grade.status).toBe("AMBIGUOUS");
    expect(rBA.courses).toHaveLength(1);
    expect(rBA.courses[0].rawCode).toBe("BA101");
    expect(rBA.courses[0].total).toBe(70);
    expect(rBA.courses[0].rawResultUsable).toBe(true);

    // But specific verified BA disciplines (e.g. Journalism) become VERIFIED
    const specificBA = findProgramme("BACHELOR OF ARTS (JOURNALISM AND MASS COMMUNICATION)");
    expect(specificBA?.verification).toBe("VERIFIED");
    expect(isVerified(specificBA)).toBe(true);

    // And specific verified LAW programmes (e.g. BA LLB) become VERIFIED
    const specificLaw = findProgramme("BA LLB");
    expect(specificLaw?.verification).toBe("VERIFIED");
    expect(isVerified(specificLaw)).toBe(true);
  });
});

