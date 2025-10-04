"""
Main API router combining all v1 endpoints
"""
from fastapi import APIRouter

from .auth import router as auth_router
from .uploads import router as upload_router
from .jobs import router as jobs_router
from .api_keys import router as api_keys_router
from .admin import router as admin_router
from .usage import router as usage_router
from .subscriptions import router as subscriptions_router

api_router = APIRouter()

# Include all routers
api_router.include_router(auth_router)
api_router.include_router(upload_router)
api_router.include_router(jobs_router)
api_router.include_router(api_keys_router)
api_router.include_router(admin_router)
api_router.include_router(usage_router)
api_router.include_router(subscriptions_router)