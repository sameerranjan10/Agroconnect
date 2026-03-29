"""
Disease Detection Service
Accepts an uploaded image, extracts color histogram features,
and classifies the plant disease using the trained GBM model.
"""
import json
import logging
from pathlib import Path
from io import BytesIO

import numpy as np
import joblib
from PIL import Image

from app.models.schemas import DiseaseDetectionResponse

logger = logging.getLogger(__name__)


# Treatment & prevention database
DISEASE_INFO = {
    "Healthy": {
        "severity": "none",
        "treatment": ["No treatment needed. Plant is healthy."],
        "prevention": [
            "Continue regular monitoring every 7 days.",
            "Maintain proper irrigation and drainage.",
            "Use balanced fertilization.",
        ],
    },
    "Bacterial Leaf Blight": {
        "severity": "severe",
        "treatment": [
            "Apply copper-based bactericides (Copper oxychloride @ 3g/L).",
            "Remove and destroy infected plant parts immediately.",
            "Avoid overhead irrigation to reduce leaf wetness.",
        ],
        "prevention": [
            "Use certified disease-free seeds.",
            "Treat seeds with Pseudomonas fluorescens @ 10g/kg.",
            "Maintain field hygiene; remove crop debris after harvest.",
        ],
    },
    "Brown Spot": {
        "severity": "moderate",
        "treatment": [
            "Apply Mancozeb (2.5 g/L) or Propiconazole (1 ml/L) fungicide.",
            "Ensure balanced NPK nutrition; potassium deficiency worsens this.",
        ],
        "prevention": [
            "Use resistant varieties where available.",
            "Avoid nitrogen stress.",
            "Ensure proper drainage.",
        ],
    },
    "Leaf Smut": {
        "severity": "mild",
        "treatment": [
            "Apply Hexaconazole (2 ml/L) or Propiconazole.",
            "Destroy infected tillers.",
        ],
        "prevention": [
            "Seed treatment with Carbendazim @ 2g/kg.",
            "Avoid excess nitrogen.",
        ],
    },
    "Powdery Mildew": {
        "severity": "moderate",
        "treatment": [
            "Spray Sulphur (3 g/L) or Triadimefon (1 g/L).",
            "Increase air circulation around plants.",
        ],
        "prevention": [
            "Avoid high-nitrogen fertilization.",
            "Plant resistant varieties.",
            "Ensure adequate spacing.",
        ],
    },
    "Leaf Rust": {
        "severity": "severe",
        "treatment": [
            "Apply Propiconazole (Tilt) @ 0.1% or Tebuconazole @ 0.1%.",
            "Repeat spray after 14 days if needed.",
        ],
        "prevention": [
            "Grow rust-resistant varieties.",
            "Early sowing to escape peak rust season.",
            "Monitor crop weekly during humid weather.",
        ],
    },
    "Early Blight": {
        "severity": "moderate",
        "treatment": [
            "Apply Chlorothalonil or Mancozeb every 7–10 days.",
            "Remove lower infected leaves.",
        ],
        "prevention": [
            "Crop rotation with non-solanaceous crops.",
            "Avoid working in field when plants are wet.",
        ],
    },
    "Late Blight": {
        "severity": "severe",
        "treatment": [
            "Apply Metalaxyl + Mancozeb (Ridomil Gold) immediately.",
            "Spray Cymoxanil + Mancozeb (Curzate) preventively.",
            "Destroy heavily infected plants to prevent spread.",
        ],
        "prevention": [
            "Use certified disease-free seed tubers/transplants.",
            "Avoid overhead irrigation.",
            "Plant in well-drained fields.",
        ],
    },
    "Mosaic Virus": {
        "severity": "severe",
        "treatment": [
            "No cure for viral infection. Remove and destroy infected plants.",
            "Control aphid/whitefly vectors with Imidacloprid (0.5 ml/L).",
        ],
        "prevention": [
            "Use virus-free certified planting material.",
            "Control insect vectors early in the season.",
            "Rogue out infected plants promptly.",
        ],
    },
    "Anthracnose": {
        "severity": "moderate",
        "treatment": [
            "Apply Carbendazim (1 g/L) or Thiophanate-methyl.",
            "Prune and destroy infected parts.",
        ],
        "prevention": [
            "Avoid wounding plants during cultivation.",
            "Maintain dry conditions around plant canopy.",
            "Use disease-free planting material.",
        ],
    },
}


class DiseaseDetectionService:
    _model = None
    _label_encoder = None
    _classes: list[str] = []
    N_BINS = 64  # histogram bins per channel → 192 features total

    @classmethod
    def load_models(cls, model_dir: Path):
        """Load model artifacts from disk. Called once at startup."""
        try:
            cls._model = joblib.load(model_dir / "disease_model.pkl")
            cls._label_encoder = joblib.load(model_dir / "disease_label_encoder.pkl")
            with open(model_dir / "disease_classes.json") as f:
                cls._classes = json.load(f)
            logger.info("✅ Disease model loaded successfully.")
        except FileNotFoundError as e:
            logger.error(f"❌ Model file not found: {e}. Run train_models.py first.")
            raise

    @classmethod
    def _extract_features(cls, image_bytes: bytes) -> np.ndarray:
        """
        Extract normalised RGB colour histogram from image.
        Returns a 1D array of shape (N_BINS * 3,).
        """
        img = Image.open(BytesIO(image_bytes)).convert("RGB")
        img = img.resize((224, 224))  # normalise size

        img_array = np.array(img)
        features = []

        for channel in range(3):  # R, G, B
            hist, _ = np.histogram(
                img_array[:, :, channel],
                bins=cls.N_BINS,
                range=(0, 256),
                density=True,
            )
            features.extend(hist)

        return np.array(features).reshape(1, -1)

    @classmethod
    def predict(cls, image_bytes: bytes) -> DiseaseDetectionResponse:
        if cls._model is None:
            raise RuntimeError("Model not loaded. Call load_models() at startup.")

        features = cls._extract_features(image_bytes)
        probabilities = cls._model.predict_proba(features)[0]

        top_idx = np.argmax(probabilities)
        detected = cls._label_encoder.classes_[top_idx]
        confidence = float(probabilities[top_idx])

        info = DISEASE_INFO.get(detected, DISEASE_INFO["Healthy"])

        return DiseaseDetectionResponse(
            detected_disease=detected,
            confidence=round(confidence, 4),
            is_healthy=(detected == "Healthy"),
            severity=info["severity"],
            treatment_suggestions=info["treatment"],
            preventive_measures=info["prevention"],
        )
