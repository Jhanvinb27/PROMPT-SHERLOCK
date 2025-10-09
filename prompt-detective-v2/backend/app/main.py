"""
FastAPI main application entry point
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager

from .core.config import settings
from .api.v1.router import api_router
from .database import engine, Base

# Create tables on startup
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    Base.metadata.create_all(bind=engine)
    yield
    # Shutdown - cleanup if needed

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    debug=settings.DEBUG,
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(api_router, prefix="/api/v1")

# Health check
@app.get("/health")
async def health_check():
    return {"status": "healthy", "version": settings.APP_VERSION}

# Serve static files (thumbnails, etc.)
import os
from pathlib import Path

try:
    backend_root = Path(__file__).resolve().parent.parent

    # Serve thumbnails - from backend/thumbnails directory
    backend_thumbnails_path = backend_root / "thumbnails"
    if backend_thumbnails_path.exists():
        app.mount("/static/thumbnails", StaticFiles(directory=str(backend_thumbnails_path)), name="thumbnails")
        print(f"✅ Serving thumbnails from: {backend_thumbnails_path}")

    # Serve uploaded files when using local storage
    upload_dir = Path(settings.UPLOAD_DIR)
    if not upload_dir.is_absolute():
        upload_dir = (backend_root / upload_dir).resolve()

    upload_dir.mkdir(parents=True, exist_ok=True)
    app.mount("/static/uploads", StaticFiles(directory=str(upload_dir)), name="uploads")
    print(f"✅ Serving uploads from: {upload_dir}")

except Exception as e:
    print(f"Warning: Could not mount static files: {e}")
    pass  # Static directories might not exist in development

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG
    )