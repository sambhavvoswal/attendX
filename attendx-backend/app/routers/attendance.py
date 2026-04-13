from fastapi import APIRouter, Depends, HTTPException
from typing import Dict, Any

from app.schemas.attendance import (
    SessionStartRequest,
    SessionEndRequest
)
from app.dependencies import get_current_user
from app.services import firebase_service
from app.services.sheets_service import SheetsService

router = APIRouter()
sheets_service = SheetsService()

@router.post("/session/start")
def start_session(req: SessionStartRequest, user: dict = Depends(get_current_user)):
    try:
        print(f"[session/start] sheet_id={req.sheet_id}, date={req.date}, user={user['uid']}")
        
        sheet = firebase_service.get_sheet(req.sheet_id)
        if not sheet:
            raise HTTPException(status_code=404, detail="Sheet not found")
        print(f"[session/start] Sheet found: {sheet.get('display_name')}")

        # Check if a session already exists for this sheet and date
        existing_session = firebase_service.get_session_by_sheet_and_date(req.sheet_id, req.date)
        if existing_session:
            print(f"[session/start] Returning existing session: {existing_session.get('session_id')}")
            return existing_session

        # Fetch total students to initialize total_students count
        google_sheet_id = sheet.get("google_sheet_id")
        print(f"[session/start] Fetching students from Google Sheet: {google_sheet_id}")
        client = sheets_service.build_client()
        print("[session/start] gspread client built successfully")
        
        students = sheets_service.get_students(google_sheet_id, client)
        print(f"[session/start] Found {len(students)} students")
        
        # Create the session document
        new_session = firebase_service.create_session(
            sheet_id=req.sheet_id,
            org_id=sheet.get("org_id", ""),
            owner_uid=user["uid"],
            date_column=req.date,
            total_students=len(students)
        )
        print(f"[session/start] Session created: {new_session.get('session_id')}")
        return new_session
    except HTTPException:
        raise
    except Exception as e:
        print(f"[session/start] CRASH: {type(e).__name__}: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Internal error: {type(e).__name__}: {str(e)}")

@router.post("/session/end")
def end_session(req: SessionEndRequest, user: dict = Depends(get_current_user)):
    # 1. Fetch current session
    session = firebase_service.get_session(req.session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    sheet = firebase_service.get_sheet(req.sheet_id)
    if not sheet:
        raise HTTPException(status_code=404, detail="Sheet not found")

    # 2. Build the final marked_values map
    final_marks = req.marked_values.copy()

    client = sheets_service.build_client()
    google_sheet_id = sheet.get("google_sheet_id")
    pk_col_name = sheet.get("primary_key_column")

    # 3. Process unmarked defaults if necessary
    if req.unmarked_default == "absent" and req.absent_value:
        # Get all students and figure out who is unmarked
        all_students = sheets_service.get_students(google_sheet_id, client)
        
        for stud in all_students:
            pk_val = str(stud.get(pk_col_name, "")).strip()
            if pk_val and pk_val not in final_marks:
                final_marks[pk_val] = req.absent_value

    # 4. Batch update Google Sheets
    if final_marks:
        sheets_service.batch_mark_attendance(
            sheet_id=google_sheet_id,
            client=client,
            pk_col=pk_col_name,
            marked_values=final_marks,
            date_col=req.date_column
        )

    # 5. Update session doc in Firestore
    updates = {
        "marked_values": req.marked_values,
        "value_counts": req.value_counts,
        "unmarked_default": req.unmarked_default,
        "ended_at": firebase_service.now_ts()
    }
    updated_session = firebase_service.update_session(req.session_id, updates)
    return updated_session
