"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Check, Plus, ShieldCheck } from "lucide-react";
import SectionHead from "./SectionHead";
import { FAQS } from "./faq-data";

interface Cta { label: string; href: string; }
interface Props { cta: Cta; }

const DELIVERABLES = [
  "SGPA and CGPA under Ordinance 11",
  "Promotion standing against the 50% credit rule",
  "Placement eligibility at 60 / 65 / 70 / 75",
  "Backlogs mapped to odd / even exam windows",
  "Semester grade sheets and a consolidated master transcript",
];

export default function FaqCtaSection({ cta }: Props) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <>
      <section className="relative w-full border-y border-border bg-surface/40">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <SectionHead
            className="lg:sticky lg:top-32 lg:self-start"
            kicker="Knowledge base"
            title="Questions, answered plainly."
            desc="The things students actually ask about GGSIPU results, ordinances and privacy."
          />

          <div className="border-t border-border">
            {FAQS.map((faq, index) => {
              const open = openIndex === index;
              return (
                <div key={faq.q} className="relative border-b border-border">
                  <motion.span
                    initial={false}
                    animate={{ scaleY: open ? 1 : 0, opacity: open ? 1 : 0 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    style={{ transformOrigin: "top" }}
                    className="absolute -left-4 bottom-6 top-6 hidden w-px bg-linear-to-b from-gold to-transparent sm:block"
                    aria-hidden="true"
                  />
                  <h3>
                    <button
                      type="button"
                      id={`home-faq-btn-${index}`}
                      onClick={() => setOpenIndex(open ? null : index)}
                      aria-expanded={open}
                      aria-controls={`home-faq-panel-${index}`}
                      className="group flex w-full items-center justify-between gap-6 py-6 text-left"
                    >
                      <span className={`text-base font-medium transition-colors sm:text-lg ${open ? "text-foreground" : "text-foreground-secondary group-hover:text-foreground"}`}>
                        {faq.q}
                      </span>
                      <span
                        className={`grid size-9 shrink-0 place-items-center rounded-full border transition-colors duration-300 ${
                          open ? "border-gold-border bg-gold-surface text-gold" : "border-border-strong text-foreground-muted group-hover:border-gold-border group-hover:text-gold"
                        }`}
                      >
                        <Plus size={16} aria-hidden="true" className={`transition-transform duration-300 ${open ? "rotate-45" : ""}`} />
                      </span>
                    </button>
                  </h3>
                  <AnimatePresence initial={false}>
                    {open && (
                      <motion.div
                        id={`home-faq-panel-${index}`}
                        role="region"
                        aria-labelledby={`home-faq-btn-${index}`}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                        className="overflow-hidden"
                      >
                        <p className="max-w-2xl pb-7 pr-14 text-[15px] leading-7 text-foreground-secondary">{faq.a}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 sm:py-20">
        <div className="home-panel grid gap-10 p-7 sm:p-12 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:gap-16 lg:p-14">
          <div>
            <h2 className="text-[2rem] font-semibold leading-[1.1] tracking-[-0.03em] text-balance text-foreground sm:text-[2.5rem]">
              Ready to see where you actually stand?
            </h2>
            <p className="mt-5 max-w-xl text-base leading-7 text-foreground-secondary">
              Sign in with your standard ExamWeb credentials. Your complete multi-semester standing is computed in under ten seconds.
            </p>
            <div className="mt-8">
              <Link href={cta.href} className="group inline-flex items-center justify-center gap-2 rounded-md border border-gold-bright/40 bg-linear-to-b from-gold-bright to-gold px-6 py-3 font-mono text-[13px] font-semibold whitespace-nowrap text-background shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_1px_2px_rgba(0,0,0,0.5)] transition-[filter,transform,color,border-color] duration-200 hover:brightness-110 active:scale-[0.98]">
                {cta.label}
                <ArrowRight size={14} aria-hidden="true" className="transition-transform duration-200 group-hover:translate-x-0.5" />
              </Link>
            </div>
            <p className="mt-5 flex items-center gap-2 font-mono text-xs text-foreground-muted">
              <ShieldCheck size={14} className="shrink-0 text-positive" aria-hidden="true" />
              Zero signup required · Direct university proxy
            </p>
          </div>

          <div>
            <p className="font-mono text-xs text-foreground-muted">What you get</p>
            <ul className="mt-4 divide-y divide-border border-y border-border">
              {DELIVERABLES.map((item) => (
                <li key={item} className="flex items-center gap-3 py-3 text-sm text-foreground-secondary">
                  <Check size={14} className="shrink-0 text-gold" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </>
  );
}
