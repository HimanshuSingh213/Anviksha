"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowRight, ChevronDown, ShieldCheck } from "lucide-react";
import SectionHead from "./SectionHead";
import { FAQS } from "./faq-data";

interface Cta { label: string; href: string; }
interface Props { cta: Cta; }

export default function RedesignFaqCta({ cta }: Props) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const reducedMotion = useReducedMotion() ?? false;

  return (
    <>
      <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 sm:py-24">
        <SectionHead
          index="05"
          kicker="Knowledge base"
          title="Questions, answered plainly."
          desc="The things students actually ask about GGSIPU results, ordinances and privacy."
        />
        <div className="mt-10 flex flex-col gap-4">
          {FAQS.map((f, i) => {
            const open = openIndex === i;
            return (
              <motion.div key={f.q} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.35, delay: Math.min(i * 0.04, 0.2) }} className="rounded-xl border border-border bg-surface transition-colors hover:border-gold-border/60">
                <h3>
                  <button
                    type="button"
                    id={`redesign-faq-btn-${i}`}
                    onClick={() => setOpenIndex(open ? null : i)}
                    aria-expanded={open}
                    aria-controls={`redesign-faq-panel-${i}`}
                    className="flex w-full items-center justify-between gap-4 px-4 py-4 text-left sm:px-6 sm:py-5"
                  >
                    <span className={`text-sm font-semibold transition-colors ${open ? "text-gold" : "text-foreground"}`}>{f.q}</span>
                    <ChevronDown size={16} aria-hidden="true" className={`shrink-0 transition-transform duration-200 ${open ? "rotate-180 text-gold" : "text-foreground-muted"}`} />
                  </button>
                </h3>
                <AnimatePresence initial={false}>
                  {open && (
                    <motion.div
                      id={`redesign-faq-panel-${i}`}
                      role="region"
                      aria-labelledby={`redesign-faq-btn-${i}`}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={reducedMotion ? { duration: 0 } : { duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <p className="px-4 pb-5 text-xs leading-6 text-foreground-secondary sm:px-6 sm:pb-6">{f.a}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 pb-20 sm:px-6 sm:pb-24">
        <motion.div initial={{ opacity: 0, scale: 0.98 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="relative w-full overflow-hidden rounded-2xl border border-border-strong bg-surface px-5 py-12 text-center sm:px-12 sm:py-16 lg:px-16">
          <div className="pointer-events-none absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-gold opacity-[0.08] blur-3xl" aria-hidden="true" />
          <div className="relative mx-auto max-w-2xl">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">Ready to see where you actually stand?</h2>
            <p className="mt-3 text-sm leading-6 text-foreground-secondary">
              Sign in with your standard ExamWeb credentials. Your complete multi-semester standing is computed in under ten seconds.
            </p>
            <div className="mt-7">
              <Link href={cta.href} className="inline-flex items-center gap-2 rounded-md border border-gold bg-gold px-6 py-3 font-mono text-xs font-bold uppercase tracking-wider text-background shadow-[0_0_24px_rgba(201,169,97,0.22)] transition-all duration-150 hover:-translate-y-0.5 hover:border-gold-bright hover:bg-gold-bright active:scale-95">
                {cta.label}
                <ArrowRight size={14} aria-hidden="true" />
              </Link>
            </div>
            <p className="mt-5 flex items-center justify-center gap-2 font-mono text-xs text-foreground-muted">
              <ShieldCheck size={13} className="shrink-0 text-positive" aria-hidden="true" />
              Zero signup required · Direct university proxy
            </p>
          </div>
        </motion.div>
      </section>
    </>
  );
}
