"use client";

import { ReactNode } from "react";
import { LiquidTooltip } from "@/components/rareui/LiquidTooltip/LiquidTooltip";

interface TooltipProps {
  content: ReactNode;
  children: ReactNode;
  position?: "top" | "bottom" | "left" | "right";
  delay?: number;
  className?: string;
  popupClassName?: string;
}

export default function Tooltip({
  content,
  children,
  position = "top",
  className = "",
  popupClassName = "",
}: TooltipProps) {
  if (!content) return <>{children}</>;

  return (
    <LiquidTooltip
      text={content}
      placement={position}
      className={className}
      popupClassName={popupClassName}
    >
      {children}
    </LiquidTooltip>
  );
}

export { LiquidTooltip };
