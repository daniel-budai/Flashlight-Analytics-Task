from app.services.cache_utils import invalidate_stats_cache
from app.services import stats_service


def test_stats_response_is_cached(import_fixture, client, monkeypatch):
    import_fixture("valid.csv")
    call_count = 0
    original = stats_service._compute_stats

    def counting(filters):
        nonlocal call_count
        call_count += 1
        return original(filters)

    monkeypatch.setattr(stats_service, "_compute_stats", counting)

    client.get("/api/stats")
    client.get("/api/stats")
    assert call_count == 1


def test_stats_cache_invalidated_on_sync_import(import_fixture, client, monkeypatch):
    import_fixture("valid.csv")
    call_count = 0
    original = stats_service._compute_stats

    def counting(filters):
        nonlocal call_count
        call_count += 1
        return original(filters)

    monkeypatch.setattr(stats_service, "_compute_stats", counting)

    client.get("/api/stats")
    assert call_count == 1

    import_fixture("valid.csv")
    client.get("/api/stats")
    assert call_count == 2


def test_invalidate_stats_cache_clears_entries(import_fixture, client, monkeypatch):
    import_fixture("valid.csv")
    call_count = 0
    original = stats_service._compute_stats

    def counting(filters):
        nonlocal call_count
        call_count += 1
        return original(filters)

    monkeypatch.setattr(stats_service, "_compute_stats", counting)

    client.get("/api/stats")
    assert call_count == 1

    invalidate_stats_cache()
    client.get("/api/stats")
    assert call_count == 2
