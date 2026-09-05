import Link from "next/link";
import Image from "next/image";
import { Metadata } from "next";
import {
  GraduationCap,
  BookOpen,
  Award,
  TrendingUp,
  Percent,
  CheckCircle2,
  AlertTriangle,
  Briefcase,
  Layers,
  HelpCircle,
  Bell,
  Home,
  ShieldCheck,
} from "lucide-react";

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://anviksha-result.vercel.app";

export const metadata: Metadata = {
  title: "GGSIPU SGPA/CGPA Calculator Formula — Ordinance 11 Grading Explained",
  description:
    "How GGSIPU SGPA and CGPA are calculated under Ordinance 11: grade points O to F, the SGPA = Σ(Ci×Gi)/ΣCi formula, CGPA × 10 percentage, 50% annual credit promotion rule, divisions, and placement cutoffs.",
  alternates: {
    canonical: `${appUrl}/calculations`,
  },
  openGraph: {
    title: "GGSIPU SGPA/CGPA Calculator Formula — Ordinance 11 Grading Explained",
    description:
      "How GGSIPU SGPA and CGPA are calculated under Ordinance 11: grade points O to F, the SGPA = Σ(Ci×Gi)/ΣCi formula, CGPA × 10 percentage, 50% annual credit promotion rule, divisions, and placement cutoffs.",
    url: `${appUrl}/calculations`,
    type: "article",
    siteName: "Anviksha",
    images: [{ url: "/favicon.png", width: 512, height: 512, alt: "Anviksha GGSIPU Calculation Guide" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "GGSIPU SGPA/CGPA Calculator Formula — Ordinance 11 Grading Explained",
    description:
      "How GGSIPU SGPA and CGPA are calculated under Ordinance 11: grade points, SGPA/CGPA formulas, percentage conversion, promotion rule, and divisions.",
    images: ["/favicon.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

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
const VERIFICATION_STATES = [
  {
    badge: "VERIFIED",
    style: "text-grade-excellent",
    meaning:
      "Calculated under a verified GGSIPU ordinance rule using only official marksheet data (e.g. letter grades on a verified 10-point scheme).",
  },
  {
    badge: "RESULT DERIVED",
    style: "text-chart-cyan",
    meaning:
      "Computed directly from your official ExamWeb marks — counts, averages, pass rates, and official result statuses.",
  },
  {
    badge: "WARNING (Estimate)",
    style: "text-gold",
    meaning:
      "The number depends on estimated or user-entered credits (official marksheets don't show credits). We show the estimate and label it — never present it as official.",
  },
  {
    badge: "UNAVAILABLE",
    style: "text-foreground-muted",
    meaning:
      "We could not calculate this without guessing, so we don't. Raw marks stay fully visible.",
  },
  {
    badge: "AMBIGUOUS",
    style: "text-gold",
    meaning:
      "The programme is identified only by a generic name, so the exact statutory framework is unclear. Official rules are withheld until verified.",
  },
  {
    badge: "NOT APPLICABLE",
    style: "text-foreground-muted",
    meaning:
      "The programme's verified ordinance does not define this metric at all (e.g. MBBS has no SGPA, CGPA, or divisions) — shown as N/A rather than wrongly calculated.",
  },
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
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-border-strong bg-surface-deep/90 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-foreground-secondary hover:text-foreground transition-colors group"
          >
            <Image
              src="/navbar-logo.png"
              alt="Anviksha"
              width={140}
              height={38}
              className="object-contain h-7 w-auto transition-opacity group-hover:opacity-85"
            />
          </Link>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/notices"
              title="Live GGSIPU Result Circulars & Date-Sheets"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-border-strong bg-surface text-xs font-mono font-semibold text-foreground-secondary hover:text-gold hover:border-gold-border transition-colors shadow-xs"
            >
              <Bell size={13} className="text-gold" />
              <span className="hidden sm:inline">Exam Circulars</span>
            </Link>

            <Link
              href="/"
              title="Go to Homepage"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-border-strong bg-surface text-xs font-mono font-semibold text-foreground-secondary hover:text-gold hover:border-gold-border transition-colors shadow-xs"
            >
              <Home size={13} />
              <span className="hidden sm:inline">Home</span>
            </Link>

            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-white text-black text-xs font-mono font-bold hover:bg-neutral-200 transition-colors uppercase tracking-wider shadow-xs shrink-0"
            >
              <span className="hidden sm:inline">Student Login</span>
              <span className="sm:hidden">Login</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Banner */}
      <section className="border-b border-border-strong bg-surface-deep py-10 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-gold-surface border border-gold-border text-gold text-[10px] font-mono font-bold uppercase tracking-wider">
            <HelpCircle size={12} className="hidden sm:inline" />
            Academic Transparency
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-sans text-foreground tracking-tight">
            How Calculations Work in Anviksha
          </h1>
          <p className="text-sm sm:text-base text-foreground-secondary leading-relaxed max-w-3xl">
            Anviksha reads your official ExamWeb marksheet and applies the verified GGSIPU ordinance rules for your programme — Ordinance 11 for semester degrees, plus separate frameworks for MBBS, BPT, and more. Every number carries a verification badge so you always know what is official and what is an estimate.
          </p>

          {/* Quick Table of Contents */}
          <div className="pt-4 flex flex-wrap gap-2 text-xs font-mono">
            {[
              { label: "Ordinances", href: "#ordinances" },
              { label: "Verification Badges", href: "#verification" },
              { label: "Grades", href: "#grades" },
              { label: "SGPA", href: "#sgpa" },
              { label: "CGPA", href: "#cgpa" },
              { label: "Equivalent %", href: "#percentage" },
              { label: "Credits", href: "#credits" },
              { label: "Promotion", href: "#promotion" },
              { label: "Academic Break", href: "#academic-break" },
              { label: "Result States", href: "#result-states" },
              { label: "Divisions", href: "#division" },
              { label: "Exemplary", href: "#exemplary" },
              { label: "Placement Benchmarks", href: "#placement" },
            ].map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="px-2.5 py-1 rounded bg-surface hover:bg-surface-elevated border border-border-strong text-foreground-secondary hover:text-foreground transition-colors"
              >
                {item.label}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main id="main-content" className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-12">

        {/* Which ordinance applies */}
        <section id="ordinances" className="scroll-mt-20 space-y-4 p-6 bg-surface border border-border-strong rounded-lg">
          <div className="flex items-center gap-2.5 text-gold">
            <BookOpen size={18} className="hidden sm:inline" />
            <h2 className="text-lg font-bold text-foreground">1. Which Ordinance Governs Your Programme</h2>
          </div>

          <div className="space-y-3 text-sm text-foreground-secondary leading-relaxed">
            <p>
              GGSIPU does not use one universal rule. Anviksha identifies your programme family from the official programme name and applies the correct statutory framework — keeping your raw ExamWeb programme code untouched:
            </p>
            <div className="overflow-x-auto pt-1">
              <table className="w-full min-w-[560px] sm:min-w-full text-xs font-mono border-collapse border border-border-strong text-center">
                <thead>
                  <tr className="bg-surface-deep border-b border-border-strong text-foreground">
                    <th className="p-2 border border-border-strong">Programme Family</th>
                    <th className="p-2 border border-border-strong">Framework</th>
                    <th className="p-2 border border-border-strong">System</th>
                    <th className="p-2 border border-border-strong">What You Get</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-border-strong/60">
                    <td className="p-2 border border-border-strong font-bold text-foreground">B.Tech / M.Tech / MCA / BCA / BBA / MBA / B.Com / Law (semester)</td>
                    <td className="p-2 border border-border-strong font-bold text-gold">Ordinance 11</td>
                    <td className="p-2 border border-border-strong">Semester</td>
                    <td className="p-2 border border-border-strong text-left">Grades, SGPA, CGPA, percentage, division, promotion</td>
                  </tr>
                  <tr className="border-b border-border-strong/60">
                    <td className="p-2 border border-border-strong font-bold text-foreground">MBBS</td>
                    <td className="p-2 border border-border-strong font-bold text-gold">Ordinance 15</td>
                    <td className="p-2 border border-border-strong">Annual</td>
                    <td className="p-2 border border-border-strong text-left">Marks, pass/fail, subject distinction — no SGPA/divisions by rule</td>
                  </tr>
                  <tr className="border-b border-border-strong/60">
                    <td className="p-2 border border-border-strong font-bold text-foreground">BPT / BOT</td>
                    <td className="p-2 border border-border-strong font-bold text-gold">Ordinance 31</td>
                    <td className="p-2 border border-border-strong">Annual</td>
                    <td className="p-2 border border-border-strong text-left">Marks, CPI-based division, all-subjects promotion rule</td>
                  </tr>
                  <tr className="border-b border-border-strong/60">
                    <td className="p-2 border border-border-strong font-bold text-foreground">BHMS / BAMS</td>
                    <td className="p-2 border border-border-strong font-bold text-gold">Ordinance 22 / 38</td>
                    <td className="p-2 border border-border-strong">Annual</td>
                    <td className="p-2 border border-border-strong text-left">Percentage marks, pass/fail — no letter grades by rule</td>
                  </tr>
                  <tr className="border-b border-border-strong/60">
                    <td className="p-2 border border-border-strong font-bold text-foreground">BASLP</td>
                    <td className="p-2 border border-border-strong font-bold text-gold">Ordinance 24</td>
                    <td className="p-2 border border-border-strong">Semester</td>
                    <td className="p-2 border border-border-strong text-left">Percentage-based division classification</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="p-3 bg-surface-deep rounded border border-border-strong text-xs space-y-1">
              <strong className="text-foreground">Important: </strong>A programme whose exact name is not in our verified registry (e.g. a generic &quot;Bachelor of Arts&quot;) is handled honestly: raw marks stay fully visible, but statutory calculations are marked <span className="text-gold font-bold">AMBIGUOUS</span> instead of being guessed. Unrecognised degree names never silently inherit Ordinance 11.
            </div>
          </div>
        </section>

        {/* Verification badges */}
        <section id="verification" className="scroll-mt-20 space-y-4 p-6 bg-surface border border-border-strong rounded-lg">
          <div className="flex items-center gap-2.5 text-gold">
            <ShieldCheck size={18} className="hidden sm:inline" />
            <h2 className="text-lg font-bold text-foreground">2. Verification Badges — What Each Number Means</h2>
          </div>

          <div className="space-y-3 text-sm text-foreground-secondary leading-relaxed">
            <p>Every calculated number in Anviksha carries a badge telling you how much to trust it. This is the core of how the engine works:</p>
            <div className="space-y-2 pt-1">
              {VERIFICATION_STATES.map((state) => (
                <div key={state.badge} className="p-3 bg-surface-deep rounded border border-border-strong text-xs space-y-1">
                  <span className={`${state.style} font-bold`}>{state.badge}</span>
                  <p className="text-foreground-secondary leading-relaxed">{state.meaning}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Grades & Grade Points */}
        <section id="grades" className="scroll-mt-20 space-y-4 p-6 bg-surface border border-border-strong rounded-lg">
          <div className="flex items-center gap-2.5 text-gold">
            <Award size={18} className="hidden sm:inline" />
            <h2 className="text-lg font-bold text-foreground">3. Grade Scale & Grade Points (Ordinance 11)</h2>
          </div>

          <div className="space-y-3 text-sm text-foreground-secondary leading-relaxed">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-foreground">What it means</h3>
            <p>Your official total marks (out of 100) are mapped to the standard GGSIPU letter grade and numerical grade point.</p>

            <div className="overflow-x-auto pt-2">
              <table className="w-full min-w-[420px] sm:min-w-full text-xs font-mono border-collapse border border-border-strong text-center">
                <thead>
                  <tr className="bg-surface-deep border-b border-border-strong text-foreground">
                    <th className="p-2 border border-border-strong">Marks Range</th>
                    <th className="p-2 border border-border-strong">Letter Grade</th>
                    <th className="p-2 border border-border-strong">Grade Point</th>
                    <th className="p-2 border border-border-strong">Meaning</th>
                  </tr>
                </thead>
                <tbody>
                  {GRADE_TABLE.map((row) => (
                    <tr key={row.grade} className="border-b border-border-strong/60">
                      <td className="p-2 border border-border-strong">{row.range}</td>
                      <td className="p-2 border border-border-strong font-bold text-foreground">{row.grade}</td>
                      <td className="p-2 border border-border-strong font-bold text-gold">{row.points}</td>
                      <td className="p-2 border border-border-strong text-foreground-secondary">{row.meaning}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-3 bg-surface-deep rounded border border-border-strong text-xs space-y-1">
              <strong className="text-foreground">GGSIPU Rule: </strong>Ordinance 11 Clause 11 specifies Grade P (Grade Point 4 / 40% aggregate) as the minimum passing grade unless the approved programme Scheme prescribes a higher requirement.
            </div>
          </div>
        </section>

        {/* SGPA */}
        <section id="sgpa" className="scroll-mt-20 space-y-4 p-6 bg-surface border border-border-strong rounded-lg">
          <div className="flex items-center gap-2.5 text-cat-violet">
            <TrendingUp size={18} className="hidden sm:inline" />
            <h2 className="text-lg font-bold text-foreground">4. SGPA (Semester Grade Point Average)</h2>
          </div>

          <div className="space-y-3 text-sm text-foreground-secondary leading-relaxed">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-foreground">What it means</h3>
            <p>SGPA measures your academic performance for a single semester, weighted by the credits assigned to each subject.</p>

            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-foreground pt-1">How Anviksha calculates it</h3>
            <div className="p-3 bg-surface-deep rounded border border-border-strong font-mono text-xs text-foreground">
              SGPA = Σ (Ci × Gi) / Σ Ci · Ordinance 11, Clause 13
            </div>

            <div className="p-3 bg-surface-deep rounded border border-border-strong text-xs space-y-1 font-mono">
              <p className="text-foreground font-bold">Example:</p>
              <p>Subject A (4 credits) with Grade A (8 points) = 32 quality points</p>
              <p>Subject B (3 credits) with Grade B+ (7 points) = 21 quality points</p>
              <p>Subject C (1 credit lab) with Grade O (10 points) = 10 quality points</p>
              <p className="text-gold font-bold">SGPA = (32 + 21 + 10) / (4 + 3 + 1) = 63 / 8 = 7.88</p>
            </div>

            <div className="p-3 bg-surface-deep rounded border border-border-strong text-xs space-y-1">
              <strong className="text-foreground">Important: </strong>SGPA is always credit-weighted. It is not a simple average of subject grade points. A failed paper (Grade F) contributes 0 grade points while still counting in the credit denominator. A course passed with a non-numeric legend (CS · Credit Secured, AP · Already Passed) carries no grade point at all, so it is excluded from the calculation rather than counted as zero.
            </div>
          </div>
        </section>

        {/* CGPA */}
        <section id="cgpa" className="scroll-mt-20 space-y-4 p-6 bg-surface border border-border-strong rounded-lg">
          <div className="flex items-center gap-2.5 text-cat-teal">
            <BookOpen size={18} className="hidden sm:inline" />
            <h2 className="text-lg font-bold text-foreground">5. CGPA (Cumulative Grade Point Average)</h2>
          </div>

          <div className="space-y-3 text-sm text-foreground-secondary leading-relaxed">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-foreground">What it means</h3>
            <p>CGPA indicates your cumulative academic performance across all completed semesters.</p>

            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-foreground pt-1">How Anviksha calculates it</h3>
            <div className="p-3 bg-surface-deep rounded border border-border-strong font-mono text-xs text-foreground">
              CGPA = Σ (Cni × Gni) / Σ Cni · Ordinance 11, Clause 13 (cumulative, rounded to 2 decimals)
            </div>

            <div className="p-3 bg-surface-deep rounded border border-border-strong text-xs space-y-1">
              <strong className="text-foreground">Important: </strong>CGPA is calculated directly from all semester quality points and credits. It is not calculated by averaging individual semester SGPA numbers directly, ensuring mathematical exactness.
            </div>
          </div>
        </section>

        {/* Equivalent Percentage */}
        <section id="percentage" className="scroll-mt-20 space-y-4 p-6 bg-surface border border-border-strong rounded-lg">
          <div className="flex items-center gap-2.5 text-cat-blue">
            <Percent size={18} className="hidden sm:inline" />
            <h2 className="text-lg font-bold text-foreground">6. Equivalent Percentage Formula</h2>
          </div>

          <div className="space-y-3 text-sm text-foreground-secondary leading-relaxed">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-foreground">What it means</h3>
            <p>GGSIPU defines an official conversion formula to convert CGPA into an equivalent percentage for job applications and higher education admissions.</p>

            <div className="p-3 bg-surface-deep rounded border border-border-strong font-mono text-xs text-foreground">
              Equivalent Percentage = CGPA × 10 · Ordinance 11, Clause 13
            </div>

            <div className="p-3 bg-surface-deep rounded border border-border-strong text-xs space-y-1">
              <strong className="text-foreground">GGSIPU Rule: </strong>Stated in GGSIPU Ordinance 11. For example, a CGPA of 6.73 converts to exactly 67.30%. Note that this is distinct from your credit completion percentage.
            </div>
          </div>
        </section>

        {/* Credits */}
        <section id="credits" className="scroll-mt-20 space-y-4 p-6 bg-surface border border-border-strong rounded-lg">
          <div className="flex items-center gap-2.5 text-accent-copper">
            <Layers size={18} className="hidden sm:inline" />
            <h2 className="text-lg font-bold text-foreground">7. Credits & Estimated Fallbacks</h2>
          </div>

          <div className="space-y-3 text-sm text-foreground-secondary leading-relaxed">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-foreground">How Anviksha handles credits</h3>
            <p>
              Official GGSIPU marksheets do not display per-course credits. Rather than pretending to know them, Anviksha applies a clearly-labelled estimate and tells you whenever it is used:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-xs font-mono">
              <li>Laboratory, Practical, or Studio courses: <strong>1 credit</strong> (estimated)</li>
              <li>Project, Viva, or Dissertation courses: <strong>2 credits</strong> (estimated)</li>
              <li>Theory lecture courses: <strong>3 credits</strong> (estimated)</li>
            </ul>
            <p>
              Because these are estimates, every SGPA, CGPA, percentage, and division computed from them carries the gold <strong className="text-gold">WARNING (Estimate)</strong> badge — never presented as official. You can click any credit input on the dashboard to enter the exact value from your scheme/syllabus; the numbers recalculate instantly (and stay badged as user-provided estimates until scheme credits are loaded).
            </p>
          </div>
        </section>

        {/* Promotion */}
        <section id="promotion" className="scroll-mt-20 space-y-4 p-6 bg-surface border border-border-strong rounded-lg">
          <div className="flex items-center gap-2.5 text-gold">
            <CheckCircle2 size={18} className="hidden sm:inline" />
            <h2 className="text-lg font-bold text-foreground">8. Annual Promotion Baseline (50% Rule)</h2>
          </div>

          <div className="space-y-3 text-sm text-foreground-secondary leading-relaxed">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-foreground">What it means</h3>
            <p>Under GGSIPU Ordinance 11, a student must earn at least 50% of the total credits offered across both semesters of an academic year (e.g. Sem 1 + Sem 2) to be promoted to the next academic year without year-back detention.</p>

            <div className="p-3 bg-surface-deep rounded border border-border-strong font-mono text-xs text-foreground">
              Required Credits = ceil(Total Academic Year Credits × 0.50)
            </div>

            <div className="p-3 bg-surface-deep rounded border border-border-strong text-xs space-y-1">
              <strong className="text-foreground">Important: </strong>This 50% rule is the verified ordinance baseline. Statutory regulatory bodies (such as AICTE, BCI, or COA) or specific programme schemes may prescribe additional promotion criteria — Anviksha shows this as a note alongside the baseline rather than inventing extra conditions. For annual programmes like BPT, promotion follows the programme&apos;s own ordinance (e.g. Ordinance 31 requires passing all subjects).
            </div>
          </div>
        </section>

        {/* Academic Break */}
        <section id="academic-break" className="scroll-mt-20 space-y-4 p-6 bg-surface border border-border-strong rounded-lg">
          <div className="flex items-center gap-2.5 text-grade-fail">
            <AlertTriangle size={18} className="hidden sm:inline" />
            <h2 className="text-lg font-bold text-foreground">9. Academic Break Regulations</h2>
          </div>

          <div className="space-y-3 text-sm text-foreground-secondary leading-relaxed">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-foreground">Ordinance 11 Rules</h3>
            <p>An academic break occurs when a student fails to meet the 50% annual promotion credit requirement or is detained due to attendance shortages.</p>
            <ul className="list-disc pl-5 space-y-1 text-xs">
              <li>A student is permitted a maximum of <strong>2 academic breaks</strong> during the entire duration of their programme.</li>
              <li>A backlog in an individual subject is <strong>not</strong> an academic break if the overall 50% annual credit requirement is met.</li>
            </ul>
          </div>
        </section>

        {/* Result States */}
        <section id="result-states" className="scroll-mt-20 space-y-4 p-6 bg-surface border border-border-strong rounded-lg">
          <div className="flex items-center gap-2.5 text-foreground">
            <GraduationCap size={18} className="hidden sm:inline" />
            <h2 className="text-lg font-bold text-foreground">10. Official Result States</h2>
          </div>

          <div className="space-y-3 text-sm text-foreground-secondary leading-relaxed">
            <p>Anviksha preserves the official status returned by GGSIPU ExamWeb without altering raw results. All official legend codes are decoded and shown in plain language:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-3 bg-surface-deep rounded border border-border-strong">
                <span className="text-grade-excellent font-bold">CLEARED (08)</span>: Course passed with Grade P or above.
              </div>
              <div className="p-3 bg-surface-deep rounded border border-border-strong">
                <span className="text-grade-fail font-bold">BACK (09 + Numeric)</span>: Failed marks, subject eligible for re-appear.
              </div>
              <div className="p-3 bg-surface-deep rounded border border-border-strong">
                <span className="text-foreground-muted font-bold">ABSENT (ABS)</span>: Student was absent from the examination.
              </div>
              <div className="p-3 bg-surface-deep rounded border border-border-strong">
                <span className="text-grade-fail font-bold">DETAINED (DET)</span>: Detained from examination due to attendance shortage.
              </div>
              <div className="p-3 bg-surface-deep rounded border border-border-strong">
                <span className="text-destructive font-bold">CANCELLED (CAN)</span>: Result cancelled by the university.
              </div>
              <div className="p-3 bg-surface-deep rounded border border-border-strong">
                <span className="text-cat-blue font-bold">RESULT LATER (RL)</span>: Result withheld; check back later.
              </div>
              <div className="p-3 bg-surface-deep rounded border border-border-strong">
                <span className="text-grade-excellent font-bold">CREDIT SECURED (CS)</span>: Credit already secured; excluded from GPA (no numeric marks).
              </div>
              <div className="p-3 bg-surface-deep rounded border border-border-strong">
                <span className="text-grade-excellent font-bold">ALREADY PASSED (AP)</span>: Passed in a previous attempt; excluded from GPA.
              </div>
            </div>
            <p className="text-xs text-foreground-muted">
              An unknown or missing status code is never auto-converted into a pass or a fail — it is shown as &quot;Unknown&quot; until the official result is available.
            </p>
          </div>
        </section>

        {/* Division Classification */}
        <section id="division" className="scroll-mt-20 space-y-4 p-6 bg-surface border border-border-strong rounded-lg">
          <div className="flex items-center gap-2.5 text-gold">
            <Award size={18} className="hidden sm:inline" />
            <h2 className="text-lg font-bold text-foreground">11. Ordinance 11 Division Classification</h2>
          </div>

          <div className="space-y-3 text-sm text-foreground-secondary leading-relaxed">
            <p>The revised GGSIPU Ordinance 11 defines the following division standings based on final cumulative CGPA:</p>
            <div className="overflow-x-auto pt-1">
              <table className="w-full min-w-[400px] sm:min-w-full text-xs font-mono border-collapse border border-border-strong text-center">
                <thead>
                  <tr className="bg-surface-deep border-b border-border-strong text-foreground">
                    <th className="p-2 border border-border-strong">CGPA Range</th>
                    <th className="p-2 border border-border-strong">Equivalent %</th>
                    <th className="p-2 border border-border-strong">Official Division</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-border-strong/60">
                    <td className="p-2 border border-border-strong font-bold text-gold">10.00</td>
                    <td className="p-2 border border-border-strong">100.0%</td>
                    <td className="p-2 border border-border-strong font-bold text-foreground">Exemplary Performance*</td>
                  </tr>
                  <tr className="border-b border-border-strong/60">
                    <td className="p-2 border border-border-strong font-bold text-foreground">6.50 – 10.00</td>
                    <td className="p-2 border border-border-strong">65.0% – 100.0%</td>
                    <td className="p-2 border border-border-strong font-bold text-foreground">First Division</td>
                  </tr>
                  <tr className="border-b border-border-strong/60">
                    <td className="p-2 border border-border-strong font-bold text-foreground">5.00 – 6.49</td>
                    <td className="p-2 border border-border-strong">50.0% – 64.9%</td>
                    <td className="p-2 border border-border-strong font-bold text-foreground">Second Division</td>
                  </tr>
                  <tr className="border-b border-border-strong/60">
                    <td className="p-2 border border-border-strong font-bold text-foreground">4.00 – 4.99</td>
                    <td className="p-2 border border-border-strong">40.0% – 49.9%</td>
                    <td className="p-2 border border-border-strong font-bold text-foreground">Third Division</td>
                  </tr>
                  <tr className="border-b border-border-strong/60">
                    <td className="p-2 border border-border-strong text-grade-fail">&lt; 4.00</td>
                    <td className="p-2 border border-border-strong text-grade-fail">&lt; 40.0%</td>
                    <td className="p-2 border border-border-strong text-grade-fail font-bold">Unqualified for Degree</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-xs text-foreground-muted">
              *Note: Revised Ordinance 11 does not feature a generic 7.50 &quot;First Division with Distinction&quot; tier. All scores ≥ 6.50 are classified under First Division, with CGPA 10.00 reserved for Exemplary Performance.
            </p>
          </div>
        </section>

        {/* Exemplary Performance */}
        <section id="exemplary" className="scroll-mt-20 space-y-4 p-6 bg-surface border border-border-strong rounded-lg">
          <div className="flex items-center gap-2.5 text-gold">
            <Award size={18} className="hidden sm:inline" />
            <h2 className="text-lg font-bold text-foreground">12. Exemplary Performance Requirements</h2>
          </div>

          <div className="space-y-3 text-sm text-foreground-secondary leading-relaxed">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-foreground">Ordinance Requirements</h3>
            <p>To be awarded Exemplary Performance on your official degree, GGSIPU requires:</p>
            <ul className="list-disc pl-5 space-y-1 text-xs">
              <li>Final CGPA of exactly <strong>10.00</strong>.</li>
              <li>Every individual course passed on the <strong>first attempt</strong> (no re-appear attempts).</li>
              <li>No academic breaks or detentions during the programme.</li>
            </ul>
            <div className="p-3 bg-surface-deep rounded border border-border-strong text-xs space-y-1">
              <strong className="text-foreground">Transparency Note: </strong>The ordinance awards Exemplary Performance only when every course was passed in the first chance with no academic break. Because a single ExamWeb marksheet does not contain first-attempt history, Anviksha shows CGPA 10.00 with that condition noted — your official marksheet remains the final word. Also note: professional programmes have their own classification rules (MBBS and BAMS award no divisions at all; BPT classifies by CPI on a percentage scale).
            </div>
          </div>
        </section>

        {/* Placement Benchmarks */}
        <section id="placement" className="scroll-mt-20 space-y-4 p-6 bg-surface border border-border-strong rounded-lg">
          <div className="flex items-center gap-2.5 text-accent-copper">
            <Briefcase size={18} className="hidden sm:inline" />
            <h2 className="text-lg font-bold text-foreground">13. Anviksha Placement Benchmarks</h2>
          </div>

          <div className="space-y-3 text-sm text-foreground-secondary leading-relaxed">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-foreground">What they mean</h3>
            <p>
              These cutoffs are application benchmarks modeled on common campus recruitment criteria in Delhi NCR engineering colleges:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-xs font-mono">
              <li><strong>60% Benchmark (≥ 6.00 CGPA, 0 backlogs): </strong>Baseline mass recruitment screen.</li>
              <li><strong>65% Benchmark (≥ 6.50 CGPA, 0 backlogs): </strong>Standard consulting and IT analyst screen.</li>
              <li><strong>70% Benchmark (≥ 7.00 CGPA, 0 backlogs): </strong>Core engineering & product teams screen.</li>
              <li><strong>75% Benchmark (≥ 7.50 CGPA, 0 backlogs): </strong>High-compensation technical drives.</li>
            </ul>
            <div className="p-3 bg-surface-deep rounded border border-border-strong text-xs space-y-1">
              <strong className="text-foreground">Disclaimer: </strong>These are Anviksha application benchmarks, not universal GGSIPU placement rules. Actual eligibility is governed strictly by the respective company&apos;s job description and campus recruitment notice.
            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-border-strong bg-surface py-8 px-4 sm:px-6 text-center text-xs font-mono text-foreground-muted flex flex-wrap items-center justify-center gap-3">
        <span>Anviksha · Built for GGSIPU Students · Independent & Privacy-First</span>
        <span className="text-border-strong">·</span>
        <Link href="/notices" className="hover:text-gold transition-colors">
          Live Circulars & Notices
        </Link>
        <span className="text-border-strong">·</span>
        <Link href="/" className="hover:text-gold transition-colors">
          Home
        </Link>
      </footer>
    </div>
  );
}
