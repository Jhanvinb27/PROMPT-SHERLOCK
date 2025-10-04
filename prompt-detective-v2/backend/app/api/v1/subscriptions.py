"""
Subscription management API endpoints
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta
from pydantic import BaseModel, EmailStr

from app.database import get_db
from app.models.user import User, Subscription
from app.core.auth import get_current_user

router = APIRouter(prefix="/subscriptions", tags=["subscriptions"])


# Pydantic models
class PlanInfo(BaseModel):
    id: str
    name: str
    price: str
    period: str
    description: str
    features: List[str]
    popular: bool
    
    class Config:
        from_attributes = True


class SubscriptionCreate(BaseModel):
    plan: str  # free, basic, pro, enterprise
    billing_cycle: str  # monthly, yearly


class SubscriptionResponse(BaseModel):
    id: int
    user_id: int
    plan: str
    status: str
    start_date: datetime
    end_date: Optional[datetime]
    auto_renew: bool
    
    class Config:
        from_attributes = True


class WaitlistEntry(BaseModel):
    email: EmailStr
    plan_name: str


# Available plans configuration
PLANS_CONFIG = {
    "free": {
        "id": "free",
        "name": "Free",
        "price": "$0",
        "period": "forever",
        "description": "Perfect for trying out our service",
        "features": [
            "5 analyses per month",
            "Basic image support",
            "Standard processing speed",
            "Email support",
            "Community forum access"
        ],
        "popular": False,
        "daily_limit": 5
    },
    "basic": {
        "id": "basic",
        "name": "Basic",
        "monthly_price": "$9.99",
        "yearly_price": "$99",
        "description": "Great for casual creators",
        "features": [
            "50 analyses per month",
            "Image & video support",
            "Priority processing",
            "Email support",
            "Download results",
            "Basic analytics",
            "48-hour response time"
        ],
        "popular": True,
        "daily_limit": 50
    },
    "pro": {
        "id": "pro",
        "name": "Pro",
        "monthly_price": "$29.99",
        "yearly_price": "$299",
        "description": "For professional content creators",
        "features": [
            "200 analyses per month",
            "All file formats",
            "Fastest processing",
            "Priority support",
            "API access",
            "Batch processing",
            "Custom prompts",
            "Advanced analytics",
            "24-hour response time"
        ],
        "popular": False,
        "daily_limit": 200
    },
    "enterprise": {
        "id": "enterprise",
        "name": "Enterprise",
        "price": "Custom",
        "description": "For teams and businesses",
        "features": [
            "Unlimited analyses",
            "Dedicated infrastructure",
            "Custom integrations",
            "24/7 phone support",
            "SLA guarantee",
            "On-premise deployment",
            "Custom training",
            "Dedicated account manager",
            "White-label options"
        ],
        "popular": False,
        "daily_limit": 9999
    }
}


@router.get("/plans", response_model=List[dict])
async def get_plans(billing_cycle: str = "monthly"):
    """
    Get all available subscription plans
    """
    plans = []
    for plan_id, config in PLANS_CONFIG.items():
        plan_data = config.copy()
        
        # Set price based on billing cycle
        if plan_id in ["basic", "pro"]:
            if billing_cycle == "yearly":
                plan_data["price"] = config["yearly_price"]
                plan_data["period"] = "year"
            else:
                plan_data["price"] = config["monthly_price"]
                plan_data["period"] = "month"
        else:
            plan_data["price"] = config.get("price", "$0")
            plan_data["period"] = config.get("period", "")
            
        plans.append(plan_data)
    
    return plans


@router.get("/current", response_model=SubscriptionResponse)
async def get_current_subscription(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get current user's subscription details
    """
    subscription = db.query(Subscription).filter(
        Subscription.user_id == current_user.id,
        Subscription.status == "active"
    ).first()
    
    if not subscription:
        # Create a default free subscription
        subscription = Subscription(
            user_id=current_user.id,
            plan="free",
            status="active",
            start_date=datetime.utcnow(),
            auto_renew=True
        )
        db.add(subscription)
        db.commit()
        db.refresh(subscription)
    
    return subscription


@router.post("/subscribe", response_model=SubscriptionResponse)
async def create_subscription(
    subscription_data: SubscriptionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a new subscription (placeholder - actual payment integration needed)
    """
    # Validate plan
    if subscription_data.plan not in PLANS_CONFIG:
        raise HTTPException(status_code=400, detail="Invalid plan selected")
    
    # Check if user already has an active subscription
    existing = db.query(Subscription).filter(
        Subscription.user_id == current_user.id,
        Subscription.status == "active"
    ).first()
    
    if existing:
        # Cancel existing subscription
        existing.status = "cancelled"
        existing.end_date = datetime.utcnow()
    
    # Create new subscription
    end_date = None
    if subscription_data.billing_cycle == "monthly":
        end_date = datetime.utcnow() + timedelta(days=30)
    elif subscription_data.billing_cycle == "yearly":
        end_date = datetime.utcnow() + timedelta(days=365)
    
    new_subscription = Subscription(
        user_id=current_user.id,
        plan=subscription_data.plan,
        status="active",
        start_date=datetime.utcnow(),
        end_date=end_date,
        auto_renew=True
    )
    
    # Update user's subscription tier
    current_user.subscription_tier = subscription_data.plan
    
    db.add(new_subscription)
    db.commit()
    db.refresh(new_subscription)
    
    return new_subscription


@router.post("/cancel")
async def cancel_subscription(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Cancel current subscription
    """
    subscription = db.query(Subscription).filter(
        Subscription.user_id == current_user.id,
        Subscription.status == "active"
    ).first()
    
    if not subscription:
        raise HTTPException(status_code=404, detail="No active subscription found")
    
    subscription.status = "cancelled"
    subscription.auto_renew = False
    subscription.end_date = datetime.utcnow()
    
    # Downgrade user to free tier
    current_user.subscription_tier = "free"
    
    db.commit()
    
    return {"message": "Subscription cancelled successfully"}


@router.post("/waitlist")
async def join_waitlist(
    entry: WaitlistEntry,
    db: Session = Depends(get_db)
):
    """
    Add user to waitlist for a specific plan (placeholder for future implementation)
    """
    # In a real implementation, you would:
    # 1. Store email in a waitlist table
    # 2. Send confirmation email
    # 3. Set up email campaign for when plan launches
    
    # For now, just return success
    return {
        "message": f"Successfully added to waitlist for {entry.plan_name}",
        "email": entry.email
    }


@router.get("/limits")
async def get_subscription_limits(
    current_user: User = Depends(get_current_user)
):
    """
    Get the limits for user's current subscription tier
    """
    plan = current_user.subscription_tier or "free"
    config = PLANS_CONFIG.get(plan, PLANS_CONFIG["free"])
    
    return {
        "plan": plan,
        "daily_limit": config["daily_limit"],
        "features": config["features"]
    }
