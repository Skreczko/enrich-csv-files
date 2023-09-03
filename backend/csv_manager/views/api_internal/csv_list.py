from http import HTTPStatus

from django.http import HttpRequest, JsonResponse
from django.views.decorators.http import require_GET

from csv_manager.forms import CSVListFileRequestForm
from csv_manager.models import CSVFile
from transformer.form_validator import validate_request_form


@require_GET
@validate_request_form(CSVListFileRequestForm)
def csv_list(
    request: HttpRequest, request_form: CSVListFileRequestForm
) -> JsonResponse:
    """
    Endpoint to upload CSV files
    """
    CSVFile.objects.all()
    return JsonResponse({"name": 1}, status=HTTPStatus.OK)
