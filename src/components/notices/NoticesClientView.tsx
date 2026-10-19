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
} from "lucide-react";
import { motion } from "framer-motion";
import Chip, { type ChipTone } from "@/components/analytics/Chip";
import SemesterTabs from "@/components/dashboard/SemesterTabs";
import { GGSIPUNotice, NoticeCategory } from "@/types/notice";

const CATEGORY_TABS: { label: string; value: "ALL" | NoticeCategory }[] = [
  { label: "All Circulars", value: "ALL" },
  { label: "Results Declared", value: "Result" },
  { label: "Date Sheets", value: "Datesheet" },
  { label: "Answer Sheet Inspection", value: "Inspection" },
  { label: "General Notices", value: "Notice" },
];

const PAGE_SIZE = 15;

// Category badge configuration with semantic Chip tone mapping.
const BADGES: Record<NoticeCategory, { text: string; tone: ChipTone }> = {
  Result: { text: "Result Declared", tone: "good" },
  Datesheet: { text: "Date Sheet", tone: "blue" },
  Inspection: { text: "Inspection / Copy", tone: "gold" },
  Notice: { text: "Notice", tone: "violet" },
};

// Shared button styling for PDF viewing and downloading.
const ACTION_BUTTON =
  "inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-border-strong text-foreground-secondary transition-colors hover:border-gold-border hover:text-gold focus-visible:ring-2 focus-visible:ring-gold";

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

  const selectCategory = (value: string) => {
    setActiveCategory(value as "ALL" | NoticeCategory);
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSearch = (text: string) => {
    setSearch(text);
    setPage(1);
  };

  const resetFilters = () => {
    setSearch("");
    setActiveCategory("ALL");
    setPage(1);
  };

  return (
    <div className="space-y-5">
      {/* Search box and category tabs */}
      <div>
        <div className="relative">
          <Search
            size={16}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground-muted"
            aria-hidden="true"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search by course (e.g. B.Tech, BCA, MBA), semester, or keyword..."
            aria-label="Search examination circulars and notices"
            className="w-full rounded-lg border border-border bg-surface py-3 pl-11 pr-20 text-base text-ellipsis text-foreground outline-none transition-colors placeholder:text-foreground-muted focus:border-gold-border focus:ring-1 focus:ring-gold-border sm:text-sm"
          />
          {search && (
            <button
              type="button"
              onClick={() => handleSearch("")}
              aria-label="Clear search query"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 cursor-pointer rounded-md px-2.5 py-1.5 font-mono text-xs text-foreground-secondary transition-colors hover:bg-surface-hover hover:text-foreground"
            >
              Clear
            </button>
          )}
        </div>

        <div className="mt-3">
          <SemesterTabs
            tabs={CATEGORY_TABS}
            active={activeCategory}
            onChange={selectCategory}
            label="Filter by notice category"
            underlineId="noticeCategoryUnderline"
          />
        </div>
      </div>

      {/* Live circular counter with screen reader live region */}
      <p aria-live="polite" className="px-1 text-xs text-foreground-secondary">
        Showing <span className="tnum font-mono text-foreground">{filteredNotices.length}</span> circulars
        {search && ` for "${search}"`}
      </p>

      {currentNotices.length > 0 ? (
        <div className="home-panel divide-y divide-border overflow-hidden">
          {currentNotices.map((notice, index) => {
            const badge = BADGES[notice.category];

            return (
              <motion.article
                key={notice.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: "easeOut", delay: Math.min(index, 8) * 0.03 }}
                className="flex items-start gap-3 p-4 transition-colors hover:bg-surface-hover/50 sm:items-center sm:gap-5 sm:px-5"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
                    <Chip tone={badge.tone}>{badge.text}</Chip>
                    <span className="flex items-center gap-1.5 font-mono text-xs text-foreground-muted">
                      <Calendar size={12} className="shrink-0" aria-hidden="true" />
                      {notice.date}
                    </span>
                  </div>

                  <h3 className="mt-2.5 text-sm font-medium leading-5 text-foreground sm:text-[15px] sm:leading-6">
                    {notice.title}
                  </h3>
                </div>

                {/* Responsive action buttons */}
                <div className="flex shrink-0 items-center gap-2">
                  <motion.a
                    whileTap={{ scale: 0.95 }}
                    href={notice.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`View PDF for ${notice.title}`}
                    title="Open official university PDF in new tab"
                    className={`${ACTION_BUTTON} w-9 sm:w-auto sm:px-3.5 sm:text-xs sm:font-semibold`}
                  >
                    <FileText size={15} aria-hidden="true" />
                    <span className="hidden sm:inline">View PDF</span>
                    <ExternalLink size={12} className="hidden opacity-60 sm:block" aria-hidden="true" />
                  </motion.a>

                  <motion.a
                    whileTap={{ scale: 0.95 }}
                    href={notice.url}
                    download
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Download PDF for ${notice.title}`}
                    title="Direct download PDF"
                    className={`${ACTION_BUTTON} w-9`}
                  >
                    <Download size={15} aria-hidden="true" />
                  </motion.a>
                </div>
              </motion.article>
            );
          })}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="home-panel flex flex-col items-center px-4 py-14 text-center"
        >
          <div className="flex size-12 items-center justify-center rounded-xl border border-border-strong bg-surface-elevated text-foreground-muted">
            <Search size={20} aria-hidden="true" />
          </div>
          <h3 className="mt-4 text-base font-semibold text-foreground">No matching circulars found</h3>
          <p className="mt-1.5 max-w-sm text-sm leading-6 text-foreground-secondary">
            No circulars matched your keyword. Try a broader search or switch back to All Circulars.
          </p>
          <button
            type="button"
            onClick={resetFilters}
            className="mt-6 inline-flex cursor-pointer items-center gap-2 rounded-md border border-white bg-white px-5 py-2.5 font-mono text-xs font-bold uppercase tracking-wider text-black transition-colors duration-200 hover:bg-neutral-200"
          >
            <RotateCcw size={13} aria-hidden="true" />
            Reset Filters
          </button>
        </motion.div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <nav
          aria-label="Pagination Navigation"
          className="flex items-center justify-between gap-3 text-xs text-foreground-secondary"
        >
          <span className="tnum font-mono">
            Page {page} of {totalPages}
          </span>

          <div className="flex items-center gap-2">
            <motion.button
              type="button"
              whileTap={{ scale: 0.96 }}
              onClick={() => handlePageChange(Math.max(1, page - 1))}
              disabled={page === 1}
              aria-label="Go to previous page"
              className={`${ACTION_BUTTON} cursor-pointer gap-1.5 px-3.5 font-semibold disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-border-strong disabled:hover:text-foreground-secondary`}
            >
              <ChevronLeft size={14} aria-hidden="true" />
              Previous
            </motion.button>

            <motion.button
              type="button"
              whileTap={{ scale: 0.96 }}
              onClick={() => handlePageChange(Math.min(totalPages, page + 1))}
              disabled={page === totalPages}
              aria-label="Go to next page"
              className={`${ACTION_BUTTON} cursor-pointer gap-1.5 px-3.5 font-semibold disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-border-strong disabled:hover:text-foreground-secondary`}
            >
              Next
              <ChevronRight size={14} aria-hidden="true" />
            </motion.button>
          </div>
        </nav>
      )}
    </div>
  );
}
