import hashlib
import json

from flask import current_app
from sqlalchemy import func

from app.extensions import cache
from app.models import Car, PriceHistory
from app.services.query_builder import build_query


def _stats_cache_key(filters: dict) -> str:
    raw = json.dumps(sorted(filters.items()), sort_keys=True)
    digest = hashlib.md5(raw.encode()).hexdigest()
    return f"stats:{digest}"


def get_stats(filters: dict | None = None) -> dict:
    filters = filters or {}
    key = _stats_cache_key(filters)
    cached = cache.get(key)
    if cached is not None:
        return cached

    result = _compute_stats(filters)
    timeout = current_app.config.get("CACHE_DEFAULT_TIMEOUT", 300)
    cache.set(key, result, timeout=timeout)
    return result


def _compute_stats(filters: dict) -> dict:
    query = build_query(filters)

    total_cars = query.with_entities(func.count(func.distinct(Car.id))).scalar() or 0
    total_prices = query.count()
    avg_price = query.with_entities(func.avg(PriceHistory.price)).scalar()
    min_price = query.with_entities(func.min(PriceHistory.price)).scalar()
    max_price = query.with_entities(func.max(PriceHistory.price)).scalar()

    by_brand = (
        query.with_entities(
            Car.brand, func.avg(PriceHistory.price).label("avg_price")
        )
        .group_by(Car.brand)
        .order_by(func.avg(PriceHistory.price).desc())
        .all()
    )

    by_fuel = (
        query.with_entities(
            Car.fuel_type, func.count(func.distinct(Car.id)).label("count")
        )
        .group_by(Car.fuel_type)
        .all()
    )

    return {
        "total_cars": total_cars,
        "total_prices": total_prices,
        "avg_price": round(float(avg_price), 2) if avg_price else None,
        "min_price": min_price,
        "max_price": max_price,
        "avg_by_brand": [
            {"brand": b, "avg_price": round(float(p), 2)} for b, p in by_brand
        ],
        "count_by_fuel": [{"fuel_type": f, "count": c} for f, c in by_fuel],
    }
