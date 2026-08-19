import { describe, it, expect } from "vitest";
import {
  getGradeAndPoints,
  getGradeThemeClasses,
  getDefaultCredit,
  getAcademicPromotionStatus,
  getPlacementEligibility,
  getReappearSessionPlan,
  getDivisionClassification,
} from "@/helpers/grade-system";

describe("grade-system.ts - Ordinance 11 Grade Calculations", () => {
  describe("getGradeAndPoints", () => {
    it("returns O grade for 90-100 marks", () => {
      expect(getGradeAndPoints(90)).toEqual({ grade: "O", points: 10, pass: true });
      expect(getGradeAndPoints(95)).toEqual({ grade: "O", points: 10, pass: true });
      expect(getGradeAndPoints(100)).toEqual({ grade: "O", points: 10, pass: true });
    });

    it("returns A+ grade for 75-89 marks", () => {
      expect(getGradeAndPoints(75)).toEqual({ grade: "A+", points: 9, pass: true });
      expect(getGradeAndPoints(80)).toEqual({ grade: "A+", points: 9, pass: true });
      expect(getGradeAndPoints(89)).toEqual({ grade: "A+", points: 9, pass: true });
    });

    it("returns A grade for 65-74 marks", () => {
      expect(getGradeAndPoints(65)).toEqual({ grade: "A", points: 8, pass: true });
      expect(getGradeAndPoints(70)).toEqual({ grade: "A", points: 8, pass: true });
      expect(getGradeAndPoints(74)).toEqual({ grade: "A", points: 8, pass: true });
    });

    it("returns B+ grade for 55-64 marks", () => {
      expect(getGradeAndPoints(55)).toEqual({ grade: "B+", points: 7, pass: true });
      expect(getGradeAndPoints(60)).toEqual({ grade: "B+", points: 7, pass: true });
      expect(getGradeAndPoints(64)).toEqual({ grade: "B+", points: 7, pass: true });
    });

    it("returns B grade for 50-54 marks", () => {
      expect(getGradeAndPoints(50)).toEqual({ grade: "B", points: 6, pass: true });
      expect(getGradeAndPoints(54)).toEqual({ grade: "B", points: 6, pass: true });
    });

    it("returns C grade for 45-49 marks", () => {
      expect(getGradeAndPoints(45)).toEqual({ grade: "C", points: 5, pass: true });
      expect(getGradeAndPoints(49)).toEqual({ grade: "C", points: 5, pass: true });
    });

    it("returns P grade for 40-44 marks (passing)", () => {
      expect(getGradeAndPoints(40)).toEqual({ grade: "P", points: 4, pass: true });
      expect(getGradeAndPoints(44)).toEqual({ grade: "P", points: 4, pass: true });
    });

    it("returns F grade for below 40 marks (fail)", () => {
      expect(getGradeAndPoints(39)).toEqual({ grade: "F", points: 0, pass: false });
      expect(getGradeAndPoints(0)).toEqual({ grade: "F", points: 0, pass: false });
      expect(getGradeAndPoints(-5)).toEqual({ grade: "F", points: 0, pass: false });
    });
  });

  describe("getGradeThemeClasses", () => {
    it("returns excellent theme for O and A+", () => {
      expect(getGradeThemeClasses("O")).toContain("bg-grade-excellent-surface");
      expect(getGradeThemeClasses("O")).toContain("text-grade-excellent");
      expect(getGradeThemeClasses("A+")).toContain("bg-grade-excellent-surface");
    });

    it("returns good theme for A and B+", () => {
      expect(getGradeThemeClasses("A")).toContain("bg-grade-good-surface");
      expect(getGradeThemeClasses("B+")).toContain("bg-grade-good-surface");
    });

    it("returns average theme for B and C", () => {
      expect(getGradeThemeClasses("B")).toContain("bg-grade-average-surface");
      expect(getGradeThemeClasses("C")).toContain("bg-grade-average-surface");
    });

    it("returns pass theme for P", () => {
      expect(getGradeThemeClasses("P")).toContain("bg-grade-pass-surface");
    });

    it("returns fail theme for F and unknown grades", () => {
      expect(getGradeThemeClasses("F")).toContain("bg-grade-fail-surface");
      expect(getGradeThemeClasses("X")).toContain("bg-grade-fail-surface");
    });
  });

  describe("getDefaultCredit", () => {
    it("returns 1 credit for LAB subjects", () => {
      expect(getDefaultCredit("PHYSICS LAB")).toBe(1);
      expect(getDefaultCredit("CHEMISTRY LABORATORY")).toBe(1);
      expect(getDefaultCredit("WORKSHOP PRACTICAL")).toBe(1);
      expect(getDefaultCredit("lab")).toBe(1);
    });

    it("returns 1 credit for PRACTICAL subjects", () => {
      expect(getDefaultCredit("DATA STRUCTURES PRACTICAL")).toBe(1);
      expect(getDefaultCredit("practical")).toBe(1);
    });

    it("returns 3 credits for theory subjects", () => {
      expect(getDefaultCredit("DATA STRUCTURES")).toBe(3);
      expect(getDefaultCredit("MATHEMATICS")).toBe(3);
      expect(getDefaultCredit("COMPUTER NETWORKS")).toBe(3);
    });

    it("handles empty/null subject titles", () => {
      expect(getDefaultCredit("")).toBe(3);
      expect(getDefaultCredit(null as any)).toBe(3);
      expect(getDefaultCredit(undefined as any)).toBe(3);
    });
  });

  describe("getAcademicPromotionStatus", () => {
    it("returns PROMOTED when student clears >= 50% credits in both semesters of a year", () => {
      const mockResults = [
        // Sem 1: 2 theory subjects (3 credits each), passed both
        [1, "ETCS101", "Applied Maths", 20, 50, 70],
        [1, "ETCS102", "Applied Physics", 20, 50, 70],
        // Sem 2: 2 theory subjects, passed both
        [2, "ETCS103", "Data Structures", 20, 50, 70],
        [2, "ETCS104", "Digital Electronics", 20, 50, 70],
      ];

      const status = getAcademicPromotionStatus(mockResults);
      expect(status.years[0].status).toBe("PROMOTED");
      expect(status.years[0].earnedCredits).toBe(12);
      expect(status.years[0].totalCredits).toBe(12);
      expect(status.years[0].percentage).toBe(100);
      expect(status.hasDetentionRisk).toBe(false);
    });

    it("returns YEAR_BACK_RISK when student clears < 50% credits in a completed year", () => {
      const mockResults = [
        // Sem 1: failed both (total 6 credits)
        [1, "ETCS101", "Applied Maths", 10, 20, 30],
        [1, "ETCS102", "Applied Physics", 10, 20, 30],
        // Sem 2: passed 1, failed 1 (3 earned out of 6)
        [2, "ETCS103", "Data Structures", 20, 50, 70],
        [2, "ETCS104", "Digital Electronics", 10, 20, 30],
      ];

      const status = getAcademicPromotionStatus(mockResults);
      expect(status.years[0].status).toBe("YEAR_BACK_RISK");
      expect(status.years[0].earnedCredits).toBe(3);
      expect(status.years[0].totalCredits).toBe(12);
      expect(status.years[0].percentage).toBe(25);
      expect(status.hasDetentionRisk).toBe(true);
      expect(status.years[0].creditsDeficit).toBe(3); // needs 6 credits (50% of 12) - earned 3 = 3
    });

    it("returns IN_PROGRESS when only odd semester is completed", () => {
      const mockResults = [
        [1, "ETCS101", "Applied Maths", 20, 50, 70],
        [1, "ETCS102", "Applied Physics", 20, 50, 70],
      ];

      const status = getAcademicPromotionStatus(mockResults);
      expect(status.years[0].status).toBe("IN_PROGRESS");
      expect(status.years[0].hasOddSem).toBe(true);
      expect(status.years[0].hasEvenSem).toBe(false);
    });

    it("returns UPCOMING for future academic years", () => {
      const mockResults = [
        [1, "ETCS101", "Applied Maths", 20, 50, 70],
      ];

      const status = getAcademicPromotionStatus(mockResults);
      expect(status.years[1].status).toBe("UPCOMING");
      expect(status.years[2].status).toBe("UPCOMING");
      expect(status.years[3].status).toBe("UPCOMING");
    });

    it("respects custom credit overrides for promotion calculations", () => {
      const mockResults = [
        [1, "ETCS101", "Applied Maths", 20, 50, 70], // default 3, override to 4
        [2, "ETCS102", "Applied Physics", 20, 50, 70], // default 3, override to 2
      ];

      const customCredits = { ETCS101: 4, ETCS102: 2 };
      const status = getAcademicPromotionStatus(mockResults, customCredits);

      expect(status.years[0].totalCredits).toBe(6);
      expect(status.years[0].earnedCredits).toBe(6);
      expect(status.years[0].status).toBe("PROMOTED");
    });

    it("evaluates exactly 50% credits as PROMOTED", () => {
      const mockResults = [
        // Sem 1: passed 1 (3 cr), failed 1 (3 cr)
        [1, "ETCS101", "Maths", 20, 50, 70],
        [1, "ETCS102", "Physics", 10, 20, 30],
        // Sem 2: passed 1 (3 cr), failed 1 (3 cr)
        [2, "ETCS103", "Data Structures", 20, 50, 70],
        [2, "ETCS104", "Digital Electronics", 10, 20, 30],
      ];

      const status = getAcademicPromotionStatus(mockResults);
      expect(status.years[0].totalCredits).toBe(12);
      expect(status.years[0].earnedCredits).toBe(6);
      expect(status.years[0].percentage).toBe(50);
      expect(status.years[0].status).toBe("PROMOTED");
      expect(status.hasDetentionRisk).toBe(false);
    });

    it("handles Lateral Entry students starting in Semester 3 (Year 2)", () => {
      const mockResults = [
        [3, "ETCS201", "Algorithm Design", 20, 50, 70],
        [4, "ETCS202", "Operating Systems", 20, 50, 70],
      ];

      const status = getAcademicPromotionStatus(mockResults);
      expect(status.years[0].status).toBe("UPCOMING"); // Year 1 empty
      expect(status.years[1].status).toBe("PROMOTED"); // Year 2 evaluated
      expect(status.activeYear).toBe(2);
      expect(status.hasDetentionRisk).toBe(false);
    });

    it("handles non-numeric or NaN total marks safely", () => {
      const mockResults = [
        [1, "ETCS101", "Maths", "A", "B", "INVALID_MARKS"],
        [2, "ETCS102", "Physics", 20, 50, 70],
      ];

      const status = getAcademicPromotionStatus(mockResults);
      expect(status.years[0].earnedCredits).toBe(3); // only Physics passed
      expect(status.years[0].totalCredits).toBe(6);
      expect(status.years[0].status).toBe("PROMOTED"); // 3/6 = 50%
    });
  });

  describe("getPlacementEligibility", () => {
    it("unlocks all 4 tiers for a student with CGPA >= 7.5 and 0 active backlogs", () => {
      const summary = getPlacementEligibility(8.2, 0);
      expect(summary.eligibleTierCount).toBe(4);
      expect(summary.totalTierCount).toBe(4);
      expect(summary.overallEligibilityRate).toBe(100);
      expect(summary.highestUnlockedTier).toBe("75%+ High Honors Cutoff");
      expect(summary.nextTargetTier).toBeNull();
      expect(summary.percentage).toBe(82.0);
    });

    it("restricts tier eligibility when student has CGPA = 6.8 and 0 backlogs", () => {
      const summary = getPlacementEligibility(6.8, 0);
      expect(summary.eligibleTierCount).toBe(2); // Tier 1 (6.0) & Tier 2 (6.5)
      expect(summary.overallEligibilityRate).toBe(50);
      expect(summary.highestUnlockedTier).toBe("65% Elevated Cutoff");
      expect(summary.nextTargetTier?.id).toBe("benchmark_70");
      expect(summary.nextTargetTier?.cgpaDeficit).toBe(0.2); // 7.0 - 6.8 = 0.2
    });

    it("blocks all tiers if student has active backlogs even with high CGPA", () => {
      const summary = getPlacementEligibility(8.5, 1);
      expect(summary.eligibleTierCount).toBe(0);
      expect(summary.overallEligibilityRate).toBe(0);
      expect(summary.highestUnlockedTier).toBeNull();
      expect(summary.nextTargetTier?.id).toBe("benchmark_60");
      expect(summary.nextTargetTier?.backlogDeficit).toBe(1);
    });

    it("handles zero or NaN CGPA gracefully", () => {
      const summary = getPlacementEligibility(NaN as any, 0);
      expect(summary.cgpa).toBe(0);
      expect(summary.percentage).toBe(0);
      expect(summary.eligibleTierCount).toBe(0);
    });
  });

  describe("getReappearSessionPlan", () => {
    it("returns clean record when student has passed all subjects", () => {
      const allResults = [
        [1, "ETCS101", "Applied Mathematics-I", 25, 60, 85],
        [2, "ETCS102", "Applied Mathematics-II", 20, 50, 70],
      ];
      const plan = getReappearSessionPlan(allResults);
      expect(plan.cleanRecord).toBe(true);
      expect(plan.totalBacklogs).toBe(0);
      expect(plan.oddTermBacklogs).toHaveLength(0);
      expect(plan.evenTermBacklogs).toHaveLength(0);
      expect(plan.totalCreditsAtRisk).toBe(0);
    });

    it("correctly segregates odd semester and even semester backlogs", () => {
      const allResults = [
        [1, "ETCS101", "Applied Mathematics-I", 10, 15, 25], // Sem 1 (Odd) FAIL
        [2, "ETCS102", "Applied Mathematics-II", 20, 50, 70], // Sem 2 (Even) PASS
        [3, "ETCS201", "Data Structures", 5, 20, 25], // Sem 3 (Odd) FAIL
        [4, "ETCS202", "Database Management", 10, 10, 20], // Sem 4 (Even) FAIL
      ];
      const customCredits = { ETCS101: 4, ETCS201: 4, ETCS202: 4 };
      const plan = getReappearSessionPlan(allResults, customCredits);

      expect(plan.cleanRecord).toBe(false);
      expect(plan.totalBacklogs).toBe(3);
      expect(plan.oddTermBacklogs).toHaveLength(2); // Sem 1 & Sem 3
      expect(plan.evenTermBacklogs).toHaveLength(1); // Sem 4
      expect(plan.oddTermCredits).toBe(8);
      expect(plan.evenTermCredits).toBe(4);
      expect(plan.totalCreditsAtRisk).toBe(12);

      // Verify Session Window tags
      expect(plan.oddTermBacklogs[0].sessionWindow).toBe("Nov - Dec Winter Window");
      expect(plan.evenTermBacklogs[0].sessionWindow).toBe("May - Jun Summer Window");
    });

    it("assigns HIGH priority to Year 1 backlogs when student has advanced to Year 2+", () => {
      const allResults = [
        [1, "ETCS101", "Applied Mathematics-I", 5, 10, 15], // Sem 1 FAIL
        [3, "ETCS201", "Data Structures", 25, 60, 85], // Sem 3 PASS
      ];
      const plan = getReappearSessionPlan(allResults);
      expect(plan.oddTermBacklogs[0].priority).toBe("HIGH");
      expect(plan.oddTermBacklogs[0].priorityReason).toContain("First Year Backlog");
    });
  });

  describe("getDivisionClassification", () => {
    it("returns Exemplary Performance for CGPA 10.0 with 0 backlogs", () => {
      const result = getDivisionClassification(10.0, 0);
      expect(result.division).toBe("Exemplary Performance");
      expect(result.divisionCode).toBe("EXEMPLARY");
      expect(result.isPass).toBe(true);
      expect(result.progressPercent).toBe(100);
    });

    it("returns First Division with Distinction for CGPA >= 7.5 with 0 backlogs", () => {
      const result = getDivisionClassification(8.2, 0);
      expect(result.division).toBe("First Division with Distinction");
      expect(result.divisionCode).toBe("DISTINCTION");
      expect(result.isPass).toBe(true);
    });

    it("downgrades from Distinction to First Division if CGPA >= 7.5 but has active backlogs", () => {
      const result = getDivisionClassification(8.5, 1);
      expect(result.division).toBe("First Division");
      expect(result.divisionCode).toBe("FIRST");
      expect(result.nextTierMessage).toContain("Clear active backlogs");
    });

    it("returns First Division for CGPA 6.50 - 7.49", () => {
      const result = getDivisionClassification(6.8, 0);
      expect(result.division).toBe("First Division");
      expect(result.divisionCode).toBe("FIRST");
      expect(result.isPass).toBe(true);
    });

    it("returns Second Division for CGPA 5.00 - 6.49", () => {
      const result = getDivisionClassification(5.5, 0);
      expect(result.division).toBe("Second Division");
      expect(result.divisionCode).toBe("SECOND");
      expect(result.isPass).toBe(true);
    });

    it("returns Third Division for CGPA 4.00 - 4.99", () => {
      const result = getDivisionClassification(4.5, 0);
      expect(result.division).toBe("Third Division");
      expect(result.divisionCode).toBe("THIRD");
      expect(result.isPass).toBe(true);
    });

    it("returns Unqualified for CGPA < 4.00", () => {
      const result = getDivisionClassification(3.2, 0);
      expect(result.division).toContain("Unqualified");
      expect(result.divisionCode).toBe("UNQUALIFIED");
      expect(result.isPass).toBe(false);
    });
  });
});