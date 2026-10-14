"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Hash,
  KeyRound,
  ChevronDown,
  Info,
  ShieldCheck,
  Bell,
  FileText,
} from "lucide-react";
import { LoginForm } from "@/components/login/LoginForm";
import HomeFooter from "@/components/home/HomeFooter";

// What to know before signing in. Practical checklist, not the homepage feature list.
const STEPS = [
  {
    title: "Keep these ready",
    body: "11-digit enrollment number, ExamWeb password, and one minute for the CAPTCHA.",
  },
  {
    title: "Direct ExamWeb pass-through",
    body: "Credentials go straight to examweb.ggsipu.ac.in over a short live session.",
  },
  {
    title: "If sign in fails",
    body: "Refresh the CAPTCHA, retry once, then reset the password on ExamWeb itself.",
  },
];

export default function LoginPage() {
  const [showHelper, setShowHelper] = useState(false);

  // Same fast rise as the homepage hero.
  const rise = (delay: number) => ({
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.3, ease: "easeOut" as const, delay },
  });

  return (
    <div className="relative flex min-h-screen flex-col overflow-x-clip bg-background text-foreground">
      <main id="main-content" className="flex-1">
        <section className="relative">
          <div className="mx-auto grid max-w-7xl grid-cols-1 gap-14 px-4 pb-20 pt-12 sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,28rem)] lg:gap-16 lg:pb-28 lg:pt-16">
            {/* Left copy */}
            <div className="flex flex-col">
              <motion.p {...rise(0)} className="flex items-baseline justify-center gap-3 text-sm text-foreground-muted lg:justify-start">
                <span lang="hi" className="text-lg text-foreground-secondary">अन्वीक्षा</span>
                <span className="h-3 w-px translate-y-0.5 bg-border-strong" aria-hidden="true" />
                <span className="font-mono text-xs">noun: analytical enquiry</span>
              </motion.p>

              <h1 className="mt-6 text-center text-[clamp(2.1rem,3.7vw,3.4rem)] font-semibold leading-[1.08] tracking-[-0.03em] text-balance lg:text-left">
                <motion.span {...rise(0)} className="block text-foreground">
                  Use your ExamWeb login.
                </motion.span>
                <motion.span {...rise(0.08)} className="block text-gold">
                  Nothing new to register.
                </motion.span>
              </h1>

              <motion.p {...rise(0.12)} className="mt-6 max-w-xl text-center text-base leading-7 text-foreground-secondary lg:text-left">
                Anviksha has no accounts of its own. Sign in with the same enrollment number and
                password you use on the university portal, solve the live CAPTCHA, and your
                session opens the dossier on the next screen.
              </motion.p>

              <motion.ol {...rise(0.16)} className="mt-10 grid max-w-xl grid-cols-1 gap-x-8 sm:grid-cols-3 lg:mt-12">
                {STEPS.map((step, index) => (
                  <li key={step.title} className="border-t border-border py-4">
                    <p className="font-mono text-xs font-semibold text-gold">0{index + 1}</p>
                    <p className="mt-2 text-sm font-medium text-foreground">{step.title}</p>
                    <p className="mt-1 text-xs leading-5 text-foreground-secondary">{step.body}</p>
                  </li>
                ))}
              </motion.ol>

              <motion.p {...rise(0.2)} className="mt-6 flex items-center justify-center gap-2 font-mono text-xs text-foreground-muted lg:justify-start">
                <ShieldCheck size={14} className="shrink-0 text-positive" aria-hidden="true" />
                Direct to ExamWeb · No password saved · Auto sign-out
              </motion.p>

              <motion.div {...rise(0.24)} className="mt-6 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
                <Link href="/notices" className="group inline-flex items-center justify-center gap-2 rounded-md border border-border-strong bg-surface px-5 py-2.5 font-mono text-[13px] font-semibold whitespace-nowrap text-foreground-secondary transition-[filter,transform,color,border-color] duration-200 hover:border-gold-border hover:text-gold active:scale-[0.98]">
                  <Bell size={13} aria-hidden="true" />
                  Live circulars
                </Link>
                <Link href="/calculations" className="group inline-flex items-center justify-center gap-2 rounded-md border border-border-strong bg-surface px-5 py-2.5 font-mono text-[13px] font-semibold whitespace-nowrap text-foreground-secondary transition-[filter,transform,color,border-color] duration-200 hover:border-gold-border hover:text-gold active:scale-[0.98]">
                  <FileText size={13} aria-hidden="true" />
                  Calculation Guide
                </Link>
              </motion.div>
            </div>

            {/* Right card */}
            <motion.div {...rise(0.1)} className="mx-auto w-full max-w-xl lg:max-w-none">
              <div className="home-panel p-5 sm:p-6">
                <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
                  <h2 className="text-sm font-semibold text-foreground">Exam portal sign in</h2>
                  <span className="whitespace-nowrap rounded border border-border-strong px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wide text-foreground-muted">
                    Session only
                  </span>
                </div>
                <p className="mt-2 text-[13px] text-foreground-secondary">Live connection to examweb.ggsipu.ac.in</p>

                {/* Credentials helper */}
                <div className="mt-5 overflow-hidden rounded-lg border border-border bg-background/40">
                  <button
                    type="button"
                    onClick={() => setShowHelper(!showHelper)}
                    className="flex w-full items-center justify-between px-4 py-3 text-xs font-semibold text-foreground-secondary transition hover:text-foreground"
                  >
                    <span className="flex items-center gap-2">
                      <Info size={14} className="text-gold" />
                      Login Credentials & Default Password Guide
                    </span>
                    <motion.span
                      animate={{ rotate: showHelper ? 180 : 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                      <ChevronDown size={16} />
                    </motion.span>
                  </button>

                  <AnimatePresence initial={false}>
                    {showHelper && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        className="overflow-hidden"
                      >
                        <div className="border-t border-border px-4 py-3 text-xs leading-relaxed text-foreground-secondary">
                          <p className="mb-2 flex items-center gap-1.5 font-medium text-foreground">
                            <Hash size={14} className="text-gold" />
                            <strong className="text-gold">Username: </strong>Your 11-digit GGSIPU Enrollment Number.
                          </p>
                          <p className="flex items-center gap-1.5 font-medium text-foreground">
                            <KeyRound size={14} className="text-gold" />
                            <strong className="text-gold">Default Password: </strong>Your father&apos;s full name with spaces between first, middle, and surname (if not changed by you).
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="mt-5 border-t border-border pt-5">
                  <LoginForm />
                </div>
              </div>
              <p className="mt-4 text-center text-xs text-foreground-muted lg:text-left">Closes with your session · passwords are never saved</p>
            </motion.div>
          </div>
        </section>
      </main>
      <HomeFooter />
    </div>
  );
}
