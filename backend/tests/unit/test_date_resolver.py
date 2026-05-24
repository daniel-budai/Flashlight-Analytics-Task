from datetime import date

from app.services.imports.date_resolver import parse_date, resolve_row_date


def test_parse_iso():
    assert parse_date("2024-01-15") == date(2024, 1, 15)


def test_parse_dmy_slash():
    assert parse_date("15/01/2024") == date(2024, 1, 15)


def test_parse_mdy_slash():
    assert parse_date("01/15/2024") == date(2024, 1, 15)


def test_parse_dmy_dash():
    assert parse_date("15-01-2024") == date(2024, 1, 15)


def test_parse_ymd_slash():
    assert parse_date("2024/01/15") == date(2024, 1, 15)


def test_parse_invalid_returns_none():
    assert parse_date("not-a-date") is None


def test_parse_empty_returns_none():
    assert parse_date("") is None


def test_resolve_present_date():
    row = {"date": "2024-01-15"}
    assert resolve_row_date(row) == date(2024, 1, 15)


def test_resolve_missing_key_returns_none():
    assert resolve_row_date({}) is None


def test_resolve_empty_string_returns_none():
    assert resolve_row_date({"date": ""}) is None


def test_resolve_none_value_returns_none():
    assert resolve_row_date({"date": None}) is None


def test_resolve_whitespace_returns_none():
    assert resolve_row_date({"date": "   "}) is None
