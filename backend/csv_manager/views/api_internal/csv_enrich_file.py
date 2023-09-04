from http import HTTPStatus

from django.http import HttpRequest, JsonResponse
from django.views.decorators.http import require_POST

from csv_manager.forms import CSVEnrichFileRequestForm
from csv_manager.models import CSVFile
from transformer.form_validator import validate_request_form


@require_POST
@validate_request_form(CSVEnrichFileRequestForm)
def csv_enrich_file(
    request: HttpRequest, request_form: CSVEnrichFileRequestForm
) -> JsonResponse:
    """
    """


    return JsonResponse({}, status=HTTPStatus.OK)
