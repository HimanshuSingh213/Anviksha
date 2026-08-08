"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { LogoutButton } from "@/components/dashboard/LogoutButton";
import { StudentProfile } from "@/types/result";

interface AppNavbarProps {
    profile?: StudentProfile | null;
}

export default function AppNavbar({ profile }: AppNavbarProps) {
    const pathname = usePathname();
    const router = useRouter();
    const isAnalytics = pathname === "/dashboard/analytics";

    return (
        <motion.header
            initial={{ y: -12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="sticky top-0 z-30 border-b border-border-strong bg-surface-deep/85 backdrop-blur-xl"
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
                <AnimatePresence mode="wait">
                    {!isAnalytics ? (
                        <motion.div
                            key="logo"
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -8 }}
                            transition={{ duration: 0.2, ease: "easeOut" }}
                        >
                            <Link href="/dashboard" className="flex items-center shrink-0">
                                <Image
                                    src="/navbar-logo.png"
                                    alt="Anviksha"
                                    width={160}
                                    height={44}
                                    className="object-contain h-8 w-auto"
                                    priority
                                />
                            </Link>
                        </motion.div>
                    ) : (
                        <motion.button
                            key="back"
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -8 }}
                            whileHover={{ x: -3 }}
                            whileTap={{ scale: 0.96 }}
                            transition={{ duration: 0.2, ease: "easeOut" }}
                            onClick={() => router.push("/dashboard")}
                            className="flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs font-mono font-semibold text-foreground-secondary hover:text-foreground hover:bg-surface-elevated transition-colors cursor-pointer shrink-0"
                        >
                            <ArrowLeft size={14} />
                            <span>Back to Dashboard</span>
                        </motion.button>
                    )}
                </AnimatePresence>

                <div className="flex items-center gap-2.5 shrink-0">
                    {profile?.stname && (
                        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-md bg-surface border border-border-strong text-xs font-mono shadow-xs">
                            <span className="w-1.5 h-1.5 rounded-full bg-gold shrink-0" />
                            <span className="font-semibold text-foreground-secondary truncate max-w-40">
                                {profile.stname}
                            </span>
                        </div>
                    )}
                    <LogoutButton />
                </div>
            </div>
        </motion.header>
    );
}
