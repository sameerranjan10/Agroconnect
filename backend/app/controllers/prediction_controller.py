from flask import request
from flask_jwt_extended import jwt_required, get_jwt_identity
from marshmallow import Schema, fields, validate, ValidationError

from app.services.ml_service import MLBridgeService
from app.utils.responses import success_response, error_response, paginated_response


# ── Input schema for crop recommendation ────────────────────────────────── #
class CropInputSchema(Schema):
    nitrogen    = fields.Float(required=True, validate=validate.Range(0, 140))
    phosphorus  = fields.Float(required=True, validate=validate.Range(5, 145))
    potassium   = fields.Float(required=True, validate=validate.Range(5, 205))
    temperature = fields.Float(required=True, validate=validate.Range(8.0, 44.0))
    humidity    = fields.Float(required=True, validate=validate.Range(14.0, 100.0))
    ph          = fields.Float(required=True, validate=validate.Range(3.5, 9.5))
    rainfall    = fields.Float(required=True, validate=validate.Range(20.0, 300.0))

crop_schema = CropInputSchema()


ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp"}
MAX_IMAGE_BYTES = 10 * 1024 * 1024  # 10 MB


class PredictionController:

    # ── Crop Recommendation ──────────────────────────────────────────────── #

    @staticmethod
    @jwt_required()
    def predict_crop():
        """POST /api/predictions/crop"""
        json_data = request.get_json(silent=True)
        if not json_data:
            return error_response("Request body must be JSON.", 400)

        try:
            data = crop_schema.load(json_data)
        except ValidationError as err:
            return error_response("Validation failed.", 422, errors=err.messages)

        user_id = int(get_jwt_identity())
        prediction, err = MLBridgeService.predict_crop(user_id, data)
        if err:
            return error_response(err, 502)

        return success_response(
            data={
                "prediction": prediction.to_dict(),
                "ml_result": prediction.result,
            },
            message="Crop recommendation generated.",
            status_code=201,
        )

    # ── Disease Detection ────────────────────────────────────────────────── #

    @staticmethod
    @jwt_required()
    def detect_disease():
        """POST /api/predictions/disease  (multipart/form-data)"""
        if "file" not in request.files:
            return error_response("No image file provided. Use field name 'file'.", 400)

        file = request.files["file"]

        if file.filename == "":
            return error_response("File name is empty.", 400)

        content_type = file.content_type or "image/jpeg"
        if content_type not in ALLOWED_IMAGE_TYPES:
            return error_response(
                f"Unsupported image type '{content_type}'. Use JPEG or PNG.", 415
            )

        image_bytes = file.read()
        if len(image_bytes) > MAX_IMAGE_BYTES:
            return error_response("Image too large. Maximum size is 10 MB.", 413)
        if len(image_bytes) == 0:
            return error_response("Uploaded file is empty.", 400)

        user_id = int(get_jwt_identity())
        prediction, err = MLBridgeService.detect_disease(
            user_id, image_bytes, content_type, file.filename
        )
        if err:
            return error_response(err, 502)

        return success_response(
            data={
                "prediction": prediction.to_dict(),
                "ml_result": prediction.result,
            },
            message="Disease detection completed.",
            status_code=201,
        )

    # ── History ──────────────────────────────────────────────────────────── #

    @staticmethod
    @jwt_required()
    def get_history():
        """GET /api/predictions/history?type=crop&page=1&per_page=10"""
        user_id = int(get_jwt_identity())
        pred_type = request.args.get("type")          # "crop" | "disease" | None
        page = int(request.args.get("page", 1))
        per_page = min(int(request.args.get("per_page", 10)), 50)

        if pred_type and pred_type not in ("crop", "disease"):
            return error_response("Query param 'type' must be 'crop' or 'disease'.", 400)

        paginated = MLBridgeService.get_user_history(user_id, pred_type, page, per_page)

        return paginated_response(
            items=[p.to_dict() for p in paginated.items],
            total=paginated.total,
            page=paginated.page,
            per_page=paginated.per_page,
            message="Prediction history retrieved.",
        )

    @staticmethod
    @jwt_required()
    def get_prediction_detail(prediction_id: int):
        """GET /api/predictions/<id>"""
        from app.models.prediction import Prediction
        from app import db

        user_id = int(get_jwt_identity())
        pred = db.session.get(Prediction, prediction_id)

        if not pred:
            return error_response("Prediction not found.", 404)
        if pred.user_id != user_id:
            return error_response("Access denied.", 403)

        return success_response(data={"prediction": pred.to_dict()})
