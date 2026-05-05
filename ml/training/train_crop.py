"""
AgroConnect - Crop Recommendation Model Training
================================================
Uses a synthetic dataset representative of the Kaggle Crop Recommendation dataset.
Run:  python ml/training/train_crop.py
Output: ml/models/crop_model.joblib
"""
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import classification_report, accuracy_score
import joblib

MODELS_DIR = Path(__file__).resolve().parent.parent / "models"
MODELS_DIR.mkdir(exist_ok=True)


# ── Synthetic training data ───────────────────────────────────────────────
# Each row: [N, P, K, temperature, humidity, ph, rainfall, crop]
CROP_DATA = {
    "rice":        {"N":(60,100), "P":(35,60),  "K":(35,55),  "temp":(20,30), "hum":(80,100), "ph":(5,7),   "rain":(150,300)},
    "wheat":       {"N":(80,120), "P":(35,55),  "K":(35,55),  "temp":(10,22), "hum":(30,60),  "ph":(6,8),   "rain":(50,150)},
    "maize":       {"N":(50,100), "P":(30,50),  "K":(20,40),  "temp":(18,30), "hum":(55,80),  "ph":(5.5,7), "rain":(60,150)},
    "sugarcane":   {"N":(100,150),"P":(40,70),  "K":(40,80),  "temp":(24,35), "hum":(70,95),  "ph":(6,7.5), "rain":(100,250)},
    "cotton":      {"N":(80,120), "P":(30,60),  "K":(30,60),  "temp":(25,38), "hum":(40,70),  "ph":(6,8),   "rain":(50,100)},
    "soybean":     {"N":(20,40),  "P":(50,80),  "K":(30,50),  "temp":(18,28), "hum":(60,80),  "ph":(5.5,7), "rain":(60,150)},
    "groundnut":   {"N":(20,40),  "P":(40,70),  "K":(30,60),  "temp":(22,32), "hum":(45,70),  "ph":(6,7),   "rain":(50,120)},
    "chickpea":    {"N":(20,50),  "P":(50,80),  "K":(70,100), "temp":(15,25), "hum":(14,40),  "ph":(5.5,7), "rain":(30,100)},
    "lentil":      {"N":(10,30),  "P":(20,50),  "K":(15,40),  "temp":(15,25), "hum":(35,60),  "ph":(6,8),   "rain":(30,80)},
    "mango":       {"N":(10,30),  "P":(10,30),  "K":(20,50),  "temp":(25,35), "hum":(50,80),  "ph":(5,7),   "rain":(50,150)},
    "banana":      {"N":(80,120), "P":(65,90),  "K":(50,80),  "temp":(25,35), "hum":(75,100), "ph":(5.5,7), "rain":(100,200)},
    "tomato":      {"N":(50,80),  "P":(60,90),  "K":(50,80),  "temp":(18,28), "hum":(55,80),  "ph":(6,7),   "rain":(50,120)},
    "onion":       {"N":(60,100), "P":(40,70),  "K":(50,80),  "temp":(13,25), "hum":(60,90),  "ph":(6,7.5), "rain":(30,100)},
    "potato":      {"N":(70,110), "P":(55,85),  "K":(55,90),  "temp":(10,20), "hum":(70,90),  "ph":(5,6.5), "rain":(60,150)},
    "coffee":      {"N":(80,100), "P":(15,30),  "K":(25,40),  "temp":(22,30), "hum":(60,80),  "ph":(5.5,6.5),"rain":(150,300)},
}

SAMPLES_PER_CROP = 200
rng = np.random.default_rng(42)
rows = []

for crop, ranges in CROP_DATA.items():
    for _ in range(SAMPLES_PER_CROP):
        rows.append({
            "N":           rng.uniform(*ranges["N"]),
            "P":           rng.uniform(*ranges["P"]),
            "K":           rng.uniform(*ranges["K"]),
            "temperature": rng.uniform(*ranges["temp"]),
            "humidity":    rng.uniform(*ranges["hum"]),
            "ph":          rng.uniform(*ranges["ph"]),
            "rainfall":    rng.uniform(*ranges["rain"]),
            "label":       crop,
        })

df = pd.DataFrame(rows)

# ── Train ─────────────────────────────────────────────────────────────────
le = LabelEncoder()
y  = le.fit_transform(df["label"])
X  = df.drop("label", axis=1).values

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

clf = RandomForestClassifier(n_estimators=200, random_state=42, n_jobs=-1)
clf.fit(X_train, y_train)

y_pred = clf.predict(X_test)
acc    = accuracy_score(y_test, y_pred)
print(f"\n✅ Crop Model Accuracy: {acc:.4f}")
print(classification_report(y_test, y_pred, target_names=le.classes_))

# ── Save ──────────────────────────────────────────────────────────────────
joblib.dump({"model": clf, "label_encoder": le, "features": list(df.columns[:-1])},
            MODELS_DIR / "crop_model.joblib")
print(f"✅ Model saved → {MODELS_DIR / 'crop_model.joblib'}")
