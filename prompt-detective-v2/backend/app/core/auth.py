"""
Enhanced authentication system with JWT, OAuth, and security features
"""
import os
from datetime import datetime, timedelta
from typing import Any, Dict, Optional, Union
import jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy import func
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr

from .config import settings
from ..database import get_db
from ..models.user import User
from ..services.email import send_password_reset_email
from ..services.otp_service import create_otp, verify_otp
from ..services.email_service import send_verification_email, send_password_reset_otp_email, send_welcome_email

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT security
security = HTTPBearer()

class TokenData(BaseModel):
    email: Optional[str] = None
    user_id: Optional[int] = None

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str = ""
    username: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int
    user: Dict[str, Any]

class GoogleOAuthRequest(BaseModel):
    code: str
    redirect_uri: str

class PasswordResetRequest(BaseModel):
    email: EmailStr

class PasswordResetConfirm(BaseModel):
    email: EmailStr
    otp_code: str
    new_password: str

class PasswordResetVerifyOTP(BaseModel):
    email: EmailStr
    otp_code: str

class EmailVerificationRequest(BaseModel):
    email: EmailStr

class EmailVerificationConfirm(BaseModel):
    email: EmailStr
    otp_code: str


def _normalize_email(email: str) -> str:
    """Normalize emails for consistent lookups."""
    return (email or "").strip().lower()


def _serialize_user(user: User) -> Dict[str, Any]:
    """Serialize a User ORM model into the API response format."""
    return {
        "id": str(user.id),
        "email": user.email,
        "full_name": user.full_name,
        "username": user.username,
        "is_active": user.is_active,
        "is_premium": user.is_premium,
        "is_email_verified": getattr(user, "is_email_verified", False),
        "is_admin": getattr(user, "is_admin", False),
        "is_super_admin": getattr(user, "is_super_admin", False),
        "is_on_trial": getattr(user, "is_on_trial", False),
        "trial_started_at": user.trial_started_at.isoformat() if getattr(user, "trial_started_at", None) else None,
        "trial_ends_at": user.trial_ends_at.isoformat() if getattr(user, "trial_ends_at", None) else None,
        "has_used_trial": getattr(user, "has_used_trial", False),
        "api_calls_limit": user.api_calls_limit,
        "api_calls_used": user.api_calls_used,
        "subscription_tier": user.subscription_tier,
        "created_at": user.created_at.isoformat() if user.created_at else "",
    }

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against its hash - supports both old and new formats"""
    try:
        # Try bcrypt verification first (new format)
        return pwd_context.verify(plain_password, hashed_password)
    except Exception:
        # Fall back to legacy hash verification for old passwords
        import hashlib
        # Check if it's a legacy SHA256 hash
        legacy_hash = hashlib.sha256(plain_password.encode()).hexdigest()
        if legacy_hash == hashed_password:
            return True
        
        # Check if it's a legacy MD5 hash
        legacy_md5 = hashlib.md5(plain_password.encode()).hexdigest()
        if legacy_md5 == hashed_password:
            return True
        
        return False

def get_password_hash(password: str) -> str:
    """Hash a password for storing"""
    return pwd_context.hash(password)

def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """Create JWT access token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(hours=settings.ACCESS_TOKEN_EXPIRE_HOURS)
    
    to_encode.update({"exp": expire, "type": "access"})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def create_refresh_token(data: Dict[str, Any]) -> str:
    """Create JWT refresh token"""
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire, "type": "refresh"})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def verify_token(token: str, token_type: str = "access") -> Optional[TokenData]:
    """Verify and decode JWT token"""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        if payload.get("type") != token_type:
            return None
        
        email: str = payload.get("sub")
        user_id: int = payload.get("user_id")
        
        if email is None or user_id is None:
            return None
            
        return TokenData(email=email, user_id=user_id)
    except jwt.PyJWTError:
        return None

