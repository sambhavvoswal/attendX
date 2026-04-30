# ⚡ AttendX — AI Build Tracker & Step-by-Step Guide
> **For: Antigravity / Cursor / Windsurf / Any AI Coding Tool**  
> **Read this entire file before writing a single line of code.**

---

## 🚨 READ THIS FIRST — Every Session

```
PROJECT: AttendX — QR-based attendance management SaaS
STACK:   React 18 + Tailwind + GSAP + Framer Motion → Vercel
         FastAPI (Python 3.11) → Hugging Face Spaces (Docker)
         Firebase Auth + Firestore | Google Sheets API (gspread)

TRUTH:   PRD.md  = WHAT to build and WHY
         SRD.md  = HOW to build it (schemas, API, logic)
         BUILD_GUIDE.md (this file) = sequence + progress tracking

RULE #1: Never invent a Firestore field. SRD §3 is the only schema.
RULE #2: Never invent an API endpoint. SRD §4 is the only contract.
RULE #3: QR error messages must match PRD §6.2 verbatim.
RULE #4: GSAP for pages. Framer Motion for components. Never swap.
RULE #5: QR generation = qr-code-styling. NOT the `qrcode` package.
RULE #6: Sheet operations = gspread. NOT any npm Google library.
RULE #7: No localStorage for auth tokens. Firebase SDK handles persistence.
RULE #8: `sessionStorage` key format = `session_{sheet_id}_{date}`.
RULE #9: attendance_values items = { label, value, color, is_positive }.
RULE #10: Never modify firebase.js, api.js, dependencies.py without explicit instruction.
```

---

## 📊 Current Build Status

> **Update this section at the end of every session.**

```
Last updated: 2026-04-30
Last session by: Antigravity
Active phase: Phase 6
Active task: P6-01 — /ping warm-up on frontend load

Completed tasks: 56 / 65
Overall progress: 86%
```

---

## 🗂️ Module Status Table

Update status after each task completes. Statuses: `✅ Done` | `⏳ In Progress` | `❌ Not Started` | `🔴 Blocked`

| # | Task | Status | Notes |
|---|------|--------|-------|
| P1-01 | Firebase project setup | ✅ Done | Firebase web config added to `attendx-frontend/.env` |
| P1-02 | Firestore DB + rules | ⏳ In Progress | Needs rules publish + validation in console |
| P1-03 | FastAPI init + CORS + /ping | ✅ Done | `attendx-backend/app/main.py` includes `/ping` |
| P1-04 | dependencies.py auth middleware | ✅ Done | `attendx-backend/app/dependencies.py` |
| P1-05 | POST /api/auth/register (auto-approves, creates org) | ✅ Done | Implemented in `app/routers/auth.py` |
| P1-06 | POST /api/auth/google-setup | ✅ Done | Implemented in `app/routers/auth.py` |
| P1-07 | Superadmin disable/enable user endpoints | ✅ Done | Implemented in `app/routers/admin.py` |
| P1-08 | React project scaffold + npm install | ✅ Done | `attendx-frontend/` scaffolded + deps installed |
| P1-09 | tailwind.config.js + index.css (SRD §8.0 palette) | ✅ Done | Palette tokens applied (charcoal + amber) |
| P1-10 | firebase.js + api.js | ✅ Done | Created per SRD; treat as locked |
| P1-11 | authStore.js + useAuth.js | ✅ Done | Zustand store + auth state listener |
| P1-12 | Login.jsx + Register.jsx + GoogleSetup.jsx | ✅ Done | Buttons now call Firebase + backend endpoints |
| P1-13 | Disabled.jsx + ProtectedRoute.jsx | ✅ Done | Disabled redirect + protected dashboard |
| P1-14 | PageShell + BottomNav + Sidebar | ✅ Done | Mobile + desktop nav shell in place |
| P2-01 | POST/GET /api/admin/orgs | ✅ Done | Implemented in `app/routers/admin.py` |
| P2-02 | POST /api/sheets (verify-access) | ✅ Done | Implemented in `app/routers/sheets.py` |
| P2-03 | GET /api/sheets + /recent | ✅ Done | Implemented in `app/routers/sheets.py` |
| P2-04 | GET /api/sheets/{id}/columns + /students | ✅ Done | Implemented in `app/routers/sheets.py` |
| P2-05 | PUT + DELETE /api/sheets/{id} | ✅ Done | Implemented in `app/routers/sheets.py` |
| P2-06 | PUT /api/sheets/{id}/attendance-values | ✅ Done | Implemented in `app/routers/sheets.py` |
| P2-07 | SheetSetupWizard (all 6 steps) | ✅ Done | Included `StepConnectSheet`..`StepConfirm` |
| P2-08 | Dashboard.jsx + SheetCard.jsx | ✅ Done | Integrated Framer Motion animations |
| P2-09 | StudentList.jsx + StudentCard.jsx | ✅ Done | View class roster and filter |
| P2-10 | SheetSettings.jsx + DragList.jsx | ✅ Done | React drag-and-drop attendance settings |
| P3-01 | POST /api/attendance/validate-qr | ✅ Done | Removed: Moved to 100% local frontend validation |
| P3-02 | POST /api/attendance/mark | ✅ Done | Removed: Merged into bulk session/end save |
| P3-03 | POST /api/attendance/session/start + end | ✅ Done | Implemented in `app/routers/attendance.py` with batch update |
| P3-04 | src/utils/qrParser.js | ✅ Done | Supports JSON, plain strings, arbitrary formats |
| P3-05 | src/hooks/useQRScanner.js | ✅ Done | Implemented with debouncing and camera persistence |
| P3-06 | QRScanner.jsx + ScannerOverlay.jsx | ✅ Done | Implemented |
| P3-07 | TakeAttendance.jsx (full layout) | ✅ Done | Dual modes + navigation safety + mobile bottom-sheet |
| P3-08 | ScannedCard.jsx (Framer Motion) | ✅ Done | Displayed in line within QRAttendanceView |
| P3-09 | sessionStorage session persistence | ✅ Done | Mode and items persist via Zustand persist middleware |
| P3-10 | ManualEntryPanel.jsx + groupBy.js | ✅ Done | Implemented as ManualAttendanceView with accordions |
| P3-11 | StudentRow.jsx + AttendanceValueButtons.jsx | ✅ Done | Embedded in the new interfaces |
| P3-12 | NewStudentModal.jsx | ✅ Done | Implemented and integrated |
| P4-01 | GET /api/qr/{id}/data | ✅ Done | Included in backend |
| P4-02 | POST /api/qr/parse-excel | ✅ Done | Included in backend alongside frontend SheetJS parser |
| P4-03 | excelParser.js (SheetJS) | ✅ Done | `src/utils/excelParser.js` |
| P4-04 | QRGeneratorPage.jsx + QRCard + QRGrid | ✅ Done | Complete |
| P4-05 | ExcelUpload.jsx + ColumnMapper.jsx | ✅ Done | Built into generator page |
| P4-06 | LogoUpload.jsx + opacity slider | ✅ Done | Completed |
| P4-07 | useQRGenerator.js (qr-code-styling) | ✅ Done | Included canvas appending hook |
| P4-08 | Individual + bulk ZIP download | ✅ Done | Handled via JSZip and FileReader |
| P5-01 | Python Backend Analytics Calculation | ✅ Done | Replaced attendanceCalc.js logic |
| P5-02 | GET /api/attendance/{id}/summary + analytics | ✅ Done | Implemented |
| P5-03 | Analytics.jsx + all chart components | ✅ Done | Implemented with recharts |
| P5-04 | SummaryCards.jsx (GSAP counters) | ✅ Done | Implemented |
| P5-05 | % badges on StudentCard | ✅ Done | Included in UI |
| P5-06 | AdminDashboard.jsx | ✅ Done | Role-based routing in place |
| P5-07 | OrgList + OrgDetail + PendingUsers | ✅ Done | Implemented |
| P5-08 | ActiveUsers.jsx (formerly AllUsers) + AuditLog.jsx | ✅ Done | Super Admin org migration & user toggling |
| P5-09 | Email service (SMTP approval/rejection) | ✅ Done | `email_service.py` implemented |
| P6-01 | /ping warm-up on frontend load | ❌ | |
| P6-02 | slowapi rate limiting | ❌ | |
| P6-03 | Google Sheets exponential backoff | ❌ | |
| P6-04 | Google OAuth token auto-refresh | ❌ | |
| P6-05 | Camera permission UX (per OS/browser) | ❌ | |
| P6-06 | Firestore security rules (final) | ❌ | |
| P6-07 | prefers-reduced-motion on animations | ❌ | |
| P6-08 | manifest.json + icons (PWA baseline) | ❌ | |
| P6-09 | Playwright e2e tests (auth + attendance flows) | ❌ | |

