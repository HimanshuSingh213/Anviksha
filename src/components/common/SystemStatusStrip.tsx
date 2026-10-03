"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type SystemStatus = "Checking" | "Operational" | "Slow" | "Offline";

const TIMEOUT_MS = 8000;
const SLOW_AFTER_MS = 1000;
const CHECK_EVERY_MS = 45000;
const SHOW_FOR_MS = 12000;

function labelFor(status: SystemStatus): string {
  if (status === "Operational") return "Back Online";
  return status;
}

export interface StatusPreview {
  status: SystemStatus;
  latency: number | null;
  visible: boolean;
}

/**
 * Global system status indicator.
 * Displays network state and response latency, coordinating top offset with sticky navigation.
 */
export default function SystemStatusStrip({
  preview,
}: {
  preview?: StatusPreview;
}) {
  const [status, setStatus] = useState<SystemStatus>("Checking");
  const [latency, setLatency] = useState<number | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  const previousStatusRef = useRef<SystemStatus | null>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const checkIdRef = useRef(0);
  const missedAlertRef = useRef(false);

  // Show the status strip for SHOW_FOR_MS duration
  const showStrip = useCallback(() => {
    setIsVisible(true);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => {
      setIsVisible(false);
    }, SHOW_FOR_MS);
  }, []);

  // Process status transition and determine alert visibility
  const updateStatus = useCallback(
    (nextStatus: SystemStatus, nextLatency: number | null) => {
      const prevStatus = previousStatusRef.current;
      previousStatusRef.current = nextStatus;
      setStatus(nextStatus);
      setLatency(nextLatency);

      // Ignore repeated checks with identical status
      if (prevStatus === nextStatus) return;

      const isProblem = nextStatus === "Slow" || nextStatus === "Offline";
      const isBackOnline =
        nextStatus === "Operational" && prevStatus === "Offline";

      // Suppress alert on initial healthy resolution or benign transitions
      if (!isProblem && !isBackOnline) {
        if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
        setIsVisible(false);
        return;
      }

      // Queue alert if the tab is hidden so it appears upon focus
      if (document.visibilityState === "hidden") {
        missedAlertRef.current = true;
        return;
      }
      missedAlertRef.current = false;
      showStrip();
    },
    [showStrip]
  );

  // Ping /api/health and measure response latency
  const checkHealth = useCallback(async () => {
    if (typeof navigator !== "undefined" && !navigator.onLine) {
      updateStatus("Offline", null);
      return;
    }

    if (abortRef.current) abortRef.current.abort();

    const controller = new AbortController();
    abortRef.current = controller;
    const myCheckId = ++checkIdRef.current;

    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);
    const startedAt = performance.now();

    try {
      const res = await fetch("/api/health", {
        signal: controller.signal,
        cache: "no-store",
        headers: { Accept: "application/json" },
      });
      clearTimeout(timeoutId);

      const ms = Math.round(performance.now() - startedAt);

      if (!res.ok) {
        updateStatus("Offline", null);
        return;
      }
      if (ms > SLOW_AFTER_MS) updateStatus("Slow", ms);
      else updateStatus("Operational", ms);
    } catch {
      clearTimeout(timeoutId);
      if (myCheckId !== checkIdRef.current) return;
      if (document.visibilityState === "hidden") return;
      updateStatus("Offline", null);
    } finally {
      if (abortRef.current === controller) abortRef.current = null;
    }
  }, [updateStatus]);

  // Polling lifecycle coordinated with document visibility
  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        if (abortRef.current) abortRef.current.abort();
        if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current);
          pollIntervalRef.current = null;
        }
        const last = previousStatusRef.current;
        if (last === "Slow" || last === "Offline") {
          missedAlertRef.current = true;
        }
        return;
      }

      if (missedAlertRef.current) {
        missedAlertRef.current = false;
        const last = previousStatusRef.current;
        if (last === "Slow" || last === "Offline") showStrip();
      }
      checkHealth();
      if (!pollIntervalRef.current) {
        pollIntervalRef.current = setInterval(checkHealth, CHECK_EVERY_MS);
      }
    };

    document.addEventListener("visibilitychange", onVisibilityChange);

    if (document.visibilityState === "visible") {
      checkHealth();
      pollIntervalRef.current = setInterval(checkHealth, CHECK_EVERY_MS);
    }

    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
      if (abortRef.current) abortRef.current.abort();
    };
  }, [checkHealth, showStrip]);

  // Browser network connectivity events
  useEffect(() => {
    const onOnline = () => checkHealth();
    const onOffline = () => {
      if (abortRef.current) abortRef.current.abort();
      updateStatus("Offline", null);
    };

    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, [checkHealth, updateStatus]);

  const shownStatus = preview?.status ?? status;
  const shownLatency = preview?.latency ?? latency;
  const shownVisible = preview?.visible ?? isVisible;

  // Set CSS custom property to offset sticky navbars when the strip is visible
  useEffect(() => {
    document.documentElement.style.setProperty(
      "--status-strip-offset",
      shownVisible ? "36px" : "0px"
    );
    return () => {
      document.documentElement.style.setProperty("--status-strip-offset", "0px");
    };
  }, [shownVisible]);

  // Colors come from globals.css only.
  const theme =
    shownStatus === "Operational"
      ? {
        bar: "bg-grade-excellent",
        text: "text-surface-deep",
        chip: "bg-surface-deep/15 text-surface-deep",
        dot: "bg-surface-deep",
        ping: "bg-surface-deep/50",
        edge: "border-surface-deep/25",
        glow: "shadow-[0_12px_44px_var(--grade-excellent-border)]",
      }
      : shownStatus === "Slow"
        ? {
          bar: "bg-grade-average",
          text: "text-surface-deep",
          chip: "bg-surface-deep/15 text-surface-deep",
          dot: "bg-surface-deep",
          ping: "bg-surface-deep/50",
          edge: "border-surface-deep/25",
          glow: "shadow-[0_12px_44px_var(--grade-average-border)]",
        }
        : shownStatus === "Offline"
          ? {
            bar: "bg-grade-fail",
            text: "text-foreground",
            chip: "bg-surface-deep/25 text-foreground",
            dot: "bg-foreground",
            ping: "bg-foreground/60",
            edge: "border-surface-deep/40",
            glow: "shadow-[0_12px_48px_var(--grade-fail-border)]",
          }
          : {
            bar: "bg-cat-blue",
            text: "text-foreground",
            chip: "bg-surface-deep/15 text-foreground",
            dot: "bg-foreground",
            ping: "bg-foreground/60",
            edge: "border-surface-deep/25",
            glow: "shadow-[0_12px_44px_var(--cat-blue-border)]",
          };

  // Latency only shows when the server answered in time.
  const showLatency =
    shownLatency !== null &&
    (shownStatus === "Operational" || shownStatus === "Slow");

  return (
    <>
      <style>{`
        :root { --status-strip-offset: 0px; }
        @keyframes anviksha-status-sheen {
          from { transform: translateX(-120%) skewX(-18deg); }
          to { transform: translateX(240%) skewX(-18deg); }
        }
        @keyframes anviksha-status-stripes {
          to { background-position: 28px 0; }
        }
        @keyframes anviksha-status-alarm {
          0%, 100% { filter: brightness(1); }
          50% { filter: brightness(1.14); }
        }
        @media (prefers-reduced-motion: reduce) {
          .anviksha-status-slide,
          .anviksha-status-spacer { transition: none !important; }
          .anviksha-status-slide .animate-ping,
          .anviksha-status-sheen,
          .anviksha-status-stripes,
          .anviksha-status-alarm { animation: none !important; }
        }
      `}</style>

      {/* Spacer: reserves the strip's space so the navbar sits below it. */}
      <div
        aria-hidden="true"
        className={`anviksha-status-spacer w-full transition-all duration-300 ease-out ${
          shownVisible ? "h-9" : "h-0"
        }`}
      />

      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        aria-hidden={!shownVisible}
        data-status={shownStatus}
        className={`anviksha-status-slide pointer-events-none fixed top-0 right-0 left-0 z-50 w-full overflow-hidden border-b-2 transition-all duration-300 ease-out ${theme.bar} ${theme.edge} ${theme.glow} ${
          shownVisible ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"
        }`}
      >
        {/* Offline stripes. */}
        {shownStatus === "Offline" && (
          <span
            aria-hidden="true"
            className="anviksha-status-stripes pointer-events-none absolute inset-0 opacity-25"
            style={{
              backgroundImage:
                "repeating-linear-gradient(-55deg, var(--surface-deep) 0 14px, transparent 14px 28px)",
              backgroundSize: "28px 100%",
              animation: "anviksha-status-stripes 1.1s linear infinite",
            }}
          />
        )}
                {/* Light sweep on Slow and Offline. */}
        {(shownStatus === "Slow" || shownStatus === "Offline") && (
          <span
            aria-hidden="true"
            className="anviksha-status-sheen pointer-events-none absolute inset-y-0 w-1/3 bg-linear-to-r from-transparent via-foreground/50 to-transparent"
            style={{
              animation: "anviksha-status-sheen 2.2s ease-in-out infinite",
            }}
          />
        )}

        <div
          className={`anviksha-status-alarm relative mx-auto flex h-9 max-w-7xl items-center justify-center gap-2.5 px-4 font-mono text-[12px] font-extrabold tracking-[0.18em] uppercase select-none sm:px-6 ${theme.text}`}
          style={{
            animation:
              shownStatus === "Offline"
                ? "anviksha-status-alarm 1.6s ease-in-out infinite"
                : undefined,
          }}
        >
          {/* Status dot. */}
          <span className="relative flex h-2.5 w-2.5 shrink-0" aria-hidden="true">
            {shownStatus !== "Checking" && (
              <span
                className={`absolute inline-flex h-full w-full animate-ping rounded-full ${theme.ping}`}
              />
            )}
            <span
              className={`relative inline-flex h-2.5 w-2.5 rounded-full ${theme.dot} ${                shownStatus === "Checking" ? "animate-pulse" : ""
                }`}
            />
          </span>

          <span className="leading-none">{labelFor(shownStatus)}</span>

          {showLatency && (
            <>
              <span className="opacity-50" aria-hidden="true">
                ·
              </span>
              <span
                className={`tnum rounded px-1.5 py-0.5 text-[11px] leading-none font-bold tracking-normal ${theme.chip}`}
              >
                {shownLatency}ms
              </span>
            </>
          )}
        </div>
      </div>
    </>
  );
}