def create_password_reset_token(email: str) -> str:
    """Create password reset token"""
    data = {"sub": email, "type": "password_reset"}
    expire = datetime.utcnow() + timedelta(hours=1)  # 1 hour expiry
    data.update({"exp": expire})
    return jwt.encode(data, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

def verify_password_reset_token(token: str) -> Optional[str]:
    """Verify password reset token and return email"""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        if payload.get("type") != "password_reset":
            return None
        return payload.get("sub")
    except jwt.PyJWTError:
        return None

def authenticate_user(db: Session, email: str, password: str) -> Optional[User]:
    """Authenticate user with email and password"""
    normalized_email = _normalize_email(email)
    user = (
        db.query(User)
        .filter(func.lower(User.email) == normalized_email)
        .first()
    )
    if not user:
        return None
    if not verify_password(password, user.password_hash):
        return None
    return user

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    """Get current user from JWT token"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    token_data = verify_token(credentials.credentials)
    if token_data is None:
        raise credentials_exception
    
    user = db.query(User).filter(User.id == token_data.user_id).first()
    if user is None:
        raise credentials_exception
    
    return user

def get_current_active_user(current_user: User = Depends(get_current_user)) -> User:
    """Get current active user"""
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user

def get_current_admin_user(current_user: User = Depends(get_current_active_user)) -> User:
    """Get current admin user"""
    if current_user.subscription_tier not in ["admin", "enterprise"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    return current_user

async def google_oauth_callback(code: str, redirect_uri: str) -> Dict[str, Any]:
    """
    Handle Google OAuth callback
    TODO: Implement actual Google OAuth flow
    """
    # Placeholder implementation
    # In production, exchange code for tokens and get user info
    google_client_id = os.getenv("GOOGLE_CLIENT_ID")
    google_client_secret = os.getenv("GOOGLE_CLIENT_SECRET")
    
    if not google_client_id or not google_client_secret:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Google OAuth not configured"
        )
    
    # TODO: Implement Google OAuth token exchange
    # 1. Exchange code for access token
    # 2. Get user info from Google API
    # 3. Create or update user in database
    # 4. Return JWT tokens
    
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Google OAuth implementation pending"
    )

def signup_user(db: Session, user_data: UserCreate) -> TokenResponse:
    """Register new user and return tokens"""
    email = _normalize_email(user_data.email)
    # Check if user exists
    if (
        db.query(User)
        .filter(func.lower(User.email) == email)
        .first()
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Validate password strength
    if len(user_data.password) < 8:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 8 characters long"
        )
    
    # Create user
    hashed_password = get_password_hash(user_data.password)
    full_name = user_data.full_name or email.split("@")[0]
    username = user_data.username or email.split("@")[0]
    user = User(
        email=email,
        password_hash=hashed_password,
        full_name=full_name,
        username=username,
        subscription_tier="free",
        is_active=True,
        is_premium=False,
        api_calls_used=0,
        api_calls_limit=50
    )
    
    db.add(user)
    db.commit()
    db.refresh(user)
    
    # Create tokens
    access_token = create_access_token(
        data={"sub": user.email, "user_id": user.id}
    )
    refresh_token = create_refresh_token(
        data={"sub": user.email, "user_id": user.id}
    )
    
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        expires_in=settings.ACCESS_TOKEN_EXPIRE_HOURS * 3600,
        user=_serialize_user(user)
    )

def login_user(db: Session, login_data: UserLogin) -> TokenResponse:
    """Login user and return tokens"""
    user = authenticate_user(db, login_data.email, login_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Account is inactive"
        )
    
    # Create tokens
    access_token = create_access_token(
        data={"sub": user.email, "user_id": user.id}
    )
    refresh_token = create_refresh_token(
        data={"sub": user.email, "user_id": user.id}
    )
    
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        expires_in=settings.ACCESS_TOKEN_EXPIRE_HOURS * 3600,
        user=_serialize_user(user)
    )

def refresh_access_token(refresh_token: str, db: Session) -> TokenResponse:
    """Refresh access token using refresh token"""
    token_data = verify_token(refresh_token, token_type="refresh")
    if not token_data:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )
    
    user = db.query(User).filter(User.id == token_data.user_id).first()
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive"
        )
    
    # Create new access token
    access_token = create_access_token(
        data={"sub": user.email, "user_id": user.id}
    )
    
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,  # Keep the same refresh token
        expires_in=settings.ACCESS_TOKEN_EXPIRE_HOURS * 3600,
        user=_serialize_user(user)
    )

async def request_password_reset(db: Session, email: str) -> Dict[str, str]:
    """Request password reset OTP"""
    normalized_email = _normalize_email(email)
    user = (
        db.query(User)
        .filter(func.lower(User.email) == normalized_email)
        .first()
    )
    if not user:
        # Don't reveal if email exists
        return {"message": "If email exists, reset code has been sent"}
    
    # Generate OTP
    otp_code = create_otp(db, user.id, "password_reset")
    
    # Send email
    try:
        await send_password_reset_otp_email(
            email=user.email,
            name=user.full_name or user.username or user.email.split("@")[0],
            otp_code=otp_code
        )
        print(f"✅ Password reset email sent to {user.email} with OTP: {otp_code}")
    except Exception as e:
        print(f"❌ Failed to send password reset email: {e}")
        # Don't fail the request if email sending fails
    
    return {"message": "If email exists, reset code has been sent"}

def reset_password(db: Session, email: str, otp_code: str, new_password: str) -> Dict[str, str]:
    """Reset password using OTP"""
    normalized_email = _normalize_email(email)
    user = (
        db.query(User)
        .filter(func.lower(User.email) == normalized_email)
        .first()
    )
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Verify OTP
    if not verify_otp(db, user.id, otp_code, "password_reset"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired OTP code"
        )
    
    # Validate new password
    if len(new_password) < 8:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 8 characters long"
        )
    
    # Update password
    user.password_hash = get_password_hash(new_password)
    user.updated_at = datetime.utcnow()
    
    db.commit()
    
    return {"message": "Password updated successfully"}

async def verify_password_reset_otp(db: Session, email: str, otp_code: str) -> Dict[str, str]:
    """Verify password reset OTP"""
    normalized_email = _normalize_email(email)
    user = (
        db.query(User)
        .filter(func.lower(User.email) == normalized_email)
        .first()
    )
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Verify OTP
    if not verify_otp(db, user.id, otp_code, "password_reset"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired OTP code"
        )
    
    return {"message": "OTP verified successfully"}

async def request_email_verification(db: Session, email: str) -> Dict[str, str]:
    """Request email verification OTP"""
    email = _normalize_email(email)
    
    print(f"📧 Requesting email verification for: {email}")
    
    user = (
        db.query(User)
        .filter(func.lower(User.email) == email)
        .first()
    )
    if not user:
        print(f"❌ User not found: {email}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    print(f"   Found user - ID: {user.id}, Email: {user.email}, Verified: {user.is_email_verified}")
    
    if user.is_email_verified:
        print(f"ℹ️ Email already verified: {email}")
        return {"message": "Email already verified"}
    
    # Generate OTP
    otp_code = create_otp(db, user.id, "email_verification")
    
    # Send email
    try:
        await send_verification_email(
            email=user.email,
            name=user.full_name or user.username or user.email.split("@")[0],
            otp_code=otp_code
        )
        print(f"✅ Verification email sent to {user.email} with OTP: {otp_code}")
    except Exception as e:
        print(f"❌ Failed to send verification email: {e}")
        # Don't fail the request if email sending fails
    
    return {"message": "Verification code sent to your email"}

async def verify_email(db: Session, email: str, otp_code: str) -> Dict[str, str]:
    """Verify email with OTP"""
    # Clean the inputs
    email = _normalize_email(email)
    otp_code = str(otp_code).strip()
    
    print(f"🔍 Verifying email: {email} with OTP: '{otp_code}'")
    
    user = (
        db.query(User)
        .filter(func.lower(User.email) == email)
        .first()
    )
    if not user:
        print(f"❌ User not found: {email}")
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    print(f"   Found user - ID: {user.id}, Email: {user.email}, Verified: {user.is_email_verified}")
    
    if user.is_email_verified:
        print(f"ℹ️ Email already verified: {email}")
        return {"message": "Email already verified"}
    
    # Verify OTP
    print(f"🔍 Verifying OTP for user_id: {user.id}, email: {email}")
    if not verify_otp(db, user.id, otp_code, "email_verification"):
        print(f"❌ Invalid OTP for user: {email}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid OTP code"
        )
    
    # Mark email as verified
    user.is_email_verified = True
    user.updated_at = datetime.utcnow()
    db.commit()
    
    # Send welcome email
    try:
        await send_welcome_email(
            email=user.email,
            name=user.full_name or user.username or user.email.split("@")[0]
        )
        print(f"✅ Welcome email sent to {user.email}")
    except Exception as e:
        print(f"⚠️ Failed to send welcome email: {e}")
    
    print(f"✅ Email verified successfully: {email}")
    return {"message": "Email verified successfully"}