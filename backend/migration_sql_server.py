#!/usr/bin/env python3
"""
Migration script for SQL Server to add company column to profiles table and create companies table
"""

import pyodbc
import sys
from urllib.parse import quote_plus

def run_migration():
    """Run the database migration for SQL Server"""
    
    # Connection string from the database configuration
    ODBC_CONN = "DRIVER={ODBC Driver 17 for SQL Server};SERVER=104.247.167.130,57673;DATABASE=yazil112_meeting;UID=yazil112_test2;PWD=GURkan5391"
    
    try:
        print("Connecting to SQL Server...")
        conn = pyodbc.connect(ODBC_CONN)
        cursor = conn.cursor()
        
        print("Starting SQL Server database migration...")
        
        # Check if profiles table exists
        cursor.execute("SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'profiles'")
        if not cursor.fetchone():
            print("Creating profiles table...")
            cursor.execute("""
                CREATE TABLE profiles (
                    id INT IDENTITY(1,1) PRIMARY KEY,
                    user_id INT UNIQUE,
                    visit_count INT DEFAULT 0,
                    last_visited_at DATETIME DEFAULT GETDATE(),
                    phone VARCHAR(50) NULL,
                    website VARCHAR(500) NULL,
                    address VARCHAR(500) NULL,
                    about VARCHAR(1000) NULL,
                    photo_url VARCHAR(500) NULL,
                    video_url VARCHAR(500) NULL,
                    company VARCHAR(255) NULL,
                    theme NVARCHAR(MAX) DEFAULT '{}',
                    social_links NVARCHAR(MAX) DEFAULT '{}',
                    gallery NVARCHAR(MAX) DEFAULT '[]',
                    marketplaces NVARCHAR(MAX) DEFAULT '[]',
                    account_numbers NVARCHAR(MAX) DEFAULT '[]',
                    FOREIGN KEY (user_id) REFERENCES users (id)
                )
            """)
        else:
            print("Profiles table already exists")
            
            # Check if company column exists in profiles table
            cursor.execute("SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'profiles' AND COLUMN_NAME = 'company'")
            if not cursor.fetchone():
                print("Adding 'company' column to profiles table...")
                cursor.execute("ALTER TABLE profiles ADD company VARCHAR(255) NULL")
            else:
                print("'company' column already exists in profiles table")
        
        # Check if companies table exists
        cursor.execute("SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'companies'")
        if not cursor.fetchone():
            print("Creating companies table...")
            cursor.execute("""
                CREATE TABLE companies (
                    id INT IDENTITY(1,1) PRIMARY KEY,
                    user_id INT UNIQUE,
                    company_name VARCHAR(255) NULL,
                    company_type VARCHAR(100) NULL,
                    tax_office VARCHAR(100) NULL,
                    tax_number VARCHAR(50) NULL,
                    trade_registry_number VARCHAR(50) NULL,
                    mersis_no VARCHAR(50) NULL,
                    phone VARCHAR(50) NULL,
                    email VARCHAR(255) NULL,
                    website VARCHAR(500) NULL,
                    address VARCHAR(500) NULL,
                    district VARCHAR(100) NULL,
                    city VARCHAR(100) NULL,
                    country VARCHAR(100) DEFAULT 'Türkiye',
                    postal_code VARCHAR(20) NULL,
                    phone_alt VARCHAR(50) NULL,
                    email_alt VARCHAR(255) NULL,
                    website_alt VARCHAR(500) NULL,
                    billing_address VARCHAR(500) NULL,
                    description VARCHAR(1000) NULL,
                    founded_year INT NULL,
                    employee_count VARCHAR(50) NULL,
                    created_at DATETIME DEFAULT GETDATE(),
                    updated_at DATETIME DEFAULT GETDATE(),
                    FOREIGN KEY (user_id) REFERENCES users (id)
                )
            """)
        else:
            print("Companies table already exists")
        
        conn.commit()
        print("SQL Server migration completed successfully!")
        return True
        
    except Exception as e:
        print(f"SQL Server migration failed: {e}")
        return False
    finally:
        if 'conn' in locals():
            conn.close()

if __name__ == "__main__":
    success = run_migration()
    sys.exit(0 if success else 1)
