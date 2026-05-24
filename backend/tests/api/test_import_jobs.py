import io

import pytest


@pytest.fixture
def async_client(app, monkeypatch):
    app.config["SYNC_IMPORTS"] = False
    monkeypatch.setattr(
        "app.services.import_jobs.service.run_in_background",
        lambda fn, *args, **kwargs: fn(*args, **kwargs),
    )
    return app.test_client()


def test_async_import_returns_202(async_client, fixture_file):
    path = fixture_file("valid.csv")
    with open(path, "rb") as f:
        content = f.read()
    data = {"file": (io.BytesIO(content), "valid.csv")}
    r = async_client.post("/api/import", data=data, content_type="multipart/form-data")
    assert r.status_code == 202
    body = r.get_json()
    assert "job_id" in body
    assert body["status"] == "pending"


def test_get_import_job_completed(async_client, fixture_file):
    path = fixture_file("valid.csv")
    with open(path, "rb") as f:
        content = f.read()
    data = {"file": (io.BytesIO(content), "valid.csv")}
    r = async_client.post("/api/import", data=data, content_type="multipart/form-data")
    job_id = r.get_json()["job_id"]

    job = async_client.get(f"/api/imports/jobs/{job_id}").get_json()
    assert job["status"] == "completed"
    assert job["result"]["imported"] == 3


def test_get_import_job_not_found(client):
    r = client.get("/api/imports/jobs/9999")
    assert r.status_code == 404
    assert "error" in r.get_json()


def test_async_import_failed_job(async_client):
    data = {"file": (io.BytesIO(b"brand,model\nToyota,Corolla"), "bad.csv")}
    r = async_client.post("/api/import", data=data, content_type="multipart/form-data")
    job_id = r.get_json()["job_id"]

    job = async_client.get(f"/api/imports/jobs/{job_id}").get_json()
    assert job["status"] == "failed"
    assert "error" in job
