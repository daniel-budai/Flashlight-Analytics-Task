from datetime import date

import pandas as pd

from app.extensions import db
from app.models import Car


def str_field(value) -> str | None:
    if value is None or pd.isna(value):
        return None
    return str(value).strip() or None


def resolve_year(row, row_date: date | None) -> int | None:
    if pd.notna(row.get("year")):
        return int(row["year"])
    if row_date:
        return row_date.year
    return None


def get_or_create_car(row, row_date: date | None = None) -> Car:
    year = resolve_year(row, row_date)
    fuel_type = str_field(row.get("fuel_type"))
    mileage = float(row["mileage"]) if pd.notna(row.get("mileage")) else None

    car = Car.query.filter_by(
        brand=str(row.get("brand", "")).strip(),
        model=str(row.get("model", "")).strip(),
        year=year,
        fuel_type=fuel_type,
    ).first()

    if not car:
        car = Car(
            brand=str(row.get("brand", "")).strip(),
            model=str(row.get("model", "")).strip(),
            year=year,
            fuel_type=fuel_type,
            mileage=mileage,
        )
        db.session.add(car)
        db.session.flush()
    elif mileage is not None and car.mileage is None:
        car.mileage = mileage

    return car
