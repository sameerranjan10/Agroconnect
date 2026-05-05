"""
AgroConnect - AI / ML Pydantic Schemas
"""
from pydantic import BaseModel, Field
from typing import Optional


# ── Crop Recommendation ──────────────────────────────────────────────────

class CropRecommendationRequest(BaseModel):
    nitrogen:    float = Field(..., ge=0,   le=200,  description="Soil nitrogen (kg/ha)")
    phosphorus:  float = Field(..., ge=0,   le=200,  description="Soil phosphorus (kg/ha)")
    potassium:   float = Field(..., ge=0,   le=200,  description="Soil potassium (kg/ha)")
    temperature: float = Field(..., ge=-10, le=55,   description="Avg temperature (°C)")
    humidity:    float = Field(..., ge=0,   le=100,  description="Relative humidity (%)")
    ph:          float = Field(..., ge=0,   le=14,   description="Soil pH")
    rainfall:    float = Field(..., ge=0,   le=3000, description="Annual rainfall (mm)")


class CropRecommendationResponse(BaseModel):
    recommended_crop: str
    confidence:       float
    alternatives:     list[str]
    tips:             str


# ── Price Prediction ─────────────────────────────────────────────────────

class PricePredictionRequest(BaseModel):
    crop_type:   str   = Field(..., description="Type of crop/produce")
    location:    str   = Field(..., description="Market location / state")
    quantity:    float = Field(..., gt=0, description="Quantity in kg")
    season:      str   = Field("Kharif", description="Kharif | Rabi | Zaid")
    quality:     str   = Field("Medium", description="Low | Medium | High")


class PricePredictionResponse(BaseModel):
    crop_type:       str
    predicted_price: float   # per kg in INR
    min_price:       float
    max_price:       float
    confidence:      float
    market_trend:    str     # Rising | Falling | Stable
    recommendation:  str
