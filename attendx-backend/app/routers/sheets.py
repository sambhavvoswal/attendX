"""
AttendX — Sheets Router
Sheet CRUD, Google Sheets access verification, and OAuth2 flow.
API paths per SRD §4.3.
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import RedirectResponse
from datetime import datetime, timezone
from typing import Optional

from app.dependencies import get_current_user
from app.services.firebase_service import get_db
from app.services.sheets_service import SheetsService
from app.utils.sheet_helpers import extract_sheet_id_from_url
from app.schemas.sheet import (
    SheetCreateRequest,
    SheetUpdateRequest,
    SheetResponse,
    SheetListItem,
    ColumnListResponse,
    StudentRow,
    VerifyAccessResponse,
)
from app.config import get_settings

router = APIRouter(prefix="/api/sheets", tags=["Sheets"])
sheets_svc = SheetsService()


# ──────────────────────────────────────────────
# Helper: get sheet doc + ownership check
# ──────────────────────────────────────────────

def _get_sheet_doc(sheet_id: str, user_uid: str) -> dict:
    """Fetch sheet doc from Firestore, verify ownership."""
    db = get_db()
    doc = db.collection("sheets").document(sheet_id).get()
    if not doc.exists:
        raise HTTPException(status_code=404, detail="Sheet not found")
    sheet = doc.to_dict()
    sheet["sheet_id"] = doc.id
    if sheet["owner_uid"] != user_uid:
        raise HTTPException(status_code=403, detail="Not your sheet")
    return sheet


def _get_gspread_client(sheet_doc: dict, user_uid: str):
    """Get appropriate gspread client based on access method."""
    access_method = sheet_doc.get("access_method", "manual_link")

    if access_method == "oauth":
        # Get stored OAuth tokens for this user
        db = get_db()
        token_doc = db.collection("google_tokens").document(user_uid).get()
        if not token_doc.exists:
            raise HTTPException(
                status_code=400,
                detail="Google account not connected. Please connect via Settings.",
            )
        return sheets_svc.get_client_from_oauth(token_doc.to_dict())

    elif access_method == "service_account":
        return sheets_svc.get_client_from_service_account()

    else:
        # manual_link — use service account as fallback
        return sheets_svc.get_client_from_service_account()


# ──────────────────────────────────────────────
# Sheet CRUD
# ──────────────────────────────────────────────

@router.get("", response_model=list[SheetListItem])
async def list_sheets(current_user: dict = Depends(get_current_user)):
    """All sheets for current user, sorted by last_accessed."""
    db = get_db()
    query = (
        db.collection("sheets")
        .where("owner_uid", "==", current_user["uid"])
        .order_by("last_accessed", direction="DESCENDING")
    )
    results = []
    for doc in query.stream():
        sheet = doc.to_dict()
        sheet["sheet_id"] = doc.id
        results.append(SheetListItem(**sheet))
    return results


@router.get("/recent", response_model=list[SheetListItem])
async def recent_sheets(current_user: dict = Depends(get_current_user)):
    """Last 5 accessed sheets."""
    db = get_db()
    query = (
        db.collection("sheets")
        .where("owner_uid", "==", current_user["uid"])
        .order_by("last_accessed", direction="DESCENDING")
        .limit(5)
    )
    results = []
    for doc in query.stream():
        sheet = doc.to_dict()
        sheet["sheet_id"] = doc.id
        results.append(SheetListItem(**sheet))
    return results


@router.post("", response_model=SheetResponse)
async def create_sheet(
    req: SheetCreateRequest, current_user: dict = Depends(get_current_user)
):
    """Register a new sheet."""
    now = datetime.now(timezone.utc).isoformat()

    sheet_data = {
        "owner_uid": current_user["uid"],
        "org_id": current_user.get("org_id"),
        "name": req.name,
        "google_sheet_id": req.google_sheet_id,
        "sheet_url": req.sheet_url,
        "access_method": req.access_method,
        "primary_key_column": req.primary_key_column,
        "qr_key_mapping": req.qr_key_mapping,
        "created_at": now,
        "last_accessed": now,
    }

    db = get_db()
    doc_ref = db.collection("sheets").add(sheet_data)
    sheet_id = doc_ref[1].id

    return SheetResponse(sheet_id=sheet_id, **sheet_data)


@router.get("/{sheet_id}", response_model=SheetResponse)
async def get_sheet(sheet_id: str, current_user: dict = Depends(get_current_user)):
    """Sheet metadata + config."""
    sheet = _get_sheet_doc(sheet_id, current_user["uid"])

    # Update last_accessed
    db = get_db()
    db.collection("sheets").document(sheet_id).update({
        "last_accessed": datetime.now(timezone.utc).isoformat()
    })

    return SheetResponse(**sheet)


@router.put("/{sheet_id}", response_model=SheetResponse)
async def update_sheet(
    sheet_id: str,
    req: SheetUpdateRequest,
    current_user: dict = Depends(get_current_user),
):
    """Update sheet config (name, PK col, QR mapping)."""
    sheet = _get_sheet_doc(sheet_id, current_user["uid"])

    updates = {}
    if req.name is not None:
        updates["name"] = req.name
    if req.primary_key_column is not None:
        updates["primary_key_column"] = req.primary_key_column
    if req.qr_key_mapping is not None:
        updates["qr_key_mapping"] = req.qr_key_mapping

    if updates:
        db = get_db()
        db.collection("sheets").document(sheet_id).update(updates)

    return SheetResponse(**{**sheet, **updates})


@router.delete("/{sheet_id}")
async def delete_sheet(
    sheet_id: str, current_user: dict = Depends(get_current_user)
):
    """Remove sheet from app (not from Google)."""
    _get_sheet_doc(sheet_id, current_user["uid"])
    db = get_db()
    db.collection("sheets").document(sheet_id).delete()
    return {"message": "Sheet removed from AttendX"}


# ──────────────────────────────────────────────
# Sheet Data Access (reads from Google Sheets)
# ──────────────────────────────────────────────

@router.get("/{sheet_id}/students", response_model=list[StudentRow])
async def get_students(
    sheet_id: str, current_user: dict = Depends(get_current_user)
):
    """All rows (non-attendance columns only) with attendance %."""
    sheet = _get_sheet_doc(sheet_id, current_user["uid"])
    client = _get_gspread_client(sheet, current_user["uid"])

    pk_col = sheet.get("primary_key_column", "")
    students = sheets_svc.get_all_students(sheet["google_sheet_id"], client, pk_col)

    return [StudentRow(**s) for s in students]


@router.post("/{sheet_id}/students")
async def add_student(
    sheet_id: str,
    row_data: dict,
    mark_present_today: bool = Query(False),
    previous_default: str = Query("absent"),
    current_user: dict = Depends(get_current_user),
):
    """Add new student row to Google Sheet."""
    sheet = _get_sheet_doc(sheet_id, current_user["uid"])
    client = _get_gspread_client(sheet, current_user["uid"])

    today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    session_config = {
        "current_date_col": today,
        "mark_present_today": mark_present_today,
        "previous_cols_default": previous_default,
    }

    sheets_svc.add_student_row(
        sheet["google_sheet_id"], client, row_data, session_config
    )
    return {"message": "Student added"}


@router.get("/{sheet_id}/columns", response_model=ColumnListResponse)
async def get_columns(
    sheet_id: str, current_user: dict = Depends(get_current_user)
):
    """All column headers."""
    sheet = _get_sheet_doc(sheet_id, current_user["uid"])
    client = _get_gspread_client(sheet, current_user["uid"])

    cols = sheets_svc.get_columns(sheet["google_sheet_id"], client)
    return ColumnListResponse(**cols)


# ──────────────────────────────────────────────
# Access Verification
# ──────────────────────────────────────────────

@router.post("/{sheet_id}/verify-access", response_model=VerifyAccessResponse)
async def verify_access(
    sheet_id: str, current_user: dict = Depends(get_current_user)
):
    """Check if sheet has Editor access."""
    sheet = _get_sheet_doc(sheet_id, current_user["uid"])
    client = _get_gspread_client(sheet, current_user["uid"])

    result = sheets_svc.verify_write_access(sheet["google_sheet_id"], client)
    return VerifyAccessResponse(**result)


@router.post("/verify-url", response_model=VerifyAccessResponse)
async def verify_url(
    sheet_url: str = Query(...),
    current_user: dict = Depends(get_current_user),
):
    """Verify a sheet URL before registration — checks write access."""
    try:
        gsheet_id = extract_sheet_id_from_url(sheet_url)
    except ValueError as e:
        return VerifyAccessResponse(writable=False, error_message=str(e))

    # Use service account for manual link verification
    try:
        client = sheets_svc.get_client_from_service_account()
        result = sheets_svc.verify_write_access(gsheet_id, client)
        return VerifyAccessResponse(**result)
    except Exception as e:
        return VerifyAccessResponse(writable=False, error_message=str(e))


# ──────────────────────────────────────────────
# Google OAuth2 Flow
# ──────────────────────────────────────────────

@router.post("/connect-google")
async def connect_google(current_user: dict = Depends(get_current_user)):
    """Initiate Google Sheets OAuth2 flow — returns redirect URL."""
    settings = get_settings()

    params = {
        "client_id": settings.GOOGLE_CLIENT_ID,
        "redirect_uri": settings.GOOGLE_REDIRECT_URI,
        "scope": "https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive.file",
        "response_type": "code",
        "access_type": "offline",
        "prompt": "consent",
        "state": current_user["uid"],  # Pass UID for callback
    }

    from urllib.parse import urlencode
    auth_url = f"https://accounts.google.com/o/oauth2/v2/auth?{urlencode(params)}"
    return {"auth_url": auth_url}


@router.get("/oauth-callback")
async def oauth_callback(code: str, state: str):
    """
    OAuth2 callback — exchanges code for tokens, stores in Firestore.
    Redirects back to frontend.
    """
    import httpx
    settings = get_settings()

    # Exchange code for tokens
    async with httpx.AsyncClient() as client:
        resp = await client.post(
            "https://oauth2.googleapis.com/token",
            data={
                "code": code,
                "client_id": settings.GOOGLE_CLIENT_ID,
                "client_secret": settings.GOOGLE_CLIENT_SECRET,
                "redirect_uri": settings.GOOGLE_REDIRECT_URI,
                "grant_type": "authorization_code",
            },
        )

    if resp.status_code != 200:
        raise HTTPException(status_code=400, detail="OAuth token exchange failed")

    tokens = resp.json()

    # Store tokens in Firestore
    db = get_db()
    db.collection("google_tokens").document(state).set({
        "access_token": tokens["access_token"],
        "refresh_token": tokens.get("refresh_token"),
        "expires_in": tokens.get("expires_in"),
        "token_type": tokens.get("token_type"),
        "stored_at": datetime.now(timezone.utc).isoformat(),
    })

    # Redirect back to frontend
    return RedirectResponse(
        url=f"{settings.FRONTEND_URL}/dashboard?google_connected=true"
    )
