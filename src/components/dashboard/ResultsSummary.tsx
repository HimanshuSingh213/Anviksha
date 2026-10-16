import { AlertTriangle, CheckCircle2 } from "lucide-react";
import type { getDashboardMetrics } from "./dashboard-metrics";

type Metrics = ReturnType<typeof getDashboardMetrics>;

// Summary footer with totals and active backlog list
export default function ResultsSummary({ metrics }: { metrics: Metrics }) {
  const { backlogs, credits, marks } = metrics;

  const totals = [
    ...(credits.hasCredits ? [{ label: "Credits", value: `${credits.earned} / ${credits.offered}` }] : []),
    { label: "Marks", value: `${marks.obtained} / ${marks.max}` },
  ];

  return (
    <div className="border-t border-border px-5 py-4">
      <div className="flex flex-wrap items-center justify-between gap-x-8 gap-y-3">
        {backlogs.length > 0 ? (
          <p className="flex items-center gap-2 text-sm text-foreground-secondary">
            <AlertTriangle size={14} className="shrink-0 text-grade-fail" aria-hidden="true" />
            <span>
              <span className="tnum font-semibold text-grade-fail">{backlogs.length}</span> backlog subject
              {backlogs.length > 1 ? "s" : ""} detected
            </span>
          </p>
        ) : (
          <p className="flex items-center gap-2 text-sm text-foreground-secondary">
            <CheckCircle2 size={14} className="shrink-0 text-grade-excellent" aria-hidden="true" />
            All subjects cleared
          </p>
        )}

        <dl className="flex gap-8">
          {totals.map((t) => (
            <div key={t.label} className="flex items-baseline gap-2">
              <dt className="text-xs text-foreground-muted">{t.label}</dt>
              <dd className="tnum font-mono text-sm font-semibold text-foreground">{t.value}</dd>
            </div>
          ))}
        </dl>
      </div>

      {backlogs.length > 0 && (
        <div className="mt-4 border-t border-border pt-4">
          <p className="text-xs leading-5 text-foreground-secondary">
            Backlog papers carry 0 earned credits until cleared in re-appear examinations:
          </p>
          <ul className="mt-3 space-y-2">
            {backlogs.map((b, i) => (
              <li key={`${b.rawCode}-${i}`} className="flex items-baseline gap-3 text-sm">
                <span className="font-mono text-xs text-gold">{b.rawCode}</span>
                <span className="text-foreground">{b.name}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
