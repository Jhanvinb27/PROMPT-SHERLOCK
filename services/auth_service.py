"""
Authentication and session management for Streamlit app (email + OAuth placeholders)
"""
from __future__ import annotations
import streamlit as st
import secrets
import hashlib
from typing import Optional, Dict, Any
from datetime import datetime, timedelta
from services.db import db
from models.user import User, SubscriptionPlan, Subscription, UsageLog

SESSION_TTL_MIN = 720  # 12h


def _hash_password(password: str) -> str:
    return hashlib.sha256(password.encode("utf-8")).hexdigest()


def signup(email: str, password: str, name: str = "") -> Dict[str, Any]:
    if db.get_user_by_email(email):
        return {"error": "Email already registered"}
    user = User(
        id=None,  # will be set by DB
        email=email.lower(),
        password_hash=_hash_password(password),
        name=name or email.split("@")[0],
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )
    user = db.save_user(user)  # capture generated id
    # Auto-create free plan subscription
    plan = db.get_plan("free") or db.create_default_plans()
    plan = db.get_plan("free")
    if not user.id:
        return {"error": "Failed to create user (no id returned)"}
    sub = Subscription(
        id=None,
        user_id=user.id,
        plan_id=plan.id if plan else None,
        status="active",
        started_at=datetime.utcnow(),
        renewal_at=datetime.utcnow() + timedelta(days=30),
    )
    try:
        db.save_subscription(sub)
    except Exception as e:
        return {"error": f"User created but subscription failed: {e}"}
    return {"ok": True}


def login(email: str, password: str) -> Dict[str, Any]:
    user = db.get_user_by_email(email.lower())
    if not user or user.password_hash != _hash_password(password):
        return {"error": "Invalid credentials"}
    token = secrets.token_urlsafe(32)
    st.session_state.auth = {
        "token": token,
        "user_id": user.id,
        "email": user.email,
        "name": user.name,
        "expires_at": (datetime.utcnow() + timedelta(minutes=SESSION_TTL_MIN)).isoformat(),
    }
    return {"ok": True}


def logout():
    st.session_state.pop("auth", None)


def current_user() -> Optional[User]:
    data = st.session_state.get("auth")
    if not data:
        return None
    # TTL check
    try:
        if datetime.utcnow() > datetime.fromisoformat(data["expires_at"]):
            logout();
            return None
    except Exception:
        pass
    return db.get_user_by_id(data["user_id"]) if data else None


def ensure_auth():
    if not current_user():
        st.switch_page("pages/01_🔐_Login.py")


def track_usage(user_id: int, action: str, meta: Optional[dict] = None):
    log = UsageLog(
        id=db.next_id("usage"),
        user_id=user_id,
        action=action,
        meta=meta or {},
        created_at=datetime.utcnow(),
    )
    db.save_usage(log)


def can_analyze(user: User) -> tuple[bool, str]:
    # Free plan: 5 analyses/day unless subscribed
    plan = db.get_user_active_plan(user.id)
    daily_limit = plan.daily_analyses if plan else 5
    used = db.count_user_daily_analyses(user.id)
    if used >= daily_limit:
        return False, f"Daily limit reached: {used}/{daily_limit}. Upgrade to continue."
    return True, f"{used}/{daily_limit} used today"
