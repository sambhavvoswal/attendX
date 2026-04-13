import gspread
from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request
from app.config import settings
from app.utils.sheet_helpers import is_date_column

SCOPES = [
    "https://www.googleapis.com/auth/spreadsheets",
    "https://www.googleapis.com/auth/drive.file"
]

class SheetsService:

    def build_client(self, oauth_tokens: dict = None) -> gspread.Client:
        if oauth_tokens:
            creds = Credentials(
                token=oauth_tokens.get("access_token"),
                refresh_token=oauth_tokens.get("refresh_token"),
                token_uri="https://oauth2.googleapis.com/token",
                client_id=settings.GOOGLE_CLIENT_ID,
                client_secret=settings.GOOGLE_CLIENT_SECRET,
                scopes=SCOPES
            )
            if creds.expired and creds.refresh_token:
                creds.refresh(Request())
            return gspread.authorize(creds)
        else:
            # Service Account Auth
            import json
            json_str = settings.FIREBASE_SERVICE_ACCOUNT_JSON
            # Strip surrounding single quotes (pydantic may leave them)
            if json_str and json_str.startswith("'") and json_str.endswith("'"):
                json_str = json_str[1:-1]
            cred_dict = json.loads(json_str)
            # Unescape newlines in private key
            if "private_key" in cred_dict:
                cred_dict["private_key"] = cred_dict["private_key"].replace("\\n", "\n")
            return gspread.service_account_from_dict(cred_dict)

    def verify_write_access(self, sheet_id: str, client: gspread.Client) -> bool:
        """Returns True if sheet has Editor access. Raises on network errors."""
        try:
            ws = client.open_by_key(sheet_id).sheet1
            cell_val = ws.cell(1, 1).value
            ws.update_cell(1, 1, cell_val)  # no-op write
            return True
        except gspread.exceptions.APIError as e:
            if "PERMISSION_DENIED" in str(e):
                return False
            raise  # other errors propagate up

    def get_students(self, sheet_id: str, client: gspread.Client) -> list[dict]:
        """Returns all rows with only non-attendance columns."""
        ws = client.open_by_key(sheet_id).sheet1
        headers = ws.row_values(1)
        non_att_headers = [h for h in headers if not is_date_column(h)]
        all_records = ws.get_all_records()
        return [{k: row.get(k, '') for k in non_att_headers} for row in all_records]

    def get_columns(self, sheet_id: str, client: gspread.Client) -> dict:
        ws = client.open_by_key(sheet_id).sheet1
        headers = ws.row_values(1)
        return {
            "all_headers": headers,
            "non_attendance": [h for h in headers if not is_date_column(h)],
            "attendance_dates": [h for h in headers if is_date_column(h)]
        }

    def mark_attendance(self, sheet_id: str, client: gspread.Client, pk_col: str, pk_value: str, date_col: str, att_value: str) -> int:
        ws = client.open_by_key(sheet_id).sheet1
        headers = ws.row_values(1)
        
        try:
            pk_col_idx = headers.index(pk_col) + 1
        except ValueError:
            raise ValueError(f"Primary key column '{pk_col}' not found in sheet")
            
        try:
            date_col_idx = headers.index(date_col) + 1
        except ValueError:
            # We need to create the new date column
            date_col_idx = len(headers) + 1
            ws.update_cell(1, date_col_idx, date_col)
            
        # Find row for pk_value
        pk_values = ws.col_values(pk_col_idx)
        try:
            # +1 for 1-based indexing in gspread
            row_idx = pk_values.index(pk_value) + 1
        except ValueError:
            raise ValueError(f"Student with PK '{pk_value}' not found in sheet")
            
        ws.update_cell(row_idx, date_col_idx, att_value)
        return row_idx

    def batch_mark_attendance(self, sheet_id: str, client: gspread.Client, pk_col: str, marked_values: dict, date_col: str):
        if not marked_values:
            return
            
        ws = client.open_by_key(sheet_id).sheet1
        headers = ws.row_values(1)
        
        try:
            pk_col_idx = headers.index(pk_col) + 1
        except ValueError:
            raise ValueError(f"Primary key column '{pk_col}' not found in sheet")
            
        try:
            date_col_idx = headers.index(date_col) + 1
        except ValueError:
            date_col_idx = len(headers) + 1
            ws.update_cell(1, date_col_idx, date_col)
            
        all_pk = ws.col_values(pk_col_idx)
        
        # Build batch updates
        updates = []
        for pk, att_value in marked_values.items():
            try:
                row_idx = all_pk.index(pk) + 1
                updates.append({
                    'range': gspread.utils.rowcol_to_a1(row_idx, date_col_idx),
                    'values': [[att_value]]
                })
            except ValueError:
                pass # skip pk_values not found
                
        if updates:
            ws.batch_update(updates)

    def add_student(self, sheet_id: str, client: gspread.Client, student_data: dict):
        """Appends a new student row to the sheet."""
        ws = client.open_by_key(sheet_id).sheet1
        headers = ws.row_values(1)
        
        # Prepare row in correct header order
        new_row = []
        for h in headers:
            new_row.append(student_data.get(h, ""))
            
        ws.append_row(new_row)

sheets_service = SheetsService()
