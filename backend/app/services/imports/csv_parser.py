import pandas as pd

COLUMN_ALIASES = {
    "registration_date": "date",
    "mileage_km": "mileage",
}


def parse_dataframe(file) -> tuple[pd.DataFrame | None, str | None]:
    try:
        df = pd.read_csv(file)
    except Exception as e:
        return None, f"Could not parse CSV: {e}"

    df.columns = [c.strip().lower().replace(" ", "_") for c in df.columns]
    df = _apply_aliases(df)
    return df, None


def _apply_aliases(df: pd.DataFrame) -> pd.DataFrame:
    rename = {
        old: new
        for old, new in COLUMN_ALIASES.items()
        if old in df.columns and new not in df.columns
    }
    if rename:
        df = df.rename(columns=rename)
    return df
