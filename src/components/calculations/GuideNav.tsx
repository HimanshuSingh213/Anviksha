"use client";

import { useEffect, useRef, useState } from "react";
import { HookSidebar } from "@/components/ui/hook-sidebar";
import MobileGuideNav from "./MobileGuideNav";

interface Props {
  items: { label: string; id: string }[];
}

// Pause scroll updates briefly after clicking to let the page scroll smoothly
const HOLD_MS = 200;

// Contents navigation that tracks the active section as you scroll
export default function GuideNav({ items }: Props) {
  const [activeId, setActiveId] = useState(items[0].id);
  const holdUntil = useRef(0);
  const activeIndex = items.findIndex((item) => item.id === activeId);

  // Watch scroll position to highlight whichever section is near the top
  useEffect(() => {
    const onScroll = () => {
      // Pause updates while smooth scrolling to a clicked section
      if (Date.now() < holdUntil.current) {
        holdUntil.current = Date.now() + HOLD_MS;
        return;
      }

      const line = window.innerHeight * 0.3;
      let current = items[0].id;
      for (const item of items) {
        const section = document.getElementById(item.id);
        if (section && section.getBoundingClientRect().top <= line) {
          current = item.id;
        }
      }

      // Highlight the last section once the user reaches the bottom of the page
      if (window.innerHeight + window.scrollY >= document.body.scrollHeight - 2) {
        current = items[items.length - 1].id;
      }

      setActiveId(current);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [items]);

  // Jump highlight immediately and pause scroll detection while moving
  const handleTap = (id: string) => {
    setActiveId(id);
    holdUntil.current = Date.now() + HOLD_MS;
  };

  return (
    <>
      {/* Horizontal strip on mobile screens */}
      <MobileGuideNav items={items} />

      {/* Hook sidebar on desktop screens */}
      <div className="hidden lg:block">
        <div className="sticky top-[calc(var(--status-strip-offset)+5rem)]">
          <HookSidebar
            items={items.map((item) => ({ label: item.label, href: `#${item.id}` }))}
            value={activeIndex}
            onChange={(index) => handleTap(items[index].id)}
            color="var(--color-gold)"
          />
        </div>
      </div>
    </>
  );
}
