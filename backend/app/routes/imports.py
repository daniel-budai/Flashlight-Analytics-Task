from flask import Blueprint, current_app, jsonify, request

from app.services import import_log_service
from app.services.cache_utils import invalidate_stats_cache
from app.services.import_jobs import (
    create_import_job,
    enqueue_import_job,
    get_import_job,
)
from app.services.imports.service import import_csv

bp = Blueprint("imports", __name__)


@bp.post("/import")
def import_csv_route():
    if "file" not in request.files:
        return jsonify({"error": "No file provided"}), 400

    file = request.files["file"]
    if not file.filename or not file.filename.lower().endswith(".csv"):
        return jsonify({"error": "Only CSV files accepted"}), 400

    if current_app.config.get("SYNC_IMPORTS"):
        result = import_csv(file)
        if "error" in result:
            return jsonify(result), 422
        invalidate_stats_cache()
        return jsonify(result), 201

    job = create_import_job(file)
    enqueue_import_job(job.id, current_app._get_current_object())
    return jsonify({"job_id": job.id, "status": job.status}), 202


@bp.get("/imports/jobs/<int:job_id>")
def get_import_job_route(job_id: int):
    job = get_import_job(job_id)
    if not job:
        return jsonify({"error": "Job not found"}), 404
    return jsonify(job.to_dict())


@bp.get("/imports")
def list_imports():
    limit = request.args.get("limit", 20, type=int)
    return jsonify(import_log_service.list_import_logs(limit=max(1, min(limit, 100))))
