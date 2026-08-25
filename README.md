# Anviksha | Modern GGSIPU Result Wrapper & Academic Analytics Suite

[![Live Demo](https://img.shields.io/badge/Live_App-anviksha--result.vercel.app-000000?style=flat&logo=vercel&logoColor=white)](https://anviksha-result.vercel.app)
[![Version](https://img.shields.io/badge/Version-v1.6.0-gold?style=flat)]()
[![Next.js](https://img.shields.io/badge/Next.js-16.2-000000?style=flat&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2-23272F?style=flat&logo=react&logoColor=61DAFB)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-0B1120?style=flat&logo=tailwindcss&logoColor=38BDF8)](https://tailwindcss.com/)
[![Vitest](https://img.shields.io/badge/Vitest-66_Tests_Passing-1E293B?style=flat&logo=vitest&logoColor=FCC72B)](https://vitest.dev/)
[![Security](https://img.shields.io/badge/Security-Zero--Storage_Proxy-064E3B?style=flat&logo=auth0&logoColor=34D399)]()

## Overview

**Anviksha** is a modern, student-centric academic intelligence and results analytics platform engineered for students of **Guru Gobind Singh Indraprastha University (GGSIPU)**. It interfaces directly with the university examination portal (`examweb.ggsipu.ac.in`) as a stateless, privacy-first proxy layer.

Instead of presenting raw, unformatted tabular marks, Anviksha interprets university data according to official **GGSIPU Ordinance 11 regulations**, instantly providing:
- Real-time SGPA and CGPA computation with interactive credit adjustments.
- Annual 50% credit promotion standing checks to prevent year-back surprises.
- Placement eligibility gatekeeping against standard campus recruitment cutoffs (60%, 65%, 70%, 75%).
- Odd/Even reappearance session scheduling.
- Institutional-grade, single-page Consolidated Master Transcripts and marksheets.
- Live official GGSIPU examination circulars, date-sheets, and inspection notices updated every 15 minutes.

---

## Universal Programme & Stream Compatibility

Anviksha supports every academic course and affiliated institute across Delhi NCR:

* **Engineering & Technology:** B.Tech (CSE, IT, ECE, AI/ML, Robotics, Mech, Civil), BCA, MCA (Software Engineering), M.Tech.
* **Business & Management:** BBA (General, Banking & Insurance), MBA (all specializations), B.Com (Hons), B.A. Economics (Hons).
* **Law & Legal Studies:** BA LLB (Hons), BBA LLB (Hons), LLM (Corporate, Cyber, Criminal).
* **Medical & Allied Health Sciences:** B.Sc Nursing, BPT (Physiotherapy), B.Pharm, BMLT, BOT.
* **Media, Design & Humanities:** BA (Journalism & Mass Comm), B.Ed, B.Voc, Bachelor of Design.
* **50+ Affiliated Campuses:** USICT, MAIT, MSIT, BVCOE, BPIT, GTBIT, VIPS, ADGITM, JIMS, DTC, GNDIT, MERI, HMRITM, CPJ-CHS, IITM, BCIPS, TIIPS, FIMT, IINTM, and more.

---

## Key Features

### 1. Privacy-First Zero-Database Architecture
* **Direct Server Proxy:** Student credentials and examination results are proxied directly to official university servers (`examweb.ggsipu.ac.in`).
* **Zero Storage:** No database, passwords, or personal academic records are ever stored or logged.
* **Ephemeral Sessions:** Encrypted HTTP-only cookies expire automatically upon logout or browser close.

### 2. Ordinance 11 Academic Analytics Engine
* **Exact Quality Point Arithmetic:** Computes SGPA and CGPA using credit-weighted formulas (O: 10, A+: 9, A: 8, B+: 7, B: 6, C: 5, P: 4, F/ABS/DET: 0).
* **Live Credit Overrides:** Interactive modal allowing students to adjust paper credits on the fly with immediate global recalculation.
* **50% Annual Credit Rule Monitor:** Validates total cleared credits across paired semesters (e.g. Sem 1 + 2) to evaluate academic promotion standing.
* **Placement Gatekeeper:** Compares aggregate percentages against standard tech/consulting screening criteria (60%, 65%, 70%, 75%) with backlog checks.
* **Odd/Even Backlog Planner:** Segregates reappear papers into upcoming examination cycles (Nov/Dec vs May/June).
* **Division Classification:** Classifies degrees under revised Ordinance 11 (Exemplary at 10.0, First with Distinction at 7.5+, First at 6.5+, Second at 5.0+).

### 3. Live Examination Circulars & Notices Feed (`/notices`)
* **Automated 15-Minute ISR Synchronization:** Server-side web scraping of `ipu.ac.in/exam_notices.php` with 900-second Incremental Static Regeneration.
* **Categorization Engine:** Automatically flags circulars into Results Declared, Date-Sheets, Inspection Schedules, and General Notices.
* **Instant Keyword Filtering:** Fast client-side search across circular titles, departments, and dates with direct PDF downloads.

### 4. Client-Side Document Export
* **Consolidated Master Transcript:** High-fidelity, print-ready single-page record containing full semester histories, credit summaries, and QR verification watermark.
* **Semester Marksheets:** Detailed individual marksheets ready for print or PDF download.
* **Zero-Server Rendering:** Rendered directly in the client DOM using `html2canvas-pro` and `jspdf`.

---

## Technology Stack

| Category | Technology | Purpose |
| :--- | :--- | :--- |
| **Framework** | Next.js 16.2 (App Router, Turbopack) | Server Components, ISR Caching, Route Handlers |
| **Library** | React 19.2 | Client UI, concurrent rendering |
| **Language** | TypeScript 5 | End-to-end type safety |
| **Styling** | Tailwind CSS v4 (`@tailwindcss/postcss`) | Design tokens, responsive layout |
| **Motion** | Framer Motion v12 | Fluid transitions, hero micro-interactions |
| **State** | Zustand v5 | Global result caching & credit overrides |
| **Parsing** | Cheerio v1.2 | HTML parsing & exam notices extraction |
| **Charts** | Recharts v3.10 | Trend curves, grade distributions |
| **PDF Generation** | html2canvas-pro + jspdf | Client-side transcript generation |
| **Testing** | Vitest v4 | Unit, scraper, and validation test suite |
| **Analytics** | Vercel Analytics | Performance vitals & telemetry |

---

## Directory Layout

```text
src/
├── app/
│   ├── (app)/
│   │   ├── calculations/page.tsx   # Ordinance 11 transparent calculations guide
│   │   ├── dashboard/              # Student dashboard & analytics views
│   │   │   ├── analytics/page.tsx  # Detailed multi-perspective dossier
│   │   │   └── page.tsx            # Semester result overview
│   │   ├── notices/page.tsx        # Live 15-min ISR exam notices feed
│   │   └── report/page.tsx         # User feedback & diagnostic reporting
│   ├── (auth)/login/page.tsx       # Student login with captcha proxy
│   ├── api/                        # Secure upstream proxy endpoints
│   │   ├── captcha/route.ts        # Captcha image relay
│   │   ├── login/route.ts          # Authentication proxy & session establishment
│   │   ├── logout/route.ts         # Session destruction
│   │   └── result/route.ts         # Result scraping & structured JSON parsing
│   ├── layout.tsx                  # Root layout & SEO JSON-LD structured data
│   ├── page.tsx                    # Landing page with animated sections
│   ├── robots.ts                   # Search crawler directives
│   └── sitemap.ts                  # Dynamic XML sitemap generator
├── components/
│   ├── analytics/                  # Cards for Promotion, Placement, Trends, Division
│   ├── common/                     # StructuredData, ErrorBoundary, FloatingReport
│   ├── export/                     # Consolidated Master Transcript & Marksheets
│   ├── home/                       # LandingPageView & HeroDashboardPreview
│   └── notices/                    # NoticesClientView with search & filters
├── helpers/
│   ├── grade-system.ts             # Core Ordinance 11 math & classification logic
│   ├── grade-system.test.ts        # Unit tests for grading logic
│   ├── notices.ts                  # IPU notices scraper & category classifier
│   └── notices.test.ts             # Unit tests for notice parsing
├── store/
│   └── result-store.ts             # Zustand state for active marksheet data
└── validations/
    └── login.validation.ts         # Zod schemas for enrollment credentials
```

---

## Verification & Test Suite

The project includes an automated test suite executed via Vitest:

```bash
# Run unit and scraper tests
npm test

# Check TypeScript types
npx tsc --noEmit

# Run ESLint checks
npm run lint

# Build production bundle
npm run build
```

| Test Suite | Tests | Result |
| :--- | :--- | :--- |
| `grade-system.test.ts` | 64 tests | Passed |
| `notices.test.ts` | 2 tests | Passed |
| **Total** | **66 tests** | **100% Passed** |

---

## Author

Designed and built by **[Himanshu Singh](https://himanshusinghdangi.vercel.app)**.