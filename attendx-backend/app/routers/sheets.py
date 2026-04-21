from fastapi import APIRouter, Depends, HTTPException
from typing import List

from app.schemas.sheet import (
    SheetCreate, SheetUpdate, SheetResponse, SheetValuesUpdate,
    SheetVerifyRequest, StudentAddRequest
)
from app.dependencies import require_active_user
from app.services.firebase_service import (
    create_sheet, get_user_sheets, get_recent_sheets, get_sheet,
    update_sheet, delete_sheet, update_sheet_attendance_values
)
from app.services.sheets_service import sheets_service
from app.utils.sheet_helpers import extract_sheet_id_from_url, check_sheet_access

router = APIRouter(prefix="/api/sheets", tags=["sheets"])

@router.post("")
def register_sheet(payload: SheetCreate, current_user: dict = Depends(require_active_user)):
    try:
        g_sheet_id = extract_sheet_id_from_url(payload.sheet_url)
    except ValueError as e:
        raise HTTPException(status_code=400, detail="This doesn't look like a Google Sheet URL. URL must start with https://docs.google.com/spreadsheets/")
        
    validation = payload.attendance_values
    if len(validation) < 2 or len(validation) > 8:
        raise HTTPException(status_code=400, detail="Must have between 2 and 8 attendance values")
    
    has_positive = any(v.is_positive for v in validation)
    has_negative = any(not v.is_positive for v in validation)
    if not has_positive or not has_negative:
        raise HTTPException(status_code=400, detail="Must have at least 1 positive and 1 negative attendance value")
    
    # Verify the service account can access the sheet
    client = sheets_service.build_client()
    try:
        has_access = sheets_service.verify_write_access(g_sheet_id, client)
        access_method = "service_account" if has_access else "viewer"
    except Exception:
        raise HTTPException(
            status_code=400, 
            detail="Cannot access this Google Sheet. Please share it with the service account email: firebase-adminsdk-fbsvc@attendancesystem-bc334.iam.gserviceaccount.com"
        )
    
    if not has_access:
        raise HTTPException(
            status_code=403,
            detail="The service account has view-only access. Please grant Editor access to: firebase-adminsdk-fbsvc@attendancesystem-bc334.iam.gserviceaccount.com"
        )

    doc_data = payload.dict()
    doc_data["google_sheet_id"] = g_sheet_id
    doc_data["owner_uid"] = current_user["uid"]
    doc_data["access_method"] = access_method
    if current_user.get("org_id"):
        doc_data["org_id"] = current_user["org_id"]
        
    sheet = create_sheet(doc_data)
    return sheet

@router.post("/verify-access")
def verify_access(payload: SheetVerifyRequest, current_user: dict = Depends(require_active_user)):
    """Check if the service account can write to this Google Sheet."""
    try:
        g_sheet_id = extract_sheet_id_from_url(payload.sheet_url)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid Google Sheet URL")
    
    client = sheets_service.build_client()
    try:
        writable = sheets_service.verify_write_access(g_sheet_id, client)
        # Also fetch headers for the wizard
        columns = sheets_service.get_columns(g_sheet_id, client)
        return {"writable": writable, "columns": columns.get("non_attendance", [])}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Cannot access sheet: {str(e)}")

@router.get("")
def list_sheets(current_user: dict = Depends(require_active_user)):
    return get_user_sheets(current_user["uid"], current_user.get("org_id"))

@router.get("/recent")
def list_recent_sheets(current_user: dict = Depends(require_active_user)):
    return get_recent_sheets(current_user["uid"], current_user.get("org_id"))

@router.get("/{sheet_id}")
def get_sheet_details(sheet_id: str, current_user: dict = Depends(require_active_user)):
    sheet = get_sheet(sheet_id)
    if not sheet:
        raise HTTPException(status_code=404, detail="Sheet not found")
        
    if not check_sheet_access(sheet, current_user):
        raise HTTPException(status_code=403, detail="Not authorized to access this sheet")
        
    return sheet

@router.get("/{sheet_id}/columns")
def get_sheet_columns(sheet_id: str, current_user: dict = Depends(require_active_user)):
    sheet = get_sheet(sheet_id)
    if not sheet:
        raise HTTPException(status_code=404, detail="Sheet not found")
        
    if not check_sheet_access(sheet, current_user):
        raise HTTPException(status_code=403, detail="Not authorized to access this sheet")

    client = sheets_service.build_client()
    return sheets_service.get_columns(sheet["google_sheet_id"], client)

@router.get("/{sheet_id}/students")
def get_sheet_students(sheet_id: str, current_user: dict = Depends(require_active_user)):
    sheet = get_sheet(sheet_id)
    if not sheet:
        raise HTTPException(status_code=404, detail="Sheet not found")
        
    if not check_sheet_access(sheet, current_user):
        raise HTTPException(status_code=403, detail="Not authorized to access this sheet")

    client = sheets_service.build_client()
    return sheets_service.get_students(sheet["google_sheet_id"], client)

@router.post("/{sheet_id}/students")
def add_student_to_sheet(sheet_id: str, payload: StudentAddRequest, current_user: dict = Depends(require_active_user)):
    sheet = get_sheet(sheet_id)
    if not sheet:
        raise HTTPException(status_code=404, detail="Sheet not found")
        
    if not check_sheet_access(sheet, current_user):
        raise HTTPException(status_code=403, detail="Not authorized to access this sheet")

    client = sheets_service.build_client()
    try:
        sheets_service.add_student(sheet["google_sheet_id"], client, payload.student_data)
        return {"added": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{sheet_id}")
def update_sheet_endpoint(sheet_id: str, payload: SheetUpdate, current_user: dict = Depends(require_active_user)):
    sheet = get_sheet(sheet_id)
    if not sheet:
        raise HTTPException(status_code=404, detail="Sheet not found")
        
    if not check_sheet_access(sheet, current_user):
        raise HTTPException(status_code=403, detail="Not authorized to access this sheet")
    
    updates = {k: v for k, v in payload.dict(exclude_unset=True).items() if v is not None}
    if not updates:
        return sheet
    
    updated_sheet = update_sheet(sheet_id, updates)
    return updated_sheet

@router.delete("/{sheet_id}")
def delete_sheet_endpoint(sheet_id: str, current_user: dict = Depends(require_active_user)):
    sheet = get_sheet(sheet_id)
    if not sheet:
        raise HTTPException(status_code=404, detail="Sheet not found")
        
    if not check_sheet_access(sheet, current_user):
        raise HTTPException(status_code=403, detail="Not authorized to access this sheet")
        
    delete_sheet(sheet_id)
    return {"deleted": True}

@router.put("/{sheet_id}/attendance-values")
def update_attendance_values(sheet_id: str, payload: SheetValuesUpdate, current_user: dict = Depends(require_active_user)):
    sheet = get_sheet(sheet_id)
    if not sheet:
        raise HTTPException(status_code=404, detail="Sheet not found")
        
    if not check_sheet_access(sheet, current_user):
        raise HTTPException(status_code=403, detail="Not authorized to access this sheet")
        
    validation = payload.attendance_values
    if len(validation) < 2 or len(validation) > 8:
        raise HTTPException(status_code=400, detail="Must have between 2 and 8 attendance values")
    
    has_positive = any(v.is_positive for v in validation)
    has_negative = any(not v.is_positive for v in validation)
    if not has_positive or not has_negative:
        raise HTTPException(status_code=400, detail="Must have at least 1 positive and 1 negative attendance value")
    
    values_list = [v.dict() for v in validation]
    updated = update_sheet(sheet_id, {"attendance_values": values_list})
    return updated["attendance_values"]
