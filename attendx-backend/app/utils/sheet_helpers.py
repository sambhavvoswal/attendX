"""
AttendX — Sheet Helpers
Utility functions for column detection, date-col logic, etc.
"""
import re
from datetime import datetime


def is_date_column(header: str) -> bool:
    """
    Check if a column header is an attendance date column (ISO format YYYY-MM-DD).
    Non-date columns are student data columns.
    """
    try:
        datetime.strptime(header.strip(), "%Y-%m-%d")
        return True
    except ValueError:
        return False


def extract_sheet_id_from_url(url: str) -> str:
    """
    Extract Google Sheets ID from a full URL.
    Handles: https://docs.google.com/spreadsheets/d/{SHEET_ID}/edit...
    """
    match = re.search(r'/spreadsheets/d/([a-zA-Z0-9-_]+)', url)
    if not match:
        raise ValueError("Invalid Google Sheets URL. Expected format: https://docs.google.com/spreadsheets/d/{id}/...")
    return match.group(1)


def get_date_columns(headers: list[str]) -> list[str]:
    """Return only date-format column headers."""
    return [h for h in headers if is_date_column(h)]


def get_non_date_columns(headers: list[str]) -> list[str]:
    """Return only non-date (student data) column headers."""
    return [h for h in headers if not is_date_column(h)]


def calculate_attendance_pct(row: dict, date_columns: list[str]) -> float:
    """
    Calculate attendance percentage for a single student row.
    P = present, A = absent, empty = not recorded (excluded from calculation).
    """
    if not date_columns:
        return 0.0

    total_sessions = 0
    present_count = 0

    for col in date_columns:
        val = str(row.get(col, "")).strip().upper()
        if val in ("P", "A"):
            total_sessions += 1
            if val == "P":
                present_count += 1

    if total_sessions == 0:
        return 0.0

    return round((present_count / total_sessions) * 100, 1)
