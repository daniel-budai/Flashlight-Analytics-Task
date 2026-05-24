def csv_line_number(pandas_index: int) -> int:
    """Convert pandas row index to 1-based CSV line number (row 1 = header)."""
    return int(pandas_index) + 2
