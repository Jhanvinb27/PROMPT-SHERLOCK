#!/usr/bin/env python3
"""
Quick fix for missing is_email_verified column
Run this if you get "no such column: users.is_email_verified" error
"""
import sqlite3
import os
import sys

# Database path
DB_PATH = "app_data.sqlite3"

def fix_database():
    """Add missing is_email_verified column"""
    
    if not os.path.exists(DB_PATH):
        print(f"❌ Database not found at: {DB_PATH}")
        print("Run 'python init_db.py' to create a new database.")
        sys.exit(1)
    
    # Backup first
    backup_path = f"{DB_PATH}.backup"
    import shutil
    shutil.copy2(DB_PATH, backup_path)
    print(f"✅ Backup created: {backup_path}")
    
    # Connect and add column
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    try:
        # Check if column exists
        cursor.execute("PRAGMA table_info(users)")
        columns = [row[1] for row in cursor.fetchall()]
        
        if 'is_email_verified' in columns:
            print("ℹ️ Column 'is_email_verified' already exists!")
            return
        
        # Add the missing column
        print("🔄 Adding is_email_verified column...")
        cursor.execute("ALTER TABLE users ADD COLUMN is_email_verified BOOLEAN DEFAULT 0")
        conn.commit()
        print("✅ Successfully added is_email_verified column!")
        
        # Verify
        cursor.execute("PRAGMA table_info(users)")
        columns = [row[1] for row in cursor.fetchall()]
        print(f"\nCurrent columns in users table: {', '.join(columns)}")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        conn.rollback()
        sys.exit(1)
    finally:
        conn.close()
    
    print("\n✅ Fix complete! Restart your server.")

if __name__ == "__main__":
    print("=" * 60)
    print("QUICK FIX: Add is_email_verified column")
    print("=" * 60)
    print()
    fix_database()
    print("=" * 60)
