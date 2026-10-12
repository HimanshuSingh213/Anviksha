import Link from "next/link";
import { ArrowUpRight, Bell } from "lucide-react";

interface Notice { title: string; url: string; }
interface Props { notices?: Notice[]; }

const FALLBACK_CIRCULAR_TITLES = [
  "Ordinance 11 verified", "Every affiliated institute", "15-min circulars sync",
  "Zero-database architecture", "Clause-cited calculations", "Odd / even reappear planning",
  "Placement cutoff benchmarks", "Universal programme support",
];

type Item = { title: string; url?: string };

// Circulars strip under the hero. Live notices are real links; the second copy
// makes the loop seamless (hidden from assistive tech). Padding (not flex gap)
// keeps the -50% loop on the seam.
export default function NoticeTicker({ notices = [] }: Props) {
  const items: Item[] = notices.length > 0 ? notices.slice(0, 8) : FALLBACK_CIRCULAR_TITLES.map((title) => ({ title }));

  const renderItem = (item: Item, key: string, hidden: boolean) => {
    const cls = "group/item flex items-center gap-2 whitespace-nowrap pr-10 text-[13px] text-foreground-muted transition-colors";
    return item.url ? (
      <a
        key={key}
        href={item.url}
        target="_blank"
        rel="noopener noreferrer"
        tabIndex={hidden ? -1 : undefined}
        className={`${cls} hover:text-foreground`}
      >
        {item.title}
        <ArrowUpRight size={12} className="opacity-0 transition-opacity group-hover/item:opacity-100" aria-hidden="true" />
      </a>
    ) : (
      <span key={key} className={cls}>{item.title}</span>
    );
  };

  return (
    <section aria-label="Latest circulars" className="relative border-y border-border bg-surface/50">
      <Link
        href="/notices"
        className="absolute inset-y-0 left-0 z-10 flex items-center gap-2 bg-linear-to-r from-background from-80% to-transparent pl-4 pr-10 font-mono text-xs font-semibold text-foreground-secondary transition-colors hover:text-gold sm:pl-6 sm:pr-14"
      >
        <Bell size={13} aria-hidden="true" />
        <span className="hidden sm:inline">View all circulars</span>
        <span className="sm:hidden">Circulars</span>
      </Link>

      <div className="overflow-hidden py-3.5">
        <div className="ticker-track flex w-max items-center pl-40 sm:pl-56">
          {items.map((item, i) => renderItem(item, `a-${i}`, false))}
          <span aria-hidden="true" className="contents">
            {items.map((item, i) => renderItem(item, `b-${i}`, true))}
          </span>
        </div>
      </div>
    </section>
  );
}
