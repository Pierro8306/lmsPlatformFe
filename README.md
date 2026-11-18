# CodePulse LMS — Production-Grade Modern E-Learning & Coding Arena

A full-featured, dark-first modern E-Learning and Online Judge platform built with **Next.js 14+ (App Router)**, **TypeScript** (strict mode), **Tailwind CSS**, **Monaco Editor**, **TanStack Query**, **Zustand**, and **Radix UI primitives**.

The application is engineered as a **frontend-only architecture** with typed service layers and realistic mock fallbacks: **every feature runs offline without needing an active backend or database**, yet seamlessly binds to a live REST API simply by configuring `NEXT_PUBLIC_API_URL`.

---

## 🚀 Key Highlights & Architectural Features

### 1. Dark-First Design System
- **Core Palette**:
  - Background: `#0B0D12` / `#0F1218` (deep space obsidian)
  - Surfaces / Cards: `#151923` / `#1A1F2B` with glassmorphic backdrop-blur
  - Borders: `#232938` / `#2A3142`
  - Typography: `#E6E9F0` (primary), `#9AA3B5` (secondary), `#6B7385` (muted)
  - Primary Gradient: `#6366F1` (Indigo) $\to$ `#8B5CF6` (Violet)
  - Secondary Accent: `#22D3EE` (Cyan / Teal)
  - Status Accents: `#22C55E` (Success), `#F59E0B` (Warning), `#EF4444` (Danger)
- **Monaco Editor Dark Theme (`eduflow-dark`)**: Custom syntactic tokens precisely styled to match the dark palette with syntax tokens for Python, JavaScript, Java, and C++.

### 2. Interactive Coding Workspace & Online Judge
- **Flagship Resizable Workspace** (`/student/problems/[id]`):
  - Resizable split panel layout (`react-resizable-panels`), automatically adaptive to mobile screens.
  - **Left Pane Tabs**:
    - **Description**: Full Markdown rendering (`react-markdown` + `remark-gfm`), math formulas, constraints, and sample I/O.
    - **Submissions**: History of all past attempts with runtime, memory, score, and a **"Restore Version"** button that loads previous code into the editor.
    - **Instructor Notes**: Inline and submission-level feedback from instructors.
  - **Right Pane**:
    - Embedded Monaco Editor (dynamically loaded with skeleton placeholder).
    - Multi-language switcher (Python, JavaScript, Java, C++) with confirmation prompt to prevent accidental code loss.
    - Font-size selector (12px, 14px, 16px, 18px) and "Reset to Starter" button.
    - **Keyboard Shortcuts**: `Ctrl/Cmd + Enter` to Run, `Ctrl/Cmd + Shift + Enter` to Submit.
    - **Debounced Autosave**: Drafts persist per-problem and per-language in `localStorage`.
    - **Exam Mode**: Sticky countdown timer, auto-submit on expiry, and exit controls.
    - **Confetti Celebration**: Triggers on Accepted (`ACCEPTED`) verdicts via `canvas-confetti`.
  - **Collapsible Bottom Console**:
    - **Test Cases Tab**: Sample test cases with standard input and expected output.
    - **Custom Input Tab**: Interactive textarea allowing arbitrary inputs for sandbox testing.
    - **Output Tab**: Verdict badge, stdout/stderr, compilation error logs, runtime, and memory breakdown.

### 3. Admin Coding Problem Management
- **Problem List & CRUD** (`/admin/problems`):
  - DataTable with real-time search, difficulty filtering (Easy, Medium, Hard), and tags.
- **Problem Authoring Form** (`/admin/problems/new`, `/admin/problems/[id]/edit`):
  - Title, difficulty, tags, time limit (ms), memory limit (MB), points.
  - Dual-mode Markdown statement editor with live preview.
  - Starter code templates per language in Monaco tabs.
  - Cohort targeting and assignment deadlines.
- **Test Case Manager** (`/admin/problems/[id]/testcases`):
  - Sample (visible) vs Hidden evaluation test cases.
  - Points weighting per test case with total score calculator.
  - Drag-and-drop / arrow reordering.
- **Submissions & Code Review Screen** (`/admin/problems/[id]/submissions`):
  - Table of all student attempts with verdict badges, runtime, memory, and submission time.
  - Interactive Drawer with read-only Monaco code viewer.
  - **Line-level code review comments**: Click any line number to attach suggestions, issues, or critical notes with status tracking (`open` / `resolved`).
  - Score override (0–10 scale) and general instructor feedback.

