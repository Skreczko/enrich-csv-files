from functools import wraps
from http import HTTPStatus
from typing import Any

from django.core.cache import cache
from django.http import HttpRequest, JsonResponse

from decorators.form_validator import GenericFunc, WrapperFunc


def cache_view_response(timeout=60*60*12):
    """
        Decorator to cache the response of a view function.

        This decorator caches the JsonResponse of a view function for a specified
        timeout duration. If the response for a given request path and query parameters
        is already cached, it returns the cached data. Otherwise, it calls the original
        view function, caches its JsonResponse, and then returns the response.

        The cache key is constructed using the request's path and its query parameters.

        :param timeout: Duration for which the response should be cached, in seconds.
                        Default is 12 hours.
        :return: The cached JsonResponse if available, otherwise the original view function's response.

        Usage:
        ------
        @cache_view_response(timeout=3600)
        def my_view(request):
            ...
        """
    def decorator(view_func: GenericFunc) -> WrapperFunc:
        @wraps(view_func)  #to keep metadata
        def wrapper(request: HttpRequest, *args: Any, **kwargs: Any):
            cache_key = f"{request.path}_{request.GET.urlencode()}"

            cached_data = cache.get(cache_key)

            if cached_data:
                return JsonResponse(cached_data, status=HTTPStatus.OK)

            response = view_func(request, *args, **kwargs)

            if isinstance(response, JsonResponse):
                cache.set(cache_key, response.json(), timeout)

            return response

        return wrapper
    return decorator