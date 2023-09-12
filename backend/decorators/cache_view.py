import json
from collections.abc import Callable
from functools import wraps
from http import HTTPStatus
from typing import Any

from django.core.cache import cache
from django.http import HttpRequest, HttpResponse, JsonResponse
from sentry_sdk import capture_exception

GenericFuncCache = Callable[[HttpRequest, Any, Any], HttpResponse]
WrapperFuncCache = Callable[[HttpRequest, Any, Any], HttpResponse]


def cache_view_response(
    timeout: int = 60 * 60 * 12,
) -> Callable[
    [GenericFuncCache], WrapperFuncCache
]:  # ie. 12 hours - should be set due to app usage by users
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

    Note:
    - A custom caching mechanism was used instead of Django's built-in @cache_page() because any
      unmatched path in urls.py is redirected with an HTTP 200 status to React, where further
      handling occurs. Django's default behavior would cache these redirects, which is undesirable
      in this context.
    - This decorator is specifically designed for JsonResponse. If the response is not a JsonResponse,
      it will bypass the caching mechanism and directly return the original response.
    - In case of any exception during caching, the decorator will bypass the cache and return the
      original response. This ensures that the end user always receives a response even if there's
      an issue with the caching mechanism.

    Usage:
    ------
    @cache_view_response(timeout=3600)
    def my_view(request):
        ...
    """

    def decorator(view_func: GenericFuncCache) -> WrapperFuncCache:
        @wraps(view_func)  # to keep metadata
        def wrapper(request: HttpRequest, *args: Any, **kwargs: Any) -> HttpResponse:
            cache_key = f"{request.path}_{request.GET.urlencode()}"

            try:
                cached_data = cache.get(cache_key)
                if cached_data:
                    return JsonResponse(cached_data, status=HTTPStatus.OK)

                response = view_func(request, *args, **kwargs)

                if isinstance(response, JsonResponse):
                    cache.set(cache_key, json.loads(response.content), timeout)

            except Exception as e:
                capture_exception(e)
                response = view_func(request, *args, **kwargs)

            return response

        return wrapper

    return decorator
