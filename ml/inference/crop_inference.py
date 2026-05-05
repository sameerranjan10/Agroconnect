"""
AgroConnect - Crop Recommendation Inference
Loads the trained Random Forest model and exposes predict_crop().
"""
from pathlib import Path
from functools import lru_cache
import numpy as np
import joblib

MODEL_PATH = Path(__file__).resolve().parent.parent / "models" / "crop_model.joblib"

CROP_TIPS = {
    "rice":       "Maintain standing water during growth; ensure adequate N fertiliser.",
    "wheat":      "Sow in cool season; irrigate at crown-root stage.",
    "maize":      "Needs well-drained soil; protect from stem borers.",
    "sugarcane":  "Deep planting; ensure regular irrigation every 7–10 days.",
    "cotton":     "Control bollworms; avoid waterlogging.",
    "soybean":    "Inoculate seeds with Rhizobium; good for nitrogen fixation.",
    "groundnut":  "Sandy loam soil is ideal; ensure gypsum application.",
    "chickpea":   "Drought-tolerant; avoid excess nitrogen.",
    "lentil":     "Needs cool weather at maturity; avoid heavy clay soils.",
    "mango":      "Plant in well-drained, deep soil; avoid frost-prone areas.",
    "banana":     "High water requirement; needs windbreaks.",
    "tomato":     "Stake plants; watch for late blight.",
    "onion":      "Needs friable loam soil; avoid excess moisture during bulbing.",
    "potato":     "Earth-up regularly; spray for late blight.",
    "coffee":     "Shade-grown preferred; requires moderate rainfall.",
}


@lru_cache(maxsize=1)
def _load_bundle():
    return joblib.load(MODEL_PATH)


def predict_crop(
    nitrogen: float,
    phosphorus: float,
    potassium: float,
    temperature: float,
    humidity: float,
    ph: float,
    rainfall: float,
) -> dict:
    """
    Predict the best crop given soil + weather parameters.
    Returns a dict matching CropRecommendationResponse.
    """
    bundle = _load_bundle()
    clf    = bundle["model"]
    le     = bundle["label_encoder"]

    X = np.array([[nitrogen, phosphorus, potassium, temperature, humidity, ph, rainfall]])

    # Probabilities for all classes
    proba      = clf.predict_proba(X)[0]
    top_idx    = np.argsort(proba)[::-1]          # descending confidence
    best_class = le.inverse_transform([top_idx[0]])[0]
    confidence = float(proba[top_idx[0]])

    alternatives = [
        le.inverse_transform([i])[0]
        for i in top_idx[1:4]                     # next 3 best
    ]

    return {
        "recommended_crop": best_class,
        "confidence":       round(confidence, 4),
        "alternatives":     alternatives,
        "tips":             CROP_TIPS.get(best_class, "Consult local agricultural extension."),
    }
