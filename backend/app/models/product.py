"""
AgroConnect - Product ORM Model
"""
from datetime import datetime, timezone

from sqlalchemy import (Column, Integer, String, Float, Text,
                        DateTime, ForeignKey, Boolean)
from sqlalchemy.orm import relationship

from app.db.database import Base


class Product(Base):
    __tablename__ = "products"

    id          = Column(Integer, primary_key=True, index=True)
    title       = Column(String(200), nullable=False, index=True)
    description = Column(Text, nullable=True)
    price       = Column(Float, nullable=False)           # price per unit (INR)
    quantity    = Column(Float, nullable=False)           # available quantity (kg/unit)
    unit        = Column(String(20), default="kg")        # kg, litre, piece, etc.
    category    = Column(String(100), nullable=True)      # Grain, Vegetable, Fruit…
    location    = Column(String(200), nullable=True)
    image_url   = Column(String(500), nullable=True)
    is_available= Column(Boolean, default=True)
    farmer_id   = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at  = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at  = Column(DateTime, default=lambda: datetime.now(timezone.utc),
                         onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    farmer = relationship("User",  back_populates="products",
                          foreign_keys=[farmer_id])
    orders = relationship("Order", back_populates="product")

    def __repr__(self) -> str:
        return f"<Product id={self.id} title={self.title!r} price={self.price}>"
