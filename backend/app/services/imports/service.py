import json

from app.extensions import db
from app.models import ImportLog
from app.services.imports.car_resolver import get_or_create_car, str_field
from app.services.imports.csv_parser import parse_dataframe, parse_dataframe_from_path
from app.services.imports.date_resolver import resolve_row_date
from app.services.imports.duplicate_checker import DuplicateChecker
from app.services.imports.row_utils import csv_line_number
from app.services.imports.row_validator import check_columns, validate_row


def import_csv(file) -> dict:
    df, parse_error = parse_dataframe(file)
    if parse_error:
        return {"error": parse_error}

    return _process_dataframe(df, getattr(file, "filename", "unknown"))


def import_csv_from_path(path: str, filename: str = "unknown") -> dict:
    df, parse_error = parse_dataframe_from_path(path)
    if parse_error:
        return {"error": parse_error}

    return _process_dataframe(df, filename)


def _process_dataframe(df, filename: str) -> dict:
    col_error = check_columns(list(df.columns))
    if col_error:
        return {"error": col_error}

    rows_ok = 0
    rows_error = 0
    rows_duplicate = 0
    invalid_rows = []
    duplicate_rows = []
    checker = DuplicateChecker()

    for i, row in df.iterrows():
        line = csv_line_number(i)
        try:
            row_errors = validate_row(row, i)
            if row_errors:
                rows_error += 1
                invalid_rows.extend(row_errors)
                continue

            price = float(row["price"])
            row_date = resolve_row_date(row)
            if row_date is None:
                rows_error += 1
                invalid_rows.append(
                    {
                        "row": line,
                        "reason": f"Missing or unparseable date: {row.get('date')}",
                    }
                )
                continue

            source = str_field(row.get("source"))
            car = get_or_create_car(row, row_date)

            if reason := checker.duplicate_reason(car.id, row_date, price):
                rows_duplicate += 1
                duplicate_rows.append({"row": line, "reason": reason})
                continue

            checker.add_price(car.id, price, row_date, source)
            rows_ok += 1

        except Exception as e:
            rows_error += 1
            invalid_rows.append({"row": line, "reason": str(e)})

    all_errors = invalid_rows + duplicate_rows

    log = ImportLog(
        filename=filename,
        rows_ok=rows_ok,
        rows_error=rows_error + rows_duplicate,
        errors=json.dumps(all_errors[:50]),
    )
    db.session.add(log)
    db.session.commit()

    return {
        "imported": rows_ok,
        "skipped": rows_error,
        "duplicates": rows_duplicate,
        "invalid_rows": invalid_rows,
        "duplicate_rows": duplicate_rows,
        "errors": invalid_rows[:20],
    }
