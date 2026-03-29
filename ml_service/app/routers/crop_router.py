from fastapi import APIRouter, HTTPException, status
from app.models.schemas import CropRecommendationRequest, CropRecommendationResponse
from app.services.crop_service import CropRecommendationService
import logging

router = APIRouter(prefix="/predict-crop", tags=["Crop Recommendation"])
logger = logging.getLogger(__name__)


@router.post(
    "",
    response_model=CropRecommendationResponse,
    summary="Recommend the best crop based on soil and climate data",
)
async def predict_crop(payload: CropRecommendationRequest):
    """
    Accepts soil nutrients (N, P, K), temperature, humidity, pH, and rainfall.
    Returns the recommended crop with confidence score and top alternatives.
    """
    try:
        result = CropRecommendationService.predict(payload)
        return result
    except RuntimeError as e:
        logger.error(f"Crop prediction error: {e}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="ML model not available. Contact administrator.",
        )
    except Exception as e:
        logger.exception("Unexpected crop prediction error")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Prediction failed due to an internal error.",
        )
