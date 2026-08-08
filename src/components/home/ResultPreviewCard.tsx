"use client";

import { motion } from "framer-motion";
import { Award } from "lucide-react";

export default function ResultPreviewCard() {
  return (
    <div className="relative mx-auto w-full max-w-sm lg:mx-0">
      <div className="absolute -inset-6 -z-10 rounded-full bg-gold opacity-[0.12] blur-3xl" aria-hidden="true" />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="rounded-2xl border border-border-strong bg-surface/90 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.5)] backdrop-blur-xl"
      >
        <div className="flex items-center justify-between">
          <span className="font-mono text-[10px] uppercase tracking-widest text-foreground-muted">
            Semester Result
          </span>
          <span className="flex items-center gap-1.5 rounded-full border border-gold-border bg-gold-surface px-2.5 py-1 font-mono text-[10px] font-semibold text-gold">
            <Award size={11} />
            Distinction
          </span>
        </div>

        <div className="mt-4 flex items-baseline gap-2">
          <span className="text-4xl font-bold tracking-tight text-foreground">8.91</span>
          <span className="text-sm text-foreground-secondary">Overall CGPA</span>
          <span className="ml-auto text-xs font-medium text-positive">▲ 0.3</span>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2">
          {[
            { label: "Credits", value: "172/180" },
            { label: "Backlogs", value: "0" },
            { label: "Equiv. %", value: "89.1%" },
          ].map((s) => (
            <div key={s.label} className="rounded-lg border border-border bg-background/60 px-2 py-2 text-center">
              <p className="text-sm font-semibold text-foreground">{s.value}</p>
              <p className="mt-0.5 font-mono text-[9px] uppercase tracking-wide text-foreground-muted">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="mt-4 rounded-lg border border-border bg-background/60 p-3">
          <svg viewBox="0 0 260 60" className="w-full">
            <polyline
              points="8,45 44,38 80,42 116,28 152,30 188,16 224,12"
              fill="none"
              stroke="var(--color-gold)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="224" cy="12" r="3" fill="var(--color-gold)" />
          </svg>
          <div className="mt-1 flex justify-between font-mono text-[9px] text-foreground-muted">
            {["S1", "S2", "S3", "S4", "S5", "S6", "S7"].map((s) => (
              <span key={s}>{s}</span>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Ambient floating chips */}
      <motion.span
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: [0, -6, 0] }}
        transition={{ opacity: { delay: 0.4, duration: 0.5 }, y: { repeat: Infinity, duration: 4, ease: "easeInOut", delay: 0.4 } }}
        className="absolute -top-4 -right-3 hidden rounded-lg border border-grade-excellent-border bg-grade-excellent-surface px-2.5 py-1 font-mono text-[10px] font-medium text-grade-excellent shadow-md backdrop-blur-md lg:block"
      >
        0 Backlogs
      </motion.span>
      <motion.span
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: [0, -6, 0] }}
        transition={{ opacity: { delay: 0.6, duration: 0.5 }, y: { repeat: Infinity, duration: 4.5, ease: "easeInOut", delay: 0.6 } }}
        className="absolute -bottom-4 -left-4 hidden rounded-lg border border-cat-blue-border bg-cat-blue-surface px-2.5 py-1 font-mono text-[10px] font-medium text-cat-blue shadow-md backdrop-blur-md lg:block"
      >
        Sem 6 of 8
      </motion.span>
    </div>
  );
}
