import json
from datetime import datetime, timezone
from functools import lru_cache
from typing import Any, Optional

import firebase_admin
from firebase_admin import auth as firebase_auth
from firebase_admin import credentials, firestore

from app.config import settings


def _init_firebase():
    if not settings.FIREBASE_SERVICE_ACCOUNT_JSON:
        raise RuntimeError(
            "Missing FIREBASE_SERVICE_ACCOUNT_JSON. "
            "Set it in attendx-backend/.env (see .env.example)."
        )

    if not firebase_admin._apps:
        print("Initializing Firebase Admin SDK...")
        json_str = settings.FIREBASE_SERVICE_ACCOUNT_JSON
        # Remove surrounding single quotes if Pydantic didn't handle them
        if json_str.startswith("'") and json_str.endswith("'"):
            json_str = json_str[1:-1]
            
        cred_dict = json.loads(json_str)
        
        # Unescape newlines in private key
        if "private_key" in cred_dict:
            cred_dict["private_key"] = cred_dict["private_key"].replace("\\n", "\n")
            
        firebase_admin.initialize_app(credentials.Certificate(cred_dict))
        print("Firebase Admin SDK initialized successfully.")

@lru_cache(maxsize=1)
def get_firestore_client() -> firestore.Client:
    _init_firebase()
    return firestore.client()


def verify_firebase_id_token(id_token: str) -> dict[str, Any]:
    _init_firebase()
    return firebase_auth.verify_id_token(id_token)


def now_ts() -> datetime:
    return datetime.now(timezone.utc)


def get_user_doc(uid: str) -> Optional[dict[str, Any]]:
    db = get_firestore_client()
    print(f"Fetching user doc for UID: {uid}...")
    snap = db.collection("users").document(uid).get()
    if not snap.exists:
        print(f"User doc not found for UID: {uid}")
        return None
    print(f"User doc found for UID: {uid}")
    return snap.to_dict() or None


def create_org_doc(owner_uid: str, org_name: str) -> dict[str, Any]:
    db = get_firestore_client()
    ref = db.collection("orgs").document()
    data = {
        "org_id": ref.id,
        "name": org_name,
        "description": "",
        "owner_uid": owner_uid,
        "created_at": now_ts(),
        "sheet_count": 0,
    }
    ref.set(data)
    return data


def create_user_doc(
    *,
    uid: str,
    email: str,
    name: str,
    org_name: str,
    org_id: str,
    auth_provider: str,
    role: str = "user",
    status: str = "pending_approval",
) -> dict[str, Any]:
    db = get_firestore_client()
    data = {
        "uid": uid,
        "email": email,
        "name": name,
        "org_name": org_name,
        "org_id": org_id,
        "role": role,
        "status": status,
        "auth_provider": auth_provider,
        "created_at": now_ts(),
        "disabled_at": None,
        "disabled_by": None,
    }
    db.collection("users").document(uid).set(data)
    return data

def get_users(org_id: Optional[str] = None, status: Optional[str] = None) -> list[dict[str, Any]]:
    db = get_firestore_client()
    query = db.collection("users")
    if org_id:
        query = query.where("org_id", "==", org_id)
    if status:
        query = query.where("status", "==", status)
    
    docs = query.stream()
    return [doc.to_dict() for doc in docs]

def update_user_status(uid: str, status: str, disabled_by: Optional[str] = None) -> Optional[dict]:
    db = get_firestore_client()
    ref = db.collection("users").document(uid)
    snap = ref.get()
    if not snap.exists:
        return None
    updates = {
        "status": status,
        "disabled_at": now_ts() if status == "disabled" else None,
        "disabled_by": disabled_by if status == "disabled" else None
    }
    ref.update(updates)
    return {**snap.to_dict(), **updates}

def delete_user(uid: str) -> bool:
    db = get_firestore_client()
    ref = db.collection("users").document(uid)
    if not ref.get().exists:
        return False
    ref.delete()
    return True

def update_user_org(uid: str, org_id: str) -> Optional[dict]:
    db = get_firestore_client()
    ref = db.collection("users").document(uid)
    snap = ref.get()
    if not snap.exists:
        return None
    ref.update({"org_id": org_id})
    return {**snap.to_dict(), "org_id": org_id}

def get_orgs() -> list[dict]:
    db = get_firestore_client()
    return [doc.to_dict() for doc in db.collection("orgs").stream()]

def get_org(org_id: str) -> Optional[dict]:
    db = get_firestore_client()
    snap = db.collection("orgs").document(org_id).get()
    return snap.to_dict() if snap.exists else None

def update_org(org_id: str, updates: dict) -> Optional[dict]:
    db = get_firestore_client()
    ref = db.collection("orgs").document(org_id)
    snap = ref.get()
    if not snap.exists:
        return None
    ref.update(updates)
    return {**snap.to_dict(), **updates}

