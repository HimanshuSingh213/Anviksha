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
vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    span: ({ children, ...props }: any) => <span {...props}>{children}</span>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

// Mock lucide-react icons
vi.mock("lucide-react", () => {
  const icons = [
    "Hash", "KeyRound", "Eye", "EyeOff", "Fingerprint", "RefreshCcw",
    "MoveRight", "Loader2", "AlertTriangle", "CheckCircle2", "Percent",
    "BarChart2", "BookOpen", "Pencil", "ArrowRight", "FileDown",
    "Award", "TrendingUp", "Calculator", "ShieldCheck", "Timer",
    "PieChart", "FileText", "ChevronDown", "Info", "ArrowLeft",
    "Home", "LogOut", "SlidersHorizontal", "Download", "CompassIcon",
    "BarChart3"
  ];
  const mocked: Record<string, any> = {};
  icons.forEach((name) => {
    mocked[name] = ({ ...props }: any) => <svg data-testid={`icon-${name.toLowerCase()}`} {...props} />;
  });
  return mocked;
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