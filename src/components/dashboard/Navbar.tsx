"use client";

import { motion } from "framer-motion";
import { User, ShieldCheck } from "lucide-react";
import { LogoutButton } from "@/components/dashboard/LogoutButton";
import { StudentProfile } from "@/types/result";

interface NavbarProps {
    profile?: StudentProfile | null;
}

export default function Navbar({ profile }: NavbarProps) {
    return (
        <motion.header
            initial={{ y: -12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="sticky top-0 z-30 border-b border-border-strong bg-surface-deep/90 backdrop-blur-md shadow-lg"
        >
            <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
                
                {/* Brand & Status */}
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-gold animate-pulse" />
                        <span className="text-gold font-mono font-extrabold text-base tracking-widest uppercase">
                            Anviksha
                        </span>
                    </div>
                    <span className="text-border-strong text-xs font-mono">/</span>
                    <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-surface border border-border text-[11px] font-mono text-foreground-secondary">
                        <ShieldCheck size={12} className="text-cat-teal" />
                        <span>Official Result Portal</span>
                    </div>
                </div>

                {/* Profile Pill & Actions */}
                <div className="flex items-center gap-3">
                    {profile && (
                        <div className="hidden md:flex items-center gap-2.5 px-3 py-1.5 rounded-md bg-surface border border-border-strong text-xs font-mono shadow-xs">
                            <div className="w-6 h-6 rounded bg-cat-violet-surface border border-cat-violet-border flex items-center justify-center text-cat-violet">
                                <User size={13} />
                            </div>
                            <div className="flex flex-col text-left leading-tight">
                                <span className="font-bold text-foreground truncate max-w-44">
                                    {profile.stname}
                                </span>
                                <span className="text-[10px] text-foreground-muted truncate">
                                    {profile.nrollno}
                                </span>
                            </div>
                        </div>
                    )}

                    <LogoutButton />
                </div>
            </div>
        </motion.header>
    );
}
