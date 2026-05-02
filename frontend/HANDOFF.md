# 🎓 TrainMe — Project Handoff Document

> **Last Updated:** May 1, 2026  
> **Prepared by:** Asim  
> **Status:** UI Prototype — Ready for Development

---

## 📌 What Is TrainMe?

TrainMe is a **two-sided internship marketplace** built for the **Malaysian ecosystem**.

| Side | Who | What They Do |
|------|-----|-------------|
| **Students** | Malaysian university students | Browse internships, apply with one click, track application status |
| **Companies** | Malaysian employers (SSM-verified) | Post internships, manage applicant pipeline via built-in ATS |

**Core Promise:** *"Stop Searching. Start Training."*  
Unlike LinkedIn/Indeed — **every single listing is an internship**. No senior roles, no noise, no ghosting.

---

## 📂 Project Structure

All frontend files are in one folder:

```
stitch_trainme_internship_platform/
└── frontend/
    ├── DESIGN.md                  ← Design system documentation
    ├── HANDOFF.md                 ← This file
    ├── homepage.html              ← Public landing page
    ├── login.html                 ← Login form
    ├── role_selection.html        ← "I am a Student" / "I am a Company"
    ├── student_registration.html  ← Student sign-up form
    ├── company_registration.html  ← Company sign-up form (SSM verification)
    ├── discovery_feed.html        ← Browse internships (student view)
    ├── internship_detail.html     ← Full internship details + Apply Now
    ├── my_applications.html       ← Student application tracker
    ├── student_profile.html       ← Student profile management
    ├── company_dashboard.html     ← Employer dashboard with metrics
    ├── applicant_tracking.html    ← ATS - manage applicants per listing
    └── create_internship.html     ← Post new internship form
```

**Tech Stack:** HTML + Tailwind CSS (CDN) + Material Symbols (Google Fonts)  
**Typography:** Inter (Google Fonts)  
**Brand Color:** Teal — Primary `#006565`, Container `#008080`

---

## ✅ What's Been Done

### 1. Complete UI Screens (12 pages)

| # | Page | File | Description |
|---|------|------|-------------|
| 1 | Landing Page | `homepage.html` | Hero, value props, mission, CTA segmentation |
| 2 | Login | `login.html` | Split-screen, email + password |
| 3 | Role Selection | `role_selection.html` | Student vs Company card choice |
| 4 | Student Registration | `student_registration.html` | Name, university, email, password + verification banner |
| 5 | Company Registration | `company_registration.html` | Company name, SSM, industry, password + SSM verification banner |
| 6 | Internship Discovery | `discovery_feed.html` | Card grid, search bar, location/industry filters |
| 7 | Internship Detail | `internship_detail.html` | Full description, requirements, skills, Apply Now sidebar, company info |
| 8 | My Applications | `my_applications.html` | Table with status badges (Pending → Under Review → Interview → Rejected) |
| 9 | Student Profile | `student_profile.html` | Avatar, completeness bar, CV upload, LinkedIn/GitHub/Portfolio, skills |
| 10 | Company Dashboard | `company_dashboard.html` | Metrics (Active Listings, Applicants, Pending Reviews) + listings table |
| 11 | Applicant Tracking | `applicant_tracking.html` | ATS table — view CV/GitHub/LinkedIn, change status via dropdown |
| 12 | Create Internship | `create_internship.html` | Job title, department, duration, work arrangement, location, allowance, description |

### 2. Design System

Full design system documented in `DESIGN.md`:
- **Color palette:** Material Design 3 tonal system (Teal primary)
- **Typography:** Inter with defined scale (h1–h3, body-lg/md, label-md/sm)
- **Spacing:** 8px grid system (xs=4, sm=12, md=24, lg=48, xl=80)
- **Elevation:** Tonal layers + subtle borders, not heavy shadows
- **Shapes:** 0.5rem buttons, 1rem cards, rounded-full pills

### 3. Brand Consistency

- ✅ **All pages say "TrainMe"** — previously some said "InternMY", now fixed
- ✅ **All copyrights say "© 2026"** — previously said 2024
- ✅ **Consistent nav pattern** across all authenticated pages
- ✅ **Consistent footer** across all pages

### 4. Page Linking (Navigation)

All existing pages are linked together. Here's the full flow:

