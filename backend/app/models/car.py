from app.extensions import db


class Car(db.Model):
    __tablename__ = "cars"

    id = db.Column(db.Integer, primary_key=True)
    brand = db.Column(db.String(100), nullable=False)
    model = db.Column(db.String(100), nullable=False)
    year = db.Column(db.Integer)
    fuel_type = db.Column(db.String(50))
    mileage = db.Column(db.Float)

    prices = db.relationship("PriceHistory", backref="car", lazy=True)

    __table_args__ = (
        db.UniqueConstraint(
            "brand", "model", "year", "fuel_type", name="uq_car"
        ),
    )

    def to_dict(self):
        return {
            "id": self.id,
            "brand": self.brand,
            "model": self.model,
            "year": self.year,
            "fuel_type": self.fuel_type,
            "mileage": self.mileage,
        }
