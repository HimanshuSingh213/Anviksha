"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, ClipboardList, Search } from "lucide-react";
import Chip from "@/components/analytics/Chip";
import type { StdRC } from "@/types/appearingList";

const HEADERS = ["Enrollment", "Student Name", "Sem", "Code", "Paper", "Fee"];
const CENTERED = ["Sem", "Fee"];

// The appearing list
export default function AppearingListView({ papers }: { papers: StdRC[] }) {
  const [query, setQuery] = useState("");

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return papers;
    return papers.filter((p) =>
      [p.nrollno, p.stname, p.papercode, p.papername].some((v) =>
        v?.toLowerCase().includes(q),
      ),
    );
  }, [papers, query]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main id="main-content" className="mx-auto max-w-7xl space-y-6 px-4 py-10 sm:px-6 lg:py-12">
        <header>
          <Chip tone="gold">
            <ClipboardList size={12} aria-hidden="true" />
            Appearing List · RC
          </Chip>

          <h1 className="mt-4 text-2xl font-semibold tracking-[-0.02em] sm:text-3xl">
            Papers you are appearing in
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-foreground-secondary">
            Your appearing list for this semester, pulled from the university exam portal.
          </p>
        </header>

        {/* Search */}
        <div className="home-panel flex items-center gap-2.5 px-4 py-3">
          <Search size={14} className="shrink-0 text-foreground-muted" aria-hidden="true" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, enrollment, code or paper…"
            aria-label="Search appearing list"
            className="w-full bg-transparent font-mono text-xs text-foreground placeholder:text-foreground-muted focus:outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Clear search query"
              className="shrink-0 cursor-pointer rounded-md px-2 py-1 font-mono text-[10px] font-semibold uppercase tracking-wider text-foreground-secondary transition-colors hover:bg-surface-elevated hover:text-foreground"
            >
              Clear
            </button>
          )}
          <span className="shrink-0 font-mono text-[10px] text-foreground-muted">
            {rows.length} / {papers.length}
          </span>
        </div>

        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="home-panel overflow-hidden"
        >
          <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-b border-border px-5 py-4">
            <h2 className="text-base font-semibold tracking-tight">
              Papers
              <span className="ml-3 font-mono text-xs font-normal text-foreground-muted">
                {rows.length} {rows.length === 1 ? "paper" : "papers"}
              </span>
            </h2>
            <p className="font-mono text-[10px] italic text-foreground-muted sm:hidden">
              Scroll sideways →
            </p>
          </div>

          {rows.length === 0 ? (
            <p className="px-5 py-12 text-center text-sm text-foreground-secondary">
              {papers.length === 0
                ? "Your appearing list is empty."
                : `No papers match “${query}”.`}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <caption className="sr-only">Appearing list papers</caption>
                <thead>
                  <tr className="border-b border-border bg-surface-deep">
                    {HEADERS.map((h) => (
                      <th
                        key={h}
                        className={`px-4 py-3 font-mono text-[10px] font-bold uppercase tracking-widest ${
                          h === "Code" ? "text-gold" : "text-foreground-secondary"
                        } ${CENTERED.includes(h) ? "text-center" : "text-left"}`}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {rows.map((p, i) => (
                    <tr
                      key={`${p.nrollno}-${p.papercode}-${i}`}
                      className="border-b border-border transition-colors hover:bg-surface-elevated/60"
                    >
                      <td className="px-4 py-3 align-middle font-mono text-xs font-medium text-foreground-secondary">
                        {p.nrollno}
                      </td>
                      <td className="px-4 py-3 align-middle text-sm font-medium text-foreground">
                        {p.stname}
                      </td>
                      <td className="px-4 py-3 align-middle text-center font-mono text-xs text-foreground-secondary">
                        {p.euno}
                      </td>
                      <td className="px-4 py-3 align-middle font-mono text-xs font-bold text-gold">
                        {p.papercode}
                      </td>
                      <td className="px-4 py-3 align-middle text-sm text-foreground">
                        {p.papername}
                      </td>
                      <td className="px-4 py-3 align-middle text-center font-mono text-xs text-foreground-secondary">
                        {p.fee ? `₹${p.fee.toLocaleString("en-IN")}` : "–"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.section>

        {/* Bottom navigation */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-6 font-mono text-xs text-foreground-muted">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1.5 transition-colors hover:text-foreground"
          >
            <ArrowLeft size={13} aria-hidden="true" />
            <span>Back to Dashboard</span>
          </Link>

          <Link href="/calculations" className="transition-colors hover:text-gold">
            How Calculations Work
          </Link>
        </div>
      </main>
    </div>
  );
}
