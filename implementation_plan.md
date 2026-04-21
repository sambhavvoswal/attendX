# Backend Security & Privilege Hardening Plan

After a thorough audit of the user role logic and backend routers as per your request, I identified two massive architectural security loopholes introduced during our rapid growth phase that severely compromise your new multi-tenancy rules. 

I've outlined precisely how we will permanently seal them to make the engine bulletproof.

## Proposed Changes

### Component: Core Authentication Matrix

#### [MODIFY] [dependencies.py](file:///d:/learn2code/Projects/QR-based%20attendance%20systam/attendx-backend/app/dependencies.py)

**Vulnerability**: The "Ghost Resident" Loophole. The current master dependency (`get_current_user`) verifies that a Google/Email token exists, but it blindly ignores checking the `status` flag! While the React frontend forcefully bounces unapproved users to `/pending-approval`, an unapproved user can easily bypass the UI and fire raw REST commands via Postman or CURL to `/api/sheets` and successfully manipulate your database!
**Fix**: 
- Introduce a strict, top-level `require_active_user` dependency that explicitly throws a `403 Forbidden` if a user's status is `pending_approval` or `disabled`.
- Introduce a `require_active_admin` wrapper for the Admin module routes.

### Component: Database Endpoints (Horizontal Privilege Isolation)

#### [MODIFY] [sheets.py](file:///d:/learn2code/Projects/QR-based%20attendance%20systam/attendx-backend/app/routers/sheets.py)
#### [MODIFY] [attendance.py](file:///d:/learn2code/Projects/QR-based%20attendance%20systam/attendx-backend/app/routers/attendance.py)

**Vulnerability**: Insecure Direct Object Reference (IDOR). While the `DELETE` and `PUT` endpoints safely check ownership, multiple "read" and "post" endpoints (like `GET /{sheet_id}/students`, `GET /{sheet_id}/analytics`, `POST /session/start`) look up the sheet using the raw `sheet_id` string and immediately execute operations without asserting horizontal access. If a clever user in Organization A obtains or guesses a `sheet_id` for Organization B, they can view rosters, generate attendance links, and download analytical data.
**Fix**: 
- Step through every single route. Inject harsh assertions (`if sheet["owner_uid"] != current_user["uid"]`) to guarantee cryptographically secure boundary restrictions at the API edge.
- Mass-replace `Depends(get_current_user)` with the new impenetrable `Depends(require_active_user)` across these routers to lock out unapproved users natively.

### Component: Governance Operations (CodeRabbit Review Fixes)

#### [MODIFY] [admin.py](file:///d:/learn2code/Projects/QR-based%20attendance%20systam/attendx-backend/app/routers/admin.py)
**Vulnerability**: Potential gracefully failing crashes in automated emails if Google Auth profiles lack an email field.
**Fix**: Add an exact check `if updated and updated.get("email"):` before invoking `send_approval_email()` or `send_rejection_email()`.

#### [MODIFY] [email_service.py](file:///d:/learn2code/Projects/QR-based%20attendance%20systam/attendx-backend/app/services/email_service.py)
**Vulnerability**: HTML Injection Risks (XSS variants) within transactional emails depending on the input injected into `org_name`.
**Fix**: Import `html.escape` and definitively escape any `org_name` or `role` input before directly interpolating it into the `html_content` block.

### Component: Frontend React Routing

#### [MODIFY] [PendingApproval.jsx](file:///d:/learn2code/Projects/QR-based%20attendance%20systam/attendx-frontend/src/pages/PendingApproval.jsx)
**Vulnerability**: Rendering Cycle conflicts causing React warnings (`Maximum update depth exceeded` exceptions) by directly calling `navigate()` inside the render body if the state evaluates differently.
**Fix**: Extract the redirect navigation into a decoupled `useEffect` logic hook.

---

> [!WARNING]
> **Important Note:** I will NOT apply `require_active_user` to the `/api/auth/me` endpoint. That specific endpoint must remain accessible so the React UI can dynamically discover that the user is "pending_approval" and lock them into the Waiting Room visually!

## User Review Required
Please review my findings. Let me know if you would like me to harden specific sheet ownership per `owner_uid` (meaning each individual user owns their own sheets only) or expand it to `org_id` (meaning any active user inside an Organization can read/view sheets created by any other member of their Organization). Currently, the platform assumes strict 1:1 `owner_uid` ownership. I will proceed with 1:1 strict `owner_uid` ownership tracking unless you specify otherwise!
