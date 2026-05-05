"""
AgroConnect - Order ORM Model
"""
import enum
from datetime import datetime, timezone

from sqlalchemy import Column, Integer, Float, Enum, DateTime, ForeignKey, String
from sqlalchemy.orm import relationship

from app.db.database import Base


class OrderStatus(str, enum.Enum):
    PENDING   = "PENDING"
    CONFIRMED = "CONFIRMED"
    SHIPPED   = "SHIPPED"
    DELIVERED = "DELIVERED"
    CANCELLED = "CANCELLED"


class Order(Base):
    __tablename__ = "orders"

    id         = Column(Integer, primary_key=True, index=True)
    buyer_id   = Column(Integer, ForeignKey("users.id"),    nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    quantity   = Column(Float,   nullable=False)
    total_price= Column(Float,   nullable=False)   # snapshot at order time
    status     = Column(Enum(OrderStatus), default=OrderStatus.PENDING)
    notes      = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc),
                        onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    buyer   = relationship("User",    back_populates="orders",
                           foreign_keys=[buyer_id])
    product = relationship("Product", back_populates="orders")

    def __repr__(self) -> str:
        return f"<Order id={self.id} buyer_id={self.buyer_id} status={self.status}>"
