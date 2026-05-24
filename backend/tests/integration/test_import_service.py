import io

from app.models import Car, ImportLog, PriceHistory
from app.services.imports.service import import_csv


def _file(content: str, name: str = "test.csv"):
    f = io.BytesIO(content.encode())
    f.filename = name
    return f


VALID_CSV = """brand,model,price,year,fuel_type,mileage,date
Toyota,Corolla,15000,2020,Petrol,45000,2024-01-15
BMW,320i,22000,2019,Diesel,60000,2024-03-10
"""


def test_import_creates_cars(app):
    result = import_csv(_file(VALID_CSV))
    assert result["imported"] == 2
    assert Car.query.count() == 2


def test_import_creates_price_history(app):
    import_csv(_file(VALID_CSV))
    assert PriceHistory.query.count() == 2


def test_import_creates_log(app):
    import_csv(_file(VALID_CSV, "myfile.csv"))
    log = ImportLog.query.first()
    assert log is not None
    assert log.filename == "myfile.csv"
    assert log.rows_ok == 2
    assert log.rows_error == 0


def test_import_skips_negative_price(app):
    csv = "brand,model,price,date\nToyota,Corolla,-500,2024-01-15\n"
    result = import_csv(_file(csv))
    assert result["imported"] == 0
    assert result["skipped"] == 1
    assert PriceHistory.query.count() == 0


def test_import_skips_missing_date(app):
    csv = "brand,model,price,date\nToyota,Corolla,15000,\n"
    result = import_csv(_file(csv))
    assert result["imported"] == 0
    assert result["skipped"] == 1


def test_import_deduplicates_within_file(app):
    csv = """brand,model,price,date
Toyota,Corolla,15000,2024-01-15
Toyota,Corolla,15000,2024-01-15
"""
    result = import_csv(_file(csv))
    assert result["imported"] == 1
    assert result["duplicates"] == 1


def test_import_deduplicates_across_uploads(app):
    csv = "brand,model,price,date\nToyota,Corolla,15000,2024-01-15\n"
    import_csv(_file(csv))
    result = import_csv(_file(csv))
    assert result["imported"] == 0
    assert result["duplicates"] == 1


def test_import_missing_columns_returns_error(app):
    csv = "brand,model\nToyota,Corolla\n"
    result = import_csv(_file(csv))
    assert "error" in result
    assert "price" in result["error"]


def test_import_reuses_existing_car(app):
    csv1 = "brand,model,price,date\nToyota,Corolla,15000,2024-01-15\n"
    csv2 = "brand,model,price,date\nToyota,Corolla,14500,2024-06-01\n"
    import_csv(_file(csv1))
    import_csv(_file(csv2))
    assert Car.query.count() == 1
    assert PriceHistory.query.count() == 2


def test_import_updates_mileage_if_missing(app):
    csv1 = "brand,model,price,date\nToyota,Corolla,15000,2024-01-15\n"
    csv2 = "brand,model,price,date,mileage\nToyota,Corolla,14500,2024-06-01,45000\n"
    import_csv(_file(csv1))
    import_csv(_file(csv2))
    car = Car.query.first()
    assert car.mileage == 45000
