"""
Migration: Add admin fields to users table
Adds is_admin and is_super_admin boolean fields
"""
import os
from sqlalchemy import create_engine, text

def run_migration():
    """Add admin fields to users table"""
    database_url = os.getenv("DATABASE_URL")
    
    if not database_url:
        print("❌ DATABASE_URL not found in environment")
        return False
    
    try:
        engine = create_engine(database_url)
        
        with engine.connect() as conn:
            # Add is_admin column
            try:
                conn.execute(text("""
                    ALTER TABLE users 
                    ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE
                """))
                conn.commit()
                print("✅ Added is_admin column")
            except Exception as e:
                if "already exists" not in str(e).lower():
                    print(f"⚠️ is_admin column: {e}")
            
            # Add is_super_admin column
            try:
                conn.execute(text("""
                    ALTER TABLE users 
                    ADD COLUMN IF NOT EXISTS is_super_admin BOOLEAN DEFAULT FALSE
                """))
                conn.commit()
                print("✅ Added is_super_admin column")
            except Exception as e:
                if "already exists" not in str(e).lower():
                    print(f"⚠️ is_super_admin column: {e}")
            
            print("\n✅ Migration completed successfully!")
            return True
            
    except Exception as e:
        print(f"\n❌ Migration failed: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    from pathlib import Path
    from dotenv import load_dotenv
    
    # Load environment
    env_file = Path(__file__).parent.parent / ".env.production"
    if env_file.exists():
        print(f"📂 Loading environment from {env_file}")
        load_dotenv(env_file)
    else:
        print("⚠️ No .env.production found, using system environment")
    
    run_migration()
