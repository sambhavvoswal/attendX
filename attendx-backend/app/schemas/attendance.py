from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Any

class SessionStartRequest(BaseModel):
    sheet_id: str
    date: str

class SessionEndRequest(BaseModel):
    session_id: str
    sheet_id: str
    date_column: str
    marked_values: Dict[str, str] # e.g. {"79": "P", "80": "A"}
    value_counts: Dict[str, int]
    unmarked_default: str  # "empty" or "absent"
    absent_value: Optional[str] = None
