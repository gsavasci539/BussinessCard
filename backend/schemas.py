from typing import List, Optional, Any, Dict
from pydantic import BaseModel, Field, EmailStr
from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field, HttpUrl, validator


class AppointmentBase(BaseModel):
    name: str = Field(..., max_length=255, description="Name of the appointment type")
    url: str = Field(..., max_length=1000, description="URL of the appointment form")
    is_active: bool = Field(default=True, description="Whether the appointment type is active")


class AppointmentCreate(AppointmentBase):
    pass


class AppointmentUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=255, description="Name of the appointment type")
    url: Optional[str] = Field(None, max_length=1000, description="URL of the appointment form")
    is_active: Optional[bool] = Field(None, description="Whether the appointment type is active")


class AppointmentOut(AppointmentBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime

    model_config = {
        "from_attributes": True,
        "json_encoders": {
            datetime: lambda v: v.isoformat() if v else None
        }
    }


class Theme(BaseModel):
    primaryColor: Optional[str] = Field(default="#111827")
    backgroundColor: Optional[str] = Field(default="#ffffff")
    textColor: Optional[str] = Field(default="#1f2937")
    font: Optional[str] = Field(default="Inter, system-ui")
    backgroundImage: Optional[str] = None


class ServiceItem(BaseModel):
    name: str
    description: Optional[str] = None


class SocialLinks(BaseModel):
    linkedin: Optional[str] = None
    x: Optional[str] = None
    instagram: Optional[str] = None
    facebook: Optional[str] = None
    github: Optional[str] = None
    youtube: Optional[str] = None
    tiktok: Optional[str] = None
    services: Optional[List[ServiceItem]] = None
    catalog_url: Optional[str] = None
    map_embed: Optional[str] = None


class GalleryItem(BaseModel):
    url: str
    title: Optional[str] = None
    description: Optional[str] = None


class MarketplaceItem(BaseModel):
    name: str
    url: str


class AccountNumberItem(BaseModel):
    bank: str
    name: str
    iban: str
    currency: Optional[str] = "TRY"


# Company schemas
class CompanyBase(BaseModel):
    company_name: Optional[str] = None
    company_type: Optional[str] = None
    tax_office: Optional[str] = None
    tax_number: Optional[str] = None
    trade_registry_number: Optional[str] = None
    mersis_no: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    website: Optional[str] = None
    address: Optional[str] = None
    district: Optional[str] = None
    city: Optional[str] = None
    country: Optional[str] = "Türkiye"
    postal_code: Optional[str] = None
    phone_alt: Optional[str] = None
    email_alt: Optional[str] = None
    website_alt: Optional[str] = None
    billing_address: Optional[str] = None
    description: Optional[str] = None
    founded_year: Optional[int] = None
    employee_count: Optional[str] = None


class CompanyCreate(CompanyBase):
    pass


class CompanyUpdate(CompanyBase):
    pass


class CompanyOut(CompanyBase):
    id: int
    user_id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = {
        "from_attributes": True,
        "json_encoders": {
            datetime: lambda v: v.isoformat() if v else None
        }
    }


class ProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    title: Optional[str] = None
    gender: Optional[str] = None
    card_name: Optional[str] = None
    company: Optional[str] = None
    phone: Optional[str] = None
    website: Optional[str] = None
    address: Optional[str] = None
    about: Optional[str] = None
    photo_url: Optional[str] = None
    video_url: Optional[str] = None
    theme: Optional[Theme] = None
    social_links: Optional[SocialLinks | Dict[str, Any]] = None
    gallery: Optional[List[GalleryItem] | List[Dict[str, Any]]] = None

    model_config = {
        "from_attributes": True,
        "json_encoders": {
            datetime: lambda v: v.isoformat() if v else None
        }
    }


class MarketplacesUpdate(BaseModel):
    marketplaces: List[MarketplaceItem] | List[Dict[str, Any]]

    model_config = {
        "from_attributes": True,
        "json_encoders": {
            datetime: lambda v: v.isoformat() if v else None
        }
    }


class AccountNumbersUpdate(BaseModel):
    account_numbers: List[AccountNumberItem] | List[Dict[str, Any]]

    model_config = {
        "from_attributes": True,
        "json_encoders": {
            datetime: lambda v: v.isoformat() if v else None
        }
    }


class ProfileOut(BaseModel):
    id: int
    username: str
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    title: Optional[str] = None
    gender: Optional[str] = None
    card_name: Optional[str] = None
    role: str = "user"
    is_active: bool = True
    visit_count: int = 0
    last_visited_at: Optional[str] = None
    created_at: Optional[str] = None
    phone: Optional[str] = None
    website: Optional[str] = None
    address: Optional[str] = None
    about: Optional[str] = None
    photo_url: Optional[str] = None
    video_url: Optional[str] = None
    theme: Optional[Theme | Dict[str, Any]] = None
    social_links: Optional[SocialLinks | Dict[str, Any]] = None
    gallery: Optional[List[GalleryItem] | List[Dict[str, Any]]] = None
    marketplaces: Optional[List[MarketplaceItem] | List[Dict[str, Any]]] = None
    account_numbers: Optional[List[AccountNumberItem] | List[Dict[str, Any]]] = None
    company: Optional[str] = None
    company_info: Optional[CompanyOut] = None
    appointments: List[AppointmentOut] = Field(default_factory=list, description="List of user's appointment types")

    model_config = {
        "from_attributes": True,
        "json_encoders": {
            datetime: lambda v: v.isoformat() if v else None
        }
    }


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"

    model_config = {
        "from_attributes": True,
        "json_encoders": {
            datetime: lambda v: v.isoformat() if v else None
        }
    }


class RegisterPayload(BaseModel):
    username: str
    password: str
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None

    model_config = {
        "from_attributes": True,
        "json_encoders": {
            datetime: lambda v: v.isoformat() if v else None
        }
    }
