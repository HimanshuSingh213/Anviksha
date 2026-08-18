import { describe, it, expect } from "vitest";
import { getGradeAndPoints, getGradeThemeClasses, getDefaultCredit, getAcademicPromotionStatus } from "@/helpers/grade-system";

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
  });
});