from datetime import date

import pytest

from app.extensions import db
from app.models import Car
from app.services.imports.duplicate_checker import DuplicateChecker

D1 = date(2024, 1, 15)
D2 = date(2024, 6, 1)


@pytest.fixture
def car(app):
    c = Car(brand="Toyota", model="Corolla", year=2020, fuel_type="Petrol")
    db.session.add(c)
    db.session.flush()
    return c


@pytest.fixture
def checker(app):
    return DuplicateChecker()


def test_no_duplicate_initially(checker, car):
    assert checker.duplicate_reason(car.id, D1, 15000.0) is None


def test_duplicate_within_batch(checker, car):
    checker.add_price(car.id, 15000.0, D1, None)
    reason = checker.duplicate_reason(car.id, D1, 15000.0)
    assert reason is not None
    assert "duplicate" in reason.lower()


def test_different_date_not_duplicate(checker, car):
    checker.add_price(car.id, 15000.0, D1, None)
    assert checker.duplicate_reason(car.id, D2, 15000.0) is None


def test_different_price_not_duplicate(checker, car):
    checker.add_price(car.id, 15000.0, D1, None)
    assert checker.duplicate_reason(car.id, D1, 16000.0) is None


def test_different_car_not_duplicate(checker, car):
    other = Car(brand="BMW", model="320i", year=2019, fuel_type="Diesel")
    db.session.add(other)
    db.session.flush()
    checker.add_price(car.id, 15000.0, D1, None)
    assert checker.duplicate_reason(other.id, D1, 15000.0) is None
