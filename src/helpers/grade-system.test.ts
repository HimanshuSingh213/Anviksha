import { describe, it, expect } from "vitest";
import {
  getGradeAndPoints,
  getGradeThemeClasses,
  getDefaultCredit,
  getFallbackCredit,
  getResultState,
  getAcademicPromotionStatus,
  getPlacementEligibility,
  getReappearSessionPlan,
  getDivisionClassification,
} from "@/helpers/grade-system";

describe("grade-system.ts - GGSIPU Academic Rules & Calculation Engine", () => {
  describe("getResultState", () => {
    it("returns CLEARED for status '08'", () => {
      expect(getResultState("08", 68)).toBe("CLEARED");
      expect(getResultState("08", 40)).toBe("CLEARED");
      expect(getResultState("08", "54")).toBe("CLEARED");
    });

    it("returns ABSENT for status '09' with total 'ABS'", () => {
      expect(getResultState("09", "ABS")).toBe("ABSENT");
      expect(getResultState("09", "abs")).toBe("ABSENT");
    });

    it("returns DETAINED for status '09' with total 'DET'", () => {
      expect(getResultState("09", "DET")).toBe("DETAINED");
      expect(getResultState("09", "det")).toBe("DETAINED");
    });

    it("returns BACK for status '09' with numeric total", () => {
      expect(getResultState("09", 39)).toBe("BACK");
      expect(getResultState("09", "22")).toBe("BACK");
      expect(getResultState("09", 0)).toBe("BACK");
    });

    it("handles fallback when status code is missing or undefined", () => {
      expect(getResultState(undefined, 75)).toBe("CLEARED");
      expect(getResultState(undefined, 35)).toBe("BACK");
      expect(getResultState(undefined, "ABS")).toBe("ABSENT");
      expect(getResultState(undefined, "DET")).toBe("DETAINED");
    });
  });

  describe("getGradeAndPoints", () => {
    it("returns O grade for 90-100 marks", () => {
      expect(getGradeAndPoints(90)).toEqual({ grade: "O", points: 10, pass: true, isNumeric: true });
      expect(getGradeAndPoints(95)).toEqual({ grade: "O", points: 10, pass: true, isNumeric: true });
      expect(getGradeAndPoints(100)).toEqual({ grade: "O", points: 10, pass: true, isNumeric: true });
    });

    it("returns A+ grade for 75-89 marks", () => {
      expect(getGradeAndPoints(75)).toEqual({ grade: "A+", points: 9, pass: true, isNumeric: true });
      expect(getGradeAndPoints(80)).toEqual({ grade: "A+", points: 9, pass: true, isNumeric: true });
      expect(getGradeAndPoints(89)).toEqual({ grade: "A+", points: 9, pass: true, isNumeric: true });
    });

    it("returns A grade for 65-74 marks", () => {
      expect(getGradeAndPoints(65)).toEqual({ grade: "A", points: 8, pass: true, isNumeric: true });
      expect(getGradeAndPoints(70)).toEqual({ grade: "A", points: 8, pass: true, isNumeric: true });
      expect(getGradeAndPoints(74)).toEqual({ grade: "A", points: 8, pass: true, isNumeric: true });
    });

    it("returns B+ grade for 55-64 marks", () => {
      expect(getGradeAndPoints(55)).toEqual({ grade: "B+", points: 7, pass: true, isNumeric: true });
      expect(getGradeAndPoints(60)).toEqual({ grade: "B+", points: 7, pass: true, isNumeric: true });
      expect(getGradeAndPoints(64)).toEqual({ grade: "B+", points: 7, pass: true, isNumeric: true });
    });

    it("returns B grade for 50-54 marks", () => {
      expect(getGradeAndPoints(50)).toEqual({ grade: "B", points: 6, pass: true, isNumeric: true });
      expect(getGradeAndPoints(54)).toEqual({ grade: "B", points: 6, pass: true, isNumeric: true });
    });

    it("returns C grade for 45-49 marks", () => {
      expect(getGradeAndPoints(45)).toEqual({ grade: "C", points: 5, pass: true, isNumeric: true });
      expect(getGradeAndPoints(49)).toEqual({ grade: "C", points: 5, pass: true, isNumeric: true });
    });

    it("returns P grade for 40-44 marks (passing)", () => {
      expect(getGradeAndPoints(40)).toEqual({ grade: "P", points: 4, pass: true, isNumeric: true });
      expect(getGradeAndPoints(44)).toEqual({ grade: "P", points: 4, pass: true, isNumeric: true });
    });

    it("returns F grade for below 40 marks (fail)", () => {
      expect(getGradeAndPoints(39)).toEqual({ grade: "F", points: 0, pass: false, isNumeric: true });
      expect(getGradeAndPoints(0)).toEqual({ grade: "F", points: 0, pass: false, isNumeric: true });
      expect(getGradeAndPoints(-5)).toEqual({ grade: "F", points: 0, pass: false, isNumeric: true });
    });

    it("handles ABS and DET without turning them into numeric zero", () => {
      expect(getGradeAndPoints("ABS")).toEqual({ grade: "ABS", points: 0, pass: false, isNumeric: false });
      expect(getGradeAndPoints("DET")).toEqual({ grade: "DET", points: 0, pass: false, isNumeric: false });
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

    it("returns neutral theme for ABS and DET", () => {
      expect(getGradeThemeClasses("ABS")).toContain("bg-surface-deep");
      expect(getGradeThemeClasses("DET")).toContain("bg-surface-deep");
    });

    it("returns fail theme for F and other failed grades", () => {
      expect(getGradeThemeClasses("F")).toContain("bg-grade-fail-surface");
    });
  });

  describe("getFallbackCredit / getDefaultCredit", () => {
    it("returns 1 credit for LAB / PRACTICAL / STUDIO subjects", () => {
      expect(getFallbackCredit("PHYSICS LAB")).toBe(1);
      expect(getFallbackCredit("CHEMISTRY LABORATORY")).toBe(1);
      expect(getFallbackCredit("WORKSHOP PRACTICAL")).toBe(1);
      expect(getFallbackCredit("DESIGN STUDIO")).toBe(1);
      expect(getDefaultCredit("PHYSICS LAB")).toBe(1);
    });

    it("returns 3 credits for theory subjects", () => {
      expect(getFallbackCredit("DATA STRUCTURES")).toBe(3);
      expect(getFallbackCredit("MATHEMATICS")).toBe(3);
      expect(getFallbackCredit("COMPUTER NETWORKS")).toBe(3);
      expect(getDefaultCredit("DATA STRUCTURES")).toBe(3);
    });

    it("handles empty/null subject titles safely", () => {
      expect(getFallbackCredit("")).toBe(3);
      expect(getFallbackCredit(null as any)).toBe(3);
      expect(getFallbackCredit(undefined as any)).toBe(3);
    });
  });

  describe("getAcademicPromotionStatus", () => {
    it("returns PROMOTED when student clears >= 50% credits in both semesters of a year", () => {
      const mockResults = [
        [1, "ETCS101", "Applied Maths", "20", "50", "70", "08"],
        [1, "ETCS102", "Applied Physics", "20", "50", "70", "08"],
        [2, "ETCS103", "Data Structures", "20", "50", "70", "08"],
        [2, "ETCS104", "Digital Electronics", "20", "50", "70", "08"],
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
        [1, "ETCS101", "Applied Maths", "10", "20", "30", "09"],
        [1, "ETCS102", "Applied Physics", "10", "20", "30", "09"],
        [2, "ETCS103", "Data Structures", "20", "50", "70", "08"],
        [2, "ETCS104", "Digital Electronics", "10", "20", "30", "09"],
      ];

      const status = getAcademicPromotionStatus(mockResults);
      expect(status.years[0].status).toBe("YEAR_BACK_RISK");
      expect(status.years[0].earnedCredits).toBe(3);
      expect(status.years[0].totalCredits).toBe(12);
      expect(status.years[0].percentage).toBe(25);
      expect(status.hasDetentionRisk).toBe(true);
      expect(status.years[0].creditsDeficit).toBe(3);
    });

    it("returns IN_PROGRESS when only odd semester is completed", () => {
      const mockResults = [
        [1, "ETCS101", "Applied Maths", "20", "50", "70", "08"],
        [1, "ETCS102", "Applied Physics", "20", "50", "70", "08"],
      ];

      const status = getAcademicPromotionStatus(mockResults);
      expect(status.years[0].status).toBe("IN_PROGRESS");
      expect(status.years[0].hasOddSem).toBe(true);
      expect(status.years[0].hasEvenSem).toBe(false);
    });

    it("returns UPCOMING for future academic years", () => {
      const mockResults = [
        [1, "ETCS101", "Applied Maths", "20", "50", "70", "08"],
      ];

      const status = getAcademicPromotionStatus(mockResults);
      expect(status.years[1].status).toBe("UPCOMING");
      expect(status.years[2].status).toBe("UPCOMING");
      expect(status.years[3].status).toBe("UPCOMING");
    });
  });

  describe("getPlacementEligibility", () => {
    it("unlocks all 4 benchmark tiers for student with CGPA >= 7.5 and 0 active backlogs", () => {
      const summary = getPlacementEligibility(8.2, 0);
      expect(summary.eligibleTierCount).toBe(4);
      expect(summary.totalTierCount).toBe(4);
      expect(summary.overallEligibilityRate).toBe(100);
      expect(summary.highestUnlockedTier).toBe("75%+ Premium Tier Benchmark");
      expect(summary.nextTargetTier).toBeNull();
      expect(summary.percentage).toBe(82.0);
    });

    it("restricts tier eligibility when student has CGPA = 6.8 and 0 backlogs", () => {
      const summary = getPlacementEligibility(6.8, 0);
      expect(summary.eligibleTierCount).toBe(2);
      expect(summary.overallEligibilityRate).toBe(50);
      expect(summary.highestUnlockedTier).toBe("65% Consulting & IT Benchmark");
      expect(summary.nextTargetTier?.id).toBe("benchmark_70");
      expect(summary.nextTargetTier?.cgpaDeficit).toBe(0.2);
    });

    it("blocks all tiers if student has active backlogs even with high CGPA", () => {
      const summary = getPlacementEligibility(8.5, 1);
      expect(summary.eligibleTierCount).toBe(0);
      expect(summary.overallEligibilityRate).toBe(0);
      expect(summary.highestUnlockedTier).toBeNull();
      expect(summary.nextTargetTier?.id).toBe("benchmark_60");
      expect(summary.nextTargetTier?.backlogDeficit).toBe(1);
    });
  });

  describe("getReappearSessionPlan", () => {
    it("returns clean record when student has passed all subjects", () => {
      const allResults = [
        [1, "ETCS101", "Applied Mathematics-I", "25", "60", "85", "08"],
        [2, "ETCS102", "Applied Mathematics-II", "20", "50", "70", "08"],
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
        [1, "ETCS101", "Applied Mathematics-I", "10", "15", "25", "09"],
        [2, "ETCS102", "Applied Mathematics-II", "20", "50", "70", "08"],
        [3, "ETCS201", "Data Structures", "5", "20", "25", "09"],
        [4, "ETCS202", "Database Management", "10", "10", "20", "09"],
      ];
      const customCredits = { ETCS101: 4, ETCS201: 4, ETCS202: 4 };
      const plan = getReappearSessionPlan(allResults, customCredits);

      expect(plan.cleanRecord).toBe(false);
      expect(plan.totalBacklogs).toBe(3);
      expect(plan.oddTermBacklogs).toHaveLength(2);
      expect(plan.evenTermBacklogs).toHaveLength(1);
      expect(plan.oddTermCredits).toBe(8);
      expect(plan.evenTermCredits).toBe(4);
      expect(plan.totalCreditsAtRisk).toBe(12);
    });

    it("handles ABS and DET in reappear session planner", () => {
      const allResults = [
        [1, "ETCS101", "Maths", "10", "ABS", "ABS", "09"],
        [2, "ETCS102", "Physics Lab", "DET", "DET", "DET", "09"],
      ];
      const plan = getReappearSessionPlan(allResults);
      expect(plan.totalBacklogs).toBe(2);
      expect(plan.oddTermBacklogs[0].resultState).toBe("ABSENT");
      expect(plan.evenTermBacklogs[0].resultState).toBe("DETAINED");
    });
  });

  describe("getDivisionClassification (Ordinance 11)", () => {
    it("returns First Division for CGPA 10.0 with undetermined attempt history", () => {
      const result = getDivisionClassification(10.0, 0);
      expect(result.division).toContain("First Division");
      expect(result.divisionCode).toBe("FIRST");
      expect(result.exemplaryStatus).toBe("UNDETERMINED");
      expect(result.isPass).toBe(true);
      expect(result.progressPercent).toBe(100);
    });

    it("returns Exemplary Performance for CGPA 10.0 when 1st attempt & no break are verified", () => {
      const result = getDivisionClassification(10.0, 0, {
        hasPassedAllFirstAttempt: true,
        hasAcademicBreak: false,
      });
      expect(result.division).toBe("Exemplary Performance");
      expect(result.divisionCode).toBe("EXEMPLARY");
      expect(result.exemplaryStatus).toBe("ELIGIBLE");
      expect(result.isPass).toBe(true);
    });

    it("returns First Division for CGPA >= 6.50", () => {
      const result = getDivisionClassification(6.8, 0);
      expect(result.division).toBe("First Division");
      expect(result.divisionCode).toBe("FIRST");
      expect(result.isPass).toBe(true);
    });

    it("returns First Division for CGPA 7.50+ (without artificial distinction tier)", () => {
      const result = getDivisionClassification(8.2, 0);
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