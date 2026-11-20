"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios, { AxiosError } from "axios";
import { toast } from "sonner";
import Skeleton from "@/components/dashboard/Skeleton";
import AppearingListView from "@/components/appearingList/AppearingListView";
import useRCStore from "@/store/rc-store";
import type { StdRC } from "@/types/appearingList";
import type { ApiErrorResponse, ApiSuccessResponse } from "@/types/ApiResponse";

// Appearing List (RC) page: shows the papers pulled from the exam portal.
export default function RCPage() {
  const router = useRouter();
  const [papers, setPapers] = useState<StdRC[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  const fetchAppearingList = useCallback(async (showLoading: boolean) => {
    if (showLoading) setLoading(true);
    setFailed(false);
    try {
      const res = await axios.get<ApiSuccessResponse<StdRC[]>>("/api/rc");
      if (res.data?.data) {
        useRCStore.getState().setPapers(res.data.data);
        setPapers(res.data.data);
      }
    } catch (err) {
      const apiErr = (err as AxiosError<ApiErrorResponse>).response?.data;

      if (apiErr && !apiErr.success) {
        if (apiErr.code === "SESSION_EXPIRED") {
          useRCStore.getState().clearRC();
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
  }, [router]);

  useEffect(() => {
    const hasAuthCookie = document.cookie.split("; ").some((c) => c.startsWith("auth_session="));
    if (!hasAuthCookie) {
      router.push("/login");
      return;
    }

    // The dashboard caches the list in the session — show it instantly, then
    // refresh it quietly in the background.
    const cached = useRCStore.getState().papers;
    if (cached) {
      setPapers(cached);
      setLoading(false);
      fetchAppearingList(false);
    } else {
      fetchAppearingList(true);
    }
  }, [fetchAppearingList, router]);

  if (loading) return <Skeleton />;

  if (failed && !papers) {
    return (
      <main className="mx-auto flex min-h-[60vh] max-w-7xl flex-col items-start justify-center gap-4 px-4 sm:px-6">
        <h1 className="text-2xl font-semibold tracking-[-0.02em]">Could not load your appearing list</h1>
        <p className="text-sm text-foreground-secondary">The exam portal did not respond. Try again in a moment.</p>
        <button
          type="button"
          onClick={() => fetchAppearingList(true)}
          className="cursor-pointer rounded-md border border-border-strong bg-surface px-5 py-2.5 font-mono text-[13px] font-semibold text-foreground-secondary transition-colors hover:border-gold-border hover:text-gold"
        >
          Try again
        </button>
      </main>
    );
  }

  return <AppearingListView papers={papers ?? []} />;
}
