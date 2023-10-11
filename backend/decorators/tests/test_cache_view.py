import json
from http import HTTPStatus

import pytest
from django.core.cache import cache
from django.http import HttpRequest, JsonResponse
from django.test import RequestFactory

from decorators.cache_view import cache_view_response

CACHED_DATA = {"data": "cached_data"}
NOT_CACHED_DATA = {"data": "not_cached_data"}
path = "/api/_internal/csv_list/11111111-aaaa-2222-cccc-333333333333/read_preview_chunk"


@pytest.mark.parametrize(
    "chunk_number,expected_response",
    [
        pytest.param(0, CACHED_DATA, id="cached"),
        pytest.param(1, NOT_CACHED_DATA, id="not cached"),
    ],
)
def test_cache_view_response(chunk_number: int, expected_response: dict[str, str]):
    # Clear cache to ensure clean state for the test
    cache.clear()
    # Set the cache for the test case
    cache_key = f"{path}?chunk_number=0"
    cache.set(cache_key, CACHED_DATA, 3600)

    @cache_view_response()
    def example_view(request: HttpRequest) -> JsonResponse:
        return JsonResponse(
            NOT_CACHED_DATA,
            status=HTTPStatus.OK,
        )

    request = RequestFactory().get(path, {"chunk_number": chunk_number})

    # Check if the response is from cache or from the view function
    response = example_view(request)
    assert json.loads(response.content) == expected_response

    if chunk_number == 0:
        # Clear cache to see the actual response from the view function
        cache.clear()
        response = example_view(request)
        assert json.loads(response.content) == NOT_CACHED_DATA

    # Check if the expected response is stored in the cache
    cached_response = cache.get(f"{path}?chunk_number={chunk_number}")
    assert cached_response == NOT_CACHED_DATA

    # Clear cache to ensure no side-effects for other tests
    cache.clear()
