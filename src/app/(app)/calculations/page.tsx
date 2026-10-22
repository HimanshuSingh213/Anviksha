import Link from "next/link";
import { Metadata } from "next";
import { HelpCircle } from "lucide-react";
import Chip, { type ChipTone } from "@/components/analytics/Chip";
import GuideSection from "@/components/calculations/GuideSection";
import GuideNav from "@/components/calculations/GuideNav";
import GradeTable from "@/components/calculations/GradeTable";
import { Bullet, Bullets, Formula, Label, Note } from "@/components/calculations/GuideParts";

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://anviksha-result.vercel.app";

export const metadata: Metadata = {
  title: "GGSIPU SGPA/CGPA Calculator Formula - Ordinance 11 Grading Explained",
  description:
    "How GGSIPU SGPA and CGPA are calculated under Ordinance 11: grade points O to F, the SGPA = Σ(Ci×Gi)/ΣCi formula, CGPA × 10 percentage, 50% annual credit promotion rule, divisions, and placement cutoffs.",
  alternates: {
    canonical: `${appUrl}/calculations`,
  },
  openGraph: {
    title: "GGSIPU SGPA/CGPA Calculator Formula - Ordinance 11 Grading Explained",
    description:
      "How GGSIPU SGPA and CGPA are calculated under Ordinance 11: grade points O to F, the SGPA = Σ(Ci×Gi)/ΣCi formula, CGPA × 10 percentage, 50% annual credit promotion rule, divisions, and placement cutoffs.",
    url: `${appUrl}/calculations`,
    type: "article",
    siteName: "Anviksha",
    images: [{ url: "/favicon.png", width: 512, height: 512, alt: "Anviksha GGSIPU Calculation Guide" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "GGSIPU SGPA/CGPA Calculator Formula - Ordinance 11 Grading Explained",
    description:
      "How GGSIPU SGPA and CGPA are calculated under Ordinance 11: grade points, SGPA/CGPA formulas, percentage conversion, promotion rule, and divisions.",
    images: ["/favicon.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

// The contents list (phone strip and desktop sidebar). `id` must match the id of a section below.
const NAV_ITEMS = [
  { label: "Ordinances", id: "ordinances" },
  { label: "Verification Badges", id: "verification" },
  { label: "Grades", id: "grades" },
  { label: "SGPA", id: "sgpa" },
  { label: "CGPA", id: "cgpa" },
  { label: "Equivalent %", id: "percentage" },
  { label: "Credits", id: "credits" },
  { label: "Promotion", id: "promotion" },
  { label: "Academic Break", id: "academic-break" },
  { label: "Result States", id: "result-states" },
  { label: "Divisions", id: "division" },
  { label: "Exemplary", id: "exemplary" },
  { label: "Placement Benchmarks", id: "placement" },
];

const ORDINANCES = [
  {
    programme: "B.Tech / M.Tech / MCA / BCA / BBA / MBA / B.Com / Law (semester)",
    framework: "Ordinance 11",
    system: "Semester",
    gets: "Grades, SGPA, CGPA, percentage, division, promotion",
  },
  {
    programme: "MBBS",
    framework: "Ordinance 15",
    system: "Annual",
    gets: "Marks, pass/fail, subject distinction (no SGPA or divisions by rule)",
  },
  {
    programme: "BPT / BOT",
    framework: "Ordinance 31",
    system: "Annual",
    gets: "Marks, CPI-based division, all-subjects promotion rule",
  },
  {
    programme: "BHMS / BAMS",
    framework: "Ordinance 22 / 38",
    system: "Annual",
    gets: "Percentage marks, pass/fail (no letter grades by rule)",
  },
  {
    programme: "BASLP",
    framework: "Ordinance 24",
    system: "Semester",
    gets: "Percentage-based division classification",
  },
];

const GRADE_TABLE = [
  { range: "90–100", grade: "O", points: 10, meaning: "Outstanding" },
  { range: "75–89", grade: "A+", points: 9, meaning: "Excellent" },
  { range: "65–74", grade: "A", points: 8, meaning: "Very Good" },
  { range: "55–64", grade: "B+", points: 7, meaning: "Good" },
  { range: "50–54", grade: "B", points: 6, meaning: "Above Average" },
  { range: "45–49", grade: "C", points: 5, meaning: "Average" },
  { range: "40–44", grade: "P", points: 4, meaning: "Pass (Baseline)" },
  { range: "< 40", grade: "F", points: 0, meaning: "Fail / Backlog" },
];

// The verification badges shown next to every number in the app. One source
// of truth here keeps this page in sync with the engine's actual behaviour.
// `chip` uses the same colours as the real badges in the app.
const VERIFICATION_STATES = [
  {
    badge: "VERIFIED",
    chip: "bg-positive-surface text-positive ring-positive-border",
    meaning:
      "Calculated under a verified GGSIPU ordinance rule using only official marksheet data (e.g. letter grades on a verified 10-point scheme).",
  },
  {
    badge: "RESULT DERIVED",
    chip: "bg-chart-cyan-surface text-chart-cyan ring-chart-cyan-border",
    meaning:
      "Computed directly from your official ExamWeb marks, including counts, averages, pass rates, and official result statuses.",
  },
  {
    badge: "WARNING (Estimate)",
    chip: "bg-gold-surface text-gold ring-gold-border",
    meaning:
      "The number depends on estimated or user-entered credits (official marksheets don't show credits). We show the estimate and label it, never presenting it as official.",
  },
  {
    badge: "UNAVAILABLE",
    chip: "bg-surface-elevated text-foreground-muted ring-border-strong",
    meaning:
      "We could not calculate this without guessing, so we don't. Raw marks stay fully visible.",
  },
  {
    badge: "AMBIGUOUS",
    chip: "bg-warning-surface text-warning ring-warning-border",
    meaning:
      "The programme is identified only by a generic name, so the exact statutory framework is unclear. Official rules are withheld until verified.",
  },
  {
    badge: "NOT APPLICABLE",
    chip: "bg-surface-elevated text-foreground-muted ring-border-strong",
    meaning:
      "The programme's verified ordinance does not define this metric at all (e.g. MBBS has no SGPA, CGPA, or divisions), shown as N/A rather than wrongly calculated.",
  },
];

const SGPA_EXAMPLE = [
  { subject: "Subject A (4 credits) with Grade A (8 points)", result: "= 32 quality points" },
  { subject: "Subject B (3 credits) with Grade B+ (7 points)", result: "= 21 quality points" },
  { subject: "Subject C (1 credit lab) with Grade O (10 points)", result: "= 10 quality points" },
];

const CREDIT_RULES = [
  { course: "Laboratory, Practical, or Studio courses", credits: "1 credit" },
  { course: "Project, Viva, or Dissertation courses", credits: "2 credits" },
  { course: "Theory lecture courses", credits: "3 credits" },
];

// `tone` is the colour of the label (see TONES in components/analytics/Chip.tsx)
const RESULT_STATES: { code: string; tone: ChipTone; text: string }[] = [
  { code: "CLEARED (08)", tone: "good", text: "Course passed with Grade P or above." },
  { code: "BACK (09 + Numeric)", tone: "bad", text: "Failed marks, subject eligible for re-appear." },
  { code: "ABSENT (ABS)", tone: "muted", text: "Student was absent from the examination." },
  { code: "DETAINED (DET)", tone: "bad", text: "Detained from examination due to attendance shortage." },
  { code: "CANCELLED (CAN)", tone: "bad", text: "Result cancelled by the university." },
  { code: "RESULT LATER (RL)", tone: "blue", text: "Result withheld; check back later." },
  { code: "CREDIT SECURED (CS)", tone: "good", text: "Credit already secured; excluded from GPA (no numeric marks)." },
  { code: "ALREADY PASSED (AP)", tone: "good", text: "Passed in a previous attempt; excluded from GPA." },
];

// `color` is the text colour of the first and last column, `percentColor` of the middle one
const DIVISIONS = [
  { cgpa: "10.00", percent: "100.0%", division: "Exemplary Performance*", color: "text-gold", percentColor: "text-foreground-secondary" },
  { cgpa: "6.50 – 10.00", percent: "65.0% – 100.0%", division: "First Division", color: "text-foreground", percentColor: "text-foreground-secondary" },
  { cgpa: "5.00 – 6.49", percent: "50.0% – 64.9%", division: "Second Division", color: "text-foreground", percentColor: "text-foreground-secondary" },
  { cgpa: "4.00 – 4.99", percent: "40.0% – 49.9%", division: "Third Division", color: "text-foreground", percentColor: "text-foreground-secondary" },
  { cgpa: "< 4.00", percent: "< 40.0%", division: "Unqualified for Degree", color: "text-grade-fail", percentColor: "text-grade-fail" },
];

const BENCHMARKS = [
  { name: "60% Benchmark", rule: "≥ 6.00 CGPA, 0 backlogs", text: "Baseline mass recruitment screen." },
  { name: "65% Benchmark", rule: "≥ 6.50 CGPA, 0 backlogs", text: "Standard consulting and IT analyst screen." },
  { name: "70% Benchmark", rule: "≥ 7.00 CGPA, 0 backlogs", text: "Core engineering & product teams screen." },
  { name: "75% Benchmark", rule: "≥ 7.50 CGPA, 0 backlogs", text: "High-compensation technical drives." },
];

const CALCULATIONS_JSON_LD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "TechArticle",
      "headline": "How GGSIPU SGPA, CGPA & Ordinance 11 Calculations Work",
      "description":
        "Comprehensive, mathematical guide to GGSIPU Ordinance 11 grading formulas, SGPA/CGPA credit-weighted computation, 50% annual credit promotion rules, division classification, and campus placement benchmarks.",
      "author": {
        "@type": "Person",
        "name": "Himanshu Singh",
        "url": "https://himanshusinghdangi.vercel.app",
      },
      "publisher": {
        "@type": "Person",
        "name": "Himanshu Singh",
        "url": "https://himanshusinghdangi.vercel.app",
      },
      "inLanguage": "en-IN",
      "mainEntityOfPage": `${appUrl}/calculations`,
      "about": {
        "@type": "EducationalOrganization",
        "name": "Guru Gobind Singh Indraprastha University",
        "alternateName": ["GGSIPU", "IP University"],
      },
    },
    {
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Home",
          "item": appUrl,
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Calculations Guide",
          "item": `${appUrl}/calculations`,
        },
      ],
    },
  ],
};

