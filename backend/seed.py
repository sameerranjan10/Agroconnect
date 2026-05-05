"""
AgroConnect - Database Seeder
Creates demo farmer/buyer accounts and sample products.
Run:  python backend/seed.py
"""
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))

from app.db.database import SessionLocal, Base, engine
from app.models import User, Product, Order
from app.models.user import UserRole
from app.core.security import hash_password

Base.metadata.create_all(bind=engine)

DEMO_FARMERS = [
    {"name": "Ramesh Kumar",  "email": "farmer@demo.com",  "password": "demo123",
     "location": "Nashik, Maharashtra",   "phone": "+91 98765 43210",
     "bio": "Third-generation farmer specialising in grapes and onions."},
    {"name": "Priya Devi",    "email": "priya@demo.com",   "password": "demo123",
     "location": "Ludhiana, Punjab",      "phone": "+91 87654 32109",
     "bio": "Organic wheat and rice farmer with 15 years of experience."},
    {"name": "Suresh Patel",  "email": "suresh@demo.com",  "password": "demo123",
     "location": "Surat, Gujarat",        "phone": "+91 76543 21098",
     "bio": "Cotton and groundnut specialist from Gujarat."},
]

DEMO_BUYERS = [
    {"name": "Meena Traders",    "email": "buyer@demo.com",   "password": "demo123",
     "location": "Mumbai, Maharashtra", "phone": "+91 65432 10987"},
    {"name": "Delhi Agro Mart",  "email": "delhi@demo.com",   "password": "demo123",
     "location": "New Delhi",           "phone": "+91 54321 09876"},
]

DEMO_PRODUCTS = [
    # Ramesh Kumar (index 0)
    {"title": "Basmati Rice Premium",  "description": "Long-grain basmati with rich aroma. Direct from Nashik farms.", "price": 85, "quantity": 500, "unit": "kg",     "category": "Grain",     "location": "Nashik, Maharashtra"},
    {"title": "Fresh Red Onions",      "description": "Export-quality red onions, freshly harvested.",              "price": 22, "quantity": 2000,"unit": "kg",     "category": "Vegetable", "location": "Nashik, Maharashtra"},
    {"title": "Grapes (Thompson)",     "description": "Seedless Thompson grapes, sweet and crisp.",                 "price": 65, "quantity": 300, "unit": "kg",     "category": "Fruit",     "location": "Nashik, Maharashtra"},
    # Priya Devi (index 1)
    {"title": "Organic Wheat Flour",   "description": "Stone-ground organic whole wheat flour.",                    "price": 45, "quantity": 1000,"unit": "kg",     "category": "Grain",     "location": "Ludhiana, Punjab"},
    {"title": "Basmati Rice (Organic)","description": "Certified organic Pusa basmati.",                           "price": 120,"quantity": 400, "unit": "kg",     "category": "Grain",     "location": "Ludhiana, Punjab"},
    {"title": "Yellow Mustard Seeds",  "description": "High-oil-content mustard seeds for oil pressing.",           "price": 55, "quantity": 200, "unit": "kg",     "category": "Cash",      "location": "Ludhiana, Punjab"},
    # Suresh Patel (index 2)
    {"title": "Desi Cotton (Grade A)", "description": "Long-staple desi cotton, ginned and graded.",               "price": 58, "quantity": 800, "unit": "kg",     "category": "Cash",      "location": "Surat, Gujarat"},
    {"title": "Groundnuts (Bold)",     "description": "Bold-variety groundnuts, freshly shelled.",                 "price": 62, "quantity": 600, "unit": "kg",     "category": "Pulse",     "location": "Surat, Gujarat"},
    {"title": "Cumin Seeds (Jeera)",   "description": "Premium quality cumin seeds with high volatile oil.",       "price": 320,"quantity": 100, "unit": "kg",     "category": "Spice",     "location": "Surat, Gujarat"},
    {"title": "Alphonso Mangoes",      "description": "Devgad Alphonso — the king of mangoes.",                    "price": 350,"quantity": 50,  "unit": "dozen",  "category": "Fruit",     "location": "Ratnagiri, Maharashtra"},
]


def seed():
    db = SessionLocal()
    try:
        # Clear existing demo data
        existing = db.query(User).filter(User.email.in_(
            [u["email"] for u in DEMO_FARMERS + DEMO_BUYERS]
        )).all()
        for u in existing:
            db.delete(u)
        db.commit()

        # Create farmers
        farmers = []
        for f in DEMO_FARMERS:
            user = User(
                name=f["name"], email=f["email"],
                hashed_password=hash_password(f["password"]),
                role=UserRole.FARMER, phone=f["phone"],
                location=f["location"], bio=f.get("bio"),
            )
            db.add(user)
            farmers.append(user)
        db.flush()

        # Create buyers
        for b in DEMO_BUYERS:
            user = User(
                name=b["name"], email=b["email"],
                hashed_password=hash_password(b["password"]),
                role=UserRole.BUYER, phone=b["phone"],
                location=b["location"],
            )
            db.add(user)
        db.flush()

        # Create products (3 per farmer)
        for i, p in enumerate(DEMO_PRODUCTS):
            farmer = farmers[i // 3]
            product = Product(**p, farmer_id=farmer.id)
            db.add(product)

        db.commit()
        print("✅ Demo data seeded successfully!")
        print("   Farmer login: farmer@demo.com / demo123")
        print("   Buyer  login: buyer@demo.com  / demo123")
    except Exception as e:
        db.rollback()
        print(f"❌ Seeding failed: {e}")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
