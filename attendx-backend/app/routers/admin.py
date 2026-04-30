from fastapi import APIRouter, Depends, HTTPException
from typing import List, Optional

from app.schemas.user import UserResponse, UserRoleUpdate
from app.schemas.org import OrgCreate, OrgUpdate, OrgResponse
from app.dependencies import require_admin, require_superadmin
from app.services.firebase_service import (
    get_users, get_user_doc, update_user_status, update_user_role_and_org,
    get_orgs, get_org, update_org, delete_org, create_org_doc, now_ts
)
from app.services.email_service import send_approval_email, send_rejection_email

router = APIRouter(prefix="/api/admin", tags=["admin"])

@router.get("/users")
async def list_users(org_id: Optional[str] = None, status: Optional[str] = None, current_user: dict = Depends(require_admin)):
    # Org admins can only see their own org's users
    if current_user["role"] == "org_admin":
        if org_id and org_id != current_user["org_id"]:
            raise HTTPException(status_code=403, detail="Cannot query users for a different organization")
        org_id = current_user["org_id"]
        
    users = get_users(org_id=org_id, status=status)
    return users

@router.put("/users/{uid}/disable")
async def disable_user(uid: str, current_user: dict = Depends(require_admin)):
    user = get_user_doc(uid)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    if current_user["role"] == "org_admin" and current_user["org_id"] != user.get("org_id"):
        raise HTTPException(status_code=403, detail="Cannot disable user for a different organization")
        
    # Prevent disabling super admins or oneself
    if user.get("role") == "super_admin" or uid == current_user["uid"]:
        raise HTTPException(status_code=403, detail="Cannot disable this administrative account")

    updated = update_user_status(uid, "disabled", disabled_by=current_user["uid"])
    return {"uid": uid, "status": "disabled"}

@router.put("/users/{uid}/enable")
async def enable_user(uid: str, current_user: dict = Depends(require_admin)):
    user = get_user_doc(uid)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    if current_user["role"] == "org_admin" and current_user["org_id"] != user.get("org_id"):
        raise HTTPException(status_code=403, detail="Cannot enable user for a different organization")

    updated = update_user_status(uid, "active")
    return {"uid": uid, "status": "active"}

@router.put("/users/{uid}/approve")
async def approve_user(uid: str, current_user: dict = Depends(require_admin)):
    user = get_user_doc(uid)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    # Org admin restriction
    if current_user["role"] == "org_admin" and current_user["org_id"] != user.get("org_id"):
        raise HTTPException(status_code=403, detail="Cannot approve user for a different organization")

    updated = update_user_status(uid, "active")
    if updated and updated.get("email"):
        org_name = updated.get("org_name", "your organization")
        send_approval_email(updated.get("email"), org_name, updated.get("role", "user"))
        
    return {"uid": uid, "status": "active"}

@router.put("/users/{uid}/reject")
async def reject_user(uid: str, current_user: dict = Depends(require_admin)):
    user = get_user_doc(uid)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    # Org admin restriction
    if current_user["role"] == "org_admin" and current_user["org_id"] != user.get("org_id"):
        raise HTTPException(status_code=403, detail="Cannot reject user for a different organization")

    updated = update_user_status(uid, "rejected")
    if updated and user.get("email"):
        org_name = user.get("org_name", "your organization")
        send_rejection_email(user.get("email"), org_name)
        
    return {"uid": uid, "status": "rejected"}

@router.put("/users/{uid}/update-role")
async def update_user_role(uid: str, payload: UserRoleUpdate, current_user: dict = Depends(require_superadmin)):
    target_org = get_org(payload.org_id)
    if not target_org:
        raise HTTPException(status_code=404, detail="Target organization not found")
        
    user = update_user_role_and_org(uid, payload.role, payload.org_id, target_org["name"])
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.post("/orgs")
async def create_org(payload: OrgCreate, current_user: dict = Depends(require_admin)):
    org = create_org_doc(owner_uid=current_user["uid"], org_name=payload.name)
    if payload.description:
        update_org(org["org_id"], {"description": payload.description})
        org["description"] = payload.description
    return org

@router.get("/orgs")
async def list_orgs(current_user: dict = Depends(require_admin)):
    return get_orgs()

@router.get("/orgs/{org_id}")
async def get_org_details(org_id: str, current_user: dict = Depends(require_admin)):
    org = get_org(org_id)
    if not org:
        raise HTTPException(status_code=404, detail="Org not found")
    org["users"] = get_users(org_id=org_id)
    return org

@router.put("/orgs/{org_id}")
async def update_org_endpoint(org_id: str, payload: OrgUpdate, current_user: dict = Depends(require_admin)):
    updates = {k: v for k, v in payload.dict(exclude_unset=True).items() if v is not None}
    if not updates:
        return get_org(org_id)
    org = update_org(org_id, updates)
    if not org:
        raise HTTPException(status_code=404, detail="Org not found")
    return org

@router.delete("/orgs/{org_id}")
async def delete_org_endpoint(org_id: str, current_user: dict = Depends(require_admin)):
    success = delete_org(org_id)
    if not success:
        raise HTTPException(status_code=404, detail="Org not found")
    return {"deleted": True}
