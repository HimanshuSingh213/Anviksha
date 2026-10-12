"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Bell, ShieldCheck } from "lucide-react";
import DossierCard from "./DossierCard";

interface Cta { label: string; href: string; }
interface Props { isAuthenticated: boolean; cta: Cta; }

const FACTS = [
  { value: "under 10s", label: "from sign-in to full dossier" },
  { value: "9", label: "ordinances in the verified registry" },
  { value: "15 min", label: "circulars refresh cycle" },
  { value: "0", label: "bytes of your data stored" },
];

export default function HeroSection({ isAuthenticated, cta }: Props) {
  // Fast load sequence (~300ms): everything rises once, headlines first.
  const EASE = "easeOut" as const;

  const rise = (delay: number) => ({
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.3, ease: EASE, delay },
  });

  return (
    <section className="relative">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-14 px-4 pb-20 pt-12 sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,35rem)] lg:gap-16 lg:pb-28 lg:pt-16">
        <div className="flex flex-col">
          <motion.p {...rise(0)} className="flex items-baseline justify-center gap-3 text-sm text-foreground-muted lg:justify-start">
            <span lang="hi" className="text-lg text-foreground-secondary">अन्वीक्षा</span>
            <span className="h-3 w-px translate-y-0.5 bg-border-strong" aria-hidden="true" />
            <span className="font-mono text-xs">noun: analytical enquiry</span>
          </motion.p>

          <h1 className="mt-6 text-center text-[clamp(2.1rem,3.7vw,3.4rem)] font-semibold leading-[1.08] tracking-[-0.03em] text-balance lg:text-left">
            <motion.span {...rise(0)} className="block text-foreground">
              GGSIPU gives you a marksheet.
            </motion.span>
            <motion.span {...rise(0.08)} className="block text-gold">
              Anviksha gives you the verdict.
            </motion.span>
          </h1>

          <motion.p {...rise(0.12)} className="mt-6 max-w-xl text-center text-base leading-7 text-foreground-secondary lg:text-left">
            A results engine for GGSIPU students: SGPA and CGPA under your programme&apos;s own ordinance, promotion standing against the credit rules, placement eligibility at 60 / 65 / 70 / 75, and semester grade sheets plus a consolidated master transcript, in under ten seconds.
          </motion.p>

          <motion.div {...rise(0.16)} className="mt-8 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
            <Link href={cta.href} className="group inline-flex items-center justify-center gap-2 rounded-md border border-gold-bright/40 bg-linear-to-b from-gold-bright to-gold px-6 py-3 font-mono text-[13px] font-semibold whitespace-nowrap text-background shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_1px_2px_rgba(0,0,0,0.5)] transition-[filter,transform,color,border-color] duration-200 hover:brightness-110 active:scale-[0.98]">
              {cta.label}
              <ArrowRight size={14} aria-hidden="true" className="transition-transform duration-200 group-hover:translate-x-0.5" />
            </Link>
            <Link href="/notices" className="group inline-flex items-center justify-center gap-2 rounded-md border border-border-strong bg-surface px-6 py-3 font-mono text-[13px] font-semibold whitespace-nowrap text-foreground-secondary transition-[filter,transform,color,border-color] duration-200 hover:border-gold-border hover:text-gold active:scale-[0.98]">
              <Bell size={13} aria-hidden="true" />
              Live circulars
            </Link>
          </motion.div>

          <motion.p {...rise(0.2)} className="mt-5 flex items-center justify-center gap-2 font-mono text-xs text-foreground-muted lg:justify-start">
            <ShieldCheck size={14} className="shrink-0 text-positive" aria-hidden="true" />
            {isAuthenticated ? "Welcome back: your dossier is where you left it." : "No signup · Nothing stored · Under 10 seconds"}
          </motion.p>

          <motion.dl {...rise(0.24)} className="mt-14 grid max-w-xl grid-cols-2 gap-x-8 lg:mt-auto lg:pt-14">
            {FACTS.map((fact) => (
              <div key={fact.label} className="flex flex-col-reverse justify-end border-t border-border py-4">
                <dt className="mt-1 text-xs leading-5 text-foreground-secondary">{fact.label}</dt>
                <dd className="tnum font-mono text-sm font-semibold text-foreground">{fact.value}</dd>
              </div>
            ))}
          </motion.dl>
        </div>

        <motion.div {...rise(0.1)} className="mx-auto w-full max-w-xl lg:max-w-none">
          <DossierCard />
        </motion.div>
      </div>
    </section>
  );
}
