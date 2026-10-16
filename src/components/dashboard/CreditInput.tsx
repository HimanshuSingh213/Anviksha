"use client";

import { useEffect, useState } from "react";

interface Props {
  code: string;
  name: string;
  value: number | null;
  isCleared: boolean;
  onChange: (code: string, credits: number | null) => void;
}

// Editable credit input (0 to 20, or empty to clear)
export default function CreditInput({ code, name, value, isCleared, onChange }: Props) {
  const [text, setText] = useState(value != null ? String(value) : "");
  const [focused, setFocused] = useState(false);

  // Sync with store when not actively editing
  useEffect(() => {
    if (!focused) setText(value != null ? String(value) : "");
  }, [value, focused]);

  const set = (next: number | null) => {
    setText(next === null ? "" : String(next));
    onChange(code, next);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.trim();
    if (raw === "") return set(null);
    if (/^\d{1,2}$/.test(raw) && Number(raw) <= 20) set(Number(raw));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "ArrowUp" && e.key !== "ArrowDown") return;
    e.preventDefault();
    const current = parseInt(text, 10) || 0;
    set(e.key === "ArrowUp" ? Math.min(20, current + 1) : Math.max(0, current - 1));
  };

  return (
    <div className="flex flex-col items-center">
      <input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        value={text}
        placeholder="–"
        aria-label={`Edit credit value for ${name}`}
        title="Click to edit credits for custom GPA calculation"
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onKeyDown={handleKeyDown}
        onWheel={(e) => e.currentTarget.blur()}
        onChange={handleChange}
        className="w-10 cursor-pointer rounded-sm border border-border-strong bg-surface-deep py-0.5 text-center font-mono text-xs font-bold text-foreground outline-none transition-colors hover:border-gold/60 focus:cursor-text focus:border-gold focus:ring-1 focus:ring-gold/30"
      />
      {!isCleared && (
        <span className="mt-1 font-mono text-[9px] font-semibold leading-none text-grade-fail" title="Backlog: 0 credits earned until cleared">
          0 earned
        </span>
      )}
    </div>
  );
}
