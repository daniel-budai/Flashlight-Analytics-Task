import io

from app.services.imports.service import import_csv
from app.services.stats_service import get_stats


def _file(content: str):
    f = io.BytesIO(content.encode())
    f.filename = "test.csv"
    return f


SAMPLE_CSV = """brand,model,price,year,fuel_type,mileage,date
Toyota,Corolla,15000,2020,Petrol,45000,2024-01-15
Toyota,Corolla,14500,2020,Petrol,45000,2024-06-01
BMW,320i,22000,2019,Diesel,60000,2024-03-10
"""


def test_stats_total_cars(app):
    import_csv(_file(SAMPLE_CSV))
    stats = get_stats({})
    assert stats["total_cars"] == 2


def test_stats_total_prices(app):
    import_csv(_file(SAMPLE_CSV))
    stats = get_stats({})
    assert stats["total_prices"] == 3


def test_stats_min_max(app):
    import_csv(_file(SAMPLE_CSV))
    stats = get_stats({})
    assert stats["min_price"] == 14500
    assert stats["max_price"] == 22000


def test_stats_avg_price(app):
    import_csv(_file(SAMPLE_CSV))
    stats = get_stats({})
    expected = round((15000 + 14500 + 22000) / 3, 2)
    assert stats["avg_price"] == expected


def test_stats_by_brand(app):
    import_csv(_file(SAMPLE_CSV))
    stats = get_stats({})
    brands = {item["brand"] for item in stats["avg_by_brand"]}
    assert "Toyota" in brands
    assert "BMW" in brands


def test_stats_by_fuel(app):
    import_csv(_file(SAMPLE_CSV))
    stats = get_stats({})
    fuels = {item["fuel_type"] for item in stats["count_by_fuel"]}
    assert "Petrol" in fuels
    assert "Diesel" in fuels


def test_stats_filter_by_brand(app):
    import_csv(_file(SAMPLE_CSV))
    stats = get_stats({"brand": "BMW"})
    assert stats["total_cars"] == 1
    assert stats["avg_price"] == 22000.0


def test_stats_latest_only(app):
    import_csv(_file(SAMPLE_CSV))
    stats = get_stats({"latest_only": "true"})
    assert stats["total_prices"] == 2


def test_stats_empty_db(app):
    stats = get_stats({})
    assert stats["total_cars"] == 0
    assert stats["avg_price"] is None
