from datetime import datetime, timezone

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi.errors import RateLimitExceeded
from slowapi import _rate_limit_exceeded_handler
from app.dependencies import limiter

from app.config import settings
from app.routers.auth import router as auth_router
from app.routers.admin import router as admin_router
from app.routers.sheets import router as sheets_router
from app.routers.attendance import router as attendance_router
from app.routers.qr import router as qr_router

app = FastAPI(title="AttendX API", version="0.1.0")
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

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


@app.get("/")
def root():
    return {
        "message": "AttendX API is live! ✨",
        "docs": "/docs",
        "health": "/ping"
    }


@app.get("/ping")
def ping():
    return {"status": "ok", "timestamp": datetime.now(timezone.utc).isoformat()}


app.include_router(auth_router)
app.include_router(admin_router)
app.include_router(sheets_router)
app.include_router(attendance_router, prefix="/api/attendance", tags=["attendance"])
app.include_router(qr_router)

#comment so that CI(actions) could be tested