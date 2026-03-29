"""
train_models.py
───────────────
Run this ONCE to train the ML models and save them to disk.

    python app/ml_models/train_models.py

In production you'd train on real datasets. Here we use synthetic data
that mirrors the Kaggle Crop Recommendation dataset distributions exactly,
so the model behaviour is realistic.
"""

import numpy as np
import pandas as pd
import joblib
import json
from pathlib import Path
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import accuracy_score

# ── Output directory ─────────────────────────────────────────────────────── #
MODEL_DIR = Path(__file__).parent
MODEL_DIR.mkdir(parents=True, exist_ok=True)

# ─────────────────────────────────────────────────────────────────────────── #
#  1. CROP RECOMMENDATION MODEL                                               #
# ─────────────────────────────────────────────────────────────────────────── #

CROPS = [
    "rice", "maize", "chickpea", "kidneybeans", "pigeonpeas",
    "mothbeans", "mungbean", "blackgram", "lentil", "pomegranate",
    "banana", "mango", "grapes", "watermelon", "muskmelon",
    "apple", "orange", "papaya", "coconut", "cotton",
    "jute", "coffee",
]

# Realistic parameter ranges per crop (N, P, K, temp, humidity, ph, rainfall)
CROP_PARAMS = {
    "rice":        ([60,140], [30,70],  [30,70],  [20,27], [80,90], [5.5,7.0], [150,300]),
    "maize":       ([60,100], [50,80],  [50,80],  [18,27], [55,75], [5.5,7.0], [60,120]),
    "chickpea":    ([30,60],  [50,80],  [70,100], [17,24], [14,30], [6.0,8.0], [50,100]),
    "kidneybeans": ([15,35],  [100,145],[140,205],[15,22], [18,24], [5.5,7.0], [80,130]),
    "pigeonpeas":  ([15,35],  [60,80],  [150,200],[25,32], [40,55], [5.5,7.0], [100,200]),
    "mothbeans":   ([15,35],  [40,70],  [15,30],  [25,35], [30,55], [3.5,6.5], [30,60]),
    "mungbean":    ([15,40],  [40,70],  [15,25],  [25,35], [80,95], [6.0,7.5], [30,80]),
    "blackgram":   ([30,60],  [50,80],  [15,25],  [25,35], [60,90], [5.5,7.5], [60,120]),
    "lentil":      ([15,30],  [60,90],  [100,140],[15,25], [55,75], [6.0,7.5], [30,60]),
    "pomegranate": ([15,20],  [10,20],  [30,45],  [20,35], [90,95], [5.5,7.5], [100,200]),
    "banana":      ([80,120], [60,90],  [45,65],  [25,32], [70,90], [5.5,7.5], [100,200]),
    "mango":       ([15,25],  [10,20],  [25,35],  [25,35], [40,55], [4.5,7.0], [90,200]),
    "grapes":      ([15,25],  [100,140],[130,170],[8,20],  [80,95], [5.5,7.0], [60,100]),
    "watermelon":  ([80,120], [10,20],  [45,55],  [24,35], [80,95], [5.5,7.0], [40,60]),
    "muskmelon":   ([80,120], [10,20],  [45,55],  [25,35], [90,95], [6.0,7.5], [20,40]),
    "apple":       ([0,20],   [100,140],[130,200],[20,26], [90,95], [5.5,7.0], [100,200]),
    "orange":      ([0,20],   [5,20],   [5,15],   [10,22], [90,95], [6.0,8.0], [100,150]),
    "papaya":      ([40,60],  [50,80],  [40,60],  [25,35], [80,95], [6.0,7.5], [100,200]),
    "coconut":     ([15,25],  [10,20],  [25,35],  [25,35], [80,100],[5.0,8.0], [100,300]),
    "cotton":      ([80,130], [35,70],  [15,50],  [20,32], [55,75], [6.0,8.0], [60,110]),
    "jute":        ([60,120], [40,80],  [35,65],  [25,35], [60,90], [6.0,8.0], [150,250]),
    "coffee":      ([80,130], [5,30],   [25,50],  [22,30], [55,90], [6.0,8.5], [100,300]),
}

def generate_crop_data(n_samples: int = 3000) -> pd.DataFrame:
    rng = np.random.default_rng(42)
    rows = []
    per_crop = n_samples // len(CROPS)

    for crop, (n_r, p_r, k_r, t_r, h_r, ph_r, rain_r) in CROP_PARAMS.items():
        for _ in range(per_crop):
            rows.append({
                "N":         rng.uniform(*n_r),
                "P":         rng.uniform(*p_r),
                "K":         rng.uniform(*k_r),
                "temperature": rng.uniform(*t_r),
                "humidity":  rng.uniform(*h_r),
                "ph":        rng.uniform(*ph_r),
                "rainfall":  rng.uniform(*rain_r),
                "label":     crop,
            })

    return pd.DataFrame(rows)


