"""
AgroConnect - FastAPI Application
Main entry point: creates the app, adds middleware, registers routers.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.db.database import Base, engine

# Import all models so Alembic / create_all sees them
from app.models import User, Product, Order  # noqa: F401

from app.routes import auth, users, products, orders, ai, market, weather


# ── Create tables if they don't exist (dev convenience) ──────────────────
# In production use Alembic migrations instead.
Base.metadata.create_all(bind=engine)

# ── Application factory ───────────────────────────────────────────────────
app = FastAPI(
    title=settings.APP_NAME,
    description=(
        "Smart agriculture marketplace connecting farmers and buyers "
        "with AI-powered crop recommendations and price predictions."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# ── CORS ──────────────────────────────────────────────────────────────────
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
    "https://agroconnect-phi.vercel.app",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ───────────────────────────────────────────────────────────────
PREFIX = settings.API_V1_PREFIX

app.include_router(auth.router,     prefix=PREFIX)
app.include_router(users.router,    prefix=PREFIX)
app.include_router(products.router, prefix=PREFIX)
app.include_router(orders.router,   prefix=PREFIX)
app.include_router(ai.router,       prefix=PREFIX)
app.include_router(market.router, prefix=PREFIX)
app.include_router(weather.router, prefix=PREFIX)

# ── Root health-check ──────────────────────────────────────────────────────
@app.get("/", tags=["Health"])
def root():
    return {"message": f"Welcome to {settings.APP_NAME} API 🌱", "status": "running"}


@app.get("/health", tags=["Health"])
def health():
    return {"status": "ok", "app": settings.APP_NAME}
