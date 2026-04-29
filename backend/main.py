from fastapi import FastAPI, Depends, HTTPException, status, Request, Form, UploadFile, File, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session, joinedload
from typing import Optional, List, Dict, Any
from datetime import timedelta, datetime
from pathlib import Path

from database import Base, engine, get_db
from models import User, Profile, Company, Appointment
from schemas import (
    TokenResponse,
    RegisterPayload,
    ProfileOut,
    ProfileUpdate,
    MarketplacesUpdate,
    AccountNumbersUpdate,
    CompanyCreate,
CompanyUpdate,
    CompanyOut,
    AppointmentCreate,
    AppointmentUpdate,
    AppointmentOut,
)
from auth import verify_password, get_password_hash, create_access_token


from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Kartvizit API")

# CORS configuration
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://card.bytebridge.com.tr",
    "https://card.bytebridge.com.tr",
    "http://89.252.184.134:5002",
    "https://89.252.184.134:5002",
    "http://89.252.184.134",
    "https://89.252.184.134",
    "http://localhost:8081",
    "http://127.0.0.1:8081",
    "capacitor://localhost",
    "capacitor://127.0.0.1",
    "http://localhost",
    "https://localhost",
    "file://",
    "ionic://localhost",
]

# Add additional origins from environment variable (comma-separated)
_extra_origins = os.getenv("CORS_ORIGINS", "")
if _extra_origins:
    origins.extend([o.strip() for o in _extra_origins.split(",") if o.strip()])

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Create tables (optional). To avoid altering existing SQL Server schemas, this is disabled by default.
# Set environment variable CREATE_SCHEMA=1 to enable automatic table creation.
import os as _os
if _os.getenv("CREATE_SCHEMA", "0") == "1":
    Base.metadata.create_all(bind=engine)

# Static media configuration (store user-uploaded files under project/media)
from fastapi.staticfiles import StaticFiles

BASE_DIR = Path(__file__).resolve().parent.parent  # project root (kartvizit)
MEDIA_ROOT = BASE_DIR / "media"
MEDIA_ROOT.mkdir(parents=True, exist_ok=True)
app.mount("/media", StaticFiles(directory=str(MEDIA_ROOT)), name="media")


# Utility: get current user from Authorization header
from fastapi import Header
from jose import JWTError, jwt
import os

SECRET_KEY = os.getenv("SECRET_KEY", "dev_secret_key_change_me")
ALGORITHM = "HS256"


def get_current_user(db: Session = Depends(get_db), authorization: Optional[str] = Header(None)) -> User:
    if not authorization or not authorization.lower().startswith("bearer "):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")
    token = authorization.split(" ", 1)[1]
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

    username: str = payload.get("sub")
    if not username:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token payload")
    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    return user


def require_admin(user: User = Depends(get_current_user)) -> User:
    if user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin privileges required")
    return user


# Seed initial data
from sqlalchemy import select

