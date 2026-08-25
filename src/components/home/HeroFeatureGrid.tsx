"use client";

import { motion } from "framer-motion";
import {
  Calculator,
  ShieldCheck,
  TrendingUp,
  FileDown,
  Bell,
  Briefcase,
} from "lucide-react";

const HERO_FEATURES = [
  {
    icon: Calculator,
    label: "SGPA / CGPA",
    desc: "Auto-computed per Ordinance 11",
    color: "text-chart-cyan",
    bg: "bg-cat-blue-surface",
    border: "border-cat-blue-border",
  },
  {
    icon: ShieldCheck,
    label: "Promotion Check",
    desc: "50% credit rule monitored",
    color: "text-grade-excellent",
    bg: "bg-grade-excellent-surface",
    border: "border-grade-excellent-border",
  },
  {
    icon: TrendingUp,
    label: "Semester Trends",
    desc: "Track SGPA across semesters",
    color: "text-gold",
    bg: "bg-gold-surface",
    border: "border-gold-border",
  },
  {
    icon: FileDown,
    label: "Transcript Export",
    desc: "Consolidated PDF in one click",
    color: "text-cat-violet",
    bg: "bg-cat-violet-surface",
    border: "border-cat-violet-border",
  },
  {
    icon: Briefcase,
    label: "Placement Cutoffs",
    desc: "60% / 65% / 70% / 75% gates",
    color: "text-cat-pink",
    bg: "bg-cat-pink-surface",
    border: "border-cat-pink-border",
  },
  {
    icon: Bell,
    label: "Live Notices",
    desc: "Official circulars updated every 15 min",
    color: "text-gold",
    bg: "bg-gold-surface",
    border: "border-gold-border",
  },
];

export default function HeroFeatureGrid() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 w-full max-w-md lg:max-w-sm mx-auto lg:mx-0">
      {HERO_FEATURES.map((feat, i) => (
        <motion.div
          key={feat.label}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 + i * 0.06 }}
          whileHover={{ y: -2, scale: 1.02 }}
          className={`rounded-lg border ${feat.border} ${feat.bg} p-3 space-y-1.5 cursor-default transition-shadow hover:shadow-md`}
        >
          <feat.icon size={16} className={feat.color} />
          <p className="text-xs font-semibold text-foreground leading-tight">{feat.label}</p>
          <p className="text-[10px] font-mono text-foreground-muted leading-snug">{feat.desc}</p>
        </motion.div>
      ))}
    </div>
  );
}
