#!/usr/bin/env python3
"""
Database migration script - Updates schema to match current models
"""
import sys
import os
import sqlite3
from pathlib import Path

# Add app to path
sys.path.insert(0, os.path.dirname(__file__))

from app.core.config import settings

def backup_database():
    """Backup existing database"""
    db_path = settings.DATABASE_URL.replace("sqlite:///./", "")
    if os.path.exists(db_path):
        backup_path = f"{db_path}.backup"
        import shutil
        shutil.copy2(db_path, backup_path)
        print(f"✅ Database backed up to: {backup_path}")
        return True
    return False

def add_missing_columns():
    """Add missing columns to existing database"""
    db_path = settings.DATABASE_URL.replace("sqlite:///./", "")
    
    if not os.path.exists(db_path):
        print("❌ Database file not found. Run init_db.py to create a new database.")
        return False
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        # Check if is_email_verified column exists
        cursor.execute("PRAGMA table_info(users)")
        columns = [row[1] for row in cursor.fetchall()]
        
        migrations_applied = []
        
        # Add is_email_verified if missing
        if 'is_email_verified' not in columns:
            print("🔄 Adding is_email_verified column...")
            cursor.execute("ALTER TABLE users ADD COLUMN is_email_verified BOOLEAN DEFAULT 0")
            migrations_applied.append("is_email_verified")
        
        # Check for other potentially missing columns
        expected_columns = {
            'username': 'ALTER TABLE users ADD COLUMN username VARCHAR',
            'is_premium': 'ALTER TABLE users ADD COLUMN is_premium BOOLEAN DEFAULT 0',
            'api_calls_used': 'ALTER TABLE users ADD COLUMN api_calls_used INTEGER DEFAULT 0',
            'api_calls_limit': 'ALTER TABLE users ADD COLUMN api_calls_limit INTEGER DEFAULT 100',
        }
        
        for col_name, alter_sql in expected_columns.items():
            if col_name not in columns:
                print(f"🔄 Adding {col_name} column...")
                try:
                    cursor.execute(alter_sql)
                    migrations_applied.append(col_name)
                except sqlite3.OperationalError as e:
                    print(f"⚠️ Warning: Could not add {col_name}: {e}")
        
        conn.commit()
        
        if migrations_applied:
            print(f"✅ Successfully added columns: {', '.join(migrations_applied)}")
            return True
        else:
            print("ℹ️ Database schema is already up to date!")
            return True
            
    except Exception as e:
        print(f"❌ Migration failed: {e}")
        conn.rollback()
        return False
    finally:
        conn.close()

def recreate_database():
    """Recreate database from scratch (WARNING: Deletes all data!)"""
    db_path = settings.DATABASE_URL.replace("sqlite:///./", "")
    
    # Backup first
    backup_database()
    
    # Delete old database
    if os.path.exists(db_path):
        os.remove(db_path)
        print(f"🗑️ Deleted old database: {db_path}")
    
    # Create new database
    from app.database import create_tables
    print("🔄 Creating new database with updated schema...")
    create_tables()
    print("✅ Database recreated successfully!")
    return True

if __name__ == "__main__":
    print("=" * 60)
    print("DATABASE MIGRATION TOOL")
    print("=" * 60)
    print()
    print("Choose an option:")
    print("1. Add missing columns to existing database (preserves data)")
    print("2. Recreate database from scratch (DELETES ALL DATA!)")
    print()
    
    choice = input("Enter choice (1 or 2): ").strip()
    
    if choice == "1":
        print()
        print("🔄 Backing up and migrating database...")
        if backup_database():
            add_missing_columns()
        else:
            print("⚠️ No existing database found. Creating new one...")
            recreate_database()
    elif choice == "2":
        print()
        confirm = input("⚠️ This will DELETE ALL DATA! Type 'yes' to confirm: ").strip().lower()
        if confirm == "yes":
            recreate_database()
        else:
            print("❌ Operation cancelled.")
    else:
        print("❌ Invalid choice. Exiting.")
        sys.exit(1)
    
    print()
    print("=" * 60)
    print("✅ Migration complete! You can now start your server.")
    print("=" * 60)
