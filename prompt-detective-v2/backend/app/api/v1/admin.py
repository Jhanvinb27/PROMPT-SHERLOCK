""""""

Comprehensive Admin API for user management, analytics, and platform controlAdmin endpoints for user and system management

""""""

from fastapi import APIRouter, Depends, HTTPException, status, Queryfrom typing import List, Optional

from sqlalchemy.orm import Sessionfrom fastapi import APIRouter, Depends, HTTPException, status, Query

from sqlalchemy import func, desc, and_from sqlalchemy.orm import Session

from datetime import datetime, timedelta, timezonefrom sqlalchemy import func

from typing import List, Optional, Dict, Anyfrom pydantic import BaseModel

from pydantic import BaseModel, EmailStr

from ...core.auth import get_current_admin_user

from ...database import get_dbfrom ...database import get_db

from ...models.user import User, UsageLog, AnalysisJob, Subscriptionfrom ...models.user import User, AnalysisJob, UsageLog, AdminNote

from ...core.admin import get_current_admin, get_current_super_admin

from ...core.auth import get_password_hashrouter = APIRouter(prefix="/admin", tags=["admin"])



router = APIRouter(prefix="/admin", tags=["admin"])class UserStats(BaseModel):

    id: int

# Pydantic models    email: str

class AdminDashboardStats(BaseModel):    name: str

    total_users: int    role: str

    active_users: int    is_active: bool

    verified_users: int    total_analyses: int

    premium_users: int    created_at: str

    total_analyses: int    last_login: str = None

    analyses_today: int

    total_api_calls: intclass SystemMetrics(BaseModel):

    subscription_breakdown: Dict[str, int]    total_users: int

        active_users: int

class UserDetail(BaseModel):    total_analyses: int

    id: int    analyses_today: int

    email: str    analyses_this_month: int

    full_name: str    storage_used_mb: float

    username: str

    subscription_tier: strclass AdminNoteCreate(BaseModel):

    is_active: bool    note: str

    is_premium: bool    is_internal: bool = True

    is_email_verified: bool

    is_admin: bool@router.get("/users", response_model=List[UserStats])

    is_super_admin: boolasync def list_users(

    api_calls_used: int    admin_user: User = Depends(get_current_admin_user),

    api_calls_limit: int    db: Session = Depends(get_db),

    created_at: datetime    limit: int = Query(50, ge=1, le=200),

    total_analyses: int    offset: int = Query(0, ge=0),

    role_filter: Optional[str] = Query(None),

class UpdateUserRequest(BaseModel):    search: Optional[str] = Query(None)

    is_active: Optional[bool] = None):

    is_premium: Optional[bool] = None    """List all users with stats"""

    subscription_tier: Optional[str] = None    

    api_calls_limit: Optional[int] = None    query = db.query(

        User.id,

@router.get("/dashboard", response_model=AdminDashboardStats)        User.email,

async def get_dashboard(        User.full_name,

    db: Session = Depends(get_db),        User.subscription_tier,

    admin: User = Depends(get_current_admin)        User.is_active,

):        User.created_at,

    """Get admin dashboard statistics"""        func.count(AnalysisJob.id).label('total_analyses')

    now = datetime.now(timezone.utc)    ).outerjoin(AnalysisJob).group_by(User.id)

    today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)    

        if role_filter:

    total_users = db.query(func.count(User.id)).scalar()        query = query.filter(User.subscription_tier == role_filter)

    active_users = db.query(func.count(User.id)).filter(User.is_active == True).scalar()    

    verified_users = db.query(func.count(User.id)).filter(User.is_email_verified == True).scalar()    if search:

    premium_users = db.query(func.count(User.id)).filter(User.is_premium == True).scalar()        query = query.filter(

    total_analyses = db.query(func.count(AnalysisJob.id)).scalar()            User.email.ilike(f"%{search}%") | 

    analyses_today = db.query(func.count(AnalysisJob.id)).filter(            User.full_name.ilike(f"%{search}%")

        AnalysisJob.created_at >= today_start        )

    ).scalar()    

    total_api_calls = db.query(func.sum(User.api_calls_used)).scalar() or 0    users = query.offset(offset).limit(limit).all()

        

    subscription_breakdown = {}    return [

    for tier in ["free", "pro", "enterprise"]:        UserStats(

        count = db.query(func.count(User.id)).filter(User.subscription_tier == tier).scalar()            id=user.id,

        subscription_breakdown[tier] = count            email=user.email,

                name=user.full_name,

    return AdminDashboardStats(            role=user.subscription_tier,

        total_users=total_users,            is_active=user.is_active,

        active_users=active_users,            total_analyses=user.total_analyses or 0,

        verified_users=verified_users,            created_at=user.created_at.isoformat(),

        premium_users=premium_users,            last_login=None  # TODO: Track last login

        total_analyses=total_analyses,        )

        analyses_today=analyses_today,        for user in users

        total_api_calls=total_api_calls,    ]

        subscription_breakdown=subscription_breakdown

    )@router.get("/metrics", response_model=SystemMetrics)

