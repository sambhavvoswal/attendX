from fastapi import APIRouter, Depends, HTTPException, Query
from typing import Dict, Any, Optional
import re

from app.schemas.attendance import (
    SessionStartRequest,
    SessionEndRequest
)
from app.dependencies import require_active_user
from app.services import firebase_service
from app.services.sheets_service import SheetsService
from app.utils.sheet_helpers import check_sheet_access

router = APIRouter()
sheets_service = SheetsService()

@router.post("/session/start")
def start_session(req: SessionStartRequest, user: dict = Depends(require_active_user)):
    try:
        print(f"[session/start] sheet_id={req.sheet_id}, date={req.date}, user={user['uid']}")
        
        sheet = firebase_service.get_sheet(req.sheet_id)
        if not sheet:
            raise HTTPException(status_code=404, detail="Sheet not found")
            
        if not check_sheet_access(sheet, user):
            raise HTTPException(status_code=403, detail="Not authorized to access this sheet")
            
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
def end_session(req: SessionEndRequest, user: dict = Depends(require_active_user)):
    # 1. Fetch current session
    session = firebase_service.get_session(req.session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    sheet = firebase_service.get_sheet(req.sheet_id)
    if not sheet:
        raise HTTPException(status_code=404, detail="Sheet not found")
        
    if not check_sheet_access(sheet, user):
        raise HTTPException(status_code=403, detail="Not authorized to access this sheet")

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
    firebase_service.update_session(req.session_id, updates)
    
    return {"status": "success", "session_id": req.session_id, "marked_count": len(final_marks)}

@router.get("/{sheet_id}/analytics")
def get_analytics(sheet_id: str, columns: Optional[str] = Query(None), user: dict = Depends(require_active_user)):
    sheet = firebase_service.get_sheet(sheet_id)
    if not sheet:
        raise HTTPException(status_code=404, detail="Sheet not found")
        
    if not check_sheet_access(sheet, user):
        raise HTTPException(status_code=403, detail="Not authorized to access this sheet")
        
    client = sheets_service.build_client()
    try:
        students = sheets_service.get_students(sheet["google_sheet_id"], client, include_dates=True)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch Google Sheet data: {str(e)}")

    attendance_values = sheet.get("attendance_values", [])
    positive_values = {v["value"] for v in attendance_values if v.get("is_positive")}
    
    available_columns = []
    date_columns = []
    
    if students:
        all_cols = list(students[0].keys())
        pk_col = sheet.get("primary_key_column")
        exclude = {pk_col, "Batch", "VSN"}
        exclude.update(sheet.get("qr_key_mapping", {}).values())
        
        available_columns = [str(c) for c in all_cols if c not in exclude and c]
        
        if columns is not None and columns.strip():
            # User specifically selected columns from the UI
            selected = [c.strip() for c in columns.split(",")]
            date_columns = [c for c in available_columns if c in selected]
        else:
            # Auto-detect using broad regex
            date_regex = re.compile(r"^\d{4}-\d{2}-\d{2}$|^\d{1,2}/\d{1,2}/\d{2,4}$|^\d{4}/\d{2}/\d{2}$")
            date_columns = [col for col in available_columns if date_regex.match(col)]
        
        # Avoid sort so it stays in column order, OR sort it. Default column order is usually chronological anyway.
        # Let's keep it as is (sheet's natural order).
        
    sessions = []
    overall_value_totals = {}
    
    for date in date_columns:
        sessions.append({
            "date": date,
            "value_counts": {},
            "total": 0
        })

    student_summary = []
    pk_col = sheet.get("primary_key_column")
    # Tries to find which column represents "Name" based on qr_key_mapping or defaults to "Name"
    name_col = next((v for k, v in sheet.get("qr_key_mapping", {}).items() if k.lower() == "name"), "Name")

    for student in students:
        pk_value = student.get(pk_col, "Unknown") if pk_col else student.get("id", "Unknown")
        name_value = student.get(name_col, "Unknown")
        
        student_pos_count = 0
        student_total_sessions = 0
        
        for idx, date in enumerate(date_columns):
            val = student.get(date)
            if val and str(val).strip():
                val_str = str(val).strip()
                sessions[idx]["total"] += 1
                sessions[idx]["value_counts"][val_str] = sessions[idx]["value_counts"].get(val_str, 0) + 1
                overall_value_totals[val_str] = overall_value_totals.get(val_str, 0) + 1
                
                student_total_sessions += 1
                if val_str in positive_values:
                    student_pos_count += 1
                    
        percent = round((student_pos_count / student_total_sessions) * 100, 1) if student_total_sessions > 0 else 0
        student_summary.append({
            **student,
            "pk_value": pk_value,
            "name": name_value,
            "percentage": percent,
            "positive_count": student_pos_count,
            "total_sessions": student_total_sessions
        })
        
    return {
        "sessions": sessions,
        "overall_value_totals": overall_value_totals,
        "student_summary": student_summary,
        "attendance_values": attendance_values,
        "available_columns": available_columns,
        "selected_columns": date_columns
    }
