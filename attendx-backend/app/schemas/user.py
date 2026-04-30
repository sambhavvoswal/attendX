from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class UserResponse(BaseModel):
    uid: str
    email: str
    name: str
    org_name: str
    org_id: str
    role: str
    status: str
    auth_provider: str
    created_at: datetime
    disabled_at: Optional[datetime] = None
    disabled_by: Optional[str] = None

class UserMoveOrg(BaseModel):
    org_id: str

class UserRoleUpdate(BaseModel):
    role: str
    org_id: str
