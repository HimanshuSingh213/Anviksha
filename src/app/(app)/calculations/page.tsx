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
} from "lucide-react";

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://anviksha-result.vercel.app";

export const metadata: Metadata = {
  title: "How Calculations Work — GGSIPU Academic Rules & Grading Engine",
  description:
    "Transparent explanation of SGPA/CGPA formulas, Ordinance 11 promotion rules, grade scales, divisions, and placement benchmarks used in Anviksha.",
  alternates: {
    canonical: `${appUrl}/calculations`,
  },
  openGraph: {
    title: "How Calculations Work — GGSIPU Academic Rules & Grading Engine",
    description:
      "Transparent explanation of SGPA/CGPA formulas, Ordinance 11 promotion rules, grade scales, divisions, and placement benchmarks used in Anviksha.",
    url: `${appUrl}/calculations`,
    images: ["/favicon.png"],
  },
  twitter: {
    card: "summary",
    title: "How Calculations Work — GGSIPU Academic Rules & Grading Engine",
    description:
      "Transparent explanation of SGPA/CGPA formulas, Ordinance 11 promotion rules, grade scales, divisions, and placement benchmarks used in Anviksha.",
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

const CALCULATIONS_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "How GGSIPU SGPA, CGPA & Ordinance 11 Calculations Work",
  "description":
    "Comprehensive guide to GGSIPU Ordinance 11 grading formulas, SGPA/CGPA computation, 50% credit promotion rules, division classification, and placement benchmarks.",
  "author": {
    "@type": "Person",
    "name": "Himanshu Singh",
  },
  "publisher": {
    "@type": "Person",
    "name": "Himanshu Singh",
  },
  "mainEntityOfPage": `${appUrl}/calculations`,
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
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-white text-black text-xs font-mono font-bold hover:bg-neutral-200 transition-colors uppercase tracking-wider shadow-xs"
            >
              <span>Student Login</span>
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
            Anviksha uses official GGSIPU ExamWeb result data and the current revised GGSIPU Ordinance 11 as the baseline. Here is exactly how every calculation, grade, and standing is computed.
          </p>

          {/* Quick Table of Contents */}
          <div className="pt-4 flex flex-wrap gap-2 text-xs font-mono">
            {[
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
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-12">

        {/* Grades & Grade Points */}
        <section id="grades" className="scroll-mt-20 space-y-4 p-6 bg-surface border border-border-strong rounded-lg">
          <div className="flex items-center gap-2.5 text-gold">
            <Award size={18} className="hidden sm:inline" />
            <h2 className="text-lg font-bold text-foreground">1. Grade Scale & Grade Points</h2>
          </div>

          <div className="space-y-3 text-sm text-foreground-secondary leading-relaxed">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-foreground">What it means</h3>
            <p>Your official total marks (out of 100) are mapped to the standard GGSIPU letter grade and numerical grade point.</p>

            <div className="overflow-x-auto pt-2">
              <table className="w-full text-xs font-mono border-collapse border border-border-strong text-center">
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
              <strong className="text-foreground">GGSIPU Rule:</strong> Ordinance 11 Clause 11 specifies Grade P (Grade Point 4 / 40% aggregate) as the minimum passing grade unless the approved programme Scheme prescribes a higher requirement.
            </div>
          </div>
        </section>

        {/* SGPA */}
        <section id="sgpa" className="scroll-mt-20 space-y-4 p-6 bg-surface border border-border-strong rounded-lg">
          <div className="flex items-center gap-2.5 text-cat-violet">
            <TrendingUp size={18} className="hidden sm:inline" />
            <h2 className="text-lg font-bold text-foreground">2. SGPA (Semester Grade Point Average)</h2>
          </div>

          <div className="space-y-3 text-sm text-foreground-secondary leading-relaxed">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-foreground">What it means</h3>
            <p>SGPA measures your academic performance for a single semester, weighted by the credits assigned to each subject.</p>

            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-foreground pt-1">How Anviksha calculates it</h3>
            <div className="p-3 bg-surface-deep rounded border border-border-strong font-mono text-xs text-foreground">
              SGPA = Sum of (Subject Credits × Grade Points) / Total Registered Credits
            </div>

            <div className="p-3 bg-surface-deep rounded border border-border-strong text-xs space-y-1 font-mono">
              <p className="text-foreground font-bold">Example:</p>
              <p>Subject A (4 credits) with Grade A (8 points) = 32 quality points</p>
              <p>Subject B (3 credits) with Grade B+ (7 points) = 21 quality points</p>
              <p>Subject C (1 credit lab) with Grade O (10 points) = 10 quality points</p>
              <p className="text-gold font-bold">SGPA = (32 + 21 + 10) / (4 + 3 + 1) = 63 / 8 = 7.88</p>
            </div>

            <div className="p-3 bg-surface-deep rounded border border-border-strong text-xs space-y-1">
              <strong className="text-foreground">Important:</strong> SGPA is always credit-weighted. It is not a simple average of subject grade points. Backlog papers (Grade F, ABS, DET) contribute 0 grade points to the numerator while still counting in the registered credit denominator.
            </div>
          </div>
        </section>

        {/* CGPA */}
        <section id="cgpa" className="scroll-mt-20 space-y-4 p-6 bg-surface border border-border-strong rounded-lg">
          <div className="flex items-center gap-2.5 text-cat-teal">
            <BookOpen size={18} className="hidden sm:inline" />
            <h2 className="text-lg font-bold text-foreground">3. CGPA (Cumulative Grade Point Average)</h2>
          </div>

          <div className="space-y-3 text-sm text-foreground-secondary leading-relaxed">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-foreground">What it means</h3>
            <p>CGPA indicates your cumulative academic performance across all completed semesters.</p>

            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-foreground pt-1">How Anviksha calculates it</h3>
            <div className="p-3 bg-surface-deep rounded border border-border-strong font-mono text-xs text-foreground">
              CGPA = Total Quality Points Across All Semesters / Total Registered Credits Across All Semesters
            </div>

            <div className="p-3 bg-surface-deep rounded border border-border-strong text-xs space-y-1">
              <strong className="text-foreground">Important:</strong> CGPA is calculated directly from all semester quality points and credits. It is not calculated by averaging individual semester SGPA numbers directly, ensuring mathematical exactness.
            </div>
          </div>
        </section>

        {/* Equivalent Percentage */}
        <section id="percentage" className="scroll-mt-20 space-y-4 p-6 bg-surface border border-border-strong rounded-lg">
          <div className="flex items-center gap-2.5 text-cat-blue">
            <Percent size={18} className="hidden sm:inline" />
            <h2 className="text-lg font-bold text-foreground">4. Equivalent Percentage Formula</h2>
          </div>

          <div className="space-y-3 text-sm text-foreground-secondary leading-relaxed">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-foreground">What it means</h3>
            <p>GGSIPU defines an official conversion formula to convert CGPA into an equivalent percentage for job applications and higher education admissions.</p>

            <div className="p-3 bg-surface-deep rounded border border-border-strong font-mono text-xs text-foreground">
              Equivalent Percentage = CGPA × 10.0
            </div>

            <div className="p-3 bg-surface-deep rounded border border-border-strong text-xs space-y-1">
              <strong className="text-foreground">GGSIPU Rule:</strong> Stated in GGSIPU Ordinance 11. For example, a CGPA of 6.73 converts to exactly 67.30%. Note that this is distinct from your credit completion percentage.
            </div>
          </div>
        </section>

        {/* Credits */}
        <section id="credits" className="scroll-mt-20 space-y-4 p-6 bg-surface border border-border-strong rounded-lg">
          <div className="flex items-center gap-2.5 text-accent-copper">
            <Layers size={18} className="hidden sm:inline" />
            <h2 className="text-lg font-bold text-foreground">5. Credits & Estimated Fallbacks</h2>
          </div>

          <div className="space-y-3 text-sm text-foreground-secondary leading-relaxed">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-foreground">How Anviksha handles credits</h3>
            <p>
              When a course scheme does not provide explicit credit counts in the raw ExamWeb response, Anviksha applies standard Ordinance 11 fallback heuristics:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-xs font-mono">
              <li>Laboratory, Practical, or Studio courses: <strong>1 credit</strong></li>
              <li>Theory lecture courses: <strong>3 credits</strong></li>
            </ul>
            <p>
              You can click on any credit input on the dashboard to override it with your college syllabus value, and Anviksha will instantly recalculate your SGPA and CGPA in real-time.
            </p>
          </div>
        </section>

        {/* Promotion */}
        <section id="promotion" className="scroll-mt-20 space-y-4 p-6 bg-surface border border-border-strong rounded-lg">
          <div className="flex items-center gap-2.5 text-gold">
            <CheckCircle2 size={18} className="hidden sm:inline" />
            <h2 className="text-lg font-bold text-foreground">6. Annual Promotion Baseline (50% Rule)</h2>
          </div>

          <div className="space-y-3 text-sm text-foreground-secondary leading-relaxed">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-foreground">What it means</h3>
            <p>Under revised GGSIPU Ordinance 11, a student must secure passing grades in at least 50% of the total credits offered across both semesters of an academic year (e.g. Sem 1 + Sem 2) to be promoted to the next academic year without year-back detention.</p>

            <div className="p-3 bg-surface-deep rounded border border-border-strong font-mono text-xs text-foreground">
              Required Credits = ceil(Total Academic Year Credits × 0.50)
            </div>

            <div className="p-3 bg-surface-deep rounded border border-border-strong text-xs space-y-1">
              <strong className="text-foreground">Important:</strong> This represents the general University baseline. Statutory regulatory bodies (such as AICTE, BCI, or COA) or specific programme schemes may prescribe additional promotion criteria.
            </div>
          </div>
        </section>

        {/* Academic Break */}
        <section id="academic-break" className="scroll-mt-20 space-y-4 p-6 bg-surface border border-border-strong rounded-lg">
          <div className="flex items-center gap-2.5 text-grade-fail">
            <AlertTriangle size={18} className="hidden sm:inline" />
            <h2 className="text-lg font-bold text-foreground">7. Academic Break Regulations</h2>
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
            <h2 className="text-lg font-bold text-foreground">8. Official Result States</h2>
          </div>

          <div className="space-y-3 text-sm text-foreground-secondary leading-relaxed">
            <p>Anviksha preserves the official status returned by GGSIPU ExamWeb without altering raw results:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-3 bg-surface-deep rounded border border-border-strong">
                <span className="text-grade-excellent font-bold">CLEARED (08)</span>: Course passed with Grade P or above.
              </div>
              <div className="p-3 bg-surface-deep rounded border border-border-strong">
                <span className="text-grade-fail font-bold">BACK (09 + Numeric)</span>: Failed marks, subject eligible for re-appear.
              </div>
              <div className="p-3 bg-surface-deep rounded border border-border-strong">
                <span className="text-foreground-muted font-bold">ABSENT (09 + ABS)</span>: Student was absent from semester examination.
              </div>
              <div className="p-3 bg-surface-deep rounded border border-border-strong">
                <span className="text-grade-fail font-bold">DETAINED (09 + DET)</span>: Detained from examination due to attendance shortage.
              </div>
            </div>
          </div>
        </section>

        {/* Division Classification */}
        <section id="division" className="scroll-mt-20 space-y-4 p-6 bg-surface border border-border-strong rounded-lg">
          <div className="flex items-center gap-2.5 text-gold">
            <Award size={18} className="hidden sm:inline" />
            <h2 className="text-lg font-bold text-foreground">9. Ordinance 11 Division Classification</h2>
          </div>

          <div className="space-y-3 text-sm text-foreground-secondary leading-relaxed">
            <p>The revised GGSIPU Ordinance 11 defines the following division standings based on final cumulative CGPA:</p>
            <div className="overflow-x-auto pt-1">
              <table className="w-full text-xs font-mono border-collapse border border-border-strong text-center">
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
            <h2 className="text-lg font-bold text-foreground">10. Exemplary Performance Requirements</h2>
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
              <strong className="text-foreground">Transparency Note:</strong> Because ExamWeb single marksheet responses do not contain historical first-attempt verification flags, Anviksha marks Exemplary eligibility as undetermined until complete attempt history is confirmed.
            </div>
          </div>
        </section>

        {/* Placement Benchmarks */}
        <section id="placement" className="scroll-mt-20 space-y-4 p-6 bg-surface border border-border-strong rounded-lg">
          <div className="flex items-center gap-2.5 text-accent-copper">
            <Briefcase size={18} className="hidden sm:inline" />
            <h2 className="text-lg font-bold text-foreground">11. Anviksha Placement Benchmarks</h2>
          </div>

          <div className="space-y-3 text-sm text-foreground-secondary leading-relaxed">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-foreground">What they mean</h3>
            <p>
              These cutoffs are application benchmarks modeled on common campus recruitment criteria in Delhi NCR engineering colleges:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-xs font-mono">
              <li><strong>60% Benchmark (≥ 6.00 CGPA, 0 backlogs):</strong> Baseline mass recruitment screen.</li>
              <li><strong>65% Benchmark (≥ 6.50 CGPA, 0 backlogs):</strong> Standard consulting and IT analyst screen.</li>
              <li><strong>70% Benchmark (≥ 7.00 CGPA, 0 backlogs):</strong> Core engineering & product teams screen.</li>
              <li><strong>75% Benchmark (≥ 7.50 CGPA, 0 backlogs):</strong> High-compensation technical drives.</li>
            </ul>
            <div className="p-3 bg-surface-deep rounded border border-border-strong text-xs space-y-1">
              <strong className="text-foreground">Disclaimer:</strong> These are Anviksha application benchmarks, not universal GGSIPU placement rules. Actual eligibility is governed strictly by the respective company&apos;s job description and campus recruitment notice.
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
