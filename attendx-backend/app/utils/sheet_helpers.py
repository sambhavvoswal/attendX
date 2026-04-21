import re

DATE_COL_REGEX = re.compile(r'^\d{4}-\d{2}-\d{2}$')

def is_date_column(header: str) -> bool:
    return bool(DATE_COL_REGEX.match(header))

def extract_sheet_id_from_url(url: str) -> str:
    """Extracts the Google Sheet ID from a full URL."""
    match = re.search(r'/spreadsheets/d/([a-zA-Z0-9_-]+)', url)
    if not match:
        raise ValueError("Not a valid Google Sheet URL")
    return match.group(1)

def check_sheet_access(sheet: dict, current_user: dict) -> bool:
    """Verifies if the current user has lateral/vertical access to view or modify a specific sheet."""
    if current_user.get("role") == "super_admin":
        return True
    
    # Organization Level Sharing (if both have an org_id, they can share)
    sheet_org = sheet.get("org_id")
    user_org = current_user.get("org_id")
    
    if sheet_org and user_org and sheet_org == user_org:
        return True
        
    return sheet.get("owner_uid") == current_user.get("uid")
