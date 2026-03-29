from pydantic import BaseModel, Field, field_validator
from typing import Optional
from enum import Enum


# ─────────────────────────────────────────────────────────────────────────── #
#  CROP RECOMMENDATION                                                        #
# ─────────────────────────────────────────────────────────────────────────── #

class CropRecommendationRequest(BaseModel):
    """
    Soil and climate parameters for crop recommendation.
    Ranges based on standard agricultural datasets (e.g. Kaggle Crop Recommendation).
    """
    nitrogen: float = Field(..., ge=0, le=140, description="Nitrogen content in soil (kg/ha)")
    phosphorus: float = Field(..., ge=5, le=145, description="Phosphorus content in soil (kg/ha)")
    potassium: float = Field(..., ge=5, le=205, description="Potassium content in soil (kg/ha)")
    temperature: float = Field(..., ge=8.0, le=44.0, description="Temperature in Celsius")
    humidity: float = Field(..., ge=14.0, le=100.0, description="Relative humidity (%)")
    ph: float = Field(..., ge=3.5, le=9.5, description="Soil pH level")
    rainfall: float = Field(..., ge=20.0, le=300.0, description="Annual rainfall (mm)")

    model_config = {"json_schema_extra": {
        "example": {
            "nitrogen": 90, "phosphorus": 42, "potassium": 43,
            "temperature": 20.8, "humidity": 82.0, "ph": 6.5, "rainfall": 202.9
        }
    }}


class CropRecommendationResponse(BaseModel):
    recommended_crop: str
    confidence: float = Field(..., description="Model confidence score 0-1")
    top_crops: list[dict]  # [{"crop": "rice", "probability": 0.92}, ...]
    advice: str


# ─────────────────────────────────────────────────────────────────────────── #
#  DISEASE DETECTION                                                          #
# ─────────────────────────────────────────────────────────────────────────── #

class DiseaseDetectionResponse(BaseModel):
    detected_disease: str
    confidence: float
    is_healthy: bool
    severity: str  # "none" | "mild" | "moderate" | "severe"
    treatment_suggestions: list[str]
    preventive_measures: list[str]


# ─────────────────────────────────────────────────────────────────────────── #
#  SHARED                                                                     #
# ─────────────────────────────────────────────────────────────────────────── #

class ErrorResponse(BaseModel):
    detail: str
    code: Optional[str] = None
