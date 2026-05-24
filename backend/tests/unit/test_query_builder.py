import pytest

from app.services.query_builder import (
    FilterValidationError,
    parse_float,
    parse_int_param,
    parse_pagination,
)


def test_parse_float_integer_string():
    assert parse_float("15000", "price") == 15000.0


def test_parse_float_decimal():
    assert parse_float("3.14", "x") == pytest.approx(3.14)


def test_parse_float_invalid_raises():
    with pytest.raises(FilterValidationError, match="price_min"):
        parse_float("abc", "price_min")


def test_parse_float_none_raises():
    with pytest.raises(FilterValidationError):
        parse_float(None, "price")


def test_parse_int_valid():
    assert parse_int_param("2020", "year") == 2020


def test_parse_int_invalid_raises():
    with pytest.raises(FilterValidationError, match="year"):
        parse_int_param("xyz", "year")


def test_pagination_defaults():
    assert parse_pagination({}) == (1, 20)


def test_pagination_custom_values():
    assert parse_pagination({"page": "3", "per_page": "50"}) == (3, 50)


def test_pagination_clamps_page_below_one():
    page, _ = parse_pagination({"page": "0"})
    assert page == 1


def test_pagination_clamps_per_page_below_one():
    _, per_page = parse_pagination({"per_page": "0"})
    assert per_page == 1


def test_pagination_invalid_page_raises():
    with pytest.raises(FilterValidationError):
        parse_pagination({"page": "abc"})


def test_pagination_invalid_per_page_raises():
    with pytest.raises(FilterValidationError):
        parse_pagination({"per_page": "abc"})


def test_pagination_empty_strings_use_defaults():
    assert parse_pagination({"page": "", "per_page": ""}) == (1, 20)
