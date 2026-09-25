import type { EngineResult, ResultData } from "@/types/result";
import { analyzeResult } from "@/lib/academic/academic-engine";
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface ResultStore {
    result: ResultData | null;
    customCredits: Record<string, number | null>;
    engineResult: EngineResult | null;
    setResult: (data: ResultData) => void;
    setCustomCredit: (paperCode: string, credits: number | null) => void;
    clearResult: () => void;
}

const useResultStore = create<ResultStore>()(
    persist(
        (set) => ({
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
        }),
        {
            name: "anviksha-result-storage",
            storage: createJSONStorage(() => sessionStorage), // clears automatically when browser tab closes
        }
    )

);

export default useResultStore;