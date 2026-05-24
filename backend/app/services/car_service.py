import math

from app.models import Car, PriceHistory
from app.services.query_builder import (
    FilterValidationError,
    apply_sort,
    build_query,
    parse_pagination,
)

__all__ = ["FilterValidationError", "list_cars"]


def list_cars(filters: dict) -> dict:
    page, per_page = parse_pagination(filters)

    query = build_query(filters)
    total = query.count()
    pages = max(1, math.ceil(total / per_page)) if total else 1
    page = min(page, pages)

    results = (
        apply_sort(query, filters)
        .offset((page - 1) * per_page)
        .limit(per_page)
        .all()
    )

    return {
        "data": [_merge(car, ph) for car, ph in results],
        "total": total,
        "page": page,
        "per_page": per_page,
        "pages": pages,
    }


def _merge(car: Car, ph: PriceHistory) -> dict:
    return {
        "id": car.id,
        "brand": car.brand,
        "model": car.model,
        "price": ph.price,
        "registration_date": ph.date.isoformat(),
        "mileage_km": car.mileage,
        "fuel_type": car.fuel_type,
        "source": ph.source,
        "year": car.year,
    }
