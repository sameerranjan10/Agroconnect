import random
import pandas as pd

crops = ["rice", "wheat", "maize", "onion", "tomato", "potato", "soybean"]
locations = ["Punjab", "UP", "Maharashtra", "Karnataka", "Odisha"]
seasons = ["Kharif", "Rabi", "Zaid"]
qualities = ["A", "B", "C"]

price_ranges = {
    "rice": (1800, 3000),
    "wheat": (2000, 2800),
    "maize": (1500, 2200),
    "onion": (800, 2500),
    "tomato": (500, 2000),
    "potato": (700, 1800),
    "soybean": (3000, 5000),
}

data = []

for _ in range(100):
    crop = random.choice(crops)
    price = random.randint(*price_ranges[crop])

    row = {
        "crop_type": crop,
        "location": random.choice(locations),
        "quantity": random.randint(10, 500),
        "season": random.choice(seasons),
        "quality": random.choice(qualities),
        "price": price
    }
    data.append(row)

df = pd.DataFrame(data)
df.to_csv("indian_agri_data.csv", index=False)

print("Dataset created ✅")