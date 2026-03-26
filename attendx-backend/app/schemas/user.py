"""
AttendX — User Schemas
Pydantic v2 request/response models for auth endpoints.
Fields match SRD §3.1 exactly.
"""
from pydantic import BaseModel, EmailStr
from typing import Optional


# ── Request Models ──

class UserRegisterRequest(BaseModel):
    """POST /api/auth/register — create new user (email/password flow)."""
    uid: str
    email: EmailStr
    name: str
    org_name: str


class GoogleSetupRequest(BaseModel):
    """POST /api/auth/google-setup — one-time org name for Google Sign-In users."""
    org_name: str


class UserUpdateRequest(BaseModel):
    """PUT /api/auth/me — update profile."""
    name: Optional[str] = None
    org_name: Optional[str] = None


# ── Response Models ──

class UserResponse(BaseModel):
    """Standard user profile response."""
    uid: str
    email: str
    name: str
    org_name: str
    org_id: Optional[str] = None
    role: str
    status: str
    auth_provider: str
    created_at: Optional[str] = None
    approved_at: Optional[str] = None
    approved_by: Optional[str] = None
    is_new_google_user: bool = False


class UserListItem(BaseModel):
    """User item in admin user lists."""
    uid: str
    email: str
    name: str
    org_name: str
    org_id: Optional[str] = None
    role: str
    status: str
    auth_provider: str
    created_at: Optional[str] = None
