import type { ReactNode } from "react";

// Shared layout blocks used within guide sections

// Section sub heading
export function Label({ children }: { children: ReactNode }) {
  return <h3 className="mb-2 pt-1 text-sm font-semibold text-foreground">{children}</h3>;
}

// Formula card with optional source reference text
export function Formula({ children, source }: { children: ReactNode; source?: string }) {
  return (
    <div className="rounded-lg border border-border bg-surface-deep px-4 py-3.5">
      <p className="font-mono text-sm text-foreground sm:text-base">{children}</p>
      {source && <p className="mt-1.5 text-xs leading-5 text-foreground-muted">{source}</p>}
    </div>
  );
}

// Callout note with a bold prefix
export function Note({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="rounded-lg border border-border bg-surface-deep p-4 text-xs leading-5">
      <strong>{label}: </strong>
      {children}
    </div>
  );
}

// Bullet list container
export function Bullets({ children }: { children: ReactNode }) {
  return <ul className="space-y-2.5">{children}</ul>;
}

// Bullet list row with dot indicator
export function Bullet({ children }: { children: ReactNode }) {
  return (
    <li className="flex gap-3">
      <span className="mt-2.5 size-1 shrink-0 rounded-full bg-foreground-muted" aria-hidden="true" />
      <span>{children}</span>
    </li>
  );
}