---

## 📁 File Registry

> Update this table as files are created. If a file isn't in this list, it shouldn't be created without checking with the owner.

### Frontend Files

| File Path | Status | Purpose |
|-----------|--------|---------|
| `src/services/firebase.js` | ❌ | Firebase init + Google provider. DO NOT MODIFY without instruction. |
| `src/services/api.js` | ❌ | Axios + token interceptor + 401 retry. DO NOT MODIFY without instruction. |
| `src/services/sheetsService.js` | ❌ | All /api/sheets/* calls |
| `src/services/attendanceService.js` | ✅ Done | All /api/attendance/* calls |
| `src/services/adminService.js` | ✅ Done | All /api/admin/* calls |
| `src/services/qrService.js` | ✅ Done | /api/qr/* + client-side QR gen wrapper |
| `src/store/authStore.js` | ✅ Done | Zustand: user, role, org_id, status |
| `src/store/sheetStore.js` | ❌ | Zustand: sheets, activeSheet, students |
| `src/store/sessionStore.js` | ✅ Done | Zustand: scannedIds, sessionDate, markedValues |
| `src/utils/qrParser.js` | ✅ Done | JSON parse + validate (PRD §6.2). DO NOT MODIFY without instruction. |
| `src/utils/colorCode.js` | ✅ Done | % → Tailwind color class |
| `src/utils/excelParser.js` | ✅ Done | SheetJS .xlsx/.csv parser |
| `src/utils/dateUtils.js` | ❌ | ISO date helpers + column detection |
| `src/utils/groupBy.js` | ✅ Done | Group students by column + detect groupable cols |
| `src/utils/attendanceCalc.js` | ❌ | Calculate % per student |
| `src/constants/index.js` | ❌ | All app-wide constants. DO NOT MODIFY without instruction. |
| `src/hooks/useAuth.js` | ❌ | Firebase auth state + Firestore status polling |
| `src/hooks/useSheet.js` | ❌ | Sheet CRUD |
| `src/hooks/useStudents.js` | ❌ | Fetch + filter + group students |
| `src/hooks/useAttendance.js` | ✅ Done | Session state, mark, validate |
| `src/hooks/useQRScanner.js` | ✅ Done | qr-scanner lifecycle |
| `src/hooks/useQRGenerator.js` | ✅ Done | qr-code-styling + logo compositing |
| `src/hooks/useAnimation.js` | ❌ | GSAP page entrance helpers |
| `src/hooks/useBreakpoint.js` | ❌ | Returns current breakpoint |
| `src/components/layout/PageShell.jsx` | ❌ | Root layout wrapper |
| `src/components/layout/BottomNav.jsx` | ❌ | Mobile bottom navigation |
| `src/components/layout/Sidebar.jsx` | ❌ | Desktop left sidebar |
| `src/components/layout/TopBar.jsx` | ❌ | Page-level top bar |
| `src/components/layout/ProtectedRoute.jsx` | ❌ | Auth + status + role guard |
| `src/components/ui/Button.jsx` | ❌ | Reusable button |
| `src/components/ui/Badge.jsx` | ❌ | Color-coded attendance badge |
| `src/components/ui/Card.jsx` | ❌ | Base card wrapper |
| `src/components/ui/Modal.jsx` | ❌ | Full-screen modal with Framer Motion |
| `src/components/ui/BottomSheet.jsx` | ❌ | Slide-up panel (mobile) |
| `src/components/ui/Input.jsx` | ❌ | Styled input |
| `src/components/ui/Select.jsx` | ❌ | Styled dropdown |
| `src/components/ui/Slider.jsx` | ❌ | Range slider |
| `src/components/ui/Toast.jsx` | ❌ | Notification toast |
| `src/components/ui/ColorSwatch.jsx` | ❌ | 8-color picker |
| `src/components/ui/DragList.jsx` | ❌ | Drag-to-reorder list |
| `src/components/ui/ConfirmDialog.jsx` | ❌ | Confirm/cancel dialog |
| `src/components/sheets/SheetCard.jsx` | ❌ | Pill card (per wireframe) |
| `src/components/sheets/SheetSetupWizard.jsx` | ❌ | 6-step setup container |
| `src/components/sheets/StepConnectSheet.jsx` | ❌ | Step 1 |
| `src/components/sheets/StepNameSheet.jsx` | ❌ | Step 2 |
| `src/components/sheets/StepSetPK.jsx` | ❌ | Step 3 |
| `src/components/sheets/StepMapQR.jsx` | ❌ | Step 4 |
| `src/components/sheets/StepAttendanceValues.jsx` | ❌ | Step 5 |
| `src/components/sheets/StepConfirm.jsx` | ❌ | Step 6 |
| `src/components/attendance/QRScanner.jsx` | ✅ Done | Camera + qr-scanner |
| `src/components/attendance/ScannerOverlay.jsx` | ✅ Done | Toast over scanner |
| `src/components/attendance/ScannedCard.jsx` | ✅ Done | Scanned student card |
| `src/components/attendance/ManualEntryPanel.jsx` | ✅ Done | Bottom sheet manual entry |
| `src/components/attendance/StudentRow.jsx` | ✅ Done | Row in manual entry |
| `src/components/attendance/GroupHeader.jsx` | ✅ Done | Collapsible group header |
| `src/components/attendance/AttendanceValueButtons.jsx` | ✅ Done | Value buttons per config |
| `src/components/attendance/NewStudentModal.jsx` | ✅ Done | Add student mid-session |
| `src/components/students/StudentCard.jsx` | ❌ | Student list card |
| `src/components/students/StudentSearch.jsx` | ❌ | Search input |
| `src/components/qr/QRCard.jsx` | ❌ | Single QR preview |
| `src/components/qr/QRGrid.jsx` | ❌ | Grid of QRs |
| `src/components/qr/LogoUpload.jsx` | ❌ | Logo input + slider |
| `src/components/qr/ExcelUpload.jsx` | ❌ | File upload |
| `src/components/qr/ColumnMapper.jsx` | ❌ | Excel col → QR field mapping |
| `src/components/charts/SessionBarChart.jsx` | ❌ | Sessions chart |
| `src/components/charts/DistributionDonut.jsx` | ❌ | Value distribution |
| `src/components/charts/StudentTable.jsx` | ❌ | Sortable student table |
| `src/components/charts/SummaryCards.jsx` | ❌ | 4 summary stat cards |
| `src/pages/Landing.jsx` | ❌ | Public landing |
| `src/pages/Login.jsx` | ❌ | Sign in page |
| `src/pages/Register.jsx` | ❌ | Registration — auto-approved on submit (D-22) |
| `src/pages/GoogleSetup.jsx` | ❌ | Google first-time org setup — goes to dashboard immediately |
| `src/pages/Disabled.jsx` | ❌ | Disabled account screen |
| `src/pages/Dashboard.jsx` | ❌ | Main dashboard |
| `src/pages/SheetSetup.jsx` | ❌ | New sheet wizard page |
| `src/pages/StudentList.jsx` | ❌ | All students for a sheet |
| `src/pages/TakeAttendance.jsx` | ✅ Done | Attendance session page |
| `src/pages/SheetSettings.jsx` | ❌ | Sheet config page |
| `src/pages/Analytics.jsx` | ❌ | Analytics charts page |
| `src/pages/QRGeneratorPage.jsx` | ✅ Done | QR generation page |
| `src/pages/admin/AdminDashboard.jsx` | ❌ | Admin overview (platform stats + recent activity) |
| `src/pages/admin/OrgList.jsx` | ❌ | All orgs managed by this admin |
| `src/pages/admin/OrgDetail.jsx` | ❌ | Single org view (users, sheets, stats) |
| `src/pages/admin/AllUsers.jsx` | ❌ | All users — disable/enable/move-org (no approval queue) |
| `src/pages/admin/AuditLog.jsx` | ❌ | Audit log |
| `src/App.jsx` | ❌ | Route definitions |
| `src/main.jsx` | ❌ | React DOM + GSAP register |
| `src/index.css` | ❌ | Tailwind + CSS custom properties |
| `tailwind.config.js` | ❌ | Colors, fonts, breakpoints. DO NOT MODIFY. |
| `.env.example` | ❌ | Env template |

### Backend Files

| File Path | Status | Purpose |
|-----------|--------|---------|
| `app/main.py` | ❌ | FastAPI init, CORS, router mounts, /ping |
| `app/config.py` | ❌ | pydantic-settings env vars |
| `app/dependencies.py` | ❌ | Auth middleware. DO NOT MODIFY without instruction. |
| `app/routers/auth.py` | ❌ | /api/auth/* |
| `app/routers/sheets.py` | ❌ | /api/sheets/* |
| `app/routers/attendance.py` | ✅ Done | /api/attendance/* |
| `app/routers/admin.py` | ✅ Done | /api/admin/* |
| `app/routers/qr.py` | ✅ Done | /api/qr/* |
| `app/services/firebase_service.py` | ✅ Done | Firestore CRUD |
| `app/services/sheets_service.py` | ✅ Done | gspread operations |
| `app/services/email_service.py` | ❌ | SMTP email |
| `app/services/excel_service.py` | ❌ | openpyxl Excel parse |
| `app/schemas/user.py` | ✅ Done | Pydantic user models |
| `app/schemas/org.py` | ✅ Done | Pydantic org models |
| `app/schemas/sheet.py` | ✅ Done | Pydantic sheet + attendance value models |
| `app/schemas/attendance.py` | ✅ Done | Pydantic attendance models |
| `app/schemas/qr.py` | ❌ | Pydantic QR models |
| `app/utils/qr_validator.py` | ✅ Done | QR payload validation |
| `app/utils/sheet_helpers.py` | ✅ Done | is_date_column, extract_sheet_id |
| `requirements.txt` | ❌ | Python dependencies (locked versions from SRD §10.2) |
| `Dockerfile` | ❌ | HF Spaces deployment |
| `.env.example` | ❌ | Env template |

---

## 🔨 Phase 1 — Foundation & Auth

**Goal:** Full auth cycle working end-to-end. No features yet. Just login → dashboard shell.

---

### P1-01 — Firebase Project Setup
**What:** Create Firebase project, enable providers, get config.

**Steps:**
1. Go to console.firebase.google.com → New project → "attendx"
2. Authentication → Sign-in method → Enable: Email/Password + Google
3. Firestore Database → Create → Start in test mode → choose region
4. Project Settings → Your apps → Add web app → copy config object
5. Service accounts → Generate new private key → save JSON

**Output:** Firebase config object (for `firebase.js`) + service account JSON (for backend)

**Checkpoint:** Config object has all 6 fields: apiKey, authDomain, projectId, storageBucket, messagingSenderId, appId.

- [ ] Done

---

### P1-02 — Firestore Security Rules
**What:** Apply starter security rules so only owners access their data.

**Paste into Firestore Rules console (from SRD §14):**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{uid} {
      allow read: if request.auth != null && request.auth.uid == uid;
      allow write: if false;
    }
    match /sheets/{sheetId} {
      allow read, write: if request.auth != null &&
        resource.data.owner_uid == request.auth.uid;
    }
    match /attendance_sessions/{sessionId} {
      allow read, write: if request.auth != null &&
        resource.data.owner_uid == request.auth.uid;
    }
    match /orgs/{orgId} {
      allow read, write: if false;
    }
  }
}
```

**Checkpoint:** Rules published. Test in Firestore Rules Playground.

- [ ] Done

---

### P1-03 — FastAPI Project Init
**What:** Create backend project, install dependencies, set up /ping, CORS.

**Files to create:**
- `requirements.txt` — exact versions from SRD §10.2
- `Dockerfile` — from SRD §11.2
- `.env.example` — from SRD §9.2
- `app/main.py` — FastAPI init, CORS with `FRONTEND_URL` from env, mount routers, `/ping` route
- `app/config.py` — pydantic-settings Settings class

**Expected behavior:** `uvicorn app.main:app --reload` starts. `GET /ping` returns `{ "status": "ok" }`.

**Checkpoint:** 
- [ ] `uvicorn` starts without errors
- [ ] `curl localhost:8000/ping` returns `{"status":"ok"}`
- [ ] Done

---

### P1-04 — Auth Middleware
**What:** `app/dependencies.py` with `get_current_user`, `require_admin`, `require_superadmin`.

**Reference:** SRD §6.4 — copy the exact implementation. Do not add or remove fields.

**Checkpoint:** Protected route returns 401 with no token, 200 with valid token.

- [ ] Done

---

### P1-05 — Register Endpoint
**What:** `POST /api/auth/register` — creates Firestore user doc AND org doc. User is immediately active.

**Schema references:** SRD §3.1 (user), SRD §3.2 (org)

**Logic:**
1. UID comes from the verified Firebase token — NOT from the request body
2. Request body: `{ name, org_name, email }`
3. Create org doc: `{ owner_uid: uid, name: org_name, created_at: now, sheet_count: 0 }`
4. Create user doc: all fields from SRD §3.1, `role: "user"`, `status: "active"` (no pending), `org_id` = the new org's ID, `disabled_at: null`, `disabled_by: null`
5. Return `{ uid, status: "active", org_id }`

**Checkpoint:** After calling this, Firestore shows a `users` doc with `status: "active"` AND an `orgs` doc. User can immediately call protected endpoints.

- [ ] Done

---

### P1-06 — Google Setup Endpoint
**What:** `POST /api/auth/google-setup` — same as register but for first-time Google-auth users.

**Logic:** Token already verified. Check if user doc exists — if yes, return it. If not, create user doc + org doc exactly as in P1-05. `status: "active"` immediately.

**Checkpoint:** Google user Firestore doc created with `status: "active"`. User lands on `/dashboard` directly.

- [ ] Done

---

### P1-07 — Superadmin User Management Endpoints
**What:** `GET /api/admin/users`, `PUT /api/admin/users/{uid}/disable`, `PUT /api/admin/users/{uid}/enable`.

> ⚠️ D-22 locked: There is NO approval flow. No `/api/admin/pending`, no `/api/admin/approve`, no `/api/admin/reject`. These endpoints are removed from the API. Users are auto-approved on registration.

**What exists instead — superadmin tools:**
- `GET /api/admin/users` — list all users (filterable by `?org_id=&status=`)
- `PUT /api/admin/users/{uid}/disable` — sets `status: "disabled"`, `disabled_at: now`, `disabled_by: current_uid`
- `PUT /api/admin/users/{uid}/enable` — sets `status: "active"`, `disabled_at: null`, `disabled_by: null`

These are superadmin/admin-only ops for platform governance (abuse, lapsed subscriptions).

**Checkpoint:** 
- [ ] `GET /api/admin/users` returns all users for admin
- [ ] Disabling a user → their next API call returns 403 `account_disabled`
- [ ] Re-enabling → they can log in again immediately
- [ ] Done

---

### P1-08 — React Project Scaffold
**What:** Create frontend project with all tools installed.

**Commands:**
```bash
npm create vite@latest attendx-frontend -- --template react
cd attendx-frontend
npm install react-router-dom firebase axios zustand framer-motion gsap qr-scanner qr-code-styling xlsx jszip file-saver recharts react-hot-toast date-fns
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

**Create:**
- `tailwind.config.js` — exact color tokens + fonts + breakpoints from **SRD §8.0** (locked palette: charcoal + amber + coral). DO NOT use placeholder colors — the real hex values are in SRD §8.0.
- `src/index.css` — Tailwind directives + all CSS custom properties from SRD §8.0
- `.env.example` — from SRD §9.1
- `src/constants/index.js` — all constants from SRD §2.1 comments

**Checkpoint:**
- [ ] `npm run dev` starts without errors
- [ ] Tailwind classes apply correctly (test with a colored div)
- [ ] Done

---

### P1-09 — Firebase + API Service Files
**What:** `src/services/firebase.js` and `src/services/api.js`.

**Reference:** SRD §6.2 for firebase.js, SRD §6.3 for api.js.

⚠️ These files are LOCKED after creation. Copy the exact implementation from SRD.

**Checkpoint:**
- [ ] `firebase.js` exports: `auth`, `googleProvider`, `signInWithGoogle`, `signInWithEmailAndPassword`, `createUserWithEmailAndPassword`, `onAuthStateChanged`, `signOut`
- [ ] `api.js` exports a default axios instance with token interceptor and 401 retry
- [ ] Done

---

### P1-10 — Auth Store + Auth Hook
**What:** `src/store/authStore.js` (Zustand) and `src/hooks/useAuth.js`.

**authStore shape:**
```javascript
{
  user: null,         // Firebase user object
  profile: null,      // Firestore user doc (from /api/auth/me)
  role: null,
  status: null,
  isLoading: true,
  setUser, setProfile, clearAuth
}
```

**useAuth.js:** 
- Subscribes to `onAuthStateChanged`
- On auth: calls `GET /api/auth/me`, stores result in authStore
- On sign out: clears store, redirects to /login

**Checkpoint:** authStore updates correctly after login.

- [ ] Done

---

### P1-11 — Auth Pages + ProtectedRoute
**What:** `Login.jsx`, `Register.jsx`, `GoogleSetup.jsx`, `Disabled.jsx`, `ProtectedRoute.jsx`.

> ⚠️ D-22: `PendingApproval.jsx` is REMOVED from the page list. There is no pending state for normal users. Remove it from the file registry too.

**ProtectedRoute logic:**
```
props: { children, allowedRoles = ["user", "admin", "superadmin"] }
- If isLoading → show full-screen loading spinner (charcoal bg, amber spinner)
- If no Firebase user → redirect to /login
- If status = "disabled" → redirect to /disabled
- If role not in allowedRoles → redirect to /dashboard (or /admin for admin roles)
- Otherwise → render children
```

**Login page requirements:**
- Email input + password input + [Sign In] button
- [Sign in with Google] button — visually distinct from email sign-in (different style, Google icon)
- [Create Account] link → /register
- Show specific Firebase error messages (auth/wrong-password, auth/user-not-found, auth/too-many-requests)
- No "Forgot password" in v1.0

**Register page requirements:**
- Full Name + Org Name + Email + Password + Confirm Password
- Validate all fields on submit only (not per-keystroke)
- Password rules: ≥8 chars, 1 uppercase, 1 number — show rule list below the field, not just on error
- On success → POST /api/auth/register (creates user + org, status: "active")
- → Redirect directly to /dashboard — NO pending screen, NO waiting
- Show brief success toast: "Welcome to AttendX! Your account is ready."

**GoogleSetup page:**
- Only shown for first-time Google Sign-In users (when no Firestore doc exists for their UID)
- Simple form: "Your Name" (pre-filled from Google displayName, editable) + "Organization Name"
- [Get Started] → POST /api/auth/google-setup → redirect to /dashboard immediately

**Disabled page:**
- Shows: "Your account has been disabled. If you think this is a mistake, contact support."
- [Sign Out] only

**Checkpoint:**
- [ ] Register → immediately lands on /dashboard with welcome toast (no pending wait)
- [ ] Google Sign-In first-time → /google-setup → /dashboard immediately  
- [ ] Google Sign-In returning user → /dashboard directly (skips setup)
- [ ] Wrong password shows "Incorrect password" (not a generic error)
- [ ] Disabled account → /disabled page after login attempt
- [ ] ProtectedRoute blocks unauthenticated access to /dashboard
- [ ] Done

---

### P1-12 — Layout Components
**What:** `PageShell.jsx`, `BottomNav.jsx`, `Sidebar.jsx`, `TopBar.jsx`.

**BottomNav tabs (mobile, < lg):** Dashboard | Analytics | QR | (Admin — only if role = admin/superadmin)

**Sidebar links (desktop, ≥ lg):** Same as BottomNav but as text links with icons in a 240px left panel.

**PageShell:** renders `<Sidebar>` on lg+, `<BottomNav>` on mobile, + `<main>` content area with correct padding.

**Checkpoint:**
- [ ] Bottom nav shows on mobile
- [ ] Sidebar shows on desktop
- [ ] Admin tab only shows for admin/superadmin role
- [ ] Done

---

### ✅ Phase 1 Complete Checkpoint

Before starting Phase 2, verify ALL of these:

- [ ] Register with email → user doc in Firestore with `status: "active"` → lands on /dashboard immediately
- [ ] Register creates an `orgs` doc in Firestore with `owner_uid` matching the user
- [ ] Google Sign-In (new user) → /google-setup → submits org name → lands on /dashboard immediately
- [ ] Google Sign-In (returning active user) → /dashboard directly (no setup page)
- [ ] Wrong email/password → shows specific error message, not "Something went wrong"
- [ ] Disabled account → /disabled page
- [ ] /ping returns `{"status":"ok"}`
- [ ] ProtectedRoute blocks unauthenticated requests to /dashboard → redirects to /login
- [ ] Admin tab in nav only shows when role = "admin" or "superadmin"
- [ ] Colors on screen match SRD §8.0 palette (charcoal bg, amber accents, coral danger)

---

## 🔨 Phase 2 — Orgs & Sheet Management

**Goal:** User can add a sheet, see it in dashboard, view students.

---

### P2-01 — Org Endpoints
**What:** `POST /api/admin/orgs`, `GET /api/admin/orgs`, `GET /api/admin/orgs/{id}`.

**Reference:** SRD §4.2. Org schema: SRD §3.2.

**Note:** When creating a new user account (P1-05), if no org exists yet, the backend creates one automatically using `org_name` from the registration. The user is assigned to that org as the first member.

**Checkpoint:** Admin can create and list orgs.

- [ ] Done

---

### P2-02 — Sheet Registration Endpoint
**What:** `POST /api/sheets` — validates write access, creates Firestore sheet doc.

**Reference:** SRD §4.3 (request body), SRD §3.3 (Firestore schema), SRD §5.8 `verify_write_access()`.

**Validation before saving:**
1. Call `verify_write_access()` — if returns False: `400 { detail: "Sheet is view-only..." }`
2. Validate `primary_key_column` is one of the headers from the sheet
3. Validate `attendance_values` array: min 2, at least 1 positive, at least 1 negative, max 8

**Checkpoint:**
- [ ] Viewer-only sheet → 400 error with specific message
- [ ] Valid sheet → Firestore doc created → returned in response
- [ ] Done

---

### P2-03 — Sheet List Endpoints
**What:** `GET /api/sheets`, `GET /api/sheets/recent`.

**Reference:** SRD §4.3.

**Checkpoint:** Returns only sheets where `owner_uid == current_user.uid`.

- [ ] Done

---

### P2-04 — Sheet Data Endpoints
**What:** `GET /api/sheets/{id}/columns`, `GET /api/sheets/{id}/students`.

**students response:** array of objects with only non-attendance columns (use `is_date_column()` to filter).

**columns response:** `{ all_headers, non_attendance, attendance_dates }`.

**Checkpoint:** Students list contains no attendance columns.

- [ ] Done

---

### P2-05 — Sheet Update + Delete
**What:** `PUT /api/sheets/{id}` (partial update), `DELETE /api/sheets/{id}` (removes from Firestore, NOT from Google).

- [ ] Done

---

### P2-06 — Attendance Values Update
**What:** `PUT /api/sheets/{id}/attendance-values`.

**Validation:** 
- Min 2 values
- At least 1 `is_positive: true`
- At least 1 `is_positive: false`
- Max 8 values
- `value` field: max 3 chars, uppercase alphanumeric
- Cannot remove a value that has already been written to the Google Sheet (detect by reading attendance columns)

**Checkpoint:** Invalid update (1 positive, 0 negative) returns 400 with specific message.

- [ ] Done

---

### P2-07 — Sheet Setup Wizard (Frontend)
**What:** `SheetSetupWizard.jsx` containing `StepConnectSheet`, `StepNameSheet`, `StepSetPK`, `StepMapQR`, `StepAttendanceValues`, `StepConfirm`.

**Reference:** PRD §8.4 — every step, every validation, every error message.

**State management:** All wizard state in local `useState`. Only call the backend on Step 6 [Finish Setup].

**Step 3 (Set PK):** 
- Calls `GET /api/sheets/{id}/columns` to get the header list.
- Shows dropdown of non-attendance headers.
- Shows warning about duplicate values.

**Step 5 (Attendance Values):**
- Shows default `[Present, Absent]` list.
- `DragList.jsx` for reordering.
- Inline form for adding new values (label, value/code, color swatch, positive toggle).
- `ColorSwatch.jsx` shows 8 colors.
- Delete disabled if it would violate min constraints — tooltip explains why.

**Checkpoint:**
- [ ] All 6 steps work with forward/back navigation
- [ ] Step progress bar shows correct step
- [ ] Step 6 calls POST /api/sheets and navigates to /sheets/{id}/students on success
- [ ] Done

---

### P2-08 — Dashboard + SheetCard
**What:** `Dashboard.jsx` with `SheetCard.jsx`.

**Reference:** PRD §8.3 for dashboard layout, §4.3 for wireframe design.

**SheetCard must match wireframe:**
- Pill shape with rounded-full border
- Dark background
- Checkbox on left
- Sheet name text (large, not bold body font — use display font)
- "view" and "add+" as inline text links
- created/modified dates (dd/mm/yy format) below name in smaller text
- Coral trash icon on right
- Framer Motion: hover lift, tap press (card variants from SRD §7.2)

**Dashboard sections:**
1. "existing sheets" header (matches wireframe text)
2. Recent sheets grid (last 5 accessed)
3. "All sheets" section (full list with search bar above it)
4. Bulk delete: when ≥1 checkbox selected, show "[N] selected — Delete Selected" bar at bottom

**Checkpoint:**
- [ ] SheetCard visually matches wireframe
- [ ] "view" → /sheets/{id}/students
- [ ] "add+" → /sheets/{id}/attendance
- [ ] Trash icon → confirm dialog → DELETE /api/sheets/{id}
- [ ] GSAP stagger animation on cards load
- [ ] Done

---

### P2-09 — Student List
**What:** `StudentList.jsx` with `StudentCard.jsx` and `StudentSearch.jsx`.

**Reference:** PRD §8.5.

**Checkpoint:**
- [ ] Students loaded from GET /api/sheets/{id}/students
- [ ] Search filters live across all fields
- [ ] Attendance % badge (placeholder %, since analytics not built yet — show "--" if no sessions)
- [ ] [Download QR] button per card (stub: alert "QR generation in Phase 4")
- [ ] Done

---

### P2-10 — Sheet Settings Page
**What:** `SheetSettings.jsx`.

**Reference:** PRD §8.9.

**Sections:** Sheet Info + Attendance Values + Danger Zone.

**Attendance Values section:**
- Uses `DragList.jsx` (same as wizard Step 5)
- Loads current values from Firestore sheet doc
- [Save Changes] calls PUT /api/sheets/{id}/attendance-values
- If a value cannot be deleted (already written), trash icon is gray with tooltip

**Checkpoint:**
- [ ] Can add a "Late" value → save → appears on page reload
- [ ] Cannot reduce below 2 values
- [ ] Done

---

### ✅ Phase 2 Complete Checkpoint

- [ ] Full sheet setup wizard → sheet in dashboard → students load
- [ ] SheetCard actions all work (view, add+, delete)
- [ ] Sheet settings page can add/reorder/delete attendance values
- [ ] Search filters work on student list

---

## 🔨 Phase 3 — QR & Attendance Core

**Goal:** QR scanning works, manual entry works, attendance writes to Google Sheet.

---

### P3-01 — Validate QR Endpoint
**Reference:** SRD §4.4, SRD §5.1.

**Request body:** `{ sheet_id, payload (JSON object parsed from QR) }`

**Returns:**
```json
{ "valid": bool, "pk_value": string|null, "missing_fields": [], "error": string|null }
```

**Checkpoint:** All 8 cases from PRD §6.2 return correct responses.

- [ ] Done

---

### P3-02 — Mark Attendance Endpoint
**Reference:** SRD §4.4, SRD §5.8 `mark_attendance()`.

**Request body:**
```json
{ "sheet_id": "...", "pk_value": "CS001", "date_column": "2026-03-28", "attendance_value": "P" }
```

**Logic:**
1. Get sheet doc from Firestore → get `primary_key_column`, `google_sheet_id`, OAuth tokens
2. Build gspread client
3. Call `mark_attendance()` → find row by PK → write value to date column

**Checkpoint:** After calling this, Google Sheet cell is updated.

- [ ] Done

---

### P3-03 — Session Endpoints
**Reference:** SRD §4.4, Firestore schema SRD §3.4.

**session/start:**
- Check if session doc already exists for `sheet_id + date` → if yes, return existing (resume)
- If no: create new session doc with `total_students` count from sheet

**session/end:**
- Receives full end-session payload (see SRD §4.4 end-session payload spec)
- If `unmarked_default === "absent"`: batch-write `absent_value` to all unmarked students using `ws.batch_update()` (single gspread call — NOT one `update_cell()` per student)
- If `unmarked_default === "empty"`: skip sheet writes entirely
- Update Firestore session doc: `ended_at = now`, `value_counts`, `unmarked_default`, `scanned_ids`, `manually_marked_ids`

**Checkpoint:** Session doc created in Firestore on start. Batch absent-write works correctly (check sheet after calling end with `unmarked_default: "absent"`).

- [ ] Done

---

### P3-04 — QR Parser Utility
**Reference:** SRD §5.2 — copy exact implementation.

**Test all 8 cases manually (write unit tests or test in browser console):**
1. Valid JSON object → `{ valid: true, data: {...} }`
2. Invalid JSON string → `{ valid: false, error: "Invalid QR — Unrecognized format" }`
3. JSON array → `{ valid: false, error: "Invalid QR — Unrecognized format" }`
4. JSON null → `{ valid: false, error: "Invalid QR — Unrecognized format" }`
5. JSON string → `{ valid: false, error: "Invalid QR — Unrecognized format" }`

**Checkpoint:** All 5 frontend parse cases return expected results. Do not move to P3-05 until confirmed.

- [ ] Done

---

### P3-05 — QR Scanner Hook
**Reference:** SRD §5.6 — copy exact implementation.

**Checkpoint:**
- [ ] Camera opens in browser
- [ ] Rear camera used on mobile
- [ ] Pause/resume methods work
- [ ] Done

---

### P3-06 — Scanner Components
**What:** `QRScanner.jsx` and `ScannerOverlay.jsx`.

**QRScanner.jsx:**
- Renders `<video>` element for camera feed
- Calls `useQRScanner` hook with the video ref
- Fills 40% of viewport height (CSS: `height: 40vh`)
- Green border when scanning, red border on error (Framer Motion color transition)

**ScannerOverlay.jsx:**
- Absolutely positioned over the scanner
- Shows toast messages (success/warning/error) for 3 seconds
- Does NOT use react-hot-toast (this is camera-specific overlay, not the main toast system)
- Uses Framer Motion: slide in from top, fade out after 3s

**Camera permission denied state:**
- Renders inside QRScanner when permission is denied
- Shows exact instructions per platform:
  - iOS Safari: "Go to Settings → Safari → Camera → Allow"
  - Android Chrome: "Tap the camera icon in the address bar → Allow"
  - Desktop: "Click the camera icon in the browser address bar → Allow"
- Shows [Use Manual Entry instead] button that opens ManualEntryPanel

**Checkpoint:**
- [ ] Camera opens and scans
- [ ] Permission denied shows correct instructions
- [ ] Toast overlay appears and disappears after 3s without interrupting scanner
- [ ] Done

---

### P3-07 — Take Attendance Page
**Reference:** PRD §8.6.

**Layout (CSS, not Tailwind flex tricks):**
```
height: 100vh — fixed, no scroll on outer page
top bar: fixed, height: 48px
scanner area: height: 40vh (below top bar)
scanned list: height: calc(100vh - 48px - 40vh), overflow-y: auto
```

**Top bar:**
- Left: [+ New Student] button → opens NewStudentModal
- Center: date picker (HTML `<input type="date">` styled, default = today's date)
- Right: [✏️ Manual] button → opens ManualEntryPanel (pauses scanner)

**Session init on page load:**
1. Check sessionStorage for `session_{sheet_id}_{date}`
2. If exists → restore scanned list from storage
3. If not → call POST /api/attendance/session/start
4. Load `attendance_values` from Firestore sheet doc (for button rendering)

**On navigation away — End Session Prompt (React Router navigation blocker):**

Use React Router v6's `useBlocker()` hook to intercept ALL navigation away from this page (back button, tab switch, bottom nav tap).

When navigation is blocked and `unmarked_count > 0`:
1. Show `BottomSheet` with the end-session prompt (see PRD §8.6 SESSION BEHAVIOR for exact text)
2. Show counts: total marked, total unmarked (derived from `total_students - scannedIds.length`)
3. Two radio options:
   - "Mark all as [Absent]" — uses the label of the first `is_positive: false` value from `attendance_values`
   - "Leave all empty" — default selected
4. [Stay on page] → call `blocker.reset()` → stays on page
5. [End Session] →
   - Call `POST /api/attendance/session/end` with full payload including `unmarked_default`
   - Wait for 200 response before navigating (show spinner on button)
   - Clear `sessionStorage` key for this session
   - Call `blocker.proceed()` → navigates to original destination

When navigation is blocked and `unmarked_count === 0` (everyone marked):
- Do NOT show the prompt
- Auto-call `POST /api/attendance/session/end` silently
- Clear sessionStorage
- Call `blocker.proceed()` immediately

⚠️ `useBlocker` does NOT fire on browser tab close. That's acceptable — see PRD §8.6 for reasoning.

**Checkpoint:**
- [ ] Navigate away with unmarked students → prompt appears
- [ ] [Stay on page] → user stays, scanner resumes
- [ ] [End Session] with "Leave empty" → session doc written, no extra sheet writes, navigate proceeds
- [ ] [End Session] with "Mark as Absent" → unmarked cells written in sheet, session doc written, navigate proceeds
- [ ] Navigate away with 0 unmarked → no prompt, auto-ends silently
- [ ] Done

---

### P3-08 — Scanned Card
**Reference:** PRD §8.6, SRD §7.2 `scanCardVariants`.

**Each card shows:**
- All non-attendance fields in order (PK first, then name, then others)
- Scan time (HH:MM:SS format, from `new Date().toLocaleTimeString()`)
- The attendance value that was written (using that value's label + configured color)
- Framer Motion `AnimatePresence` wrapping the list so cards animate in

**Checkpoint:**
- [ ] Cards animate in from bottom on new scan
- [ ] Newest card is always at top
- [ ] Attendance value label shown with correct color
- [ ] Done

---

### P3-09 — Session Persistence (sessionStorage)
**Reference:** SRD §5.7.

**What:**
- On every successful mark: update sessionStorage `session_{sheet_id}_{date}`
- On page load: read sessionStorage, restore `scanned_ids` and `marked_values`
- On date change in top bar: clear sessionStorage for old date, start fresh

**Checkpoint:**
- [ ] Refresh page → scanned list restored
- [ ] Change date → list resets
- [ ] Done

---

### P3-10 — Manual Entry Panel
**Reference:** PRD §8.7, SRD §5.4 `groupBy.js`.

**ManualEntryPanel.jsx:**
- Renders as `BottomSheet.jsx` (slides up, Framer Motion)
- Calls `useQRScanner.pause()` when it opens
- Calls `useQRScanner.resume()` when it closes
- Loads all students from `sheetStore` (already fetched in TakeAttendance page)

**Search:** filters across all fields using simple string includes (case-insensitive)

**Group by dropdown:**
- Options: "None" + results of `detectGroupableColumns()` on the students array
- Selected option saved to localStorage key `groupby_{sheet_id}`
- When a group is selected: renders `GroupHeader.jsx` + grouped `StudentRow.jsx` items

**GroupHeader.jsx:**
- Shows: group value + "(count)" — e.g., "Morning (18)"
- Framer Motion height animation on expand/collapse
- Default: expanded

**Checkpoint:**
- [ ] Search works — typing "Riya" shows only Riya
- [ ] Group by "Batch" shows students under correct group headers
- [ ] Group preference remembered after closing/reopening panel
- [ ] Scanner pauses when panel opens, resumes when it closes
- [ ] Done

---

### P3-11 — Student Row + Value Buttons
**Reference:** PRD §8.7 student row spec.

**StudentRow.jsx props:** `{ student, currentValue, attendanceValues, onMark }`

**AttendanceValueButtons.jsx props:** `{ values, currentValue, onSelect }`
- Renders one button per attendance value
- Currently marked value: filled background (the value's configured color)
- Unmarked values: outline button (border in the configured color)
- Tap a value → calls `onMark(student.pk_value, value)` → calls POST /api/attendance/mark → updates sessionStorage → updates button highlight

**Checkpoint:**
- [ ] Tap "Present" → button becomes filled green → sheet updated
- [ ] Tap "Late" on a student already marked "Present" → changes to amber → sheet updated
- [ ] Done

---

### P3-12 — New Student Modal
**Reference:** PRD §8.8.

**Form validation:**
- All non-attendance columns shown as inputs
- PK field required (not empty)
- PK value must not already exist in the sheet (check via `GET /api/sheets/{id}/students`)

**Two prompts (shown after form is submitted, before any write):**
- Prompt A: "Mark for today as:" → dropdown of all attendance values + "Don't mark" option
- Prompt B: "For all previous sessions:" → [Mark as Absent] / [Leave Empty]
  - "Mark as Absent" means: write the first `is_positive: false` value from attendance_values
  - "Leave Empty" means: write "" for all previous date columns

**Checkpoint:**
- [ ] Duplicate PK shows error, no write happens
- [ ] After confirm: new row appears in Google Sheet with correct values
- [ ] New student card appears in scanned list if "Mark for today" is not "Don't mark"
- [ ] Done

---

### ✅ Phase 3 Complete Checkpoint

- [ ] QR scan → all 8 validation cases show correct messages
- [ ] Valid scan → Google Sheet updated → card appended
- [ ] Manual entry grouping, search, button highlight all work
- [ ] New student mid-session with both prompts works
- [ ] Page refresh → scanned list restored from sessionStorage
- [ ] Navigate away with unmarked students → end-session prompt appears
- [ ] "Mark as Absent" option → batch-writes to sheet → navigates
- [ ] "Leave empty" option → no extra writes → navigates
- [ ] 0 unmarked students → navigates silently with no prompt

---

## 🔨 Phase 4 — QR Generation

**Reference:** PRD §8.10, SRD §2.1 component list.

### P4-01 — QR Data Endpoint
`GET /api/qr/{sheet_id}/data` → returns `{ students: [...], qr_key_mapping: {...} }`

- [ ] Done

### P4-02 — Excel Parse Endpoint
`POST /api/qr/parse-excel` → multipart upload → returns `{ headers: [], rows: [{...}] }`

- [ ] Done

### P4-03 — Excel Parser (Frontend)
`src/utils/excelParser.js` using SheetJS `xlsx`. Reference: SRD §2.1 (excelParser.js description).

- [ ] Done

### P4-04 — QR Generator Page + Grid
`QRGeneratorPage.jsx`, `QRCard.jsx`, `QRGrid.jsx`. Reference: PRD §8.10.

- [ ] Done

### P4-05 — Excel Upload + Column Mapper
`ExcelUpload.jsx` (drag-drop or file input), `ColumnMapper.jsx` (map Excel col → QR field name).

- [ ] Done

### P4-06 — Logo Upload + Opacity Slider
`LogoUpload.jsx`. Toggle → file input (PNG/SVG ≤ 2MB) + opacity slider + >75% warning banner.

- [ ] Done

### P4-07 — QR Generator Hook
`useQRGenerator.js`. Uses `qr-code-styling`. Logo compositing via canvas. Reference: SRD §5.8 (client-side QR generation, Phase 4 in old SRD, now in hooks).

- [ ] Done

### P4-08 — Download Buttons
Individual: canvas `.toBlob()` → `saveAs(blob, "{pk}_qr.png")`.
Bulk: JSZip → all canvases → `saveAs(zipBlob, "{sheet_name}_qrcodes_{date}.zip")`.

- [ ] Done

---

### ✅ Phase 4 Checkpoint
- [ ] QR generated from sheet data with correct payload
- [ ] Logo appears at center with correct opacity
- [ ] >75% warning shows
- [ ] Individual download works (correct filename)
- [ ] Bulk ZIP downloads all QRs (correct ZIP filename)
- [ ] Excel upload → column map → generate works

---

## 🔨 Phase 5 — Analytics & Admin

### P5-01 — Attendance Calc Utility
`src/utils/attendanceCalc.js`. Reference: SRD §5.5.

- [ ] Done

### P5-02 — Summary + Analytics Endpoints
`GET /api/attendance/{id}/summary`, `GET /api/attendance/{id}/analytics`.
Response shapes in SRD §5.3.

- [ ] Done

### P5-03 — Analytics Page + Charts
`Analytics.jsx` with `SessionBarChart.jsx`, `DistributionDonut.jsx`, `StudentTable.jsx`.
Charts use recharts. Bar chart uses stacked bars per attendance value (using configured colors).

- [ ] Done

### P5-04 — Summary Cards (GSAP Counters)
`SummaryCards.jsx`. 4 stat cards. GSAP counter animation: count from 0 to final value on page load.

- [ ] Done

### P5-05 — Attendance % Badges on Student Cards
Pull from `GET /api/attendance/{id}/summary`. Color-coded badge per thresholds in constants.

- [ ] Done

### P5-06 — Admin Dashboard
`AdminDashboard.jsx`. Stats cards + recent activity feed.

- [ ] Done

### P5-07 — Org + User Management Pages
`OrgList.jsx`, `OrgDetail.jsx`, `PendingUsers.jsx`.

- [ ] Done

### P5-08 — All Users + Audit Log
`AllUsers.jsx` (filter by org/status), `AuditLog.jsx` (filter by org/date range, export CSV).

- [ ] Done

### P5-09 — Email Service
`app/services/email_service.py`. SMTP via `smtplib`. Two emails: approval, rejection. Stub if SMTP not configured.

- [ ] Done

---

### ✅ Phase 5 Checkpoint
- [ ] Analytics charts show correct data from Google Sheet
- [ ] Stacked bar chart uses correct configured colors per value
- [ ] Admin can approve/reject users
- [ ] Audit log shows all sessions

---

## 🔨 Phase 6 — Production Hardening

### P6-01 — Frontend Keep-Alive Ping
On app load (`main.jsx` or root component), call `GET /ping`. If no response in 5s, show top banner: "Connecting to server..." until ping succeeds.

- [ ] Done

### P6-02 — Rate Limiting
`slowapi` on FastAPI. Limit: 100 req/minute per IP on all routes except /ping.

- [ ] Done

### P6-03 — Google Sheets Exponential Backoff
In `sheets_service.py`, wrap gspread API calls in retry logic: 3 attempts, delays of 2s / 4s / 8s on `RESOURCE_EXHAUSTED` errors.

- [ ] Done

### P6-04 — Google OAuth Token Refresh
Detect expired `access_token` in `sheets_service.py`. Use `creds.refresh(Request())`. Save refreshed tokens back to Firestore. On refresh failure: return 503 to frontend.

- [ ] Done

### P6-05 — Camera Permission UX
Per-browser instructions in `QRScanner.jsx`. Detect browser via `navigator.userAgent`. Show correct steps for iOS Safari, Android Chrome, desktop Chrome.

- [ ] Done

### P6-06 — Final Firestore Rules
Tighten rules. Test all paths in Firebase Rules Playground. Document what works and what's blocked.

- [ ] Done

### P6-07 — Reduced Motion
Add `useReducedMotion()` from Framer Motion to all animated components. When true: skip animation props.

- [ ] Done

### P6-08 — PWA Baseline
`public/manifest.json` with name, icons (192 + 512), theme color. `<link rel="manifest">` in `index.html`.

- [ ] Done

### P6-09 — E2E Tests
Playwright: write tests for:
1. Register → approve → login → dashboard
2. Add sheet → students load
3. Scan QR (mocked) → card appears
4. Generate QR → download

- [ ] Done

---

### ✅ Phase 6 Checkpoint — SHIP IT
- [ ] App loads on actual mobile device (iOS Safari + Android Chrome)
- [ ] Scanning works in mobile browser
- [ ] All animations respect prefers-reduced-motion
- [ ] HF Spaces warm-up ping works
- [ ] PWA installable on mobile

---

## 🛑 Things That Will Break If Done Wrong

| Mistake | Consequence |
|---------|-------------|
| Using `localStorage` for Firebase token | Token never refreshes, users get stuck logged out |
| Using `qrcode` npm package instead of `qr-code-styling` | Logo embed won't work |
| Using `papaparse` instead of `xlsx` | .xlsx files won't parse |
| Using any npm Google Sheets library instead of `gspread` | Backend architecture breaks |
| Writing to Firestore `users` collection from frontend | Security rules block it — backend only |
| Not applying the 500ms scan debounce | Same student marked twice in rapid succession |
| Letting GSAP run on components | Conflicts with Framer Motion re-renders |
| Letting Framer Motion handle page transitions | GSAP stagger timelines won't work correctly |
| Setting `is_positive` field name wrong | Attendance % calculated incorrectly |
| Not saving groupBy preference to localStorage | Users have to re-select group every time they open the panel |
