#!/usr/bin/env python3
"""
Migration script to create profiles and companies tables
"""

import sqlite3
import sys
from pathlib import Path

def run_migration():
    """Run the database migration"""
    db_path = Path(__file__).parent.parent / "data.db"
    
    if not db_path.exists():
        print(f"Database file not found: {db_path}")
        return False
    
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        print("Starting database migration...")
        
        # Check if profiles table exists
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='profiles'")
        if not cursor.fetchone():
            print("Creating profiles table...")
            cursor.execute("""
                CREATE TABLE profiles (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER UNIQUE,
                    visit_count INTEGER DEFAULT 0,
                    last_visited_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    phone VARCHAR(50),
                    website VARCHAR(500),
                    address VARCHAR(500),
                    about VARCHAR(1000),
                    photo_url VARCHAR(500),
                    video_url VARCHAR(500),
                    company VARCHAR(255),
                    theme JSON DEFAULT '{}',
                    social_links JSON DEFAULT '{}',
                    gallery JSON DEFAULT '[]',
                    marketplaces JSON DEFAULT '[]',
                    account_numbers JSON DEFAULT '[]',
                    FOREIGN KEY (user_id) REFERENCES users (id)
                )
            """)
        else:
            print("Profiles table already exists")
            
            # Check if company column exists in profiles table
            cursor.execute("PRAGMA table_info(profiles)")
            columns = [column[1] for column in cursor.fetchall()]
            
            if 'company' not in columns:
                print("Adding 'company' column to profiles table...")
                cursor.execute("ALTER TABLE profiles ADD COLUMN company VARCHAR(255)")
            else:
                print("'company' column already exists in profiles table")
        
        # Check if companies table exists
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='companies'")
        if not cursor.fetchone():
            print("Creating companies table...")
            cursor.execute("""
                CREATE TABLE companies (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER UNIQUE,
                    company_name VARCHAR(255),
                    company_type VARCHAR(100),
                    tax_office VARCHAR(100),
                    tax_number VARCHAR(50),
                    trade_registry_number VARCHAR(50),
                    mersis_no VARCHAR(50),
                    phone VARCHAR(50),
                    email VARCHAR(255),
                    website VARCHAR(500),
                    address VARCHAR(500),
                    district VARCHAR(100),
                    city VARCHAR(100),
                    country VARCHAR(100) DEFAULT 'Türkiye',
                    postal_code VARCHAR(20),
                    phone_alt VARCHAR(50),
                    email_alt VARCHAR(255),
                    website_alt VARCHAR(500),
                    billing_address VARCHAR(500),
                    description VARCHAR(1000),
                    founded_year INTEGER,
                    employee_count VARCHAR(50),
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users (id)
                )
            """)
        else:
            print("Companies table already exists")
        
        conn.commit()
        print("Migration completed successfully!")
        return True
        
    except Exception as e:
        print(f"Migration failed: {e}")
        return False
    finally:
        conn.close()

if __name__ == "__main__":
    success = run_migration()
    sys.exit(0 if success else 1)