```
Homepage
  ├─ Login ──→ Role Selection (Sign Up)
  ├─ Join Now ──→ Role Selection
  ├─ Join as Student ──→ Student Registration ──→ (login link back)
  └─ Join as Company ──→ Company Registration ──→ (login link back)

Role Selection
  ├─ Student Card ──→ Student Registration
  ├─ Company Card ──→ Company Registration
  └─ Login link ──→ Login

After Login (Student Path):
  Nav: Internships ──→ Discovery Feed
       Applications ──→ My Applications
       TrainMe logo ──→ Homepage
  
  Discovery Feed ──→ View Details ──→ Internship Detail
  Internship Detail ──→ Back to Internships ──→ Discovery Feed
  Mobile Nav: Discover / Applied / Messages / Profile ──→ linked

After Login (Company Path):
  Nav: Internships ──→ Discovery Feed
       Applications ──→ My Applications
       TrainMe logo ──→ Homepage
  
  Company Dashboard ──→ Post New Internship ──→ Create Internship
  Company Dashboard ──→ View Applicants ──→ Applicant Tracking
```

---

## 🔴 What's Left To Do

### Priority 1 — Missing Pages (Must Build)

| Page | Why It's Needed | Difficulty |
|------|----------------|------------|
| **Companies Directory** | "Companies" nav link goes nowhere — students should browse companies | Medium |
| **Messages / Inbox** | "Messages" nav link goes nowhere — needed for student↔company communication | Hard |
| **Saved Internships** | Bookmark buttons exist but no page to view saved listings | Easy |
| **Application Confirmation** | After "Apply Now" click — show success state + next steps | Easy |
| **Company Profile (Edit)** | Companies need to edit their own profile (logo, description, website) | Medium |
| **Forgot Password** | Link exists on login page but goes nowhere | Easy |

### Priority 2 — Missing Features (Should Add)

| Feature | Where | Details |
|---------|-------|---------|
| **Stipend on cards** | `discovery_feed.html` | Add "RM 800/mo" chip to each internship card |
| **Application deadline** | `create_internship.html` | Add deadline date field to the form |
| **Filter tabs on tracker** | `my_applications.html` | Add tabs: All / Pending / Under Review / Interview / Rejected |
| **Withdraw application** | `my_applications.html` | Let students cancel before company reviews |
| **Applicant notes** | `applicant_tracking.html` | Let companies add internal notes about each applicant |
| **Save as Draft** | `create_internship.html` | Currently only "Publish" — add draft support |
| **Preview before publish** | `create_internship.html` | Show how listing appears to students before publishing |
| **Password strength meter** | Registration pages | Visual indicator during password entry |
| **One-click Apply** | `internship_detail.html` | Apply with profile + CV in one click (currently just a button) |

### Priority 3 — UI Polish

| Improvement | Where |
|-------------|-------|
| Add "How It Works" section (3 steps) | `homepage.html` |
| Add social proof (stats, university logos, testimonials) | `homepage.html` |
| Add Google OAuth login button | `login.html` |
| Add "About Me" / bio text area | `student_profile.html` |
| Add education details (Year, CGPA, Major) | `student_profile.html` |
| Add Kanban board view (drag-drop pipeline) | `applicant_tracking.html` |
| Add pagination / infinite scroll | `discovery_feed.html` |
| Add sorting (Newest, Deadline, Stipend) | `discovery_feed.html` |
| Add empty states for zero results | `discovery_feed.html` |
| Add confirmation dialog for status changes | `applicant_tracking.html` |

### Priority 4 — Backend Integration

| Task | Details |
|------|---------|
| Choose a framework | Migrate from static HTML to React/Next.js or Flutter |
| Authentication | Supabase Auth or Firebase — email + Google OAuth |
| Database | Store users, internships, applications, messages |
| Email verification | Student .edu.my email verification flow |
| SSM verification | Company SSM number validation (can be manual at first) |
| File upload | CV/resume upload (PDF, max 5MB) |
| Real-time notifications | Application status changes trigger email/push |
| Search & filter | Backend-powered search with Algolia or Supabase full-text |

### Priority 5 — Business & Growth

| Task | Details |
|------|---------|
| Monetization model | Freemium for companies (free: 2 listings/mo, premium: unlimited + analytics) |
| University partnerships | Embed TrainMe in university career portals |
| SEO content | Blog: "Best internships in Malaysia", "How to write a CV" |
| Student ambassador program | Campus reps with referral codes |
| Mobile PWA | Wrap web app for mobile |
| Multi-language | Bahasa Malaysia + English toggle |

---

## 🎨 Design Quick Reference