def delete_org(org_id: str) -> bool:
    db = get_firestore_client()
    ref = db.collection("orgs").document(org_id)
    if not ref.get().exists:
        return False
    ref.delete()
    return True

def create_sheet(sheet_data: dict) -> dict:
    db = get_firestore_client()
    ref = db.collection("sheets").document()
    doc_data = {
        **sheet_data,
        "sheet_id": ref.id,
        "created_at": now_ts(),
        "last_accessed": now_ts()
    }
    ref.set(doc_data)
    
    # Also increment sheet count on org
    if "org_id" in sheet_data:
        org_ref = db.collection("orgs").document(sheet_data["org_id"])
        org_ref.update({"sheet_count": firestore.Increment(1)})

    return doc_data

def get_user_sheets(uid: str, org_id: Optional[str] = None) -> list[dict]:
    db = get_firestore_client()
    if org_id:
        docs = db.collection("sheets").where("org_id", "==", org_id).stream()
        results = [doc.to_dict() for doc in docs]
        results.sort(key=lambda x: x.get("last_accessed", 0), reverse=True)
        return results
    else:
        docs = db.collection("sheets").where("owner_uid", "==", uid).order_by("last_accessed", direction=firestore.Query.DESCENDING).stream()
        return [doc.to_dict() for doc in docs]

def get_recent_sheets(uid: str, org_id: Optional[str] = None, limit: int = 5) -> list[dict]:
    db = get_firestore_client()
    if org_id:
        docs = db.collection("sheets").where("org_id", "==", org_id).stream()
        results = [doc.to_dict() for doc in docs]
        results.sort(key=lambda x: x.get("last_accessed", 0), reverse=True)
        return results[:limit]
    else:
        docs = db.collection("sheets").where("owner_uid", "==", uid).order_by("last_accessed", direction=firestore.Query.DESCENDING).limit(limit).stream()
        return [doc.to_dict() for doc in docs]

def get_sheet(sheet_id: str) -> Optional[dict]:
    db = get_firestore_client()
    snap = db.collection("sheets").document(sheet_id).get()
    return snap.to_dict() if snap.exists else None

def update_sheet(sheet_id: str, updates: dict) -> Optional[dict]:
    db = get_firestore_client()
    ref = db.collection("sheets").document(sheet_id)
    snap = ref.get()
    if not snap.exists:
        return None
    if updates:
        ref.update(updates)
    return {**snap.to_dict(), **updates}

def delete_sheet(sheet_id: str) -> bool:
    db = get_firestore_client()
    ref = db.collection("sheets").document(sheet_id)
    snap = ref.get()
    if not snap.exists:
        return False
    
    doc_data = snap.to_dict()
    ref.delete()

    if "org_id" in doc_data:
        org_ref = db.collection("orgs").document(doc_data["org_id"])
        try:
            org_ref.update({"sheet_count": firestore.Increment(-1)})
        except Exception:
            pass # Org may not exist

    return True

def update_sheet_attendance_values(sheet_id: str, values: list) -> Optional[dict]:
    return update_sheet(sheet_id, {"attendance_values": values})

def get_session(session_id: str) -> Optional[dict]:
    db = get_firestore_client()
    snap = db.collection("attendance_sessions").document(session_id).get()
    return snap.to_dict() if snap.exists else None

def get_session_by_sheet_and_date(sheet_id: str, date_column: str) -> Optional[dict]:
    db = get_firestore_client()
    docs = db.collection("attendance_sessions").where("sheet_id", "==", sheet_id).where("date_column", "==", date_column).limit(1).stream()
    docs_list = list(docs)
    if not docs_list:
        return None
    return docs_list[0].to_dict()

def create_session(sheet_id: str, org_id: str, owner_uid: str, date_column: str, total_students: int) -> dict:
    db = get_firestore_client()
    ref = db.collection("attendance_sessions").document()
    doc_data = {
        "session_id": ref.id,
        "sheet_id": sheet_id,
        "org_id": org_id,
        "owner_uid": owner_uid,
        "date": date_column,
        "date_column": date_column,
        "total_students": total_students,
        "value_counts": {},
        "scanned_ids": [],
        "manually_marked_ids": [],
        "unmarked_default": "empty",
        "created_at": now_ts(),
        "ended_at": None
    }
    ref.set(doc_data)
    return doc_data

def update_session(session_id: str, updates: dict) -> Optional[dict]:
    db = get_firestore_client()
    ref = db.collection("attendance_sessions").document(session_id)
    snap = ref.get()
    if not snap.exists:
        return None
    ref.update(updates)
    return {**snap.to_dict(), **updates}
