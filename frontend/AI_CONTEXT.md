# TrainMe — Full Project Context (AI Reference File)

> **Purpose:** Single source of truth so I (Antigravity AI) can pick up this project in any future conversation without re-reading 12+ files.  
> **Last Updated:** May 1, 2026  
> **Workspace:** `c:\Users\Asim\Desktop\TrainMe\stitch_trainme_internship_platform\`

---

## 🏢 Business Model

**TrainMe** is a two-sided internship marketplace for the **Malaysian ecosystem**.

- **Students:** Malaysian university students (MMU, UM, APU, etc.) browse internship-only listings, apply with one click, track status transparently.
- **Companies:** Malaysian employers (verified via SSM number) post internships, manage applicant pipeline via built-in ATS.
- **Tagline:** *"Stop Searching. Start Training."*
- **Differentiator:** Every listing is an internship. No senior roles, no "3-5 years experience" noise, no ghosting.
- **Monetization (planned):** Freemium for companies — free tier (2 listings/month), premium (unlimited + analytics + featured placement).

---

## 📂 File Structure

All frontend files live in a single folder:

```
stitch_trainme_internship_platform/
└── frontend/
    ├── DESIGN.md                  ← Design system docs
    ├── HANDOFF.md                 ← Team handoff with task assignments
    ├── AI_CONTEXT.md              ← THIS FILE
    ├── homepage.html              ← Public landing (hero, value props, mission, CTAs)
    ├── login.html                 ← Login form (split-screen layout)
    ├── role_selection.html        ← "Student" vs "Company" card choice
    ├── student_registration.html  ← Student sign-up (name, university, email, password)
    ├── company_registration.html  ← Company sign-up (company name, SSM, industry, password)
    ├── discovery_feed.html        ← Browse internships (card grid + search + filters)
    ├── internship_detail.html     ← Full listing details + Apply Now sidebar + company info
    ├── my_applications.html       ← Student application tracker (status table)
    ├── student_profile.html       ← Student profile (avatar, CV, skills, links, completeness bar)
    ├── company_dashboard.html     ← Employer dashboard (metrics + listings table)
    ├── applicant_tracking.html    ← ATS per listing (applicant table + status dropdown)
    └── create_internship.html     ← Post new internship form
```

**Tech Stack:** Static HTML + Tailwind CSS (CDN) + Material Symbols Outlined (Google Fonts CDN)  
**No framework yet** — pure static prototype. Backend integration is a future phase.

---

## 🎨 Design System Summary

### Colors (Material Design 3 Tonal)
| Token | Value | Usage |
|-------|-------|-------|
| `primary` | `#006565` | Main brand, active states, links |
| `primary-container` | `#008080` | Teal accents, icon backgrounds |
| `on-primary` | `#ffffff` | Text on primary buttons |
| `background` | `#fcf9f8` | Page background (warm white) |
| `on-background` / `on-surface` | `#1c1b1b` | Body text |
| `on-surface-variant` | `#3e4949` | Secondary text, labels |
| `surface-container-lowest` | `#ffffff` | Cards, nav bar |
| `surface-container-low` | `#f6f3f2` | Footer, subtle backgrounds |
| `surface-variant` | `#e5e2e1` | Borders |
| `outline` | `#6e7979` | Input borders, muted icons |
| `outline-variant` | `#bdc9c8` | Subtle dividers |
| `error` | `#ba1a1a` | Error states, rejected badges |
| `secondary-container` | `#a3edec` | Teal chips (location, skills) |
| `on-secondary-container` | `#1d6d6d` | Text on teal chips |

### Typography
- **Font Family:** Inter (Google Fonts)
- **Scale:** h1 (48px/700), h2 (32px/600), h3 (24px/600), body-lg (18px/400), body-md (16px/400), label-md (14px/500), label-sm (12px/600)

### Spacing
- **Base unit:** 8px
- **Tokens:** xs=4, sm=12, md=24, lg=48, xl=80, gutter=24, container-max=1200

### Components
- **Nav height:** h-16 (64px), sticky, `bg-surface-container-lowest`, `border-b border-surface-variant shadow-sm`
- **Brand text:** `text-2xl font-black tracking-tight text-primary` → "TrainMe"
- **Active nav item:** `text-primary border-b-2 border-primary`
- **Inactive nav item:** `text-on-surface-variant hover:text-primary`
- **Footer:** `bg-surface-container-low`, `border-t border-surface-variant`, consistent across all pages
- **Cards:** `bg-surface-container-lowest rounded-xl border border-surface-variant p-6`
- **Primary button:** `bg-primary text-on-primary rounded-lg hover:bg-surface-tint`
- **Status chips:** Pending (outline), Under Review (teal bg), Interview (primary bg), Rejected (error bg)

---

## 🔗 Navigation Map

### Public Pages (no auth)
```
homepage.html → login.html (Login button)
homepage.html → role_selection.html (Join Now / Get Started)
homepage.html → student_registration.html (Join as Student)
homepage.html → company_registration.html (Join as Company)
login.html → role_selection.html (Sign up link)
role_selection.html → student_registration.html (Student card)
role_selection.html → company_registration.html (Company card)
role_selection.html → login.html (Login link)
student_registration.html → login.html (Log in here)
company_registration.html → login.html (Log in here)
```