| Element | Value |
|---------|-------|
| **Primary color** | `#006565` (dark teal) |
| **Primary container** | `#008080` (teal) |
| **Background** | `#fcf9f8` (warm white) |
| **Text** | `#1c1b1b` (near-black) |
| **Font** | Inter (Google Fonts) |
| **Border radius** | Buttons: 0.5rem, Cards: 0.75rem |
| **Spacing base** | 8px multiples |
| **Icons** | Material Symbols Outlined (Google Fonts CDN) |

---

## 👥 Team Task Assignments

> **Asim** — Project lead. Built all 12 existing screens, design system, and page linking.  
> **Osamah, Mohammed, Omer** — Frontend UI/Design (new pages + improvements)  
> **Hussain** — Backend development (framework, database, authentication, APIs)

---

### 🟢 Osamah — Student Experience Pages

**Focus:** Everything the student sees after logging in.

| # | Task | File(s) | Type | Difficulty |
|---|------|---------|------|------------|
| 1 | Build **Saved/Bookmarked Internships** page | `saved_internships.html` (NEW) | New Page | Easy |
| 2 | Build **Application Confirmation** modal/page | `application_success.html` (NEW) | New Page | Easy |
| 3 | Build **Forgot Password** page | `forgot_password.html` (NEW) | New Page | Easy |
| 4 | Add **stipend display** chip to internship cards | `discovery_feed.html` | Edit | Easy |
| 5 | Add **pagination** or "Load More" to feed | `discovery_feed.html` | Edit | Medium |
| 6 | Add **sorting** dropdown (Newest / Deadline / Stipend) | `discovery_feed.html` | Edit | Medium |
| 7 | Add **empty state** for zero search results | `discovery_feed.html` | Edit | Easy |
| 8 | Add **filter tabs** (All / Pending / Interview / Rejected) | `my_applications.html` | Edit | Medium |
| 9 | Add **Withdraw Application** button | `my_applications.html` | Edit | Easy |

**Deliverables:** 3 new pages + 6 edits to existing pages.

---

### 🔵 Mohammed — Company Experience Pages

**Focus:** Everything the employer sees after logging in.

| # | Task | File(s) | Type | Difficulty |
|---|------|---------|------|------------|
| 1 | Build **Company Profile (Edit)** page | `company_profile_edit.html` (NEW) | New Page | Medium |
| 2 | Build **Companies Directory** page (student view) | `companies_directory.html` (NEW) | New Page | Medium |
| 3 | Add **application deadline** date field | `create_internship.html` | Edit | Easy |
| 4 | Add **"Save as Draft"** button | `create_internship.html` | Edit | Easy |
| 5 | Add **preview before publish** | `create_internship.html` | Edit | Medium |
| 6 | Add **confirmation dialog** on applicant status change | `applicant_tracking.html` | Edit | Medium |
| 7 | Add **applicant notes/comments** field | `applicant_tracking.html` | Edit | Medium |
| 8 | Add **filter/sort** on applicant list (by University, Date, Status) | `applicant_tracking.html` | Edit | Medium |
| 9 | Link **"Companies"** nav item to `companies_directory.html` across all pages | All nav bars | Edit | Easy |

**Deliverables:** 2 new pages + 7 edits to existing pages.

---

### 🟡 Omer — Homepage, Auth & General Polish

**Focus:** Public-facing pages, authentication UX, and platform-wide polish.

| # | Task | File(s) | Type | Difficulty |
|---|------|---------|------|------------|
| 1 | Build **Messages/Inbox** page skeleton | `messages.html` (NEW) | New Page | Medium |
| 2 | Build **Notifications** panel/page | `notifications.html` (NEW) | New Page | Medium |
| 3 | Build **Settings** page | `settings.html` (NEW) | New Page | Easy |
| 4 | Add **"How It Works"** section (3-step flow) | `homepage.html` | Edit | Easy |
| 5 | Add **social proof** section (stats, university logos, testimonials) | `homepage.html` | Edit | Medium |
| 6 | Add **Google OAuth** button to login | `login.html` | Edit | Easy |
| 7 | Add **password strength meter** | `student_registration.html`, `company_registration.html` | Edit | Medium |
| 8 | Add **"About Me"** bio section + education details | `student_profile.html` | Edit | Medium |
| 9 | Add **profile preview** feature (see how companies see your profile) | `student_profile.html` | Edit | Medium |
| 10 | Link **"Messages"** nav item to `messages.html` across all pages | All nav bars | Edit | Easy |
| 11 | Build **About Us / Privacy Policy / Terms of Service** pages | `about.html`, `privacy.html`, `terms.html` (NEW) | New Pages | Easy |

