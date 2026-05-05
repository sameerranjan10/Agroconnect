"""
AgroConnect - Product Pydantic Schemas
"""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field

from app.schemas.user import UserOut


class ProductCreate(BaseModel):
    title:       str   = Field(..., min_length=2, max_length=200)
    description: Optional[str] = None
    price:       float = Field(..., gt=0)
    quantity:    float = Field(..., gt=0)
    unit:        str   = Field("kg", max_length=20)
    category:    Optional[str] = None
    location:    Optional[str] = None
    image_url:   Optional[str] = None


class ProductUpdate(BaseModel):
    title:        Optional[str]   = Field(None, min_length=2, max_length=200)
    description:  Optional[str]   = None
    price:        Optional[float] = Field(None, gt=0)
    quantity:     Optional[float] = Field(None, gt=0)
    unit:         Optional[str]   = None
    category:     Optional[str]   = None
    location:     Optional[str]   = None
    image_url:    Optional[str]   = None
    is_available: Optional[bool]  = None


class ProductOut(BaseModel):
    id:           int
    title:        str
    description:  Optional[str]
    price:        float
    quantity:     float
    unit:         str
    category:     Optional[str]
    location:     Optional[str]
    image_url:    Optional[str]
    is_available: bool
    farmer_id:    int
    farmer:       Optional[UserOut] = None
    created_at:   datetime

    model_config = {"from_attributes": True}


class ProductListResponse(BaseModel):
    total:    int
    products: list[ProductOut]
