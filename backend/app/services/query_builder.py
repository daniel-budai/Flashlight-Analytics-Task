from sqlalchemy import func

from app.extensions import db
from app.models import Car, PriceHistory


class FilterValidationError(ValueError):
    pass


SORT_COLUMNS = {
    "price": PriceHistory.price,
    "date": PriceHistory.date,
    "mileage": Car.mileage,
    "year": Car.year,
}


def parse_float(value, name: str) -> float:
    try:
        return float(value)
    except (TypeError, ValueError):
        raise FilterValidationError(f"Invalid {name}") from None


def parse_int_param(value, name: str) -> int:
    try:
        return int(value)
    except (TypeError, ValueError):
        raise FilterValidationError(f"Invalid {name}") from None


def parse_pagination(filters: dict) -> tuple[int, int]:
    page = filters.get("page")
    per_page = filters.get("per_page")

    try:
        page_num = max(1, int(page)) if page not in (None, "") else 1
    except (TypeError, ValueError):
        raise FilterValidationError("Invalid page") from None

    try:
        per_page_num = max(1, int(per_page)) if per_page not in (None, "") else 20
    except (TypeError, ValueError):
        raise FilterValidationError("Invalid per_page") from None

    return page_num, per_page_num


def build_query(filters: dict):
    latest_only = filters.get("latest_only", "false").lower() == "true"

    if latest_only:
        query = _latest_prices_query()
    else:
        query = db.session.query(Car, PriceHistory).join(
            PriceHistory, PriceHistory.car_id == Car.id
        )

    return apply_filters(query, filters)


def apply_filters(query, filters):
    if brands := filters.get("brand"):
        brand_list = [b.strip() for b in brands.split(",") if b.strip()]
        if brand_list:
            query = query.filter(Car.brand.in_(brand_list))

    if fuel := filters.get("fuel_type"):
        query = query.filter(Car.fuel_type == fuel)

    if model := filters.get("model"):
        query = query.filter(Car.model.ilike(f"%{model}%"))

    if price_min := filters.get("price_min"):
        query = query.filter(PriceHistory.price >= parse_float(price_min, "price_min"))

    if price_max := filters.get("price_max"):
        query = query.filter(PriceHistory.price <= parse_float(price_max, "price_max"))

    if mileage_min := filters.get("mileage_min"):
        query = query.filter(Car.mileage >= parse_float(mileage_min, "mileage_min"))

    if mileage_max := filters.get("mileage_max"):
        query = query.filter(Car.mileage <= parse_float(mileage_max, "mileage_max"))

    if year := filters.get("year"):
        query = query.filter(Car.year == parse_int_param(year, "year"))

    if year_min := filters.get("year_min"):
        query = query.filter(Car.year >= parse_int_param(year_min, "year_min"))

    if year_max := filters.get("year_max"):
        query = query.filter(Car.year <= parse_int_param(year_max, "year_max"))

    return query


def apply_sort(query, filters):
    sort = filters.get("sort", "date")
    order = filters.get("order", "desc")

    if sort not in SORT_COLUMNS:
        raise FilterValidationError(f"Invalid sort: {sort}")

    if order not in ("asc", "desc"):
        raise FilterValidationError(f"Invalid order: {order}")

    column = SORT_COLUMNS[sort]
    return query.order_by(column.asc() if order == "asc" else column.desc())


def _latest_prices_query():
    max_date_sq = (
        db.session.query(
            PriceHistory.car_id.label("car_id"),
            func.max(PriceHistory.date).label("max_date"),
        )
        .group_by(PriceHistory.car_id)
        .subquery()
    )

    latest_ph_sq = (
        db.session.query(
            PriceHistory.car_id.label("car_id"),
            func.max(PriceHistory.id).label("ph_id"),
        )
        .join(
            max_date_sq,
            (max_date_sq.c.car_id == PriceHistory.car_id)
            & (max_date_sq.c.max_date == PriceHistory.date),
        )
        .group_by(PriceHistory.car_id)
        .subquery()
    )

    return (
        db.session.query(Car, PriceHistory)
        .join(PriceHistory, PriceHistory.car_id == Car.id)
        .join(latest_ph_sq, PriceHistory.id == latest_ph_sq.c.ph_id)
    )
