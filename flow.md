# GGSIPU Examination Portal – Reverse Engineering Notes (Academic Module)

> **Version:** v0.9
> **Status:** Based on observed frontend behavior, network inspection, and JavaScript analysis.
>
> This document summarizes the portal's architecture, endpoints, data structures, and academic APIs that have been identified. It intentionally focuses on documenting the observed behavior and data model rather than providing instructions for reproducing the portal's authentication flow.

---

# 1. High Level Architecture

```text
Browser
    │
    ▼
Login Page (JSP)
    │
    ▼
Student Dashboard
    │
    ▼
JavaScript (stdata.js)
    │
    ▼
StudentSearchProcess
    │
    ▼
JSON
    │
    ▼
Dynamic Table Rendering
```

---

# 2. Technology Stack

Observed technologies:

- Java/JSP
- Servlet based backend
- JavaScript frontend
- Session cookies (JSESSIONID)
- JSON APIs
- HTML + CSS
- Dynamic rendering using fetch()

---

# 3. Known Endpoints

## Login

```
POST /web/Login
```

Purpose

- Authenticates user
- Redirects on success

Observed

- HTTP 302
- Redirects to

```
student/studenthome.jsp
```

---

## Logout

```
GET /web/Logout
```

Purpose

- Ends current session

Status

- Confirmed

---

## Student Dashboard

```
GET /web/student/studenthome.jsp
```

Purpose

Loads

- HTML
- CSS
- JS

---

## Academic Result API

```
GET /web/StudentSearchProcess
```

Observed query parameters

```
flag
euno
```

Returns

```
application/json
```

This is currently the primary academic data endpoint.

---

## CAPTCHA Resource

Observed endpoint

```
GET /web/CaptchaServlet
```

Purpose

- Serves CAPTCHA image

Observed JavaScript refreshes the image by appending a timestamp to avoid browser caching.

---

# 4. JavaScript Files

## crypt.js

Purpose

- Performs a client-side transformation of the password before form submission.
- Uses the browser's Web Crypto API.

Key APIs used

- crypto.subtle.digest()
- TextEncoder
- Base64 encoding

---

## loginvalidate.js

Purpose

- Clears form fields
- Validates required fields
- Refreshes CAPTCHA image

Functions observed

```
validateForm()

validateForm2()

validateFormForgetPw()

refreshCaptcha()
```

---

## stdata.js

Purpose

- Fetch academic JSON
- Parse JSON
- Render table
- Populate student profile

Observed fetch

```
StudentSearchProcess?flag=...&euno=...
```

Response type

```
application/json
```

---

# 5. StudentSearchProcess Response

Observed schema

```ts
interface StudentSearchResponse {
    report: string;
    stprofile: StudentProfile;
    header: string[];
    stresult: SubjectResultRow[];
}
```

---

# 6. Student Profile

Observed fields

```ts
interface StudentProfile {

    nrollno: string;

    stname: string;

    byoa: number;

    yoa: number;

    prgcode: string;

    prgname: string;

    icode: string;

    iname: string;
}
```

Example

```
Enrollment Number

Student Name

Program

Institute

Program Code

Institute Code

Year of Admission
```

---

# 7. Result Headers

Observed

```json
[
    "Sem/ Annual",
    "Paper Code",
    "Subject Name",
    "Internal",
    "External",
    "Total",
    "status",
    "Exam (Month,Year)",
    "Declared Date (YYYY-MM-DD)"
]
```

Headers are supplied dynamically by the backend.

---

# 8. Result Rows

Current backend format

```json
[
    2,
    "ICT102",
    "DATA STRUCTURES",
    "30",
    "48",
    "78",
    "08",
    "5,2026",
    "2026-07-16"
]
```

Recommended normalized model

```ts
interface SubjectResult {

    semester: number;

    paperCode: string;

    subject: string;

    internal: number | null;

    external: number | null;

    total: number;

    status: string;

    exam: string;

    declaredDate: string;
}
```

---

# 9. Known Query Values

Observed

```
euno = 1

Semester 1
```

```
euno = 2

Semester 2
```

```
euno = 100

ALL
```

Hidden field

```
searchMode = 2
```

Further meanings of other `flag` values remain unknown.

---

# 10. Observed Response Metadata

```
report
```

Currently observed value

```
IEM
```

Purpose currently unknown.

---

# 11. Status Codes

Observed

```
08
```

```
09
```

Meaning has not yet been confirmed.

---

# 12. Assets Loaded After Login

Observed

```
studenthome.jsp

↓

main.css

↓

header.css

↓

navbar.css

↓

studenthome.css

↓

modern_form.css

↓

navbar.js

↓

stdata.js
```

---

# 13. Academic Information Available

Currently obtainable from the JSON

- Student name
- Enrollment number
- Institute
- Program
- Semester
- Subject code
- Subject name
- Internal marks
- External marks
- Total marks
- Status code
- Exam session
- Declaration date

---

# 14. Analytics That Can Be Built

Using only the observed JSON:

- Semester dashboard
- Subject dashboard
- Internal vs External comparison
- Highest marks
- Lowest marks
- Average marks
- Subject ranking
- Lab vs Theory comparison
- Performance trends (when multiple semesters are available)
- SGPA/CGPA (using separately maintained official grading rules and credit mappings)

---

# 15. Suggested Internal Models

```ts
StudentProfile

SubjectResult

SemesterResult

AcademicHistory

SubjectAnalytics

SemesterAnalytics

AcademicSummary
```

---

# 16. Recommended Project Structure

```
src/

app/

components/

lib/

types/

services/

utils/

analytics/
```

Inside lib

```
parser/

normalizer/

constants/

grades/
```

---

# 17. Reverse Engineering Progress

| Component | Status |
|-----------|--------|
| Login endpoint identified | ✅ |
| Logout endpoint identified | ✅ |
| Student dashboard located | ✅ |
| Academic JSON endpoint identified | ✅ |
| JSON schema documented | ✅ |
| Student profile mapped | ✅ |
| Subject result mapped | ✅ |
| Dynamic headers understood | ✅ |
| JavaScript rendering understood | ✅ |
| Additional academic endpoints | Pending |

---

# 18. Remaining Research

Potential academic endpoints to look for:

- Grade Card
- Transcript
- SGPA
- CGPA
- Credits
- Grade Points
- Examination History
- Academic Summary
- Backlog Summary

---

# 19. Overall Findings

The portal's academic module already exposes structured JSON for result data rather than embedding everything in HTML. This makes it well-suited for building a modern analytics layer that normalizes the academic records into typed models and powers dashboards, charts, and academic insights without relying on HTML scraping.