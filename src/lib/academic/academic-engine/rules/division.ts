import { findOrdinance, type OrdinanceEntry } from "../../academic-db";
import type { DivisionClassification, DivisionTier, Metric } from "@/types/result";

/**
 * Derives the division tier bar shape from the ordinance's declared bands, converting the
 * resolved band's own scale into ordered segments for the UI. Thresholds are never invented
 * here; they always come from the academic database.
 *
 * @param ordinance - The governing OrdinanceEntry, or null
 * @returns The active scale, the matched score, the scale ceiling, and ordered tier segments
 */
export function determineDivisionPresentation(
  ordinance: OrdinanceEntry | null,
  percentage: Metric<number | null>,
  cgpa: Metric<number | null>
): {
  scale: "PERCENTAGE" | "CGPA" | "CPI" | "NONE";
  score: number | null;
  max: number | null;
  tiers: DivisionTier[] | null;
} {
  const none = { scale: "NONE" as const, score: null, max: null, tiers: null };

  if (ordinance?.rules.divisionFromCpi) {
    const bands = ordinance.rules.divisionFromCpi.bands;
    const floor = bands.reduce((min, b) => Math.min(min, b.minimumCGPA), Infinity);
    const tiers: DivisionTier[] = bands.map((b) => ({
      division: b.division,
      min: b.minimumCGPA,
      max: b.maximumCGPA,
      isFail: false,
      note: b.note,
    }));
    if (Number.isFinite(floor) && floor > 0) {
      tiers.unshift({ division: null, min: 0, max: floor, isFail: true });
    }
    return { scale: "CPI", score: cgpa.value, max: 10, tiers };
  }

  if (ordinance?.rules.divisionFromPercentage) {
    const bands = ordinance.rules.divisionFromPercentage.bands;
    const floor = bands.reduce((min, b) => Math.min(min, b.minimumPercent), Infinity);
    const tiers: DivisionTier[] = bands.map((b: any) => ({
      division: b.division,
      min: b.minimumPercent,
      max:
        b.maximumPercent === undefined || b.maximumPercent === null
          ? null
          : b.maximumPercent,
      isFail: false,
      note: b.note,
    }));
    if (Number.isFinite(floor) && floor > 0) {
      tiers.unshift({ division: null, min: 0, max: floor, isFail: true });
    }
    return { scale: "PERCENTAGE", score: percentage.value, max: 100, tiers };
  }

  if (ordinance?.rules.divisionFromCGPA) {
    const bands = ordinance.rules.divisionFromCGPA.bands;
    const floor = bands.reduce((min, b) => Math.min(min, b.minimumCGPA), Infinity);
    const tiers: DivisionTier[] = bands.map((b) => ({
      division: b.division,
      min: b.minimumCGPA,
      max: b.maximumCGPA,
      isFail: false,
      note: b.note,
    }));
    if (Number.isFinite(floor) && floor > 0) {
      tiers.unshift({ division: null, min: 0, max: floor, isFail: true });
    }
    return { scale: "CGPA", score: cgpa.value, max: 10, tiers };
  }

  return none;
}

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

  // Bands come from the database; a missing ordinance is reported, not guessed.
  const ordinance = findOrdinance("ORD_11");
  const bands = ordinance?.rules.divisionFromCGPA?.bands;
  if (!bands) {
    return {
      division: "Unqualified for Degree",
      divisionCode: "UNQUALIFIED",
      minCgpa: 0,
      nextTierMessage: "Ordinance 11 division bands are unavailable.",
      progressPercent: 0,
      isPass: false,
      exemplaryStatus: "UNDETERMINED",
    };
  }

  const matched = bands.find(
    (b) => validCgpa >= b.minimumCGPA && (b.maximumCGPA === null || validCgpa <= b.maximumCGPA)
  );

  const isPass = matched !== undefined;
  const division = matched?.division ?? "Unqualified for Degree";
  const divisionCode = (isPass ? (matched?.division as string) : "UNQUALIFIED")
    .toUpperCase()
    .includes("EXEMPLARY")
    ? "EXEMPLARY"
    : isPass
      ? ((matched?.division as string).toUpperCase().includes("THIRD")
          ? "THIRD"
          : (matched?.division as string).toUpperCase().includes("SECOND")
            ? "SECOND"
            : "FIRST")
      : "UNQUALIFIED";

  // Exemplary under Ordinance 11 additionally requires a clean first-attempt record.
  const exemplaryBlocked = validCgpa >= 10.0 && validBacklogs > 0;
  const exemplaryStatus: DivisionClassification["exemplaryStatus"] =
    divisionCode !== "EXEMPLARY"
      ? "UNDETERMINED"
      : history?.hasPassedAllFirstAttempt === true && history?.hasAcademicBreak === false
        ? "ELIGIBLE"
        : history?.hasPassedAllFirstAttempt === false || history?.hasAcademicBreak === true
          ? "INELIGIBLE"
          : "UNDETERMINED";

  const nextBand = [...bands].reverse().find((b) => b.minimumCGPA > validCgpa);
  const nextTierMessage = nextBand
    ? `+${(nextBand.minimumCGPA - validCgpa).toFixed(2)} CGPA needed for ${nextBand.division} (${nextBand.minimumCGPA.toFixed(2)})`
    : "Maximum distinction tier achieved";

  const progressPercent = Math.min(100, Math.max(0, (validCgpa / 10) * 100));

  return {
    division: divisionCode === "EXEMPLARY" && exemplaryBlocked ? "First Division" : division,
    divisionCode: divisionCode === "EXEMPLARY" && exemplaryBlocked ? "FIRST" : divisionCode,
    minCgpa: matched?.minimumCGPA ?? 0,
    nextTierMessage:
      divisionCode === "EXEMPLARY" && exemplaryBlocked
        ? "Clear active backlogs to confirm exemplary standing"
        : nextTierMessage,
    progressPercent,
    isPass,
    exemplaryStatus,
  };
}
