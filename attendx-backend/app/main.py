"""
AttendX — FastAPI Application Entry Point
Initializes the app, CORS, and registers all routers.
Per SRD §13.3 for CORS config.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.config import get_settings
from app.services.firebase_service import init_firebase
from app.routers import auth, admin


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize services on startup."""
    init_firebase()
    yield


app = FastAPI(
    title="AttendX API",
    description="QR-Based People & Attendance Management System",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS
settings = get_settings()
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL, "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(auth.router)
app.include_router(admin.router)


@app.get("/")
async def root():
    return {"status": "ok", "service": "AttendX API", "version": "1.0.0"}


@app.get("/health")
async def health():
    return {"status": "healthy"}
