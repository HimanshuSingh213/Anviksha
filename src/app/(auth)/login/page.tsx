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

// What to know before signing in. Practical checklist.
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
          <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 pb-16 pt-6 sm:px-6 sm:gap-14 sm:pb-20 sm:pt-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,28rem)] lg:gap-16 lg:pb-28 lg:pt-16">
            {/* Left copy */}
            <div className="flex flex-col">
              <motion.p {...rise(0)} className="hidden items-baseline justify-center gap-3 text-sm text-foreground-muted sm:flex lg:justify-start">
                <span lang="hi" className="text-lg text-foreground-secondary">अन्वीक्षा</span>
                <span className="h-3 w-px translate-y-0.5 bg-border-strong" aria-hidden="true" />
                <span className="font-mono text-xs">noun: analytical enquiry</span>
              </motion.p>

              <h1 className="mt-2 text-center text-xl font-semibold leading-tight tracking-tight text-balance sm:mt-6 sm:text-[clamp(2.1rem,3.7vw,3.4rem)] sm:leading-[1.08] sm:tracking-[-0.03em] lg:text-left">
                <motion.span {...rise(0)} className="block text-foreground">
                  Use your ExamWeb login.
                </motion.span>
                <motion.span {...rise(0.08)} className="block text-gold">
                  Nothing new to register.
                </motion.span>
              </h1>

              <motion.p {...rise(0.12)} className="mt-3 hidden max-w-xl text-center text-sm leading-6 text-foreground-secondary sm:mt-6 sm:block sm:text-base sm:leading-7 lg:text-left">
                Anviksha has no accounts of its own. Sign in with the same enrollment number and
                password you use on the university portal, solve the live CAPTCHA, and your
                session opens the dossier on the next screen.
              </motion.p>

              <motion.ol
                {...rise(0.16)}
                className="mt-5 divide-y divide-border border-y border-border max-w-xl sm:mt-10 sm:grid sm:grid-cols-3 sm:gap-x-8 sm:divide-y-0 sm:border-y-0 lg:mt-12"
              >
                {STEPS.map((step, index) => (
                  <li
                    key={step.title}
                    className="flex items-start gap-3 py-2.5 sm:block sm:border-t sm:border-border sm:py-4"
                  >
                    <p className="font-mono text-xs font-semibold text-gold shrink-0 sm:mt-0">0{index + 1}</p>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-foreground sm:mt-2 sm:text-sm">{step.title}</p>
                      <p className="mt-0.5 text-[11px] leading-relaxed text-foreground-secondary sm:mt-1 sm:text-xs sm:leading-5">{step.body}</p>
                    </div>
                  </li>
                ))}
              </motion.ol>

              <motion.p {...rise(0.2)} className="mt-4 flex items-center justify-center gap-1.5 font-mono text-[11px] text-foreground-muted sm:mt-6 sm:text-xs lg:justify-start">
                <ShieldCheck size={14} className="shrink-0 text-positive" aria-hidden="true" />
                Direct to ExamWeb · No password saved · Auto sign-out
              </motion.p>

              <motion.div {...rise(0.24)} className="mt-4 flex flex-wrap items-center justify-center gap-2 sm:mt-6 sm:gap-3 lg:justify-start">
                <Link href="/notices" className="group inline-flex items-center justify-center gap-1.5 rounded-md border border-border-strong bg-surface px-3 py-1.5 font-mono text-xs font-semibold whitespace-nowrap text-foreground-secondary transition-[filter,transform,color,border-color] duration-200 hover:border-gold-border hover:text-gold active:scale-[0.98] sm:gap-2 sm:px-5 sm:py-2.5 sm:text-[13px]">
                  <Bell size={12} className="sm:size-3.25" aria-hidden="true" />
                  Live circulars
                </Link>
                <Link href="/calculations" className="group inline-flex items-center justify-center gap-1.5 rounded-md border border-border-strong bg-surface px-3 py-1.5 font-mono text-xs font-semibold whitespace-nowrap text-foreground-secondary transition-[filter,transform,color,border-color] duration-200 hover:border-gold-border hover:text-gold active:scale-[0.98] sm:gap-2 sm:px-5 sm:py-2.5 sm:text-[13px]">
                  <FileText size={12} className="sm:size-3.25" aria-hidden="true" />
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
