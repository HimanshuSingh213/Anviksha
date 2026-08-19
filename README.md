# Anviksha | Modern GGSIPU Result Wrapper & Academic Analytics Suite

[![Live Demo](https://img.shields.io/badge/Live_App-anviksha--result.vercel.app-000000?style=flat&logo=vercel&logoColor=white)](https://anviksha-result.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js-16.2-000000?style=flat&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2-23272F?style=flat&logo=react&logoColor=61DAFB)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-0B1120?style=flat&logo=tailwindcss&logoColor=38BDF8)](https://tailwindcss.com/)
[![Vitest](https://img.shields.io/badge/Vitest-63_Tests_Passing-1E293B?style=flat&logo=vitest&logoColor=FCC72B)](https://vitest.dev/)
[![Security](https://img.shields.io/badge/Security-Zero--Storage_Proxy-064E3B?style=flat&logo=auth0&logoColor=34D399)]()

## Overview

Anviksha Academic Analytics UI is a sophisticated, high-performance analytical wrapper designed to interface with the Guru Gobind Singh Indraprashtha University (GGSIPU) examination portal (`examweb.ggsipu.ac.in`). It is not a standalone database-driven application, but rather an advanced, stateless proxy UI layer that transforms raw, unstructured university data into actionable academic intelligence.

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
* **Anti-Abuse Mechanisms**: The API layer implements strict header checks, including `sec-fetch-site` validation, to prevent direct browser navigation and unauthorized cross-site embedding.

### Academic Analytics Engine (Ordinance 11)
The core intelligence of the application is contained within the `grade-system.ts` helper, which automates complex academic calculations.
* **SGPA & CGPA Computation**: Automatically maps numerical marks to the GGSIPU grade point scale (O: 10, A+: 9, A: 8, B+: 7, B: 6, C: 5, P: 4, F: 0) in strict adherence to Ordinance 11.
* **Live Credit Overrides**: Through Zustand-powered state management, users can perform real-time credit recalculations per paper code. These updates propagate instantly across the entire dashboard, affecting total earned credits, SGPA, and cumulative CGPA.
* **Annual Credit Promotion Monitor**: A specialized logic module that tracks credit accumulation across paired semesters (e.g., Sem 1+2, Sem 3+4) to evaluate the risk of year-back detention under university regulations. Displays year-by-year breakdowns with passed/failed/total credit counts and clear promoted/detained verdicts.
* **Division Classification**: Evaluates cumulative CGPA against official GGSIPU division thresholds (Distinction at 7.5+, First Division at 6.5+, Second Division at 5.0+, Pass at 4.0+) factoring in active backlog disqualification.
* **Placement Gatekeeper Matrix**: An automated evaluator that checks student aggregates against standard corporate recruitment cutoffs (60%, 65%, 70%, 75%) with per-tier eligibility status, CGPA deficit calculations, and active backlog gatekeeping.
* **Re-appear Session Planner**: Automatically categorizes backlog subjects into Odd term (Nov/Dec, Semesters 1/3/5/7) or Even term (May/June, Semesters 2/4/6/8) queues with priority tagging and credit-at-risk summaries.

### Interactive Dashboard & Visualizations
The dashboard transforms static marks into dynamic visual narratives using Recharts, organized through a multi-perspective navigation system.
* **Perspective-Based Navigation**: A tabbed interface with four analytical views—Performance & Trends, Promotion & Standing, Placement Gatekeeper, and Full Dossier—each presenting contextually relevant components with animated transitions via Framer Motion.
* **Multi-Dimensional Filtering**: Users can toggle between individual semester views (I through VIII) or a cumulative aggregate view. The semester selector supports both full and compact labels for responsive layouts.
* **Grade Distribution Analysis**: Interactive donut charts provide a visual breakdown of grade frequencies (O through F) and highlight min/max scoring trends.
* **Performance Trend Mapping**: Area charts visualize the SGPA progression curve over time, while bar charts provide a granular contrast between internal and external marks.

### PDF Export & Transcript Generation
Anviksha provides institutional-grade document generation entirely on the client side.
* **Consolidated Master Transcript**: Generates a comprehensive single-page academic record via the `ConsolidatedMasterTranscript.tsx` component, featuring a student profile header, per-semester summary tables with SGPA, a cumulative statistics block (total credits, earned credits, CGPA, percentage, division), and a grade reference legend.
* **Per-Semester Marksheets**: Individual semester grade sheets with subject-level detail (paper code, title, internal/external marks, total, grade, grade points) via `ResultGradeSheet.tsx`.
* **Security Watermarking**: Integrates `AnvikshaWatermark.tsx` to ensure all exported documents carry the appropriate branding and visual integrity.
* **Zero-Server Compute Rendering**: By leveraging `html2canvas-pro` and `jspdf`, the application converts complex DOM nodes into downloadable PDFs without requiring server-side processing, ensuring privacy and speed.

### SEO & Discoverability
Anviksha implements a modern search engine optimization strategy designed for maximum visibility on Google and other search engines.
* **Schema.org JSON-LD Structured Data**: Injects a multi-entity JSON-LD graph (`WebApplication`, `WebSite`, `FAQPage`, `HowTo`, `BreadcrumbList`) into every page via the `StructuredData.tsx` component, enabling Google Rich Results and AI Overviews.
* **Dynamic XML Sitemap**: Auto-generated via Next.js `sitemap.ts` covering all public routes (`/`, `/login`, `/dashboard`, `/dashboard/analytics`) with priority and change frequency metadata.
* **Robots Directives**: Configured via `robots.ts` to allow full crawling while blocking `/api/` routes, with a pointer to the sitemap.
* **PWA Manifest**: A `manifest.ts` configuration enables Progressive Web App installability with standalone display mode.
* **Geo-Targeting**: Meta tags target the Delhi/India region (`geo.region: IN-DL`) for local search relevance.
* **Rich On-Page FAQ Section**: A crawlable FAQ block on the landing page mirrors the JSON-LD FAQPage schema, covering high-intent queries around GGSIPU results, Ordinance 11, and reappear policies.

## Directory & Code Architecture Layout

### Project Structure

```text
src/
├── app/
│   ├── (app)/
│   │   └── dashboard/
│   │       ├── analytics/
│   │       │   └── page.tsx
│   │       ├── layout.tsx
│   │       └── page.tsx
│   ├── (auth)/
│   │   └── login/
│   │       ├── layout.tsx
│   │       └── page.tsx
│   ├── api/
│   │   └── (auth)/
│   │       ├── captcha/
│   │       ├── login/
│   │       ├── logout/
│   │       └── result/
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
│   │   └── StructuredData.tsx
│   ├── dashboard/
│   ├── export/
│   │   ├── AnvikshaWatermark.tsx
│   │   ├── ConsolidatedMasterTranscript.tsx
│   │   └── ResultGradeSheet.tsx
│   ├── home/
│   └── login/
├── helpers/
│   ├── grade-system.ts
│   └── grade-system.test.ts
├── store/
├── types/
└── validations/
```

### File Responsibility Mapping

| File / Directory | Responsibility |
| :--- | :--- |
| `src/app/api/(auth)/` | Secure proxy routes for CAPTCHA, Login, Logout, and Result fetching. |
| `src/app/layout.tsx` | Root layout with metadata, OpenGraph, Twitter Cards, geo tags, and StructuredData injection. |
| `src/app/sitemap.ts` | Dynamic XML sitemap generation for search engine discovery. |
| `src/app/robots.ts` | Crawler access rules and sitemap pointer. |
| `src/app/manifest.ts` | PWA manifest configuration for installability. |
| `src/helpers/grade-system.ts` | Implementation of Ordinance 11 logic, grade mapping, promotion assessment, placement eligibility, reappear session planning, and division classification. |
| `src/helpers/grade-system.test.ts` | Vitest unit test suite (56 tests) covering all grade-system calculations. |
| `src/store/result-store.ts` | Global state for result caching and credit override management. |
| `src/components/analytics/` | Visual components including Trend Charts, Grade Distributions, Promotion Cards, Placement Matrices, Division Classification, and Reappear Planners. |
| `src/components/common/StructuredData.tsx` | Schema.org JSON-LD graph injection for Google Rich Results. |
| `src/components/export/` | Logic for PDF generation, Master Transcript rendering, and watermark embedding. |
| `src/components/login/` | Authentication UI and form handling. |
| `src/validations/` | Zod-based schema validation for secure data entry. |
| `src/proxy.ts` | Core logic for handling the university handshake and hashing. |
| `src/types/` | TypeScript definitions for API responses and result structures. |

## Unique Architectural Patterns

### Stateless Proxy Architecture
Unlike traditional applications, Anviksha does not utilize a persistent database. It operates as a stateless intermediary between the user and the GGSIPU server.
1. **Handshake**: Authentication payloads are hashed using SHA-256 (base64) via the `crypto` module.
2. **Proxying**: Requests are forwarded to the upstream university servlets.
3. **Normalization**: Raw HTML/JSON responses are parsed by Cheerio and transformed into clean, typed JSON objects.
4. **Termination**: All session data and `JSESSIONID` cookies exist only in volatile memory and are purged upon logout or session expiration.

### Zero-Storage Security Model
To ensure maximum student privacy, the application adheres to a strict zero-storage policy:
* No student enrollment numbers, passwords, or marks are written to any persistent disk.
* All analytical computations are performed in the client-side runtime.
* The application acts as a "view-only" enhancement, ensuring that the user's sensitive data never leaves the secure proxy-to-client pipeline.

### Client-Side Heavy Compute
To minimize server overhead and maximize privacy, Anviksha offloads heavy tasks to the client:
* **PDF Generation**: The conversion of complex React components into high-resolution PDFs is handled via `html2canvas-pro` on the user's device.
* **Analytics**: All SGPA/CGPA recalculations and credit overrides are managed via Zustand in the browser, allowing for instantaneous UI updates without network round-trips.

## Testing

The project maintains a comprehensive Vitest test suite covering the core `grade-system.ts` helper:

| Module | Tests | Coverage |
| :--- | :--- | :--- |
| `getGradeAndPoints` | 11 tests | All grade boundaries (O through F) |
| `getDefaultCredit` | 8 tests | Lab, project, seminar, and lecture credit assignment |
| `getPromotionAssessment` | 14 tests | Year-back detection across all academic year pairings |
| `getPlacementEligibility` | 7 tests | All four placement tiers with backlog gatekeeping |
| `getReappearSessionPlan` | 8 tests | Odd/Even session segregation and priority tagging |
| `getDivisionClassification` | 7 tests | Division thresholds with backlog disqualification |
| `getGradeThemeClasses` | 8 tests | UI styling classes across all grade keys |
| **Total** | **63 tests** | **All passing** |

---

*Generated by [DevToolkit-AI](https://dev-toolkit-ai.vercel.app/)*