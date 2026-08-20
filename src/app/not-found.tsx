import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, CompassIcon } from "lucide-react";

export const metadata: Metadata = {
  title: "404 — Page Not Found | Anviksha",
  robots: {
    index: false,
    follow: true,
  },
};

export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-background px-6 py-24 text-center text-foreground">
      <div className="rounded-full border border-border bg-surface p-4">
        <CompassIcon size={22} className="text-gold" />
      </div>

      <p className="mt-6 font-mono text-xs uppercase tracking-widest text-foreground-muted">
        404 · Page not found
      </p>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
        This page doesn&apos;t exist.
      </h1>
      <p className="mt-3 max-w-sm text-sm leading-6 text-foreground-secondary">
        The link might be broken, or the page may have moved. Head back home to
        get to your result.
      </p>

      <Link
        href="/"
        className="mt-8 inline-flex items-center gap-2.5 rounded-md border border-white bg-white px-6 py-3 font-mono text-xs font-bold uppercase tracking-wider text-black shadow-[0_0_20px_rgba(255,255,255,0.15)] transition-transform duration-150 ease-out hover:-translate-y-0.5 hover:bg-neutral-200 active:scale-95"
      >
        Back to Home
        <ArrowRight size={14} />
      </Link>
    </div>
  );
}
