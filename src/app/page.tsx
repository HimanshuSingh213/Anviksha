import Link from "next/link";
import Image from "next/image";
import { cookies } from "next/headers";
import {
  ArrowRight,
  ShieldCheck,
  Lock,
  Timer,
  Calculator,
  TrendingUp,
  Pencil,
  PieChart,
  Award,
  FileDown,
} from "lucide-react";
import ResultPreviewCard from "@/components/home/ResultPreviewCard";

/* ---------------------------------- data ---------------------------------- */

const TRUST_ITEMS = [
  { icon: ShieldCheck, text: "Zero-database architecture" },
  { icon: Lock, text: "Credentials go straight to GGSIPU, never stored" },
  { icon: Timer, text: "Session clears the moment you log out" },
];

type Accent = "blue" | "violet" | "teal" | "pink" | "gold" | "green";

const ACCENTS: Record<Accent, { icon: string; bg: string; border: string }> = {
  blue: { icon: "text-cat-blue", bg: "bg-cat-blue-surface", border: "group-hover:border-cat-blue-border" },
  violet: { icon: "text-cat-violet", bg: "bg-cat-violet-surface", border: "group-hover:border-cat-violet-border" },
  teal: { icon: "text-cat-teal", bg: "bg-cat-teal-surface", border: "group-hover:border-cat-teal-border" },
  pink: { icon: "text-cat-pink", bg: "bg-cat-pink-surface", border: "group-hover:border-cat-pink-border" },
  gold: { icon: "text-gold", bg: "bg-gold-surface", border: "group-hover:border-gold-border" },
  green: { icon: "text-grade-excellent", bg: "bg-grade-excellent-surface", border: "group-hover:border-grade-excellent-border" },
};

const FEATURES: { icon: typeof Calculator; accent: Accent; title: string; desc: string }[] = [
  { icon: Calculator, accent: "blue", title: "Instant SGPA & CGPA", desc: "Calculated the moment your result loads, exactly per GGSIPU Ordinance 11." },
  { icon: TrendingUp, accent: "violet", title: "Semester analytics", desc: "Track SGPA across all 8 semesters with sem-by-sem trend charts." },
  { icon: Pencil, accent: "teal", title: "Editable credits", desc: "Lab and theory credits are auto-detected — edit inline if something's off." },
  { icon: PieChart, accent: "pink", title: "Grade breakdown", desc: "See your O–F distribution and internal vs. external split for any semester." },
  { icon: Award, accent: "gold", title: "Division & distinction", desc: "Auto-classified First Division with Distinction, First Division, or Second Division." },
  { icon: FileDown, accent: "green", title: "Transcript PDF", desc: "Download an official-style marksheet or full transcript in one click." },
];

const STEPS = [
  { n: "01", title: "Sign in", desc: "Enter your enrollment number and password — the same ones you use on the GGSIPU portal." },
  { n: "02", title: "We fetch, not store", desc: "Your session is proxied directly to GGSIPU's server. No credentials or marks touch a database." },
  { n: "03", title: "See everything", desc: "Your dashboard, analytics, and transcript are ready instantly, recalculated live in your browser." },
];

const GRADE_BADGES = [
  { label: "O", points: 10, cls: "text-grade-excellent bg-grade-excellent-surface border-grade-excellent-border" },
  { label: "A+", points: 9, cls: "text-grade-excellent bg-grade-excellent-surface border-grade-excellent-border" },
  { label: "A", points: 8, cls: "text-grade-good bg-grade-good-surface border-grade-good-border" },
  { label: "B+", points: 7, cls: "text-grade-good bg-grade-good-surface border-grade-good-border" },
  { label: "B", points: 6, cls: "text-grade-average bg-grade-average-surface border-grade-average-border" },
  { label: "C", points: 5, cls: "text-grade-average bg-grade-average-surface border-grade-average-border" },
  { label: "P", points: 4, cls: "text-grade-pass bg-grade-pass-surface border-grade-pass-border" },
  { label: "F", points: 0, cls: "text-grade-fail bg-grade-fail-surface border-grade-fail-border" },
];

/* --------------------------------- helpers --------------------------------- */

function GithubMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.57.1.79-.25.79-.55 0-.27-.01-1.17-.02-2.12-3.2.7-3.87-1.36-3.87-1.36-.53-1.33-1.28-1.69-1.28-1.69-1.05-.71.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.76 2.7 1.25 3.36.96.1-.75.4-1.25.73-1.54-2.55-.29-5.24-1.28-5.24-5.68 0-1.25.45-2.28 1.18-3.08-.12-.29-.51-1.46.11-3.04 0 0 .96-.31 3.16 1.18a10.9 10.9 0 0 1 5.75 0c2.2-1.49 3.15-1.18 3.15-1.18.63 1.58.24 2.75.12 3.04.74.8 1.18 1.83 1.18 3.08 0 4.41-2.7 5.38-5.27 5.67.42.36.78 1.07.78 2.16 0 1.56-.01 2.82-.01 3.2 0 .31.21.66.8.55A10.53 10.53 0 0 0 23.5 12c0-6.35-5.15-11.5-11.5-11.5Z" />
    </svg>
  );
}

const ctaClasses =
  "inline-flex items-center gap-2.5 rounded-md border border-white bg-white px-6 py-3 font-mono text-xs font-bold uppercase tracking-wider text-black shadow-[0_0_20px_rgba(255,255,255,0.15)] transition-transform duration-150 ease-out hover:-translate-y-0.5 hover:bg-neutral-200 active:scale-95";

/* ----------------------------------- page ----------------------------------- */

