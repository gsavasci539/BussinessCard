from sqlalchemy import Column, Integer, Unicode, Boolean, DateTime, JSON, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    # Provide explicit lengths so MSSQL won't use VARCHAR(max), which can't be indexed uniquely
    username = Column(Unicode(150), unique=True, nullable=False, index=True)
    email = Column(Unicode(255), unique=True, nullable=True)
    full_name = Column(Unicode(255), nullable=True)
    role = Column(Unicode(50), default="user")
    is_active = Column(Boolean, default=True)
    password_hash = Column(Unicode(255), nullable=False)
    # created_at and last_login_at are omitted to match existing SQL Server schema

    profile = relationship("Profile", uselist=False, back_populates="user")
    company = relationship("Company", uselist=False, back_populates="user")
    appointments = relationship("Appointment", back_populates="user", cascade="all, delete-orphan")


class Company(Base):
    __tablename__ = "companies"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    
    # Company basic information
    company_name = Column(Unicode(255), nullable=True)
    company_type = Column(Unicode(100), nullable=True)
    tax_office = Column(Unicode(100), nullable=True)
    tax_number = Column(Unicode(50), nullable=True)
    trade_registry_number = Column(Unicode(50), nullable=True)
    mersis_no = Column(Unicode(50), nullable=True)
    
    # Company contact information
    phone = Column(Unicode(50), nullable=True)
    email = Column(Unicode(255), nullable=True)
    website = Column(Unicode(500), nullable=True)
    address = Column(Unicode(500), nullable=True)
    district = Column(Unicode(100), nullable=True)
    city = Column(Unicode(100), nullable=True)
    country = Column(Unicode(100), default="Türkiye")
    postal_code = Column(Unicode(20), nullable=True)
    
    # Alternative contact information
    phone_alt = Column(Unicode(50), nullable=True)
    email_alt = Column(Unicode(255), nullable=True)
    website_alt = Column(Unicode(500), nullable=True)
    billing_address = Column(Unicode(500), nullable=True)
    
    # Additional company info
    description = Column(Unicode(1000), nullable=True)
    founded_year = Column(Integer, nullable=True)
    employee_count = Column(Unicode(50), nullable=True)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    user = relationship("User", back_populates="company")


class Profile(Base):
    __tablename__ = "profiles"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)

    visit_count = Column(Integer, default=0)
    last_visited_at = Column(DateTime, default=datetime.utcnow)

    phone = Column(Unicode(50), nullable=True)
    website = Column(Unicode(500), nullable=True)
    address = Column(Unicode(500), nullable=True)
    about = Column(Unicode(1000), nullable=True)
    photo_url = Column(Unicode(500), nullable=True)
    video_url = Column(Unicode(500), nullable=True)
    
    # Company field (for backward compatibility)
    company = Column(Unicode(255), nullable=True)
    
    # Additional personal information fields
    title = Column(Unicode(255), nullable=True)
    gender = Column(Unicode(50), nullable=True)
    card_name = Column(Unicode(255), nullable=True)

    # Complex fields
    theme = Column(JSON, default={})
    social_links = Column(JSON, default={})
    gallery = Column(JSON, default=list)
    marketplaces = Column(JSON, default=list)
    account_numbers = Column(JSON, default=list)

    user = relationship("User", back_populates="profile")
    # Remove the incorrect appointments relationship as it should only be on the User model


class Appointment(Base):
    __tablename__ = "appointments"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(Unicode(255), nullable=False)
    url = Column(Unicode(1000), nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="appointments")
