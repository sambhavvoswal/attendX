from fastapi import Depends, Header, HTTPException

from app.services.firebase_service import get_user_doc, verify_firebase_id_token


def get_current_user(authorization: str = Header(...)):
    if not authorization.startswith("Bearer "):
        raise HTTPException(401, "Missing or malformed Authorization header")

    token = authorization.removeprefix("Bearer ").strip()
    try:
        decoded = verify_firebase_id_token(token)
    except Exception as e:
        raise HTTPException(401, f"Invalid token: {str(e)}")

    user_doc = get_user_doc(decoded["uid"])
    if not user_doc:
        raise HTTPException(404, "User record not found")

    if user_doc.get("status") == "disabled":
        raise HTTPException(403, detail={"code": "account_disabled"})

    return {**user_doc, "uid": decoded["uid"]}

async def require_active_user(current_user: dict = Depends(get_current_user)):
    if current_user.get("status") != "active":
        raise HTTPException(403, detail={"code": "inactive", "msg": "Account requires approval"})
    return current_user

async def require_admin(current_user: dict = Depends(require_active_user)):
    if current_user.get("role") not in ("org_admin", "super_admin"):
        raise HTTPException(403, "Admin access required")
    return current_user

async def require_superadmin(current_user: dict = Depends(require_active_user)):
    if current_user.get("role") != "super_admin":
        raise HTTPException(403, "Superadmin access required")
    return current_user

