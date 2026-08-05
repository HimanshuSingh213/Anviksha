# Anviksha – GGSIPU Result & Analytics Portal Specifications

A comprehensive specification document detailing all core features, architectural decisions, grading rules, credit engines, and design tokens for **Anviksha**.

---

## 1. 🔒 Session Proxy & Authentication Flow

- **Legacy Portal Wrapper**: Next.js Server Route Handlers (`/api/auth/*`) proxy requests to GGSIPU's Java Servlets (`/web/CaptchaServlet`, `/web/Login`, `/web/Logout`).
- **CORS & Cookie Isolation**: Captures the upstream `JSESSIONID` cookie server-side and stores it in secure `HttpOnly` browser cookies (`path: "/api"`).
- **Client-Side SHA-256 Hashing**: Applies client-side hashing (`password + captcha_salt`) using the browser Web Crypto API before form submission.
- **Full-Fetch Strategy (`euno=100`)**: Immediately requests all semester results upon initial login to prevent subsequent session timeouts.

---

## 2. ⚡ 100% Stateless & Zero-DB Architecture

- **Zero Data Logging**: No user credentials, marks, or personal data are stored in a database.
- **In-Memory Client State**: Uses **Zustand** (`useResultStore.ts`) to retain `result` data and `customCredits` (`Record<string, number>`) across the app.
- **Instant Browser Evaluation**: All SGPA/CGPA calculations, grade point assignments, and analytics run on the fly in pure TypeScript.

---

## 3. ⚖️ GGSIPU Ordinance 11 Grading Rules

Anviksha evaluates subject results strictly according to GGSIPU Ordinance 11 (Credit-Based Semester System):

| Marks Range | Letter Grade | Grade Points ($G_i$) | Academic Status |
| :--- | :--- | :--- | :--- |
| **90 – 100** | **O** (Outstanding) | **10** | PASS |
| **75 – 89** | **A+** (Excellent) | **9** | PASS |
| **65 – 74** | **A** (Very Good) | **8** | PASS |
| **55 – 64** | **B+** (Good) | **7** | PASS |
| **50 – 54** | **B** (Above Average) | **6** | PASS |
| **45 – 49** | **C** (Average) | **5** | PASS |
| **40 – 44** | **P** (Pass) | **4** | PASS |
| **0 – 39** | **F** (Fail / Reappear) | **0** | **BACKLOG** |

### Key Passing Rule:
- **Total Marks ($\text{Internal} + \text{External}) \ge 40$**: Passes the subject (Grade `P` or higher).
- **No Separate Internal Cutoff**: Scoring 5/25 in internal and 35/75 in external yields a total of 40/100, which is a **PASS**.
- **Backlog Condition**: Total $< 40$ triggers an `F` grade (Backlog/Reappear).

$$\text{SGPA} = \frac{\sum (C_i \times G_i)}{\sum C_i}$$
$$\text{Percentage} = \text{CGPA} \times 9.5$$

---

## 4. 🧮 Pre-Loaded Credit Engine & Zustand Credit Tweaker

- **Auto-Detect Default Credits**:
  - Lab / Practical subjects (title contains `"LAB"` or `"PRACTICAL"`) = **2 Credits**.
  - Theory subjects = **4 Credits**.
- **Interactive Inline Credit Editor**:
  - Clicking any credit badge in the dashboard result table allows students to manually edit subject credits on the fly (e.g. 1-credit NUES, 2-credit labs, 4-credit theory).
  - Credit edits are stored in Zustand (`customCredits: Record<string, number>`) and immediately update all SGPA, CGPA, and analytics across `/dashboard` and `/analytics`.

---

## 5. 🔀 Hybrid Page Architecture & Analytics Navigation

