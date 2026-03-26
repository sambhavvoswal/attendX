"""
AttendX — Org Schemas
Pydantic v2 request/response models for org endpoints.
Fields match SRD §3.2 exactly.
"""
from pydantic import BaseModel
from typing import Optional


# ── Request Models ──

class OrgCreateRequest(BaseModel):
    """POST /api/admin/orgs — create a new org."""
    name: str
    description: Optional[str] = ""


class OrgUpdateRequest(BaseModel):
    """PUT /api/admin/orgs/{org_id} — update org."""
    name: Optional[str] = None
    description: Optional[str] = None


# ── Response Models ──

class OrgResponse(BaseModel):
    """Standard org response."""
    org_id: str
    name: str
    description: str
    admin_uid: str
    created_at: Optional[str] = None
    member_count: int = 0
    sheet_count: int = 0


class OrgListItem(BaseModel):
    """Org item in admin org lists."""
    org_id: str
    name: str
    description: str
    member_count: int = 0
    sheet_count: int = 0
