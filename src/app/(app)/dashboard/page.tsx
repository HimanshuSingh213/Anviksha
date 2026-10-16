"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios, { AxiosError } from "axios";
import { toast } from "sonner";
import DashboardView from "@/components/dashboard/DashboardView";
import Skeleton from "@/components/dashboard/Skeleton";
import useResultStore from "@/store/result-store";
import type { ResultData } from "@/types/result";
import type { ApiErrorResponse, ApiSuccessResponse } from "@/types/ApiResponse";

// Result loader and dashboard container
export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  const result = useResultStore((state) => state.result);
  const engine = useResultStore((state) => state.engineResult);
  const setResult = useResultStore((state) => state.setResult);
  const clearResult = useResultStore((state) => state.clearResult);

  const fetchResults = useCallback(async () => {
    setLoading(true);
    setFailed(false);
    try {
      const res = await axios.get<ApiSuccessResponse<ResultData>>("/api/result?euno=100");
      if (res.data?.data) setResult(res.data.data);
    } catch (err) {
      const apiErr = (err as AxiosError<ApiErrorResponse>).response?.data;

      if (apiErr && !apiErr.success) {
        if (apiErr.code === "SESSION_EXPIRED") {
          clearResult();
          router.push("/login?expired=true");
          return;
        }
        const fallback: Record<string, string> = {
          RATE_LIMITED: "Account access locked. Try again later.",
          VALIDATION_ERROR: "Validation failed.",
          UPSTREAM_ERROR: "GGSIPU portal is unreachable.",
          NETWORK_ERROR: "GGSIPU portal is unreachable.",
        };
        toast.error(apiErr.error || fallback[apiErr.code] || "An unexpected error occurred.");
      } else {
        toast.error("Network error. Please check your connection.");
      }
      setFailed(true);
    } finally {
      setLoading(false);
    }
  }, [clearResult, router, setResult]);

  useEffect(() => {
    const hasAuthCookie = document.cookie.split("; ").some((c) => c.startsWith("auth_session="));
    if (!result && hasAuthCookie) fetchResults();
    else setLoading(false);
  }, [result, fetchResults]);

  if (failed && !engine) {
    return (
      <main className="mx-auto flex min-h-[60vh] max-w-7xl flex-col items-start justify-center gap-4 px-4 sm:px-6">
        <h1 className="text-2xl font-semibold tracking-[-0.02em]">Could not load your result</h1>
        <p className="text-sm text-foreground-secondary">The result portal did not respond. Try again in a moment.</p>
        <button
          type="button"
          onClick={fetchResults}
          className="cursor-pointer rounded-md border border-border-strong bg-surface px-5 py-2.5 font-mono text-[13px] font-semibold text-foreground-secondary transition-colors hover:border-gold-border hover:text-gold"
        >
          Try again
        </button>
      </main>
    );
  }

  if (loading || !engine) return <Skeleton />;

  return <DashboardView engine={engine} />;
}