**Deliverables:** 6 new pages + 5 edits to existing pages.

---

### 🟠 Hussain — Backend Development

**Focus:** Framework setup, database, authentication, and API integration.

| # | Task | Details | Difficulty |
|---|------|---------|------------|
| 1 | **Choose & set up framework** | React + Next.js or Vite (recommended for static pages) | Medium |
| 2 | **Set up Supabase project** | Create project, configure Auth + PostgreSQL database | Medium |
| 3 | **Design database schema** | Tables: `users`, `companies`, `internships`, `applications`, `messages`, `bookmarks` | Medium |
| 4 | **Implement authentication** | Email/password sign-up + login with Supabase Auth | Medium |
| 5 | **Add Google OAuth** | Supabase OAuth provider for Google accounts | Easy |
| 6 | **Student email verification** | Verify `.edu.my` email addresses during registration | Medium |
| 7 | **SSM verification workflow** | Manual or automated SSM number validation for companies | Medium |
| 8 | **Internship CRUD API** | Create, Read, Update, Delete internship listings | Medium |
| 9 | **Application submission API** | Students apply → create application record → notify company | Medium |
| 10 | **Application status API** | Companies update status (Pending → Review → Interview → Accept/Reject) → notify student | Medium |
| 11 | **File upload** | CV/Resume upload (PDF, max 5MB) via Supabase Storage | Medium |
| 12 | **Search & filter API** | Full-text search on internships + filter by location/industry/duration | Hard |
| 13 | **Bookmark API** | Students save/unsave internships | Easy |
| 14 | **Notifications system** | Email or in-app notifications on status changes | Hard |

**Deliverables:** Full backend stack — Auth + Database + APIs + File Storage.

---

### 📊 Hussain's Suggested Database Schema

```sql
-- Core Tables
users (id, role, name, email, password_hash, avatar_url, created_at)
students (user_id FK, university, year_of_study, cgpa, major, bio, cv_url, linkedin, github, portfolio, skills[])
companies (user_id FK, company_name, ssm_number, industry, website, description, logo_url, verified, employee_count)

-- Listings
internships (id, company_id FK, title, department, description, location, duration, work_type, stipend, skills[], deadline, status, created_at)

-- Applications
applications (id, student_id FK, internship_id FK, status, cover_letter, applied_at, updated_at)

-- Social
bookmarks (student_id FK, internship_id FK, created_at)
messages (id, sender_id FK, receiver_id FK, content, read, created_at)
notifications (id, user_id FK, type, title, message, read, created_at)
```

---

## ⏰ Timeline

| Week | Osamah | Mohammed | Omer | Hussain |
|------|--------|----------|------|---------|
| **Week 1** | Saved Internships page, App Confirmation, Forgot Password, Stipend on cards | Companies Directory, Company Profile Edit, Deadline field, Save as Draft | Messages skeleton, Notifications, Settings, How It Works section | Framework setup, Supabase project, DB schema, Auth (login/register) |
| **Week 2** | Pagination, Sorting, Empty states, Filter tabs, Withdraw button | Preview before publish, ATS confirmation dialog, Applicant notes, Filter/sort | Social proof, Google OAuth button, Password strength, About Me + education | Google OAuth, Email verification, SSM workflow, Internship CRUD API |
| **Week 3** | 🔗 Connect pages to Hussain's APIs | 🔗 Connect pages to Hussain's APIs | About/Privacy/Terms pages, Profile preview, Link navs | Application API, Status API, File upload, Search & filter, Bookmarks |
| **Week 4** | 🧪 Testing & bug fixes | 🧪 Testing & bug fixes | 🧪 Testing & bug fixes | Notifications system, Testing & deployment |

---

## 📋 Rules for the Team

1. **Always check `DESIGN.md`** before building — use the correct colors, fonts, and spacing
2. **Use the existing nav/footer pattern** — copy from any authenticated page as a template
3. **Name new files in lowercase with underscores** (e.g., `saved_internships.html`)
4. **Test on mobile** — resize browser to 375px width to check responsiveness
5. **Commit often** — one commit per task, clear commit messages
6. **Don't change existing pages** without checking with the team first

---

> **Questions?** Refer to `DESIGN.md` for the full design system, or open any `.html` file in a browser to see the UI.

