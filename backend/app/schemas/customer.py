from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


class CustomerBase(BaseModel):
    name: str
    email: EmailStr
    phone_number: Optional[str] = None
    country: str
    country_code: Optional[str] = None
    currency_code: Optional[str] = None
    locale: Optional[str] = None
    timezone: Optional[str] = None
    tax_region: Optional[str] = None
    address: Optional[str] = None
    business_name: Optional[str] = None
    business_tax_id: Optional[str] = None
    tax_exempt: Optional[bool] = False


class CustomerCreate(CustomerBase):
    password: str


class CustomerResponse(CustomerBase):
    id: int
    role: str
    created_at: datetime

    class Config:
        from_attributes = True
