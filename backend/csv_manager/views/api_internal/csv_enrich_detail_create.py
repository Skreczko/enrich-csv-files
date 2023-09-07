import json
from http import HTTPStatus

import requests
from django.http import HttpRequest, JsonResponse
from django.views.decorators.http import require_POST

from csv_manager.forms import CSVEnrichDetailCreateRequestForm
from csv_manager.models import CSVFile, EnrichDetail
from decorators.form_validator import validate_request_form


@require_POST
@validate_request_form(CSVEnrichDetailCreateRequestForm)
def csv_enrich_detail_create(
    request: HttpRequest, request_form: CSVEnrichDetailCreateRequestForm, uuid: str
) -> JsonResponse:
    """
    Endpoint to enrich a CSV file using data from an external URL.

    This endpoint fetches data from the provided external URL and attempts to enrich the CSV file identified by its UUID.
    The response includes the keys from the external data and the ID of the enrichment detail.

    :param request: HttpRequest object containing the request data.
    :param request_form: CSVEnrichFileRequestForm object containing the validated form data.
    :param uuid: The UUID of the CSVFile instance to be enriched.
    :return: JsonResponse object containing the keys from the external data and the ID of the enrichment detail.

    Note:
    - If the provided external URL does not return a valid JSON, a 400 BAD REQUEST response is returned.
    - Network errors, such as timeouts or connection failures when accessing the external URL, are not explicitly
      handled in this function and might raise exceptions.
    """

    # create base instance of CSVFile with relation to CSVFile source
    # file and file_row_count will be added after merge with external_response
    # in celery task when user made a choice which column to merge

    # added that first, as it will fail with 500 and will not request to external_url
    csvfile_instance = CSVFile.objects.create(source_instance_id=uuid)

    external_url = request_form.cleaned_data["external_url"]
    external_response = requests.get(external_url)
    try:
        data_json = external_response.json()
    except json.JSONDecodeError:
        return JsonResponse(
            {"error": f"URL is not JSON"}, status=HTTPStatus.BAD_REQUEST
        )

    data_json_keys = list(data_json[0].keys()) if data_json else []

    if not data_json_keys:
        return JsonResponse(
            {"error": f"{external_url} is empty"}, status=HTTPStatus.BAD_REQUEST
        )

    enrich_model = EnrichDetail.objects.create(
        csv_file_id=csvfile_instance.uuid,
        external_url=external_url,
        external_response=data_json,
        external_elements_key_list=json.dumps(data_json_keys),
        external_elements_count=len(data_json)
    )

    return JsonResponse(
        {"external_url_keys": data_json_keys, "enrich_detail_id": enrich_model.id},
        status=HTTPStatus.OK,
    )
