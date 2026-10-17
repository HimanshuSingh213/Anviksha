import Link from "next/link";
import type { ReactNode } from "react";
import { HelpCircle, type LucideIcon } from "lucide-react";

interface Props {
    icon: LucideIcon;
    iconClass: string;
    kicker: string;
    kickerClass: string;
    title: string;
    tag?: string;
    helpHref?: string;
    helpTitle?: string;
    right?: ReactNode;
}

// Standardized header layout for analytics card components.
export default function PanelHeader({
    icon: Icon,
    iconClass,
    kicker,
    kickerClass,
    title,
    tag,
    helpHref,
    helpTitle,
    right,
}: Props) {
    return (
        <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex min-w-0 items-center gap-3.5">
                <div className={`flex size-10 shrink-0 items-center justify-center rounded-lg border ${iconClass}`}>
                    <Icon size={18} strokeWidth={1.8} aria-hidden="true" />
                </div>

                <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <span className={`font-mono text-xs ${kickerClass}`}>{kicker}</span>
                        {tag && (
                            <span className="rounded border border-border-strong px-1.5 py-px font-mono text-[11px] text-foreground-muted">
                                {tag}
                            </span>
                        )}
                        {helpHref && (
                            <Link
                                href={helpHref}
                                title={helpTitle}
                                aria-label={helpTitle}
                                className="text-foreground-muted transition-colors hover:text-gold"
                            >
                                <HelpCircle size={13} aria-hidden="true" />
                            </Link>
                        )}
                    </div>
                    <h2 className="mt-0.5 text-lg font-semibold tracking-[-0.01em] text-foreground">{title}</h2>
                </div>
            </div>

            {right}
        </header>
    );
}
