"use client";

import axios from "axios";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import useResultStore from "@/store/result-store";

export function LogoutButton() {
    const router = useRouter();
    const clearResult = useResultStore((state) => state.clearResult);

    const handleLogout = async () => {
        try {
            await axios.post("/api/logout");
            toast.success("Logged out successfully");
        } catch {
            toast.error("Failed to log out");
        } finally {
            clearResult();
            router.push("/login");
        }
    };

    return (
        <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-surface hover:bg-grade-fail-surface hover:text-grade-fail border border-border-strong rounded-md text-xs font-semibold transition duration-200"
        >
            <LogOut size={14} /> Log Out
        </button>
    );
}