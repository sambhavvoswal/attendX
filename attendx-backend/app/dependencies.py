"""
AttendX — Auth Dependencies
Firebase token verification + role/status checks.
Per SRD §10.3 — these are used as FastAPI Depends() on protected routes.
"""
from fastapi import Header, HTTPException, Depends
from firebase_admin import auth as firebase_auth
from app.services.firebase_service import get_user_doc


async def get_current_user(authorization: str = Header(...)):
    """
    Verify Firebase ID token from Authorization header.
    Returns user doc dict with uid if valid and active.
    """
    token = authorization.removeprefix("Bearer ").strip()

    if not token:
        raise HTTPException(status_code=401, detail="Missing authorization token")

    try:
        decoded = firebase_auth.verify_id_token(token)
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    user_doc = get_user_doc(decoded["uid"])

    if not user_doc:
        # User authenticated with Firebase but has no Firestore doc yet
        # This can happen for first-time Google Sign-In users
        return {
            "uid": decoded["uid"],
            "email": decoded.get("email", ""),
            "name": decoded.get("name", ""),
            "is_new_google_user": True,
            "status": "new",
            "role": "user",
        }

    if user_doc["status"] != "active":
        raise HTTPException(
            status_code=403,
            detail={
                "code": "account_inactive",
                "status": user_doc["status"],
            },
        )

    return {**user_doc, "uid": decoded["uid"]}


async def get_current_user_any_status(authorization: str = Header(...)):
    """
    Same as get_current_user but does NOT enforce active status.
    Used for endpoints that pending users need access to (e.g., GET /api/auth/me).
    """
    token = authorization.removeprefix("Bearer ").strip()

    if not token:
        raise HTTPException(status_code=401, detail="Missing authorization token")

    try:
        decoded = firebase_auth.verify_id_token(token)
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    user_doc = get_user_doc(decoded["uid"])

    if not user_doc:
        return {
            "uid": decoded["uid"],
            "email": decoded.get("email", ""),
            "name": decoded.get("name", ""),
            "is_new_google_user": True,
            "status": "new",
            "role": "user",
        }

    return {**user_doc, "uid": decoded["uid"]}


async def require_admin(current_user: dict = Depends(get_current_user)):
    """Enforce admin or superadmin role."""
    if current_user.get("role") not in ("admin", "superadmin"):
        raise HTTPException(status_code=403, detail="Admin access required")
    return current_user


async def require_superadmin(current_user: dict = Depends(get_current_user)):
    """Enforce superadmin role."""
    if current_user.get("role") != "superadmin":
        raise HTTPException(status_code=403, detail="Superadmin access required")
    return current_user