def seed(db: Session):
    """Seed default users only if the users table is empty.
    This prevents conflicts with existing production data (e.g., unique email).
    """
    # If any user exists, skip seeding entirely
    if db.execute(select(User).limit(1)).first():
        return

    def ensure_user(username: str, password: str, email: Optional[str] = None, full_name: Optional[str] = None, role: str = "user"):
        user = User(
            username=username,
            email=email,
            full_name=full_name,
            role=role,
            password_hash=get_password_hash(password),
        )
        db.add(user)
        db.flush()
        profile = Profile(
            user_id=user.id,
            about="Merhaba! Ben bir test kullanÄ±cÄ±sÄ±yÄ±m. Bu Ã¶rnek bir kartvizit sayfasÄ±dÄ±r." if username == "testuser" else None,
            phone="+90 555 123 4567" if username == "testuser" else None,
            website="https://example.com" if username == "testuser" else None,
            address="Ä°stanbul, TÃ¼rkiye" if username == "testuser" else None,
            theme={
                "primaryColor": "#4f46e5",
                "backgroundColor": "#ffffff",
                "textColor": "#1f2937",
                "font": "Inter, system-ui, -apple-system, sans-serif",
            },
            social_links={
                "linkedin": "https://linkedin.com/in/testuser",
                "x": "https://twitter.com/testuser",
                "instagram": "https://instagram.com/testuser",
                "facebook": "https://facebook.com/testuser",
                "github": "https://github.com/testuser",
                "youtube": "https://youtube.com/@testuser",
                "tiktok": "https://tiktok.com/@testuser",
                "services": [
                    {"name": "Web TasarÄ±m", "description": "Profesyonel web siteleri"},
                    {"name": "SEO", "description": "Arama motoru optimizasyonu"},
                    {"name": "Sosyal Medya", "description": "Sosyal medya yÃ¶netimi"},
                ],
                "catalog_url": "https://example.com/catalog.pdf",
            },
            gallery=[
                {"url": "https://via.placeholder.com/400x300", "title": "Proje 1"},
                {"url": "https://via.placeholder.com/400x300", "title": "Proje 2"},
                {"url": "https://via.placeholder.com/400x300", "title": "Proje 3"},
            ],
            video_url="https://www.youtube.com/embed/dQw4w9WgXcQ",
            marketplaces=[
                {"name": "Trendyol", "url": "https://trendyol.com/satici/12345"},
                {"name": "Hepsiburada", "url": "https://hepsiburada.com/satici/12345"},
            ],
            account_numbers=[
                {"bank": "Ziraat BankasÄ±", "name": "Ahmet YÄ±lmaz", "iban": "TR00 ... 01"},
                {"bank": "Garanti BBVA", "name": "Ahmet YÄ±lmaz", "iban": "TR00 ... 02"},
            ],
        )
        db.add(profile)

    # Only seed if table was empty
    ensure_user("admin", "admin123", email="admin@example.com", full_name="Admin User", role="admin")
    ensure_user("testuser", "test123", email="test@example.com", full_name="Test User", role="user")
    db.commit()


def ensure_test_users(db: Session):
    """Always ensure two test users exist: admin_demo and user_demo."""
    def upsert_user(username: str, password: str, email: Optional[str], full_name: Optional[str], role: str):
        u = db.query(User).filter(User.username == username).first()
        if u:
            # ensure role stays as requested
            u.role = role
            return u
        user = User(
            username=username,
            email=email,
            full_name=full_name,
            role=role,
            password_hash=get_password_hash(password),
        )
        db.add(user)
        db.flush()
        profile = Profile(user_id=user.id)
        db.add(profile)
        return user

    upsert_user("admin_demo", "admin123", "admin_demo@example.com", "Admin Demo", "admin")
    upsert_user("user_demo", "user123", "user_demo@example.com", "User Demo", "user")
    db.commit()


# Run seeding at startup
@app.on_event("startup")
def on_startup():
    db = next(get_db())
    try:
        seed(db)
        ensure_test_users(db)
    finally:
        db.close()


# Auth endpoints
@app.post("/api/token", response_model=TokenResponse)
async def login(
    request: Request,
    db: Session = Depends(get_db),
    username: str | None = Form(default=None),
    password: str | None = Form(default=None),
):
    """Flexible login endpoint that accepts both form-encoded and JSON bodies.
    Keeps demo fallback for environments where password_hash is missing.
    """
    # If form fields are missing, try JSON body
    if username is None or password is None:
        try:
            data = await request.json()
            username = username or data.get("username")
            password = password or data.get("password")
        except Exception:
            pass

    if not username or not password:
        raise HTTPException(status_code=422, detail="username and password are required")

    # Try to locate the user in DB
    user = db.query(User).filter(User.username == username).first()

    # Primary path: if we have a stored hash, verify it
    if user and getattr(user, "password_hash", None):
        try:
            if verify_password(password, user.password_hash):
                token = create_access_token({"sub": user.username}, expires_delta=timedelta(hours=8))
                db.commit()
                return TokenResponse(access_token=token)
        except Exception:
            # If verification fails due to schema/hash issues, continue to demo fallback
            pass

    # Fallback: allow demo users even if password_hash is missing
    DEMO_USERS = {
        "admin_demo": {"password": "admin123"},
        "user_demo": {"password": "user123"},
    }
    demo = DEMO_USERS.get(username)
    if demo and password == demo["password"] and user:
        token = create_access_token({"sub": user.username}, expires_delta=timedelta(hours=8))
        db.commit()
        return TokenResponse(access_token=token)

    # If user not found or credentials invalid
    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect username or password")


