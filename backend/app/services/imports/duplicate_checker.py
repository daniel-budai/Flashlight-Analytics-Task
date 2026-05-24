from datetime import date

from app.extensions import db
from app.models import PriceHistory


class DuplicateChecker:
    """Tracks duplicates within a batch and against existing DB records."""

    def __init__(self):
        self._seen: set[tuple[int, date, float]] = set()

    def duplicate_reason(
        self, car_id: int, row_date: date, price: float
    ) -> str | None:
        key = (car_id, row_date, price)
        if key in self._seen:
            return "Duplicate row in file"

        exists = PriceHistory.query.filter_by(
            car_id=car_id,
            price=price,
            date=row_date,
        ).first()
        if exists:
            return "Duplicate price record"

        return None

    def add_price(
        self, car_id: int, price: float, row_date: date, source: str | None
    ) -> None:
        db.session.add(
            PriceHistory(car_id=car_id, price=price, date=row_date, source=source)
        )
        db.session.flush()
        self._seen.add((car_id, row_date, price))
