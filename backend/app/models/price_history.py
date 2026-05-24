from datetime import UTC, datetime

from app.extensions import db


class PriceHistory(db.Model):
    __tablename__ = "price_history"

    id = db.Column(db.Integer, primary_key=True)
    car_id = db.Column(db.Integer, db.ForeignKey("cars.id"), nullable=False)
    price = db.Column(db.Float, nullable=False)
    date = db.Column(db.Date, nullable=False)
    source = db.Column(db.String(100))
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(UTC))

    __table_args__ = (
        db.UniqueConstraint("car_id", "date", "price", name="uq_price_snapshot"),
    )

    def to_dict(self):
        return {
            "id": self.id,
            "car_id": self.car_id,
            "price": self.price,
            "date": self.date.isoformat(),
            "source": self.source,
        }
