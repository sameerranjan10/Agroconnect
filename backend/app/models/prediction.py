from datetime import datetime, timezone
from app import db


class PredictionType(db.Model):
    """Lookup table for prediction types — extensible without schema changes."""
    __tablename__ = "prediction_types"
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(50), unique=True, nullable=False)  # "crop" | "disease"


class Prediction(db.Model):
    """
    Stores every ML prediction made by a user.
    Works for both crop recommendations and disease detections.
    """
    __tablename__ = "predictions"

    id = db.Column(db.Integer, primary_key=True)

    # Owner
    user_id = db.Column(
        db.Integer,
        db.ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    # Type — "crop" or "disease"
    prediction_type = db.Column(db.String(20), nullable=False, index=True)

    # Input snapshot (JSON-serialised request payload)
    input_data = db.Column(db.JSON, nullable=False)

    # Output snapshot (JSON-serialised ML response)
    result = db.Column(db.JSON, nullable=False)

    # Top prediction label (denormalised for fast querying/display)
    top_result = db.Column(db.String(100), nullable=False)
    confidence = db.Column(db.Float, nullable=False)

    # Optional: image filename for disease predictions
    image_filename = db.Column(db.String(255), nullable=True)

    created_at = db.Column(
        db.DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
        index=True,
    )

    # Relationship back to user
    user = db.relationship("User", backref=db.backref("predictions", lazy="dynamic"))

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "prediction_type": self.prediction_type,
            "input_data": self.input_data,
            "result": self.result,
            "top_result": self.top_result,
            "confidence": self.confidence,
            "image_filename": self.image_filename,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }

    def __repr__(self):
        return f"<Prediction {self.prediction_type}:{self.top_result} user={self.user_id}>"
