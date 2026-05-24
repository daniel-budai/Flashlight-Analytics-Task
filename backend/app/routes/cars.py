from flask import Blueprint, jsonify, request

from app.services import car_service
from app.services.query_builder import FilterValidationError

bp = Blueprint("cars", __name__)


@bp.get("/cars")
def list_cars():
    try:
        return jsonify(car_service.list_cars(request.args.to_dict()))
    except FilterValidationError as e:
        return jsonify({"error": str(e)}), 400
