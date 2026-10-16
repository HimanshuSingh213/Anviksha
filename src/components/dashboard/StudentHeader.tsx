"use client";

import { motion } from "framer-motion";
import PixelAvatar from "./PixelAvatar";
import type { ExamWebProfile } from "@/types/result";

export default function StudentHeader({ profile }: { profile: ExamWebProfile }) {
  const facts = [
    { label: "Enrollment", value: profile.nrollno, mono: true },
    { label: "Batch", value: profile.byoa, mono: true },
    { label: "Programme", value: profile.prgcode, mono: true },
    { label: "Institute", value: profile.iname, mono: false },
  ];

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <div className="flex items-center gap-4">
        <PixelAvatar name={profile.stname ?? "?"} />
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-[-0.02em] text-balance sm:text-3xl">{profile.stname}</h1>
          <p className="mt-1 text-sm leading-6 text-foreground-secondary">{profile.prgname}</p>
        </div>
      </div>

      <dl className="mt-8 grid grid-cols-[auto_auto_1fr] gap-x-8 sm:grid-cols-[auto_auto_auto_minmax(0,1fr)]">
        {facts.map((fact) => (
          <div key={fact.label} className="flex flex-col-reverse justify-end border-t border-border py-4 last:col-span-3 sm:last:col-span-1">
            <dt className="mt-1 text-xs leading-5 text-foreground-secondary">{fact.label}</dt>
            <dd className={`text-sm text-foreground ${fact.mono ? "tnum font-mono font-semibold" : "font-medium"}`}>
              {fact.value ?? "–"}
            </dd>
          </div>
        ))}
      </dl>
    </motion.section>
  );
}