@app.options("/api/token")
async def login_options():
    return {"message": "OK"}


@app.post("/api/register", response_model=TokenResponse)
def register(payload: RegisterPayload, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.username == payload.username).first()
    if existing:
        raise HTTPException(status_code=400, detail="Username already exists")

    user = User(
        username=payload.username,
        email=payload.email,
        full_name=payload.full_name,
        password_hash=get_password_hash(payload.password),
    )
    db.add(user)
    db.flush()
    db.add(Profile(user_id=user.id))
    db.commit()

    token = create_access_token({"sub": user.username}, expires_delta=timedelta(hours=8))
    return TokenResponse(access_token=token)


@app.options("/api/register")
async def register_options():
    return {"message": "OK"}


@app.post("/api/logout")
def logout():
    # Stateless JWT; logout is a no-op for server. Client should delete token.
    return {"message": "Logged out"}


# Profile endpoints

def profile_to_out(user: User, profile: Profile) -> ProfileOut:
    # Get company information
    company = None
    if hasattr(user, 'company') and user.company:
        company = CompanyOut(
            id=user.company.id,
            user_id=user.company.user_id,
            company_name=user.company.company_name,
            company_type=user.company.company_type,
            tax_office=user.company.tax_office,
            tax_number=user.company.tax_number,
            trade_registry_number=user.company.trade_registry_number,
            mersis_no=user.company.mersis_no,
            phone=user.company.phone,
            email=user.company.email,
            website=user.company.website,
            address=user.company.address,
            district=user.company.district,
            city=user.company.city,
            country=user.company.country,
            postal_code=user.company.postal_code,
            phone_alt=user.company.phone_alt,
            email_alt=user.company.email_alt,
            website_alt=user.company.website_alt,
            billing_address=user.company.billing_address,
            description=user.company.description,
            founded_year=user.company.founded_year,
            employee_count=user.company.employee_count,
            created_at=user.company.created_at.isoformat() if user.company.created_at else None,
            updated_at=user.company.updated_at.isoformat() if user.company.updated_at else None
        )
    
    # Get active appointments for the user
    appointments = []
    if hasattr(user, 'appointments'):
        appointments = [
            AppointmentOut(
                id=appt.id,
                user_id=appt.user_id,
                name=appt.name,
                url=appt.url,
                is_active=appt.is_active,
                created_at=appt.created_at.isoformat() if appt.created_at else None,
                updated_at=appt.updated_at.isoformat() if appt.updated_at else None
            )
            for appt in user.appointments
            if appt.is_active
        ]
    
    # Ensure required fields have default values
    username = getattr(user, 'username', '')
    email = getattr(user, 'email', None)
    full_name = getattr(user, 'full_name', '')
    role = getattr(user, 'role', 'user')
    is_active = getattr(user, 'is_active', True)
    
    # Format dates as ISO strings
    created_at = getattr(profile, 'created_at', None)
    created_at_str = created_at.isoformat() if created_at else None
    
    last_visited_at = getattr(profile, 'last_visited_at', None)
    last_visited_at_str = last_visited_at.isoformat() if last_visited_at else None
    
    return ProfileOut(
        id=user.id,
        username=username,  # Required field
        email=email,
        full_name=full_name,
        title=getattr(profile, 'title', None),
        gender=getattr(profile, 'gender', None),
        card_name=getattr(profile, 'card_name', None),
        role=role,
        is_active=is_active,
        created_at=created_at_str,  # Now properly formatted as string
        visit_count=getattr(profile, 'visit_count', 0) or 0,
        last_visited_at=last_visited_at_str,  # Now properly formatted as string
        phone=getattr(profile, 'phone', None),
        website=getattr(profile, 'website', None),
        address=getattr(profile, 'address', None),
        about=getattr(profile, 'about', None),
        photo_url=getattr(profile, 'photo_url', None),
        video_url=getattr(profile, 'video_url', None),
        theme=getattr(profile, 'theme', None),
        social_links=getattr(profile, 'social_links', None),
        gallery=getattr(profile, 'gallery', None),
        marketplaces=getattr(profile, 'marketplaces', None),
        account_numbers=getattr(profile, 'account_numbers', None),
        company=getattr(profile, 'company', None),
        company_info=company,
        appointments=appointments
    )


