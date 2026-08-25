"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageSquare } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { track } from "@vercel/analytics";

export default function FloatingReportButton() {
    const pathname = usePathname();

    // Do not show on homepage or on the report page itself
    if (!pathname || pathname === "/" || pathname === "/report") {
        return null;
    }

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 10 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="fixed bottom-4 left-4 z-40 print:hidden"
            >
                <Link
                    href={`/report?from=${encodeURIComponent(pathname)}`}
                    onClick={() => track("click_report_button", { from: pathname })}
                    title="Report a Problem / Submit Feedback"
                    className="flex items-center gap-2 px-3 py-2 rounded-full border border-border-strong bg-surface-deep/90 text-foreground-secondary hover:text-foreground hover:border-gold-border backdrop-blur-md shadow-lg font-mono text-xs transition-all duration-200 hover:scale-[1.03] active:scale-[0.97] group cursor-pointer focus-visible:ring-2 focus-visible:ring-gold"
                >
                    <MessageSquare size={13} className="text-gold group-hover:scale-110 transition-transform" />
                    <span className="font-semibold hidden sm:inline">Report a Problem</span>
                    <span className="font-semibold sm:hidden">Report</span>
                </Link>
            </motion.div>
        </AnimatePresence>
    );
}
