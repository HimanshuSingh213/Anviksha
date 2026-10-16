"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

// Resets window scroll position to top on route change
export default function RouteScrollReset() {
  const pathname = usePathname();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
