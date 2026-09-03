'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence, useSpring, useMotionValue, useTransform } from 'framer-motion';
import { cn } from '@/lib/utils';

type Placement = 'top' | 'bottom' | 'left' | 'right';

export interface LiquidTooltipProps {
  text: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  popupClassName?: string;
  placement?: Placement;
}

export const LiquidTooltip = ({
  text,
  children,
  className,
  popupClassName,
  placement = 'top',
}: LiquidTooltipProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [triggerRect, setTriggerRect] = useState<DOMRect | null>(null);
  const triggerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Dynamic collision & alignment state
  const [effectivePlacement, setEffectivePlacement] = useState<Placement>(placement);
  const [horizontalShift, setHorizontalShift] = useState<'center' | 'left' | 'right'>('center');

  // Spring physics for the liquid effect
  const springConfig = { stiffness: 100, damping: 15, mass: 0.1 };
  const value = useMotionValue(0);
  const rotate = useSpring(useTransform(value, [-100, 100], [-30, 30]), springConfig);
  const springValue = useSpring(value, springConfig);

  const checkViewportBounds = useCallback(() => {
    if (!triggerRef.current || typeof window === 'undefined') return;
    const rect = triggerRef.current.getBoundingClientRect();
    setTriggerRect(rect);
    const verticalSafety = 85;

    // 1. Vertical auto-flip if overflowing window top or bottom
    let nextPlacement = placement;
    if (placement === 'top' && rect.top < verticalSafety) {
      nextPlacement = 'bottom';
    } else if (placement === 'bottom' && window.innerHeight - rect.bottom < verticalSafety) {
      nextPlacement = 'top';
    }
    setEffectivePlacement(nextPlacement);

    // 2. Horizontal auto-align to keep tooltip fully inside the window
    const centerX = rect.left + rect.width / 2;
    if (centerX < 160) {
      setHorizontalShift('left');
    } else if (window.innerWidth - centerX < 160) {
      setHorizontalShift('right');
    } else {
      setHorizontalShift('center');
    }
  }, [placement]);

  useEffect(() => {
    if (!isHovered) return;
    const handleScrollOrResize = () => {
      if (triggerRef.current) {
        setTriggerRect(triggerRef.current.getBoundingClientRect());
      }
    };
    window.addEventListener('scroll', handleScrollOrResize, { passive: true });
    window.addEventListener('resize', handleScrollOrResize, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScrollOrResize);
      window.removeEventListener('resize', handleScrollOrResize);
    };
  }, [isHovered]);

  const handleMouseEnter = () => {
    checkViewportBounds();
    setIsHovered(true);
  };

  const handleMouseMove = (event: React.MouseEvent<HTMLSpanElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    if (effectivePlacement === 'top' || effectivePlacement === 'bottom') {
      const offsetX = event.clientX - rect.left;
      const halfWidth = rect.width / 2;
      value.set(offsetX - halfWidth);
    } else {
      const offsetY = event.clientY - rect.top;
      const halfHeight = rect.height / 2;
      value.set(offsetY - halfHeight);
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    value.set(0);
  };

  const isVertical = effectivePlacement === 'top' || effectivePlacement === 'bottom';

  const getCoords = () => {
    if (!triggerRect) return { top: 0, left: 0 };
    const centerX = triggerRect.left + triggerRect.width / 2;
    let top = 0;
    let left = centerX;

    if (effectivePlacement === 'top') {
      top = triggerRect.top - 8;
    } else if (effectivePlacement === 'bottom') {
      top = triggerRect.bottom + 8;
    } else if (effectivePlacement === 'left') {
      top = triggerRect.top + triggerRect.height / 2;
      left = triggerRect.left - 8;
    } else if (effectivePlacement === 'right') {
      top = triggerRect.top + triggerRect.height / 2;
      left = triggerRect.right + 8;
    }

    if (effectivePlacement === 'top' || effectivePlacement === 'bottom') {
      if (horizontalShift === 'left') {
        left = Math.max(16, triggerRect.left);
      } else if (horizontalShift === 'right') {
        left = Math.min(typeof window !== 'undefined' ? window.innerWidth - 16 : 800, triggerRect.right);
      }
    }

    return { top, left };
  };

  const getPositionClasses = () => {
    switch (effectivePlacement) {
      case 'top': {
        let h = '-translate-x-1/2';
        if (horizontalShift === 'left') h = 'translate-x-0';
        else if (horizontalShift === 'right') h = '-translate-x-full';
        return `${h} -translate-y-full`;
      }
      case 'bottom': {
        let h = '-translate-x-1/2';
        if (horizontalShift === 'left') h = 'translate-x-0';
        else if (horizontalShift === 'right') h = '-translate-x-full';
        return `${h} translate-y-0`;
      }
      case 'left':
        return '-translate-x-full -translate-y-1/2';
      case 'right':
        return 'translate-x-0 -translate-y-1/2';
      default: {
        let h = '-translate-x-1/2';
        if (horizontalShift === 'left') h = 'translate-x-0';
        else if (horizontalShift === 'right') h = '-translate-x-full';
        return `${h} -translate-y-full`;
      }
    }
  };

  const getArrowClasses = () => {
    let arrowX = 'left-1/2 -translate-x-1/2';
    if (horizontalShift === 'left') arrowX = 'left-4';
    if (horizontalShift === 'right') arrowX = 'right-4';

    switch (effectivePlacement) {
      case 'top':
        return `-bottom-1 ${arrowX} border-r border-b`;
      case 'bottom':
        return `-top-1 ${arrowX} border-l border-t`;
      case 'left':
        return '-right-1 top-1/2 -translate-y-1/2 border-r border-t';
      case 'right':
        return '-left-1 top-1/2 -translate-y-1/2 border-l border-b';
      default:
        return `-bottom-1 ${arrowX} border-r border-b`;
    }
  };

  const getAnimation = () => {
    const distance = 8;
    switch (effectivePlacement) {
      case 'top':
        return {
          initial: { opacity: 0, scale: 0.92, y: distance },
          animate: { opacity: 1, scale: 1, y: 0 },
          exit: { opacity: 0, scale: 0.92, y: distance },
        };
      case 'bottom':
        return {
          initial: { opacity: 0, scale: 0.92, y: -distance },
          animate: { opacity: 1, scale: 1, y: 0 },
          exit: { opacity: 0, scale: 0.92, y: -distance },
        };
      case 'left':
        return {
          initial: { opacity: 0, scale: 0.92, x: distance },
          animate: { opacity: 1, scale: 1, x: 0 },
          exit: { opacity: 0, scale: 0.92, x: distance },
        };
      case 'right':
        return {
          initial: { opacity: 0, scale: 0.92, x: -distance },
          animate: { opacity: 1, scale: 1, x: 0 },
          exit: { opacity: 0, scale: 0.92, x: -distance },
        };
      default:
        return {
          initial: { opacity: 0, scale: 0.92, y: distance },
          animate: { opacity: 1, scale: 1, y: 0 },
          exit: { opacity: 0, scale: 0.92, y: distance },
        };
    }
  };

  const animationProps = getAnimation();

  const motionStyle = isVertical
    ? ({ x: springValue, rotate: rotate } as any)
    : ({ y: springValue, rotate: rotate } as any);

  // Rectangle format: for long text, sleek horizontal rectangle (w-72 to w-80, max-w-96); for short text, content fit
  const isLongText = typeof text === 'string' ? text.length > 30 : true;
  const dimensionClasses = isLongText
    ? 'w-72 sm:w-80 max-w-96 text-left whitespace-normal leading-relaxed'
    : 'w-max max-w-xs text-center whitespace-normal leading-normal';

  const coords = getCoords();

  return (
    <>
      <span
        ref={triggerRef}
        className={cn('relative inline-flex items-center', className)}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onMouseMove={handleMouseMove}
        onFocus={handleMouseEnter}
        onBlur={handleMouseLeave}
      >
        <span className="relative z-10">{children}</span>
      </span>

      {mounted && typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {isHovered && text && triggerRect && (
            <motion.div
              initial={animationProps.initial}
              animate={{
                ...animationProps.animate,
                transition: {
                  type: 'spring',
                  stiffness: 260,
                  damping: 20,
                },
              }}
              exit={animationProps.exit}
              style={{
                position: 'fixed',
                top: `${coords.top}px`,
                left: `${coords.left}px`,
                zIndex: 99999,
                ...motionStyle,
              }}
              role="tooltip"
              className={cn(
                'pointer-events-none fixed z-[99999] flex flex-col rounded-lg border border-border-strong bg-surface-elevated/95 px-3.5 py-2 font-mono text-[11px] font-normal text-foreground shadow-2xl backdrop-blur-md',
                dimensionClasses,
                getPositionClasses(),
                popupClassName
              )}
            >
              {/* The Tooltip Text */}
              <span className="relative z-10">{text}</span>

              {/* RareUI Liquid Arrow */}
              <div
                className={cn(
                  'absolute h-2 w-2 rotate-45 transform bg-surface-elevated border-border-strong',
                  getArrowClasses()
                )}
              />
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
};
