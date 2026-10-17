import type { ReactNode } from "react";

const TONES = {
    good: "bg-grade-excellent-surface text-grade-excellent ring-grade-excellent-border",
    bad: "bg-grade-fail-surface text-grade-fail ring-grade-fail-border",
    gold: "bg-gold-surface text-gold ring-gold-border",
    blue: "bg-cat-blue-surface text-cat-blue ring-cat-blue-border",
    copper: "bg-accent-copper-surface text-accent-copper ring-accent-copper-border",
    muted: "bg-surface-elevated text-foreground-muted ring-border-strong",
};

export type ChipTone = keyof typeof TONES;

// Status badge indicator with semantic color tones.
export default function Chip({
    tone = "muted",
    children,
    className = "",
}: {
    tone?: ChipTone;
    children: ReactNode;
    className?: string;
}) {
    return (
        <span
            className={`inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-md px-2 py-0.5 text-xs font-semibold ring-1 ring-inset ${TONES[tone]} ${className}`}
        >
            {children}
        </span>
    );
}
