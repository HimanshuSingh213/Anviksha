# Anviksha | Modern GGSIPU Result Wrapper & Academic Analytics Suite

[![Live Demo](https://img.shields.io/badge/Live_App-anviksha--result.vercel.app-000000?style=flat&logo=vercel&logoColor=white)](https://anviksha-result.vercel.app)
[![Version](https://img.shields.io/badge/Version-v1.6.0-gold?style=flat)]()
[![Next.js](https://img.shields.io/badge/Next.js-16.2-000000?style=flat&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2-23272F?style=flat&logo=react&logoColor=61DAFB)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-0B1120?style=flat&logo=tailwindcss&logoColor=38BDF8)](https://tailwindcss.com/)
[![Vitest](https://img.shields.io/badge/Vitest-125_Tests_Passing-1E293B?style=flat&logo=vitest&logoColor=FCC72B)](https://vitest.dev/)
[![Security](https://img.shields.io/badge/Security-Zero--Storage_Proxy-064E3B?style=flat&logo=auth0&logoColor=34D399)]()

## Overview

**Anviksha** (अन्वीक्षा — *"analytical enquiry"*) is a modern, student-centric academic intelligence and results analytics platform engineered for students of **Guru Gobind Singh Indraprastha University (GGSIPU)**. It interfaces directly with the university examination portal (`examweb.ggsipu.ac.in`) as a **stateless, privacy-first proxy layer** — no database, no stored credentials, no retained records.

Instead of presenting raw, unformatted tabular marks, Anviksha interprets university data through a **capability-gated academic rules engine** built on official **GGSIPU ordinances** (Ordinance 11 and sibling ordinance families), instantly providing:

- Real-time SGPA and CGPA computation with interactive credit adjustments.
- Annual promotion standing checks (Ordinance 11 §23 + §11.7, including the 90% previous-year rule).
- Placement eligibility gatekeeping against standard campus recruitment cutoffs (60%, 65%, 70%, 75%).
- Odd/Even reappearance session planning for backlog papers.
- Institutional-grade, single-page Consolidated Master Transcripts and semester marksheets (PDF export).
- Live official GGSIPU examination circulars, date-sheets, and notices refreshed every 15 minutes.
- A **Universal Result Viewer** that honestly renders results for every programme — calculating analytics only where rules are verified, and clearly labelling everything else as published or unavailable.

---

## Table of Contents

- [Core Design Principles](#core-design-principles)
- [Key Features](#key-features)
- [The Capability-Gated Rules Engine](#the-capability-gated-rules-engine)
- [Programme & Stream Compatibility](#programme--stream-compatibility)
- [Technology Stack](#technology-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Architecture & Data Flow](#architecture--data-flow)
- [Grading Reference (Ordinance 11)](#grading-reference-ordinance-11)
- [Scripts](#scripts)
- [Testing & Verification](#testing--verification)
- [Security & Privacy](#security--privacy)
- [Deployment](#deployment)
- [Documentation](#documentation)
- [Author](#author)

---

## Core Design Principles

1. **Zero-Storage Privacy** — Credentials, marks, and personal data are proxied, never persisted. There is no database anywhere in the stack.
2. **Honesty Over Guesswork** — Anviksha never computes a number it cannot justify. Every metric carries a provenance state: `VERIFIED` (calculated under confirmed ordinance rules), `RESULT_PROVIDED` (published by GGSIPU, shown as-is), or `UNAVAILABLE` (hidden with an explanation, never fabricated).
3. **Fail-Closed Rendering** — If a programme's rules are unverified, analytics are not shown — rather than silently applying Ordinance-11-shaped math to a medical or law programme where it does not belong.
4. **Additive, Tested Evolution** — The `src/academic/` rules engine is fully type- and test-covered (125 automated tests) and grows as ordinance/scheme verification progresses.

---

## Key Features

### 1. Privacy-First Session Proxy
- **Direct Server Proxy:** Credentials and results are relayed through Next.js Route Handlers straight to the official university servlets (`/web/Login`, `/web/Logout`, `/web/StudentSearchProcess`, `/web/CaptchaServlet`).
- **Client-Side SHA-256 Hashing:** Passwords are hashed with the captcha salt in the browser (Web Crypto API) before ever leaving the page.
- **Ephemeral Sessions:** The upstream `JSESSIONID` is captured server-side and stored in secure `HttpOnly` cookies scoped to `/api`, expiring on logout or browser close.
- **Edge Middleware Guard (`src/proxy.ts`):** Protects `/dashboard` and `/api/result`, redirecting expired sessions to `/login?expired=true` and preventing logged-in users from re-entering the login page.
- **Full-Fetch Strategy (`euno=100`):** All semester results are fetched in a single upstream call at login, eliminating repeated requests and session-timeout churn.

### 2. Ordinance 11 Academic Analytics Engine
- **Exact Quality-Point Arithmetic:** SGPA/CGPA via credit-weighted formulas (O: 10, A+: 9, A: 8, B+: 7, B: 6, C: 5, P: 4, F/ABS/DET: 0); percentage = CGPA × 9.5 (§29).
- **Live Credit Overrides:** Click any credit badge in the result table to correct a paper's credits; every SGPA/CGPA/analytics view recalculates instantly (persisted in Zustand as `customCredits`).
- **Promotion Monitor (§23 + §11.7):** Validates cleared credits across paired semesters and against the prior year's 90% threshold to surface year-back risk early. Unknown outcomes render as *in-progress*, never as failure.
- **Placement Gatekeeper:** Compares aggregate percentage against common recruiter cutoffs (60/65/70/75%) with backlog flags.
- **Odd/Even Backlog Planner:** Segregates reappear papers into upcoming examination cycles (Nov/Dec vs May/June), clearly labelled as heuristic until scheme-backed exam windows are verified.
- **Division Classifier (§30):** Exemplary / First Division with Distinction / First / Second classification with honour badges.

### 3. Universal Result Viewer
- A single viewer (`src/components/result/`) renders **every** programme's result honestly: verified programmes get full analytics; unverified ones show published marks with reason chips instead of invented GPAs.
- Handles semester, annual, trimester, weekend, and professional academic systems; normalizes raw statuses (ABS/CAN/DET/RL/CS/AP) into precise result states.

### 4. Live Examination Notices Feed (`/notices`)
- **15-Minute ISR Sync:** Server-side scraping of `ipu.ac.in/exam_notices.php` (Cheerio) with 900-second Incremental Static Regeneration.
- **Auto-Categorization:** Flags circulars into Results Declared, Date-Sheets, Inspection Schedules, and General Notices.
- **Instant Search:** Client-side keyword filtering across titles, departments, and dates with direct PDF links.

### 5. Client-Side Document Export
- **Consolidated Master Transcript:** Print-ready single-page record with full semester history, credit summaries, and QR verification watermark.
- **Semester Marksheets:** Detailed individual marksheets for print/PDF.
- **Zero-Server Rendering:** Generated entirely in the browser with `html2canvas-pro` + `jspdf` — exports never touch a server.

### 6. Seasoned Landing & SEO Layer
- Animated landing page (Framer Motion) with programme stream tabs, FAQ accordion, and a live hero dashboard preview.
- `sitemap.ts`, `robots.ts`, `manifest.ts`, and JSON-LD structured data out of the box.

---

## The Capability-Gated Rules Engine

The heart of Anviksha is `src/academic/` — a typed, registry-driven rules layer that answers one question per programme: *"What are we allowed to claim about this result?"*

```text
Raw ExamWeb JSON
      │
      ▼
parsers/examweb.ts        → NormalizedStudentResult (marks, statuses, provenance)
      │
      ▼
programmes/registry.ts    → ProgrammeProfile (ordinance family, academic system)
      │
      ▼
engine/resolver.ts        → Resolution: CapabilitySet + RuleWarnings
      │                          (VERIFIED / RESULT_PROVIDED / UNAVAILABLE per metric)
      ▼
rules/ord11.ts            → Verified Ordinance 11 rule implementations
      │                          (grades §22, promotion §23+§11.7, percentage §29, division §30)
      ▼
Viewer & Analytics        → Render strictly within capabilities; surface every warning
```

- **Ordinance Families:** `ORD_10, ORD_11, ORD_15, ORD_16, ORD_20–25, ORD_27, ORD_29, ORD_31, ORD_38, CUSTOM, UNKNOWN` — each with version/amendment chains tracked in `ordinances/registry.ts`.
- **Scheme Registry:** `schemes/registry.ts` maps programme → scheme versions/batches; credits are marked `SCHEME` | `RESULT` | `FALLBACK` | `UNKNOWN` provenance so estimates are never presented as official.
- **Warnings as UI:** `SCHEME_NOT_VERIFIED`, `PENDING_VERIFICATION`, `REAPPEAR_HEURISTIC`, `PARSER_DERIVED_VALUES` etc. are structured objects rendered as disclosure chips — transparency is a first-class output, not a log line.

---

## Programme & Stream Compatibility

The programme registry (`src/academic/programmes/registry.ts`) ships with 31 profiles spanning every GGSIPU stream and 50+ affiliated campuses (USICT, MAIT, MSIT, BVCOE, BPIT, GTBIT, VIPS, ADGITM, JIMS, DTC, GNDIT, MERI, HMRITM, CPJ-CHS, IITM, BCIPS, TIIPS, FIMT, IINTM, …):

| Stream | Programmes |
| :--- | :--- |
| **Engineering & Technology** | B.Tech, M.Tech, BCA, MCA |
| **Business & Management** | BBA, MBA, B.Com (Hons), B.A. Economics (Hons) |
| **Law** | BA LLB (Hons), BBA LLB (Hons), LLM |
| **Medical & Allied Health** | MBBS, BAMS, BHMS, B.Sc Nursing, BPT, BOT, BASLP, B.Pharm, B-Rehab, Medical PG |
| **Architecture & Design** | B.Arch |
| **Media & Education** | BJMC, B.Ed, B.Voc |
| **Flexible Systems** | Annual Bachelor's/Master's, Weekend, Trimester Master's, HR Planning, Archaeology |

Ordinance-11 programmes (most semester-based UG/PG) receive **full analytics**; professional programmes under separate ordinances receive **honest result viewing** until their rule sets are verified.

---

## Technology Stack

| Category | Technology | Purpose |
| :--- | :--- | :--- |
| **Framework** | Next.js 16.2 (App Router, Turbopack) | Server Components, ISR caching, Route Handlers, middleware |
| **Library** | React 19.2 (+ React Compiler) | Client UI, concurrent rendering |
| **Language** | TypeScript 5 | End-to-end type safety |
| **Styling** | Tailwind CSS v4 (`@tailwindcss/postcss`) | Obsidian-dark design tokens, responsive layout |
| **Motion** | Framer Motion v12 | Fluid transitions, hero micro-interactions |
| **State** | Zustand v5 | In-memory result caching & credit overrides |
| **Parsing** | Cheerio v1 | Notices scraping & normalization |
| **Charts** | Recharts v3 | SGPA trends, grade distributions, internal/external splits |
| **Forms** | react-hook-form + Zod | Validated login & report forms |
| **PDF Export** | html2canvas-pro + jspdf | Client-side transcript/marksheet generation |
| **Testing** | Vitest v4 + Testing Library + jsdom | Unit, parser, resolver & route tests |
| **Analytics** | Vercel Analytics | Performance vitals & telemetry |

---

## Getting Started

### Prerequisites
- Node.js 20+ and npm

### Setup

```bash
# Clone the repository
git clone https://github.com/<your-user>/anviksha.git
cd anviksha

# Install dependencies
npm install

# Start the development server (Turbopack)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Sign in with your GGSIPU enrollment number, password, and the captcha shown (relayed live from the university portal).

> No environment variables are required — the app is deliberately configuration-free and stateless.

---

## Project Structure

```text
anviksha/
├── Reports/                        # Audit reports, rule-system specs, publishing guide
├── public/                         # Static assets (icons, logos)
├── src/
│   ├── proxy.ts                    # Edge middleware: auth guards for /dashboard, /api/result
│   │
│   ├── academic/                   # ▸ Capability-gated rules engine (pure TypeScript)
│   │   ├── types.ts                #   Core types: SupportState, CapabilitySet, warnings
│   │   ├── engine/resolver.ts      #   Programme → capabilities + warnings resolution
│   │   ├── ordinances/registry.ts  #   Ordinance families, versions & amendment chains
│   │   ├── programmes/             #   31 programme profiles + fuzzy alias matching
│   │   ├── schemes/registry.ts     #   Scheme/batch credit mappings (verified-flagged)
│   │   ├── rules/ord11.ts          #   Verified Ordinance 11 implementation (§22–§30)
│   │   └── parsers/examweb.ts      #   ExamWeb JSON → normalized, provenance-tagged results
│   │
│   ├── app/                        # Next.js App Router
│   │   ├── layout.tsx              #   Root layout: fonts, SEO, JSON-LD structured data
│   │   ├── page.tsx                #   Animated landing page
│   │   ├── manifest.ts / robots.ts / sitemap.ts
│   │   ├── (auth)/login/           #   Login page with captcha proxy
│   │   ├── (app)/
│   │   │   ├── dashboard/          #   Result overview + /analytics deep dossier
│   │   │   ├── notices/            #   Live exam circulars (15-min ISR)
│   │   │   ├── calculations/       #   Transparent Ordinance 11 methodology guide
│   │   │   └── report/             #   User feedback & diagnostics
│   │   └── api/(auth)/
│   │       ├── captcha/route.ts    #   Captcha image relay + JSESSIONID capture
│   │       ├── login/route.ts      #   Credential proxy → upstream /web/Login
│   │       ├── logout/route.ts     #   Session destruction + upstream /web/Logout
│   │       └── result/route.ts     #   Full result fetch (euno=100) + normalization
│   │
│   ├── components/
│   │   ├── home/                   #   LandingPageView, HeroDashboardPreview, FAQ, streams
│   │   ├── login/                  #   LoginForm (Web Crypto SHA-256 hashing)
│   │   ├── dashboard/              #   CreditTipModal, skeletons, avatar, logout
│   │   ├── result/                 #   UniversalResultViewer, CourseTable, PeriodSection,
│   │   │                           #   StudentProfileCard, SupportBadge
│   │   ├── analytics/              #   Promotion, Placement, Division, Trends, Reappear,
│   │   │                           #   SemesterSelector, QuickStats cards
│   │   ├── export/                 #   ConsolidatedMasterTranscript, ResultGradeSheet
│   │   ├── notices/                #   NoticesClientView (search + categories)
│   │   └── common/                 #   Navbar, ErrorBoundary, FloatingReport, StructuredData
│   │
│   ├── helpers/
│   │   ├── grade-system.ts         #   Legacy-compatible Ordinance 11 math core
│   │   ├── grade-system-context.ts #   Capability-aware analytics context builder
│   │   └── notices.ts              #   IPU notices scraper & category classifier
│   │
│   ├── store/result-store.ts       #   Zustand: active result + custom credit overrides
│   ├── types/                      #   StudentProfile, Result, Notice, ApiResponse types
│   └── validations/                #   Zod schemas (login credentials)
│
├── features_and_specifications.md  # Full product & design specification
├── folder_structure_guide.md       # Architecture rationale & data flow
├── flow.md                         # Reverse-engineering notes on the GGSIPU portal
├── vercel.json                     # Vercel config (BOM region, 30s function ceiling)
└── vitest.config.mjs               # Test configuration (jsdom, coverage)
```

---

## Architecture & Data Flow

```text
 Browser                                    Anviksha (Next.js)                GGSIPU Portal
─────────────                          ──────────────────────────         ───────────────────
 Enter credentials + captcha
        │                                        │
        ▼                                        ▼
 Zod validation ─────────────────►  POST /api/(auth)/login ─────────►  POST /web/Login
 SHA-256(password + captcha salt)        │  (captures JSESSIONID            │
        │                                 │   into HttpOnly cookie)        ▼
        │                                 │                          session established
        ▼                                 ▼
 Dashboard request ──────────────►  GET /api/(auth)/result ─────────►  StudentSearchProcess
        │                                 │  (euno=100 full fetch)         ?euno=100
        │                                 ▼
        │                          parsers/examweb.ts
        │                          + engine/resolver.ts
        │                          + rules/ord11.ts
        ▼                                 ▼
 Zustand store (in-memory) ◄────── Normalized result + capabilities
        │
        ├──► Dashboard, Analytics, Viewer (capability-gated rendering)
        └──► PDF Transcript export (client-side only)

 Logout ─────────────────────────►  POST /api/(auth)/logout ────────►  GET /web/Logout
                                        (cookies destroyed)
```

**Session lifecycle:** middleware (`src/proxy.ts`) checks the `auth_session` cookie on every protected request; expired sessions receive a `401 SESSION_EXPIRED` (API) or a redirect to `/login?expired=true` (pages).

---

## Grading Reference (Ordinance 11)

| Marks Range | Letter Grade | Grade Points | Status |
| :--- | :--- | :--- | :--- |
| 90 – 100 | **O** (Outstanding) | 10 | Pass |
| 75 – 89 | **A+** (Excellent) | 9 | Pass |
| 65 – 74 | **A** (Very Good) | 8 | Pass |
| 55 – 64 | **B+** (Good) | 7 | Pass |
| 50 – 54 | **B** (Above Average) | 6 | Pass |
| 45 – 49 | **C** (Average) | 5 | Pass |
| 40 – 44 | **P** (Pass) | 4 | Pass |
| 0 – 39 | **F** (Fail) | 0 | Backlog |

- **Passing rule:** Internal + External total ≥ 40 (no separate internal cutoff).
- **SGPA** = Σ(Cᵢ × Gᵢ) / ΣCᵢ &nbsp;·&nbsp; **Percentage** = CGPA × 9.5 (§29)
- **Division (§30):** First with Distinction ≥ 7.5 · First ≥ 6.5 · Second ≥ 5.0
- Special totals (`ABS`, `CAN`, `DET`, `RL`, `CS`, `AP`) map to precise result states, never guessed as pass/fail.

---

## Scripts

| Command | Description |
| :--- | :--- |
| `npm run dev` | Start the dev server (Turbopack) |
| `npm run build` | Production build |
| `npm start` | Serve the production build |
| `npm run lint` | ESLint across the project |
| `npm test` | Run the full Vitest suite |
| `npm run test:watch` | Vitest in watch mode |
| `npm run test:coverage` | Test run with coverage report |
| `npx tsc --noEmit` | TypeScript type-check |

---

## Testing & Verification

The project maintains a **125-test** automated suite (9 files) covering the rules engine, parsers, resolvers, validators, and API routes:

```bash
npm test              # 125 tests, currently 100% green
npx tsc --noEmit      # clean
npm run lint          # 0 errors
npm run build         # production bundle
```

| Suite | Focus |
| :--- | :--- |
| `academic/rules/ord11.test.ts` | Ordinance 11 grade/promotion/division rules |
| `academic/engine/resolver.test.ts` | Capability resolution & warnings |
| `academic/parsers/examweb.test.ts` | ExamWeb normalization, provenance, CS/AP edge cases |
| `helpers/grade-system*.test.ts` | Grade math & context parity (dashboard ↔ engine) |
| `helpers/notices.test.ts` | Notices scraping & categorization |
| `validations/login.validation.test.ts` | Credential schema validation |
| `app/api/(auth)/login|result route tests` | Proxy route behaviour & error paths |

---

## Security & Privacy

- **Zero database.** Nothing is persisted server-side — no credentials, marks, or logs of academic records.
- **HttpOnly, path-scoped, expiry-bound cookies** hold the upstream session token; the browser never exposes it to scripts.
- **Client-side password hashing** (SHA-256 + captcha salt) mirrors the portal's own `crypt.js` behaviour — plaintext passwords never travel.
- **Middleware access control** on all protected routes with explicit session-expiry signalling.
- Audited regularly — see `Reports/SECURITY_AUDIT_REPORT_v1.0.md` and `Reports/SECURITY_TRANSPARENCY_AUDIT_v1.6.md`. Security policy: [`SECURITY.md`](SECURITY.md).

---

## Deployment

Deployed on **Vercel** (`vercel.json`):

- Region: `bom1` (Mumbai) for lowest latency to GGSIPU infrastructure.
- API route `maxDuration`: 30s to comfortably cover upstream portal latency.
- Framework: Next.js auto-detected; analytics via `@vercel/analytics`.

Any Next.js-compatible host works — the app has no server-side state or environment dependencies.

---

## Documentation

| Document | Contents |
| :--- | :--- |
| [`features_and_specifications.md`](features_and_specifications.md) | Complete product spec: flows, design tokens, analytics layout |
| [`folder_structure_guide.md`](folder_structure_guide.md) | Architecture rationale & folder-by-folder guide |
| [`flow.md`](flow.md) | Reverse-engineering notes for the GGSIPU exam portal |
| [`Reports/Anviksha_GGSIPU_2026-27_Detailed_Rule_System.md`](Reports/Anviksha_GGSIPU_2026-27_Detailed_Rule_System.md) | Full academic rule-system specification |
| [`Reports/`](Reports/) | UI/UX audits, security audits, rules-engine phase reports |
| [`CONTRIBUTING.md`](CONTRIBUTING.md) | Contribution guidelines |

---

## Author

Designed and built by **[Himanshu Singh](https://himanshusinghdangi.vercel.app)**.

> **Disclaimer:** Anviksha is an independent, student-built analytics layer and is not affiliated with or endorsed by GGSIPU. All academic decisions remain subject to official university records and ordinances.
