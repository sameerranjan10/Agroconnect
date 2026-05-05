"""
AgroConnect - AI / ML Routes
POST /ai/recommend-crop   → crop recommendation
POST /ai/predict-price    → price prediction
GET  /ai/health           → model health check
"""
import os
import sys
from pathlib import Path

from fastapi import APIRouter, HTTPException

from app.schemas.ai_schemas import (
    CropRecommendationRequest, CropRecommendationResponse,
    PricePredictionRequest,    PricePredictionResponse,
)

# Add ml/ directory to path so we can import inference modules
ML_DIR = Path(__file__).resolve().parents[4] / "ml"
sys.path.insert(0, str(ML_DIR))

router = APIRouter(prefix="/ai", tags=["AI / ML"])


def _load_crop_model():
    try:
        from inference.crop_inference import predict_crop
        return predict_crop
    except Exception as e:
        return None


def _load_price_model():
    try:
        from inference.price_inference import predict_price
        return predict_price
    except Exception as e:
        return None


@router.get("/health")
def ai_health():
    """Check whether ML models are loaded and ready."""
    crop_ok  = _load_crop_model()  is not None
    price_ok = _load_price_model() is not None
    return {
        "crop_model_ready":  crop_ok,
        "price_model_ready": price_ok,
        "status": "ok" if (crop_ok and price_ok) else "degraded",
    }


@router.post("/recommend-crop", response_model=CropRecommendationResponse)
def recommend_crop(payload: CropRecommendationRequest):
    """
    Recommend a crop based on soil and weather conditions.
    Uses a trained Random Forest classifier.
    """
    predict_fn = _load_crop_model()
    if predict_fn is None:
        raise HTTPException(
            status_code=503,
            detail="Crop recommendation model not available. Run ml/training/train_crop.py first.",
        )
    result = predict_fn(
        nitrogen=payload.nitrogen,
        phosphorus=payload.phosphorus,
        potassium=payload.potassium,
        temperature=payload.temperature,
        humidity=payload.humidity,
        ph=payload.ph,
        rainfall=payload.rainfall,
    )
    return CropRecommendationResponse(**result)


@router.post("/predict-price", response_model=PricePredictionResponse)
def predict_price_endpoint(payload: PricePredictionRequest):
    """
    Predict market price for a given crop.
    Uses a trained Gradient Boosting regressor.
    """
    predict_fn = _load_price_model()
    if predict_fn is None:
        raise HTTPException(
            status_code=503,
            detail="Price prediction model not available. Run ml/training/train_price.py first.",
        )
    result = predict_fn(
        crop_type=payload.crop_type,
        location=payload.location,
        quantity=payload.quantity,
        season=payload.season,
        quality=payload.quality,
    )
    return PricePredictionResponse(**result)
