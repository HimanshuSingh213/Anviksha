# Anviksha | GGSIPU Result Wrapper & Academic Analytics

[![Live App](https://img.shields.io/badge/Live_App-anviksha--result.vercel.app-000000?style=flat&logo=vercel&logoColor=white)](https://anviksha-result.vercel.app)
[![Version](https://img.shields.io/badge/Version-v1.6.0-8A6D1F?style=flat)]()
[![Next.js](https://img.shields.io/badge/Next.js-16.2-000000?style=flat&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2-23272F?style=flat&logo=react&logoColor=61DAFB)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-0B1120?style=flat&logo=tailwindcss&logoColor=38BDF8)](https://tailwindcss.com/)
[![Vitest](https://img.shields.io/badge/Vitest-74_Tests_Passing-1E293B?style=flat&logo=vitest&logoColor=FCC72B)](https://vitest.dev/)
[![Security](https://img.shields.io/badge/Security-Zero--Storage_Proxy-064E3B?style=flat&logo=auth0&logoColor=34D399)]()

## Overview

**Anviksha** (अन्वीक्षा — *"analytical enquiry"*) is a student-built academic results and analytics platform for **Guru Gobind Singh Indraprastha University (GGSIPU)**. It interfaces with the university examination portal (`examweb.ggsipu.ac.in`) as a **stateless, privacy-first proxy layer** — no database, no stored credentials, no retained records.

Rather than showing only a raw table of marks, Anviksha interprets result data through an **ordinance-based academic engine** (`src/lib/academic/`) built on official GGSIPU ordinances — Ordinance 11 for semester degrees, plus separate verified frameworks for MBBS (Ord. 15), MD/MS (Ord. 16), BHMS (Ord. 22), BASLP (Ord. 24), BPT/BOT (Ord. 31), and BAMS (Ord. 38):

- Real-time SGPA and CGPA computation with interactive credit adjustments.
- Annual promotion standing based on the verified 50%-credits baseline (Ordinance 11, Clause 11.3(v)).
- Placement eligibility benchmarks against common campus recruitment cutoffs (60%, 65%, 70%, 75%).
- Odd/Even reappearance session planning for backlog papers.
- Client-side consolidated academic transcripts and marksheets (clearly marked unofficial).
- Live official GGSIPU examination circulars, date-sheets, and notices refreshed every 15 minutes.
- **Honest result viewing for every programme** — analytics appear only where rules are verified; everything else is shown as raw marks with an explanation instead of a guessed number.

> **Disclaimer:** Anviksha is an independent, unofficial student application and is not affiliated with or endorsed by GGSIPU. Official university marksheets always supersede any calculation shown here.

---

## Table of Contents

- [Core Design Principles](#core-design-principles)
- [Key Features](#key-features)
- [The Ordinance-Based Engine](#the-ordinance-based-engine)
- [Programme Coverage](#programme-coverage)
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
2. **Honesty Over Guesswork** — Every calculated metric carries a verification state: `VERIFIED` (statutory rule confirmed), `RESULT_DERIVED` (computed directly from official marks), `WARNING` (depends on estimated/user credits), `NOT_APPLICABLE` (the programme's ordinance doesn't define it), `UNAVAILABLE` (withheld rather than guessed), or `AMBIGUOUS` (programme framework unclear).
3. **Fail-Closed Rendering** — If a programme's rules aren't verified, analytics aren't shown — Ordinance-11-shaped math is never silently applied to a medical or allied-health programme where it doesn't belong.
4. **Tested Evolution** — The engine (`src/lib/academic/`) is type-checked and unit-tested (88 automated tests) and grows as ordinance verification progresses.

---

## Key Features

### 1. Privacy-First Session Proxy
- **Direct Server Proxy:** Credentials and results are relayed through Next.js Route Handlers straight to the official university endpoints (`/web/Login`, `/web/Logout`, `/web/StudentSearchProcess`, `/web/CaptchaServlet`).
- **SHA-256 Password Hashing:** The password is hashed with the captcha salt (`sha256(password + captcha)`) before leaving — mirroring the portal's own behaviour, so no plaintext password travels.
- **Ephemeral Sessions:** The upstream `JSESSIONID` is captured server-side and stored in `HttpOnly` cookies scoped to `/api`, expiring after one hour or on logout.
- **Middleware Guard (`src/proxy.ts`):** Protects `/dashboard` and `/api/result`, redirecting expired sessions to `/login?expired=true` and preventing logged-in users from re-entering the login page.
- **Full-Fetch Strategy (`euno=100`):** All semester results are fetched in a single upstream call at login.

### 2. Ordinance-Based Academic Engine (`src/lib/academic/`)
- **Exact Ordinance 11 Arithmetic:** SGPA = Σ(Cᵢ × Gᵢ) / ΣCᵢ and CGPA across all semesters — both rounded to two decimals, exactly as Clause 13 specifies; equivalent percentage = CGPA × 10.
- **Live Credit Overrides:** Official marksheets don't print credits. Anviksha estimates them (theory 3, lab/practical 1, project/viva 2), clearly labels every estimate-dependent number with a `WARNING` badge, and lets you enter exact credits from your scheme — recalculating instantly.
- **GPA Exclusion Rules:** Failed courses (F = 0) still count in the credit denominator; non-numeric legends (CS — Credit Secured, AP — Already Passed) carry no grade point and are excluded rather than zeroed.
- **Promotion Monitor (Clause 11.3(v)):** Tracks earned vs. required credits per academic year against the verified 50% baseline. Extra conditions that belong to statutory bodies or programme schemes are noted as "may apply" — never invented.
- **Placement Benchmarks:** Compares CGPA against 60/65/70/75% cutoff tiers commonly used in campus recruitment — explicitly presented as application benchmarks, not university rules.
- **Odd/Even Backlog Planner:** Segregates reappear papers into upcoming examination windows (Nov/Dec vs May/June) based on their semester.
- **Division Classification (Clause 13):** Exemplary Performance (CGPA 10.00 with every course passed on the first chance — condition disclosed) / First / Second / Third Division.

### 3. Honest Result Viewing
- One viewer renders **every** programme's result: verified programmes get full analytics; others show published marks with reason chips instead of invented GPAs.
- Normalizes raw statuses (ABS/CAN/DET/RL/CS/AP) into precise result states — an unknown code is never auto-converted into a pass or fail.

### 4. Live Examination Notices Feed (`/notices`)
- **15-Minute ISR Sync:** Server-side fetch of `ipu.ac.in/exam_notices.php` (Cheerio) with 900-second Incremental Static Regeneration.
- **Auto-Categorization:** Flags circulars into Results Declared, Date-Sheets, Inspection Schedules, and General Notices.
- **Instant Search:** Client-side keyword filtering across titles and dates with direct PDF links.

### 5. Client-Side Document Export
- **Consolidated Academic Transcript:** Print-ready single-page record with full semester history and credit summaries — clearly marked *"UNOFFICIAL — for verification & recruitment reference"*.
- **Semester Marksheets:** Detailed individual marksheets for print/PDF.
- **Zero-Server Rendering:** Generated entirely in the browser with `html2canvas-pro` + `jspdf` — exports never touch a server.

### 6. Landing & SEO Layer
- Animated landing page (Framer Motion) with ordinance-mapping table, grade-scale card, FAQ, and a dashboard hero mockup.
- `sitemap.ts`, `robots.ts`, `manifest.ts`, JSON-LD structured data (WebApplication + FAQPage), OpenGraph/Twitter cards, and a transparent methodology guide at `/calculations`.

---

## The Ordinance-Based Engine

The heart of Anviksha is `src/lib/academic/` — a typed, data-driven layer that answers one question per programme: *"What are we allowed to claim about this result?"*

```text
Raw ExamWeb JSON
      │
      ▼
academic-engine.ts  →  analyzeResult(raw, userCredits, options)
      │                  • matches programme family + ordinance from academic-db.ts
      │                  • normalizes marks, statuses, and credits
      │                  • computes only what the ordinance's capabilities allow
      ▼
EngineResult        →  every metric is a Metric<T>:
      │                  { value, status, reason, sources }
      │                  status ∈ VERIFIED | RESULT_DERIVED | WARNING
      │                         | UNAVAILABLE | AMBIGUOUS | NOT_APPLICABLE
      ▼
Dashboard & Analytics  →  render strictly within capabilities;
                           surface every status and citation
```

- **Ordinance Database (`academic-db.ts`):** One registry entry per ordinance — ORD_10, ORD_11, ORD_15, ORD_16, ORD_22, ORD_24, ORD_25, ORD_31, ORD_38 — each with its examination system, capability flags, rule bands, and clause-level sources. Programme families (B.Tech, BCA, MBA, Law, MBBS, BPT…) map to their ordinance via keyword matching, with unrecognized names left `AMBIGUOUS` rather than defaulted.
- **Clause Citations:** Rules cite the specific clause they implement (e.g. Ordinance 11 Clause 11.5 for the grade table, Clause 13 for SGPA/CGPA/percentage/division, Clause 11.3(v) for the 50% promotion baseline) — verified against the ordinance extracts in `Reports/ordinance-extracts/`.
- **Warnings as UI:** Estimates, ambiguities, and unverified rules are structured objects rendered as badges and explanation panels — transparency is a first-class output, not a log line.

---

## Programme Coverage

The engine recognizes GGSIPU programme families from the official programme name/code returned by ExamWeb:

| Stream | Programmes | Ordinance |
| :--- | :--- | :--- |
| **Semester degrees** | B.Tech, M.Tech, BCA, MCA, BBA, MBA, B.Com, BA, BA/BBA LLB | **Ordinance 11** — full analytics |
| **Medicine** | MBBS | **Ordinance 15** — marks, pass/fail (50% theory + practical); no divisions by rule |
| **Medicine (PG)** | MD / MS | **Ordinance 16** — pass/fail |
| **Homoeopathy** | BHMS | **Ordinance 22** — percentage, subject distinction |
| **Speech & Hearing** | BASLP | **Ordinance 24** — percentage divisions |
| **Weekend programmes** | Weekend semester degrees | **Ordinance 25** |
| **Physiotherapy** | BPT / BOT | **Ordinance 31** — CPI divisions, all-subjects promotion |
| **Ayurveda** | BAMS | **Ordinance 38** |

Results render for **any** programme declared on ExamWeb — every affiliated institute (USICT, MAIT, MSIT, BVCOE, BPIT, GTBIT, VIPS, ADGITM, JIMS, DTC, GNDIT, and the rest across Delhi NCR). Unrecognized programme names get honest raw-marks rendering with `AMBIGUOUS` statutory metrics, never a default formula.

---

## Technology Stack

| Category | Technology | Purpose |
| :--- | :--- | :--- |
| **Framework** | Next.js 16.2 (App Router, Turbopack) | Server Components, ISR caching, Route Handlers, middleware |
| **Library** | React 19.2 (+ React Compiler) | Client UI, concurrent rendering |
| **Language** | TypeScript 5.9 | End-to-end type safety |
| **Styling** | Tailwind CSS v4 (`@tailwindcss/postcss`) | Obsidian-dark design tokens, responsive layout |
| **Motion** | Framer Motion v12 | Fluid transitions, hero micro-interactions |
| **State** | Zustand v5 | In-memory result caching & credit overrides |
| **Parsing** | Cheerio v1 | Notices scraping & normalization |
| **Charts** | Recharts v3 | SGPA trends, grade distributions, internal/external splits |
| **Forms** | react-hook-form + Zod | Validated login & report forms |
| **PDF Export** | html2canvas-pro + jspdf | Client-side transcript/marksheet generation |
| **Testing** | Vitest v4 + Testing Library + jsdom | Unit, engine & route tests |
| **Analytics** | Vercel Analytics | Performance vitals & telemetry |

---

## Getting Started

### Prerequisites
- Node.js 20+ and npm

### Setup

```bash
# Clone the repository
git clone <your-repo-url>
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
├── public/                         # Static assets (icons, logos)
├── src/
│   ├── proxy.ts                    # Middleware: auth guards for /dashboard, /api/result, /login
│   │
│   ├── lib/academic/               # ▸ Ordinance-based academic engine (pure TypeScript)
│   │   ├── academic-db.ts          #   Ordinance registry: capabilities, rule bands, clause sources
│   │   ├── academic-engine.ts      #   analyzeResult(): normalization + verified computation
│   │   └── academic-engine.test.ts #   Engine unit tests
│   │
│   ├── app/                        # Next.js App Router
│   │   ├── layout.tsx              #   Root layout: fonts, SEO metadata, JSON-LD
│   │   ├── page.tsx                #   Landing page
│   │   ├── manifest.ts / robots.ts / sitemap.ts
│   │   ├── (auth)/login/           #   Login page with captcha proxy
│   │   ├── (app)/
│   │   │   ├── dashboard/          #   Result overview + /dashboard/analytics deep dossier
│   │   │   ├── notices/            #   Live exam circulars (15-min ISR)
│   │   │   ├── calculations/       #   Transparent ordinance methodology guide
│   │   │   └── report/             #   User feedback & diagnostics
│   │   └── api/(auth)/
│   │       ├── captcha/route.ts    #   Captcha image relay + JSESSIONID capture
│   │       ├── login/route.ts      #   Credential proxy → upstream /web/Login
│   │       ├── logout/route.ts     #   Session destruction + upstream /web/Logout
│   │       └── result/route.ts     #   Full result fetch (euno=100) + normalization
│   │
│   ├── components/
│   │   ├── home/                   #   LandingPageView, HeroDashboardPreview, landing data
│   │   ├── login/                  #   LoginForm
│   │   ├── dashboard/              #   CreditTipModal, skeletons, avatar, logout
│   │   ├── analytics/              #   Promotion, Placement, Division, Trends, Reappear,
│   │   │                           #   ExplanationPanel, QuickStats cards
│   │   ├── export/                 #   ConsolidatedMasterTranscript, ResultGradeSheet
│   │   ├── notices/                #   NoticesClientView (search + categories)
│   │   └── common/                 #   AppNavbar, ErrorBoundary, FloatingReport, StructuredData
│   │
│   ├── helpers/
│   │   └── notices.ts              #   IPU notices fetcher & category classifier
│   │
│   ├── store/result-store.ts       #   Zustand: active result + custom credit overrides
│   ├── types/                      #   StudentProfile, Result, Notice, ApiResponse types
│   └── validations/                #   Zod schemas (login credentials)
│
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
 sha256(password + captcha salt)          │  (captures JSESSIONID           │
        │                                 │   into HttpOnly cookie)         ▼
        │                                 │                          session established
        ▼                                 ▼
 Dashboard request ──────────────►  GET /api/(auth)/result ─────────►  StudentSearchProcess
        │                                 │  (euno=100 full fetch)         ?euno=100
        │                                 ▼
        │                          academic-engine.ts
        │                          (analyzeResult + academic-db)
        ▼                                 ▼
 Zustand store (in-memory) ◄────── EngineResult with per-metric verification
        │
        ├──► Dashboard, Analytics (verification-badged rendering)
        └──► PDF Transcript export (client-side only)

 Logout ─────────────────────────►  POST /api/(auth)/logout ────────►  GET /web/Logout
                                        (cookies destroyed)
```

**Session lifecycle:** middleware (`src/proxy.ts`) checks the `auth_session` cookie on every protected request; expired sessions receive a `401 SESSION_EXPIRED` (API) or a redirect to `/login?expired=true` (pages).

---

## Grading Reference (Ordinance 11)

| Marks Range | Letter Grade | Grade Points |
| :--- | :--- | :--- |
| 90 – 100 | **O** (Outstanding) | 10 |
| 75 – 89 | **A+** (Excellent) | 9 |
| 65 – 74 | **A** (Very Good) | 8 |
| 55 – 64 | **B+** (Good) | 7 |
| 50 – 54 | **B** (Above Average) | 6 |
| 45 – 49 | **C** (Average) | 5 |
| 40 – 44 | **P** (Pass) | 4 |
| < 40 or absent | **F** (Fail) | 0 |

- **Passing rule:** Total (continuous evaluation + term end) ≥ 40%, uniform per programme — Clause 11.1; Grade P is the baseline passing grade — Clause 11.5.
- **SGPA** = Σ(Cᵢ × Gᵢ) / ΣCᵢ &nbsp;·&nbsp; **CGPA** = cumulative across all semesters &nbsp;·&nbsp; **Equivalent %** = CGPA × 10 — all Clause 13.
- **Division (Clause 13):** Exemplary (CGPA 10.00, every course first-chance, no academic break) · First ≥ 6.50 · Second 5.00–6.49 · Third 4.00–4.99.
- **Promotion (Clause 11.3(v)):** ≥ 50% of the existing year's total credits; failure triggers an academic break (max two per programme).
- Special statuses (`ABS`, `CAN`, `DET`, `RL`, `CS`, `AP`) map to precise result states, never guessed as pass/fail.

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

The project maintains an **74-test** automated suite (5 files) covering the academic engine, notices scraper, validators, and API routes:

```bash
npm test              # 74 tests, currently 100% green
npx tsc --noEmit      # clean
npm run lint          # 0 errors
npm run build         # production bundle
```

| Suite | Focus |
| :--- | :--- |
| `lib/academic/academic-engine.test.ts` | Ordinance rules, grades, SGPA/CGPA, CS/AP exclusion, promotion |
| `helpers/notices.test.ts` | Notices fetching & categorization |
| `validations/login.validation.test.ts` | Credential schema validation |
| `app/api/(auth)/login\|result route tests` | Proxy route behaviour & error paths |

---

## Security & Privacy

- **Zero database.** Nothing is persisted server-side — no credentials, marks, or logs of academic records.
- **HttpOnly, path-scoped (`/api`), expiry-bound cookies** hold the upstream session token; the browser never exposes it to scripts.
- **Password hashing** (`sha256(password + captcha salt)`) mirrors the portal's own behaviour — plaintext passwords never travel.
- **Middleware access control** on all protected routes with explicit session-expiry signalling.
- Security policy: [`SECURITY.md`](SECURITY.md).

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
| [`/calculations`](https://anviksha-result.vercel.app/calculations) | In-app methodology guide: every formula, badge, and its ordinance clause |
| [`CONTRIBUTING.md`](CONTRIBUTING.md) | Contribution guidelines |

---

## Author

Designed and built by **[Himanshu Singh](https://himanshusinghdangi.vercel.app)**.

> **Disclaimer:** Anviksha is an independent, student-built analytics layer and is not affiliated with or endorsed by GGSIPU. All academic decisions remain subject to official university records and ordinances.
