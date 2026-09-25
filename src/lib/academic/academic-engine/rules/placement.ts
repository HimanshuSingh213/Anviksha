import type {
  PlacementEligibilitySummary,
  PlacementTier,
} from "@/types/result";

export const PLACEMENT_TIERS_CONFIG: Array<
  Omit<PlacementTier, "isEligible" | "cgpaDeficit" | "backlogDeficit" | "statusReason">
> = [
  {
    id: "benchmark_60",
    name: "60% Base Benchmark",
    benchmarkLabel: "≥ 6.00 CGPA (60%)",
    minCgpa: 6.0,
    minPercentage: 60.0,
    maxActiveBacklogs: 0,
    description: "Common baseline threshold for corporate drives & mass recruitment eligibility.",
    exampleCompanies: ["TCS", "Infosys", "Wipro", "Cognizant", "Capgemini", "Tech Mahindra"],
  },
  {
    id: "benchmark_65",
    name: "65% Consulting & IT Benchmark",
    benchmarkLabel: "≥ 6.50 CGPA (65%)",
    minCgpa: 6.5,
    minPercentage: 65.0,
    maxActiveBacklogs: 0,
    description: "Standard threshold for consulting, financial technology, and IT analyst roles.",
    exampleCompanies: ["Deloitte", "Accenture", "IBM", "EY", "HCLTech", "Nagarro"],
  },
  {
    id: "benchmark_70",
    name: "70% Product & Core Benchmark",
    benchmarkLabel: "≥ 7.00 CGPA (70%)",
    minCgpa: 7.0,
    minPercentage: 70.0,
    maxActiveBacklogs: 0,
    description: "Standard baseline for core engineering, product divisions, and R&D roles.",
    exampleCompanies: ["Amazon", "Microsoft", "Cisco", "Samsung", "Oracle", "Qualcomm"],
  },
  {
    id: "benchmark_75",
    name: "75%+ Premium Tier Benchmark",
    benchmarkLabel: "≥ 7.50 CGPA (75%)",
    minCgpa: 7.5,
    minPercentage: 75.0,
    maxActiveBacklogs: 0,
    description:
      "Benchmark for competitive quantitative, specialized research, and high-tier technical drives.",
    exampleCompanies: ["Google", "Tower Research", "D.E. Shaw", "Goldman Sachs", "Sprinklr", "Atlassian"],
  },
];

/**
 * Evaluates placement drive eligibility across corporate recruitment tiers (60% Mass, 65% Consulting, 70% Product, 75%+ Premium)
 * based on student's current CGPA and active backlogs.
 *
 * @param cgpa - Cumulative Grade Point Average
 * @param activeBacklogs - Number of active/uncleared backlogs
 * @returns PlacementEligibilitySummary detailing tier eligibility, target benchmarks, and deficits
 */
export function getPlacementEligibility(
  cgpa: number,
  activeBacklogs: number
): PlacementEligibilitySummary {
  const validCgpa = isNaN(cgpa) ? 0 : Math.max(0, cgpa);
  const validBacklogs = isNaN(activeBacklogs) ? 0 : Math.max(0, activeBacklogs);
  const percentage = Number((validCgpa * 10).toFixed(2));

  const evaluatedTiers: PlacementTier[] = PLACEMENT_TIERS_CONFIG.map((tier) => {
    const cgpaMet = validCgpa >= tier.minCgpa;
    const backlogMet = validBacklogs <= tier.maxActiveBacklogs;
    const isEligible = cgpaMet && backlogMet;

    const cgpaDeficit = cgpaMet ? 0 : Number((tier.minCgpa - validCgpa).toFixed(2));
    const backlogDeficit = backlogMet ? 0 : validBacklogs - tier.maxActiveBacklogs;

    let statusReason = "Meets benchmark requirements (0 active backlogs)";
    if (!cgpaMet && !backlogMet) {
      statusReason = `Requires +${cgpaDeficit} CGPA & clearing ${backlogDeficit} backlog(s)`;
    } else if (!cgpaMet) {
      statusReason = `Requires +${cgpaDeficit} CGPA to reach benchmark`;
    } else if (!backlogMet) {
      statusReason = `Requires clearing ${backlogDeficit} active backlog(s)`;
    }

    return {
      ...tier,
      isEligible,
      cgpaDeficit,
      backlogDeficit,
      statusReason,
    };
  });

  const eligibleTiers = evaluatedTiers.filter((t) => t.isEligible);
  const eligibleTierCount = eligibleTiers.length;
  const totalTierCount = evaluatedTiers.length;
  const overallEligibilityRate = Number(((eligibleTierCount / totalTierCount) * 100).toFixed(0));

  const highestUnlockedTier = eligibleTiers.length > 0 ? eligibleTiers[eligibleTiers.length - 1].name : null;
  const nextTargetTier = evaluatedTiers.find((t) => !t.isEligible) || null;

  return {
    cgpa: validCgpa,
    percentage,
    activeBacklogs: validBacklogs,
    eligibleTierCount,
    totalTierCount,
    overallEligibilityRate,
    highestUnlockedTier,
    nextTargetTier,
    tiers: evaluatedTiers,
  };
}
