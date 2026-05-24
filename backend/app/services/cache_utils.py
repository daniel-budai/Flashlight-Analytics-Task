from app.extensions import cache


def invalidate_stats_cache() -> None:
    cache.clear()
