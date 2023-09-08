import importlib
from collections.abc import Callable
from typing import Any


def lazy_function_view(path: str) -> Callable:
    """
    Lazily loads a function from a given module path.

    :param path: Full path of the function to be loaded (ie. 'module.submodule.function').
    :return: A callable that, when called with arguments, will import the module,
             and call the function with the provided arguments.

    Example:
        lazy_view = lazy_function_view('myapp.views.my_view')
        response = lazy_view(request)
    """

    def load(*args: Any, **kwargs: Any) -> Callable:
        module_name, function_name = path.rsplit(".", 1)
        module = importlib.import_module(module_name)
        func = getattr(module, function_name)
        return func(*args, **kwargs)

    return load
