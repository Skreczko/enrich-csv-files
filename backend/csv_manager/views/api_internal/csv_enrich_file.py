from http import HTTPStatus
from json import JSONDecodeError

import requests
from django.http import HttpRequest, JsonResponse
from django.views.decorators.http import require_POST

from csv_manager.forms import CSVEnrichFileRequestForm
from csv_manager.models import EnrichDetail
from transformer.form_validator import validate_request_form


@require_POST
@validate_request_form(CSVEnrichFileRequestForm)
def csv_enrich_file(
    request: HttpRequest, request_form: CSVEnrichFileRequestForm, uuid: str
) -> JsonResponse:
    """
    Note:
        - As we enrich CSV file, I assume that response from external_url will contain list of dicts. There might be a need to handle other cases
    """

    external_url = request_form.cleaned_data["external_url"]
    external_response = requests.get(external_url)
    try:
        data_json = external_response.json()
    except JSONDecodeError:
        return JsonResponse(
            {"error": f"URL is not JSON"}, status=HTTPStatus.BAD_REQUEST
        )

    data_json_keys = list(data_json[0].keys()) if data_json else []

    enrich_model, _ = EnrichDetail.objects.get_or_create(
        csv_file_id=uuid, external_url=external_url, external_response=data_json
    )

    return JsonResponse(
        {"external_url_keys": data_json_keys, "enrich_detail_id": enrich_model.id},
        status=HTTPStatus.OK,
    )
