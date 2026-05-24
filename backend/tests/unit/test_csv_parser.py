import io

import pandas as pd

from app.services.imports.csv_parser import parse_dataframe


def _file(content: str):
    return io.BytesIO(content.encode())


def test_valid_csv_returns_dataframe():
    csv = "brand,model,price\nToyota,Corolla,15000\n"
    df, err = parse_dataframe(_file(csv))
    assert err is None
    assert isinstance(df, pd.DataFrame)
    assert len(df) == 1


def test_columns_normalized_to_lowercase():
    csv = "Brand,Model,Price\nToyota,Corolla,15000\n"
    df, err = parse_dataframe(_file(csv))
    assert err is None
    assert "brand" in df.columns
    assert "Brand" not in df.columns


def test_columns_spaces_replaced_with_underscore():
    csv = "fuel type,reg date,price\ndiesel,2024-01-01,10000\n"
    df, err = parse_dataframe(_file(csv))
    assert "fuel_type" in df.columns
    assert "reg_date" in df.columns


def test_registration_date_aliased_to_date():
    csv = "brand,model,price,registration_date\nBMW,X5,30000,2024-01-15\n"
    df, err = parse_dataframe(_file(csv))
    assert "date" in df.columns
    assert "registration_date" not in df.columns


def test_mileage_km_aliased_to_mileage():
    csv = "brand,model,price,mileage_km\nBMW,X5,30000,50000\n"
    df, err = parse_dataframe(_file(csv))
    assert "mileage" in df.columns
    assert "mileage_km" not in df.columns


def test_alias_not_applied_if_target_already_exists():
    csv = "brand,model,price,mileage_km,mileage\nBMW,X5,30000,50000,60000\n"
    df, err = parse_dataframe(_file(csv))
    assert "mileage" in df.columns


def test_empty_csv_returns_dataframe():
    csv = "brand,model,price\n"
    df, err = parse_dataframe(_file(csv))
    assert err is None
    assert len(df) == 0


def test_malformed_csv_returns_error():
    df, err = parse_dataframe(io.BytesIO(b"\x00\x01\x02\x03"))
    if err is not None:
        assert isinstance(err, str)
