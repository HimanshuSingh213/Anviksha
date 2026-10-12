"use client";

import { useRef } from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import { Calculator, Lock, RefreshCw, ShieldCheck, Timer } from "lucide-react";
import SectionHead from "./SectionHead";
import { TONE_COLOR, type Tone } from "./sample-data";

const CLAUSES = [
  { ref: "Ord. 11, Cl. 13", text: "SGPA is the credit-weighted mean: Σ (credits × grade points) / Σ credits." },
  { ref: "Cl. 13, cumulative", text: "CGPA applies the same weighting across every cleared semester." },
  { ref: "Cl. 13, equivalence", text: "Equivalent percentage is computed as CGPA × 10." },
  { ref: "Ord. 11, Cl. 11.3(v)", text: "Promotion requires earning at least 50% of the existing academic year's credits." },
];

const GRADES: { label: string; points: number; tone: Tone }[] = [
  { label: "O", points: 10, tone: "excellent" },
  { label: "A+", points: 9, tone: "excellent" },
  { label: "A", points: 8, tone: "good" },
  { label: "B+", points: 7, tone: "good" },
  { label: "B", points: 6, tone: "average" },
  { label: "C", points: 5, tone: "average" },
  { label: "P", points: 4, tone: "pass" },
  { label: "F", points: 0, tone: "fail" },
];

const LIFECYCLE = [
  { icon: RefreshCw, t: "Captcha relay", d: "The upstream captcha and session token are proxied live from examweb.ggsipu.ac.in." },
  { icon: Lock, t: "Credential handoff", d: "Enrollment number and password go straight to the university login. Never written to disk." },
  { icon: Calculator, t: "Fetch & compute", d: "Your full result is normalized in memory; every analytic runs in your browser." },
  { icon: ShieldCheck, t: "Zero-database", d: "No tables, no logs, no records. There is nothing to leak." },
  { icon: Timer, t: "Dissolve", d: "Logout destroys the session upstream and locally. Otherwise the session cookie expires on its own after one hour." },
];

/** Grade scale drawn as bars, height = grade points. */
function GradeLadder() {
  return (
    <div className="mt-6 flex h-56 items-end gap-2 sm:gap-3" role="img" aria-label="Official grade scale: O 10, A+ 9, A 8, B+ 7, B 6, C 5, P 4, F 0">
      {GRADES.map((grade, index) => {
        const color = TONE_COLOR[grade.tone];
        return (
          <div key={grade.label} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
            <span className="tnum font-mono text-xs text-foreground-muted">{grade.points}</span>
            <motion.div
              initial={{ height: 0 }}
              whileInView={{ height: `${Math.max(grade.points * 8.5, 3)}%` }}
              viewport={{ once: true }}
              transition={{ duration: 0.9, delay: index * 0.06, ease: "easeOut" }}
              className="w-full rounded-t-sm"
              style={{
                background: `color-mix(in srgb, ${color} 26%, transparent)`,
                borderTop: `2px solid ${color}`,
              }}
            />
            <span className="text-sm font-semibold" style={{ color }}>{grade.label}</span>
          </div>
        );
      })}
    </div>
  );
}

/** Privacy lifecycle: a line that fills as you scroll through the five steps. */
function Lifecycle() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 75%", "end 55%"] });
  const scale = useSpring(scrollYProgress, { stiffness: 120, damping: 28, mass: 0.4 });

  return (
    <div ref={ref} className="relative mt-14">
      {/* Rails: horizontal on desktop, vertical on small screens */}
      <div className="absolute bottom-2 left-5 top-2 w-px bg-border-strong lg:hidden" aria-hidden="true">
        <motion.div style={{ scaleY: scale, transformOrigin: "top" }} className="h-full w-full bg-gold" />
      </div>
      <div className="absolute left-2 right-0 top-[7px] hidden h-px bg-border-strong lg:block" aria-hidden="true">
        <motion.div style={{ scaleX: scale, transformOrigin: "left" }} className="h-full w-full bg-gold" />
      </div>

      <ol className="relative grid gap-10 lg:grid-cols-5 lg:gap-8">
        {LIFECYCLE.map((step, index) => (
          <li key={step.t} className="flex gap-5 lg:block">
            <span className="flex w-10 shrink-0 justify-center pt-1.5 lg:block lg:w-auto lg:pt-0">
              <span className="block size-3.5 rounded-full border-2 border-gold bg-background ring-4 ring-background" aria-hidden="true" />
            </span>
            <div className="lg:mt-6">
              <p className="tnum font-mono text-xs text-gold">{String(index + 1).padStart(2, "0")}</p>
              <h3 className="mt-2 flex items-center gap-2 text-base font-semibold text-foreground">
                <step.icon size={15} className="shrink-0 text-foreground-muted" aria-hidden="true" />
                {step.t}
              </h3>
              <p className="mt-2 text-sm leading-6 text-foreground-secondary">{step.d}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

export default function TrustSection() {
  return (
    <div className="relative w-full">
      <section id="ordinance" className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 sm:py-20">
        <SectionHead
          kicker="Built on the actual ordinances"
          title="Cited, not approximated."
          desc="Every grade, average and division follows the official GGSIPU semester framework. The scale below is the university's own."
        />
        <div className="mt-14 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="home-panel p-6 sm:p-8">
            <ul className="divide-y divide-border">
              {CLAUSES.map((clause) => (
                <li key={clause.ref} className="flex flex-col gap-1.5 py-5 first:pt-0 last:pb-0 sm:flex-row sm:gap-6">
                  <p className="shrink-0 pt-0.5 font-mono text-xs text-gold sm:w-40">{clause.ref}</p>
                  <p className="text-[15px] leading-7 text-foreground-secondary">{clause.text}</p>
                </li>
              ))}
            </ul>
          </div>

          <div className="home-panel p-6 sm:p-8">
            <p className="font-mono text-xs text-foreground-muted">Official grade scale</p>
            <GradeLadder />
            <p className="mt-5 border-t border-border pt-4 font-mono text-xs leading-5 text-foreground-muted">
              O 10 · A+ 9 · A 8 · B+ 7 · B 6 · C 5 · P 4 · F 0 · divisions auto-classified from CGPA.
            </p>
          </div>
        </div>
      </section>

      <section id="privacy" className="mx-auto w-full max-w-7xl px-4 pb-14 sm:px-6 sm:pb-20">
        <div className="border-t border-border pt-14 sm:pt-20">
          <SectionHead
            kicker="Privacy is the feature"
            title="A proxy, not a platform."
            desc="Anviksha has no database. Your session lasts only until you log out or the one-hour cookie expires."
          />
          <Lifecycle />
        </div>
      </section>
    </div>
  );
}
