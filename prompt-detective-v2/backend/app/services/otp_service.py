"""
OTP Service for email verification and password reset
Uses 6-digit OTP codes with expiration
"""
import random
import string
from datetime import datetime, timedelta, timezone
from typing import Optional, Tuple
from sqlalchemy.orm import Session

from ..models.user import User, OTPCode
from .email_service import send_verification_email, send_password_reset_otp_email


def generate_otp(length: int = 6) -> str:
    """Generate a random OTP code"""
    return ''.join(random.choices(string.digits, k=length))


def create_otp(
    db: Session,
    user_id: int,
    otp_type: str,
    expires_in_minutes: int = 10
) -> str:
    """
    Create and store OTP code for user
    
    Args:
        db: Database session
        user_id: User ID
        otp_type: Type of OTP (email_verification, password_reset)
        expires_in_minutes: OTP expiration time in minutes
        
    Returns:
        Generated OTP code
    """
    # Invalidate any existing OTPs of the same type for this user
    db.query(OTPCode).filter(
        OTPCode.user_id == user_id,
        OTPCode.otp_type == otp_type,
        OTPCode.is_used == False
    ).update({"is_used": True})
    
    # Generate new OTP
    otp_code = generate_otp()
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=expires_in_minutes)
    
    # Store OTP in database
    otp = OTPCode(
        user_id=user_id,
        code=otp_code,
        otp_type=otp_type,
        expires_at=expires_at,
        is_used=False
    )
    db.add(otp)
    db.commit()
    
    return otp_code


def verify_otp(
    db: Session,
    user_id: int,
    code: str,
    otp_type: str
) -> Tuple[bool, Optional[str]]:
    """
    Verify OTP code
    
    Args:
        db: Database session
        user_id: User ID
        code: OTP code to verify
        otp_type: Type of OTP (email_verification, password_reset)
        
    Returns:
        Tuple of (is_valid, error_message)
    """
    otp = db.query(OTPCode).filter(
        OTPCode.user_id == user_id,
        OTPCode.code == code,
        OTPCode.otp_type == otp_type,
        OTPCode.is_used == False
    ).first()
    
    if not otp:
        return False, "Invalid OTP code"
    
    if datetime.now(timezone.utc) > otp.expires_at:
        return False, "OTP code has expired"
    
    # Mark OTP as used
    otp.is_used = True
    db.commit()
    
    return True, None


async def send_verification_otp(db: Session, user: User) -> bool:
    """
    Generate and send email verification OTP
    
    Args:
        db: Database session
        user: User object
        
    Returns:
        True if email sent successfully
    """
    otp_code = create_otp(db, user.id, "email_verification", expires_in_minutes=10)
    return await send_verification_email(user.email, user.full_name, otp_code)


async def send_password_reset_otp(db: Session, user: User) -> bool:
    """
    Generate and send password reset OTP
    
    Args:
        db: Database session
        user: User object
        
    Returns:
        True if email sent successfully
    """
    otp_code = create_otp(db, user.id, "password_reset", expires_in_minutes=10)
    return await send_password_reset_otp_email(user.email, user.full_name, otp_code)


def resend_otp(
    db: Session,
    user_id: int,
    otp_type: str
) -> Optional[str]:
    """
    Resend OTP (creates new one if last one was sent > 2 minutes ago)
    
    Args:
        db: Database session
        user_id: User ID
        otp_type: Type of OTP
        
    Returns:
        New OTP code or None if too soon
    """
    # Check if there's a recent OTP
    recent_otp = db.query(OTPCode).filter(
        OTPCode.user_id == user_id,
        OTPCode.otp_type == otp_type,
        OTPCode.created_at > datetime.now(timezone.utc) - timedelta(minutes=2)
    ).first()
    
    if recent_otp:
        return None  # Too soon to resend
    
    # Create new OTP
    return create_otp(db, user_id, otp_type)
