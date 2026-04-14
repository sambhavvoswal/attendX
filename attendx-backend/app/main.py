from datetime import datetime, timezone

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routers.auth import router as auth_router
from app.routers.admin import router as admin_router
from app.routers.sheets import router as sheets_router
from app.routers.attendance import router as attendance_router

app = FastAPI(title="AttendX API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.FRONTEND_URL,
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/ping")
def ping():
    return {"status": "ok", "timestamp": datetime.now(timezone.utc).isoformat()}


app.include_router(auth_router)
app.include_router(admin_router)
app.include_router(sheets_router)
app.include_router(attendance_router, prefix="/api/attendance", tags=["attendance"])

#comment so that CI(actions) could be tested