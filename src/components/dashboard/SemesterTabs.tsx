"use client";

import { motion } from "framer-motion";

interface Props {
  tabs: { label: string; value: string }[];
  active: string;
  onChange: (value: string) => void;
}

// Semester selector tabs with animated active indicator
export default function SemesterTabs({ tabs, active, onChange }: Props) {
  return (
    <div
      role="tablist"
      aria-label="Semester"
      className="flex overflow-x-auto border-b border-border [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      {tabs.map((tab) => {
        const isActive = tab.value === active;
        return (
          <button
            key={tab.value}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.value)}
            className={`relative shrink-0 cursor-pointer px-4 py-3 font-mono text-xs font-semibold transition-colors ${
              isActive ? "text-foreground" : "text-foreground-muted hover:text-foreground-secondary"
            }`}
          >
            {tab.label}
            {isActive && (
              <motion.span
                layoutId="semester-underline"
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="absolute inset-x-0 -bottom-px h-0.5 bg-gold"
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
