import pandas as pd

from app.services.imports.row_utils import csv_line_number

REQUIRED_COLUMNS = {"brand", "model", "price"}


def check_columns(df_columns: list) -> str | None:
    missing = REQUIRED_COLUMNS - set(df_columns)
    if missing:
        return f"Missing required columns: {missing}"
    return None


def validate_row(row, index: int) -> list:
    line = csv_line_number(index)
    problems = []
    raw_price = row.get("price")
    if raw_price is None or pd.isna(raw_price) or str(raw_price).strip() == "":
        problems.append({"row": line, "reason": "Missing price"})
    else:
        try:
            if float(raw_price) < 0:
                problems.append({"row": line, "reason": "Negative price"})
        except (ValueError, TypeError):
            problems.append(
                {"row": line, "reason": f"Invalid price: {row.get('price')}"}
            )

    if not row.get("brand") or pd.isna(row.get("brand")):
        problems.append({"row": line, "reason": "Missing brand"})
    if not row.get("model") or pd.isna(row.get("model")):
        problems.append({"row": line, "reason": "Missing model"})

    return problems
