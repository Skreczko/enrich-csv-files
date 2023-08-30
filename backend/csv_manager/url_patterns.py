import importlib
from collections.abc import Callable
from typing import Any


def lazy_function_view(path: str) -> Callable:
    def load(*args: Any, **kwargs: Any) -> Callable:
        module_name, function_name = path.rsplit(".", 1)
        module = importlib.import_module(module_name)
        func = getattr(module, function_name)
        return func(*args, **kwargs)

    return load
