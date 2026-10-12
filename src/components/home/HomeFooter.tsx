import Link from "next/link";

export default function HomeFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto max-w-7xl space-y-8 px-4 py-12 sm:px-6">
        <div className="flex flex-col items-center justify-between gap-5 text-center sm:flex-row sm:text-left">
          <p className="text-sm text-foreground-muted">© {new Date().getFullYear()} Anviksha · Unofficial student portal</p>
          <nav aria-label="Footer" className="flex flex-wrap items-center justify-center gap-x-7 gap-y-3 text-sm text-foreground-secondary">
            <Link href="/notices" className="link-underline transition-colors hover:text-gold">Live Circulars</Link>
            <Link href="/calculations" className="link-underline transition-colors hover:text-gold">Calculations Guide</Link>
            <Link href="/report" className="link-underline transition-colors hover:text-gold">Report an Issue</Link>
          </nav>
          <a
            href="https://himanshusinghdangi.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            className="link-underline text-sm text-foreground-secondary transition-colors hover:text-gold"
          >
            Built by Himanshu Singh
          </a>
        </div>
        <div className="space-y-3">
          <p className="max-w-4xl text-center text-xs leading-relaxed text-foreground-secondary/80 sm:text-left">
            Anviksha is a privacy-first academic results and analytics portal for students of Guru Gobind Singh Indraprastha University (GGSIPU), covering every affiliated institute. Analytics are computed under each programme&apos;s own ordinance: Ordinance 11 for semester degrees, with separate frameworks for MBBS, BPT, BHMS, BAMS and BASLP.
          </p>
          <p className="max-w-4xl text-center text-xs leading-relaxed text-foreground-muted sm:text-left">
            Anviksha is an unofficial student application and is not affiliated with or endorsed by GGSIPU. Official marksheets always supersede any calculation shown here.
          </p>
        </div>
      </div>
    </footer>
  );
}
