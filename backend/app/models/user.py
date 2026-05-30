"""
AgroConnect - User ORM Model
"""
import enum
from datetime import datetime, timezone

from sqlalchemy import Column, Integer, String, Enum, DateTime, Boolean, Float
from sqlalchemy.orm import relationship

from app.db.database import Base


class UserRole(str, enum.Enum):
    FARMER = "FARMER"
    BUYER  = "BUYER"
    ADMIN  = "ADMIN"


class User(Base):
    __tablename__ = "users"

    id             = Column(Integer, primary_key=True, index=True)
    name           = Column(String(120), nullable=False)
    email          = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password= Column(String(255), nullable=False)
    role           = Column(Enum(UserRole), default=UserRole.BUYER, nullable=False)
    phone          = Column(String(20), nullable=True)
    location       = Column(String(200), nullable=True) # Full location string
    state          = Column(String(100), nullable=True)
    district       = Column(String(100), nullable=True)
    village        = Column(String(100), nullable=True)
    latitude       = Column(Float, nullable=True)
    longitude      = Column(Float, nullable=True)
    bio            = Column(String(500), nullable=True)
    is_active      = Column(Boolean, default=True)
    created_at     = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at     = Column(DateTime, default=lambda: datetime.now(timezone.utc),
                            onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    products = relationship("Product", back_populates="farmer",
                            foreign_keys="Product.farmer_id")
    orders   = relationship("Order",   back_populates="buyer",
                            foreign_keys="Order.buyer_id")

    def __repr__(self) -> str:
        return f"<User id={self.id} email={self.email} role={self.role}>"
