"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import useResultStore from "@/store/result-store";

const FORM_URL = "https://docs.google.com/forms/d/e/1FAIpQLScCFWW_uGRiGLARGp_NQ-OSr6dSfmfABfqTiqiVwamY5I521g/viewform";

export default function ReportForm() {
  const searchParams = useSearchParams();
  const result = useResultStore((state) => state.result);
  const profile = result?.stprofile;

  // Build prefilled form URL from store and route info
  const embedUrl = useMemo(() => {
    const params = new URLSearchParams();
    params.set("embedded", "true");

    const from = searchParams.get("from") || "";

    if (from) {
      params.set("entry.321143605", from);
    }

    if (profile?.prgname) {
      params.set("entry.2095254728", profile.prgname);
    }

    // Diagnostic context for developer debugging
    const contextLines: string[] = [];
    if (from) contextLines.push(`Route: ${from}`);
    if (profile?.iname) contextLines.push(`College: ${profile.iname}`);
    if (typeof window !== "undefined") {
      contextLines.push(`Resolution: ${window.innerWidth}x${window.innerHeight}`);
    }

    if (contextLines.length > 0) {
      params.set("entry.197991408", contextLines.join("\n"));
    }

    return `${FORM_URL}?${params.toString()}`;
  }, [searchParams, profile]);

  return (
    <div className="rounded-xl border border-border-strong bg-surface overflow-hidden shadow-lg">
      <div className="p-3 border-b border-border-strong bg-surface-deep/80 flex items-center justify-between text-xs font-mono text-foreground-muted">
        <span className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-gold animate-pulse" />
          Official Feedback Form
        </span>
      </div>

      <div className="w-full min-h-180 sm:min-h-205 bg-white">
        <iframe
          src={embedUrl}
          title="Anviksha Report a Problem Google Form"
          width="100%"
          height="820"
          className="w-full h-205 border-0"
          loading="lazy"
        >
          Loading feedback form…
        </iframe>
      </div>
    </div>
  );
}
