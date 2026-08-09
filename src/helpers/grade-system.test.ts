import { describe, it, expect } from "vitest";
import { getGradeAndPoints, getGradeThemeClasses, getDefaultCredit } from "@/helpers/grade-system";

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
});