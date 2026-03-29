"""
ML Bridge Service
─────────────────
Connects the Flask backend to the FastAPI ML microservice.
Handles HTTP communication, error wrapping, and saves prediction history.
"""
import logging
from datetime import datetime, timezone

import requests
from requests.exceptions import ConnectionError, Timeout, RequestException

from app import db
from app.models.prediction import Prediction
from app.config.settings import get_config

logger = logging.getLogger(__name__)
config = get_config()

ML_SERVICE_URL = config.ML_SERVICE_URL
REQUEST_TIMEOUT = 15  # seconds


class MLServiceError(Exception):
    """Raised when the ML microservice returns an error or is unreachable."""
    def __init__(self, message: str, status_code: int = 502):
        self.message = message
        self.status_code = status_code
        super().__init__(message)


class MLBridgeService:
    """
    Thin HTTP client that calls the FastAPI ML service.
    All methods return (result_dict, None) on success or (None, MLServiceError) on failure.
    """

    # ── Internal HTTP helper ─────────────────────────────────────────────── #

    @staticmethod
    def _post(endpoint: str, json_payload: dict) -> dict:
        url = f"{ML_SERVICE_URL}{endpoint}"
        try:
            response = requests.post(url, json=json_payload, timeout=REQUEST_TIMEOUT)
            response.raise_for_status()
            return response.json()
        except ConnectionError:
            raise MLServiceError("ML service is currently unavailable. Please try again later.", 503)
        except Timeout:
            raise MLServiceError("ML service request timed out. Please try again.", 504)
        except requests.HTTPError as e:
            detail = e.response.json().get("detail", str(e)) if e.response else str(e)
            raise MLServiceError(f"ML service error: {detail}", e.response.status_code if e.response else 502)
        except RequestException as e:
            raise MLServiceError(f"Unexpected communication error: {str(e)}", 502)

    @staticmethod
    def _post_file(endpoint: str, image_bytes: bytes, content_type: str) -> dict:
        url = f"{ML_SERVICE_URL}{endpoint}"
        try:
            files = {"file": ("image.jpg", image_bytes, content_type)}
            response = requests.post(url, files=files, timeout=REQUEST_TIMEOUT)
            response.raise_for_status()
            return response.json()
        except ConnectionError:
            raise MLServiceError("ML service is currently unavailable.", 503)
        except Timeout:
            raise MLServiceError("ML service request timed out.", 504)
        except requests.HTTPError as e:
            detail = e.response.json().get("detail", str(e)) if e.response else str(e)
            raise MLServiceError(f"ML service error: {detail}", e.response.status_code if e.response else 502)
        except RequestException as e:
            raise MLServiceError(f"Communication error: {str(e)}", 502)

    # ── Crop Recommendation ──────────────────────────────────────────────── #

    @classmethod
    def predict_crop(cls, user_id: int, payload: dict) -> tuple:
        """
        Call ML /predict-crop and save result to DB.
        Returns (prediction_record, None) or (None, error_message).
        """
        try:
            ml_result = cls._post("/predict-crop", payload)
        except MLServiceError as e:
            return None, e.message

        # Persist to DB
        prediction = Prediction(
            user_id=user_id,
            prediction_type="crop",
            input_data=payload,
            result=ml_result,
            top_result=ml_result["recommended_crop"],
            confidence=ml_result["confidence"],
        )
        db.session.add(prediction)
        db.session.commit()

        return prediction, None

    # ── Disease Detection ────────────────────────────────────────────────── #

    @classmethod
    def detect_disease(cls, user_id: int, image_bytes: bytes, content_type: str, filename: str) -> tuple:
        """
        Call ML /disease-detection with an image file and save result to DB.
        Returns (prediction_record, None) or (None, error_message).
        """
        try:
            ml_result = cls._post_file("/disease-detection", image_bytes, content_type)
        except MLServiceError as e:
            return None, e.message

        prediction = Prediction(
            user_id=user_id,
            prediction_type="disease",
            input_data={"filename": filename, "content_type": content_type},
            result=ml_result,
            top_result=ml_result["detected_disease"],
            confidence=ml_result["confidence"],
            image_filename=filename,
        )
        db.session.add(prediction)
        db.session.commit()

        return prediction, None

    # ── History ──────────────────────────────────────────────────────────── #

    @staticmethod
    def get_user_history(user_id: int, prediction_type: str = None, page: int = 1, per_page: int = 10):
        """
        Paginated prediction history for a user.
        Optionally filter by prediction_type ("crop" or "disease").
        """
        query = Prediction.query.filter_by(user_id=user_id)
        if prediction_type:
            query = query.filter_by(prediction_type=prediction_type)
        query = query.order_by(Prediction.created_at.desc())
        return query.paginate(page=page, per_page=per_page, error_out=False)
