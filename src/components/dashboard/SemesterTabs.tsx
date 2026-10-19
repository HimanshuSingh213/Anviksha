"use client";

import { motion } from "framer-motion";

interface Props {
  tabs: { label: string; value: string }[];
  active: string;
  onChange: (value: string) => void;
  label?: string; // Screen reader accessible label
  underlineId?: string; // Layout ID for shared layout animations
}

// Tab bar navigation with animated active underline indicator.
export default function SemesterTabs({
  tabs,
  active,
  onChange,
  label = "Semester",
  underlineId = "semester-underline",
}: Props) {
  return (
    <div
      role="tablist"
      aria-label={label}
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
                layoutId={underlineId}
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
