"""
AgroConnect - Price Prediction Inference
Loads the trained Gradient Boosting model and exposes predict_price().
"""
from pathlib import Path
from functools import lru_cache
import numpy as np
import joblib

MODEL_PATH = Path(__file__).resolve().parent.parent / "models" / "price_model.joblib"

TREND_MESSAGES = {
    "Rising":  "Demand is high — good time to sell!",
    "Falling": "Prices are under pressure; consider storage if possible.",
    "Stable":  "Market is stable; standard pricing applies.",
}


@lru_cache(maxsize=1)
def _load_bundle():
    return joblib.load(MODEL_PATH)


def _safe_encode(le, value: str, fallback: str = "Other"):
    """Encode a label, falling back if unseen."""
    classes = list(le.classes_)
    if value in classes:
        return le.transform([value])[0]
    if fallback in classes:
        return le.transform([fallback])[0]
    return 0


def predict_price(
    crop_type: str,
    location:  str,
    quantity:  float,
    season:    str,
    quality:   str,
) -> dict:
    """
    Predict market price for given crop parameters.
    Returns a dict matching PricePredictionResponse.
    """
    bundle = _load_bundle()
    reg    = bundle["model"]

    crop_enc     = _safe_encode(bundle["le_crop"],     crop_type.lower(), "rice")
    location_enc = _safe_encode(bundle["le_location"], location,          "Other")
    season_enc   = _safe_encode(bundle["le_season"],   season,            "Kharif")
    quality_enc  = _safe_encode(bundle["le_quality"],  quality,           "Medium")

    X = np.array([[crop_enc, location_enc, season_enc, quality_enc, quantity]])
    predicted = float(reg.predict(X)[0])
    predicted = max(predicted, 1.0)  # floor at ₹1/kg

    # Confidence proxy based on model's R² score approximation
    confidence = 0.82   # fixed representative value for GBR with R²~0.985

    # Simple trend heuristic based on season
    trend = {"Kharif": "Stable", "Rabi": "Rising", "Zaid": "Falling"}.get(season, "Stable")

    return {
        "crop_type":       crop_type,
        "predicted_price": round(predicted, 2),
        "min_price":       round(predicted * 0.88, 2),
        "max_price":       round(predicted * 1.12, 2),
        "confidence":      round(confidence, 3),
        "market_trend":    trend,
        "recommendation":  TREND_MESSAGES[trend],
    }
