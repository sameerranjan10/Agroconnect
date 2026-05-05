# 🌱 AgroConnect — Smart Agriculture Marketplace

> A production-ready full-stack + AI platform connecting farmers and buyers across India with ML-powered crop recommendations and price predictions.

![AgroConnect Banner](https://placehold.co/1200x300/1e7d47/fff?text=AgroConnect+%F0%9F%8C%B1+Smart+Agriculture+Marketplace)

---

## 📋 Table of Contents

- [Project Overview](#-project-overview)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Quick Start (Local)](#-quick-start-local)
- [Docker Setup](#-docker-setup)
- [API Documentation](#-api-documentation)
- [ML Models](#-ml-models)
- [Demo Credentials](#-demo-credentials)
- [Environment Variables](#-environment-variables)

---

## 🌾 Project Overview

AgroConnect is a **full-stack agricultural marketplace** that:

| Feature | Description |
|---|---|
| 🛒 **Marketplace** | Buyers browse and purchase directly from farmers |
| 👨‍🌾 **Farmer Dashboard** | List products, manage inventory, track orders |
| 🤖 **AI Crop Advisor** | Random Forest model recommends crops from soil + weather data |
| 💰 **Price Predictor** | Gradient Boosting model estimates fair market prices (INR/kg) |
| 🔐 **JWT Auth** | Role-based access — FARMER vs BUYER |
| 📦 **Order Management** | Full order lifecycle with status tracking |

---

## 🛠 Tech Stack

### Backend
| Technology | Purpose |
|---|---|
| **FastAPI 0.110** | Async REST API |
| **PostgreSQL 16** | Primary database |
| **SQLAlchemy 2.0** | ORM |
| **Alembic** | Database migrations |
| **python-jose** | JWT tokens |
| **Passlib / bcrypt** | Password hashing |
| **Pydantic v2** | Schema validation |

### Frontend
| Technology | Purpose |
|---|---|
| **React 18 + Vite** | UI framework |
| **Tailwind CSS 3** | Utility-first styling |
| **Axios** | HTTP client with JWT interceptors |
| **React Router 6** | Client-side routing |
| **react-hot-toast** | Notifications |

### AI / ML
| Technology | Purpose |
|---|---|
| **scikit-learn** | Model training (RandomForest + GBR) |
| **pandas / numpy** | Data processing |
| **joblib** | Model serialisation |

---

## 📁 Project Structure

```
agroconnect/
├── backend/
│   ├── app/
│   │   ├── core/
│   │   │   ├── config.py          # Pydantic settings (.env)
│   │   │   └── security.py        # JWT + bcrypt
│   │   ├── db/
│   │   │   └── database.py        # SQLAlchemy engine + session
│   │   ├── models/
│   │   │   ├── user.py            # User ORM model (FARMER/BUYER)
│   │   │   ├── product.py         # Product ORM model
│   │   │   └── order.py           # Order ORM model
│   │   ├── schemas/
│   │   │   ├── user.py            # Pydantic request/response
│   │   │   ├── product.py
│   │   │   ├── order.py
│   │   │   └── ai_schemas.py      # AI endpoint schemas
│   │   ├── routes/
│   │   │   ├── auth.py            # /register, /login
│   │   │   ├── users.py           # /users/me, /users/{id}
│   │   │   ├── products.py        # Full CRUD
│   │   │   ├── orders.py          # Order lifecycle
│   │   │   └── ai.py              # /recommend-crop, /predict-price
│   │   ├── utils/
│   │   │   └── dependencies.py    # FastAPI auth dependencies
│   │   └── main.py                # App factory + CORS + routers
│   ├── alembic/                   # Migration scripts
│   ├── seed.py                    # Demo data seeder
│   ├── requirements.txt
│   ├── Dockerfile
│   └── .env.example
│
├── frontend/
│   └── src/
│       ├── components/
│       │   ├── Navbar.jsx
│       │   ├── ProductCard.jsx
│       │   ├── OrderModal.jsx
│       │   ├── Spinner.jsx
│       │   └── ProtectedRoute.jsx
│       ├── context/
│       │   └── AuthContext.jsx    # Global auth state
│       ├── pages/
│       │   ├── Home.jsx
│       │   ├── Login.jsx
│       │   ├── Register.jsx
│       │   ├── FarmerDashboard.jsx
│       │   ├── BuyerMarketplace.jsx
│       │   ├── ProductDetails.jsx
│       │   └── AITools.jsx
│       ├── services/
│       │   └── api.js             # Axios + all API calls
│       ├── App.jsx                # Router + layout
│       └── main.jsx
│
├── ml/
│   ├── models/                    # Saved .joblib model files
│   ├── training/
│   │   ├── train_crop.py          # Train crop recommendation model
│   │   └── train_price.py         # Train price prediction model
│   └── inference/
│       ├── crop_inference.py      # predict_crop() function
│       └── price_inference.py     # predict_price() function
│
└── docker-compose.yml
```

---

## 🚀 Quick Start (Local)

### Prerequisites
- Python 3.11+
- Node.js 20+
- PostgreSQL 14+ running locally
- Git

### 1. Clone & Setup

```bash
git clone https://github.com/yourname/agroconnect.git
cd agroconnect
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env — set DATABASE_URL and SECRET_KEY

# Create PostgreSQL database
createdb agroconnect
# Or via psql:
# CREATE DATABASE agroconnect;
# CREATE USER agrouser WITH PASSWORD 'agropass';
# GRANT ALL PRIVILEGES ON DATABASE agroconnect TO agrouser;
```

### 3. Train ML Models

```bash
# From project root
python ml/training/train_crop.py
python ml/training/train_price.py
# Models saved to ml/models/
```

### 4. Start Backend

```bash
cd backend
uvicorn app.main:app --reload --port 8000
```

Tables are auto-created on first startup. Then seed demo data:

```bash
python seed.py
```

Visit **http://localhost:8000/docs** for the interactive Swagger UI.

### 5. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# VITE_API_URL=http://localhost:8000/api/v1

# Start dev server
npm run dev
```

Visit **http://localhost:5173**

---

## 🐳 Docker Setup

The easiest way to run the full stack:

```bash
# From project root

# 1. Train ML models first (requires Python + scikit-learn locally)
python ml/training/train_crop.py
python ml/training/train_price.py

# 2. Start all services
docker compose up --build

# 3. (Optional) Seed demo data
docker compose exec backend python seed.py
```

| Service  | URL |
|---|---|
| Frontend | http://localhost:80 |
| Backend API | http://localhost:8000 |
| API Docs | http://localhost:8000/docs |
| PostgreSQL | localhost:5432 |

```bash
# Stop
docker compose down

# Stop + remove data
docker compose down -v
```

---

## 📡 API Documentation

All endpoints are prefixed with `/api/v1`.

### Authentication

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/auth/register` | Register new user | ❌ |
| POST | `/auth/login` | Login, returns JWT | ❌ |

**Register example:**
```json
POST /api/v1/auth/register
{
  "name": "Ramesh Kumar",
  "email": "ramesh@farm.in",
  "password": "secure123",
  "role": "FARMER",
  "location": "Maharashtra"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": { "id": 1, "name": "Ramesh Kumar", "role": "FARMER", ... }
}
```

### Users

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/users/me` | Get own profile | ✅ Any |
| PUT | `/users/me` | Update profile | ✅ Any |
| GET | `/users/{id}` | Get user by ID | ✅ Any |

### Products

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/products` | List all (with filters) | ❌ |
| GET | `/products/{id}` | Get single product | ❌ |
| POST | `/products` | Create listing | ✅ FARMER |
| PUT | `/products/{id}` | Update product | ✅ FARMER (owner) |
| DELETE | `/products/{id}` | Delete product | ✅ FARMER (owner) |
| GET | `/products/my` | My listed products | ✅ FARMER |

**Query params for GET /products:**
- `search` — text search in title
- `category` — filter by category
- `location` — filter by location
- `min_price`, `max_price` — price range
- `skip`, `limit` — pagination

### Orders

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/orders` | Place order | ✅ BUYER |
| GET | `/orders/buyer` | My placed orders | ✅ BUYER |
| GET | `/orders/farmer` | Orders on my products | ✅ FARMER |
| GET | `/orders/{id}` | Single order | ✅ Any (owner) |
| PUT | `/orders/{id}/status` | Update order status | ✅ FARMER |

**Order statuses:** `PENDING → CONFIRMED → SHIPPED → DELIVERED / CANCELLED`

### AI Endpoints

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/ai/recommend-crop` | Crop recommendation | ✅ Any |
| POST | `/ai/predict-price` | Price prediction | ✅ Any |
| GET | `/ai/health` | Model health check | ❌ |

**Crop Recommendation input:**
```json
{
  "nitrogen": 80, "phosphorus": 40, "potassium": 35,
  "temperature": 25.5, "humidity": 70, "ph": 6.2, "rainfall": 150
}
```

**Price Prediction input:**
```json
{
  "crop_type": "rice",
  "location": "Punjab",
  "quantity": 500,
  "season": "Kharif",
  "quality": "High"
}
```

---

## 🤖 ML Models

### Crop Recommendation
- **Algorithm:** Random Forest Classifier (200 trees)
- **Features:** N, P, K (kg/ha), Temperature (°C), Humidity (%), pH, Rainfall (mm/yr)
- **Output classes:** 15 crops (rice, wheat, maize, sugarcane, cotton, soybean, groundnut, chickpea, lentil, mango, banana, tomato, onion, potato, coffee)
- **Accuracy:** ~98% on test set
- **Training data:** 3000 synthetic samples (200/crop) with realistic agronomic ranges

### Price Prediction
- **Algorithm:** Gradient Boosting Regressor (200 estimators)
- **Features:** Crop type, Location (16 states), Season, Quality grade, Quantity
- **Output:** Predicted price (₹/kg) + min/max range + market trend
- **R² Score:** 0.985 | MAE: ~₹4.6/kg
- **Training data:** 4500 synthetic records reflecting Indian wholesale market patterns

### Retrain Models
```bash
python ml/training/train_crop.py
python ml/training/train_price.py
```

---

## 🔑 Demo Credentials

After running `python backend/seed.py`:

| Role | Email | Password | Notes |
|---|---|---|---|
| 🌾 Farmer | farmer@demo.com | demo123 | Has 3 product listings |
| 🌾 Farmer | priya@demo.com | demo123 | Organic farm products |
| 🌾 Farmer | suresh@demo.com | demo123 | Cotton & spice farmer |
| 🛒 Buyer | buyer@demo.com | demo123 | Can browse & order |
| 🛒 Buyer | delhi@demo.com | demo123 | Delhi buyer account |

---

## ⚙️ Environment Variables

### Backend (`.env`)

```env
# Database
DATABASE_URL=postgresql://agrouser:agropass@localhost:5432/agroconnect

# JWT (change in production!)
SECRET_KEY=your-super-secret-key-minimum-32-characters
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=43200

# App
APP_NAME=AgroConnect
DEBUG=True
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

### Frontend (`.env`)

```env
VITE_API_URL=http://localhost:8000/api/v1
```

---

## 🔒 Security Notes

- JWT tokens expire after 30 days (configurable)
- Passwords hashed with bcrypt (cost factor 12)
- CORS restricted to allowed origins
- Farmer can only modify/delete their own products
- Buyer can only view their own orders
- Input validation via Pydantic v2 on all endpoints

---

## 🗺 Roadmap

- [ ] Payment integration (Razorpay)
- [ ] Real-time notifications (WebSocket)
- [ ] Image upload (S3/Cloudflare R2)
- [ ] SMS OTP verification
- [ ] Weather API integration (live data for AI)
- [ ] Multi-language support (Hindi, Tamil, Marathi)
- [ ] Mobile app (React Native)

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📄 License

MIT License — free to use for personal and commercial projects.

---

<div align="center">
  <strong>🌱 Built with ❤️ for India's farmers</strong><br/>
  <em>AgroConnect — From Farm to Market, Powered by AI</em>
</div>
