"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { STREAM_TABS } from "./landing-data";

export default function StreamsTabs() {
  const [activeStream, setActiveStream] = useState(0);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  function handleTabKey(e: React.KeyboardEvent) {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    const dir = e.key === "ArrowRight" ? 1 : -1;
    const next = (activeStream + dir + STREAM_TABS.length) % STREAM_TABS.length;
    setActiveStream(next);
    tabRefs.current[next]?.focus();
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
      className="space-y-8"
    >
      <div
        role="tablist"
        aria-label="Programme streams"
        onKeyDown={handleTabKey}
        className="flex flex-wrap gap-1.5 border-b border-border pb-px"
      >
        {STREAM_TABS.map((tab, i) => (
          <button
            key={tab.id}
            ref={(el) => {
              tabRefs.current[i] = el;
            }}
            role="tab"
            id={`stream-tab-${tab.id}`}
            aria-selected={activeStream === i}
            aria-controls={`stream-panel-${tab.id}`}
            tabIndex={activeStream === i ? 0 : -1}
            onClick={() => setActiveStream(i)}
            className={`relative rounded-t-md px-4 py-2.5 font-mono text-xs transition-colors duration-200 ${
              activeStream === i
                ? "text-foreground"
                : "text-foreground-muted hover:text-foreground-secondary"
            }`}
          >
            {activeStream === i && (
              <motion.span
                layoutId="stream-tab-indicator"
                transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
                className="absolute inset-x-0 -bottom-px h-px bg-gold"
              />
            )}
            {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={STREAM_TABS[activeStream].id}
          role="tabpanel"
          id={`stream-panel-${STREAM_TABS[activeStream].id}`}
          aria-labelledby={`stream-tab-${STREAM_TABS[activeStream].id}`}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
          className="grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-2 lg:grid-cols-3"
        >
          {STREAM_TABS[activeStream].courses.map((c) => (
            <div
              key={c.name}
              className="group bg-surface p-5 transition-colors duration-200 hover:bg-surface-elevated"
            >
              <p className="font-mono text-sm font-semibold text-foreground">{c.name}</p>
              <p className="mt-1.5 text-xs leading-relaxed text-foreground-muted transition-colors group-hover:text-foreground-secondary">
                {c.detail}
              </p>
            </div>
          ))}
          <div className="flex items-center justify-center bg-surface p-5">
            <Link
              href="/calculations"
              className="link-underline inline-flex items-center gap-1.5 font-mono text-xs text-gold"
            >
              How calculations work
              <ArrowRight size={12} />
            </Link>
          </div>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}
