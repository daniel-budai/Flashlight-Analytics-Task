import os

from dotenv import load_dotenv
from flask import Flask
from flask_cors import CORS

from app.config import config
from app.extensions import db, migrate


def create_app(env: str | None = None) -> Flask:
    load_dotenv()

    app = Flask(__name__)

    env = env or os.getenv("FLASK_ENV", "development")
    app.config.from_object(config.get(env, config["development"]))

    db.init_app(app)
    if migrate is not None:
        migrate.init_app(app, db)
    CORS(app)

    from app.routes import cars_bp, imports_bp, stats_bp

    app.register_blueprint(cars_bp, url_prefix="/api")
    app.register_blueprint(imports_bp, url_prefix="/api")
    app.register_blueprint(stats_bp, url_prefix="/api")

    if app.config.get("TESTING"):
        with app.app_context():
            db.create_all()
    else:
        from app import models  # noqa: F401 — register models with Migrate

        if env == "development":
            with app.app_context():
                db.create_all()

    return app
