"""
AgroConnect - Order Pydantic Schemas
"""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field

from app.models.order import OrderStatus
from app.schemas.product import ProductOut
from app.schemas.user import UserOut


class OrderCreate(BaseModel):
    product_id: int
    quantity:   float = Field(..., gt=0)
    notes:      Optional[str] = Field(None, max_length=500)


class OrderStatusUpdate(BaseModel):
    status: OrderStatus


class OrderOut(BaseModel):
    id:          int
    buyer_id:    int
    product_id:  int
    quantity:    float
    total_price: float
    status:      OrderStatus
    notes:       Optional[str]
    created_at:  datetime
    product:     Optional[ProductOut] = None
    buyer:       Optional[UserOut]    = None

    model_config = {"from_attributes": True}


class OrderListResponse(BaseModel):
    total:  int
    orders: list[OrderOut]
