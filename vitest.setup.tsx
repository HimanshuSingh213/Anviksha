import React from "react";
import "@testing-library/jest-dom";
import { vi, beforeAll, afterAll } from "vitest";

// Mock Next.js router
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
  }),
  usePathname: () => "/dashboard",
  useSearchParams: () => new URLSearchParams(),
}));

// Mock next/image
vi.mock("next/image", () => ({
  // eslint-disable-next-line @next/next/no-img-element
  default: ({ src, alt, ...props }: any) => <img src={src} alt={alt} {...props} />,
}));

// Mock sonner toast
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

// Mock framer-motion
vi.mock("framer-motion", () => {
  // Renders motion.<tag> as the real tag so layout-heavy components can be tested
  const motionProps = [
    "initial", "animate", "exit", "transition", "variants",
    "whileHover", "whileTap", "whileFocus", "whileInView", "layout", "layoutId",
  ];
  const motion = new Proxy(
    {},
    {
      get: (_target, tag: string) => {
        const Component = ({ children, ...props }: any) => {
          const domProps = { ...props };
          motionProps.forEach((key) => delete domProps[key]);
          return React.createElement(tag, domProps, children);
        };
        return Component;
      },
    },
  );

  const motionValue = (value: number) => ({
    get: () => value,
    set: vi.fn(),
    on: vi.fn(),
    destroy: vi.fn(),
  });

  return {
    motion,
    AnimatePresence: ({ children }: any) => <>{children}</>,
    useReducedMotion: () => false,
    useMotionValue: (value: number = 0) => motionValue(value),
    useSpring: (value: any) =>
      typeof value === "number" ? motionValue(value) : (value ?? motionValue(0)),
    useTransform: () => 0,
    useMotionTemplate: () => "",
    useScroll: () => ({ scrollYProgress: motionValue(0) }),
    useInView: () => true,
  };
});

// Mock Zustand store
vi.mock("@/store/result-store", () => ({
  default: () => ({
    result: null,
    customCredits: {},
    setResult: vi.fn(),
    setCustomCredit: vi.fn(),
    clearResult: vi.fn(),
  }),
}));

// Mock axios
vi.mock("axios", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
  get: vi.fn(),
  post: vi.fn(),
}));

// Global test utilities
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Suppress specific console errors in tests
const originalError = console.error;
beforeAll(() => {
  console.error = (...args) => {
    if (
      args[0]?.includes?.("Warning: ReactDOM.render is no longer supported") ||
      args[0]?.includes?.("act(...)")
    ) {
      return;
    }
    originalError.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
});