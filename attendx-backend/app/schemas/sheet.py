"""
AttendX — Sheet Schemas
Pydantic v2 request/response models for sheet endpoints.
Fields match SRD §3.3 exactly.
"""
from pydantic import BaseModel
from typing import Optional


# ── Request Models ──

class SheetCreateRequest(BaseModel):
    """POST /api/sheets — register a new sheet."""
    name: str
    google_sheet_id: str
    sheet_url: str
    access_method: str = "manual_link"  # "oauth" | "service_account" | "manual_link"
    primary_key_column: Optional[str] = None
    qr_key_mapping: Optional[dict] = None


class SheetUpdateRequest(BaseModel):
    """PUT /api/sheets/{sheet_id} — update sheet config."""
    name: Optional[str] = None
    primary_key_column: Optional[str] = None
    qr_key_mapping: Optional[dict] = None


class SheetSetupRequest(BaseModel):
    """POST /api/sheets/{sheet_id}/setup — configure PK col + QR key mapping."""
    primary_key_column: str
    qr_key_mapping: dict


class VerifyAccessRequest(BaseModel):
    """POST /api/sheets/{sheet_id}/verify-access."""
    pass  # No body needed — sheet ID from URL


class ConnectGoogleRequest(BaseModel):
    """POST /api/sheets/connect-google — initiate OAuth2."""
    pass  # Triggers OAuth flow


# ── Response Models ──

class SheetResponse(BaseModel):
    """Standard sheet response."""
    sheet_id: str
    owner_uid: str
    org_id: Optional[str] = None
    name: str
    google_sheet_id: str
    sheet_url: str
    access_method: str
    primary_key_column: Optional[str] = None
    qr_key_mapping: Optional[dict] = None
    created_at: Optional[str] = None
    last_accessed: Optional[str] = None


class SheetListItem(BaseModel):
    """Sheet item for dashboard lists."""
    sheet_id: str
    name: str
    google_sheet_id: str
    access_method: str
    primary_key_column: Optional[str] = None
    created_at: Optional[str] = None
    last_accessed: Optional[str] = None


class ColumnListResponse(BaseModel):
    """GET /api/sheets/{sheet_id}/columns response."""
    columns: list[str]
    date_columns: list[str]
    non_date_columns: list[str]


class StudentRow(BaseModel):
    """A single student row (non-attendance columns only)."""
    data: dict
    attendance_pct: Optional[float] = None


class VerifyAccessResponse(BaseModel):
    """POST /api/sheets/{sheet_id}/verify-access response."""
    writable: bool
    error_message: Optional[str] = None
