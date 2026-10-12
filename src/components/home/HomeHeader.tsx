"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";

const LINKS = [
  { href: "#engine", label: "The Engine" },
  { href: "#coverage", label: "Coverage" },
  { href: "#ordinance", label: "Ordinance" },
  { href: "#privacy", label: "Privacy" },
  { href: "/notices", label: "Circulars" },
];

// Sticky bar. It sticks below the system status strip via --status-strip-offset.
export default function HomeHeader({ isAuthenticated }: { isAuthenticated: boolean }) {
  const [open, setOpen] = useState(false);

  const authHref = isAuthenticated ? "/dashboard" : "/login";
  const authLabel = isAuthenticated ? "Dashboard" : "Sign in";

  return (
    <header className="sticky top-(--status-strip-offset) z-40 border-b border-gold-border bg-surface-deep/85 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" aria-label="Anviksha home" onClick={() => setOpen(false)} className="shrink-0 transition-opacity hover:opacity-85">
          <Image src="/navbar-logo.png" alt="Anviksha" width={160} height={44} className="h-8 w-auto object-contain" priority />
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-1 font-mono text-xs font-semibold lg:flex">
          {LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="group relative px-3 py-2 text-foreground-secondary transition-colors hover:text-foreground"
            >
              {link.label}
              <span
                aria-hidden="true"
                className="absolute inset-x-3 -bottom-1 h-px origin-left scale-x-0 bg-gold transition-transform duration-200 group-hover:scale-x-100"
              />
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link href={authHref} className="hidden sm:inline-flex group items-center justify-center gap-2 rounded-md border border-border-strong bg-surface px-3.5 py-2 font-mono text-xs font-semibold whitespace-nowrap text-foreground-secondary transition-colors hover:border-gold-border hover:text-gold">
            {authLabel}
          </Link>
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
            <motion.nav
              id="mobile-nav"
              aria-label="Mobile"
              initial="closed"
              animate="open"
              variants={{
                open: { transition: { staggerChildren: 0.03, delayChildren: 0.04 } },
                closed: {},
              }}
              className="mx-auto flex max-w-7xl flex-col px-4 py-2 sm:px-6"
            >
              {LINKS.map((link) => (
                <motion.div
                  key={link.label}
                  variants={{ closed: { opacity: 0, x: -6 }, open: { opacity: 1, x: 0 } }}
                  transition={{ duration: 0.18 }}
                >
                  <Link
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="block border-b border-border-subtle py-3.5 font-mono text-xs font-semibold text-foreground-secondary transition-colors hover:text-gold"
                  >
                    {link.label}
                  </Link>
                </motion.div>
              ))}
              <motion.div variants={{ closed: { opacity: 0, x: -6 }, open: { opacity: 1, x: 0 } }} transition={{ duration: 0.18 }}>
                <Link
                  href={authHref}
                  onClick={() => setOpen(false)}
                  className="block py-3.5 font-mono text-xs font-semibold text-gold"
                >
                  {authLabel}
                </Link>
              </motion.div>
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
