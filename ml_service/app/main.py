"""
AgroConnect ML Microservice
FastAPI application entry point.
"""
import logging
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.utils.settings import settings
from app.services.crop_service import CropRecommendationService
from app.services.disease_service import DiseaseDetectionService
from app.routers import crop_router, disease_router

logging.basicConfig(
    level=getattr(logging, settings.log_level.upper(), logging.INFO),
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Load ML models once at startup; release resources on shutdown.
    Using FastAPI lifespan instead of deprecated @app.on_event.
    """
    model_dir = Path(settings.model_dir)
    logger.info(f"🚀 Loading ML models from {model_dir} ...")

    try:
        CropRecommendationService.load_models(model_dir)
        DiseaseDetectionService.load_models(model_dir)
        logger.info("✅ All models loaded. Service ready.")
    except FileNotFoundError:
        logger.warning(
            "⚠️  Model files not found. Run: python app/ml_models/train_models.py"
        )
    yield
    logger.info("🛑 ML service shutting down.")


# ── FastAPI app ──────────────────────────────────────────────────────────── #
app = FastAPI(
    title="AgroConnect ML Service",
    description="AI-powered crop recommendation and plant disease detection.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# CORS — Flask backend and React dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5000", "http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ──────────────────────────────────────────────────────────────── #
app.include_router(crop_router.router)
app.include_router(disease_router.router)


@app.get("/health", tags=["Health"])
async def health():
    return {
        "status": "healthy",
        "service": "AgroConnect ML Microservice",
        "models": {
            "crop_recommendation": CropRecommendationService._model is not None,
            "disease_detection": DiseaseDetectionService._model is not None,
        },
    }
