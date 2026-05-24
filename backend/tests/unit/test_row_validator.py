import pandas as pd
import pytest

from app.services.imports.row_validator import check_columns, validate_row


def _row(**kwargs):
    """Build a minimal valid pandas Series, overridable per test."""
    defaults = {"brand": "Toyota", "model": "Corolla", "price": "15000"}
    return pd.Series({**defaults, **kwargs})


def test_valid_row_has_no_errors():
    assert validate_row(_row(), 0) == []


def test_negative_price():
    errors = validate_row(_row(price="-100"), 0)
    assert len(errors) == 1
    assert "negative" in errors[0]["reason"].lower()


def test_invalid_price_string():
    errors = validate_row(_row(price="abc"), 0)
    assert any("invalid" in e["reason"].lower() for e in errors)


def test_missing_price_empty_string():
    errors = validate_row(_row(price=""), 0)
    assert any("price" in e["reason"].lower() for e in errors)


def test_zero_price_is_valid():
    assert validate_row(_row(price="0"), 0) == []


def test_missing_brand():
    errors = validate_row(_row(brand=""), 0)
    assert any("brand" in e["reason"].lower() for e in errors)


def test_missing_model():
    errors = validate_row(_row(model=""), 0)
    assert any("model" in e["reason"].lower() for e in errors)


def test_multiple_errors_returned():
    errors = validate_row(_row(brand="", model="", price=""), 0)
    assert len(errors) >= 2


def test_line_number_is_human_readable():
    errors = validate_row(_row(price=""), 0)
    assert errors[0]["row"] == 2


def test_line_number_increments():
    errors_row0 = validate_row(_row(price=""), 0)
    errors_row1 = validate_row(_row(price=""), 1)
    assert errors_row1[0]["row"] == errors_row0[0]["row"] + 1


def test_check_columns_all_present():
    assert check_columns(["brand", "model", "price", "date"]) is None


def test_check_columns_missing_price():
    result = check_columns(["brand", "model"])
    assert result is not None
    assert "price" in result


def test_check_columns_missing_multiple():
    result = check_columns(["brand"])
    assert "model" in result or "price" in result
