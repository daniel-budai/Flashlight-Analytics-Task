import io

from app.services.car_service import list_cars
from app.services.imports.service import import_csv


def _file(content: str):
    f = io.BytesIO(content.encode())
    f.filename = "test.csv"
    return f


SAMPLE_CSV = """brand,model,price,year,fuel_type,mileage,date
Toyota,Corolla,15000,2020,Petrol,45000,2024-01-15
Toyota,Corolla,14500,2020,Petrol,45000,2024-06-01
BMW,320i,22000,2019,Diesel,60000,2024-03-10
Audi,A4,25000,2021,Petrol,30000,2024-02-01
"""


def _seed(app):
    import_csv(_file(SAMPLE_CSV))


def test_list_all_returns_all_price_records(app):
    _seed(app)
    result = list_cars({})
    assert result["total"] == 4


def test_latest_only_deduplicates_toyota(app):
    _seed(app)
    result = list_cars({"latest_only": "true"})
    assert result["total"] == 3


def test_filter_by_brand(app):
    _seed(app)
    result = list_cars({"brand": "Toyota", "latest_only": "true"})
    assert result["total"] == 1
    assert result["data"][0]["brand"] == "Toyota"


def test_filter_by_multiple_brands(app):
    _seed(app)
    result = list_cars({"brand": "Toyota,BMW", "latest_only": "true"})
    assert result["total"] == 2


def test_filter_by_fuel_type(app):
    _seed(app)
    result = list_cars({"fuel_type": "Diesel", "latest_only": "true"})
    assert result["total"] == 1


def test_filter_price_min(app):
    _seed(app)
    result = list_cars({"price_min": "20000", "latest_only": "true"})
    assert all(car["price"] >= 20000 for car in result["data"])


def test_filter_price_max(app):
    _seed(app)
    result = list_cars({"price_max": "16000"})
    assert all(car["price"] <= 16000 for car in result["data"])


def test_filter_price_range(app):
    _seed(app)
    result = list_cars({"price_min": "14000", "price_max": "16000"})
    assert all(14000 <= car["price"] <= 16000 for car in result["data"])


def test_sort_price_desc(app):
    _seed(app)
    result = list_cars({"sort": "price", "order": "desc"})
    prices = [c["price"] for c in result["data"]]
    assert prices == sorted(prices, reverse=True)


def test_sort_price_asc(app):
    _seed(app)
    result = list_cars({"sort": "price", "order": "asc"})
    prices = [c["price"] for c in result["data"]]
    assert prices == sorted(prices)


def test_pagination_first_page(app):
    _seed(app)
    result = list_cars({"page": "1", "per_page": "2"})
    assert len(result["data"]) == 2
    assert result["pages"] == 2


def test_pagination_no_overlap(app):
    _seed(app)
    p1 = list_cars({"page": "1", "per_page": "2", "latest_only": "true"})
    p2 = list_cars({"page": "2", "per_page": "2", "latest_only": "true"})
    ids1 = {c["id"] for c in p1["data"]}
    ids2 = {c["id"] for c in p2["data"]}
    assert ids1.isdisjoint(ids2)


def test_empty_db_returns_empty(app):
    result = list_cars({})
    assert result["total"] == 0
    assert result["data"] == []
