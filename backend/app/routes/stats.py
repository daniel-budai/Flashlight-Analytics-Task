from flask import Blueprint, jsonify, request

from app.services import stats_service
from app.services.query_builder import FilterValidationError

bp = Blueprint("stats", __name__)


@bp.get("/stats")
def get_stats():
    try:
        return jsonify(stats_service.get_stats(request.args.to_dict()))
    except FilterValidationError as e:
        return jsonify({"error": str(e)}), 400
