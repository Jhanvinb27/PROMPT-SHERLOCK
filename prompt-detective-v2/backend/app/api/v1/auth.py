"""
Authentication API endpoints
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ...core.auth import (
    UserCreate, UserLogin, TokenResponse, GoogleOAuthRequest,
    PasswordResetRequest, PasswordResetVerifyOTP, PasswordResetConfirm,
    EmailVerificationRequest, EmailVerificationConfirm,
    signup_user, login_user, refresh_access_token,
    request_password_reset, verify_password_reset_otp, reset_password,
    request_email_verification, verify_email,
    get_current_active_user, google_oauth_callback
)
from ...database import get_db
from ...models.user import User

router = APIRouter(prefix="/auth", tags=["authentication"])

@router.post("/signup", response_model=TokenResponse)
async def signup(user_data: UserCreate, db: Session = Depends(get_db)):
    """Register a new user"""
    return signup_user(db, user_data)

@router.post("/login", response_model=TokenResponse)
async def login(login_data: UserLogin, db: Session = Depends(get_db)):
    """Login user with email and password"""
    return login_user(db, login_data)

@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(
    refresh_token: str,
    db: Session = Depends(get_db)
):
    """Refresh access token using refresh token"""
    return refresh_access_token(refresh_token, db)

@router.post("/google/oauth", response_model=TokenResponse)
async def google_oauth(oauth_data: GoogleOAuthRequest, db: Session = Depends(get_db)):
    """
    Handle Google OAuth callback
    
    Exchanges the authorization code from Google for user tokens
    Creates or updates user account and returns JWT tokens
    """
    return await google_oauth_callback(
        code=oauth_data.code,
        redirect_uri=oauth_data.redirect_uri,
        db=db
    )

@router.post("/password-reset/request")
async def request_password_reset_endpoint(
    reset_data: PasswordResetRequest,
    db: Session = Depends(get_db)
):
    """Request password reset OTP via email"""
    return await request_password_reset(db, reset_data.email)

@router.post("/password-reset/verify-otp")
async def verify_password_reset_otp_endpoint(
    verify_data: PasswordResetVerifyOTP,
    db: Session = Depends(get_db)
):
    """Verify password reset OTP"""
    return await verify_password_reset_otp(db, verify_data.email, verify_data.otp_code)

@router.post("/password-reset/confirm")
async def reset_password_endpoint(
    reset_data: PasswordResetConfirm,
    db: Session = Depends(get_db)
):
    """Confirm password reset with OTP and new password"""
    return reset_password(db, reset_data.email, reset_data.otp_code, reset_data.new_password)

@router.post("/email-verification/request")
async def request_email_verification_endpoint(
    verify_data: EmailVerificationRequest,
    db: Session = Depends(get_db)
):
    """Request email verification OTP"""
    return await request_email_verification(db, verify_data.email)

@router.post("/email-verification/verify")
async def verify_email_endpoint(
    verify_data: EmailVerificationConfirm,
    db: Session = Depends(get_db)
):
    """Verify email with OTP"""
    return await verify_email(db, verify_data.email, verify_data.otp_code)

@router.get("/me")
async def get_current_user_info(current_user: User = Depends(get_current_active_user)):
    """Get current user information"""
    return {
        "id": str(current_user.id),
        "email": current_user.email,
        "full_name": current_user.full_name,
        "is_active": current_user.is_active,
        "is_premium": current_user.subscription_tier in ["pro", "enterprise"],
        "api_calls_limit": 150 if current_user.subscription_tier == "free" else 1000,
        "api_calls_used": 0,  # TODO: Get from usage tracking
        "subscription_tier": current_user.subscription_tier,
        "created_at": current_user.created_at.isoformat() if current_user.created_at else ""
    }

@router.post("/create-test-user")
async def create_test_user(db: Session = Depends(get_db)):
    """Create a test user for development (remove in production)"""
    # Check if test user already exists
    test_email = "test@example.com"
    existing_user = db.query(User).filter(User.email == test_email).first()
    
    if existing_user:
        return {"message": "Test user already exists", "email": test_email}
    
    # Create test user
    test_user_data = UserCreate(
        email=test_email,
        password="testpassword123",
        name="Test User"
    )
    
    result = signup_user(db, test_user_data)
    return {"message": "Test user created successfully", "email": test_email, "tokens": result}