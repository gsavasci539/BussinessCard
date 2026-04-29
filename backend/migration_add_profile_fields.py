#!/usr/bin/env python3
"""
Migration script to add new profile fields (title, gender, card_name) to the profiles table
"""

import os
import sys
from sqlalchemy import create_engine, text
from urllib.parse import quote_plus

# Get database connection details
ODBC_CONN = os.getenv(
    "ODBC_CONN",
    "DRIVER={ODBC Driver 17 for SQL Server};SERVER=104.247.167.130,57673;DATABASE=yazil112_meeting;UID=yazil112_test2;PWD=GURkan5391",
)

DB_URL = os.getenv("DATABASE_URL")
if not DB_URL:
    # Build SQLAlchemy URL using pyodbc and the ODBC connection string
    DB_URL = f"mssql+pyodbc:///?odbc_connect={quote_plus(ODBC_CONN)}"

def add_profile_fields():
    """Add new columns to profiles table"""
    engine = create_engine(DB_URL, echo=False)
    
    with engine.connect() as conn:
        # Check if columns already exist
        check_columns = """
        SELECT COLUMN_NAME 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_NAME = 'profiles' 
        AND COLUMN_NAME IN ('title', 'gender', 'card_name')
        """
        
        result = conn.execute(text(check_columns))
        existing_columns = [row[0] for row in result.fetchall()]
        
        # Add title column if it doesn't exist
        if 'title' not in existing_columns:
            print("Adding 'title' column to profiles table...")
            conn.execute(text("""
                ALTER TABLE profiles 
                ADD title NVARCHAR(255) NULL
            """))
            print("✓ 'title' column added successfully")
        
        # Add gender column if it doesn't exist
        if 'gender' not in existing_columns:
            print("Adding 'gender' column to profiles table...")
            conn.execute(text("""
                ALTER TABLE profiles 
                ADD gender NVARCHAR(50) NULL
            """))
            print("✓ 'gender' column added successfully")
        
        # Add card_name column if it doesn't exist
        if 'card_name' not in existing_columns:
            print("Adding 'card_name' column to profiles table...")
            conn.execute(text("""
                ALTER TABLE profiles 
                ADD card_name NVARCHAR(255) NULL
            """))
            print("✓ 'card_name' column added successfully")
        
        # Commit the transaction
        conn.commit()
        print("✓ Migration completed successfully!")

if __name__ == "__main__":
    try:
        add_profile_fields()
        print("\n🎉 All profile fields have been added successfully!")
    except Exception as e:
        print(f"❌ Error during migration: {e}")
        sys.exit(1)
