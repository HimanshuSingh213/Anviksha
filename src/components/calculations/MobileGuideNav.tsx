"use client";

import { useEffect, useRef, useState } from "react";
import { motion, animate } from "framer-motion";

interface Props {
  items: { label: string; id: string }[];
}

// Pause scroll updates briefly after clicking to let the page scroll smoothly
const HOLD_MS = 200;

// Mobile navigation bar that sticks under the header and tracks the active section
export default function MobileGuideNav({ items }: Props) {
  const [activeId, setActiveId] = useState(items[0].id);
  const stripRef = useRef<HTMLDivElement>(null);
  const holdUntil = useRef(0);

  // Watch scroll position to highlight whichever section is near the top
  useEffect(() => {
    const onScroll = () => {
      // Pause updates while smooth scrolling to a clicked section
      if (Date.now() < holdUntil.current) {
        holdUntil.current = Date.now() + HOLD_MS;
        return;
      }

      const line = window.innerHeight * 0.3;
      let current = items[0].id;
      for (const item of items) {
        const section = document.getElementById(item.id);
        if (section && section.getBoundingClientRect().top <= line) {
          current = item.id;
        }
      }

      // Highlight the last section once the user reaches the bottom of the page
      if (window.innerHeight + window.scrollY >= document.body.scrollHeight - 2) {
        current = items[items.length - 1].id;
      }

      setActiveId(current);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [items]);

  // Scroll the strip horizontally to keep the active pill centered
  useEffect(() => {
    const strip = stripRef.current;
    const pill = strip?.querySelector<HTMLElement>(`[data-id="${activeId}"]`);
    if (!strip || !pill) return;

    const target = pill.offsetLeft - (strip.clientWidth - pill.clientWidth) / 2;

    const slide = animate(strip.scrollLeft, target, {
      duration: 0.35,
      ease: "easeOut",
      onUpdate: (value) => {
        strip.scrollLeft = value;
      },
    });
    return () => slide.stop();
  }, [activeId]);

  // Jump highlight immediately and pause scroll detection while moving
  const handleTap = (id: string) => {
    setActiveId(id);
    holdUntil.current = Date.now() + HOLD_MS;
  };

  return (
    <motion.nav
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      aria-label="Contents"
      className="sticky top-[calc(var(--status-strip-offset)+3.5rem)] z-20 -mx-4 mb-6 border-b border-border bg-background/90 backdrop-blur-xl sm:-mx-6 lg:hidden"
    >
      <motion.div
        ref={stripRef}
        layoutScroll
        className="relative flex gap-2 overflow-x-auto px-4 py-2.5 sm:px-6 scrollbar-none [&::-webkit-scrollbar]:hidden"
      >
        {items.map((item) => {
          const isActive = item.id === activeId;
          return (
            <motion.a
              key={item.id}
              href={`#${item.id}`}
              data-id={item.id}
              aria-current={isActive ? "location" : undefined}
              onClick={() => handleTap(item.id)}
              whileTap={{ scale: 0.94 }}
              className={`relative shrink-0 rounded-full px-3.5 py-1.5 font-mono text-xs font-semibold whitespace-nowrap transition-colors ${
                isActive ? "text-foreground" : "text-foreground-muted"
              }`}
            >
              {/* Sliding highlight indicator shared across all pills */}
              {isActive && (
                <motion.span
                  layoutId="mobile-nav-pill"
                  transition={{ type: "spring", stiffness: 450, damping: 35 }}
                  className="absolute inset-0 rounded-full border border-gold/50 bg-gold/15"
                />
              )}

              <span className="relative">{item.label}</span>
            </motion.a>
          );
        })}
      </motion.div>
    </motion.nav>
  );
}
