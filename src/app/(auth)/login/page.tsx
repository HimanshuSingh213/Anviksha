"use client";

import { useEffect, useState } from "react";
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

const STEPS = [
  {
    title: "Keep these ready",
    body: "Your enrollment number, ExamWeb password, and one minute for the CAPTCHA.",
  },
  {
    title: "Direct ExamWeb pass-through",
    body: "Credentials go straight to examweb.ggsipu.ac.in over a short live session.",
  },
  {
    title: "If sign in fails",
    body: "Double-check your credentials and retry. Note: entering the wrong password 3 times locks your account. If you forgot your password, reset it on the official portal.",
  },
];

function CredentialsGuide() {
  const [open, setOpen] = useState(false);

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-background/40">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full cursor-pointer items-center justify-between px-4 py-3 text-xs font-semibold text-foreground-secondary transition hover:text-foreground"
      >
        <span className="flex items-center gap-2">
          <Info size={14} className="text-gold" />
          Login Credentials & Default Password Guide
        </span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
        >
          <ChevronDown size={16} />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="border-t border-border px-4 py-3 text-xs leading-relaxed text-foreground-secondary">
              <p className="mb-2 flex items-center gap-1.5 font-medium text-foreground">
                <Hash size={14} className="text-gold shrink-0" />
                <strong className="text-gold">Username:</strong> Your GGSIPU Enrollment Number.
              </p>
              <p className="flex items-center gap-1.5 font-medium text-foreground">
                <KeyRound size={14} className="text-gold shrink-0" />
                <strong className="text-gold">Default Password:</strong> Your father&apos;s full name with spaces between first, middle, and surname (if not changed by you).
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function LoginPage() {
  const [isMobileView, setIsMobileView] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 1024);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const rise = (delay: number) => ({
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.3, ease: "easeOut" as const, delay },
  });

  return (
    <div className="relative flex min-h-screen flex-col overflow-x-clip bg-background text-foreground">
      <main id="main-content" className="flex-1">
        {isMobileView ? (
          <div className="px-4 py-6 pb-14">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                Use your ExamWeb login
              </h1>
              <p className="mt-1.5 text-xs text-foreground-secondary">
                Nothing new to register · Direct session to university portal
              </p>
            </div>

            <div className="mb-6 rounded-lg border border-border bg-surface p-4">
              <h3 className="font-mono text-xs font-semibold text-gold mb-3">
                Things to know before signing in
              </h3>
              <div className="divide-y divide-border-subtle">
                {STEPS.map((step, index) => (
                  <div key={step.title} className="py-2.5 first:pt-0 last:pb-0 flex items-start gap-2.5">
                    <span className="font-mono text-xs font-semibold text-gold shrink-0">
                      0{index + 1}
                    </span>
                    <div>
                      <p className="text-xs font-medium text-foreground">{step.title}</p>
                      <p className="mt-0.5 text-[11px] leading-relaxed text-foreground-secondary">
                        {step.body}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="home-panel p-5">
              <div className="flex items-center justify-between pb-3 border-b border-border">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-foreground">
                  Exam Portal Sign In
                </h2>
                <span className="rounded border border-border-strong px-1.5 py-0.5 font-mono text-[10px] uppercase text-foreground-muted">
                  Session Only
                </span>
              </div>

              <div className="mt-4">
                <CredentialsGuide />
              </div>

              <div className="mt-5 border-t border-border pt-5">
                <LoginForm />
              </div>
            </div>

            <p className="mt-4 flex items-center justify-center gap-1.5 font-mono text-[11px] text-foreground-muted text-center">
              <ShieldCheck size={14} className="shrink-0 text-positive" aria-hidden="true" />
              Direct to ExamWeb · No password saved · Auto sign-out
            </p>

            <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
              <Link
                href="/notices"
                className="inline-flex items-center gap-1.5 rounded-md border border-border-strong bg-surface px-3 py-1.5 font-mono text-xs font-semibold text-foreground-secondary hover:border-gold-border hover:text-gold transition-colors"
              >
                <Bell size={12} aria-hidden="true" />
                Live circulars
              </Link>
              <Link
                href="/calculations"
                className="inline-flex items-center gap-1.5 rounded-md border border-border-strong bg-surface px-3 py-1.5 font-mono text-xs font-semibold text-foreground-secondary hover:border-gold-border hover:text-gold transition-colors"
              >
                <FileText size={12} aria-hidden="true" />
                Calculation Guide
              </Link>
            </div>
          </div>
        ) : (
          <div className="mx-auto max-w-7xl px-6 py-16 lg:py-20">
            <div className="grid grid-cols-[minmax(0,1fr)_28rem] gap-16 items-start">
              <div className="flex flex-col">
                <motion.p {...rise(0)} className="flex items-baseline gap-3 text-sm text-foreground-muted">
                  <span lang="hi" className="text-lg text-foreground-secondary">अन्वीक्षा</span>
                  <span className="h-3 w-px translate-y-0.5 bg-border-strong" aria-hidden="true" />
                  <span className="font-mono text-xs">noun: analytical enquiry</span>
                </motion.p>

                <h1 className="mt-6 text-4xl font-semibold leading-tight tracking-tight">
                  <motion.span {...rise(0)} className="block text-foreground">
                    Use your ExamWeb login.
                  </motion.span>
                  <motion.span {...rise(0.08)} className="block text-gold">
                    Nothing new to register.
                  </motion.span>
                </h1>

                <motion.p {...rise(0.12)} className="mt-6 max-w-xl text-base leading-7 text-foreground-secondary">
                  Anviksha has no accounts of its own. Sign in with the same enrollment number and
                  password you use on the university portal, solve the live CAPTCHA, and your
                  session opens the dossier on the next screen.
                </motion.p>

                <motion.ol {...rise(0.16)} className="mt-12 grid grid-cols-3 gap-6 max-w-xl">
                  {STEPS.map((step, index) => (
                    <li key={step.title} className="border-t border-border pt-4">
                      <p className="font-mono text-xs font-semibold text-gold">0{index + 1}</p>
                      <p className="mt-2 text-sm font-medium text-foreground">{step.title}</p>
                      <p className="mt-1 text-xs leading-5 text-foreground-secondary">{step.body}</p>
                    </li>
                  ))}
                </motion.ol>

                <motion.p {...rise(0.2)} className="mt-8 flex items-center gap-1.5 font-mono text-xs text-foreground-muted">
                  <ShieldCheck size={14} className="shrink-0 text-positive" aria-hidden="true" />
                  Direct to ExamWeb · No password saved · Auto sign-out
                </motion.p>

                <motion.div {...rise(0.24)} className="mt-6 flex items-center gap-3">
                  <Link
                    href="/notices"
                    className="inline-flex items-center gap-2 rounded-md border border-border-strong bg-surface px-4 py-2 font-mono text-xs font-semibold text-foreground-secondary transition-colors hover:border-gold-border hover:text-gold"
                  >
                    <Bell size={13} aria-hidden="true" />
                    Live circulars
                  </Link>
                  <Link
                    href="/calculations"
                    className="inline-flex items-center gap-2 rounded-md border border-border-strong bg-surface px-4 py-2 font-mono text-xs font-semibold text-foreground-secondary transition-colors hover:border-gold-border hover:text-gold"
                  >
                    <FileText size={13} aria-hidden="true" />
                    Calculation Guide
                  </Link>
                </motion.div>
              </div>

              <motion.div {...rise(0.1)} className="w-full">
                <div className="home-panel p-6">
                  <div className="flex items-center justify-between pb-3 border-b border-border">
                    <h2 className="text-sm font-semibold text-foreground">Exam portal sign in</h2>
                    <span className="rounded border border-border-strong px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wide text-foreground-muted">
                      Session only
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-foreground-secondary">
                    Live connection to examweb.ggsipu.ac.in
                  </p>

                  <div className="mt-5">
                    <CredentialsGuide />
                  </div>

                  <div className="mt-5 border-t border-border pt-5">
                    <LoginForm />
                  </div>
                </div>
                <p className="mt-4 text-center text-xs text-foreground-muted">
                  Closes with your session · passwords are never saved
                </p>
              </motion.div>
            </div>
          </div>
        )}
      </main>
      <HomeFooter />
    </div>
  );
}
