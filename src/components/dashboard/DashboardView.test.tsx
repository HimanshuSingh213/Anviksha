import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import DashboardView from "./DashboardView";
import { analyzeResult } from "@/lib/academic/academic-engine";

vi.mock("./PixelAvatar", () => ({
  default: () => <div data-testid="pixel-avatar" />,
}));
vi.mock("./CreditTipModal", () => ({
  default: () => null,
}));

const PROFILE = {
  nrollno: "12716403226",
  stname: "SAKET JHA",
  yoa: 2026,
  prgcode: "027",
  prgname: "BACHELOR OF TECHNOLOGY (COMPUTER SCIENCE AND ENGINEERING)",
  icode: "164",
  iname: "USICT",
};

const ROWS = [
  [1, "ETCS-101", "PROGRAMMING IN C", "25", "50", "75", "08", "12,2025", "2026-01-10"],
  [1, "ETCS-103", "MATHEMATICS I", "22", "46", "68", "08", "12,2025", "2026-01-10"],
];

describe("DashboardView", () => {
  it("shows the no-results card when nothing is declared", () => {
    const engine = analyzeResult({ stprofile: PROFILE, stresult: [] });
    render(<DashboardView engine={engine} />);

    expect(screen.getByText(/no results declared yet/i)).toBeTruthy();
    expect(screen.getByText("SAKET JHA")).toBeTruthy();

    const rcLinks = screen.getAllByRole("link", { name: /view appearing list/i });
    expect(rcLinks.some((link) => link.getAttribute("href") === "/rc")).toBe(true);
  });

  it("renders the results table when subjects exist", () => {
    const engine = analyzeResult({ stprofile: PROFILE, stresult: ROWS });
    render(<DashboardView engine={engine} />);

    expect(screen.queryByText(/no results declared yet/i)).toBeNull();
    expect(screen.getByText(/2 subjects/)).toBeTruthy();
  });
});
