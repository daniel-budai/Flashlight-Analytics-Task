from flask import Blueprint, jsonify, request

from app.services import import_log_service, import_service

bp = Blueprint("imports", __name__)


@bp.post("/import")
def import_csv():
    if "file" not in request.files:
        return jsonify({"error": "No file provided"}), 400

    file = request.files["file"]
    if not file.filename or not file.filename.lower().endswith(".csv"):
        return jsonify({"error": "Only CSV files accepted"}), 400

    result = import_service.import_csv(file)

    if "error" in result:
        return jsonify(result), 422

    return jsonify(result), 201


@bp.get("/imports")
def list_imports():
    limit = request.args.get("limit", 20, type=int)
    return jsonify(import_log_service.list_import_logs(limit=max(1, min(limit, 100))))
