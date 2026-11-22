"use client";

import { useEffect, useState } from "react";
import { Toaster } from "sonner";

export default function ThemedToaster() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const syncTheme = () => {
      const active = document.documentElement.getAttribute("data-theme");
      setTheme(active === "light" ? "light" : "dark");
    };

    syncTheme();
    window.addEventListener("theme-change", syncTheme);
    return () => window.removeEventListener("theme-change", syncTheme);
  }, []);

  return <Toaster theme={theme} position="bottom-right" richColors />;
}
