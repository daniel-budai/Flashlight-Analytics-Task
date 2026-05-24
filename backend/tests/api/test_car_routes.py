def test_list_cars_empty(client):
    body = client.get("/api/cars").get_json()
    assert body["total"] == 0
    assert body["data"] == []


def test_list_cars_returns_paginated_shape(import_fixture, client):
    import_fixture("valid.csv")
    body = client.get("/api/cars").get_json()
    assert "data" in body
    assert "total" in body
    assert "page" in body
    assert "per_page" in body
    assert "pages" in body


def test_filter_brand(import_fixture, client):
    import_fixture("valid.csv")
    body = client.get("/api/cars?brand=Toyota").get_json()
    assert all(c["brand"] == "Toyota" for c in body["data"])


def test_filter_multiple_brands(import_fixture, client):
    import_fixture("valid.csv")
    body = client.get("/api/cars?brand=Toyota,BMW").get_json()
    brands = {c["brand"] for c in body["data"]}
    assert brands <= {"Toyota", "BMW"}


def test_filter_price_min(import_fixture, client):
    import_fixture("valid.csv")
    body = client.get("/api/cars?price_min=20000").get_json()
    assert all(c["price"] >= 20000 for c in body["data"])


def test_filter_price_max(import_fixture, client):
    import_fixture("valid.csv")
    body = client.get("/api/cars?price_max=16000").get_json()
    assert all(c["price"] <= 16000 for c in body["data"])


def test_filter_latest_only(import_fixture, client):
    import_fixture("duplicate_rows.csv")
    body = client.get("/api/cars?latest_only=true").get_json()
    assert body["total"] == 2


def test_filter_model(import_csv, client):
    csv_data = """brand,model,price,year,fuel_type,mileage,date
Toyota,Corolla,15000,2020,Petrol,45000,2024-01-15
BMW,320i,22000,2019,Diesel,60000,2024-03-10
"""
    import_csv(csv_data)
    body = client.get("/api/cars?latest_only=true&model=320").get_json()
    assert body["total"] == 1
    assert body["data"][0]["model"] == "320i"


def test_latest_only_deduplicates_same_date(import_csv, client):
    csv_data = """brand,model,price,year,fuel_type,mileage,date,source
Mercedes,E220,27500,2022,diesel,31000,2022-01-11,siteB
Mercedes,E220,27800,2022,diesel,31000,2022-01-11,siteD
"""
    import_csv(csv_data)
    body = client.get("/api/cars?latest_only=true").get_json()
    assert body["total"] == 1
    assert len(body["data"]) == 1
    assert body["data"][0]["source"] == "siteD"
    assert body["data"][0]["price"] == 27800


def test_sort_price_desc(import_fixture, client):
    import_fixture("valid.csv")
    body = client.get("/api/cars?sort=price&order=desc").get_json()
    prices = [c["price"] for c in body["data"]]
    assert prices == sorted(prices, reverse=True)


def test_pagination(import_fixture, client):
    import_fixture("valid.csv")
    body = client.get("/api/cars?page=1&per_page=2").get_json()
    assert len(body["data"]) == 2
    assert body["pages"] == 2


def test_invalid_price_min_returns_400(import_fixture, client):
    import_fixture("valid.csv")
    r = client.get("/api/cars?price_min=abc")
    assert r.status_code == 400
    assert "price_min" in r.get_json()["error"]


def test_invalid_sort_returns_400(client):
    r = client.get("/api/cars?sort=nonsense")
    assert r.status_code == 400


def test_date_formats_imported_correctly(import_fixture, client):
    import_fixture("date_formats.csv")
    body = client.get("/api/cars").get_json()
    assert body["total"] == 4