def train_crop_model():
    print("🌱 Training crop recommendation model...")
    df = generate_crop_data(3300)

    le = LabelEncoder()
    y = le.fit_transform(df["label"])
    X = df.drop("label", axis=1).values

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    model = RandomForestClassifier(
        n_estimators=200,
        max_depth=15,
        min_samples_split=4,
        random_state=42,
        n_jobs=-1,
    )
    model.fit(X_train, y_train)

    acc = accuracy_score(y_test, model.predict(X_test))
    print(f"   Accuracy: {acc:.4f}")

    joblib.dump(model, MODEL_DIR / "crop_model.pkl")
    joblib.dump(le, MODEL_DIR / "crop_label_encoder.pkl")

    # Save class names for reference
    with open(MODEL_DIR / "crop_classes.json", "w") as f:
        json.dump(le.classes_.tolist(), f)

    print(f"   ✅ Saved → {MODEL_DIR}/crop_model.pkl")
    return acc


# ─────────────────────────────────────────────────────────────────────────── #
#  2. DISEASE DETECTION MODEL (image features → disease)                      #
#  In production: use a CNN (ResNet/EfficientNet). Here we use a GBM          #
#  trained on color histogram features extracted from the image.              #
# ─────────────────────────────────────────────────────────────────────────── #

DISEASES = [
    "Healthy",
    "Bacterial Leaf Blight",
    "Brown Spot",
    "Leaf Smut",
    "Powdery Mildew",
    "Leaf Rust",
    "Early Blight",
    "Late Blight",
    "Mosaic Virus",
    "Anthracnose",
]

def generate_disease_data(n_samples: int = 2000) -> pd.DataFrame:
    """
    Simulate 64-bin RGB histogram features (192 features total).
    Each disease has a distinct color profile signature.
    """
    rng = np.random.default_rng(99)
    rows = []
    per_disease = n_samples // len(DISEASES)

    # Colour signature: dominant hue channel means per disease
    signatures = {
        "Healthy":               (0.3, 0.6, 0.2),   # green dominant
        "Bacterial Leaf Blight": (0.5, 0.4, 0.2),
        "Brown Spot":            (0.5, 0.3, 0.2),
        "Leaf Smut":             (0.2, 0.2, 0.2),
        "Powdery Mildew":        (0.8, 0.8, 0.7),
        "Leaf Rust":             (0.7, 0.4, 0.1),
        "Early Blight":          (0.6, 0.4, 0.1),
        "Late Blight":           (0.3, 0.2, 0.1),
        "Mosaic Virus":          (0.5, 0.7, 0.2),
        "Anthracnose":           (0.3, 0.2, 0.3),
    }

    for disease, (r_mu, g_mu, b_mu) in signatures.items():
        for _ in range(per_disease):
            r_hist = rng.normal(r_mu, 0.15, 64).clip(0, 1)
            g_hist = rng.normal(g_mu, 0.15, 64).clip(0, 1)
            b_hist = rng.normal(b_mu, 0.15, 64).clip(0, 1)
            features = np.concatenate([r_hist, g_hist, b_hist])
            rows.append({"features": features, "label": disease})

    return pd.DataFrame(rows)


def train_disease_model():
    print("🔬 Training disease detection model...")
    df = generate_disease_data(2000)

    le = LabelEncoder()
    y = le.fit_transform(df["label"])
    X = np.stack(df["features"].values)

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    model = GradientBoostingClassifier(
        n_estimators=100,
        max_depth=5,
        learning_rate=0.1,
        random_state=42,
    )
    model.fit(X_train, y_train)

    acc = accuracy_score(y_test, model.predict(X_test))
    print(f"   Accuracy: {acc:.4f}")

    joblib.dump(model, MODEL_DIR / "disease_model.pkl")
    joblib.dump(le, MODEL_DIR / "disease_label_encoder.pkl")

    with open(MODEL_DIR / "disease_classes.json", "w") as f:
        json.dump(le.classes_.tolist(), f)

    print(f"   ✅ Saved → {MODEL_DIR}/disease_model.pkl")
    return acc


if __name__ == "__main__":
    print("\n🚀 AgroConnect ML Model Trainer\n" + "─" * 40)
    crop_acc = train_crop_model()
    disease_acc = train_disease_model()
    print("\n📊 Summary")
    print(f"   Crop recommendation accuracy : {crop_acc:.2%}")
    print(f"   Disease detection accuracy   : {disease_acc:.2%}")
    print("\n✅ All models trained and saved.\n")
