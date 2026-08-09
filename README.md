# Anviksha Academic Analytics Engine

High-fidelity academic data visualization and grading engine for GGSIPU students.

Anviksha is a sophisticated academic intelligence platform engineered to transform raw student academic data into actionable, high-fidelity analytical insights. By implementing a zero-database paradigm, the engine ensures absolute data privacy, processing sensitive academic payloads entirely within the client-side memory space.

The engine serves as a high-performance analytical layer sitting atop existing university infrastructures. It intercepts complex JSON payloads, applies strict Ordinance 11 grading logic, and renders interactive, SVG-based statistical visualizations. Through a secure edge-proxy architecture, Anviksha provides a seamless, modern interface for students to evaluate their academic progression, manage credit overrides, and generate official-style digital transcripts.

## Technology Stack

| Category | Technology | Version/Specification |
| :--- | :--- | :--- |
| **Core Framework** | Next.js | 16.2.12 (App Router) |
| **Runtime Environment** | React | 19.2.4 |
| **Language** | TypeScript | 5 (Strict Mode) |
| **Styling Engine** | Tailwind CSS | v4 via `@tailwindcss/postcss` |
| **State Management** | Zustand | 5.0.14 (In-memory persistence) |
| **HTTP Client** | Axios | 1.19.0 |
| **Form Management** | React Hook Form | 7.84.0 |
| **Schema Validation** | Zod | 4.4.3 |
| **Data Visualization** | Recharts | 3.10.1 (SVG-based) |
| **Document Generation** | html2canvas-pro / jspdf | 2.3.3 / 4.2.1 |
| **Testing Suite** | Vitest | 4.1.10 |

## Key Features

### GGSIPU Ordinance 11 Calculation Engine
The core computational logic implements strict academic grading rules as defined by university ordinances. It performs automated marks-to-grade mapping, identifies passing/failing thresholds, and utilizes string-matching heuristics to distinguish between theory and practical subjects for accurate credit assignment. The engine calculates SGPA and CGPA using precise mathematical models to ensure academic integrity.

### Stateless Client-Side State Management
Anviksha utilizes a zero-database paradigm to maximize user privacy and reduce server overhead. All fetched academic datasets and user-defined credit modifications are managed via Zustand 5.0.14 within the client's memory. This architecture ensures that sensitive student records are never persisted on a centralized server, providing a secure, ephemeral session environment.

### Advanced Analytics & Visualization Suite
The platform transforms tabular academic data into interactive visual intelligence. Using Recharts, the engine renders semester-wise SGPA progression trends via AreaCharts and subject-specific performance distributions through BarCharts. These visualizations allow students to identify performance trends and credit-weightage impacts in real-time.

### Automated PDF Export Pipeline
The engine features a sophisticated client-side document rendering pipeline for generating official-style transcripts. By mounting off-screen DOM structures and applying vector SVG watermarks through `AnvikshaWatermark.tsx`, the system captures high-resolution snapshots via `html2canvas-pro`. These are then compiled into downloadable, professional PDFs using `jspdf`.

### Secure Edge Proxy Architecture
To maintain security and bypass CORS limitations, Anviksha employs a robust proxy pattern. All requests to sensitive upstream Java servlet endpoints are marshaled through Next.js API route handlers. This architecture allows for the secure capture and management of `HttpOnly` `JSESSIONID` cookies, ensuring session isolation and protecting the client from direct exposure to upstream vulnerabilities.

## Directory & Code Architecture Layout

```text
src/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx             # Zod-validated login interface
│   │   └── ...
│   ├── (app)/
│   │   ├── dashboard/
│   │   │   ├── analytics/
│   │   │   │   └── page.tsx         # Recharts-driven analytical views
│   │   │   └── page.tsx             # Protected student metadata dashboard
│   │   └── design-tokens/
│   │       └── page.tsx             # Internal design system reference
│   ├── api/
│   │   ├── (auth)/
│   │   │   ├── captcha/
│   │   │   │   └── route.ts         # GGSIPU CAPTCHA proxy & cookie management
│   │   │   ├── login/
│   │   │   │   └── route.ts         # SHA-256 credential hashing & proxy
│   │   │   └── result/
│   │   │       └── route.ts         # StudentSearchProcess JSON interceptor
│   ├── layout.tsx                   # Global ErrorBoundary & Vercel Analytics
│   └── page.tsx                     # High-conversion landing page
├── components/
│   ├── analytics/                   # Recharts implementation components
│   └── export/                      # PDF generation & Watermark components
├── helpers/
│   └── grade-system.ts              # Ordinance 11 mathematical logic
└── store/
    └── result-store.ts              # Zustand in-memory state management
```

