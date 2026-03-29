from fastapi import APIRouter, HTTPException, UploadFile, File, status
from app.models.schemas import DiseaseDetectionResponse
from app.services.disease_service import DiseaseDetectionService
import logging

router = APIRouter(prefix="/disease-detection", tags=["Disease Detection"])
logger = logging.getLogger(__name__)

ALLOWED_TYPES = {"image/jpeg", "image/png", "image/webp", "image/jpg"}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB


@router.post(
    "",
    response_model=DiseaseDetectionResponse,
    summary="Detect plant disease from a leaf image",
)
async def detect_disease(
    file: UploadFile = File(..., description="Leaf image (JPEG/PNG, max 10MB)"),
):
    """
    Upload a plant leaf image to detect diseases.
    Returns detected disease, confidence, severity, and treatment advice.
    """
    # Validate content type
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail=f"Unsupported file type '{file.content_type}'. Use JPEG or PNG.",
        )

    image_bytes = await file.read()

    # Validate file size
    if len(image_bytes) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="File too large. Maximum allowed size is 10 MB.",
        )

    if len(image_bytes) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file is empty.",
        )

    try:
        result = DiseaseDetectionService.predict(image_bytes)
        return result
    except RuntimeError as e:
        logger.error(f"Disease prediction error: {e}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="ML model not available. Contact administrator.",
        )
    except Exception as e:
        logger.exception("Unexpected disease detection error")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Disease detection failed due to an internal error.",
        )
