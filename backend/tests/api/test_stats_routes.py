def test_stats_empty_db(client):
    body = client.get("/api/stats").get_json()
    assert body["total_cars"] == 0
    assert body["avg_price"] is None


def test_stats_shape(import_fixture, client):
    import_fixture("valid.csv")
    body = client.get("/api/stats").get_json()
    assert "total_cars" in body
    assert "total_prices" in body
    assert "avg_price" in body
    assert "min_price" in body
    assert "max_price" in body
    assert "avg_by_brand" in body
    assert "count_by_fuel" in body


def test_stats_correct_totals(import_fixture, client):
    import_fixture("valid.csv")
    body = client.get("/api/stats").get_json()
    assert body["total_cars"] == 3
    assert body["total_prices"] == 3


def test_stats_filter_by_brand(import_fixture, client):
    import_fixture("valid.csv")
    body = client.get("/api/stats?brand=Toyota").get_json()
    assert body["total_cars"] == 1


def test_stats_latest_only(import_fixture, client):
    import_fixture("duplicate_rows.csv")
    body = client.get("/api/stats?latest_only=true").get_json()
    assert body["total_prices"] == 2


def test_stats_respects_filters(import_csv, client):
    csv_data = """brand,model,price,year,fuel_type,mileage,date
Toyota,Corolla,15000,2020,Petrol,45000,2024-01-15
Toyota,Corolla,14500,2020,Petrol,45000,2024-06-01
BMW,320i,22000,2019,Diesel,60000,2024-03-10
"""
    import_csv(csv_data)
    stats = client.get("/api/stats?latest_only=true&brand=Toyota").get_json()
    assert stats["total_cars"] == 1
    assert stats["total_prices"] == 1


def test_stats_invalid_filter_returns_400(client):
    r = client.get("/api/stats?price_min=bad")
    assert r.status_code == 400
