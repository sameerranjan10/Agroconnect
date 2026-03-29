"""
Tests for /api/predictions/* endpoints.
The ML microservice (FastAPI) is mocked so tests run without it running.

Run: pytest tests/test_predictions.py -v
"""
from unittest.mock import patch, MagicMock
import json
import io


CROP_PAYLOAD = {
    "nitrogen": 90,
    "phosphorus": 42,
    "potassium": 43,
    "temperature": 20.8,
    "humidity": 82.0,
    "ph": 6.5,
    "rainfall": 202.9,
}

MOCK_CROP_ML_RESULT = {
    "recommended_crop": "rice",
    "confidence": 0.94,
    "top_crops": [
        {"crop": "rice", "probability": 0.94},
        {"crop": "maize", "probability": 0.04},
    ],
    "advice": "Best grown in waterlogged fields.",
}

MOCK_DISEASE_ML_RESULT = {
    "detected_disease": "Healthy",
    "confidence": 0.91,
    "is_healthy": True,
    "severity": "none",
    "treatment_suggestions": ["No treatment needed."],
    "preventive_measures": ["Continue regular monitoring."],
}


# ══════════════════════════════════════════════════════════════════════════ #
#  CROP RECOMMENDATION
# ══════════════════════════════════════════════════════════════════════════ #

class TestCropPrediction:

    def test_predict_crop_success(self, client, auth_headers):
        with patch("app.services.ml_service.requests.post") as mock_post:
            mock_response = MagicMock()
            mock_response.json.return_value = MOCK_CROP_ML_RESULT
            mock_response.raise_for_status.return_value = None
            mock_post.return_value = mock_response

            resp = client.post(
                "/api/predictions/crop",
                headers=auth_headers,
                json=CROP_PAYLOAD,
            )
            data = resp.get_json()

        assert resp.status_code == 201
        assert data["success"] is True
        assert data["data"]["ml_result"]["recommended_crop"] == "rice"
        assert data["data"]["prediction"]["prediction_type"] == "crop"
        assert data["data"]["prediction"]["confidence"] == 0.94

    def test_predict_crop_no_auth(self, client):
        resp = client.post("/api/predictions/crop", json=CROP_PAYLOAD)
        assert resp.status_code == 401

    def test_predict_crop_invalid_payload(self, client, auth_headers):
        resp = client.post(
            "/api/predictions/crop",
            headers=auth_headers,
            json={"nitrogen": 999},  # out of range, missing fields
        )
        assert resp.status_code == 422

    def test_predict_crop_missing_fields(self, client, auth_headers):
        resp = client.post(
            "/api/predictions/crop",
            headers=auth_headers,
            json={"nitrogen": 90, "phosphorus": 42},  # incomplete
        )
        assert resp.status_code == 422

    def test_predict_crop_ml_service_down(self, client, auth_headers):
        from requests.exceptions import ConnectionError as ReqConnErr
        with patch("app.services.ml_service.requests.post", side_effect=ReqConnErr()):
            resp = client.post(
                "/api/predictions/crop",
                headers=auth_headers,
                json=CROP_PAYLOAD,
            )
        assert resp.status_code == 502
        assert resp.get_json()["success"] is False

    def test_predict_crop_no_json_body(self, client, auth_headers):
        resp = client.post("/api/predictions/crop", headers=auth_headers)
        assert resp.status_code == 400


# ══════════════════════════════════════════════════════════════════════════ #
#  DISEASE DETECTION
# ══════════════════════════════════════════════════════════════════════════ #

class TestDiseaseDetection:

    def _make_image_file(self, filename="leaf.jpg", content_type="image/jpeg"):
        """Create a minimal fake image bytes for upload."""
        data = io.BytesIO(b"\xff\xd8\xff" + b"\x00" * 100)  # JPEG magic bytes
        return (data, filename)

    def test_detect_disease_success(self, client, auth_headers):
        with patch("app.services.ml_service.requests.post") as mock_post:
            mock_response = MagicMock()
            mock_response.json.return_value = MOCK_DISEASE_ML_RESULT
            mock_response.raise_for_status.return_value = None
            mock_post.return_value = mock_response

            data = {"file": (io.BytesIO(b"\xff\xd8\xff" + b"\x00" * 50), "leaf.jpg")}
            resp = client.post(
                "/api/predictions/disease",
                headers=auth_headers,
                data=data,
                content_type="multipart/form-data",
            )
            result = resp.get_json()

        assert resp.status_code == 201
        assert result["success"] is True
        assert result["data"]["ml_result"]["detected_disease"] == "Healthy"
        assert result["data"]["prediction"]["prediction_type"] == "disease"

    def test_detect_disease_no_file(self, client, auth_headers):
        resp = client.post(
            "/api/predictions/disease",
            headers=auth_headers,
            data={},
            content_type="multipart/form-data",
        )
        assert resp.status_code == 400

    def test_detect_disease_no_auth(self, client):
        data = {"file": (io.BytesIO(b"fake"), "leaf.jpg")}
        resp = client.post(
            "/api/predictions/disease",
            data=data,
            content_type="multipart/form-data",
        )
        assert resp.status_code == 401

    def test_detect_disease_wrong_file_type(self, client, auth_headers):
        data = {"file": (io.BytesIO(b"not an image"), "document.pdf")}
        # Set content type to PDF to trigger rejection
        resp = client.post(
            "/api/predictions/disease",
            headers=auth_headers,
            data=data,
            content_type="multipart/form-data",
        )
        # Will be rejected at content_type check (Flask passes application/octet-stream)
        assert resp.status_code in (400, 415)


