"""
Create Super Admin Account
Creates/updates tryreverseai@gmail.com as super admin with unlimited access
"""
import os
import sys
from pathlib import Path
from sqlalchemy import create_engine, text
from datetime import datetime, timezone

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.core.auth import get_password_hash

SUPER_ADMIN_EMAIL = "tryreverseai@gmail.com"
SUPER_ADMIN_USERNAME = "superadmin"
SUPER_ADMIN_NAME = "Super Admin"
SUPER_ADMIN_PASSWORD = "Admin@123456"  # You should change this after first login!

def create_super_admin():
    """Create or update super admin account"""
    database_url = os.getenv("DATABASE_URL")
    
    if not database_url:
        print("❌ DATABASE_URL not found in environment")
        return False
    
    try:
        engine = create_engine(database_url)
        
        with engine.connect() as conn:
            # Check if user exists
            result = conn.execute(
                text("SELECT id, is_super_admin FROM users WHERE email = :email"),
                {"email": SUPER_ADMIN_EMAIL}
            )
            existing_user = result.first()
            
            if existing_user:
                user_id = existing_user[0]
                print(f"👤 Found existing user: {SUPER_ADMIN_EMAIL} (ID: {user_id})")
                
                # Update to super admin with unlimited access
                conn.execute(text("""
                    UPDATE users SET
                        is_admin = TRUE,
                        is_super_admin = TRUE,
                        is_active = TRUE,
                        is_premium = TRUE,
                        is_email_verified = TRUE,
                        subscription_tier = 'enterprise',
                        api_calls_limit = -1,
                        updated_at = :updated_at
                    WHERE id = :user_id
                """), {
                    "user_id": user_id,
                    "updated_at": datetime.now(timezone.utc)
                })
                conn.commit()
                
                print(f"✅ Updated {SUPER_ADMIN_EMAIL} to SUPER ADMIN")
                print(f"   - Unlimited API calls (limit set to -1)")
                print(f"   - Enterprise tier access")
                print(f"   - All premium features enabled")
                print(f"   - Email verified")
                
            else:
                # Create new super admin user
                password_hash = get_password_hash(SUPER_ADMIN_PASSWORD)
                
                result = conn.execute(text("""
                    INSERT INTO users (
                        email, password_hash, full_name, username,
                        subscription_tier, is_active, is_premium, is_email_verified,
                        is_admin, is_super_admin, api_calls_used, api_calls_limit,
                        created_at, updated_at
                    ) VALUES (
                        :email, :password_hash, :full_name, :username,
                        'enterprise', TRUE, TRUE, TRUE,
                        TRUE, TRUE, 0, -1,
                        :created_at, :updated_at
                    )
                    RETURNING id
                """), {
                    "email": SUPER_ADMIN_EMAIL,
                    "password_hash": password_hash,
                    "full_name": SUPER_ADMIN_NAME,
                    "username": SUPER_ADMIN_USERNAME,
                    "created_at": datetime.now(timezone.utc),
                    "updated_at": datetime.now(timezone.utc)
                })
                
                user_id = result.scalar()
                conn.commit()
                
                print(f"✅ Created SUPER ADMIN account: {SUPER_ADMIN_EMAIL}")
                print(f"   - User ID: {user_id}")
                print(f"   - Default password: {SUPER_ADMIN_PASSWORD}")
                print(f"   - ⚠️  CHANGE THIS PASSWORD IMMEDIATELY!")
                print(f"   - Unlimited API calls")
                print(f"   - Enterprise tier access")
                print(f"   - All features enabled")
            
            # Display super admin capabilities
            print("\n🔐 SUPER ADMIN CAPABILITIES:")
            print("   ✅ Unlimited API calls (no rate limiting)")
            print("   ✅ Access to all free features")
            print("   ✅ Access to all paid/premium features")
            print("   ✅ Access to all subscription tiers (free/pro/enterprise)")
            print("   ✅ View and manage all users")
            print("   ✅ View platform analytics and metrics")
            print("   ✅ Toggle user permissions and subscriptions")
            print("   ✅ Access admin dashboard")
            print("   ✅ No usage limits or restrictions")
            
            print(f"\n🚀 LOGIN CREDENTIALS:")
            print(f"   Email: {SUPER_ADMIN_EMAIL}")
            print(f"   Password: {SUPER_ADMIN_PASSWORD}")
            print(f"   URL: https://prompt-detective.vercel.app")
            
            return True
            
    except Exception as e:
        print(f"\n❌ Failed to create super admin: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    from dotenv import load_dotenv
    
    # Determine which env file to use
    if len(sys.argv) > 1 and sys.argv[1] == "--production":
        env_file = Path(__file__).parent / ".env.production"
        print("🌍 PRODUCTION MODE")
    else:
        env_file = Path(__file__).parent / ".env"
        print("💻 LOCAL MODE")
    
    if env_file.exists():
        print(f"📂 Loading environment from {env_file}")
        load_dotenv(env_file)
    else:
        print(f"⚠️ {env_file} not found, using system environment")
    
    print("\n" + "="*60)
    print("   CREATING SUPER ADMIN ACCOUNT")
    print("="*60 + "\n")
    
    success = create_super_admin()
    
    if success:
        print("\n" + "="*60)
        print("   ✅ SUPER ADMIN SETUP COMPLETE")
        print("="*60)
    else:
        print("\n" + "="*60)
        print("   ❌ SUPER ADMIN SETUP FAILED")
        print("="*60)
        sys.exit(1)
