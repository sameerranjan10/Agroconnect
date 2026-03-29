from flask import Flask, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager
from flask_cors import CORS

# ── Extension instances (no app bound yet) ──────────────────────────────── #
db = SQLAlchemy()
migrate = Migrate()
bcrypt = Bcrypt()
jwt = JWTManager()


def create_app(config_object=None):
    """
    Application factory pattern.
    Creates and configures the Flask app.
    """
    app = Flask(__name__)

    # ── Load config ─────────────────────────────────────────────────────── #
    if config_object is None:
        from app.config.settings import get_config
        config_object = get_config()
    app.config.from_object(config_object)

    # ── Initialize extensions ────────────────────────────────────────────── #
    db.init_app(app)
    migrate.init_app(app, db)
    bcrypt.init_app(app)
    jwt.init_app(app)

    # CORS — allow React dev server in development
    CORS(app, resources={r"/api/*": {"origins": "*"}})

    # ── Register blueprints ──────────────────────────────────────────────── #
    from app.routes.auth_routes import auth_bp
    from app.routes.health_routes import health_bp
    from app.routes.prediction_routes import predictions_bp

    app.register_blueprint(auth_bp)
    app.register_blueprint(health_bp)
    app.register_blueprint(predictions_bp)

    # ── JWT error handlers ───────────────────────────────────────────────── #
    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        return jsonify({"success": False, "message": "Token has expired."}), 401

    @jwt.invalid_token_loader
    def invalid_token_callback(error):
        return jsonify({"success": False, "message": "Invalid token."}), 401

    @jwt.unauthorized_loader
    def missing_token_callback(error):
        return jsonify({"success": False, "message": "Authorization token required."}), 401

    # ── Global error handlers ────────────────────────────────────────────── #
    @app.errorhandler(404)
    def not_found(e):
        return jsonify({"success": False, "message": "Endpoint not found."}), 404

    @app.errorhandler(405)
    def method_not_allowed(e):
        return jsonify({"success": False, "message": "Method not allowed."}), 405

    @app.errorhandler(500)
    def internal_error(e):
        db.session.rollback()
        return jsonify({"success": False, "message": "Internal server error."}), 500

    # ── Import all models so Alembic can detect them ─────────────────────── #
    with app.app_context():
        from app.models import User, Prediction  # noqa: F401

    return app
