"""
AgroConnect - User Pydantic Schemas
"""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field

from app.models.user import UserRole


# ── Request schemas ──────────────────────────────────────────────────────

class UserRegister(BaseModel):
    name:     str      = Field(..., min_length=2,  max_length=120)
    email:    EmailStr
    password: str      = Field(..., min_length=6,  max_length=100)
    role:     UserRole = UserRole.BUYER
    phone:    Optional[str] = None
    location: Optional[str] = None


class UserLogin(BaseModel):
    email:    EmailStr
    password: str


class UserUpdate(BaseModel):
    name:     Optional[str] = Field(None, min_length=2, max_length=120)
    phone:    Optional[str] = None
    location: Optional[str] = None
    bio:      Optional[str] = Field(None, max_length=500)


# ── Response schemas ─────────────────────────────────────────────────────

class UserOut(BaseModel):
    id:         int
    name:       str
    email:      EmailStr
    role:       UserRole
    phone:      Optional[str]
    location:   Optional[str]
    bio:        Optional[str]
    is_active:  bool
    created_at: datetime

    model_config = {"from_attributes": True}


class TokenResponse(BaseModel):
    access_token: str
    token_type:   str = "bearer"
    user:         UserOut
