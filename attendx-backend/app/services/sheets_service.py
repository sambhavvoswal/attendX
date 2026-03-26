"""
AttendX — Google Sheets Service
gspread operations for reading/writing Google Sheets.
Per SRD §9.1 — handles OAuth, service account, and manual link access.
"""
import gspread
from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request

from app.config import get_settings
from app.utils.sheet_helpers import (
    is_date_column,
    get_date_columns,
    get_non_date_columns,
    calculate_attendance_pct,
)

SCOPES = [
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/drive.file",
]


class SheetsService:
    """
    Wraps gspread operations for Google Sheets.
    All methods per SRD §9.1.
    """

    def get_client_from_oauth(self, oauth_tokens: dict) -> gspread.Client:
        """Create gspread client from user's OAuth2 tokens."""
        settings = get_settings()
        creds = Credentials(
            token=oauth_tokens["access_token"],
            refresh_token=oauth_tokens.get("refresh_token"),
            token_uri="https://oauth2.googleapis.com/token",
            client_id=settings.GOOGLE_CLIENT_ID,
            client_secret=settings.GOOGLE_CLIENT_SECRET,
            scopes=SCOPES,
        )
        if creds.expired and creds.refresh_token:
            creds.refresh(Request())
            # TODO: store refreshed tokens back to Firestore
        return gspread.authorize(creds)

    def get_client_from_service_account(self) -> gspread.Client:
        """Create gspread client from service account credentials."""
        settings = get_settings()
        return gspread.service_account_from_dict(settings.firebase_credentials)

    def verify_write_access(self, sheet_id: str, client: gspread.Client) -> dict:
        """
        Check if the sheet has Editor (read+write) access.
        Returns {"writable": bool, "error_message": str | None}
        Per SRD §9.2.
        """
        try:
            sh = client.open_by_key(sheet_id)
            ws = sh.sheet1
            # No-op write test: read cell(1,1), write same value back
            current_val = ws.cell(1, 1).value
            ws.update_cell(1, 1, current_val if current_val else "")
            return {"writable": True, "error_message": None}
        except gspread.exceptions.APIError as e:
            if "PERMISSION_DENIED" in str(e) or "403" in str(e):
                return {
                    "writable": False,
                    "error_message": (
                        "Sheet is view-only. Please change sharing to "
                        "'Anyone with the link — Editor' and re-paste the link."
                    ),
                }
            return {"writable": False, "error_message": str(e)}
        except Exception as e:
            return {"writable": False, "error_message": str(e)}

    def get_columns(self, sheet_id: str, client: gspread.Client) -> dict:
        """
        Get all column headers from the sheet.
        Returns {"columns": [...], "date_columns": [...], "non_date_columns": [...]}
        """
        sh = client.open_by_key(sheet_id)
        ws = sh.sheet1
        headers = ws.row_values(1)
        return {
            "columns": headers,
            "date_columns": get_date_columns(headers),
            "non_date_columns": get_non_date_columns(headers),
        }

    def get_all_students(
        self, sheet_id: str, client: gspread.Client, pk_col: str
    ) -> list[dict]:
        """
        Get all student rows with non-attendance columns only + attendance %.
        Per SRD §9.1 get_all_students.
        """
        sh = client.open_by_key(sheet_id)
        ws = sh.sheet1
        headers = ws.row_values(1)

        non_att_cols = get_non_date_columns(headers)
        date_cols = get_date_columns(headers)
        all_records = ws.get_all_records()

        students = []
        for row in all_records:
            student_data = {k: row[k] for k in non_att_cols if k in row}
            att_pct = calculate_attendance_pct(row, date_cols)
            students.append({
                "data": student_data,
                "attendance_pct": att_pct,
            })

        return students

    def mark_attendance(
        self,
        sheet_id: str,
        client: gspread.Client,
        pk_col: str,
        pk_value: str,
        date_col: str,
        value: str = "P",
    ):
        """
        Write attendance value to the correct cell.
        Creates date column if it doesn't exist.
        Per SRD §9.1 mark_attendance.
        """
        sh = client.open_by_key(sheet_id)
        ws = sh.sheet1
        headers = ws.row_values(1)

        # Create date column if needed
        if date_col not in headers:
            next_col = len(headers) + 1
            ws.update_cell(1, next_col, date_col)
            headers.append(date_col)

        date_col_idx = headers.index(date_col) + 1
        pk_col_idx = headers.index(pk_col) + 1

        pk_values = ws.col_values(pk_col_idx)
        try:
            row_idx = pk_values.index(str(pk_value)) + 1
        except ValueError:
            raise ValueError(f"ID '{pk_value}' not found in sheet")

        ws.update_cell(row_idx, date_col_idx, value)

    def add_student_row(
        self,
        sheet_id: str,
        client: gspread.Client,
        row_data: dict,
        session_config: dict,
    ):
        """
        Add a new student row to the sheet.
        Per SRD §9.1 add_student_row.

        session_config = {
            "current_date_col": "2026-03-26",
            "mark_present_today": True,
            "previous_cols_default": "absent"  # "absent" | "empty"
        }
        """
        sh = client.open_by_key(sheet_id)
        ws = sh.sheet1
        headers = ws.row_values(1)
        date_cols = get_date_columns(headers)

        new_row = []
        for h in headers:
            if h in row_data:
                new_row.append(row_data[h])
            elif h == session_config.get("current_date_col"):
                new_row.append("P" if session_config.get("mark_present_today") else "")
            elif h in date_cols:
                new_row.append(
                    "A" if session_config.get("previous_cols_default") == "absent" else ""
                )
            else:
                new_row.append("")

        ws.append_row(new_row)

    def get_sheet_info(self, sheet_id: str, client: gspread.Client) -> dict:
        """Get basic sheet info (title, row count)."""
        try:
            sh = client.open_by_key(sheet_id)
            ws = sh.sheet1
            return {
                "title": sh.title,
                "row_count": ws.row_count,
                "col_count": ws.col_count,
            }
        except Exception as e:
            return {"error": str(e)}
