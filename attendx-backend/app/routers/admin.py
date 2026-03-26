"""
AttendX — Admin Router
Handles user approval, rejection, org management, and admin operations.
API paths per SRD §4.2.
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from datetime import datetime, timezone
from typing import Optional

from app.dependencies import require_admin
from app.services.firebase_service import (
    get_user_doc, update_user_doc, delete_user_doc,
    get_users_by_status, get_all_users,
    create_org_doc, get_org_doc, get_orgs_by_admin,
    update_org_doc, delete_org_doc,
)
from app.services.email_service import send_approval_email, send_rejection_email
from app.schemas.user import UserListItem
from app.schemas.org import (
    OrgCreateRequest, OrgUpdateRequest, OrgResponse, OrgListItem
)

router = APIRouter(prefix="/api/admin", tags=["Admin"])


# ──────────────────────────────────────────────
# Org Management
# ──────────────────────────────────────────────

@router.get("/orgs", response_model=list[OrgListItem])
async def list_orgs(admin: dict = Depends(require_admin)):
    """List all orgs managed by this admin."""
    orgs = get_orgs_by_admin(admin["uid"])
    return [OrgListItem(**org) for org in orgs]


@router.post("/orgs", response_model=OrgResponse)
async def create_org(req: OrgCreateRequest, admin: dict = Depends(require_admin)):
    """Create a new org."""
    now = datetime.now(timezone.utc).isoformat()
    org_data = {
        "name": req.name,
        "description": req.description or "",
        "admin_uid": admin["uid"],
        "created_at": now,
        "member_count": 0,
        "sheet_count": 0,
    }
    org_id = create_org_doc(org_data)
    return OrgResponse(org_id=org_id, **org_data)


@router.get("/orgs/{org_id}", response_model=OrgResponse)
async def get_org(org_id: str, admin: dict = Depends(require_admin)):
    """Get org detail."""
    org = get_org_doc(org_id)
    if not org:
        raise HTTPException(status_code=404, detail="Org not found")

    # Ensure admin owns this org (unless superadmin)
    if admin["role"] != "superadmin" and org["admin_uid"] != admin["uid"]:
        raise HTTPException(status_code=403, detail="Not your org")

    return OrgResponse(**org)


@router.put("/orgs/{org_id}", response_model=OrgResponse)
async def update_org(
    org_id: str, req: OrgUpdateRequest, admin: dict = Depends(require_admin)
):
    """Update org name/description."""
    org = get_org_doc(org_id)
    if not org:
        raise HTTPException(status_code=404, detail="Org not found")

    if admin["role"] != "superadmin" and org["admin_uid"] != admin["uid"]:
        raise HTTPException(status_code=403, detail="Not your org")

    updates = {}
    if req.name is not None:
        updates["name"] = req.name
    if req.description is not None:
        updates["description"] = req.description

    if updates:
        update_org_doc(org_id, updates)

    return OrgResponse(**{**org, **updates})


@router.delete("/orgs/{org_id}")
async def delete_org(org_id: str, admin: dict = Depends(require_admin)):
    """Delete org (with confirmation assumed on frontend)."""
    org = get_org_doc(org_id)
    if not org:
        raise HTTPException(status_code=404, detail="Org not found")

    if admin["role"] != "superadmin" and org["admin_uid"] != admin["uid"]:
        raise HTTPException(status_code=403, detail="Not your org")

    delete_org_doc(org_id)
    return {"message": "Org deleted"}


# ──────────────────────────────────────────────
# User Approval / Rejection
# ──────────────────────────────────────────────

@router.get("/pending", response_model=list[UserListItem])
async def list_pending(admin: dict = Depends(require_admin)):
    """List all pending users across all managed orgs."""
    pending = get_users_by_status("pending")
    return [UserListItem(**u) for u in pending]


@router.post("/approve/{uid}")
async def approve_user(uid: str, admin: dict = Depends(require_admin)):
    """Approve a pending user — activates account + sends email."""
    user = get_user_doc(uid)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user["status"] != "pending":
        raise HTTPException(status_code=400, detail="User is not pending")

    now = datetime.now(timezone.utc).isoformat()
    update_user_doc(uid, {
        "status": "active",
        "approved_at": now,
        "approved_by": admin["uid"],
    })

    # Send approval email (non-blocking — don't fail if email fails)
    try:
        send_approval_email(user["email"], user["name"])
    except Exception:
        pass  # Log this in production

    return {"message": f"User {uid} approved", "status": "active"}


@router.post("/reject/{uid}")
async def reject_user(
    uid: str,
    reason: Optional[str] = Query(None),
    admin: dict = Depends(require_admin),
):
    """Reject a pending user with optional reason — sends email."""
    user = get_user_doc(uid)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user["status"] != "pending":
        raise HTTPException(status_code=400, detail="User is not pending")

    update_user_doc(uid, {"status": "disabled"})

    # Send rejection email
    try:
        send_rejection_email(user["email"], user["name"], reason)
    except Exception:
        pass

    return {"message": f"User {uid} rejected", "status": "disabled"}


# ──────────────────────────────────────────────
# User Management
# ──────────────────────────────────────────────

@router.get("/users", response_model=list[UserListItem])
async def list_users(
    org_id: Optional[str] = Query(None),
    admin: dict = Depends(require_admin),
):
    """All users, filterable by org_id."""
    users = get_all_users(org_id=org_id)
    return [UserListItem(**u) for u in users]


@router.put("/users/{uid}/disable")
async def disable_user(uid: str, admin: dict = Depends(require_admin)):
    """Disable a user."""
    user = get_user_doc(uid)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    update_user_doc(uid, {"status": "disabled"})
    return {"message": f"User {uid} disabled"}


@router.delete("/users/{uid}")
async def delete_user(uid: str, admin: dict = Depends(require_admin)):
    """Delete a user."""
    user = get_user_doc(uid)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    delete_user_doc(uid)
    return {"message": f"User {uid} deleted"}


@router.put("/users/{uid}/move-org")
async def move_user_org(
    uid: str,
    org_id: str = Query(...),
    admin: dict = Depends(require_admin),
):
    """Move user to a different org."""
    user = get_user_doc(uid)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    org = get_org_doc(org_id)
    if not org:
        raise HTTPException(status_code=404, detail="Target org not found")

    update_user_doc(uid, {"org_id": org_id, "org_name": org["name"]})
    return {"message": f"User {uid} moved to org {org_id}"}
