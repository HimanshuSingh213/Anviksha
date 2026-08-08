"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function CreditTipModal() {
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        if (typeof window !== "undefined") {
            const dismissed = sessionStorage.getItem("credit_tip_dismissed");
            if (!dismissed) {
                const timer = setTimeout(() => setIsOpen(true), 600);
                return () => clearTimeout(timer);
            }
        }
    }, []);

    const handleDismiss = () => {
        setIsOpen(false);
        if (typeof window !== "undefined") {
            sessionStorage.setItem("credit_tip_dismissed", "true");
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 font-mono">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleDismiss}
                        className="absolute inset-0 bg-black/70 backdrop-blur-xs"
                    />

                    {/* Modal Box */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.96, y: 8 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.96, y: 8 }}
                        transition={{ type: "spring", stiffness: 350, damping: 25 }}
                        className="relative z-10 w-full max-w-sm bg-surface border border-border-strong rounded-lg p-5 shadow-2xl space-y-4"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between border-b border-border-strong pb-3">
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-gold animate-pulse" />
                                <span className="text-[10px] font-bold uppercase tracking-widest text-gold">
                                    Quick Tip
                                </span>
                            </div>
                            <button
                                onClick={handleDismiss}
                                className="text-xs text-foreground-secondary hover:text-foreground font-bold px-1.5 py-0.5 rounded bg-surface-deep border border-border-strong transition-colors cursor-pointer"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Title & Body */}
                        <div className="space-y-2">
                            <h3 className="text-sm font-bold text-foreground">
                                Edit Subject Credits
                            </h3>
                            <p className="text-xs text-foreground-secondary leading-relaxed">
                                Click on any credit value in the subject table to customize it. Your SGPA, CGPA, and equivalent percentage will recalculate instantly.
                            </p>
                        </div>

                        {/* Dismiss Action */}
                        <div className="pt-1">
                            <motion.button
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleDismiss}
                                className="w-full py-2 rounded-md bg-foreground text-background font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-xs"
                            >
                                Got it
                            </motion.button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
