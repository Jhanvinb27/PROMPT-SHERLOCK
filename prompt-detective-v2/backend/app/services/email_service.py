"""Email service utilities using Gmail SMTP."""
import asyncio
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from typing import Optional

from ..core.config import settings


def get_email_template_header() -> str:
    """Common email header shared across templates."""
    return """
    <!-- Header -->
    <div style="background: linear-gradient(135deg, #8B5CF6 0%, #3B82F6 100%); padding: 40px 20px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: bold;">
            🔍 Prompt Detective
        </h1>
        <p style="color: #E9D5FF; margin: 10px 0 0 0; font-size: 16px;">
            AI-Powered Video & Image Analysis
        </p>
    </div>
    """


def get_email_template_footer() -> str:
    """Common email footer shared across templates."""
    return """
    <!-- Footer -->
    <div style="background-color: #F3F4F6; padding: 30px 20px; text-align: center; border-radius: 0 0 10px 10px; margin-top: 30px;">
        <p style="color: #6B7280; font-size: 14px; margin: 0 0 10px 0;">
            Made with ❤️ in India for creators worldwide
        </p>
        <p style="color: #6B7280; font-size: 12px; margin: 0 0 15px 0;">
            🇮🇳 Pricing optimized for Indian market | Daily limits that reset at midnight IST
        </p>
        <div style="margin: 15px 0;">
            <a href="https://prompt-detective.vercel.app" style="color: #8B5CF6; text-decoration: none; margin: 0 10px;">Website</a>
            <a href="https://prompt-detective.vercel.app/pricing" style="color: #8B5CF6; text-decoration: none; margin: 0 10px;">Pricing</a>
            <a href="https://prompt-detective.vercel.app/help" style="color: #8B5CF6; text-decoration: none; margin: 0 10px;">Help</a>
        </div>
        <p style="color: #9CA3AF; font-size: 11px; margin: 15px 0 0 0;">
            © 2025 Prompt Detective. All rights reserved.
        </p>
    </div>
    """


def _send_with_smtp_sync(
    *,
    to_email: str,
    subject: str,
    html: str,
    text: str,
    sender_name: str,
    sender_email: str,
) -> None:
    provider = (settings.EMAIL_PROVIDER or "").lower()
    host = settings.SMTP_HOST or ("smtp.gmail.com" if provider == "gmail" else None)
    port = settings.SMTP_PORT or (587 if provider == "gmail" else 25)
    username = settings.SMTP_USERNAME or sender_email
    password = settings.SMTP_PASSWORD
    use_tls = settings.SMTP_USE_TLS

    if not host:
        raise ValueError("SMTP host not configured")
    if not password:
        raise ValueError("SMTP password not configured")

    message = MIMEMultipart("alternative")
    message["Subject"] = subject
    message["From"] = f"{sender_name} <{sender_email}>"
    message["To"] = to_email
    message.attach(MIMEText(text, "plain"))
    message.attach(MIMEText(html, "html"))

    with smtplib.SMTP(host, port, timeout=30) as server:
        if use_tls:
            server.starttls()
        if username and password:
            server.login(username, password)
        server.sendmail(sender_email, [to_email], message.as_string())


async def _send_with_smtp(**kwargs) -> bool:
    try:
        await asyncio.to_thread(_send_with_smtp_sync, **kwargs)
        print(f"✅ Email sent via SMTP to {kwargs['to_email']}")
        return True
    except Exception as exc:  # pragma: no cover - external SMTP failure
        print(f"❌ SMTP send failed for {kwargs['to_email']}: {exc}")
        return False


async def _dispatch_email(
    *,
    to_email: str,
    subject: str,
    html: str,
    text: str,
    sender_name: Optional[str] = None,
    sender_email: Optional[str] = None,
) -> bool:
    """Send email using Gmail SMTP."""
    sender_name = sender_name or settings.EMAIL_FROM_NAME or "Reverse AI"
    sender_email = sender_email or settings.EMAIL_FROM_ADDRESS or "tryreverseai@gmail.com"
    
    # Always use Gmail SMTP
    return await _send_with_smtp(
        to_email=to_email,
        subject=subject,
        html=html,
        text=text,
        sender_name=sender_name,
        sender_email=sender_email,
    )


