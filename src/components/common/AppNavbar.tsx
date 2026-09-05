"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Home, HelpCircle, Bell } from "lucide-react";
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
            <div className="max-w-7xl mx-auto px-3 sm:px-6 h-14 flex items-center justify-between gap-2 sm:gap-4">
                <AnimatePresence mode="wait">
                    {!isAnalytics ? (
                        <motion.div
                            key="logo"
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -8 }}
                            transition={{ duration: 0.2, ease: "easeOut" }}
                        >
                            <Link href="/" title="Go to Homepage" aria-label="Anviksha home" className="flex items-center gap-2 shrink-0 group">
                                <Image
                                    src="/navbar-logo.png"
                                    alt="Anviksha"
                                    width={160}
                                    height={44}
                                    className="object-contain h-8 w-auto transition-opacity group-hover:opacity-85"
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
                            className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-2.5 py-1.5 rounded-md text-xs font-mono font-semibold text-foreground-secondary hover:text-foreground hover:bg-surface-elevated transition-colors cursor-pointer shrink-0"
                            aria-label="Back to Dashboard"
                        >
                            <ArrowLeft size={14} aria-hidden="true" />
                            <span className="hidden sm:inline">Back to Dashboard</span>
                            <span className="sm:hidden">Dashboard</span>
                        </motion.button>
                    )}
                </AnimatePresence>

                <nav aria-label="Dashboard navigation" className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
                    {/* Live Exam Notices Link */}
                    <Link
                        href="/notices"
                        title="Live GGSIPU Result Circulars & Date-Sheets"
                        aria-label="Live Circulars"
                        className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-md border border-border-strong bg-surface text-xs font-mono font-semibold text-foreground-secondary hover:text-gold hover:border-gold-border transition-colors duration-200 shrink-0 shadow-xs"
                    >
                        <Bell size={13} className="text-gold" aria-hidden="true" />
                        <span className="hidden md:inline">Notices</span>
                    </Link>

                    {/* How Calculations Work Link */}
                    <Link
                        href="/calculations"
                        title="How Calculations Work"
                        aria-label="How Calculations Work"
                        className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-md border border-border-strong bg-surface text-xs font-mono font-semibold text-foreground-secondary hover:text-gold hover:border-gold-border transition-colors duration-200 shrink-0 shadow-xs"
                    >
                        <HelpCircle size={13} aria-hidden="true" />
                        <span className="hidden lg:inline">How Calculations Work</span>
                        <span className="hidden sm:inline lg:hidden">Guide</span>
                    </Link>

                    <Link
                        href="/"
                        title="Go to Homepage"
                        aria-label="Go to Homepage"
                        className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-md border border-border-strong bg-surface text-xs font-mono font-semibold text-foreground-secondary hover:text-gold hover:border-gold-border transition-colors duration-200 shrink-0 shadow-xs"
                    >
                        <Home size={13} aria-hidden="true" />
                        <span className="hidden sm:inline">Home</span>
                    </Link>

                    {profile?.stname && (
                        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-md bg-surface border border-border-strong text-xs font-mono shadow-xs">
                            <span className="w-1.5 h-1.5 rounded-full bg-gold shrink-0" aria-hidden="true" />
                            <span className="font-semibold text-foreground-secondary truncate max-w-36">
                                {profile.stname}
                            </span>
                        </div>
                    )}
                    <LogoutButton />
                </nav>
            </div>
        </motion.header>
    );
}