@app.get("/api/profile", response_model=ProfileOut)
def get_profile(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Get the current user's profile with all related data"""
    # Get profile with all relationships
    profile = (
        db.query(Profile)
        .options(
            joinedload(Profile.user)
        )
        .filter(Profile.user_id == current_user.id)
        .first()
    )

    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile not found"
        )
    
    # Get company info if exists
    company = db.query(Company).filter(Company.user_id == current_user.id).first()
    
    # Get active appointments
    appointments = (
        db.query(Appointment)
        .filter(
            Appointment.user_id == current_user.id,
            Appointment.is_active == True
        )
        .order_by(Appointment.created_at.desc())
        .all()
    )
    
    # Add company and appointments to the user object
    if company:
        current_user.company = company
    current_user.appointments = appointments
    
    # Use the profile_to_out function to format the response
    return profile_to_out(current_user, profile)


@app.get("/api/public/profile/{username}", response_model=ProfileOut)
def get_public_profile(username: str, db: Session = Depends(get_db)):
    """Public endpoint to view a user's card by username without authentication."""
    user = db.query(User).filter(User.username == username).first()
    if not user:
        # Fallback: serve demo profiles even if DB doesn't have the record
        DEMO_PROFILES = {
            "user_demo": {
                "username": "user_demo",
                "full_name": "User Demo",
                "role": "user",
            },
            "admin_demo": {
                "username": "admin_demo",
                "full_name": "Admin Demo",
                "role": "admin",
            },
            "testuser": {
                "username": "testuser",
                "full_name": "Test User",
                "role": "user",
            },
        }
        demo = DEMO_PROFILES.get(username)
        if demo:
            # Return a synthesized profile with pleasant defaults
            return ProfileOut(
                id=0,
                username=demo["username"],
                email=None,
                full_name=demo.get("full_name"),
                role=demo.get("role", "user"),
                is_active=True,
                created_at=None,
                visit_count=0,
                last_visited_at=None,
                phone="+90 555 123 4567" if username == "testuser" else None,
                website="https://example.com" if username == "testuser" else None,
                address="Ä°stanbul, TÃ¼rkiye" if username == "testuser" else None,
                about=(None if username == "user_demo" else "Merhaba! Bu, demo kullanÄ±cÄ± iÃ§in Ã¶rnek bir kartvizit sayfasÄ±dÄ±r."),
                photo_url=None,
                video_url="https://www.youtube.com/embed/dQw4w9WgXcQ",
                theme={
                    "primaryColor": "#4f46e5",
                    "backgroundColor": "#ffffff",
                    "textColor": "#1f2937",
                    "font": "Inter, system-ui, -apple-system, sans-serif",
                },
                social_links={
                    "linkedin": "https://linkedin.com/in/demo",
                    "x": "https://twitter.com/demo",
                    "instagram": "https://instagram.com/demo",
                    "facebook": "https://facebook.com/demo",
                    "github": "https://github.com/demo",
                    "youtube": "https://youtube.com/@demo",
                    "tiktok": "https://tiktok.com/@demo",
                    "services": [
                        {"name": "Web TasarÄ±m", "description": "Profesyonel web siteleri"},
                        {"name": "SEO", "description": "Arama motoru optimizasyonu"},
                    ],
                    "catalog_url": "https://example.com/catalog.pdf",
                },
                gallery=[
                    {"url": "https://via.placeholder.com/400x300", "title": "Proje 1"},
                    {"url": "https://via.placeholder.com/400x300", "title": "Proje 2"},
                ],
                marketplaces=[
                    {"name": "Trendyol", "url": "https://trendyol.com/satici/12345"},
                    {"name": "Hepsiburada", "url": "https://hepsiburada.com/satici/12345"},
                ],
                account_numbers=[
                    {"bank": "Ziraat BankasÄ±", "name": "Demo KullanÄ±cÄ±", "iban": "TR00 ... 01"},
                ],
            )
        raise HTTPException(status_code=404, detail="User not found")
    # Get profile with user relationship
    profile = db.query(Profile).options(joinedload(Profile.user)).filter(Profile.user_id == user.id).first()
    if not profile:
        profile = Profile(user_id=user.id)
        db.add(profile)
        db.commit()
        db.refresh(profile)
    
    # Get active appointments
    appointments = (
        db.query(Appointment)
        .filter(
            Appointment.user_id == user.id,
            Appointment.is_active == True
        )
        .order_by(Appointment.created_at.desc())
        .all()
    )
    
    # Add appointments to the user object
    user.appointments = appointments
    
    return profile_to_out(user, profile)


