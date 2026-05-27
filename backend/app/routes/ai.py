"""
AgroConnect - AI / ML Routes
POST /ai/recommend-crop   → crop recommendation
POST /ai/predict-price    → price prediction
GET  /ai/health           → model health check
"""
print("[AI] NEW AI.PY LOADED")
import sys
from pathlib import Path
from fastapi import APIRouter, HTTPException

from app.schemas.ai_schemas import (
    CropRecommendationRequest, CropRecommendationResponse,
    PricePredictionRequest, PricePredictionResponse,
)

# ─────────────────────────────────────────────
# 🔧 Add ML path (robust, works everywhere)
# ─────────────────────────────────────────────
BASE_DIR = Path(__file__).resolve()

ML_DIR = None
for parent in BASE_DIR.parents:
    possible = parent / "ml"
    if possible.exists():
        ML_DIR = possible
        sys.path.append(str(ML_DIR))
        print(f"[AI] ML path set: {ML_DIR}")
        break

if ML_DIR is None:
    print("[AI] ML directory NOT found")

# ─────────────────────────────────────────────
# 🚀 DIRECT IMPORT (NO lazy loading, NO bugs)
# ─────────────────────────────────────────────
try:
    from inference.crop_inference import predict_crop
    print("[AI] Crop model ready")
except Exception as e:
    predict_crop = None
    print("[AI] Crop import failed:", e)

try:
    from inference.price_inference import predict_price
    print("[AI] Price model ready")
except Exception as e:
    predict_price = None
    print("[AI] Price import failed:", e)

# ─────────────────────────────────────────────
router = APIRouter(prefix="/ai", tags=["AI / ML"])

# ─────────────────────────────────────────────
# 🧪 Health Check
# ─────────────────────────────────────────────
@router.get("/health")
def ai_health():
    return {
        "crop_model_ready": predict_crop is not None,
        "price_model_ready": predict_price is not None,
        "status": "ok" if (predict_crop and predict_price) else "degraded",
    }

# ─────────────────────────────────────────────
# 🌱 Crop Recommendation
# ─────────────────────────────────────────────
@router.post("/recommend-crop", response_model=CropRecommendationResponse)
def recommend_crop(payload: CropRecommendationRequest):

    if predict_crop is None:
        raise HTTPException(
            status_code=503,
            detail="Crop recommendation model not available",
        )

    result = predict_crop(
        nitrogen=payload.nitrogen,
        phosphorus=payload.phosphorus,
        potassium=payload.potassium,
        temperature=payload.temperature,
        humidity=payload.humidity,
        ph=payload.ph,
        rainfall=payload.rainfall,
    )

    return CropRecommendationResponse(**result)

# ─────────────────────────────────────────────
# 💰 Price Prediction
# ─────────────────────────────────────────────
@router.post("/predict-price", response_model=PricePredictionResponse)
def predict_price_endpoint(payload: PricePredictionRequest):

    if predict_price is None:
        raise HTTPException(
            status_code=503,
            detail="Price prediction model not available",
        )

    result = predict_price(
        crop_type=payload.crop_type,
        location=payload.location,
        quantity=payload.quantity,
        season=payload.season,
        quality=payload.quality,
    )

    return PricePredictionResponse(**result)