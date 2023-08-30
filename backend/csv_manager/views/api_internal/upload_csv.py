from http import HTTPStatus

from django.http import JsonResponse
from django.views.decorators.http import require_POST
from requests import Request


@require_POST
def upload_csv(request: Request) -> JsonResponse:
    return JsonResponse({"test": "test"}, status=HTTPStatus.OK)
