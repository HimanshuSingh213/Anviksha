"use client";

import { motion } from "framer-motion";
import { Calculator, Lock, RefreshCw, ShieldCheck, Timer } from "lucide-react";
import SectionHead from "./SectionHead";

const CLAUSES = [
  { ref: "Ord. 11, Cl. 13", text: "SGPA is the credit-weighted mean: Σ (credits × grade points) / Σ credits." },
  { ref: "Cl. 13, cumulative", text: "CGPA applies the same weighting across every cleared semester." },
  { ref: "Cl. 13, equivalence", text: "Equivalent percentage is computed as CGPA × 10." },
  { ref: "Ord. 11, Cl. 11.3(v)", text: "Promotion requires earning at least 50% of the existing academic year's credits." },
];

const GRADES = [
  { label: "O", points: 10, cls: "text-grade-excellent bg-grade-excellent-surface border-grade-excellent-border" },
  { label: "A+", points: 9, cls: "text-grade-excellent bg-grade-excellent-surface border-grade-excellent-border" },
  { label: "A", points: 8, cls: "text-grade-good bg-grade-good-surface border-grade-good-border" },
  { label: "B+", points: 7, cls: "text-grade-good bg-grade-good-surface border-grade-good-border" },
  { label: "B", points: 6, cls: "text-grade-average bg-grade-average-surface border-grade-average-border" },
  { label: "C", points: 5, cls: "text-grade-average bg-grade-average-surface border-grade-average-border" },
  { label: "P", points: 4, cls: "text-grade-pass bg-grade-pass-surface border-grade-pass-border" },
  { label: "F", points: 0, cls: "text-grade-fail bg-grade-fail-surface border-grade-fail-border" },
];

const LIFECYCLE = [
  { icon: RefreshCw, t: "Captcha relay", d: "The upstream captcha and session token are proxied live from examweb.ggsipu.ac.in." },
  { icon: Lock, t: "Credential handoff", d: "Enrollment number and password go straight to the university login. Never written to disk." },
  { icon: Calculator, t: "Fetch & compute", d: "Your full result is normalized in memory; every analytic runs in your browser." },
  { icon: ShieldCheck, t: "Zero-database", d: "No tables, no logs, no records. There is nothing to leak." },
  { icon: Timer, t: "Dissolve", d: "Logout destroys the session upstream and locally. Closing the tab does the same." },
];

export default function RedesignTrust() {
  return (
    <div className="w-full border-t border-border bg-surface/40">
      <section id="ordinance" className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 sm:py-24">
        <SectionHead
          index="03"
          kicker="Built on the actual ordinances"
          title="Cited, not approximated."
          desc="Every grade, average and division follows the official GGSIPU semester framework. The scale below is the university's own."
        />
        <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="space-y-3">
            {CLAUSES.map((c, i) => (
              <motion.div key={c.ref} initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.35, delay: i * 0.06 }} className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4 border-l border-border-strong py-1 pl-4 sm:pl-5">
                <p className="shrink-0 pt-0.5 font-mono text-[11px] uppercase tracking-wider text-gold sm:w-40">{c.ref}</p>
                <p className="text-sm leading-6 text-foreground-secondary">{c.text}</p>
              </motion.div>
            ))}
          </div>
          <div>
            <p className="font-mono text-[11px] uppercase tracking-wider text-foreground-muted">Official grade scale</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {GRADES.map((g) => (
                <motion.span key={g.label} whileHover={{ scale: 1.08 }} className={"tnum cursor-default rounded-md border px-3.5 py-2 font-mono text-sm font-bold " + g.cls}>
                  {g.label} · {g.points}
                </motion.span>
              ))}
            </div>
            <p className="mt-4 font-mono text-[11px] leading-5 text-foreground-muted">
              O 10 · A+ 9 · A 8 · B+ 7 · B 6 · C 5 · P 4 · F 0 · divisions auto-classified from CGPA.
            </p>
          </div>
        </div>
      </section>

      <section id="privacy" className="w-full border-t border-border">
        <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 sm:py-24">
          <SectionHead
            index="04"
            kicker="Privacy is the feature"
            title="A proxy, not a platform."
            desc="Anviksha has no database. Your session lives for exactly as long as you keep the tab open."
          />
          <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
            {LIFECYCLE.map((s, i) => (
              <motion.div key={s.t} initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.35, delay: i * 0.07 }} className="border-t border-border-strong pt-5">
                <div className="flex items-center gap-2">
                  <span className="tnum font-mono text-[10px] text-gold">0{i + 1}</span>
                  <s.icon size={15} className="text-foreground-secondary" aria-hidden="true" />
                </div>
                <h3 className="mt-3 text-sm font-semibold text-foreground">{s.t}</h3>
                <p className="mt-1.5 text-xs leading-5 text-foreground-secondary">{s.d}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}