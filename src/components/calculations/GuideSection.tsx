import type { ReactNode } from "react";

// Accent colors for the section index number
const COLORS = {
  gold: "text-gold",
  violet: "text-cat-violet",
  teal: "text-cat-teal",
  blue: "text-cat-blue",
  copper: "text-accent-copper",
  red: "text-grade-fail",
  neutral: "text-foreground",
};

interface Props {
  id: string; // Target anchor link for navigation
  number: number;
  title: string;
  color: keyof typeof COLORS;
  children: ReactNode;
}

// Numbered card container for a guide section
export default function GuideSection({ id, number, title, color, children }: Props) {
  const text = COLORS[color];

  return (
    <section id={id} className="home-panel scroll-mt-32 p-5 sm:p-7 lg:scroll-mt-24">
      <header>
        <p className={`tnum font-mono text-xs ${text}`}>{String(number).padStart(2, "0")}</p>
        <h2 className="mt-0.5 text-lg font-semibold tracking-[-0.01em] text-foreground">{title}</h2>
      </header>

      <div className="mt-5 space-y-4 text-sm leading-6 text-foreground-secondary [&_strong]:font-semibold [&_strong]:text-foreground">
        {children}
      </div>
    </section>
  );
}
