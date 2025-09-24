"""
Admin endpoints for user and system management
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from pydantic import BaseModel

from ...core.auth import get_current_admin_user
from ...database import get_db
from ...models.user import User, AnalysisJob, UsageLog, AdminNote

router = APIRouter(prefix="/admin", tags=["admin"])

class UserStats(BaseModel):
    id: int
    email: str
    name: str
    role: str
    is_active: bool
    total_analyses: int
    created_at: str
    last_login: str = None

class SystemMetrics(BaseModel):
    total_users: int
    active_users: int
    total_analyses: int
    analyses_today: int
    analyses_this_month: int
    storage_used_mb: float

class AdminNoteCreate(BaseModel):
    note: str
    is_internal: bool = True

@router.get("/users", response_model=List[UserStats])
async def list_users(
    admin_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    role_filter: Optional[str] = Query(None),
    search: Optional[str] = Query(None)
):
    """List all users with stats"""
    
    query = db.query(
        User.id,
        User.email,
        User.full_name,
        User.subscription_tier,
        User.is_active,
        User.created_at,
        func.count(AnalysisJob.id).label('total_analyses')
    ).outerjoin(AnalysisJob).group_by(User.id)
    
    if role_filter:
        query = query.filter(User.subscription_tier == role_filter)
    
    if search:
        query = query.filter(
            User.email.ilike(f"%{search}%") | 
            User.full_name.ilike(f"%{search}%")
        )
    
    users = query.offset(offset).limit(limit).all()
    
    return [
        UserStats(
            id=user.id,
            email=user.email,
            name=user.full_name,
            role=user.subscription_tier,
            is_active=user.is_active,
            total_analyses=user.total_analyses or 0,
            created_at=user.created_at.isoformat(),
            last_login=None  # TODO: Track last login
        )
        for user in users
    ]

@router.get("/metrics", response_model=SystemMetrics)
async def get_system_metrics(
    admin_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Get system-wide metrics"""
    from datetime import datetime, timedelta
    
    today = datetime.utcnow().date()
    month_start = today.replace(day=1)
    
    total_users = db.query(User).count()
    active_users = db.query(User).filter(User.is_active == True).count()
    total_analyses = db.query(AnalysisJob).count()
    
    analyses_today = db.query(AnalysisJob).filter(
        func.date(AnalysisJob.created_at) == today
    ).count()
    
    analyses_this_month = db.query(AnalysisJob).filter(
        AnalysisJob.created_at >= month_start
    ).count()
    
    # Calculate storage usage (placeholder)
    storage_used_mb = db.query(
        func.sum(AnalysisJob.file_size_bytes)
    ).scalar() or 0
    storage_used_mb = storage_used_mb / (1024 * 1024)  # Convert to MB
    
    return SystemMetrics(
        total_users=total_users,
        active_users=active_users,
        total_analyses=total_analyses,
        analyses_today=analyses_today,
        analyses_this_month=analyses_this_month,
        storage_used_mb=round(storage_used_mb, 2)
    )

@router.post("/users/{user_id}/notes")
async def add_admin_note(
    user_id: int,
    note_data: AdminNoteCreate,
    admin_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Add admin note to user"""
    
    # Verify user exists
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    admin_note = AdminNote(
        user_id=user_id,
        admin_id=admin_user.id,
        note=note_data.note,
        is_internal=note_data.is_internal
    )
    
    db.add(admin_note)
    db.commit()
    
    return {"message": "Admin note added successfully"}

@router.patch("/users/{user_id}/role")
async def update_user_role(
    user_id: int,
    new_role: str,
    admin_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Update user role"""
    
    if new_role not in ['free', 'pro', 'enterprise', 'admin']:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid role"
        )
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    old_role = user.subscription_tier
    user.subscription_tier = new_role
    db.commit()
    
    # Log the change
    admin_note = AdminNote(
        user_id=user_id,
        admin_id=admin_user.id,
        note=f"Role changed from {old_role} to {new_role}",
        is_internal=True
    )
    db.add(admin_note)
    db.commit()
    
    return {
        "message": f"User role updated to {new_role}",
        "old_role": old_role,
        "new_role": new_role
    }

@router.patch("/users/{user_id}/status")
async def toggle_user_status(
    user_id: int,
    admin_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Enable/disable user account"""
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    user.is_active = not user.is_active
    db.commit()
    
    # Log the change
    admin_note = AdminNote(
        user_id=user_id,
        admin_id=admin_user.id,
        note=f"Account {'activated' if user.is_active else 'deactivated'}",
        is_internal=True
    )
    db.add(admin_note)
    db.commit()
    
    return {
        "message": f"User {'activated' if user.is_active else 'deactivated'}",
        "is_active": user.is_active
    }