from flask import Blueprint
from app.controllers.prediction_controller import PredictionController

predictions_bp = Blueprint("predictions", __name__, url_prefix="/api/predictions")

# Crop recommendation
predictions_bp.add_url_rule(
    "/crop",
    view_func=PredictionController.predict_crop,
    methods=["POST"],
)

# Disease detection (multipart image upload)
predictions_bp.add_url_rule(
    "/disease",
    view_func=PredictionController.detect_disease,
    methods=["POST"],
)

# History — paginated, filterable
predictions_bp.add_url_rule(
    "/history",
    view_func=PredictionController.get_history,
    methods=["GET"],
)

# Single prediction detail
predictions_bp.add_url_rule(
    "/<int:prediction_id>",
    view_func=PredictionController.get_prediction_detail,
    methods=["GET"],
)
