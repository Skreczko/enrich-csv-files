from collections.abc import Callable
from functools import wraps
from http import HTTPStatus
from typing import Any, TypeVar
from django.http import JsonResponse, HttpRequest, HttpResponse
from django import forms

from csv_manager.types import GenericFunc, WrapperFunc

T = TypeVar("T", bound=forms.Form)


def validate_request_form(
    request_serializer: type[T],
) -> Callable[[GenericFunc], WrapperFunc]:
    """
    A decorator for validating the request data (POST or GET) using a form class.
    This decorator checks if the request data is valid according to the form class specified in request_serializer.
    If the data is valid, it calls the wrapped function. Otherwise, it returns a JsonResponse with the form errors.

    The wrapped function can accept additional arguments and keyword arguments. These will be passed through by the
    decorator. (ie. id or uuid, like "/csv_list/<uuid:uuid>")

    :param request_serializer: Form class (subclass of forms.Form) used for validating the request data.
    :return: Callable wrapper function.

    Usage:
    ------
    @validate_request_form(request_serializer=ExampleForm)
    def my_view(request, request_form=ExampleForm, *args, **kwargs):
        ...
    """

    def decorator(func: GenericFunc) -> WrapperFunc:
        @wraps(func)  # to keep metadata
        def wrapper(request: HttpRequest, *args: Any, **kwargs: Any) -> HttpResponse:
            if request.method == "POST":
                form = request_serializer(data=request.POST, files=request.FILES)
            elif request.method == "GET":
                form = request_serializer(data=request.GET)
            else:
                return JsonResponse(
                    {"error": f"Method {request.method} not implemented"},
                    status=HTTPStatus.NOT_IMPLEMENTED,
                )

            if not form.is_valid():
                return JsonResponse(
                    {"error": form.errors}, status=HTTPStatus.BAD_REQUEST
                )

            return func(request, form, *args, **kwargs)

        return wrapper

    return decorator
