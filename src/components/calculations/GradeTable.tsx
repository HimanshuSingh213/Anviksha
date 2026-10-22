"use client";

import { motion } from "framer-motion";

interface GradeRow {
  range: string;
  grade: string;
  points: number;
  meaning: string;
}

// Badge and progress bar colors matching the dashboard result view
const GRADE_STYLES: Record<string, { chip: string; bar: string }> = {
  O: {
    chip: "bg-grade-excellent-surface text-grade-excellent border-grade-excellent-border",
    bar: "bg-grade-excellent",
  },
  "A+": {
    chip: "bg-grade-excellent-surface text-grade-excellent border-grade-excellent-border",
    bar: "bg-grade-excellent",
  },
  A: {
    chip: "bg-grade-good-surface text-grade-good border-grade-good-border",
    bar: "bg-grade-good",
  },
  "B+": {
    chip: "bg-grade-good-surface text-grade-good border-grade-good-border",
    bar: "bg-grade-good",
  },
  B: {
    chip: "bg-grade-average-surface text-grade-average border-grade-average-border",
    bar: "bg-grade-average",
  },
  C: {
    chip: "bg-grade-average-surface text-grade-average border-grade-average-border",
    bar: "bg-grade-average",
  },
  P: {
    chip: "bg-grade-pass-surface text-grade-pass border-grade-pass-border",
    bar: "bg-grade-pass",
  },
  F: {
    chip: "bg-grade-fail-surface text-grade-fail border-grade-fail-border",
    bar: "bg-grade-fail",
  },
};

const th = "px-3 py-2.5 text-left text-xs font-medium text-foreground-muted first:pl-0 last:pr-0";
const td = "px-3 py-3 align-middle first:pl-0 last:pr-0";

// Grade scale reference table with animated point bars
export default function GradeTable({ rows }: { rows: GradeRow[] }) {
  return (
    <table className="w-full">
      <thead>
        <tr className="border-b border-border">
          <th className={th}>Marks Range</th>
          <th className={th}>Letter Grade</th>
          <th className={th}>Grade Point</th>
          <th className={th}>Meaning</th>
        </tr>
      </thead>

      <tbody className="divide-y divide-border">
        {rows.map((row, index) => {
          const style = GRADE_STYLES[row.grade];

          return (
            <tr key={row.grade}>
              <td className={`${td} tnum font-mono text-xs text-foreground-secondary`}>{row.range}</td>

              <td className={td}>
                <span
                  className={`inline-flex min-w-9 justify-center rounded-md border px-2 py-0.5 font-mono text-xs font-bold ${style.chip}`}
                >
                  {row.grade}
                </span>
              </td>

              <td className={td}>
                <div className="flex items-center gap-2.5">
                  <span className="tnum w-5 font-mono text-sm font-semibold text-foreground">{row.points}</span>
                  <div className="hidden h-1 w-24 overflow-hidden rounded-full bg-border-strong sm:block">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${row.points * 10}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.8, delay: index * 0.05, ease: "easeOut" }}
                      className={`h-full rounded-full ${style.bar}`}
                    />
                  </div>
                </div>
              </td>

              <td className={`${td} text-sm text-foreground-secondary`}>{row.meaning}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
