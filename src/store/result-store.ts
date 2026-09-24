import { ResultData } from "@/types/result";
import { analyzeResult, type EngineResult } from "@/lib/academic/academic-engine";
import { create } from "zustand";

interface ResultStore {
    result: ResultData | null;
    customCredits: Record<string, number | null>;
    engineResult: EngineResult | null;
    setResult: (data: ResultData) => void;
    setCustomCredit: (paperCode: string, credits: number | null) => void;
    clearResult: () => void;
}

const useResultStore = create<ResultStore>((set) => ({
    result: null,
    customCredits: {},
    engineResult: null,
    setResult: (data) =>
        set((state) => ({
            result: data,
            engineResult: data ? analyzeResult(data, state.customCredits) : null,
        })),
    setCustomCredit(paperCode, credits) {
        set((state) => {
            const nextCredits = { ...state.customCredits, [paperCode]: credits };
            return {
                customCredits: nextCredits,
                engineResult: state.result ? analyzeResult(state.result, nextCredits) : null,
            };
        });
    },
    clearResult: () => set({ result: null, customCredits: {}, engineResult: null }),
}));

export default useResultStore;