### 4. Admin Courses, Projects & AI Exam Engine
- **Course & Lesson Management**:
  - Curriculum tree with drag-and-drop dual-list lesson assignment.
  - Rich-text lesson editor (Tiptap) with embedded video preview and document attachments.
- **Project Assignments**:
  - Project creation with strict due-dates and late submission rules.
  - Student GitHub repository validation, grading (0–10), and feedback.
- **AI Quiz & Question Extraction**:
  - PDF dropzone upload zone with real-time progress simulation.
  - AI extraction parsing syllabus/exam PDFs into multiple-choice questions with generated distractors.
  - Interactive pre-save review list where instructors can edit questions and mark correct options.
  - Student Gradebook table with search, completion metrics, and CSV export.
- **Communication Hub**:
  - Announcements with pin/unpin controls.
  - Scheduled events with live participant attendee tracker.

### 5. Student Learning Experience
- **Course Catalog & Lesson Viewer**: Embedded video player (YouTube/Vimeo/direct), structured outline, downloadable attachments, and previous/next navigation.
- **Timed Online Exam Room**: Sticky countdown timer, question navigator matrix (answered / unanswered / flagged), auto-submit when timer expires, confirm-before-submit modal, and `beforeunload` warning.
- **Project Tracker**: Countdown badges and GitHub repository submitter.
- **Community Events**: Optimistic "Join / Leave" toggle with live participant counts.

### 6. Authentication & Security
- **Silent Session Refresh**: Axios response interceptor that transparently refreshes expired JWTs via `/auth/token/refresh/`, queues pending concurrent requests, and logs out only on terminal refresh failure.
- **Role-Based Middleware Protection**: Edge Next.js middleware enforcing access control between `/admin/*` and `/student/*` routes.
- **Password Strength Analyzer**: Dynamic color-coded meter for uppercase, lowercase, numbers, and symbols.

---

## 🛠 Tech Stack

| Layer | Technologies |
|---|---|
| **Framework** | Next.js 14+ (App Router), React 18, TypeScript (Strict Mode) |
| **Styling & Design** | Tailwind CSS, Radix UI Primitives, Lucide React Icons |
| **State Management** | Zustand (Auth & UI State), TanStack Query v5 (Server Cache) |
| **Forms & Validation** | React Hook Form, Zod Schema Validation |
| **Code Editor** | `@monaco-editor/react` (Custom Dark Theme, Dynamically Imported) |
| **Layouts & Panels** | `react-resizable-panels` (Flexible Split Panes) |
| **Markdown** | `react-markdown`, `remark-gfm` |
| **Notifications** | Sonner Toasts |
| **Data Tables** | `@tanstack/react-table` |

---

## 📁 Project Structure

```
├── app/
│   ├── (auth)/
│   │   ├── login/                # User login with role redirect
│   │   ├── forgot-password/      # Password recovery email request
│   │   └── reset-password/       # Token-based password reset
│   ├── (dashboard)/
│   │   ├── profile/              # User profile & information editor
│   │   └── change-password/      # Password change with strength meter
│   ├── admin/
│   │   ├── dashboard/            # Platform analytics & quick actions
│   │   ├── users/                # User management DataTable
│   │   ├── courses/              # Course CRUD & dual-list lesson assignment
│   │   ├── projects/             # Project assignments & grading
│   │   ├── quizzes/              # Quizzes, AI PDF question extraction & gradebook
│   │   ├── problems/             # Coding problems list, form, test cases & submissions
│   │   └── communication/        # Announcements & event attendance
│   ├── student/
│   │   ├── dashboard/            # Enrolled courses, upcoming deadlines & achievements
│   │   ├── courses/              # Curriculum outline & video lesson viewer
│   │   ├── problems/             # Coding Arena & Flagship Monaco Workspace
│   │   ├── projects/             # Project submissions (GitHub URL validation)
│   │   ├── quizzes/              # Quiz waiting room & timed online exam room
│   │   ├── announcements/        # Notification bulletin
│   │   └── events/               # Event feed with optimistic RSVP
│   ├── globals.css               # Dark design tokens & utility classes
│   └── layout.tsx                # App root layout with QueryClient & Toaster
├── components/
│   ├── admin/                    # Admin problem form, sidebar, user modals
│   ├── shared/
│   │   ├── code-editor/          # Monaco wrapper with eduflow-dark theme
│   │   ├── markdown-renderer.tsx # Markdown renderer for statements
│   │   ├── sidebar.tsx           # Collapsible dashboard sidebar
│   │   └── top-bar.tsx           # Global header with profile dropdown
│   └── ui/                       # Reusable UI component library (Button, Modal, Drawer, VerdictBadge, etc.)
├── lib/
│   ├── api/
│   │   ├── axios.ts              # Axios instance with 401 queue & silent refresh
│   │   └── endpoints.ts          # Centralized API endpoint registry
│   ├── mock/
│   │   ├── judge.ts              # Simulated asynchronous online judge & polling
│   │   └── problems.ts           # Pre-seeded algorithm problems & test cases
│   ├── auth.ts                   # Cookie & JWT token helper utilities
│   └── utils.ts                  # Classname merger (cn) & async helpers
├── services/                     # Typed API services with mock fallback
├── types/                        # Strict TypeScript definitions
├── middleware.ts                 # Next.js role-based route guard
└── package.json
```

