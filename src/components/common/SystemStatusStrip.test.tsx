import React from "react";
import { render, screen, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import SystemStatusStrip from "./SystemStatusStrip";

function mockOkFetch() {
  global.fetch = vi.fn().mockResolvedValue({
    ok: true,
    status: 200,
    json: async () => ({ success: true }),
  });
}

function mockFailFetch() {
  global.fetch = vi.fn().mockResolvedValue({
    ok: false,
    status: 500,
  });
}

describe("SystemStatusStrip", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it("renders with role status and polite aria-live", () => {
    global.fetch = vi.fn().mockImplementation(() => new Promise(() => {}));
    render(<SystemStatusStrip />);
    const strip = screen.getByRole("status", { hidden: true });
    expect(strip).toBeInTheDocument();
    expect(strip).toHaveAttribute("aria-live", "polite");
    // Fixed bar at the very top (spacer below keeps the navbar under it).
    expect(strip).toHaveClass("fixed", "top-0");
  });

  it("keeps a matching spacer so the navbar sits below the bar", async () => {
    mockFailFetch();
    const { container } = render(<SystemStatusStrip />);
    const spacer = container.querySelector(".anviksha-status-spacer");

    // Hidden: spacer takes no space.
    expect(spacer).toHaveClass("h-0");

    // Visible: spacer reserves exactly the bar's space.
    await act(async () => {
      await vi.advanceTimersByTimeAsync(50);
    });
    expect(spacer).toHaveClass("h-9");
  });

  it("stays hidden on first healthy load", async () => {
    mockOkFetch();
    render(<SystemStatusStrip />);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(50);
    });

    // Healthy first check must NOT interrupt the user:
    // no visible status strip on screen...
    expect(screen.queryByRole("status")).toBeNull();
    // ...even though the hidden strip exists behind the navbar.
    expect(
      screen.getByRole("status", { hidden: true })
    ).toHaveAttribute("aria-hidden", "true");
  });

  it("shows Slow with response time on a slow first check", async () => {
    let resolveFetch: any;
    global.fetch = vi.fn().mockImplementation(() => {
      return new Promise((resolve) => {
        resolveFetch = () =>
          resolve({
            ok: true,
            status: 200,
            json: async () => ({ success: true }),
          });
      });
    });

    render(<SystemStatusStrip />);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1200);
      resolveFetch();
      await vi.advanceTimersByTimeAsync(50);
    });

    expect(screen.getByRole("status")).toHaveAttribute(
      "aria-hidden",
      "false"
    );
    expect(screen.getByText("Slow")).toBeInTheDocument();
    expect(screen.getByText(/ms/)).toBeInTheDocument();
  });

  it("shows Offline and no latency when response is not ok", async () => {
    mockFailFetch();
    render(<SystemStatusStrip />);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(50);
    });

    expect(screen.getByRole("status")).toHaveAttribute(
      "aria-hidden",
      "false"
    );
    expect(screen.getByText("Offline")).toBeInTheDocument();
    expect(screen.queryByText(/ms/)).not.toBeInTheDocument();
  });

  it("shows Offline when fetch throws network error", async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error("Network failure"));
    render(<SystemStatusStrip />);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(50);
    });

    expect(screen.getByRole("status")).toHaveAttribute(
      "aria-hidden",
      "false"
    );
    expect(screen.getByText("Offline")).toBeInTheDocument();
  });

  it("shows Back Online with latency when recovering from Offline", async () => {
    mockFailFetch();
    render(<SystemStatusStrip />);

    // First check fails -> red Offline strip slides down.
    await act(async () => {
      await vi.advanceTimersByTimeAsync(50);
    });
    expect(screen.getByText("Offline")).toBeInTheDocument();

    // Let the alert finish its 6 seconds.
    await act(async () => {
      await vi.advanceTimersByTimeAsync(6000);
    });
    expect(
      screen.getByRole("status", { hidden: true })
    ).toHaveAttribute("aria-hidden", "true");

    // Server is back: next check must announce the recovery.
    mockOkFetch();
    await act(async () => {
      window.dispatchEvent(new Event("online"));
      await vi.advanceTimersByTimeAsync(50);
    });

    expect(screen.getByRole("status")).toHaveAttribute(
      "aria-hidden",
      "false"
    );
    expect(screen.getByText("Back Online")).toBeInTheDocument();
    expect(screen.getByText(/ms/)).toBeInTheDocument();
  });

  it("stays hidden when Slow recovers (Back Online is only for Offline)", async () => {
    let resolveFetch: any;
    let slowMode = true;
    global.fetch = vi.fn().mockImplementation(() => {
      if (!slowMode) {
        return Promise.resolve({
          ok: true,
          status: 200,
          json: async () => ({ success: true }),
        });
      }
      return new Promise((resolve) => {
        resolveFetch = () =>
          resolve({
            ok: true,
            status: 200,
            json: async () => ({ success: true }),
          });
      });
    });

    render(<SystemStatusStrip />);

    // Slow first check -> amber strip slides down.
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1200);
      resolveFetch();
      await vi.advanceTimersByTimeAsync(50);
    });
    expect(screen.getByText("Slow")).toBeInTheDocument();

    // Server recovers: no announcement, the alert just goes away.
    slowMode = false;
    await act(async () => {
      window.dispatchEvent(new Event("online"));
      await vi.advanceTimersByTimeAsync(50);
    });

    expect(screen.queryByRole("status")).toBeNull();
  });

  it("hides after 6 seconds of status change", async () => {
    mockFailFetch();
    render(<SystemStatusStrip />);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(50);
    });
    expect(screen.getByRole("status")).toHaveAttribute(
      "aria-hidden",
      "false"
    );

    await act(async () => {
      await vi.advanceTimersByTimeAsync(6000);
    });

    expect(
      screen.getByRole("status", { hidden: true })
    ).toHaveAttribute("aria-hidden", "true");
  });

  it("does not re-open the strip on repeated polls with the same status", async () => {
    mockFailFetch();
    render(<SystemStatusStrip />);

    // First check fails -> slides down.
    await act(async () => {
      await vi.advanceTimersByTimeAsync(50);
    });
    expect(screen.getByRole("status")).toHaveAttribute(
      "aria-hidden",
      "false"
    );

    // Advance 6s -> slides up (hidden).
    await act(async () => {
      await vi.advanceTimersByTimeAsync(6000);
    });
    expect(
      screen.getByRole("status", { hidden: true })
    ).toHaveAttribute("aria-hidden", "true");

    // Advance to 45s (next periodic poll, same Offline result).
    await act(async () => {
      await vi.advanceTimersByTimeAsync(39000);
    });

    // Strip MUST REMAIN HIDDEN behind navbar.
    expect(
      screen.getByRole("status", { hidden: true })
    ).toHaveAttribute("aria-hidden", "true");
  });

  it("handles document visibility change and cancels checks when hidden", async () => {
    let aborted = false;
    global.fetch = vi.fn().mockImplementation((_url, init) => {
      if (init?.signal) {
        init.signal.addEventListener("abort", () => {
          aborted = true;
        });
      }
      return new Promise(() => {});
    });

    render(<SystemStatusStrip />);

    Object.defineProperty(document, "visibilityState", {
      configurable: true,
      value: "hidden",
    });

    await act(async () => {
      document.dispatchEvent(new Event("visibilitychange"));
    });

    expect(aborted).toBe(true);

    Object.defineProperty(document, "visibilityState", {
      configurable: true,
      value: "visible",
    });
  });

  it("re-shows a missed alert when the user comes back to the tab", async () => {
    mockFailFetch();
    render(<SystemStatusStrip />);

    // Offline alert is on screen.
    await act(async () => {
      await vi.advanceTimersByTimeAsync(50);
    });
    expect(screen.getByRole("status")).toHaveAttribute(
      "aria-hidden",
      "false"
    );

    // User leaves the tab...
    Object.defineProperty(document, "visibilityState", {
      configurable: true,
      value: "hidden",
    });
    await act(async () => {
      document.dispatchEvent(new Event("visibilitychange"));
    });

    // ...and comes back: the missed alert must appear once.
    Object.defineProperty(document, "visibilityState", {
      configurable: true,
      value: "visible",
    });
    await act(async () => {
      document.dispatchEvent(new Event("visibilitychange"));
      await vi.advanceTimersByTimeAsync(50);
    });

    expect(screen.getByRole("status")).toHaveAttribute(
      "aria-hidden",
      "false"
    );
    expect(screen.getByText("Offline")).toBeInTheDocument();
  });

  it("handles browser offline and online events", async () => {
    mockOkFetch();
    render(<SystemStatusStrip />);

    // Healthy load: strip stays hidden (YouTube rule).
    await act(async () => {
      await vi.advanceTimersByTimeAsync(50);
    });
    expect(
      screen.getByRole("status", { hidden: true })
    ).toHaveAttribute("aria-hidden", "true");

    // Internet drops -> red Offline strip.
    await act(async () => {
      window.dispatchEvent(new Event("offline"));
    });
    expect(screen.getByRole("status")).toHaveAttribute(
      "aria-hidden",
      "false"
    );
    expect(screen.getByText("Offline")).toBeInTheDocument();

    // Let it hide, then internet returns -> green Back Online strip.
    await act(async () => {
      await vi.advanceTimersByTimeAsync(6000);
    });
    await act(async () => {
      window.dispatchEvent(new Event("online"));
      await vi.advanceTimersByTimeAsync(50);
    });
    expect(screen.getByText("Back Online")).toBeInTheDocument();
  });

  it("shows any forced state when preview is given (test page)", async () => {
    global.fetch = vi.fn().mockImplementation(() => new Promise(() => {}));
    render(
      <SystemStatusStrip
        preview={{ status: "Offline", latency: null, visible: true }}
      />
    );

    expect(screen.getByRole("status")).toHaveAttribute(
      "aria-hidden",
      "false"
    );
    expect(screen.getByText("Offline")).toBeInTheDocument();
  });

  it("hides the preview when visible is false", () => {
    global.fetch = vi.fn().mockImplementation(() => new Promise(() => {}));
    render(
      <SystemStatusStrip
        preview={{ status: "Slow", latency: 2000, visible: false }}
      />
    );

    expect(
      screen.getByRole("status", { hidden: true })
    ).toHaveAttribute("aria-hidden", "true");
    expect(screen.getByText("Slow")).toBeInTheDocument();
  });
});
