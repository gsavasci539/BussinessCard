#!/usr/bin/env python3
"""
Script to check what tables exist in the database
"""

import sqlite3
from pathlib import Path

def check_database():
    """Check database tables"""
    db_path = Path(__file__).parent.parent / "data.db"
    
    if not db_path.exists():
        print(f"Database file not found: {db_path}")
        return
    
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        print("Database tables:")
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
        tables = cursor.fetchall()
        
        for table in tables:
            print(f"- {table[0]}")
            
        # Check if profiles table exists and show its columns
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='profiles'")
        if cursor.fetchone():
            print("\nProfiles table columns:")
            cursor.execute("PRAGMA table_info(profiles)")
            columns = cursor.fetchall()
            for column in columns:
                print(f"- {column[1]} ({column[2]})")
        
        conn.close()
        
    except Exception as e:
        print(f"Error checking database: {e}")

if __name__ == "__main__":
    check_database()
