from collections.abc import Callable
from http import HTTPStatus
from typing import TypeVar
from django.http import JsonResponse, HttpRequest, HttpResponse
from django import forms

T = TypeVar("T", bound=forms.Form)
GenericFunc = Callable[[HttpRequest, T], HttpResponse]
WrapperFunc = Callable[[HttpRequest], HttpResponse]


def validate_request_form(
    request_serializer: type[T],
) -> Callable[[GenericFunc], WrapperFunc]:
    """
    A decorator for validating the request data (POST or GET) using request_serializer (forms.Form).
    For valid form, wrapped function will be called. If not, returned JsonResponse with form errors.
    """

    def decorator(func: GenericFunc) -> WrapperFunc:
        def wrapper(request: HttpRequest) -> HttpResponse:
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

            return func(request, form)

        return wrapper

    return decorator
