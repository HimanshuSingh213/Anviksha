"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Menu, X } from "lucide-react";

interface Props {
  isAuthenticated: boolean;
}

const LINKS = [
  { href: "#engine", label: "The Engine" },
  { href: "#coverage", label: "Coverage" },
  { href: "/notices", label: "Circulars" },
  { href: "#ordinance", label: "Ordinance" },
  { href: "#privacy", label: "Privacy" },
];

export default function RedesignHeader({ isAuthenticated }: Props) {
  const [open, setOpen] = useState(false);
  const reducedMotion = useReducedMotion() ?? false;

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" aria-label="Anviksha home" onClick={() => setOpen(false)}>
          <Image src="/navbar-logo.png" alt="Anviksha" width={150} height={40} className="h-8 w-auto object-contain" priority />
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-7 font-mono text-xs text-foreground-secondary lg:flex">
          {LINKS.map((l) => (
            <Link key={l.label} href={l.href} className="flex items-center gap-1.5 transition-colors hover:text-gold">
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href={isAuthenticated ? "/dashboard" : "/login"}
            className="hidden rounded-md border border-border-strong px-4 py-2 font-mono text-xs font-semibold text-foreground transition-colors hover:border-gold-border hover:text-gold sm:inline-flex"
          >
            {isAuthenticated ? "Dashboard" : "Sign in"}
          </Link>
          <button
            type="button"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen(!open)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border text-foreground-secondary transition-colors hover:text-gold lg:hidden"
          >
            <motion.span
              key={open ? "close" : "open"}
              initial={reducedMotion ? false : { rotate: open ? -45 : 45, opacity: 0 }}
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
            initial={reducedMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
            animate={reducedMotion ? { opacity: 1 } : { height: "auto", opacity: 1 }}
            exit={reducedMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden border-t border-border bg-background/95 backdrop-blur-xl lg:hidden"
          >
            <motion.nav
              id="mobile-nav"
              aria-label="Mobile"
              initial={reducedMotion ? false : "closed"}
              animate="open"
              variants={{
                open: { transition: { staggerChildren: 0.03, delayChildren: 0.04 } },
                closed: {},
              }}
              className="mx-auto flex max-w-7xl flex-col px-4 py-4 sm:px-6"
            >
              {LINKS.map((l) => (
                <motion.div
                  key={l.label}
                  variants={{
                    closed: { opacity: 0, x: -6 },
                    open: { opacity: 1, x: 0 },
                  }}
                  transition={{ duration: 0.18 }}
                >
                  <Link
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className="block border-b border-border-subtle py-3 font-mono text-xs text-foreground-secondary transition-colors hover:text-gold"
                  >
                    {l.label}
                  </Link>
                </motion.div>
              ))}
              <motion.div
                variants={{
                  closed: { opacity: 0, x: -6 },
                  open: { opacity: 1, x: 0 },
                }}
                transition={{ duration: 0.18 }}
              >
                <Link
                  href={isAuthenticated ? "/dashboard" : "/login"}
                  onClick={() => setOpen(false)}
                  className="block py-3 font-mono text-xs font-semibold text-gold"
                >
                  {isAuthenticated ? "Dashboard" : "Sign in"}
                </Link>
              </motion.div>
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}