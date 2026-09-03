"use client";

import { BadgeCheck, Sigma } from "lucide-react";
import Tooltip from "@/components/common/Tooltip";
import type { SupportState } from "@/lib/academic/academic-db";

/**
 * Provenance chip — the inline trust mark rendered beside every calculated
 * number (VERIFIED = calculated under verified rules; RESULT_DERIVED = calculated from ExamWeb marks).
 * Tooltip carries the engine's reason.
 */

export function ProvenanceChip({
  state,
  tooltip,
}: {
  state: SupportState;
  tooltip: string;
}) {
  return (
    <Tooltip content={tooltip} position="top">
      <span
        className={`inline-flex shrink-0 items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold border cursor-help ${
          state === "VERIFIED"
            ? "bg-positive-surface text-positive border-positive-border"
            : state === "RESULT_DERIVED"
            ? "bg-chart-cyan-surface text-chart-cyan border-chart-cyan-border"
            : state === "UNAVAILABLE" || state === "NOT_APPLICABLE"
            ? "bg-surface text-foreground-muted border-border-strong"
            : state === "AMBIGUOUS"
            ? "bg-warning-surface text-warning border-warning-border"
            : "bg-gold-surface text-gold border-gold-border"
        }`}
      >
        {state === "VERIFIED" ? <BadgeCheck size={9} aria-hidden /> : <Sigma size={9} aria-hidden />}
        {state === "VERIFIED"
          ? "VERIFIED"
          : state === "RESULT_DERIVED"
          ? "RESULT DERIVED"
          : state === "UNAVAILABLE"
          ? "N/A"
          : state === "NOT_APPLICABLE"
          ? "NOT APPLICABLE"
          : state === "AMBIGUOUS"
          ? "AMBIGUOUS"
          : "WARNING"}
      </span>
    </Tooltip>
  );
}

export default ProvenanceChip;
