import Link from "next/link";

export default function RedesignFooter() {
  return (
    <footer className="border-t border-border bg-surface/30">
      <div className="mx-auto max-w-7xl px-4 py-10 space-y-6 sm:px-6">
        <div className="flex flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left">
          <p className="font-mono text-xs text-foreground-muted">© {new Date().getFullYear()} Anviksha · Unofficial student portal</p>
          <nav aria-label="Footer" className="flex flex-wrap items-center justify-center gap-4 font-mono text-xs text-foreground-secondary">
            <Link href="/notices" className="transition-colors hover:text-gold">Live Circulars</Link>
            <span className="text-border-strong" aria-hidden="true">·</span>
            <Link href="/calculations" className="transition-colors hover:text-gold">Calculations Guide</Link>
            <span className="text-border-strong" aria-hidden="true">·</span>
            <Link href="/report" className="transition-colors hover:text-gold">Report an Issue</Link>
          </nav>
          <a href="https://himanshusinghdangi.vercel.app" target="_blank" rel="noopener noreferrer" className="font-mono text-xs text-foreground-secondary transition-colors hover:text-gold">
            Built by Himanshu Singh
          </a>
        </div>
        <p className="max-w-4xl text-center text-[11px] leading-relaxed text-foreground-secondary/80 sm:text-left">
          Anviksha is a privacy-first academic results and analytics portal for students of Guru Gobind Singh Indraprastha University (GGSIPU), covering every affiliated institute. Analytics are computed under each programme&apos;s own ordinance: Ordinance 11 for semester degrees, with separate frameworks for MBBS, BPT, BHMS, BAMS and BASLP.
        </p>
        <p className="max-w-4xl text-center text-[11px] leading-relaxed text-foreground-muted sm:text-left">
          Anviksha is an unofficial student application and is not affiliated with or endorsed by GGSIPU. Official marksheets always supersede any calculation shown here.
        </p>
      </div>
    </footer>
  );
}