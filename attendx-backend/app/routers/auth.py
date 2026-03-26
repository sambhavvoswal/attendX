"""
AttendX — Auth Router
Handles user registration, Google setup, and profile endpoints.
API paths per SRD §4.1.
"""
from fastapi import APIRouter, Depends, HTTPException
from datetime import datetime, timezone

from app.dependencies import get_current_user_any_status
from app.services.firebase_service import (
    get_user_doc, create_user_doc, update_user_doc
)
from app.schemas.user import (
    UserRegisterRequest, GoogleSetupRequest, UserUpdateRequest, UserResponse
)

router = APIRouter(prefix="/api/auth", tags=["Auth"])


@router.post("/register", response_model=UserResponse)
async def register(req: UserRegisterRequest):
    """
    Create a new user with status: pending.
    Called after Firebase Auth createUserWithEmailAndPassword on the frontend.
    """
    # Check if user doc already exists
    existing = get_user_doc(req.uid)
    if existing:
        raise HTTPException(status_code=409, detail="User already registered")

    now = datetime.now(timezone.utc).isoformat()
    user_data = {
        "email": req.email,
        "name": req.name,
        "org_name": req.org_name,
        "org_id": None,
        "role": "user",
        "status": "pending",
        "auth_provider": "email",
        "created_at": now,
        "approved_at": None,
        "approved_by": None,
    }
    create_user_doc(req.uid, user_data)

    return UserResponse(uid=req.uid, **user_data)


@router.post("/google-setup", response_model=UserResponse)
async def google_setup(
    req: GoogleSetupRequest,
    current_user: dict = Depends(get_current_user_any_status),
):
    """
    One-time org name save for first-time Google Sign-In users.
    Creates Firestore user doc with status: pending.
    """
    uid = current_user["uid"]

    # If user already has a doc, this is not a first-time setup
    existing = get_user_doc(uid)
    if existing:
        raise HTTPException(status_code=409, detail="User already registered")

    now = datetime.now(timezone.utc).isoformat()
    user_data = {
        "email": current_user.get("email", ""),
        "name": current_user.get("name", ""),
        "org_name": req.org_name,
        "org_id": None,
        "role": "user",
        "status": "pending",
        "auth_provider": "google",
        "created_at": now,
        "approved_at": None,
        "approved_by": None,
    }
    create_user_doc(uid, user_data)

    return UserResponse(uid=uid, **user_data)


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: dict = Depends(get_current_user_any_status)):
    """
    Get current user profile + status.
    Uses get_current_user_any_status so pending users can check their status.
    """
    return UserResponse(**current_user)


@router.put("/me", response_model=UserResponse)
async def update_me(
    req: UserUpdateRequest,
    current_user: dict = Depends(get_current_user_any_status),
):
    """Update current user's name or org_name."""
    uid = current_user["uid"]

    updates = {}
    if req.name is not None:
        updates["name"] = req.name
    if req.org_name is not None:
        updates["org_name"] = req.org_name

    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")

    update_user_doc(uid, updates)

    # Return updated user
    updated = {**current_user, **updates}
    return UserResponse(**updated)
