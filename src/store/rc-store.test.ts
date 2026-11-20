import { describe, it, expect, beforeEach } from "vitest";
import useRCStore from "./rc-store";
import type { StdRC } from "@/types/appearingList";

describe("Zustand Store: useRCStore", () => {
  beforeEach(() => {
    useRCStore.getState().clearRC();
  });

  const mockPapers: StdRC[] = [
    {
      nrollno: "12345678901",
      stname: "Test Student",
      euno: 3,
      papercode: "ICT201T",
      papername: "FOUNDATIONS OF COMPUTER SCIENCE",
      fee: 0,
    },
  ];

  it("initializes with empty state", () => {
    const state = useRCStore.getState();
    expect(state.papers).toBeNull();
    expect(state.lastFetched).toBeNull();
  });

  it("sets papers and updates lastFetched timestamp", () => {
    useRCStore.getState().setPapers(mockPapers);
    const state = useRCStore.getState();
    expect(state.papers).toEqual(mockPapers);
    expect(state.lastFetched).toBeTypeOf("number");
    expect(state.lastFetched).toBeGreaterThan(0);
  });

  it("clears state properly", () => {
    useRCStore.getState().setPapers(mockPapers);
    useRCStore.getState().clearRC();
    const state = useRCStore.getState();
    expect(state.papers).toBeNull();
    expect(state.lastFetched).toBeNull();
  });
});