export default function CalculationsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(CALCULATIONS_JSON_LD) }}
      />

      <main id="main-content" className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 lg:py-12">

        {/* Title */}
        <header className="max-w-3xl">
          <Chip tone="gold">
            <HelpCircle size={12} aria-hidden="true" />
            Academic Transparency
          </Chip>
          <h1 className="mt-4 text-2xl font-semibold tracking-[-0.02em] sm:text-3xl">
            How Calculations Work in Anviksha
          </h1>
          <p className="mt-3 text-sm leading-6 text-foreground-secondary sm:text-base sm:leading-7">
            Anviksha reads your official ExamWeb marksheet and applies the verified GGSIPU ordinance rules for your programme (Ordinance 11 for semester degrees, plus separate frameworks for MBBS, BPT, and more). Every number carries a verification badge so you always know what is official and what is an estimate.
          </p>
        </header>

        {/* Contents on the left (desktop) or as a strip (phone), then the sections */}
        <div className="mt-8 lg:mt-12 lg:grid lg:grid-cols-[13rem_minmax(0,1fr)] lg:gap-12">
          <GuideNav items={NAV_ITEMS} />

          <div className="space-y-5 lg:space-y-6">

            {/* 1. Which ordinance applies */}
            <GuideSection id="ordinances" number={1} title="Which Ordinance Governs Your Programme" color="gold">
              <p>
                GGSIPU does not use one universal rule. Anviksha identifies your programme family from the official programme name and applies the correct statutory framework, keeping your raw ExamWeb programme code untouched:
              </p>

              <div className="rounded-lg border border-border bg-surface-deep px-4">
                {/* Column names (hidden on phones, where every row stacks) */}
                <div className="hidden grid-cols-[1.5fr_9.5rem_5rem_2fr] gap-x-4 border-b border-border py-2.5 text-xs font-medium text-foreground-muted md:grid">
                  <span>Programme Family</span>
                  <span>Framework</span>
                  <span>System</span>
                  <span>What You Get</span>
                </div>

                <div className="divide-y divide-border">
                  {ORDINANCES.map((row) => (
                    <div key={row.programme} className="grid gap-x-4 gap-y-2 py-4 md:grid-cols-[1.5fr_9.5rem_5rem_2fr] md:items-start">
                      <p className="font-semibold text-foreground">{row.programme}</p>
                      {/* On a phone these two sit on one line */}
                      <div className="flex items-center gap-2.5 md:contents">
                        <Chip tone="gold" className="font-mono md:justify-self-start">{row.framework}</Chip>
                        <span className="text-xs text-foreground-muted md:text-sm md:text-foreground-secondary">{row.system}</span>
                      </div>
                      <p className="text-xs leading-5 md:text-sm md:leading-6">{row.gets}</p>
                    </div>
                  ))}
                </div>
              </div>

              <Note label="Important">
                A programme whose exact name is not in our verified registry (e.g. a generic &quot;Bachelor of Arts&quot;) is handled honestly: raw marks stay fully visible, but statutory calculations are marked <span className="font-semibold text-warning">AMBIGUOUS</span> instead of being guessed. Unrecognised degree names never silently inherit Ordinance 11.
              </Note>
            </GuideSection>

            {/* 2. Verification badges */}
            <GuideSection id="verification" number={2} title="Verification Badges and Meaning" color="gold">
              <p>Every calculated number in Anviksha carries a badge telling you how much to trust it. This is the core of how the engine works:</p>

              <div className="divide-y divide-border rounded-lg border border-border bg-surface-deep px-4">
                {VERIFICATION_STATES.map((state) => (
                  <div key={state.badge} className="flex flex-col gap-2 py-4 sm:flex-row sm:gap-5">
                    <div className="sm:w-44 sm:shrink-0">
                      <span className={`inline-flex rounded-md px-2 py-0.5 font-mono text-[11px] font-bold ring-1 ring-inset ${state.chip}`}>
                        {state.badge}
                      </span>
                    </div>
                    <p className="text-xs leading-5 sm:text-sm sm:leading-6">{state.meaning}</p>
                  </div>
                ))}
              </div>
            </GuideSection>

            {/* 3. Grades & Grade Points */}
            <GuideSection id="grades" number={3} title="Grade Scale & Grade Points (Ordinance 11)" color="gold">
              <Label>What it means</Label>
              <p>Your official total marks (out of 100) are mapped to the standard GGSIPU letter grade and numerical grade point.</p>

              <GradeTable rows={GRADE_TABLE} />

              <Note label="GGSIPU Rule">
                Ordinance 11 Clause 11 specifies Grade P (Grade Point 4 / 40% aggregate) as the minimum passing grade unless the approved programme Scheme prescribes a higher requirement.
              </Note>
            </GuideSection>

            {/* 4. SGPA */}
            <GuideSection id="sgpa" number={4} title="SGPA (Semester Grade Point Average)" color="violet">
              <Label>What it means</Label>
              <p>SGPA measures your academic performance for a single semester, weighted by the credits assigned to each subject.</p>

              <Label>How Anviksha calculates it</Label>
              <Formula source="Ordinance 11, Clause 13">SGPA = Σ (Ci × Gi) / Σ Ci</Formula>

              <div className="rounded-lg border border-border bg-surface-deep p-4 font-mono text-xs">
                <p className="font-bold text-foreground">Example:</p>
                <ul className="mt-2 divide-y divide-border">
                  {SGPA_EXAMPLE.map((line) => (
                    <li key={line.subject} className="flex flex-col gap-0.5 py-2.5 sm:flex-row sm:justify-between sm:gap-4">
                      <span>{line.subject}</span>
                      <span className="tnum text-foreground">{line.result}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-1 border-t border-border pt-3.5 text-xs font-bold text-gold sm:text-sm">
                  <span className="block sm:inline">SGPA = (32 + 21 + 10) / (4 + 3 + 1)</span>
                  <span className="block sm:ml-2 sm:inline">= 63 / 8 = 7.88</span>
                </p>
              </div>

              <Note label="Important">
                SGPA is always credit-weighted. It is not a simple average of subject grade points. A failed paper (Grade F) contributes 0 grade points while still counting in the credit denominator. A course passed with a non-numeric legend (CS · Credit Secured, AP · Already Passed) carries no grade point at all, so it is excluded from the calculation rather than counted as zero.
              </Note>
            </GuideSection>

            {/* 5. CGPA */}
            <GuideSection id="cgpa" number={5} title="CGPA (Cumulative Grade Point Average)" color="teal">
              <Label>What it means</Label>
              <p>CGPA indicates your cumulative academic performance across all completed semesters.</p>

              <Label>How Anviksha calculates it</Label>
              <Formula source="Ordinance 11, Clause 13 (cumulative, rounded to 2 decimals)">CGPA = Σ (Cni × Gni) / Σ Cni</Formula>

              <Note label="Important">
                CGPA is calculated directly from all semester quality points and credits. It is not calculated by averaging individual semester SGPA numbers directly, ensuring mathematical exactness.
              </Note>
            </GuideSection>

            {/* 6. Equivalent Percentage */}
            <GuideSection id="percentage" number={6} title="Equivalent Percentage Formula" color="blue">
              <Label>What it means</Label>
              <p>GGSIPU defines an official conversion formula to convert CGPA into an equivalent percentage for job applications and higher education admissions.</p>

              <Formula source="Ordinance 11, Clause 13">Equivalent Percentage = CGPA × 10</Formula>

              <Note label="GGSIPU Rule">
                Stated in GGSIPU Ordinance 11. For example, a CGPA of 6.73 converts to exactly 67.30%. Note that this is distinct from your credit completion percentage.
              </Note>
            </GuideSection>

            {/* 7. Credits */}
            <GuideSection id="credits" number={7} title="Credits & Estimated Fallbacks" color="copper">
              <Label>How Anviksha handles credits</Label>
              <p>
                Official GGSIPU marksheets do not display per-course credits. Rather than pretending to know them, Anviksha applies a clearly-labelled estimate and tells you whenever it is used:
              </p>

              <ul className="divide-y divide-border rounded-lg border border-border bg-surface-deep">
                {CREDIT_RULES.map((rule) => (
                  <li key={rule.course} className="flex items-center justify-between gap-4 px-4 py-3">
                    <span>{rule.course}</span>
                    <span className="tnum shrink-0 text-right font-mono text-xs font-semibold text-foreground">
                      {rule.credits} <span className="font-normal text-foreground-muted">(estimated)</span>
                    </span>
                  </li>
                ))}
              </ul>

              <p>
                Because these are estimates, every SGPA, CGPA, percentage, and division computed from them carries the gold <strong className="text-gold">WARNING (Estimate)</strong> badge and is never presented as official. You can click any credit input on the dashboard to enter the exact value from your scheme/syllabus; the numbers recalculate instantly (and stay badged as user-provided estimates until scheme credits are loaded).
              </p>
            </GuideSection>

            {/* 8. Promotion */}
            <GuideSection id="promotion" number={8} title="Annual Promotion Baseline (50% Rule)" color="gold">
              <Label>What it means</Label>
              <p>Under GGSIPU Ordinance 11, a student must earn at least 50% of the total credits offered across both semesters of an academic year (e.g. Sem 1 + Sem 2) to be promoted to the next academic year without year-back detention.</p>

              <Formula>Required Credits = ceil(Total Academic Year Credits × 0.50)</Formula>

              <Note label="Important">
                This 50% rule is the verified ordinance baseline. Statutory regulatory bodies (such as AICTE, BCI, or COA) or specific programme schemes may prescribe additional promotion criteria. Anviksha shows this as a note alongside the baseline rather than inventing extra conditions. For annual programmes like BPT, promotion follows the programme&apos;s own ordinance (e.g. Ordinance 31 requires passing all subjects).
              </Note>
            </GuideSection>

            {/* 9. Academic Break */}
            <GuideSection id="academic-break" number={9} title="Academic Break Regulations" color="red">
              <Label>Ordinance 11 Rules</Label>
              <p>An academic break occurs when a student fails to meet the 50% annual promotion credit requirement or is detained due to attendance shortages.</p>
              <Bullets>
                <Bullet>A student is permitted a maximum of <strong>2 academic breaks</strong> during the entire duration of their programme.</Bullet>
                <Bullet>A backlog in an individual subject is <strong>not</strong> an academic break if the overall 50% annual credit requirement is met.</Bullet>
              </Bullets>
            </GuideSection>

            {/* 10. Result States */}
            <GuideSection id="result-states" number={10} title="Official Result States" color="neutral">
              <p>Anviksha preserves the official status returned by GGSIPU ExamWeb without altering raw results. All official legend codes are decoded and shown in plain language:</p>

              <div className="grid grid-cols-1 gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-2">
                {RESULT_STATES.map((state) => (
                  <div key={state.code} className="bg-surface-deep p-4">
                    <Chip tone={state.tone} className="font-mono">{state.code}</Chip>
                    <p className="mt-2.5 text-xs leading-5">{state.text}</p>
                  </div>
                ))}
              </div>

              <p className="text-xs leading-5 text-foreground-muted">
                An unknown or missing status code is never auto-converted into a pass or a fail; it is shown as &quot;Unknown&quot; until the official result is available.
              </p>
            </GuideSection>

            {/* 11. Division Classification */}
            <GuideSection id="division" number={11} title="Ordinance 11 Division Classification" color="gold">
              <p>The revised GGSIPU Ordinance 11 defines the following division standings based on final cumulative CGPA:</p>

              <div>
                {/* Column names (hidden on phones) */}
                <div className="hidden grid-cols-[1fr_1fr_1.4fr] gap-x-4 border-b border-border py-2.5 text-xs font-medium text-foreground-muted sm:grid">
                  <span>CGPA Range</span>
                  <span>Equivalent %</span>
                  <span>Official Division</span>
                </div>

                <div className="divide-y divide-border">
                  {DIVISIONS.map((row) => (
                    <div key={row.cgpa} className="grid grid-cols-[1fr_auto] items-center gap-x-4 py-3.5 sm:grid-cols-[1fr_1fr_1.4fr]">
                      {/* On a phone the division is on the left and the two numbers are stacked on the right */}
                      <p className={`text-sm font-semibold sm:order-3 ${row.color}`}>{row.division}</p>
                      <div className="text-right sm:contents">
                        <p className={`tnum font-mono text-xs font-semibold sm:order-1 sm:text-left sm:text-sm ${row.color}`}>{row.cgpa}</p>
                        <p className={`tnum mt-0.5 font-mono text-xs sm:order-2 sm:mt-0 sm:text-left sm:text-sm ${row.percentColor}`}>{row.percent}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <p className="text-xs leading-5 text-foreground-muted">
                *Note: Revised Ordinance 11 does not feature a generic 7.50 &quot;First Division with Distinction&quot; tier. All scores ≥ 6.50 are classified under First Division, with CGPA 10.00 reserved for Exemplary Performance.
              </p>
            </GuideSection>

            {/* 12. Exemplary Performance */}
            <GuideSection id="exemplary" number={12} title="Exemplary Performance Requirements" color="gold">
              <Label>Ordinance Requirements</Label>
              <p>To be awarded Exemplary Performance on your official degree, GGSIPU requires:</p>
              <Bullets>
                <Bullet>Final CGPA of exactly <strong>10.00</strong>.</Bullet>
                <Bullet>Every individual course passed on the <strong>first attempt</strong> (no re-appear attempts).</Bullet>
                <Bullet>No academic breaks or detentions during the programme.</Bullet>
              </Bullets>

              <Note label="Transparency Note">
                The ordinance awards Exemplary Performance only when every course was passed in the first chance with no academic break. Because a single ExamWeb marksheet does not contain first-attempt history, Anviksha shows CGPA 10.00 with that condition noted, so your official marksheet remains the final word. Also note: professional programmes have their own classification rules (MBBS and BAMS award no divisions at all; BPT classifies by CPI on a percentage scale).
              </Note>
            </GuideSection>

            {/* 13. Placement Benchmarks */}
            <GuideSection id="placement" number={13} title="Anviksha Placement Benchmarks" color="copper">
              <Label>What they mean</Label>
              <p>
                These cutoffs are application benchmarks modeled on common campus recruitment criteria in Delhi NCR engineering colleges:
              </p>

              <ul className="divide-y divide-border rounded-lg border border-border bg-surface-deep px-4">
                {BENCHMARKS.map((benchmark) => (
                  <li key={benchmark.name} className="flex flex-col gap-1.5 py-3.5 sm:flex-row sm:items-center sm:gap-5">
                    <span className="font-semibold text-foreground sm:w-32 sm:shrink-0">{benchmark.name}</span>
                    <Chip tone="copper" className="w-fit font-mono">{benchmark.rule}</Chip>
                    <span className="text-xs leading-5 sm:text-sm">{benchmark.text}</span>
                  </li>
                ))}
              </ul>

              <Note label="Disclaimer">
                These are Anviksha application benchmarks, not universal GGSIPU placement rules. Actual eligibility is governed strictly by the respective company&apos;s job description and campus recruitment notice.
              </Note>
            </GuideSection>

          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border px-4 py-8 sm:px-6">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-x-4 gap-y-2 text-center font-mono text-xs text-foreground-muted">
          <span>Anviksha · Built for GGSIPU Students · Independent & Privacy-First</span>
          <span aria-hidden="true">·</span>
          <Link href="/notices" className="transition-colors hover:text-gold">
            Live Circulars & Notices
          </Link>
          <span aria-hidden="true">·</span>
          <Link href="/" className="transition-colors hover:text-gold">
            Home
          </Link>
        </div>
      </footer>
    </div>
  );
}
