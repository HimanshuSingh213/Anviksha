import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { StdRC } from "@/types/appearingList";

interface RCStore {
  papers: StdRC[] | null;
  lastFetched: number | null;
  setPapers: (papers: StdRC[]) => void;
  clearRC: () => void;
}

const useRCStore = create<RCStore>()(
  persist(
    (set) => ({
      papers: null,
      lastFetched: null,
      setPapers: (papers) =>
        set({
          papers,
          lastFetched: Date.now(),
        }),
      clearRC: () => set({ papers: null, lastFetched: null }),
    }),
    {
      name: "anviksha-rc-storage",
      storage: createJSONStorage(() => sessionStorage), // clears automatically when browser tab closes
    }
  )
);

export default useRCStore;
export { useRCStore };
