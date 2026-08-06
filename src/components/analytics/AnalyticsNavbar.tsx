"use client";

import { motion } from "framer-motion";
import { ArrowLeft, BarChart2, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { LogoutButton } from "@/components/dashboard/LogoutButton";
import { StudentProfile } from "@/types/result";

interface Props {
    profile?: StudentProfile | null;
}

export default function AnalyticsNavbar({ profile }: Props) {
    const router = useRouter();

    return (
        <motion.header
            initial={{ y: -12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="sticky top-0 z-30 border-b border-border-strong bg-surface-deep/80 backdrop-blur-xl"
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
                
                {/* Back button and page title */}
                <div className="flex items-center gap-3">
                    <motion.button
                        whileHover={{ x: -2 }}
                        whileTap={{ scale: 0.96 }}
                        onClick={() => router.push("/dashboard")}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-surface border border-border-strong text-xs font-mono font-bold text-foreground hover:border-foreground/30 transition-colors cursor-pointer"
                    >
                        <ArrowLeft size={13} />
                        Dashboard
                    </motion.button>

                    <span className="text-border-strong font-mono text-xs hidden sm:inline">/</span>

                    <div className="hidden sm:flex items-center gap-2 text-xs font-mono font-semibold text-foreground-secondary">
                        <BarChart2 size={13} className="text-cat-violet" />
                        <span className="uppercase tracking-widest">Analytics</span>
                    </div>
                </div>

                {/* Profile pill and logout */}
                <div className="flex items-center gap-3">
                    {profile && (
                        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-surface border border-border text-[11px] font-mono text-foreground-secondary">
                            <User size={11} className="text-cat-teal shrink-0" />
                            <span className="truncate max-w-36 font-semibold">{profile.stname}</span>
                        </div>
                    )}
                    <LogoutButton />
                </div>
            </div>
        </motion.header>
    );
}