@app.put("/api/profile", response_model=ProfileOut)
def update_profile(update: ProfileUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    if not profile:
        profile = Profile(user_id=current_user.id)
        db.add(profile)
    
    # Update full_name in User table if provided
    if update.full_name is not None:
        current_user.full_name = update.full_name
    
    # Simple assignment for optional fields in Profile table
    for field in [
        "title", "gender", "card_name", "company", "phone", "website", "address", "about", "photo_url", "video_url",
    ]:
        val = getattr(update, field)
        if val is not None:
            setattr(profile, field, val)

    if update.theme is not None:
        print(f"Gelen theme verisi: {update.theme}")
        print(f"Theme tipi: {type(update.theme)}")
        
        # Theme objesini dict'e dÃ¶nÃ¼ÅŸtÃ¼r
        if hasattr(update.theme, "model_dump"):
            theme_data = update.theme.model_dump()
            print(f"Model dump sonrasÄ± theme: {theme_data}")
        elif isinstance(update.theme, dict):
            theme_data = update.theme
            print(f"Dict olarak gelen theme: {theme_data}")
        else:
            # String veya diÄŸer tipler iÃ§in dict'e Ã§evir
            theme_data = {"primaryColor": str(update.theme)}
            print(f"DiÄŸer tipten Ã§evrilen theme: {theme_data}")
        
        # Gerekli alanlarÄ±n varlÄ±ÄŸÄ±nÄ± kontrol et ve varsayÄ±lan deÄŸerlerle tamamla
        theme_data["primaryColor"] = theme_data.get("primaryColor", "#111827")
        theme_data["backgroundColor"] = theme_data.get("backgroundColor", "#ffffff")
        theme_data["textColor"] = theme_data.get("textColor", "#1f2937")
        theme_data["font"] = theme_data.get("font", "Inter, system-ui")
        theme_data["backgroundImage"] = theme_data.get("backgroundImage", "")
        
        profile.theme = theme_data
        print(f"Kaydedilen profile.theme: {profile.theme}")
    if update.social_links is not None:
        # accept dict or pydantic model
        if hasattr(update.social_links, "model_dump"):
            profile.social_links = update.social_links.model_dump()
        else:
            profile.social_links = update.social_links
    if update.gallery is not None:
        profile.gallery = [g.model_dump() if hasattr(g, "model_dump") else g for g in update.gallery]

    db.commit()
    db.refresh(profile)
    print(f"DB commit sonrasÄ± profile.theme: {profile.theme}")
    print(f"DB commit sonrasÄ± profile.theme tipi: {type(profile.theme)}")
    return profile_to_out(current_user, profile)


@app.put("/api/profile/marketplaces", response_model=ProfileOut)
def update_marketplaces(payload: MarketplacesUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    if not profile:
        profile = Profile(user_id=current_user.id)
        db.add(profile)
    profile.marketplaces = [m.model_dump() if hasattr(m, "model_dump") else m for m in payload.marketplaces]
    db.commit()
    db.refresh(profile)
    return profile_to_out(current_user, profile)


@app.put("/api/profile/account-numbers", response_model=ProfileOut)
def update_account_numbers(payload: AccountNumbersUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    if not profile:
        profile = Profile(user_id=current_user.id)
        db.add(profile)
    profile.account_numbers = [a.model_dump() if hasattr(a, "model_dump") else a for a in payload.account_numbers]
    db.commit()
    db.refresh(profile)
    return profile_to_out(current_user, profile)


# Company endpoints
@app.get("/api/company", response_model=CompanyOut)
def get_company(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    company = db.query(Company).filter(Company.user_id == current_user.id).first()
    if not company:
        # Return empty company if not exists
        return CompanyOut(
            id=0,
            user_id=current_user.id,
            company_name=None,
            company_type=None,
            tax_office=None,
            tax_number=None,
            trade_registry_number=None,
            mersis_no=None,
            phone=None,
            email=None,
            website=None,
            address=None,
            district=None,
            city=None,
            country="TÃ¼rkiye",
            postal_code=None,
            phone_alt=None,
            email_alt=None,
            website_alt=None,
            billing_address=None,
            description=None,
            founded_year=None,
            employee_count=None,
            created_at=None,
            updated_at=None
        )
    return company


@app.put("/api/company", response_model=CompanyOut)
def update_company(payload: CompanyUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    company = db.query(Company).filter(Company.user_id == current_user.id).first()
    if not company:
        company = Company(user_id=current_user.id)
        db.add(company)
    
    # Update all fields from payload
    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(company, field, value)
    
    db.commit()
    db.refresh(company)
    return company


@app.post("/api/company", response_model=CompanyOut)
def create_company(payload: CompanyCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # Check if company already exists
    existing_company = db.query(Company).filter(Company.user_id == current_user.id).first()
    if existing_company:
        raise HTTPException(status_code=400, detail="Company already exists for this user")
    
    company = Company(user_id=current_user.id, **payload.model_dump())
    db.add(company)
    db.commit()
    db.refresh(company)
    return company


# -------------------------------
# File upload endpoints (photo, gallery, catalog)
# -------------------------------

def _ensure_user_media_dirs(user_id: int) -> dict:
    user_dir = MEDIA_ROOT / "users" / str(user_id)
    gallery_dir = user_dir / "gallery"
    catalog_dir = user_dir / "catalog"
    user_dir.mkdir(parents=True, exist_ok=True)
    gallery_dir.mkdir(parents=True, exist_ok=True)
    catalog_dir.mkdir(parents=True, exist_ok=True)
    return {
        "user": user_dir,
        "gallery": gallery_dir,
        "catalog": catalog_dir,
    }


@app.post("/api/profile/photo", response_model=ProfileOut)
async def upload_profile_photo(file: UploadFile = File(...), current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    allowed = {"image/jpeg", "image/png", "image/webp"}
    if file.content_type not in allowed:
        raise HTTPException(status_code=400, detail="Unsupported file type. Allowed: JPEG, PNG, WEBP")

    dirs = _ensure_user_media_dirs(current_user.id)
    # Decide extension
    ext_map = {"image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp"}
    ext = ext_map.get(file.content_type, Path(file.filename).suffix or ".jpg")
    dest_path = dirs["user"] / f"photo{ext}"

    data = await file.read()
    dest_path.write_bytes(data)

    # Update profile photo_url
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    if not profile:
        profile = Profile(user_id=current_user.id)
        db.add(profile)
    relative_url = f"/media/users/{current_user.id}/{dest_path.name}"
    profile.photo_url = relative_url
    db.commit()
    db.refresh(profile)
    return profile_to_out(current_user, profile)


@app.post("/api/profile/gallery")
async def upload_gallery_image(file: UploadFile = File(...), current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    allowed = {"image/jpeg", "image/png", "image/webp"}
    if file.content_type not in allowed:
        raise HTTPException(status_code=400, detail="Unsupported file type. Allowed: JPEG, PNG, WEBP")

    dirs = _ensure_user_media_dirs(current_user.id)
    # Preserve original filename
    filename = Path(file.filename).name
    # Avoid collisions by prefixing timestamp
    import time as _time
    safe_name = f"{int(_time.time())}_{filename}"
    dest_path = dirs["gallery"] / safe_name

    data = await file.read()
    dest_path.write_bytes(data)

    item = {"url": f"/media/users/{current_user.id}/gallery/{safe_name}", "title": filename}
    # Do not overwrite gallery here; frontend will PUT /api/profile with updated gallery
    return item


@app.post("/api/profile/catalog")
async def upload_catalog(file: UploadFile = File(...), current_user: User = Depends(get_current_user)):
    allowed = {
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "application/vnd.ms-excel",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    }
    if file.content_type not in allowed:
        raise HTTPException(status_code=400, detail="Unsupported catalog type")

    dirs = _ensure_user_media_dirs(current_user.id)
    filename = Path(file.filename).name
    dest_path = dirs["catalog"] / filename
    data = await file.read()
    dest_path.write_bytes(data)

    return {"url": f"/media/users/{current_user.id}/catalog/{filename}"}


@app.get("/")
def root():
    return {"status": "ok"}


@app.options("/")
async def root_options():
    return {"status": "ok"}


# -------------------------------
# Additional endpoints for pages
# -------------------------------

# Map update used in Settings and Dashboard pages
@app.put("/api/map", response_model=ProfileOut)
def update_map(payload: dict, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """Accepts arbitrary fields, expects latitude/longitude inside payload.
    We'll store map info under profile.social_links.map = { latitude, longitude }.
    """
    profile = db.query(Profile).filter(Profile.user_id == current_user.id).first()
    if not profile:
        profile = Profile(user_id=current_user.id)
        db.add(profile)

    social = profile.social_links or {}
    social["map"] = {
        "latitude": payload.get("latitude"),
        "longitude": payload.get("longitude"),
    }
    profile.social_links = social
    db.commit()
    db.refresh(profile)
    return profile_to_out(current_user, profile)


# Password change
@app.put("/api/profile/password")
def change_password(payload: dict, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    old_password = payload.get("old_password")
    new_password = payload.get("new_password")
    if not old_password or not new_password:
        raise HTTPException(status_code=400, detail="old_password and new_password are required")
    # verify
    if not verify_password(old_password, current_user.password_hash):
        raise HTTPException(status_code=400, detail="Old password is incorrect")
    current_user.password_hash = get_password_hash(new_password)
    db.commit()
    return {"message": "Password updated"}


# Admin stats used by AdminDashboard
@app.get("/api/admin/stats/users")
def admin_stats_users(admin: User = Depends(require_admin), db: Session = Depends(get_db)):
    total = db.query(User).count()
    active = db.query(User).filter(User.is_active == True).count()
    return {"total_users": total, "active_users": active}


@app.get("/api/admin/stats/sales")
def admin_stats_sales(admin: User = Depends(require_admin)):
    # Placeholder values; integrate real sales data if available
    return {"total_sales": 0, "total_revenue": 0}


@app.get("/api/admin/stats/issues")
def admin_stats_issues(admin: User = Depends(require_admin)):
    return {"open_issues": 0}


@app.get("/api/admin/stats/requests")
def admin_stats_requests(admin: User = Depends(require_admin)):
    return {"pending_requests": 0}


# Appointment endpoints
@app.post("/api/appointments", response_model=AppointmentOut)
def create_appointment(
    appointment: AppointmentCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new appointment type for the current user"""
    db_appointment = Appointment(user_id=current_user.id, **appointment.dict())
    db.add(db_appointment)
    db.commit()
    db.refresh(db_appointment)
    return db_appointment


@app.get("/api/appointments", response_model=List[AppointmentOut])
def list_appointments(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List all appointment types for the current user"""
    return db.query(Appointment).filter(
        Appointment.user_id == current_user.id
    ).order_by(Appointment.created_at.desc()).all()


@app.get("/api/appointments/{appointment_id}", response_model=AppointmentOut)
def get_appointment(
    appointment_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific appointment type by ID"""
    appointment = db.query(Appointment).filter(
        Appointment.id == appointment_id,
        Appointment.user_id == current_user.id
    ).first()
    if not appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
    return appointment


@app.put("/api/appointments/{appointment_id}", response_model=AppointmentOut)
def update_appointment(
    appointment_id: int,
    appointment_update: AppointmentUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update an existing appointment type"""
    db_appointment = db.query(Appointment).filter(
        Appointment.id == appointment_id,
        Appointment.user_id == current_user.id
    ).first()
    if not db_appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
    
    update_data = appointment_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_appointment, field, value)
    
    db_appointment.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(db_appointment)
    return db_appointment


@app.delete("/api/appointments/{appointment_id}")
def delete_appointment(
    appointment_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete an appointment type"""
    db_appointment = db.query(Appointment).filter(
        Appointment.id == appointment_id,
        Appointment.user_id == current_user.id
    ).first()
    if not db_appointment:
        raise HTTPException(status_code=404, detail="Appointment not found")
    
    db.delete(db_appointment)
    db.commit()
    return {"message": "Appointment deleted successfully"}


# Admin users management minimal API
@app.get("/api/admin/users")
def list_users(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(10, ge=1, le=100, description="Items per page"),
    q: Optional[str] = None,
    admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    # Start building the query
    query = db.query(User)
    
    # Apply search filter if query parameter is provided
    if q:
        search = f"%{q}%"
        query = query.filter(
            (User.username.ilike(search)) |
            (User.email.ilike(search)) |
            (User.full_name.ilike(search))
        )
    
    # Get total count for pagination
    total = query.count()
    
    # Apply pagination
    items = (query.order_by(User.id.desc())
                .offset((page - 1) * page_size)
                .limit(page_size)
                .all())
    
    # Format response
    return {
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": (total + page_size - 1) // page_size,
        "items": [
            {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "full_name": user.full_name or "",
                "role": user.role,
                "is_active": user.is_active,
                "created_at": user.created_at.isoformat() if user.created_at else None,
                "updated_at": user.updated_at.isoformat() if user.updated_at else None,
            }
            for user in items
        ]
    }


@app.put("/api/admin/users/{user_id}")
def update_user(user_id: int, payload: dict, admin: User = Depends(require_admin), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    for field in ["username", "email", "full_name", "role", "is_active"]:
        if field in payload and payload[field] is not None:
            setattr(user, field, payload[field])
    db.commit()
    return {"message": "User updated"}


@app.post("/api/admin/users/{user_id}/block")
def block_user(user_id: int, admin: User = Depends(require_admin), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.is_active = False
    db.commit()
    return {"message": "User blocked"}


@app.post("/api/admin/users/{user_id}/unblock")
def unblock_user(user_id: int, admin: User = Depends(require_admin), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.is_active = True
    db.commit()
    return {"message": "User unblocked"}


@app.delete("/api/admin/users/{user_id}")
def delete_user(user_id: int, admin: User = Depends(require_admin), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    db.delete(user)
    db.commit()
    return {"message": "User deleted"}


# Admin issues minimal stubs to satisfy frontend
@app.get("/api/admin/issues")
def list_issues(page: int = 1, page_size: int = 10, status: Optional[str] = None, priority: Optional[str] = None, admin: User = Depends(require_admin)):
    # Return empty dataset placeholder. Integrate real data source as needed.
    return {"total": 0, "items": []}


# Run the server (only if this file is executed directly)
if __name__ == "__main__":
    import uvicorn
    print("?? Starting FastAPI server...")
    print("?? Server will be available at: http://localhost:5002")
    print("?? For external access: http://0.0.0.0:5002")
    print("?? Mobile apps should connect to your computer's IP: http://YOUR_IP:5002")
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=5002,
        reload=True,
        log_level="info"
    )
