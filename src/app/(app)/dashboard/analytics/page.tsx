"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import AnalyticsView from "@/components/analytics/AnalyticsView";
import Skeleton from "@/components/dashboard/Skeleton";
import useResultStore from "@/store/result-store";

// Redirects to dashboard if no result has been loaded.
export default function AnalyticsPage() {
  const router = useRouter();
  const engine = useResultStore((state) => state.engineResult);

  useEffect(() => {
    if (!engine) router.push("/dashboard");
  }, [engine, router]);

  if (!engine) return <Skeleton />;
  return <AnalyticsView engine={engine} />;
}
