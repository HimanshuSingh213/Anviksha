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
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-mono font-medium text-foreground-secondary hover:text-grade-fail hover:bg-grade-fail-surface/40 transition-colors cursor-pointer"
        >
            <LogOut size={13} />
            <span>Logout</span>
        </button>
    );
}