| File/Folder | Responsibility |
| :--- | :--- |
| `src/app/api/` | Server-side proxying, credential hashing, and session cookie management. |
| `src/helpers/grade-system.ts` | Implementation of grading mappings, credit detection, and GPA math. |
| `src/store/result-store.ts` | Managing ephemeral student data and custom credit overrides. |
| `src/components/export/` | Orchestrating `html2canvas-pro` and `jspdf` for transcript generation. |
| `src/app/(app)/dashboard/` | Rendering protected student profiles and real-time evaluation cards. |

## Mathematical & Logic Specifications

### Grading Mapping Logic
The engine applies the following discrete mapping for grade point assignment:

| Marks Range | Grade | Grade Points |
| :--- | :--- | :--- |
| 90 - 100 | O | 10 |
| 75 - 89 | A+ | 9 |
| 65 - 74 | A | 8 |
| 55 - 64 | B+ | 7 |
| 50 - 54 | B | 6 |
| 45 - 49 | C | 5 |
| 40 - 44 | P | 4 |
| < 40 | F | 0 |

### Academic Formulas
The calculation engine utilizes the following mathematical models for all analytical outputs:

**Semester Grade Point Average (SGPA):**
$$\text{SGPA} = \frac{\sum (C_i \times G_i)}{\sum C_i}$$

**Percentage Conversion:**
$$\text{Percentage} = \text{CGPA} \times 10$$

*Where $C_i$ represents subject credits and $G_i$ represents grade points.*

## Usage & Implementation Patterns

### Credit Assignment Heuristics
The system automatically detects subject types to assign appropriate credit weights:
- **Practical/Lab Subjects**: Identified via `"LAB"` or `"PRACTICAL"` string matching $\rightarrow$ 1 Credit.
- **Theory Subjects**: Default assignment $\rightarrow$ 3 Credits.

### Data Flow Pattern
1. **Authentication**: User submits credentials $\rightarrow$ `api/login` hashes via SHA-256 $\rightarrow$ Proxies to upstream $\rightarrow$ Secures `JSESSIONID`.
2. **Data Acquisition**: `api/result` intercepts `StudentSearchProcess` JSON $\rightarrow$ Hydrates Zustand store.
3. **Analysis**: Zustand store $\rightarrow$ `grade-system.ts` $\rightarrow$ Recharts components.
4. **Export**: `ResultGradeSheet.tsx` $\rightarrow$ `html2canvas-pro` $\rightarrow$ `jspdf` $\rightarrow$ Client Download.

## Security & Proxy Architecture

### Proxy Pattern & Session Isolation
To prevent direct client-to-upstream communication, Anviksha implements a strict proxy pattern. All sensitive requests are marshaled through Next.js route handlers. Upstream `JSESSIONID` cookies are captured and re-issued with the following security flags:
- `HttpOnly`: Prevents XSS-based cookie theft.
- `Secure`: Ensures transmission over encrypted channels.
- `SameSite=Strict`: Mitigates Cross-Site Request Forgery (CSRF).
- `Sec-Fetch-Site`: Validates `same-origin` requests to block unauthorized direct URL access and embedding.

### Content Security Policy (CSP)
The `next.config.ts` enforces a rigorous CSP to mitigate injection vectors:
- Disables `frame-ancestors` to prevent clickjacking.
- Restricts script and style execution contexts to authorized domains.
- Limits execution to strictly defined origins to prevent XSS.

## Unique Engineering Paradigms

### Zero-Database Paradigm
Unlike traditional academic portals, Anviksha maintains no persistent database of student records. By utilizing Zustand for in-memory client session persistence, the application achieves a high degree of privacy compliance. Data exists only for the duration of the active session, significantly reducing the attack surface for data breaches.

### High-Fidelity Document Reconstruction
The export pipeline does not simply "print" the webpage. It utilizes a dedicated, off-screen DOM structure (`ResultGradeSheet.tsx`) that is specifically designed for high-resolution capture. This allows for the integration of complex vector elements, such as the `AnvikshaWatermark.tsx`, ensuring that generated PDFs maintain professional aesthetic standards and structural integrity.

*Generated by [DevToolkit-AI](https://dev-toolkit-ai.vercel.app/)*