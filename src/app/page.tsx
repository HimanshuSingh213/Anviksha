type Swatch = { name: string; hex: string; use: string };

const surfaces: Swatch[] = [
  { name: "Background", hex: "#0A0A0B", use: "Page canvas" },
  { name: "Surface", hex: "#141417", use: "Cards, panels" },
  { name: "Surface Elevated", hex: "#1B1B1F", use: "Modals, popovers" },
];

const text: Swatch[] = [
  { name: "Foreground", hex: "#F2EFEA", use: "Headings, body" },
  { name: "Foreground Secondary", hex: "#A39E96", use: "Supporting text" },
  { name: "Foreground Muted", hex: "#63605A", use: "Captions, disabled" },
];

const accent: Swatch[] = [
  { name: "Gold", hex: "#C9A961", use: "Highlight, CTA, \"you\"" },
  { name: "Gold Bright", hex: "#E4C67C", use: "Hover, glow" },
  { name: "Gold Dim", hex: "#7A6434", use: "Borders, dividers" },
];

const grades: Swatch[] = [
  { name: "Excellent", hex: "#34B37A", use: "O, A+" },
  { name: "Good", hex: "#8FBF4D", use: "A, B+" },
  { name: "Average", hex: "#E0A639", use: "B, C" },
  { name: "Pass", hex: "#E07B39", use: "P" },
  { name: "Fail", hex: "#E1504B", use: "F" },
];

const category: Swatch[] = [
  { name: "Cat Blue", hex: "#4C8DDA", use: "Series, tags" },
  { name: "Cat Violet", hex: "#8B7CDB", use: "Series, tags" },
  { name: "Cat Teal", hex: "#45B8C7", use: "Series, tags" },
  { name: "Cat Pink", hex: "#D96FA6", use: "Series, tags" },
  { name: "Cat Slate", hex: "#7C8591", use: "Baseline / other" },
];

const lines: Swatch[] = [
  { name: "Border", hex: "#26262B", use: "Default hairline" },
  { name: "Border Strong", hex: "#34343B", use: "Emphasis hairline" },
];

function SwatchCard({ swatch }: { swatch: Swatch }) {
  return (
    <div className="rounded-lg border border-border bg-surface overflow-hidden">
      <div className="h-20 w-full" style={{ background: swatch.hex }} />
      <div className="p-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-foreground">{swatch.name}</p>
          <p className="font-mono text-xs text-foreground-muted">{swatch.hex}</p>
        </div>
        <p className="mt-1 text-xs text-foreground-secondary">{swatch.use}</p>
      </div>
    </div>
  );
}

function PaletteRow({ title, swatches }: { title: string; swatches: Swatch[] }) {
  return (
    <div>
      <h3 className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-foreground-muted">
        {title}
      </h3>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {swatches.map((s) => (
          <SwatchCard key={s.name} swatch={s} />
        ))}
      </div>
    </div>
  );
}

type Block = { title: string; desc: string; icon: React.ReactNode };

