"""
AttendX — Firebase Service
Handles Firebase Admin SDK initialization and Firestore CRUD operations.
"""
import firebase_admin
from firebase_admin import credentials, firestore, auth as firebase_auth
from app.config import get_settings

_firebase_app = None
_db = None


def init_firebase():
    """Initialize Firebase Admin SDK. Called once at app startup."""
    global _firebase_app, _db
    if _firebase_app is not None:
        return

    settings = get_settings()
    cred = credentials.Certificate(settings.firebase_credentials)
    _firebase_app = firebase_admin.initialize_app(cred)
    _db = firestore.client()


def get_db():
    """Get Firestore client instance."""
    global _db
    if _db is None:
        init_firebase()
    return _db


# ──────────────────────────────────────────────
# User CRUD
# ──────────────────────────────────────────────

def get_user_doc(uid: str) -> dict | None:
    """Fetch a user document from Firestore by UID."""
    db = get_db()
    doc = db.collection("users").document(uid).get()
    if doc.exists:
        return doc.to_dict()
    return None


def create_user_doc(uid: str, data: dict) -> dict:
    """Create a new user document in Firestore."""
    db = get_db()
    db.collection("users").document(uid).set(data)
    return data


def update_user_doc(uid: str, data: dict) -> None:
    """Update fields on an existing user document."""
    db = get_db()
    db.collection("users").document(uid).update(data)


def get_users_by_status(status: str, org_id: str | None = None) -> list[dict]:
    """Get all users with a given status, optionally filtered by org_id."""
    db = get_db()
    query = db.collection("users").where("status", "==", status)
    if org_id:
        query = query.where("org_id", "==", org_id)

    results = []
    for doc in query.stream():
        user = doc.to_dict()
        user["uid"] = doc.id
        results.append(user)
    return results


def get_all_users(org_id: str | None = None) -> list[dict]:
    """Get all users, optionally filtered by org_id."""
    db = get_db()
    query = db.collection("users")
    if org_id:
        query = query.where("org_id", "==", org_id)

    results = []
    for doc in query.stream():
        user = doc.to_dict()
        user["uid"] = doc.id
        results.append(user)
    return results


def delete_user_doc(uid: str) -> None:
    """Delete a user document from Firestore."""
    db = get_db()
    db.collection("users").document(uid).delete()


# ──────────────────────────────────────────────
# Org CRUD
# ──────────────────────────────────────────────

def create_org_doc(data: dict) -> str:
    """Create a new org document. Returns the auto-generated ID."""
    db = get_db()
    doc_ref = db.collection("orgs").add(data)
    return doc_ref[1].id


def get_org_doc(org_id: str) -> dict | None:
    """Fetch an org document by ID."""
    db = get_db()
    doc = db.collection("orgs").document(org_id).get()
    if doc.exists:
        data = doc.to_dict()
        data["org_id"] = doc.id
        return data
    return None


def get_orgs_by_admin(admin_uid: str) -> list[dict]:
    """Get all orgs managed by a specific admin."""
    db = get_db()
    results = []
    for doc in db.collection("orgs").where("admin_uid", "==", admin_uid).stream():
        org = doc.to_dict()
        org["org_id"] = doc.id
        results.append(org)
    return results


def update_org_doc(org_id: str, data: dict) -> None:
    """Update fields on an existing org document."""
    db = get_db()
    db.collection("orgs").document(org_id).update(data)


def delete_org_doc(org_id: str) -> None:
    """Delete an org document from Firestore."""
    db = get_db()
    db.collection("orgs").document(org_id).delete()
