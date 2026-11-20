"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, X } from "lucide-react";
import { getActiveAnnouncements } from "./announcements";

const STORAGE_KEY = "anviksha_announcements_seen_date";

export default function AnnouncementModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isShaking, setIsShaking] = useState(false);

  const announcements = getActiveAnnouncements();
  const current = announcements[currentIndex];
  const isLast = currentIndex === announcements.length - 1;

  useEffect(() => {
    // Show only once per day
    const seenDate = localStorage.getItem(STORAGE_KEY);
    const today = new Date().toDateString();

    if (seenDate !== today && announcements.length > 0) {
      const timer = setTimeout(() => setIsOpen(true), 1500);
      return () => clearTimeout(timer);
    }
  }, [announcements.length]);

  const handleClose = () => {
    localStorage.setItem(STORAGE_KEY, new Date().toDateString());
    setIsOpen(false);
  };

  const handleNext = () => {
    if (isLast) {
      handleClose();
    } else {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const triggerBackdropFeedback = () => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 250);
  };

  return (
    <AnimatePresence>
      {isOpen && current && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Announcements"
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={triggerBackdropFeedback}
            className="absolute inset-0 bg-black/75 backdrop-blur-xs cursor-default"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 12 }}
            animate={{
              opacity: 1,
              scale: isShaking ? 1.02 : 1,
              y: 0,
            }}
            exit={{ opacity: 0, scale: 0.94, y: 10 }}
            transition={{ type: "spring", stiffness: 380, damping: 26 }}
            className="relative z-10 w-full max-w-md rounded-xl border border-border-strong bg-surface p-6 shadow-2xl"
          >
            {/* Header: Badge & Close Button */}
            <div className="flex items-start justify-between gap-3">
              <div>
                {current.badge && (
                  <span className="rounded border border-gold-border bg-gold-surface px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-gold">
                    {current.badge}
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={handleClose}
                aria-label="Close"
                className="flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded border border-border-strong bg-surface-deep text-foreground-secondary transition-colors hover:text-foreground"
              >
                <X size={13} strokeWidth={2.5} />
              </button>
            </div>

            {/* Content Body */}
            <div className="mt-4 min-h-28">
              <h3 className="text-lg font-bold leading-snug tracking-tight text-foreground">
                {current.title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-foreground-secondary">
                {current.body}
              </p>
              {current.cta && (
                <Link
                  href={current.cta.href}
                  onClick={handleClose}
                  className="group mt-3 inline-flex items-center gap-1.5 font-mono text-xs font-semibold text-gold transition-colors hover:text-gold-bright"
                >
                  {current.cta.label}
                  <ArrowRight
                    size={13}
                    aria-hidden="true"
                    className="transition-transform duration-200 group-hover:translate-x-0.5"
                  />
                </Link>
              )}
            </div>

            {/* Footer: Pagination Dots & Action Button */}
            <div className="mt-5 flex items-center justify-between gap-4 border-t border-border-strong pt-4">
              <div className="flex items-center gap-1.5">
                {announcements.map((item, index) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setCurrentIndex(index)}
                    aria-label={`Go to announcement ${index + 1}`}
                    className={`h-1.5 cursor-pointer rounded-full transition-all duration-200 ${
                      index === currentIndex
                        ? "w-5 bg-gold"
                        : "w-1.5 bg-border-strong hover:bg-foreground-muted"
                    }`}
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={handleNext}
                className="inline-flex shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-md bg-foreground px-4 py-2 font-mono text-[11px] font-bold uppercase tracking-wider text-background transition-opacity hover:opacity-90 active:scale-[0.98]"
              >
                {isLast ? "Okay" : "Next"}
                {!isLast && <ArrowRight size={12} aria-hidden="true" />}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
