import io
import os

import pytest

from app import create_app
from app.extensions import db as _db

FIXTURES_DIR = os.path.join(os.path.dirname(__file__), "fixtures")


@pytest.fixture(scope="function")
def app():
    app = create_app("testing")
    with app.app_context():
        _db.create_all()
        yield app
        _db.session.remove()
        _db.drop_all()


@pytest.fixture
def client(app):
    return app.test_client()


@pytest.fixture
def db(app):
    return _db


@pytest.fixture
def fixture_file():
    """Return the absolute path to a file in tests/fixtures/."""

    def _get(name: str) -> str:
        return os.path.join(FIXTURES_DIR, name)

    return _get


@pytest.fixture
def import_csv(client):
    """POST a CSV string directly to the import endpoint."""

    def _import(csv_data: str, filename: str = "test.csv"):
        data = {"file": (io.BytesIO(csv_data.encode()), filename)}
        return client.post(
            "/api/import", data=data, content_type="multipart/form-data"
        )

    return _import


@pytest.fixture
def import_fixture(client, fixture_file):
    """POST a CSV file from tests/fixtures/ to the import endpoint."""

    def _import(name: str):
        path = fixture_file(name)
        with open(path, "rb") as f:
            content = f.read()
        data = {"file": (io.BytesIO(content), name)}
        return client.post(
            "/api/import", data=data, content_type="multipart/form-data"
        )

    return _import
