import type { DivisionClassification } from "../types";

/**
 * Classifies degree division standing (Exemplary Performance, First, Second, Third Division)
 * based on CGPA, backlog history, and first-attempt clearance requirements under Ordinance 11.
 *
 * @param cgpa - Cumulative Grade Point Average (0-10)
 * @param backlogsCount - Number of active backlogs (defaults to 0)
 * @param history - First-attempt history and academic break flags
 * @returns Structured DivisionClassification with division title, progress, and eligibility notes
 */
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
      nextTierMessage =
        "CGPA 10.00 meets First Division (Exemplary requires 1st attempt history verification)";
    }
    isPass = true;
  } else if (validCgpa >= 6.5) {
    division = "First Division";
    divisionCode = "FIRST";
    minCgpa = 6.5;
    const gap = (10.0 - validCgpa).toFixed(2);
    nextTierMessage =
      validBacklogs > 0
        ? "Clear active backlogs for clean standing"
        : `+${gap} CGPA to reach 10.00 scale max`;
    isPass = true;
  } else if (validCgpa >= 5.0) {
    division = "Second Division";
    divisionCode = "SECOND";
    minCgpa = 5.0;
    const gap = (6.5 - validCgpa).toFixed(2);
    nextTierMessage = `+${gap} CGPA needed for First Division (6.50)`;
    isPass = true;
  } else if (validCgpa >= 4.0) {
    division = "Third Division";
    divisionCode = "THIRD";
    minCgpa = 4.0;
    const gap = (5.0 - validCgpa).toFixed(2);
    nextTierMessage = `+${gap} CGPA needed for Second Division (5.00)`;
    isPass = true;
  } else {
    division = "Unqualified for Degree (< 4.00)";
    divisionCode = "UNQUALIFIED";
    minCgpa = 0.0;
    const gap = (4.0 - validCgpa).toFixed(2);
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