### 5.1 📄 Dashboard Page (`/dashboard`)
Focused on fast, clean, high-level summary & raw marksheet viewing:
- **Student Profile Card**: Name, Enrollment, Program Name, Institute, Batch.
- **4 Top Summary Metric Cards**:
  1. **Overall CGPA**: Displays overall score + GGSIPU Division Badge (Gold Distinction / Green 1st Div).
  2. **Equivalent Percentage**: Calculated live as $\text{CGPA} \times 9.5$.
  3. **Total Credits Completed**: Earned vs required.
  4. **Active Backlog Count**: `0` in Emerald Green (or count in Crimson Rose).
- **CTA Navigation Banner**: Direct link button to `[ 📊 Deep Analytics & Performance Charts ➔ ]`.
- **Interactive Marksheet Table**: Filterable by semester with inline credit editing.

### 5.2 📊 Dedicated Analytics Page (`/analytics`)
Includes a **Semester Selector (`All (100)`, `Sem 1`, `Sem 2`...)** to toggle between overall and semester-specific deep insights:

#### View A: When `All Semesters (100)` is Selected
- 🏆 **Division & Distinction Status Banner**: Detailed milestone status towards First Division with Distinction.
- 📈 **SGPA Progression Trend Line Chart (Recharts)**: Line chart tracking semester-by-semester SGPA from Sem 1 to 8.
- 📊 **Overall Performance Summary Cards**:
  - Highest Scoring Subject Overall (e.g. `ICT151 - 86/100`)
  - Lowest Scoring Subject Overall (e.g. `ICT109 - 43/100`)
  - Total Credits Earned Across All Semesters
  - Total Active Backlogs
- 📜 **Download Button**: `[ 📥 Download Complete Official Transcript PDF ]`

#### View B: When a Specific Semester (e.g. `Sem 1`) is Selected
- 🔢 **Semester Quick Stats**:
  - Semester SGPA
  - Credits Earned in this Semester
  - Highest Subject Mark in Semester
  - Lowest Subject Mark in Semester
  - Backlogs in this Semester
- 📊 **Internal vs External Score Breakdown**: Stacked bar chart comparing internal assessment marks vs end-term external marks per subject for that semester.
- 🎯 **Grade Distribution Chart**: Distribution of letter grades (`O`, `A+`, `A`, `B+`, etc.) awarded in that semester.
- 📜 **Download Button**: `[ 📥 Download Semester Marksheet PDF ]`

---

## 6. 📜 1-Click Evaluated Marksheet PDF Export

- Client-side PDF generation using `html2canvas` / `jspdf`.
- Generates official-style GGSIPU marksheet PDFs for specific semesters or the full transcript, complete with student metadata, credit columns, grade points, SGPA/CGPA summary, and auto-generated QR verification.

---

## 7. 🏆 GGSIPU Division & Honors Classifier

- Automatically awards official GGSIPU Division badges:
  - 🟡 **1st Division with Distinction**: $\text{CGPA} \ge 7.50$ (Gold Glow)
  - 🟢 **1st Division**: $\text{CGPA} \quad 6.00 - 7.49$ (Emerald Green)
  - 🔵 **2nd Division**: $\text{CGPA} \quad 5.00 - 5.99$

---

## 8. 🎨 Design System & Color Palette

- **70% Deep Obsidian Dark Base**: Canvas `#070a11`, Glassmorphic Cards `#0e131f`, Borders `#1e293b`.
- **Multi-Accent Palette**:
  - 🟡 **Warm Gold** (`#f59e0b`): Distinction / $\text{CGPA} \ge 7.50$
  - 🟢 **Emerald Green** (`#10b981`): Passed / Grades O, A+, A
  - 🔵 **Electric Blue** (`#3b82f6`): Primary CTAs & Active Tabs
  - 🔴 **Crimson Rose** (`#f43f5e`): Backlogs ($\text{Total} < 40$)
  - 🟣 **Deep Violet** (`#8b5cf6`): Analytics Accent
  - 🩵 **Electric Cyan** (`#06b6d4`): Lab / Practical Badges
- **Typography**: `Plus_Jakarta_Sans` (Headings), `Inter` (Body), `JetBrains_Mono` (Tabular Numbers).
