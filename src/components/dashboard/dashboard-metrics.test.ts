import { describe, it, expect } from "vitest";
import { analyzeResult } from "@/lib/academic/academic-engine";
import { ALL, getDashboardMetrics, getSemesterTabs } from "./dashboard-metrics";

// Semester 1 cleared, semester 2 has one failed paper and one absent paper.
const RESULT = {
  stprofile: {
    nrollno: "00116449825",
    stname: "SAMPLE STUDENT",
    byoa: 2025,
    yoa: 2025,
    prgcode: "498",
    prgname: "BACHELOR OF TECHNOLOGY (COMPUTER SCIENCE AND ENGINEERING - DATA SCIENCE)",
    icode: "164",
    iname: "UNIVERSITY SCHOOL OF INFORMATION, COMMUNICATION & TECHNOLOGY",
  },
  stresult: [
    [1, "ICT101", "PROGRAMMING FOR PROBLEM SOLVING", "33", "35", "68", "08", "12,2025", "2026-02-03"],
    [1, "ICT151", "PROGRAMMING FOR PROBLEM SOLVING LAB", "35", "51", "86", "08", "12,2025", "2026-02-03"],
    [2, "ICT104", "DATA STRUCTURES & ALGORITHMS", "18", "8", "26", "09", "05,2026", "2026-07-14"],
    [2, "ICT110", "DISCRETE STRUCTURES", "0", "0", "ABS", "09", "05,2026", "2026-07-14"],
  ],
};

const engine = analyzeResult(RESULT);

describe("getSemesterTabs", () => {
  it("lists All plus one roman-numeral tab per semester", () => {
    expect(getSemesterTabs(engine.subjectResults)).toEqual([
      { label: "All", value: ALL },
      { label: "I", value: "1" },
      { label: "II", value: "2" },
    ]);
  });

  it("falls back to only All when there are no subjects", () => {
    expect(getSemesterTabs([])).toEqual([{ label: "All", value: ALL }]);
  });
});

describe("getDashboardMetrics", () => {
  it("All tab covers every subject and both backlogs", () => {
    const m = getDashboardMetrics(engine, ALL);
    expect(m.subjects).toHaveLength(4);
    expect(m.backlogs.map((s) => s.rawCode)).toEqual(["ICT104", "ICT110"]);
    expect(m.scope).toBe("All semesters");
    expect(m.gpa.label).toBe("Overall CGPA");
    expect(m.percent.note).toBe("CGPA × 10 (Ordinance 11)");
  });

  it("credits count only cleared subjects as earned", () => {
    const m = getDashboardMetrics(engine, ALL);
    expect(m.credits.hasCredits).toBe(true);
    expect(m.credits.earned).toBe(4);
    expect(m.credits.offered).toBe(10);
  });

  it("a semester tab narrows rows, labels and credits to that semester", () => {
    const m = getDashboardMetrics(engine, "1");
    expect(m.subjects.map((s) => s.rawCode)).toEqual(["ICT101", "ICT151"]);
    expect(m.backlogs).toHaveLength(0);
    expect(m.scope).toBe("Semester 1");
    expect(m.gpa.label).toBe("Sem 1 SGPA");
    expect(m.gpa.display).toBe("8.25");
    expect(m.credits.note).toBe("Semester 1 credits");
  });

  it("semester percentage is SGPA x 10 under Ordinance 11", () => {
    const m = getDashboardMetrics(engine, "1");
    expect(m.percent.display).toBe("82.50%");
    expect(m.percent.label).toBe("Sem 1 Equivalent %");
  });

  it("marks total uses cleared subjects only, with 100 as the default maximum", () => {
    const all = getDashboardMetrics(engine, ALL);
    expect(all.marks).toEqual({ obtained: 154, max: 400 });

    const sem2 = getDashboardMetrics(engine, "2");
    expect(sem2.marks).toEqual({ obtained: 0, max: 200 });
  });

  // Same profile, but the failed ICT104 paper was later cleared in a reappear.
  // ExamWeb keeps both rows on the marksheet: the old back and the new pass.
  const REAPPEAR_CLEARED = {
    stprofile: RESULT.stprofile,
    stresult: [
      [1, "ICT101", "PROGRAMMING FOR PROBLEM SOLVING", "33", "35", "68", "08", "12,2025", "2026-02-03"],
      [1, "ICT151", "PROGRAMMING FOR PROBLEM SOLVING LAB", "35", "51", "86", "08", "12,2025", "2026-02-03"],
      [2, "ICT104", "DATA STRUCTURES & ALGORITHMS", "18", "8", "26", "09", "05,2026", "2026-07-14"],
      [2, "ICT104", "DATA STRUCTURES & ALGORITHMS", "22", "44", "66", "08", "12,2026", "2027-02-03"],
      [2, "ICT110", "DISCRETE STRUCTURES", "0", "0", "ABS", "09", "05,2026", "2026-07-14"],
    ],
  };

  it("a cleared reappear replaces its own back row, so backlogs list only untouched subjects", () => {
    const mergedEngine = analyzeResult(REAPPEAR_CLEARED);
    const m = getDashboardMetrics(mergedEngine, ALL);

    // Five marksheet rows → four subject rows: ICT104 collapsed into itself.
    expect(m.subjects.map((s) => s.rawCode)).toEqual(["ICT101", "ICT151", "ICT104", "ICT110"]);
    expect(m.backlogs.map((s) => s.rawCode)).toEqual(["ICT110"]);
  });
});