### Authenticated Nav (all logged-in pages)
```
Internships → discovery_feed.html
Companies → # (PAGE MISSING)
Applications → my_applications.html
Messages → # (PAGE MISSING)
TrainMe logo → homepage.html
```

### Page-Specific Links
```
discovery_feed.html → internship_detail.html (View Details buttons)
internship_detail.html → discovery_feed.html (Back to Internships)
company_dashboard.html → create_internship.html (Post New Internship)
company_dashboard.html → applicant_tracking.html (View Applicants buttons)
my_applications.html → discovery_feed.html (Explore new roles link)
```

### Mobile Bottom Nav (discovery_feed + student_profile)
```
Discover → discovery_feed.html
Applied → my_applications.html
Profile → student_profile.html
```

---

## 📋 Page-by-Page Content Summary

### 1. homepage.html (314 lines)
- Fixed public nav: TrainMe logo, For Students, For Companies, Mission, Login, Join Now
- Hero section: h1 "Stop Searching. Start Training.", body text, Get Started + Learn More buttons
- 3-column value props: For Students, For Companies, The Ecosystem
- Mission section with flag icon
- User segmentation: Student card (CTA → student_registration) + Company card (CTA → company_registration)
- Standardized footer

### 2. login.html (190 lines)
- Split-screen: left = teal branding panel with student image, right = login form
- Fields: Email, Password
- "Forgot Password?" link (→ # dead, page missing)
- "Don't have an account? Sign up" (→ role_selection.html)
- Login button (type="button", no form action yet)

### 3. role_selection.html (160 lines)
- Centered layout with 2 cards: Student (school icon) and Company (business icon)
- Hover animations with decorative blur accents
- Student card → student_registration.html
- Company card → company_registration.html
- "Already have an account? Login" → login.html

### 4. student_registration.html (204 lines)
- Split-screen: left = teal branding, right = form
- Fields: Full Name, University (dropdown: MMU, UM, APU, UKM, UTM, UITM, Other), Email (.edu.my), Password, Confirm Password
- Email verification banner: "Use your university email address (@student.mmu.edu.my)"
- Terms checkbox + Create Account button
- "Already have an account? Log in here" → login.html

### 5. company_registration.html (227 lines)
- Split-screen: left = teal branding with "Employers" badge, right = form
- Fields: Company Name, SSM Number, Corporate Email, Industry Category (dropdown), Password, Confirm Password
- SSM verification banner: "Our team will verify your SSM number within 24 hours"
- Terms checkbox + Submit Registration button
- "Already have an employer account? Log in here" → login.html

### 6. discovery_feed.html (314 lines)
- Authenticated nav (Internships active)
- Search bar + Location filter + Industry filter
- 4 internship cards with: company logo, title, company name, location chip, duration chip, description, "View Details" button (→ internship_detail.html), bookmark button
- Companies: TechSolutions (KL), FinanceHub (PJ), DesignWorks (Cyberjaya), GreenEnergy (Shah Alam)
- Mobile bottom nav: Discover, Search, Bookmarks, Applied, Profile

### 7. internship_detail.html (252 lines)
- Authenticated nav (Internships active)
- "← Back to Internships" link (→ discovery_feed.html)
- 2-column layout (2/3 + 1/3):
  - Left: Header card (company logo, title "Software Engineering Intern", chips: KL, 6 Months, On-site, RM 1,200/mo), Description (What You'll Do, Requirements, Nice to Have), Skills tags (Python, JS, Node, REST, Git, Agile, SQL)
  - Right: Sticky Apply card (Apply Now button, Save for Later, Deadline Nov 30 2026, Start Jan 15 2027, 45 applicants), Company info card (TechSolutions, 200+ employees, website)
- Standardized footer

### 8. my_applications.html (285 lines)
- Authenticated nav (Applications active) — still has old gray/teal nav classes on some items
- Search bar in nav
- 3 stat chips: Total Applications (5), Under Review (2), Interviews Scheduled (1)
- Applications table with columns: Company/Position, Status, Date Applied, Actions
- 5 rows with statuses: Pending (2), Under Review, Interview Scheduled, Rejected
- Interview row has "Schedule" button, Rejected row has tooltip "Don't give up!"
- "Explore new roles" link → discovery_feed.html
- Standardized footer

### 9. student_profile.html (266 lines)
- Authenticated nav with avatar
- Profile header: Avatar, name "Ahmad Razif", university "Multimedia University (MMU)", email
- Profile completeness bar (70%)
- Sections: Personal Information (editable fields), Documents (CV upload, LinkedIn, GitHub, Portfolio), Skills & Interests (tags: Python, JavaScript, React, UI/UX, Figma, Data Analysis, Machine Learning)
- Mobile bottom nav: Discover, Search, Bookmarks, Applied, Profile (active)

### 10. company_dashboard.html (297 lines)
- Authenticated nav (Internships active)
- Header: "Dashboard Overview" + "Post New Internship" button (→ create_internship.html)
- 3 metric cards: Active Listings (4), Total Applicants (128), Pending Reviews (12, "Needs Attention" badge)
- Active Listings table: Job Title, Date Posted, Total Applicants, Actions (Edit, Toggle, View Applicants → applicant_tracking.html)
- 3 rows: Software Engineering Intern (45 applicants), Marketing Assistant (82), Data Analyst Intern (1, inactive)
- Standardized footer

### 11. applicant_tracking.html (309 lines)
- Authenticated nav (Applications active)
- Header: "Software Engineering Intern" with back arrow, "Kuala Lumpur | Full Time | 6 months"
- 4 metric chips: Total (45), Under Review (12), Interview (3), Accepted (2)
- Applicant table: Name, University, Date Applied, Status (dropdown), Resources, Actions
- Status dropdown options: Pending, Under Review, Accept, Reject
- Resource buttons: CV link, GitHub, LinkedIn
- 5 applicant rows with various statuses
- Standardized footer

### 12. create_internship.html (302 lines)
- Authenticated nav (no active state, brand = "TrainMe")
- Header: "Post a New Internship Offer"
- Form sections:
  - Basic Info: Job Title, Department (dropdown), Internship Duration (dropdown)
  - Logistics: Work Arrangement (dropdown: On-site/Remote/Hybrid), Location, Monthly Allowance (RM)
  - Details: Job Description (textarea)
- Action buttons: Cancel, Publish Internship
- Standardized footer

---

## 👥 Team & Task Assignments

| Person | Role | Focus |
|--------|------|-------|
| **Asim** | Project Lead | Built all 12 screens, design system, brand fixes, page linking |
| **Osamah** 🟢 | Frontend | Student experience: Saved Internships, App Confirmation, Forgot Password, feed improvements (stipend, pagination, sorting, empty states, filter tabs, withdraw) |
| **Mohammed** 🔵 | Frontend | Company experience: Companies Directory, Company Profile Edit, create form improvements (deadline, draft, preview), ATS improvements (confirmation, notes, filter/sort) |
| **Omer** 🟡 | Frontend | Polish & general: Messages, Notifications, Settings, homepage sections (How It Works, social proof), auth UX (Google OAuth, password strength), student profile improvements, About/Privacy/Terms |
| **Hussain** 🟠 | Backend | Full stack: Framework setup, Supabase Auth + DB, all CRUD APIs, file upload, search, notifications |

---

## 🔴 Known Issues / Dead Links

1. **"Companies" nav link** → `#` (page doesn't exist — assigned to Mohammed)
2. **"Messages" nav link** → `#` (page doesn't exist — assigned to Omer)
3. **Forgot Password link** on login.html → `#` (assigned to Osamah)
4. **Bell icon (notifications)** → no page (assigned to Omer)
5. **Footer links** (About Us, Privacy, Terms, Help Center) → `#` (assigned to Omer)
6. **Bookmark buttons** exist but no saved page (assigned to Osamah)
7. **"Apply Now" button** on internship_detail.html → no confirmation flow (assigned to Osamah)
8. **my_applications.html nav** still uses old `text-gray-600 text-teal-600` classes instead of design tokens (cosmetic, low priority)
9. **"Schedule" button** on interview row in my_applications → no scheduling UI
10. **Company dashboard dates** say 2023 (Oct 12, Nov 01, Sep 15) — should be 2026

---

## 🗄️ Planned Database Schema (for Hussain)

```sql
users (id, role, name, email, password_hash, avatar_url, created_at)
students (user_id FK, university, year_of_study, cgpa, major, bio, cv_url, linkedin, github, portfolio, skills[])
companies (user_id FK, company_name, ssm_number, industry, website, description, logo_url, verified, employee_count)
internships (id, company_id FK, title, department, description, location, duration, work_type, stipend, skills[], deadline, status, created_at)
applications (id, student_id FK, internship_id FK, status, cover_letter, applied_at, updated_at)
bookmarks (student_id FK, internship_id FK, created_at)
messages (id, sender_id FK, receiver_id FK, content, read, created_at)
notifications (id, user_id FK, type, title, message, read, created_at)
```

---

## 📝 Change History

| Date | What Changed |
|------|-------------|
| May 1, 2026 | Initial prototype reviewed (11 screens) |
| May 1, 2026 | Brand fix: "InternMY" → "TrainMe" across 4 files |
| May 1, 2026 | Copyright fix: "© 2024" → "© 2026" across 5 files |
| May 1, 2026 | Nav/Footer standardized to design system tokens |
| May 1, 2026 | New page: `internship_detail.html` created |
| May 1, 2026 | All files consolidated into `frontend/` folder, old folders deleted |
| May 1, 2026 | All existing pages linked together (buttons → actual hrefs) |
| May 1, 2026 | HANDOFF.md created with team assignments |
| May 1, 2026 | AI_CONTEXT.md created (this file) |