---

## ⚙️ Environment Variables

Create `.env.local` in the project root:

```env
# Optional Backend API URL
# Leave empty to run entirely in standalone offline mode with realistic mock services
NEXT_PUBLIC_API_URL=

# App Branding
NEXT_PUBLIC_APP_NAME="CodePulse LMS"
```

---

## 🏃 Running the Application

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Demo Credentials (Offline Mock Mode)
| Role | Username / Email | Password | Target Dashboard |
|---|---|---|---|
| **Administrator** | `admin` or `admin@eduflow.dev` | Any password | `/admin/dashboard` |
| **Student** | `student` or `student@eduflow.dev` | Any password | `/student/dashboard` |

---

## ⚖️ Online Judge & Mock Execution Architecture

> **Notice**: Real arbitrary code execution requires an isolated containerized sandbox (e.g. Judge0, Piston, or Docker micro-vms) deployed on a dedicated backend server. This frontend includes an asynchronous Mock Judge (`lib/mock/judge.ts`) that simulates the full lifecycle of an online judge:

1. **Status Polling**:
   - `IN_QUEUE` (400ms delay)
   - `RUNNING` (700–1500ms execution delay)
   - `FINISHED` with typed results.
2. **Deterministic Verdict Keywords**:
   To test all judge outcomes in the workspace, include these keywords anywhere in your code:
   - `// verdict: ac` $\to$ **ACCEPTED**
   - `// verdict: wa` $\to$ **WRONG_ANSWER**
   - `// verdict: tle` $\to$ **TIME_LIMIT_EXCEEDED**
   - `// verdict: mle` $\to$ **MEMORY_LIMIT_EXCEEDED**
   - `// verdict: re` $\to$ **RUNTIME_ERROR**
   - `// verdict: ce` $\to$ **COMPILE_ERROR**

---

## 🔌 Expected Backend API Endpoints

When connecting to a real backend by setting `NEXT_PUBLIC_API_URL`, the application expects the following REST endpoints:

### Authentication
- `POST /auth/login/` — Login `{ username, password }` $\to$ `{ access, refresh, user }`
- `POST /auth/token/refresh/` — Silent refresh `{ refresh }` $\to$ `{ access }`
- `POST /auth/logout/` — Invalidate refresh token
- `POST /auth/forgot-password/` — Request password reset email
- `POST /auth/reset-password/` — Submit new password with reset token
- `GET /auth/me/` — Retrieve authenticated user profile
- `POST /auth/change-password/` — Change user password

### Coding Problems & Judge
- `GET /problems/` — List problems with `search` and `difficulty` query params
- `GET /problems/:id/` — Get problem details
- `POST /problems/` — Create new problem
- `PUT /problems/:id/` — Update problem
- `DELETE /problems/:id/` — Delete problem
- `GET /problems/:id/testcases/` — List test cases
- `POST /problems/:id/testcases/` — Create test case
- `PUT /problems/:id/testcases/:tcId/` — Update test case
- `DELETE /problems/:id/testcases/:tcId/` — Delete test case
- `POST /problems/:id/run/` — Execute code on sample / custom inputs
- `POST /problems/:id/submit/` — Full evaluation against all test cases
- `GET /problems/:id/submissions/` — List problem submissions
- `POST /problems/:id/submissions/:subId/grade/` — Grade submission override
- `POST /submissions/:subId/comments/` — Add line-level code review comment
#   l m s P l a t f o r m F e  
 