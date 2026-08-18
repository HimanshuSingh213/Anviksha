"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

export default function CreditTipModal() {
    const [isOpen, setIsOpen] = useState(false);
    const [isShaking, setIsShaking] = useState(false);

    useEffect(() => {
        if (typeof window !== "undefined") {
            const dismissed = sessionStorage.getItem("credit_tip_dismissed");
            if (!dismissed) {
                const timer = setTimeout(() => setIsOpen(true), 500);
                return () => clearTimeout(timer);
            }
        }
    }, []);

    const handleDismiss = useCallback(() => {
        setIsOpen(false);
        if (typeof window !== "undefined") {
            sessionStorage.setItem("credit_tip_dismissed", "true");
        }
    }, []);

    const triggerBackdropFeedback = () => {
        setIsShaking(true);
        setTimeout(() => setIsShaking(false), 250);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 font-mono select-none">
                    {/* Backdrop - intentionally does NOT close on click */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        onClick={triggerBackdropFeedback}
                        className="absolute inset-0 bg-black/75 backdrop-blur-xs cursor-default"
                    />

                    {/* Modal Box */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.94, y: 12 }}
                        animate={{
                            opacity: 1,
                            scale: isShaking ? 1.02 : 1,
                            y: 0,
                        }}
                        exit={{ opacity: 0, scale: 0.94, y: 10 }}
                        transition={{
                            type: "spring",
                            stiffness: 380,
                            damping: 26,
                        }}
                        className="relative z-10 w-full max-w-sm bg-surface border border-border-strong rounded-lg p-5 shadow-2xl space-y-4"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between border-b border-border-strong pb-3">
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-gold animate-pulse inline-block" />
                                <span className="text-[10px] font-bold uppercase tracking-widest text-gold">
                                    Quick Tip
                                </span>
                            </div>
                            <button
                                type="button"
                                onClick={handleDismiss}
                                aria-label="Close modal"
                                className="text-xs text-foreground-secondary hover:text-foreground font-bold w-6 h-6 flex items-center justify-center rounded bg-surface-deep border border-border-strong transition-colors cursor-pointer"
                            >
                                <X size={12} strokeWidth={2.5} />
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
                            <button
                                type="button"
                                onClick={handleDismiss}
                                className="w-full py-2.5 rounded-md bg-foreground text-background font-bold text-xs uppercase tracking-wider transition-opacity hover:opacity-90 active:scale-[0.98] cursor-pointer shadow-sm"
                            >
                                Got it
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
