# Anviksha | Modern GGSIPU Result Wrapper & Academic Analytics Suite

[![Live Demo](https://img.shields.io/badge/Live_App-anviksha--result.vercel.app-000000?style=flat&logo=vercel&logoColor=white)](https://anviksha-result.vercel.app)
[![Version](https://img.shields.io/badge/Version-v1.6.0-gold?style=flat)]()
[![Next.js](https://img.shields.io/badge/Next.js-16.2-000000?style=flat&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2-23272F?style=flat&logo=react&logoColor=61DAFB)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-0B1120?style=flat&logo=tailwindcss&logoColor=38BDF8)](https://tailwindcss.com/)
[![Vitest](https://img.shields.io/badge/Vitest-64_Tests_Passing-1E293B?style=flat&logo=vitest&logoColor=FCC72B)](https://vitest.dev/)
[![Security](https://img.shields.io/badge/Security-Zero--Storage_Proxy-064E3B?style=flat&logo=auth0&logoColor=34D399)]()

## Overview

Anviksha Academic Analytics UI is a sophisticated, high-performance analytical wrapper designed to interface with the Guru Gobind Singh Indraprastha University (GGSIPU) examination portal (`examweb.ggsipu.ac.in`). It is not a standalone database-driven application, but rather an advanced, stateless proxy UI layer that transforms raw, unstructured university data into actionable academic intelligence.

The application functions as a sophisticated intermediary. It intercepts the standard user workflow of the GGSIPU portal and provides a modernized, interactive experience. By utilizing a stateless proxy architecture, Anviksha allows students to view their academic progression through high-fidelity visualizations, automated ordinance compliance checks, and institutional-grade transcript generation, all while maintaining a zero-storage security posture.

The primary value proposition lies in its ability to interpret complex university regulations—specifically Ordinance 11—and translate them into real-time analytics. From monitoring annual credit accumulation for year-back risks to calculating placement eligibility based on corporate recruitment cutoffs, Anviksha provides a level of academic foresight that the native university portal does not offer.

## Technology Stack

| Category | Technology | Version / Specification |
| :--- | :--- | :--- |
| **Core Framework** | Next.js | 16.2.12 (App Router Architecture) |
| **Library/Runtime** | React | 19.2.4 |
| **Language** | TypeScript | 5 |
| **Styling Engine** | Tailwind CSS | v4 (`@tailwindcss/postcss`) |
| **Animation Engine** | Framer Motion | v12 |
| **State Management** | Zustand | v5 (Global result caching & credit overrides) |
| **Data Fetching** | Axios | v1.19 |
| **HTML Parsing** | Cheerio | v1.2.0 (Error extraction & portal parsing) |
| **Schema Validation** | Zod | v4 |
| **Form Management** | React Hook Form | v7 (`@hookform/resolvers`) |
| **Data Visualization** | Recharts | v3.10 (Area, Bar, Pie, and Donut charts) |
| **PDF Rendering** | html2canvas-pro | v2.3.3 (Client-side DOM to Canvas) |
| **PDF Generation** | jspdf | v4.2.1 (Document assembly) |
| **Testing Suite** | Vitest | v4 (`vitest run`) |
| **Testing Utilities** | React Testing Library | v16 (with JSDOM) |
| **Observability** | Vercel Analytics | `@vercel/analytics` |

## Key Features

### Authentication & Session Security
Anviksha implements a robust proxy-based authentication flow to ensure seamless interaction with the GGSIPU upstream services.
* **CAPTCHA Proxying**: The application manages the GGSIPU captcha servlet via `/api/captcha`, ensuring that `JSESSIONID` cookies are passed with strict security directives including `httpOnly`, `secure`, and `sameSite: strict`.
* **Advanced Error Extraction**: Using Cheerio, the system parses the raw HTML responses from the university portal to identify specific error states, such as account lockouts, rate limiting, remaining attempt counters, and session timeouts, providing user-friendly feedback instead of raw HTML errors.
* **Anti-Abuse Protections**: The API layer implements strict `sec-fetch-site` validation and CORS isolation to prevent direct bot attacks, automated scraping, and unauthorized cross-site embedding.

### Academic Analytics Engine (Ordinance 11)
The core intelligence of the application is contained within the `grade-system.ts` helper, which automates complex academic calculations.
* **SGPA & CGPA Computation**: Automatically maps numerical marks to the GGSIPU grade point scale (O: 10, A+: 9, A: 8, B+: 7, B: 6, C: 5, P: 4, F: 0) in strict adherence to Ordinance 11.
* **Live Credit Overrides**: Through Zustand-powered state management, users can perform real-time credit recalculations per paper code. These updates propagate instantly across the entire dashboard, affecting total earned credits, SGPA, and cumulative CGPA.
* **Annual Credit Promotion Monitor**: A specialized logic module that tracks credit accumulation across paired semesters (e.g., Sem 1+2, Sem 3+4) to evaluate the risk of year-back detention under university regulations. Displays year-by-year breakdowns with passed/failed/total credit counts and clear promoted/detained verdicts.
* **Division Classification**: Evaluates cumulative CGPA against official revised GGSIPU division thresholds (Exemplary at 10.0, First Division at 6.5+, Second Division at 5.0+, Third Division at 4.0+).
* **Placement Gatekeeper Matrix**: An automated evaluator that checks student aggregates against standard corporate recruitment cutoffs (60%, 65%, 70%, 75%) with per-tier eligibility status, CGPA deficit calculations, and active backlog gatekeeping.
* **Re-appear Session Planner**: Automatically categorizes backlog subjects into Odd term (Nov/Dec, Semesters 1/3/5/7) or Even term (May/June, Semesters 2/4/6/8) queues with priority tagging and credit-at-risk summaries.

### Calculations Transparency Guide (`/calculations`)
* A comprehensive, dedicated guide breaking down every calculation, grade boundary, credit formula, Ordinance 11 50% promotion rule, division classification, and placement benchmark.
* Integrated with Schema.org `Article` structured data and table of contents anchor navigation.

### Feedback & Issue Reporting (`/report`)
* Dedicated reporting workflow with embedded Google Form.
* Automatic, non-sensitive diagnostic prefilling (route, programme, college, screen resolution) to streamline bug reports without collecting credentials or PII.
* Non-intrusive floating report button available across authenticated routes.

### Interactive Dashboard & Visualizations
The dashboard transforms static marks into dynamic visual narratives using Recharts, organized through a multi-perspective navigation system.
* **Perspective-Based Navigation**: A tabbed interface with four analytical views—Performance & Trends, Promotion & Standing, Placement Gatekeeper, and Full Dossier—each presenting contextually relevant components with animated transitions via Framer Motion.
* **Multi-Dimensional Filtering**: Users can toggle between individual semester views (I through VIII) or a cumulative aggregate view. The semester selector supports both full and compact labels for responsive layouts.
* **Grade Distribution Analysis**: Interactive donut charts provide a visual breakdown of grade frequencies (O through F) and highlight min/max scoring trends.
* **Performance Trend Mapping**: Area charts visualize the SGPA progression curve over time, while bar charts provide a granular contrast between internal and external marks.

### PDF Export & Transcript Generation
Anviksha provides institutional-grade document generation entirely on the client side.
* **Consolidated Master Transcript**: Generates a comprehensive single-page academic record via `ConsolidatedMasterTranscript.tsx`, featuring a student profile header, per-semester summary tables with SGPA, a cumulative statistics block (total credits, earned credits, CGPA, percentage, division), and a grade reference legend.
* **Per-Semester Marksheets**: Individual semester grade sheets with subject-level detail (paper code, title, internal/external marks, total, grade, grade points) via `ResultGradeSheet.tsx`.
* **Security Watermarking**: Integrates `AnvikshaWatermark.tsx` to ensure all exported documents carry official branding and visual integrity.
* **Zero-Server Compute Rendering**: By leveraging `html2canvas-pro` and `jspdf`, the application converts complex DOM nodes into downloadable PDFs without requiring server-side processing, ensuring privacy and speed.

## Directory & Code Architecture Layout

### Project Structure

```text
src/
├── app/
│   ├── (app)/
│   │   ├── calculations/
│   │   │   └── page.tsx
│   │   ├── dashboard/
│   │   │   ├── analytics/
│   │   │   │   └── page.tsx
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   └── report/
│   │       └── page.tsx
│   ├── (auth)/
│   │   └── login/
│   │       ├── layout.tsx
│   │       └── page.tsx
│   ├── api/
│   │   └── (auth)/
│   │       ├── captcha/
│   │       │   └── route.ts
│   │       ├── login/
│   │       │   ├── route.test.ts
│   │       │   └── route.ts
│   │       ├── logout/
│   │       │   └── route.ts
│   │       └── result/
│   │           ├── route.test.ts
│   │           └── route.ts
│   ├── globals.css
│   ├── layout.tsx
│   ├── manifest.ts
│   ├── not-found.tsx
│   ├── page.tsx
│   ├── robots.ts
│   └── sitemap.ts
├── components/
│   ├── analytics/
│   │   ├── AcademicPromotionCard.tsx
│   │   ├── AnalyticsOverview.tsx
│   │   ├── DivisionClassificationCard.tsx
│   │   ├── PlacementEligibilityCard.tsx
│   │   ├── QuickStatsDistribution.tsx
│   │   ├── ReappearSessionPlanner.tsx
│   │   ├── SemesterSelector.tsx
│   │   └── SemesterTrendChart.tsx
│   ├── common/
│   │   ├── AppNavbar.tsx
│   │   ├── ErrorBoundary.tsx
│   │   ├── FloatingReportButton.tsx
│   │   └── StructuredData.tsx
│   ├── dashboard/
│   │   ├── CreditTipModal.tsx
│   │   ├── LogoutButton.tsx
│   │   ├── PixelAvatar.tsx
│   │   └── Skeleton.tsx
│   ├── export/
│   │   ├── AnvikshaWatermark.tsx
│   │   ├── ConsolidatedMasterTranscript.tsx
│   │   └── ResultGradeSheet.tsx
│   ├── home/
│   │   └── ResultPreviewCard.tsx
│   ├── login/
│   │   └── LoginForm.tsx
│   └── report/
│       └── ReportForm.tsx
├── helpers/
│   ├── grade-system.ts
│   └── grade-system.test.ts
├── store/
│   └── result-store.ts
├── types/
│   ├── ApiResponse.ts
│   └── result.ts
├── validations/
│   ├── login.validation.test.ts
│   └── login.validation.ts
└── proxy.ts
```

### File Responsibility Mapping

| File / Directory | Responsibility |
| :--- | :--- |
| `src/app/api/(auth)/` | Secure proxy routes for CAPTCHA, Login, Logout, and Result fetching. |
| `src/app/(app)/calculations/` | Ordinance 11 documentation and grading system guide. |
| `src/app/(app)/report/` | Feedback and bug reporting page. |
| `src/components/report/` | Google Form embedding and diagnostic prefilling component. |
| `src/components/common/FloatingReportButton.tsx` | Global floating report trigger for authenticated views. |
| `src/app/layout.tsx` | Root layout with metadata, OpenGraph, Twitter Cards, geo tags, and StructuredData. |
| `src/app/sitemap.ts` | Dynamic XML sitemap generation. |
| `src/app/robots.ts` | Crawler access rules and sitemap pointer. |
| `src/app/manifest.ts` | PWA manifest configuration. |
| `src/helpers/grade-system.ts` | Ordinance 11 logic, grade mapping, promotion assessment, placement eligibility, reappear planner, and division classification. |
| `src/helpers/grade-system.test.ts` | Vitest unit test suite (64 tests) covering all grade-system calculations. |
| `src/store/result-store.ts` | Global state for result caching and credit override management. |
| `src/proxy.ts` | Handshake, authentication routing guard, and API rate limiting. |

## Testing

The project maintains a comprehensive Vitest test suite covering the core academic engine:

| Module | Tests | Coverage |
| :--- | :--- | :--- |
| `getResultState` | 7 tests | ExamWeb status codes (`08`/`09`), ABS, DET, CLEARED, BACK |
| `getGradeAndPoints` | 11 tests | All grade boundaries (O through F) |
| `getFallbackCredit` | 8 tests | Lab, project, studio, and lecture credit assignment |
| `getAcademicPromotionStatus` | 14 tests | 50% annual credit rule across paired semesters |
| `getPlacementEligibility` | 7 tests | All four placement tiers with backlog gatekeeping |
| `getReappearSessionPlan` | 8 tests | Odd/Even session segregation and priority tagging |
| `getDivisionClassification` | 7 tests | Revised Ordinance 11 division thresholds |
| `getGradeThemeClasses` | 8 tests | UI styling classes across all grade keys |
| **Total** | **64 tests** | **All passing** |

---

*Generated by [DevToolkit-AI](https://dev-toolkit-ai.vercel.app/)*