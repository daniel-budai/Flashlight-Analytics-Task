import io


def test_import_success(import_fixture):
    r = import_fixture("valid.csv")
    assert r.status_code == 201
    body = r.get_json()
    assert body["imported"] == 3
    assert body["skipped"] == 0


def test_import_missing_columns(import_fixture):
    r = import_fixture("missing_columns.csv")
    assert r.status_code == 422
    assert "error" in r.get_json()


def test_import_invalid_prices(import_fixture):
    r = import_fixture("invalid_prices.csv")
    body = r.get_json()
    assert body["imported"] == 1
    assert body["skipped"] == 3


def test_import_duplicate_rows(import_fixture):
    r = import_fixture("duplicate_rows.csv")
    body = r.get_json()
    assert body["imported"] == 2
    assert body["duplicates"] == 1


def test_import_no_file(client):
    r = client.post("/api/import", data={}, content_type="multipart/form-data")
    assert r.status_code == 400


def test_import_non_csv(client):
    data = {"file": (io.BytesIO(b"hello"), "data.txt")}
    r = client.post("/api/import", data=data, content_type="multipart/form-data")
    assert r.status_code == 400


def test_import_returns_correct_shape(import_fixture):
    body = import_fixture("valid.csv").get_json()
    assert "imported" in body
    assert "skipped" in body
    assert "duplicates" in body
    assert "invalid_rows" in body
    assert "duplicate_rows" in body


def test_import_missing_date_is_skipped(import_csv):
    csv_data = """brand,model,price,year,fuel_type,mileage,date
Toyota,Corolla,15000,2020,Petrol,45000,
"""
    body = import_csv(csv_data).get_json()
    assert body["imported"] == 0
    assert body["skipped"] == 1
    assert any("date" in row["reason"].lower() for row in body["invalid_rows"])


def test_import_duplicate_rows_in_response(import_csv):
    csv_data = """brand,model,price,year,fuel_type,mileage,date
Toyota,Corolla,15000,2020,Petrol,45000,2024-01-15
"""
    import_csv(csv_data)
    body = import_csv(csv_data).get_json()
    assert body["imported"] == 0
    assert body["duplicates"] == 1
    assert len(body["duplicate_rows"]) == 1


def test_list_import_logs(import_fixture, client):
    import_fixture("valid.csv")
    logs = client.get("/api/imports").get_json()
    assert len(logs) == 1
    assert logs[0]["filename"] == "valid.csv"
    assert logs[0]["rows_ok"] == 3
