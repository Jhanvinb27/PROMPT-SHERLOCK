"""
Migration script to add admin fields to local SQLite database
"""
import sqlite3
import os
from pathlib import Path

def migrate_local_database():
    """Add is_admin and is_super_admin columns to local SQLite database"""
    
    # Find the SQLite database
    db_path = Path(__file__).parent / "app_data.sqlite3"
    
    if not db_path.exists():
        print(f"❌ Database not found at {db_path}")
        return False
    
    print(f"📂 Found database at: {db_path}")
    
    try:
        # Connect to SQLite database
        conn = sqlite3.connect(str(db_path))
        cursor = conn.cursor()
        
        # Check current table structure
        cursor.execute("PRAGMA table_info(users)")
        columns = [row[1] for row in cursor.fetchall()]
        print(f"📋 Current columns: {columns}")
        
        # Check if columns already exist
        needs_migration = False
        if 'is_admin' not in columns:
            print("⚠️ Missing: is_admin column")
            needs_migration = True
        else:
            print("✅ is_admin column already exists")
            
        if 'is_super_admin' not in columns:
            print("⚠️ Missing: is_super_admin column")
            needs_migration = True
        else:
            print("✅ is_super_admin column already exists")
        
        if not needs_migration:
            print("\n✅ Database already has admin fields!")
            conn.close()
            return True
        
        print("\n🔧 Starting migration...")
        
        # Add is_admin column if missing
        if 'is_admin' not in columns:
            cursor.execute("""
                ALTER TABLE users 
                ADD COLUMN is_admin INTEGER DEFAULT 0
            """)
            print("✅ Added is_admin column")
        
        # Add is_super_admin column if missing
        if 'is_super_admin' not in columns:
            cursor.execute("""
                ALTER TABLE users 
                ADD COLUMN is_super_admin INTEGER DEFAULT 0
            """)
            print("✅ Added is_super_admin column")
        
        # Commit changes
        conn.commit()
        
        # Verify the changes
        cursor.execute("PRAGMA table_info(users)")
        new_columns = [row[1] for row in cursor.fetchall()]
        print(f"\n📋 Updated columns: {new_columns}")
        
        # Close connection
        conn.close()
        
        print("\n🎉 Migration completed successfully!")
        print("✅ Admin fields added to local database")
        return True
        
    except Exception as e:
        print(f"\n❌ Migration failed: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    print("=" * 60)
    print("LOCAL DATABASE MIGRATION - ADD ADMIN FIELDS")
    print("=" * 60)
    print()
    
    success = migrate_local_database()
    
    if success:
        print("\n" + "=" * 60)
        print("✅ You can now login with admin credentials!")
        print("=" * 60)
    else:
        print("\n" + "=" * 60)
        print("❌ Migration failed - please check errors above")
        print("=" * 60)
