"""
AgroConnect - Price Prediction Model Training
=============================================
Trains a Gradient Boosting regressor to estimate crop market prices (INR/kg).
Run:  python ml/training/train_price.py
Output: ml/models/price_model.joblib
"""
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

import numpy as np
import pandas as pd
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import mean_absolute_error, r2_score
import joblib

MODELS_DIR = Path(__file__).resolve().parent.parent / "models"
MODELS_DIR.mkdir(exist_ok=True)

# ── Base price per crop (INR / kg) ────────────────────────────────────────
BASE_PRICES = {
    "rice": 25,      "wheat": 22,      "maize": 18,
    "sugarcane": 4,  "cotton": 60,     "soybean": 40,
    "groundnut": 55, "chickpea": 60,   "lentil": 75,
    "mango": 80,     "banana": 30,     "tomato": 25,
    "onion": 20,     "potato": 18,     "coffee": 300,
}

SEASON_MULTIPLIER = {"Kharif": 1.0, "Rabi": 1.05, "Zaid": 1.10}
QUALITY_MULTIPLIER= {"Low": 0.75, "Medium": 1.0, "High": 1.30}

LOCATION_MULTIPLIER = {
    "Maharashtra":  1.05, "Punjab":       1.00, "Uttar Pradesh": 0.95,
    "Andhra Pradesh":1.08,"Karnataka":    1.10, "Tamil Nadu":    1.08,
    "West Bengal":  0.98, "Rajasthan":    0.95, "Gujarat":       1.05,
    "Madhya Pradesh":0.92,"Bihar":        0.90, "Telangana":     1.03,
    "Haryana":      1.00, "Odisha":       0.95, "Kerala":        1.15,
    "Other":        1.00,
}

rng = np.random.default_rng(42)
rows = []

for crop, base in BASE_PRICES.items():
    for _ in range(300):
        season   = rng.choice(list(SEASON_MULTIPLIER.keys()))
        quality  = rng.choice(list(QUALITY_MULTIPLIER.keys()))
        location = rng.choice(list(LOCATION_MULTIPLIER.keys()))
        quantity = rng.uniform(10, 1000)
        noise    = rng.normal(1.0, 0.08)   # ±8% market noise

        # Bulk discount: >500 kg → 5% lower
        qty_factor = 0.95 if quantity > 500 else 1.0

        price = (base
                 * SEASON_MULTIPLIER[season]
                 * QUALITY_MULTIPLIER[quality]
                 * LOCATION_MULTIPLIER[location]
                 * qty_factor
                 * noise)

        rows.append({
            "crop_type": crop,
            "location":  location,
            "season":    season,
            "quality":   quality,
            "quantity":  quantity,
            "price":     round(max(price, 1), 2),
        })

df = pd.DataFrame(rows)

# ── Encode categoricals ───────────────────────────────────────────────────
le_crop     = LabelEncoder().fit(df["crop_type"])
le_location = LabelEncoder().fit(df["location"])
le_season   = LabelEncoder().fit(df["season"])
le_quality  = LabelEncoder().fit(df["quality"])

df["crop_enc"]     = le_crop.transform(df["crop_type"])
df["location_enc"] = le_location.transform(df["location"])
df["season_enc"]   = le_season.transform(df["season"])
df["quality_enc"]  = le_quality.transform(df["quality"])

FEATURES = ["crop_enc", "location_enc", "season_enc", "quality_enc", "quantity"]
X = df[FEATURES].values
y = df["price"].values

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

reg = GradientBoostingRegressor(
    n_estimators=200, learning_rate=0.1, max_depth=4, random_state=42
)
reg.fit(X_train, y_train)

y_pred = reg.predict(X_test)
mae    = mean_absolute_error(y_test, y_pred)
r2     = r2_score(y_test, y_pred)
print(f"\n✅ Price Model — MAE: {mae:.2f} INR/kg  |  R²: {r2:.4f}")

# ── Save ──────────────────────────────────────────────────────────────────
joblib.dump({
    "model":        reg,
    "le_crop":      le_crop,
    "le_location":  le_location,
    "le_season":    le_season,
    "le_quality":   le_quality,
    "features":     FEATURES,
    "base_prices":  BASE_PRICES,
}, MODELS_DIR / "price_model.joblib")

print(f"✅ Model saved → {MODELS_DIR / 'price_model.joblib'}")
