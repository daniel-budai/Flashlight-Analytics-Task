from datetime import date

import pandas as pd

DATE_FORMATS = [
    "%Y-%m-%d",
    "%d/%m/%Y",
    "%m/%d/%Y",
    "%d-%m-%Y",
    "%Y/%m/%d",
]


def parse_date(value: str) -> date | None:
    if not value or str(value).strip() == "":
        return None
    for fmt in DATE_FORMATS:
        try:
            return pd.to_datetime(value, format=fmt).date()
        except Exception:
            continue
    return None


def resolve_row_date(row) -> date | None:
    raw_date = row.get("date")
    if raw_date is None or pd.isna(raw_date) or str(raw_date).strip() == "":
        return None
    return parse_date(str(raw_date))