async def send_verification_email(email: str, name: str, otp_code: str) -> bool:
    """Send email verification OTP."""
    subject = "🔐 Verify Your Prompt Detective Account"

    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 20px; background-color: #F9FAFB;">
        {get_email_template_header()}
        <!-- Content -->
        <div style="padding: 40px 30px; background-color: #ffffff;">
            <h2 style="color: #111827; margin: 0 0 20px 0; font-size: 24px;">
                Welcome to Prompt Detective! 👋
            </h2>
            <p style="color: #4B5563; font-size: 16px; line-height: 1.6; margin: 0 0 25px 0;">
                Hi <strong>{name}</strong>,
            </p>
            <p style="color: #4B5563; font-size: 16px; line-height: 1.6; margin: 0 0 25px 0;">
                Thank you for signing up! We're excited to have you on board. To complete your registration
                and start analyzing videos and images, please verify your email address.
            </p>
            <!-- OTP Box -->
            <div style="background: linear-gradient(135deg, #F3F4F6 0%, #E5E7EB 100%); border-left: 4px solid #8B5CF6; padding: 30px; border-radius: 8px; margin: 30px 0; text-align: center;">
                <p style="color: #6B7280; font-size: 14px; margin: 0 0 10px 0; text-transform: uppercase; letter-spacing: 1px;">
                    Your Verification Code
                </p>
                <div style="background-color: #ffffff; padding: 20px; border-radius: 8px; display: inline-block;">
                    <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #8B5CF6; font-family: 'Courier New', monospace;">
                        {otp_code}
                    </span>
                </div>
                <p style="color: #9CA3AF; font-size: 13px; margin: 15px 0 0 0;">
                    ⏱️ This code expires in <strong>10 minutes</strong>
                </p>
            </div>
            <p style="color: #4B5563; font-size: 15px; line-height: 1.6; margin: 20px 0;">
                Enter this code on the verification page to activate your account.
            </p>
            <!-- What's Next Section -->
            <div style="background-color: #F9FAFB; padding: 25px; border-radius: 8px; margin: 30px 0;">
                <h3 style="color: #111827; margin: 0 0 15px 0; font-size: 18px;">
                    🚀 What's Next?
                </h3>
                <ul style="color: #4B5563; font-size: 14px; line-height: 1.8; margin: 0; padding-left: 20px;">
                    <li><strong>5 free analyses daily</strong> - Analyze images and get AI-generated prompts</li>
                    <li><strong>Video support</strong> - Upgrade to analyze video content (Starter plan at just ₹299/mo)</li>
                    <li><strong>API access</strong> - Integrate with your workflow (Pro plan at ₹699/mo)</li>
                    <li><strong>Daily reset model</strong> - Your limit resets every midnight IST</li>
                </ul>
            </div>
            <!-- Special Offer -->
            <div style="background: linear-gradient(135deg, #8B5CF6 0%, #3B82F6 100%); padding: 25px; border-radius: 8px; margin: 30px 0; text-align: center;">
                <p style="color: #ffffff; font-size: 16px; margin: 0 0 10px 0; font-weight: bold;">
                    🎁 Limited Time Offer - First 500 Users
                </p>
                <p style="color: #E9D5FF; font-size: 14px; margin: 0;">
                    Lock in <strong>33% OFF</strong> forever on our Starter plan (₹199/mo instead of ₹299/mo)
                </p>
            </div>
            <!-- Security Notice -->
            <div style="background-color: #FEF3C7; border-left: 4px solid #F59E0B; padding: 15px; border-radius: 4px; margin: 30px 0;">
                <p style="color: #92400E; font-size: 13px; margin: 0; line-height: 1.6;">
                    🔒 <strong>Security Notice:</strong> Never share this code with anyone. Prompt Detective will never ask
                    for your OTP via phone or any other platform. If you didn't request this verification, please ignore this email.
                </p>
            </div>
        </div>
        {get_email_template_footer()}
    </body>
    </html>
    """

    text_content = f"""
    Welcome to Prompt Detective!

    Hi {name},

    Thank you for signing up! To complete your registration, please verify your email address.

    Your Verification Code: {otp_code}

    This code expires in 10 minutes.

    What's Next?
    - 5 free analyses daily
    - Video support available on Starter plan (₹299/mo)
    - API access on Pro plan (₹699/mo)

    Limited Time Offer - First 500 Users:
    Lock in 33% OFF forever on our Starter plan (₹199/mo)

    Security Notice: Never share this code with anyone.

    © 2025 Prompt Detective. All rights reserved.
    """

    sent = await _dispatch_email(
        to_email=email,
        subject=subject,
        html=html_content,
        text=text_content,
    )

    if not sent:
        print("⚠️ Verification email not sent; printing OTP for debugging")
        print(f"Verification OTP for {email}: {otp_code}")
    return sent


async def send_password_reset_otp_email(email: str, name: str, otp_code: str) -> bool:
    """Send password reset OTP."""
    subject = "🔐 Reset Your Prompt Detective Password"

    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 20px; background-color: #F9FAFB;">
        {get_email_template_header()}
        <!-- Content -->
        <div style="padding: 40px 30px; background-color: #ffffff;">
            <h2 style="color: #111827; margin: 0 0 20px 0; font-size: 24px;">
                Password Reset Request 🔑
            </h2>
            <p style="color: #4B5563; font-size: 16px; line-height: 1.6; margin: 0 0 25px 0;">
                Hi <strong>{name}</strong>,
            </p>
            <p style="color: #4B5563; font-size: 16px; line-height: 1.6; margin: 0 0 25px 0;">
                We received a request to reset your password for your Prompt Detective account.
                Use the code below to reset your password.
            </p>
            <!-- OTP Box -->
            <div style="background: linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%); border-left: 4px solid #F59E0B; padding: 30px; border-radius: 8px; margin: 30px 0; text-align: center;">
                <p style="color: #92400E; font-size: 14px; margin: 0 0 10px 0; text-transform: uppercase; letter-spacing: 1px;">
                    Your Password Reset Code
                </p>
                <div style="background-color: #ffffff; padding: 20px; border-radius: 8px; display: inline-block;">
                    <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #F59E0B; font-family: 'Courier New', monospace;">
                        {otp_code}
                    </span>
                </div>
                <p style="color: #92400E; font-size: 13px; margin: 15px 0 0 0;">
                    ⏱️ This code expires in <strong>10 minutes</strong>
                </p>
            </div>
            <p style="color: #4B5563; font-size: 15px; line-height: 1.6; margin: 20px 0;">
                Enter this code on the password reset page, then create a new strong password.
            </p>
            <!-- Security Tips -->
            <div style="background-color: #F0F9FF; padding: 25px; border-radius: 8px; margin: 30px 0; border-left: 4px solid #3B82F6;">
                <h3 style="color: #1E40AF; margin: 0 0 15px 0; font-size: 16px;">
                    🛡️ Security Tips for Strong Passwords
                </h3>
                <ul style="color: #1E3A8A; font-size: 14px; line-height: 1.8; margin: 0; padding-left: 20px;">
                    <li>Use at least 8 characters</li>
                    <li>Mix uppercase and lowercase letters</li>
                    <li>Include numbers and special characters</li>
                    <li>Avoid using personal information</li>
                    <li>Don't reuse passwords from other sites</li>
                </ul>
            </div>
            <!-- Did Not Request Section -->
            <div style="background-color: #FEE2E2; border-left: 4px solid #EF4444; padding: 15px; border-radius: 4px; margin: 30px 0;">
                <p style="color: #991B1B; font-size: 14px; margin: 0; line-height: 1.6;">
                    ❗ <strong>Didn't request a password reset?</strong><br>
                    If you didn't request this, please ignore this email and your password will remain unchanged.
                    Your account is secure. Consider changing your password if you suspect unauthorized access.
                </p>
            </div>
            <!-- Quick Access -->
            <div style="text-align: center; margin: 30px 0;">
                <a href="https://prompt-detective.vercel.app/reset-password"
                   style="display: inline-block; background: linear-gradient(135deg, #8B5CF6 0%, #3B82F6 100%);
                          color: #ffffff; text-decoration: none; padding: 15px 40px; border-radius: 8px;
                          font-weight: bold; font-size: 16px;">
                    Reset Password Now →
                </a>
            </div>
        </div>
        {get_email_template_footer()}
    </body>
    </html>
    """

    text_content = f"""
    Password Reset Request

    Hi {name},

    We received a request to reset your password for your Prompt Detective account.

    Your Password Reset Code: {otp_code}

    This code expires in 10 minutes.

    Enter this code on the password reset page, then create a new strong password.

    Security Tips:
    - Use at least 8 characters
    - Mix uppercase and lowercase letters
    - Include numbers and special characters

    Didn't request a password reset?
    If you didn't request this, please ignore this email. Your account is secure.

    © 2025 Prompt Detective. All rights reserved.
    """

    sent = await _dispatch_email(
        to_email=email,
        subject=subject,
        html=html_content,
        text=text_content,
    )

    if not sent:
        print("⚠️ Password reset email not sent; printing OTP for debugging")
        print(f"Password reset OTP for {email}: {otp_code}")
    return sent


