"""
Crop Recommendation Service
Loads the trained RandomForest model and exposes a clean predict() interface.
"""
import json
import logging
from pathlib import Path
from functools import lru_cache
from typing import Any

import numpy as np
import joblib

from app.models.schemas import CropRecommendationRequest, CropRecommendationResponse

logger = logging.getLogger(__name__)

# Crop-specific farming advice
CROP_ADVICE = {
    "rice":        "Best grown in waterlogged fields. Ensure standing water of 5–10 cm during vegetative stage.",
    "maize":       "Requires well-drained soil. Plant in rows 75 cm apart. Avoid waterlogging.",
    "chickpea":    "Drought-tolerant. Avoid excess irrigation. Works well in cool, dry climates.",
    "kidneybeans": "Needs full sun and consistent moisture. Avoid clay-heavy soils.",
    "pigeonpeas":  "Drought-resistant. Plant at start of rainy season for best yield.",
    "mothbeans":   "Very drought-tolerant. Ideal for arid regions with sandy soils.",
    "mungbean":    "Short-duration crop. Suitable after wheat or rice harvest.",
    "blackgram":   "Grows well in humid tropics. Avoid waterlogging.",
    "lentil":      "Cool-season crop. Sow in early spring for best results.",
    "pomegranate": "Requires hot, dry climate. Drought-tolerant once established.",
    "banana":      "Needs high humidity and warm temperatures year-round.",
    "mango":       "Requires distinct dry season to flower. Avoid frost.",
    "grapes":      "Needs well-drained soil and a long warm growing season.",
    "watermelon":  "Needs sandy loam soil and warm temperatures. Space 1.5 m apart.",
    "muskmelon":   "Grows best in dry, warm climate. Avoid overhead irrigation.",
    "apple":       "Requires a chilling period (400–1200 hours below 7°C) for fruit set.",
    "orange":      "Subtropical crop. Needs mild winters and warm summers.",
    "papaya":      "Fast-growing. Very sensitive to waterlogging and frost.",
    "coconut":     "Thrives in coastal areas with high humidity and rainfall.",
    "cotton":      "Needs a long frost-free growing season and moderate rainfall.",
    "jute":        "Requires high humidity and heavy rainfall during growing period.",
    "coffee":      "Grows best in tropical highlands with well-distributed rainfall.",
}


class CropRecommendationService:
    _model = None
    _label_encoder = None
    _classes: list[str] = []

    @classmethod
    def load_models(cls, model_dir: Path):
        """Load model artifacts from disk. Called once at startup."""
        try:
            cls._model = joblib.load(model_dir / "crop_model.pkl")
            cls._label_encoder = joblib.load(model_dir / "crop_label_encoder.pkl")
            with open(model_dir / "crop_classes.json") as f:
                cls._classes = json.load(f)
            logger.info("✅ Crop model loaded successfully.")
        except FileNotFoundError as e:
            logger.error(f"❌ Model file not found: {e}. Run train_models.py first.")
            raise

    @classmethod
    def predict(cls, request: CropRecommendationRequest) -> CropRecommendationResponse:
        if cls._model is None:
            raise RuntimeError("Model not loaded. Call load_models() at startup.")

        features = np.array([[
            request.nitrogen,
            request.phosphorus,
            request.potassium,
            request.temperature,
            request.humidity,
            request.ph,
            request.rainfall,
        ]])

        # Get class probabilities
        probabilities = cls._model.predict_proba(features)[0]
        top_indices = np.argsort(probabilities)[::-1][:5]  # top 5

        top_crops = [
            {
                "crop": cls._label_encoder.classes_[i],
                "probability": round(float(probabilities[i]), 4),
            }
            for i in top_indices
            if probabilities[i] > 0.01
        ]

        recommended = cls._label_encoder.classes_[top_indices[0]]
        confidence = float(probabilities[top_indices[0]])

        return CropRecommendationResponse(
            recommended_crop=recommended,
            confidence=round(confidence, 4),
            top_crops=top_crops,
            advice=CROP_ADVICE.get(recommended, "Follow standard agricultural practices for this crop."),
        )
