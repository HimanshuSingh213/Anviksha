"use client";

import { useState, useMemo } from "react";
import {
  Search,
  Calendar,
  FileText,
  ExternalLink,
  Download,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Clock,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { GGSIPUNotice, NoticeCategory } from "@/types/notice";

const CATEGORY_TABS: { label: string; value: "ALL" | NoticeCategory }[] = [
  { label: "All Circulars", value: "ALL" },
  { label: "Results Declared", value: "Result" },
  { label: "Date Sheets", value: "Datesheet" },
  { label: "Answer Sheet Inspection", value: "Inspection" },
  { label: "General Notices", value: "Notice" },
];

const PAGE_SIZE = 15;

function getBadgeStyle(category: NoticeCategory) {
  if (category === "Result") {
    return {
      text: "Result Declared",
      style: "bg-grade-excellent-surface text-grade-excellent border-grade-excellent-border",
    };
  }
  if (category === "Datesheet") {
    return {
      text: "Date Sheet",
      style: "bg-cat-blue-surface text-chart-cyan border-cat-blue-border",
    };
  }
  if (category === "Inspection") {
    return {
      text: "Inspection / Copy",
      style: "bg-gold-surface text-gold border-gold-border",
    };
  }
  return {
    text: "Notice",
    style: "bg-cat-violet-surface text-cat-violet border-cat-violet-border",
  };
}

interface Props {
  initialNotices: GGSIPUNotice[];
}

export default function NoticesClientView({ initialNotices }: Props) {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<"ALL" | NoticeCategory>("ALL");
  const [page, setPage] = useState(1);

  // Filter notices by category and search text
  const filteredNotices = useMemo(() => {
    const query = search.trim().toLowerCase();

    return initialNotices.filter((item) => {
      const matchCategory = activeCategory === "ALL" || item.category === activeCategory;
      const matchSearch =
        !query ||
        item.title.toLowerCase().includes(query) ||
        item.date.includes(query);
      return matchCategory && matchSearch;
    });
  }, [initialNotices, activeCategory, search]);

  // Paginate list
  const totalPages = Math.max(1, Math.ceil(filteredNotices.length / PAGE_SIZE));
  const currentNotices = useMemo(() => {
    const startIndex = (page - 1) * PAGE_SIZE;
    return filteredNotices.slice(startIndex, startIndex + PAGE_SIZE);
  }, [filteredNotices, page]);

  const selectCategory = (category: "ALL" | NoticeCategory) => {
    setActiveCategory(category);
    setPage(1);
  };

  const scrollToTop = () => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    scrollToTop();
  };

  const handleSearch = (text: string) => {
    setSearch(text);
    setPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Search & Filter Box */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="rounded-xl border border-border-strong bg-surface/95 backdrop-blur-md p-4 sm:p-5 shadow-sm space-y-4"
      >
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-foreground-muted"
            aria-hidden="true"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search by course (e.g. B.Tech, BCA, MBA), semester, or keyword..."
            aria-label="Search examination circulars and notices"
            className="w-full rounded-lg border border-border-strong bg-background py-2.5 pl-10 pr-16 font-mono text-xs sm:text-sm text-foreground outline-none transition focus:border-gold focus:ring-1 focus:ring-gold"
          />
          {search && (
            <button
              onClick={() => handleSearch("")}
              aria-label="Clear search query"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-mono text-foreground-secondary hover:text-foreground cursor-pointer px-2 py-1 rounded bg-surface-deep border border-border transition-colors"
            >
              Clear
            </button>
          )}
        </div>

        {/* Category Buttons with Framer Motion Spring Tab Indicator */}
        <div
          role="tablist"
          aria-label="Filter by notice category"
          className="flex items-center gap-1.5 p-1 bg-surface-deep border border-border-strong rounded-lg overflow-x-auto custom-h-scrollbar"
        >
          {CATEGORY_TABS.map((tab) => {
            const isSelected = activeCategory === tab.value;
            return (
              <button
                key={tab.value}
                role="tab"
                aria-selected={isSelected}
                onClick={() => selectCategory(tab.value)}
                className={`relative shrink-0 px-3 py-1.5 rounded-md text-xs font-mono font-medium transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-gold ${
                  isSelected
                    ? "text-background font-bold"
                    : "text-foreground-secondary hover:text-foreground"
                }`}
              >
                {isSelected && (
                  <motion.div
                    layoutId="noticeCategoryTab"
                    className="absolute inset-0 bg-gold rounded-md"
                    transition={{ type: "spring", stiffness: 450, damping: 35 }}
                  />
                )}
                <span className="relative z-10">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* Counter — aria-live so screen readers hear result-count changes */}
      <div aria-live="polite" className="flex items-center justify-between text-xs font-mono text-foreground-secondary px-1">
        <span className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-grade-excellent animate-pulse" aria-hidden="true" />
          Showing {filteredNotices.length} circulars
          {search && ` for "${search}"`}
        </span>
        <span className="hidden sm:flex items-center gap-1 text-foreground-muted text-[11px]">
          <Clock size={11} className="text-gold" />
          <span>Synced every 15 min · Official GGSIPU Feed</span>
        </span>
      </div>

      {/* Notice Cards List */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {currentNotices.length > 0 ? (
            currentNotices.map((notice, index) => {
              const badge = getBadgeStyle(notice.category);

              return (
                <motion.article
                  key={notice.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.2, delay: index * 0.015 }}
                  whileHover={{ y: -1 }}
                  className="rounded-lg border border-border-strong bg-surface hover:border-gold-border hover:shadow-md transition-all duration-200 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
                >
                  <div className="space-y-2 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider border shadow-xs ${badge.style}`}
                      >
                        {badge.text}
                      </span>
                      <span className="flex items-center gap-1 text-[11px] font-mono text-foreground-muted">
                        <Calendar size={11} className="shrink-0" />
                        {notice.date}
                      </span>
                    </div>

                    <h3 className="text-xs sm:text-sm font-semibold text-foreground leading-snug group-hover:text-gold transition-colors">
                      {notice.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-border">
                    <motion.a
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      href={notice.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`View PDF for ${notice.title}`}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-surface-deep border border-border-strong text-foreground text-xs font-mono font-semibold hover:border-gold hover:text-gold transition-colors shadow-xs focus-visible:ring-2 focus-visible:ring-gold"
                      title="Open official university PDF in new tab"
                    >
                      <FileText size={13} className="text-chart-cyan" aria-hidden="true" />
                      <span>View PDF</span>
                      <ExternalLink size={11} className="opacity-70" aria-hidden="true" />
                    </motion.a>

                    <motion.a
                      whileHover={{ scale: 1.06 }}
                      whileTap={{ scale: 0.94 }}
                      href={notice.url}
                      download
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Download PDF for ${notice.title}`}
                      className="p-2 rounded-md bg-surface border border-border text-foreground-secondary hover:text-foreground hover:border-gold transition-colors shadow-xs focus-visible:ring-2 focus-visible:ring-gold"
                      title="Direct download PDF"
                    >
                      <Download size={14} aria-hidden="true" />
                    </motion.a>
                  </div>
                </motion.article>
              );
            })
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="rounded-xl border border-border-strong bg-surface p-12 text-center space-y-3"
            >
              <div className="w-12 h-12 rounded-full bg-surface-deep border border-border flex items-center justify-center mx-auto text-foreground-muted">
                <Search size={22} aria-hidden="true" />
              </div>
              <h3 className="text-sm font-semibold font-mono text-foreground">
                No matching circulars found
              </h3>
              <p className="text-xs text-foreground-secondary max-w-sm mx-auto">
                No circulars matched your keyword. Try a broader search or switch back to All Circulars.
              </p>
              <button
                onClick={() => {
                  setSearch("");
                  setActiveCategory("ALL");
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded bg-foreground text-background text-xs font-mono font-bold cursor-pointer hover:bg-neutral-200 transition-colors shadow-xs focus-visible:ring-2 focus-visible:ring-gold"
              >
                <RotateCcw size={12} aria-hidden="true" />
                <span>Reset Filters</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <nav
          aria-label="Pagination Navigation"
          className="flex items-center justify-between border-t border-border-strong pt-4 text-xs font-mono text-foreground-secondary"
        >
          <span>
            Page {page} of {totalPages}
          </span>
          <div className="flex items-center gap-2">
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={() => handlePageChange(Math.max(1, page - 1))}
              disabled={page === 1}
              aria-label="Go to previous page"
              className="flex items-center gap-1 px-3.5 py-2 rounded bg-surface border border-border-strong text-foreground disabled:opacity-40 disabled:cursor-not-allowed hover:border-gold transition-colors cursor-pointer shadow-xs focus-visible:ring-2 focus-visible:ring-gold"
            >
              <ChevronLeft size={13} aria-hidden="true" />
              <span>Previous</span>
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={() => handlePageChange(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              aria-label="Go to next page"
              className="flex items-center gap-1 px-3.5 py-2 rounded bg-surface border border-border-strong text-foreground disabled:opacity-40 disabled:cursor-not-allowed hover:border-gold transition-colors cursor-pointer shadow-xs focus-visible:ring-2 focus-visible:ring-gold"
            >
              <span>Next</span>
              <ChevronRight size={13} aria-hidden="true" />
            </motion.button>
          </div>
        </nav>
      )}
    </div>
  );
}
