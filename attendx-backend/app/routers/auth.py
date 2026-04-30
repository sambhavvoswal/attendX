from fastapi import APIRouter, Depends, Header, HTTPException, Request
from pydantic import BaseModel, Field

from app.dependencies import get_current_user, limiter
from app.services.firebase_service import (
    create_org_doc,
    create_user_doc,
    get_user_doc,
    get_org,
    verify_firebase_id_token,
)
from typing import Optional


router = APIRouter(prefix="/api/auth", tags=["auth"])


class RegisterBody(BaseModel):
    name: str = Field(min_length=1)
    email: str = Field(min_length=3)
    action: str = Field(description="'create' or 'join'")
    org_name: Optional[str] = ""
    org_id: Optional[str] = ""

class GoogleSetupBody(BaseModel):
    name: str = Field(min_length=1)
    action: str = Field(description="'create' or 'join'")
    org_name: Optional[str] = ""
    org_id: Optional[str] = ""


@router.post("/register")
@limiter.limit("10/minute")
def register(request: Request, body: RegisterBody, authorization: str = Header(default="")):
    """
    Called AFTER Firebase creates the account.
    Even though this is not "protected" by having an existing user doc,
    we still require a valid Firebase ID token to obtain the UID safely.
    """
    if not authorization.startswith("Bearer "):
        raise HTTPException(401, "Missing or malformed Authorization header")

    token = authorization.removeprefix("Bearer ").strip()
    decoded = verify_firebase_id_token(token)
    uid = decoded["uid"]

    existing = get_user_doc(uid)
    if existing:
        return {"uid": uid, "status": existing.get("status"), "org_id": existing.get("org_id")}

    if body.action == "create":
        if not body.org_name:
            raise HTTPException(400, "org_name is required when creating an organization")
        org = create_org_doc(owner_uid=uid, org_name=body.org_name)
        user = create_user_doc(
            uid=uid,
            email=body.email,
            name=body.name,
            org_name=body.org_name,
            org_id=org["org_id"],
            auth_provider="email",
            role="org_admin",
            status="pending_approval"
        )
    elif body.action == "join":
        if not body.org_id:
            raise HTTPException(400, "org_id is required when joining an organization")
        org = get_org(body.org_id)
        if not org:
            raise HTTPException(404, "Invalid Organization ID")
        user = create_user_doc(
            uid=uid,
            email=body.email,
            name=body.name,
            org_name=org["name"],
            org_id=body.org_id,
            auth_provider="email",
            role="user",
            status="pending_approval"
        )
    else:
        raise HTTPException(400, "Invalid action. Must be 'create' or 'join'")
    return {"uid": uid, "status": user["status"], "org_id": org["org_id"]}


@router.post("/google-setup")
@limiter.limit("10/minute")
def google_setup(request: Request, body: GoogleSetupBody, authorization: str = Header(default="")):
    if not authorization.startswith("Bearer "):
        raise HTTPException(401, "Missing or malformed Authorization header")

    token = authorization.removeprefix("Bearer ").strip()
    decoded = verify_firebase_id_token(token)
    uid = decoded["uid"]

    existing = get_user_doc(uid)
    if existing:
        return {"uid": uid, "status": existing.get("status"), "org_id": existing.get("org_id")}

    # Email comes from token for Google provider users
    email = decoded.get("email") or ""

    if body.action == "create":
        if not body.org_name:
            raise HTTPException(400, "org_name is required when creating an organization")
        org = create_org_doc(owner_uid=uid, org_name=body.org_name)
        user = create_user_doc(
            uid=uid,
            email=email,
            name=body.name,
            org_name=body.org_name,
            org_id=org["org_id"],
            auth_provider="google",
            role="org_admin",
            status="pending_approval"
        )
    elif body.action == "join":
        if not body.org_id:
            raise HTTPException(400, "org_id is required when joining an organization")
        org = get_org(body.org_id)
        if not org:
            raise HTTPException(404, "Invalid Organization ID")
        user = create_user_doc(
            uid=uid,
            email=email,
            name=body.name,
            org_name=org["name"],
            org_id=body.org_id,
            auth_provider="google",
            role="user",
            status="pending_approval"
        )
    else:
        raise HTTPException(400, "Invalid action. Must be 'create' or 'join'")
    return {"uid": uid, "status": user["status"], "org_id": org["org_id"]}


@router.get("/me")
def me(current_user: dict = Depends(get_current_user)):
    return current_user