async def send_welcome_email(email: str, name: str) -> bool:
    """Send welcome email after successful verification."""
    subject = "🎉 Welcome to Prompt Detective - Let's Get Started!"

    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 20px; background-color: #F9FAFB;">
        {get_email_template_header()}
        <!-- Content -->
        <div style="padding: 40px 30px; background-color: #ffffff;">
            <h2 style="color: #111827; margin: 0 0 20px 0; font-size: 28px; text-align: center;">
                🎉 Account Verified Successfully!
            </h2>
            <p style="color: #4B5563; font-size: 16px; line-height: 1.6; margin: 0 0 25px 0;">
                Hi <strong>{name}</strong>,
            </p>
            <p style="color: #4B5563; font-size: 16px; line-height: 1.6; margin: 0 0 25px 0;">
                Congratulations! Your email has been verified and your Prompt Detective account is now active.
                You're all set to start reverse-engineering images and videos with AI! 🚀
            </p>
            <!-- Quick Start Guide -->
            <div style="background: linear-gradient(135deg, #F0F9FF 0%, #E0F2FE 100%); padding: 30px; border-radius: 12px; margin: 30px 0;">
                <h3 style="color: #0C4A6E; margin: 0 0 20px 0; font-size: 20px; text-align: center;">
                    🚀 Quick Start Guide
                </h3>
                <div style="margin: 20px 0;">
                    <div style="background-color: #ffffff; padding: 20px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #3B82F6;">
                        <h4 style="color: #1E40AF; margin: 0 0 10px 0; font-size: 16px;">
                            1️⃣ Upload Your First Image
                        </h4>
                        <p style="color: #475569; font-size: 14px; margin: 0; line-height: 1.6;">
                            Go to your dashboard and upload any image. Our AI will analyze it and generate the exact prompt used to create it.
                        </p>
                    </div>
                    <div style="background-color: #ffffff; padding: 20px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #8B5CF6;">
                        <h4 style="color: #6B21A8; margin: 0 0 10px 0; font-size: 16px;">
                            2️⃣ Explore Your Free Tier
                        </h4>
                        <p style="color: #475569; font-size: 14px; margin: 0; line-height: 1.6;">
                            You get <strong>5 free analyses per day</strong>. Your limit resets every midnight IST.
                        </p>
                    </div>
                    <div style="background-color: #ffffff; padding: 20px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #10B981;">
                        <h4 style="color: #065F46; margin: 0 0 10px 0; font-size: 16px;">
                            3️⃣ Upgrade When Ready
                        </h4>
                        <p style="color: #475569; font-size: 14px; margin: 0; line-height: 1.6;">
                            Need more? Check out our Starter plan (₹199/mo - First 500 users) with video support and 15 daily analyses.
                        </p>
                    </div>
                </div>
            </div>
            <!-- Your Plan Details -->
            <div style="background-color: #F9FAFB; padding: 25px; border-radius: 8px; margin: 30px 0;">
                <h3 style="color: #111827; margin: 0 0 15px 0; font-size: 18px;">
                    📊 Your Free Plan Includes:
                </h3>
                <ul style="color: #4B5563; font-size: 15px; line-height: 2; margin: 0; padding-left: 20px;">
                    <li>✅ 5 analyses per day</li>
                    <li>✅ Image-to-prompt conversion</li>
                    <li>✅ Standard processing speed</li>
                    <li>✅ Basic prompt output</li>
                    <li>✅ Community forum access</li>
                    <li>✅ Email support</li>
                </ul>
            </div>
            <!-- CTA Buttons -->
            <div style="text-align: center; margin: 40px 0;">
                <a href="https://prompt-detective.vercel.app/dashboard"
                   style="display: inline-block; background: linear-gradient(135deg, #8B5CF6 0%, #3B82F6 100%);
                          color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 10px;
                          font-weight: bold; font-size: 16px; margin: 10px;">
                    🎯 Go to Dashboard
                </a>
                <br>
                <a href="https://prompt-detective.vercel.app/pricing"
                   style="display: inline-block; background-color: #ffffff; color: #8B5CF6; text-decoration: none;
                          padding: 16px 40px; border-radius: 10px; font-weight: bold; font-size: 16px;
                          border: 2px solid #8B5CF6; margin: 10px;">
                    💰 View Pricing
                </a>
            </div>
            <!-- Referral Program -->
            <div style="background: linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%); padding: 25px; border-radius: 8px; margin: 30px 0; text-align: center;">
                <h3 style="color: #92400E; margin: 0 0 10px 0; font-size: 18px;">
                    🎁 Earn ₹150 per Referral!
                </h3>
                <p style="color: #78350F; font-size: 14px; margin: 0; line-height: 1.6;">
                    Share Prompt Detective with friends and earn ₹150 credit for every paid signup.
                    They get 10% off too! It's a win-win. 🚀
                </p>
            </div>
            <!-- Support -->
            <div style="text-align: center; margin: 30px 0; padding: 20px; background-color: #F9FAFB; border-radius: 8px;">
                <p style="color: #6B7280; font-size: 14px; margin: 0 0 10px 0;">
                    Need help getting started?
                </p>
                <p style="color: #8B5CF6; font-size: 15px; margin: 0; font-weight: bold;">
                    📧 Email us at support@promptdetective.com
                </p>
                <p style="color: #6B7280; font-size: 13px; margin: 10px 0 0 0;">
                    We respond within 48 hours (faster for paid plans)
                </p>
            </div>
        </div>
        {get_email_template_footer()}
    </body>
    </html>
    """

    text_content = f"""
    Welcome to Prompt Detective!

    Hi {name},

    Congratulations! Your account is now active.

    Quick Start Guide:
    1. Upload Your First Image - Analyze any image and get AI-generated prompts
    2. Explore Your Free Tier - 5 analyses per day, resets at midnight IST
    3. Upgrade When Ready - Starter plan at ₹199/mo for first 500 users

    Your Free Plan Includes:
    - 5 analyses per day
    - Image-to-prompt conversion
    - Standard processing speed
    - Email support

    Earn ₹150 per Referral!
    Share Prompt Detective with friends and earn credits.

    Need help? Email us at support@promptdetective.com

    © 2025 Prompt Detective. All rights reserved.
    """

    sent = await _dispatch_email(
        to_email=email,
        subject=subject,
        html=html_content,
        text=text_content,
    )

    if not sent:
        print("⚠️ Welcome email failed to send")
    return sent
