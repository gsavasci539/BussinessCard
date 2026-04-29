#!/usr/bin/env python3
"""
Migration script to convert VARCHAR columns to NVARCHAR for Turkish character support
This script updates existing database columns to support Unicode characters
"""

import os
import sys
from sqlalchemy import create_engine, text
from urllib.parse import quote_plus

# Get the database connection string
ODBC_CONN = os.getenv(
    "ODBC_CONN",
    "DRIVER={ODBC Driver 17 for SQL Server};SERVER=104.247.167.130,57673;DATABASE=yazil112_meeting;UID=yazil112_test2;PWD=GURkan5391;charset=UTF-8",
)

DB_URL = os.getenv("DATABASE_URL")
if not DB_URL:
    DB_URL = f"mssql+pyodbc:///?odbc_connect={quote_plus(ODBC_CONN)}"

def migrate_to_unicode():
    """Convert VARCHAR columns to NVARCHAR for Turkish character support"""
    
    print("Starting Turkish character support migration...")
    
    # Create engine with UTF-8 support
    engine = create_engine(DB_URL, echo=True)
    
    # SQL statements to convert VARCHAR to NVARCHAR
    # First drop constraints and indexes, then alter columns, then recreate them
    migration_sql = [
        # Drop indexes
        "DROP INDEX IF EXISTS ix_users_username ON users",
        "DROP INDEX IF EXISTS ix_users_email ON users",
        
        # Drop unique constraints
        "ALTER TABLE users DROP CONSTRAINT IF EXISTS UQ__users__AB6E6164F6011E5D",  # email unique constraint
        "ALTER TABLE users DROP CONSTRAINT IF EXISTS UQ__users__F3DBC5724AF7D30D",  # username unique constraint
        
        # User table - alter columns
        "ALTER TABLE users ALTER COLUMN username NVARCHAR(150)",
        "ALTER TABLE users ALTER COLUMN email NVARCHAR(255)",
        "ALTER TABLE users ALTER COLUMN full_name NVARCHAR(255)",
        "ALTER TABLE users ALTER COLUMN role NVARCHAR(50)",
        "ALTER TABLE users ALTER COLUMN password_hash NVARCHAR(255)",
        
        # Recreate unique constraints
        "ALTER TABLE users ADD CONSTRAINT UQ_users_username UNIQUE (username)",
        "ALTER TABLE users ADD CONSTRAINT UQ_users_email UNIQUE (email)",
        
        # Recreate indexes
        "CREATE INDEX ix_users_username ON users(username)",
        "CREATE INDEX ix_users_email ON users(email)",
        
        # Drop default constraint for companies table
        "ALTER TABLE companies DROP CONSTRAINT IF EXISTS DF__companies__count__04659998",  # country default constraint
        
        # Company table - alter columns
        "ALTER TABLE companies ALTER COLUMN company_name NVARCHAR(255)",
        "ALTER TABLE companies ALTER COLUMN company_type NVARCHAR(100)",
        "ALTER TABLE companies ALTER COLUMN tax_office NVARCHAR(100)",
        "ALTER TABLE companies ALTER COLUMN tax_number NVARCHAR(50)",
        "ALTER TABLE companies ALTER COLUMN trade_registry_number NVARCHAR(50)",
        "ALTER TABLE companies ALTER COLUMN mersis_no NVARCHAR(50)",
        "ALTER TABLE companies ALTER COLUMN phone NVARCHAR(50)",
        "ALTER TABLE companies ALTER COLUMN email NVARCHAR(255)",
        "ALTER TABLE companies ALTER COLUMN website NVARCHAR(500)",
        "ALTER TABLE companies ALTER COLUMN address NVARCHAR(500)",
        "ALTER TABLE companies ALTER COLUMN district NVARCHAR(100)",
        "ALTER TABLE companies ALTER COLUMN city NVARCHAR(100)",
        "ALTER TABLE companies ALTER COLUMN country NVARCHAR(100)",
        "ALTER TABLE companies ALTER COLUMN postal_code NVARCHAR(20)",
        "ALTER TABLE companies ALTER COLUMN phone_alt NVARCHAR(50)",
        "ALTER TABLE companies ALTER COLUMN email_alt NVARCHAR(255)",
        "ALTER TABLE companies ALTER COLUMN website_alt NVARCHAR(500)",
        "ALTER TABLE companies ALTER COLUMN billing_address NVARCHAR(500)",
        "ALTER TABLE companies ALTER COLUMN description NVARCHAR(1000)",
        "ALTER TABLE companies ALTER COLUMN employee_count NVARCHAR(50)",
        
        # Recreate default constraint
        "ALTER TABLE companies ADD CONSTRAINT DF_companies_country DEFAULT 'Türkiye' FOR country",
        
        # Profile table - alter columns
        "ALTER TABLE profiles ALTER COLUMN phone NVARCHAR(50)",
        "ALTER TABLE profiles ALTER COLUMN website NVARCHAR(500)",
        "ALTER TABLE profiles ALTER COLUMN address NVARCHAR(500)",
        "ALTER TABLE profiles ALTER COLUMN about NVARCHAR(1000)",
        "ALTER TABLE profiles ALTER COLUMN photo_url NVARCHAR(500)",
        "ALTER TABLE profiles ALTER COLUMN video_url NVARCHAR(500)",
        "ALTER TABLE profiles ALTER COLUMN company NVARCHAR(255)",
        "ALTER TABLE profiles ALTER COLUMN title NVARCHAR(255)",
        "ALTER TABLE profiles ALTER COLUMN gender NVARCHAR(50)",
        "ALTER TABLE profiles ALTER COLUMN card_name NVARCHAR(255)",
    ]
    
    try:
        with engine.connect() as conn:
            # Begin transaction
            trans = conn.begin()
            
            try:
                # Execute each migration statement
                for sql in migration_sql:
                    print(f"Executing: {sql}")
                    conn.execute(text(sql))
                    print("✓ Success")
                
                # Commit transaction
                trans.commit()
                print("\n✅ Migration completed successfully!")
                print("All VARCHAR columns have been converted to NVARCHAR for Turkish character support.")
                
            except Exception as e:
                # Rollback on error
                trans.rollback()
                print(f"\n❌ Migration failed: {e}")
                raise
                
    except Exception as e:
        print(f"❌ Database connection error: {e}")
        raise

if __name__ == "__main__":
    migrate_to_unicode()