const blocks: Block[] = [
  {
    title: "Query Index",
    desc: "Every query parsed and indexed as it runs.",
    icon: (
      <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5">
        <circle cx="8.5" cy="8.5" r="5.5" stroke="currentColor" strokeWidth="1.5" />
        <path d="M16.5 16.5L13 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    title: "Signal Trace",
    desc: "Follow a value through every mutation.",
    icon: (
      <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5">
        <path
          d="M2 15c2 0 2-4 4-4s2 6 4 6 2-9 4-9 2 5 4 5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    title: "Node Graph",
    desc: "Map dependencies as a live, walkable graph.",
    icon: (
      <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5">
        <circle cx="5" cy="5" r="1.8" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="15" cy="6" r="1.8" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="9" cy="15" r="1.8" stroke="currentColor" strokeWidth="1.5" />
        <path d="M6.5 6L13.5 6.5M6 6.8L8 13.5M13.5 8L9.8 13.5" stroke="currentColor" strokeWidth="1.2" />
      </svg>
    ),
  },
  {
    title: "Anomaly Log",
    desc: "Flag anything that breaks the pattern.",
    icon: (
      <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5">
        <path d="M10 2.5l7.5 13H2.5l7.5-13z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M10 8.5v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="10" cy="14" r="0.8" fill="currentColor" />
      </svg>
    ),
  },
  {
    title: "Cluster Map",
    desc: "Group related events automatically.",
    icon: (
      <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5">
        <circle cx="7" cy="7" r="4" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="13" cy="13" r="4" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    title: "Audit Trail",
    desc: "Every change, timestamped and reversible.",
    icon: (
      <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5">
        <path d="M4 3.5h9l3 3v10a.5.5 0 01-.5.5h-11.5a.5.5 0 01-.5-.5v-13a.5.5 0 01.5-.5z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M6.5 9h7M6.5 12h7M6.5 15h4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      </svg>
    ),
  },
];

type GradeBadge = { label: string; points: number; classes: string };

const gradeBadges: GradeBadge[] = [
  { label: "O", points: 10, classes: "bg-grade-excellent-surface border-grade-excellent-border text-grade-excellent" },
  { label: "A+", points: 9, classes: "bg-grade-excellent-surface border-grade-excellent-border text-grade-excellent" },
  { label: "A", points: 8, classes: "bg-grade-good-surface border-grade-good-border text-grade-good" },
  { label: "B+", points: 7, classes: "bg-grade-good-surface border-grade-good-border text-grade-good" },
  { label: "B", points: 6, classes: "bg-grade-average-surface border-grade-average-border text-grade-average" },
  { label: "C", points: 5, classes: "bg-grade-average-surface border-grade-average-border text-grade-average" },
  { label: "P", points: 4, classes: "bg-grade-pass-surface border-grade-pass-border text-grade-pass" },
  { label: "F", points: 0, classes: "bg-grade-fail-surface border-grade-fail-border text-grade-fail" },
];

export default function Home() {
  return (
    <div className="flex flex-1 flex-col bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
          <span className="font-mono text-sm tracking-[0.3em] text-foreground">
            ANVIKSHA
          </span>
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-gold" />
            <span className="font-mono text-xs text-foreground-muted">
              design tokens
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-16">
        {/* Hero */}
        <section className="mb-20">
          <h1 className="max-w-xl text-4xl font-semibold leading-tight tracking-tight text-foreground sm:text-5xl">
            A darker canvas,{" "}
            <span className="text-gold">worth its weight in gold.</span>
          </h1>
          <p className="mt-4 max-w-lg text-base leading-7 text-foreground-secondary">
            Near-black surfaces, warm off-white text, gold reserved for
            highlights and "you" — plus a full grade and chart palette for
            the results underneath.
          </p>
        </section>

        {/* Palette */}
        <section className="mb-24 space-y-10">
          <div className="flex items-baseline justify-between">
            <h2 className="text-lg font-medium text-foreground">Palette</h2>
            <span className="font-mono text-xs text-foreground-muted">
              26 tokens
            </span>
          </div>
          <PaletteRow title="Surfaces" swatches={surfaces} />
          <PaletteRow title="Text" swatches={text} />
          <PaletteRow title="Accent — Gold" swatches={accent} />
          <PaletteRow title="Grade scale" swatches={grades} />
          <PaletteRow title="Category — charts & tags" swatches={category} />
          <PaletteRow title="Borders" swatches={lines} />
        </section>

        {/* Grades */}
        <section className="mb-24 space-y-6">
          <div className="flex items-baseline justify-between">
            <h2 className="text-lg font-medium text-foreground">Grade badges</h2>
            <span className="font-mono text-xs text-foreground-muted">
              O → F
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {gradeBadges.map((g) => (
              <span
                key={g.label}
                className={`rounded-md border px-3 py-1.5 text-sm font-medium ${g.classes}`}
              >
                {g.label} · {g.points}
              </span>
            ))}
          </div>
        </section>

        {/* Trend */}
        <section className="mb-24 space-y-6">
          <div className="flex items-baseline justify-between">
            <h2 className="text-lg font-medium text-foreground">
              Trend — you vs branch average
            </h2>
            <span className="font-mono text-xs text-foreground-muted">
              8 semesters
            </span>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-border bg-surface p-4">
              <p className="text-xs text-foreground-secondary">Current SGPA</p>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-2xl font-medium text-foreground">8.4</span>
                <span className="text-sm text-positive">▲ 0.3</span>
              </div>
            </div>
            <div className="rounded-lg border border-border bg-surface p-4">
              <p className="text-xs text-foreground-secondary">Backlogs</p>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-2xl font-medium text-foreground">0</span>
                <span className="text-sm text-negative">▼ 1 cleared</span>
              </div>
            </div>
          </div>
          <div className="rounded-lg border border-border bg-surface p-5">
            <svg viewBox="0 0 300 90" className="w-full">
              <polyline
                points="10,55 60,50 110,58 160,40 210,45 260,30"
                fill="none"
                stroke="#7C8591"
                strokeWidth="2"
              />
              <polyline
                points="10,45 60,38 110,42 160,25 210,20 260,10"
                fill="none"
                stroke="#C9A961"
                strokeWidth="2.5"
              />
              <circle cx="260" cy="10" r="3.5" fill="#C9A961" />
            </svg>
            <div className="mt-2 flex gap-4">
              <span className="text-xs text-gold">● You</span>
              <span className="text-xs text-cat-slate">● Branch average</span>
            </div>
          </div>
        </section>

        {/* Box grid demo */}
        <section className="space-y-6">
          <div className="flex items-baseline justify-between">
            <h2 className="text-lg font-medium text-foreground">
              Box grid — hover to highlight
            </h2>
            <span className="font-mono text-xs text-foreground-muted">
              6 blocks
            </span>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {blocks.map((b) => (
              <div
                key={b.title}
                tabIndex={0}
                className="group rounded-lg border border-border bg-surface p-5 outline-none transition-all duration-300 hover:border-gold-border hover:bg-gold-surface focus-visible:border-gold-border focus-visible:bg-gold-surface"
              >
                <div className="text-foreground-secondary transition-colors duration-300 group-hover:text-gold group-focus-visible:text-gold">
                  {b.icon}
                </div>
                <h3 className="mt-4 text-sm font-medium text-foreground transition-colors duration-300 group-hover:text-gold-bright group-focus-visible:text-gold-bright">
                  {b.title}
                </h3>
                <p className="mt-1.5 text-sm leading-6 text-foreground-secondary">
                  {b.desc}
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
          <span className="text-xs text-foreground-muted">Anviksha</span>
          <span className="font-mono text-xs text-foreground-muted">
            bg-background · text-foreground · bg-gold
          </span>
        </div>
      </footer>
    </div>
  );
}