# ══════════════════════════════════════════════════════════════════════════ #
#  HISTORY
# ══════════════════════════════════════════════════════════════════════════ #

class TestPredictionHistory:

    def _make_two_predictions(self, client, auth_headers):
        """Helper: create 2 crop predictions in DB via mocked ML service."""
        with patch("app.services.ml_service.requests.post") as mock_post:
            mock_response = MagicMock()
            mock_response.json.return_value = MOCK_CROP_ML_RESULT
            mock_response.raise_for_status.return_value = None
            mock_post.return_value = mock_response

            client.post("/api/predictions/crop", headers=auth_headers, json=CROP_PAYLOAD)
            client.post("/api/predictions/crop", headers=auth_headers, json=CROP_PAYLOAD)

    def test_get_history_empty(self, client, auth_headers):
        resp = client.get("/api/predictions/history", headers=auth_headers)
        data = resp.get_json()
        assert resp.status_code == 200
        assert data["data"] == []
        assert data["pagination"]["total"] == 0

    def test_get_history_with_records(self, client, auth_headers):
        self._make_two_predictions(client, auth_headers)
        resp = client.get("/api/predictions/history", headers=auth_headers)
        data = resp.get_json()
        assert resp.status_code == 200
        assert data["pagination"]["total"] == 2
        assert len(data["data"]) == 2

    def test_get_history_filter_by_type(self, client, auth_headers):
        self._make_two_predictions(client, auth_headers)
        resp = client.get(
            "/api/predictions/history?type=crop",
            headers=auth_headers,
        )
        data = resp.get_json()
        assert resp.status_code == 200
        assert all(p["prediction_type"] == "crop" for p in data["data"])

    def test_get_history_invalid_type_filter(self, client, auth_headers):
        resp = client.get(
            "/api/predictions/history?type=invalid",
            headers=auth_headers,
        )
        assert resp.status_code == 400

    def test_get_history_pagination(self, client, auth_headers):
        self._make_two_predictions(client, auth_headers)
        resp = client.get(
            "/api/predictions/history?page=1&per_page=1",
            headers=auth_headers,
        )
        data = resp.get_json()
        assert resp.status_code == 200
        assert len(data["data"]) == 1
        assert data["pagination"]["pages"] == 2

    def test_get_history_no_auth(self, client):
        resp = client.get("/api/predictions/history")
        assert resp.status_code == 401

    def test_get_prediction_detail(self, client, auth_headers):
        self._make_two_predictions(client, auth_headers)
        # Get first prediction id from history
        history_resp = client.get("/api/predictions/history", headers=auth_headers)
        pred_id = history_resp.get_json()["data"][0]["id"]

        resp = client.get(f"/api/predictions/{pred_id}", headers=auth_headers)
        data = resp.get_json()

        assert resp.status_code == 200
        assert data["data"]["prediction"]["id"] == pred_id

    def test_get_prediction_detail_not_found(self, client, auth_headers):
        resp = client.get("/api/predictions/99999", headers=auth_headers)
        assert resp.status_code == 404

    def test_get_prediction_detail_wrong_user(self, client, auth_headers):
        """User A cannot access User B's predictions."""
        self._make_two_predictions(client, auth_headers)
        pred_id = client.get(
            "/api/predictions/history", headers=auth_headers
        ).get_json()["data"][0]["id"]

        # Register second user
        client.post("/api/auth/register", json={
            "name": "Priya Farmer",
            "email": "priya@farm.com",
            "password": "Farmer456",
        })
        login = client.post("/api/auth/login", json={
            "email": "priya@farm.com",
            "password": "Farmer456",
        }).get_json()
        other_token = login["data"]["tokens"]["access_token"]
        other_headers = {"Authorization": f"Bearer {other_token}"}

        resp = client.get(f"/api/predictions/{pred_id}", headers=other_headers)
        assert resp.status_code == 403
