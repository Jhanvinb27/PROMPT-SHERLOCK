"""
Create Super Admin Account in Local SQLite Database
"""
import sqlite3
import sys
from pathlib import Path
from datetime import datetime, timezone

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent))

from app.core.auth import get_password_hash

SUPER_ADMIN_EMAIL = "tryreverseai@gmail.com"
SUPER_ADMIN_USERNAME = "superadmin"
SUPER_ADMIN_NAME = "Super Admin"
SUPER_ADMIN_PASSWORD = "Admin@123456"

def create_super_admin_local():
    """Create or update super admin in local SQLite database"""
    
    db_path = Path(__file__).parent / "app_data.sqlite3"
    
    if not db_path.exists():
        print(f"❌ Database not found at {db_path}")
        return False
    
    try:
        conn = sqlite3.connect(str(db_path))
        cursor = conn.cursor()
        
        # Check if user exists
        cursor.execute("SELECT id, is_super_admin FROM users WHERE email = ?", (SUPER_ADMIN_EMAIL,))
        existing_user = cursor.fetchone()
        
        if existing_user:
            user_id = existing_user[0]
            print(f"👤 Found existing user: {SUPER_ADMIN_EMAIL} (ID: {user_id})")
            
            # Update to super admin with unlimited access
            cursor.execute("""
                UPDATE users SET
                    is_admin = 1,
                    is_super_admin = 1,
                    is_active = 1,
                    is_premium = 1,
                    is_email_verified = 1,
                    subscription_tier = 'enterprise',
                    api_calls_limit = -1,
                    updated_at = ?
                WHERE id = ?
            """, (datetime.now(timezone.utc).isoformat(), user_id))
            
            conn.commit()
            
            print(f"✅ Updated {SUPER_ADMIN_EMAIL} to SUPER ADMIN")
            print(f"   - Unlimited API calls (limit set to -1)")
            print(f"   - Enterprise tier access")
            print(f"   - All premium features enabled")
            print(f"   - Email verified")
            
        else:
            # Create new super admin user
            password_hash = get_password_hash(SUPER_ADMIN_PASSWORD)
            now = datetime.now(timezone.utc).isoformat()
            
            cursor.execute("""
                INSERT INTO users (
                    email, password_hash, full_name, username,
                    subscription_tier, is_active, is_premium, is_email_verified,
                    is_admin, is_super_admin, api_calls_used, api_calls_limit,
                    created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                SUPER_ADMIN_EMAIL,
                password_hash,
                SUPER_ADMIN_NAME,
                SUPER_ADMIN_USERNAME,
                'enterprise',
                1, 1, 1,  # is_active, is_premium, is_email_verified
                1, 1,     # is_admin, is_super_admin
                0, -1,    # api_calls_used, api_calls_limit
                now, now  # created_at, updated_at
            ))
            
            user_id = cursor.lastrowid
            conn.commit()
            
            print(f"✅ Created SUPER ADMIN account: {SUPER_ADMIN_EMAIL}")
            print(f"   - User ID: {user_id}")
            print(f"   - Default password: {SUPER_ADMIN_PASSWORD}")
            print(f"   - ⚠️  CHANGE THIS PASSWORD IMMEDIATELY!")
            print(f"   - Unlimited API calls")
            print(f"   - Enterprise tier access")
            print(f"   - All features enabled")
        
        # Verify the creation
        cursor.execute("""
            SELECT id, email, full_name, username, is_admin, is_super_admin, 
                   api_calls_limit, subscription_tier, is_premium 
            FROM users WHERE email = ?
        """, (SUPER_ADMIN_EMAIL,))
        
        admin_data = cursor.fetchone()
        
        print("\n📋 SUPER ADMIN ACCOUNT DETAILS:")
        print(f"   ID: {admin_data[0]}")
        print(f"   Email: {admin_data[1]}")
        print(f"   Name: {admin_data[2]}")
        print(f"   Username: {admin_data[3]}")
        print(f"   Is Admin: {bool(admin_data[4])}")
        print(f"   Is Super Admin: {bool(admin_data[5])}")
        print(f"   API Limit: {admin_data[6]} (unlimited)")
        print(f"   Tier: {admin_data[7]}")
        print(f"   Premium: {bool(admin_data[8])}")
        
        conn.close()
        
        print("\n🔐 SUPER ADMIN CAPABILITIES:")
        print("   ✅ Unlimited API calls (no rate limiting)")
        print("   ✅ Access to all free features")
        print("   ✅ Access to all paid/premium features")
        print("   ✅ Access to all subscription tiers")
        print("   ✅ View and manage all users")
        print("   ✅ View platform analytics and metrics")
        print("   ✅ Toggle user permissions and subscriptions")
        print("   ✅ Access admin dashboard")
        print("   ✅ No usage limits or restrictions")
        
        print(f"\n🚀 LOGIN CREDENTIALS:")
        print(f"   Email: {SUPER_ADMIN_EMAIL}")
        print(f"   Password: {SUPER_ADMIN_PASSWORD}")
        print(f"   URL: http://localhost:5173 (local frontend)")
        
        return True
        
    except Exception as e:
        print(f"\n❌ Failed to create super admin: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    print("="*60)
    print("   CREATING LOCAL SUPER ADMIN ACCOUNT")
    print("="*60 + "\n")
    
    success = create_super_admin_local()
    
    if success:
        print("\n" + "="*60)
        print("   ✅ SUPER ADMIN SETUP COMPLETE")
        print("="*60)
        print("\n💡 TIP: Restart your backend server to ensure changes take effect")
    else:
        print("\n" + "="*60)
        print("   ❌ SUPER ADMIN SETUP FAILED")
        print("="*60)
        sys.exit(1)
