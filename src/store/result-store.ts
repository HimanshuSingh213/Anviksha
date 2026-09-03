import { ResultData } from "@/types/result";
import { create } from "zustand";

interface ResultStore {
    result: ResultData | null;
    customCredits: Record<string, number | null>;
    setResult: (data: ResultData) => void;
    setCustomCredit: (paperCode: string, credits: number | null) => void;
    clearResult: () => void;
}

const useResultStore = create<ResultStore>((set) => ({
    result: null,
    customCredits: {},
    setResult: (data) => set({ result: data }),
    setCustomCredit(paperCode, credits) {
        set((state) => ({
            customCredits: {...state.customCredits, [paperCode]: credits}
        }))
    },
    clearResult: () => set({ result: null, customCredits: {} }),
}));

export default useResultStore;