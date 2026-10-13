"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, HelpCircle, Home, Menu, X } from "lucide-react";
import { LogoutButton } from "@/components/dashboard/LogoutButton";

// Section links for visitors. Anchors point at the homepage, so they work from any page.
const PUBLIC_LINKS = [
    { href: "/#engine", label: "The Engine" },
    { href: "/#coverage", label: "Coverage" },
    { href: "/#ordinance", label: "Ordinance" },
    { href: "/#privacy", label: "Privacy" },
    { href: "/notices", label: "Circulars" },
];

// Primary navigation tabs for authenticated dashboard views.
const DASHBOARD_TABS = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/dashboard/analytics", label: "Analytics" },
];

export default function AppNavbar() {
    const pathname = usePathname();
    const [open, setOpen] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // The auth cookie is the source of truth. Re-check on every page change.
    useEffect(() => {
        setIsAuthenticated(document.cookie.includes("auth_session="));
    }, [pathname]);

    const loggedIn = isAuthenticated;
    const isDashboard = pathname === "/dashboard" || pathname === "/dashboard/analytics";

    // Dashboard pages show tabs, everywhere else shows section links.
    const middleLinks = isDashboard ? DASHBOARD_TABS : PUBLIC_LINKS;
    const authHref = loggedIn ? "/dashboard" : "/login";
    const authLabel = loggedIn ? "Dashboard" : "Sign in";

    return (
        <motion.header
            initial={{ y: -12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="sticky top-(--status-strip-offset) z-30 border-b border-gold-border bg-surface-deep/85 backdrop-blur-xl"
        >
            <div className="max-w-7xl mx-auto px-3 sm:px-6 h-14 flex items-center justify-between gap-2 sm:gap-4">
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

                <nav aria-label="Primary" className="hidden items-center gap-1 font-mono text-xs font-semibold lg:flex">
                    {isDashboard ? (
                        DASHBOARD_TABS.map((tab) => {
                            const isActive = pathname === tab.href;
                            return (
                                <Link
                                    key={tab.label}
                                    href={tab.href}
                                    aria-current={isActive ? "page" : undefined}
                                    className={`px-3 py-2 transition-colors ${isActive ? "text-foreground" : "text-foreground-secondary hover:text-foreground"}`}
                                >
                                    {tab.label}
                                </Link>
                            );
                        })
                    ) : (
                        PUBLIC_LINKS.map((link) => {
                            const isActive = pathname === link.href;
                            return (
                                <Link
                                    key={link.label}
                                    href={link.href}
                                    aria-current={isActive ? "page" : undefined}
                                    className={`px-3 py-2 transition-colors ${isActive ? "text-foreground" : "text-foreground-secondary hover:text-foreground"}`}
                                >
                                    {link.label}
                                </Link>
                            );
                        })
                    )}
                </nav>

                <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                    {isDashboard ? (
                        <div className="flex items-center gap-1 rounded-full border border-border-strong bg-surface p-1 shadow-xs">
                            <Link
                                href="/notices"
                                title="Live GGSIPU Result Circulars & Date-Sheets"
                                aria-label="Live Circulars"
                                className="flex items-center gap-1.5 rounded-full px-2 sm:px-2.5 py-1.5 text-xs font-mono font-semibold text-foreground-secondary transition-colors hover:bg-surface-elevated hover:text-gold"
                            >
                                <Bell size={13} className="text-gold" aria-hidden="true" />
                                <span className="hidden md:inline">Notices</span>
                            </Link>

                            <Link
                                href="/calculations"
                                title="How Calculations Work"
                                aria-label="How Calculations Work"
                                className="flex items-center gap-1.5 rounded-full px-2 sm:px-2.5 py-1.5 text-xs font-mono font-semibold text-foreground-secondary transition-colors hover:bg-surface-elevated hover:text-gold"
                            >
                                <HelpCircle size={13} aria-hidden="true" />
                                <span className="hidden lg:inline">How Calculations Work</span>
                                <span className="hidden sm:inline lg:hidden">Guide</span>
                            </Link>

                            <Link
                                href="/"
                                title="Go to Homepage"
                                aria-label="Go to Homepage"
                                className="flex items-center gap-1.5 rounded-full px-2 sm:px-2.5 py-1.5 text-xs font-mono font-semibold text-foreground-secondary transition-colors hover:bg-surface-elevated hover:text-gold"
                            >
                                <Home size={13} aria-hidden="true" />
                                <span className="hidden sm:inline">Home</span>
                            </Link>

                            <span aria-hidden="true" className="h-5 w-px shrink-0 bg-border-strong" />
                            <LogoutButton />
                        </div>
                    ) : pathname === "/login" ? null : (
                        <Link
                            href={authHref}
                            className="hidden sm:inline-flex items-center justify-center gap-2 rounded-md border border-border-strong bg-surface px-3.5 py-2 font-mono text-xs font-semibold whitespace-nowrap text-foreground-secondary transition-colors hover:border-gold-border hover:text-gold"
                        >
                            {authLabel}
                        </Link>
                    )}

                    <button
                        type="button"
                        aria-expanded={open}
                        aria-controls="mobile-nav"
                        aria-label={open ? "Close menu" : "Open menu"}
                        onClick={() => setOpen(!open)}
                        className="inline-flex size-9 items-center justify-center rounded-md border border-border-strong bg-surface text-foreground-secondary transition-colors hover:border-gold-border hover:text-gold lg:hidden"
                    >
                        <motion.span
                            key={open ? "close" : "open"}
                            initial={{ rotate: open ? -45 : 45, opacity: 0 }}
                            animate={{ rotate: 0, opacity: 1 }}
                            transition={{ duration: 0.18 }}
                            className="inline-flex items-center justify-center"
                        >
                            {open ? <X size={16} /> : <Menu size={16} />}
                        </motion.span>
                    </button>
                </div>
            </div>

            <AnimatePresence initial={false}>
                {open && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: "easeOut" }}
                        className="overflow-hidden border-t border-border bg-background/95 backdrop-blur-xl lg:hidden"
                    >
                        <nav
                            id="mobile-nav"
                            aria-label="Mobile"
                            className="mx-auto flex max-w-7xl flex-col px-4 py-2 sm:px-6"
                        >
                            {middleLinks.map((link) => (
                                <Link
                                    key={link.label}
                                    href={link.href}
                                    onClick={() => setOpen(false)}
                                    aria-current={pathname === link.href ? "page" : undefined}
                                    className="block border-b border-border-subtle py-3.5 font-mono text-xs font-semibold text-foreground-secondary transition-colors hover:text-gold"
                                >
                                    {link.label}
                                </Link>
                            ))}
                            {isDashboard ? (
                                <>
                                    <Link
                                        href="/notices"
                                        onClick={() => setOpen(false)}
                                        className="block border-b border-border-subtle py-3.5 font-mono text-xs font-semibold text-foreground-secondary transition-colors hover:text-gold"
                                    >
                                        Notices
                                    </Link>
                                    <Link
                                        href="/calculations"
                                        onClick={() => setOpen(false)}
                                        className="block border-b border-border-subtle py-3.5 font-mono text-xs font-semibold text-foreground-secondary transition-colors hover:text-gold"
                                    >
                                        How Calculations Work
                                    </Link>
                                </>
                            ) : pathname === "/login" ? null : (
                                <Link
                                    href={authHref}
                                    onClick={() => setOpen(false)}
                                    className="block py-3.5 font-mono text-xs font-semibold text-gold"
                                >
                                    {authLabel}
                                </Link>
                            )}
                        </nav>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.header>
    );
}