export default async function Home() {
  const cookieStore = await cookies();
  const isAuthenticated = Boolean(cookieStore.get("auth_session")?.value);

  const cta = isAuthenticated
    ? { label: "Go to Dashboard", href: "/dashboard" }
    : { label: "View My Result", href: "/login" };

  return (
    <div className="relative flex flex-1 flex-col overflow-hidden bg-background text-foreground">
      {/* Ambient background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle,var(--color-border-strong)_1.5px,transparent_1.5px)] bg-size-[28px_28px] mask-[radial-gradient(ellipse_80%_60%_at_50%_0%,black_20%,transparent_100%)]" />
        <div className="absolute -top-32 -left-24 h-96 w-96 rounded-full bg-gold opacity-[0.08] blur-3xl" />
        <div className="absolute top-1/4 -right-24 h-96 w-96 rounded-full bg-cat-violet opacity-[0.06] blur-3xl" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center shrink-0">
            <Image
              src="/navbar-logo.png"
              alt="Anviksha"
              width={150}
              height={40}
              className="h-8 w-auto object-contain"
              priority
            />
          </Link>

          <nav className="hidden items-center gap-8 font-mono text-xs text-foreground-secondary sm:flex">
            <a href="#features" className="transition-colors hover:text-foreground">Features</a>
            <a href="#how-it-works" className="transition-colors hover:text-foreground">How it works</a>
            <a
              href="https://github.com/HimanshuSingh213/anviksha"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 transition-colors hover:text-foreground"
            >
              <GithubMark className="h-3.5 w-3.5" />
              GitHub
            </a>
          </nav>

          <Link
            href={isAuthenticated ? "/dashboard" : "/login"}
            className="rounded-md border border-border-strong px-4 py-2 font-mono text-xs font-semibold text-foreground transition-colors hover:border-gold-border hover:text-gold"
          >
            {isAuthenticated ? "Dashboard" : "Sign in"}
          </Link>
        </div>
      </header>

      <main className="relative z-10 flex-1">
        {/* Hero */}
        <section className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-16 px-6 pb-20 pt-16 lg:grid-cols-2 lg:pb-28 lg:pt-24">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1 font-mono text-xs text-foreground-muted">
              <span className="h-1.5 w-1.5 rounded-full bg-gold" />
              Unofficial · GGSIPU Exam Portal
            </span>

            <h1 className="mt-5 max-w-lg text-4xl font-semibold leading-tight tracking-tight text-foreground sm:text-5xl">
              Your GGSIPU result,{" "}
              <span className="text-gold">actually easy to read.</span>
            </h1>

            <p className="mt-5 max-w-md text-base leading-7 text-foreground-secondary">
              Anviksha pulls your result straight from the GGSIPU portal and turns it
              into a clean dashboard — SGPA, CGPA, semester trends, and a downloadable
              transcript. Nothing is ever stored.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link href={cta.href} className={ctaClasses}>
                {cta.label}
                <ArrowRight size={14} />
              </Link>
              <a
                href="https://github.com/HimanshuSingh213/anviksha"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 rounded-md border border-border-strong px-6 py-3 font-mono text-xs font-semibold text-foreground-secondary transition-colors hover:border-gold-border hover:text-foreground"
              >
                <GithubMark className="h-3.5 w-3.5" />
                Source on GitHub
              </a>
            </div>

            <p className="mt-5 flex items-center gap-2 font-mono text-xs text-foreground-muted">
              <ShieldCheck size={14} className="text-positive" />
              {isAuthenticated
                ? "Welcome back — pick up right where you left off"
                : "No signup · Takes less than 10 seconds"}
            </p>
          </div>

          <ResultPreviewCard />
        </section>

        {/* Trust strip */}
        <section className="border-y border-border bg-surface/60">
          <div className="mx-auto grid max-w-6xl grid-cols-1 gap-4 px-6 py-5 sm:grid-cols-3">
            {TRUST_ITEMS.map((item) => (
              <div key={item.text} className="flex items-center gap-2.5 text-foreground-secondary">
                <item.icon size={15} className="shrink-0 text-gold" />
                <span className="text-xs">{item.text}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section id="features" className="mx-auto max-w-6xl px-6 py-24">
          <div className="max-w-lg">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              Everything your result page should have
            </h2>
            <p className="mt-3 text-sm leading-6 text-foreground-secondary">
              The GGSIPU portal gives you numbers in a table. Anviksha gives you the
              picture — built for how students actually check their result.
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => {
              const a = ACCENTS[f.accent];
              return (
                <div
                  key={f.title}
                  className={`group rounded-lg border border-border bg-surface p-5 transition-colors duration-300 ${a.border}`}
                >
                  <div className={`inline-flex rounded-md p-2 ${a.bg}`}>
                    <f.icon size={18} className={a.icon} />
                  </div>
                  <h3 className="mt-4 text-sm font-medium text-foreground">{f.title}</h3>
                  <p className="mt-1.5 text-sm leading-6 text-foreground-secondary">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="border-t border-border bg-surface/40">
          <div className="mx-auto max-w-6xl px-6 py-24">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              How it works
            </h2>

            <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-3 sm:gap-6">
              {STEPS.map((step) => (
                <div key={step.n}>
                  <span className="font-mono text-3xl font-semibold text-gold-dim">{step.n}</span>
                  <h3 className="mt-3 text-sm font-medium text-foreground">{step.title}</h3>
                  <p className="mt-1.5 text-sm leading-6 text-foreground-secondary">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Grading scale */}
        <section className="mx-auto max-w-6xl px-6 py-24">
          <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                Built exactly to Ordinance 11
              </h2>
              <p className="mt-3 max-w-md text-sm leading-6 text-foreground-secondary">
                Every grade, credit, and division follows GGSIPU&apos;s official
                credit-based semester system — no approximations.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {GRADE_BADGES.map((g) => (
                <span
                  key={g.label}
                  className={`rounded-md border px-3 py-1.5 font-mono text-sm font-medium ${g.cls}`}
                >
                  {g.label} · {g.points}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="mx-auto max-w-6xl px-6 pb-24">
          <div className="relative overflow-hidden rounded-2xl border border-border-strong bg-surface px-8 py-16 text-center">
            <div className="pointer-events-none absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-gold opacity-[0.08] blur-3xl" />
            <h2 className="relative text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              {isAuthenticated ? "Jump back into your dashboard" : "Ready to see where you stand?"}
            </h2>
            <p className="relative mt-3 text-sm text-foreground-secondary">
              {isAuthenticated
                ? "Your result, analytics, and transcript are right where you left them."
                : "Sign in with your enrollment number — your dashboard loads instantly."}
            </p>
            <Link href={cta.href} className={`relative mt-7 ${ctaClasses}`}>
              {cta.label}
              <ArrowRight size={14} />
            </Link>
          </div>
        </section>
      </main>

      <footer className="relative z-10 border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-6 py-6 text-center sm:flex-row sm:text-left">
          <span className="text-xs text-foreground-muted">
            Anviksha · Unofficial, not affiliated with GGSIPU
          </span>
          <a
            href="https://github.com/HimanshuSingh213/anviksha"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 font-mono text-xs text-foreground-muted transition-colors hover:text-foreground"
          >
            <GithubMark className="h-3.5 w-3.5" />
            HimanshuSingh213/anviksha
          </a>
        </div>
      </footer>
    </div>
  );
}
