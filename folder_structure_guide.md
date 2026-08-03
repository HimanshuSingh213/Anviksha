# Anviksha – Project Architecture & Folder Structure Guide

This document explains how the **Anviksha** codebase is structured, why each folder exists, and how data & components flow across the Next.js App Router architecture.

---

## 1. How the Structure Was Built

1. **Bootstrapping the Core**:
   The project was initialized using `npx create-next-app@latest` with TypeScript, Tailwind CSS (v4), ESLint, App Router (`src/` directory layout), and `@/*` module aliases.

2. **Domain-Driven Folder Organization**:
   Rather than placing all files in flat directories, the `src/` directory was partitioned into modular subfolders:
   - **`app/`**: Next.js App Router page routes, route groups, and server-side API proxy handlers.
   - **`components/`**: UI components organized by feature responsibility (auth, dashboard, analytics, export).
   - **`lib/`**: Business logic helpers, raw result normalizers, and GGSIPU credit mapping utilities.
   - **`store/`**: Client-side state management (Zustand) for in-memory session persistence.
   - **`types/`**: TypeScript interfaces defining student profiles, raw backend arrays, and evaluated subjects.
   - **`validations/`**: Input validation schemas (Zod) for login forms and lead capture.

---

## 2. Directory Tree & Purpose of Each Folder

```text
anviksha/
├── public/                         # Static assets (images, favicons, logos)
├── package.json                    # Dependencies (Next.js, Zustand, Recharts, Framer Motion, Zod)
├── tsconfig.json                   # TypeScript configuration & `@/*` path alias setup
├── next.config.ts                  # Next.js framework configuration
├── postcss.config.mjs              # PostCSS configuration for Tailwind CSS
├── folder_structure_guide.md       # (This file) Complete architecture guide
└── src/
    ├── app/                        # App Router Pages & API Proxies
    │   ├── layout.tsx              # Root Layout: Theme tokens, fonts (Plus Jakarta Sans, Inter, JetBrains Mono)
    │   ├── page.tsx                # Landing Homepage & Design System Showcase
    │   ├── globals.css             # Tailwind CSS imports & Obsidian dark theme variables
    │   │
    │   ├── (auth)/                 # [Route Group] Authentication Pages
    │   │   └── login/              # Login Page (`/login`) with CAPTCHA UI
    │   │       └── page.tsx
    │   │
    │   ├── (app)/                  # [Route Group] Main Application Dashboard Pages
    │   │   └── result/             # Main Result & Analytics Dashboard (`/result`)
    │   │
    │   └── api/                    # Server-side Next.js Proxy Endpoints
    │       ├── auth/
    │       │   ├── captcha/        # GET: Proxies CAPTCHA image & sets JSESSIONID cookie
    │       │   │   └── route.ts
    │       │   ├── login/          # POST: Submits SHA-256 hashed login to upstream portal
    │       │   └── logout/         # POST: Invalidates session and clears cookies
    │       └── results/            # GET: Proxies StudentSearchProcess API (`euno=100`)
    │
    ├── components/                 # React UI Components (Prop-driven & Reusable)
    │   ├── auth/                   # LoginForm, CaptchaImage loader components
    │   ├── dashboard/              # ProfileCard, StatSummaryCards, ResultTable components
    │   ├── analytics/              # Recharts visualizations (SgpaTrendChart, SkillRadarChart)
    │   ├── export/                 # PDF Marksheet generator components
    │   └── common/                 # Shared UI elements (Navbar, Buttons, Badges)
    │
    ├── lib/                        # Utility Functions & Business Logic
    │   ├── parser/                 # Converts raw GGSIPU JSON array rows into typed objects
    │   ├── syllabus-presets.ts     # Pre-loaded subject credit maps for USICT CSE/AI/DS/ECE
    │   └── on-the-fly-calculator.ts# GGSIPU Ordinance 11 Grade & SGPA/CGPA evaluation engine
    │
    ├── store/                      # Client-side State Management
    │   └── useStudentStore.ts      # Zustand store for result data & custom edited credits
    │
    ├── types/                      # TypeScript Type Definitions
    │   └── result.ts               # StudentProfile, RawResultRow, SubjectResult, SemesterSummary
    │
    └── validations/                # Input Validation Schemas
        └── login.validation.ts     # Zod validation schema for Enrollment, Password & CAPTCHA
```

---

## 3. Detailed Explanation of Key Folders

### 📁 `src/app/` (Next.js App Router)
* **`app/layout.tsx`**: Defines the HTML shell and loads Google Fonts (`Plus_Jakarta_Sans`, `Inter`, `JetBrains_Mono`).
* **`app/(auth)/`**: Next.js **Route Group** for authentication. The parenthesis `()` mean it groups pages cleanly in code without adding `/(auth)` to the browser URL (e.g. `/login`).
* **`app/(app)/`**: **Route Group** housing the main authenticated result dashboard (`/result`).
* **`app/api/`**: Server-side API handlers that proxy requests to GGSIPU's Java Servlets to bypass CORS and manage `JSESSIONID` cookies.

### 📁 `src/components/` (React UI Layer)
* **`components/auth/`**: Holds login-specific components like the CAPTCHA image refresh card.
* **`components/dashboard/`**: Holds cards for student profile metadata, summary badges (CGPA, Percentage, Earned Credits, Backlog status), and the credit-editable result table.
* **`components/analytics/`**: Houses Recharts visualizations (SGPA progression line graph, Skill Radar chart).
* **`components/export/`**: PDF generation component for 1-click evaluated marksheet downloads.

### 📁 `src/lib/` (Core Logic & Calculation Engine)
* **`lib/parser/`**: Normalizes raw backend array rows `[sem, paperCode, subjectName, int, ext, total, status, exam, date]` into structured TypeScript objects.
* **`lib/on-the-fly-calculator.ts`**: Implements GGSIPU Ordinance 11 grading logic (Total $\ge 40$ = PASS; Total $< 40$ = FAIL/Backlog).

### 📁 `src/store/` (State Management)
* **`store/useStudentStore.ts`**: Zustand store that retains fetched results and custom user-edited credits in `sessionStorage`. Since there is no database, everything lives safely in client memory.

### 📁 `src/validations/` (Schema Validation)
* **`validations/login.validation.ts`**: Zod schema validating student credentials and CAPTCHA input before triggering authentication requests.

---

## 4. Summary of Data Flow

```text
  [ User Enters Credentials & CAPTCHA ]
                    │
                    ▼
     [ Zod Validation (validations/) ]
                    │
                    ▼
   [ POST /api/auth/login Proxy Route ]
                    │
                    ▼
 [ GET /api/results Proxy (euno=100) ]
                    │
                    ▼
[ Raw Array Parsed & Evaluated (lib/) ]
                    │
                    ▼
 [ Stored in Zustand Store (store/) ] ──► Renders Dashboard & Charts (/result)
```
