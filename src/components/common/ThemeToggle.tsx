"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export default function ThemeToggle({ className = "" }: { className?: string }) {
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const isLight = document.documentElement.getAttribute("data-theme") === "light";
    setTheme(isLight ? "light" : "dark");

    const onThemeChange = () => {
      const active = document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark";
      setTheme(active);
    };

    window.addEventListener("theme-change", onThemeChange);
    return () => window.removeEventListener("theme-change", onThemeChange);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    document.documentElement.setAttribute("data-theme", nextTheme);
    localStorage.setItem("anviksha-theme", nextTheme);
    window.dispatchEvent(new Event("theme-change"));
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
      title={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
      className={`inline-flex size-9 cursor-pointer items-center justify-center rounded-md border border-border-strong bg-surface text-foreground-secondary transition-colors hover:border-gold-border hover:text-gold ${className}`}
    >
      {theme === "dark" ? <Moon size={16} aria-hidden="true" /> : <Sun size={16} aria-hidden="true" />}
    </button>
  );
}