async def get_system_metrics(

@router.get("/users", response_model=List[UserDetail])    admin_user: User = Depends(get_current_admin_user),

async def get_users(    db: Session = Depends(get_db)

    skip: int = Query(0, ge=0),):

    limit: int = Query(50, ge=1, le=500),    """Get system-wide metrics"""

    search: Optional[str] = None,    from datetime import datetime, timedelta

    db: Session = Depends(get_db),    

    admin: User = Depends(get_current_admin)    today = datetime.utcnow().date()

):    month_start = today.replace(day=1)

    """Get all users with filtering"""    

    query = db.query(User)    total_users = db.query(User).count()

        active_users = db.query(User).filter(User.is_active == True).count()

    if search:    total_analyses = db.query(AnalysisJob).count()

        search_filter = f"%{search}%"    

        query = query.filter(    analyses_today = db.query(AnalysisJob).filter(

            (User.email.ilike(search_filter)) |        func.date(AnalysisJob.created_at) == today

            (User.full_name.ilike(search_filter)) |    ).count()

            (User.username.ilike(search_filter))    

        )    analyses_this_month = db.query(AnalysisJob).filter(

            AnalysisJob.created_at >= month_start

    users = query.order_by(desc(User.created_at)).offset(skip).limit(limit).all()    ).count()

        

    result = []    # Calculate storage usage (placeholder)

    for user in users:    storage_used_mb = db.query(

        total_analyses = db.query(func.count(AnalysisJob.id)).filter(        func.sum(AnalysisJob.file_size_bytes)

            AnalysisJob.user_id == user.id    ).scalar() or 0

        ).scalar()    storage_used_mb = storage_used_mb / (1024 * 1024)  # Convert to MB

            

        result.append(UserDetail(    return SystemMetrics(

            id=user.id,        total_users=total_users,

            email=user.email,        active_users=active_users,

            full_name=user.full_name,        total_analyses=total_analyses,

            username=user.username,        analyses_today=analyses_today,

            subscription_tier=user.subscription_tier,        analyses_this_month=analyses_this_month,

            is_active=user.is_active,        storage_used_mb=round(storage_used_mb, 2)

            is_premium=user.is_premium,    )

            is_email_verified=user.is_email_verified,

            is_admin=user.is_admin,@router.post("/users/{user_id}/notes")

            is_super_admin=user.is_super_admin,async def add_admin_note(

            api_calls_used=user.api_calls_used,    user_id: int,

            api_calls_limit=user.api_calls_limit,    note_data: AdminNoteCreate,

            created_at=user.created_at,    admin_user: User = Depends(get_current_admin_user),

            total_analyses=total_analyses    db: Session = Depends(get_db)

        ))):

        """Add admin note to user"""

    return result    

    # Verify user exists

@router.put("/users/{user_id}")    user = db.query(User).filter(User.id == user_id).first()

async def update_user(    if not user:

    user_id: int,        raise HTTPException(

    update_data: UpdateUserRequest,            status_code=status.HTTP_404_NOT_FOUND,

    db: Session = Depends(get_db),            detail="User not found"

    admin: User = Depends(get_current_super_admin)        )

):    

    """Update user properties"""    admin_note = AdminNote(

    user = db.query(User).filter(User.id == user_id).first()        user_id=user_id,

            admin_id=admin_user.id,

    if not user:        note=note_data.note,

        raise HTTPException(status_code=404, detail="User not found")        is_internal=note_data.is_internal

        )

    if update_data.is_active is not None:    

        user.is_active = update_data.is_active    db.add(admin_note)

    if update_data.is_premium is not None:    db.commit()

        user.is_premium = update_data.is_premium    

    if update_data.subscription_tier:    return {"message": "Admin note added successfully"}

        user.subscription_tier = update_data.subscription_tier

    if update_data.api_calls_limit is not None:@router.patch("/users/{user_id}/role")

        user.api_calls_limit = update_data.api_calls_limitasync def update_user_role(

        user_id: int,

    user.updated_at = datetime.now(timezone.utc)    new_role: str,

    db.commit()    admin_user: User = Depends(get_current_admin_user),

        db: Session = Depends(get_db)

    return {"message": "User updated successfully"}):

    """Update user role"""

@router.post("/users/{user_id}/toggle-premium")    

async def toggle_premium(    if new_role not in ['free', 'pro', 'enterprise', 'admin']:

    user_id: int,        raise HTTPException(

    db: Session = Depends(get_db),            status_code=status.HTTP_400_BAD_REQUEST,

    admin: User = Depends(get_current_admin)            detail="Invalid role"

):        )

    """Toggle user premium status"""    

    user = db.query(User).filter(User.id == user_id).first()    user = db.query(User).filter(User.id == user_id).first()

    if not user:    if not user:

        raise HTTPException(status_code=404, detail="User not found")        raise HTTPException(

                status_code=status.HTTP_404_NOT_FOUND,

    user.is_premium = not user.is_premium            detail="User not found"

    db.commit()        )

        

    return {"is_premium": user.is_premium}    old_role = user.subscription_tier

    user.subscription_tier = new_role

@router.post("/users/{user_id}/reset-usage")    db.commit()

async def reset_usage(    

    user_id: int,    # Log the change

    db: Session = Depends(get_db),    admin_note = AdminNote(

    admin: User = Depends(get_current_admin)        user_id=user_id,

):        admin_id=admin_user.id,

    """Reset user API usage"""        note=f"Role changed from {old_role} to {new_role}",

    user = db.query(User).filter(User.id == user_id).first()        is_internal=True

    if not user:    )

        raise HTTPException(status_code=404, detail="User not found")    db.add(admin_note)

        db.commit()

    user.api_calls_used = 0    

    db.commit()    return {

            "message": f"User role updated to {new_role}",

    return {"message": "Usage reset successfully"}        "old_role": old_role,

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