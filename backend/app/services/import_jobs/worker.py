from concurrent.futures import ThreadPoolExecutor

_executor: ThreadPoolExecutor | None = None


def get_executor() -> ThreadPoolExecutor:
    global _executor
    if _executor is None:
        _executor = ThreadPoolExecutor(max_workers=2, thread_name_prefix="import")
    return _executor


def run_in_background(fn, *args, **kwargs) -> None:
    get_executor().submit(fn, *args, **kwargs)
