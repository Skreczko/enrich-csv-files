import json
from http import HTTPStatus

import requests
from django.http import HttpRequest, JsonResponse
from django.views.decorators.http import require_POST

from csv_manager.enums import EnrichmentStatus
from csv_manager.forms import CSVEnrichDetailCreateRequestForm
from csv_manager.models import CSVFile, EnrichDetail
from decorators.form_validator import validate_request_form
from csv_manager.tasks import process_fetch_external_url


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


    csvfile_instance = CSVFile.objects.create(source_instance_id=uuid)

    #todo fix docstring
    enrich_model = EnrichDetail.objects.create(
        csv_file_id=csvfile_instance.uuid,
        external_url=request_form.cleaned_data["external_url"],
        status=EnrichmentStatus.FETCHING_RESPONSE
    )
    # task = process_fetch_external_url.apply_async(
    #     args=(),
    #     kwargs={
    #         "enrichdetail_uuid": str(enrich_model.uuid),
    #     },
    #     serializer="json",  # didn't use pickle (which could reduce database requests) due to security concerns.
    # )
    process_fetch_external_url(enrichdetail_uuid=str(enrich_model.uuid))

    return JsonResponse(
        # {"enrich_detail_id": enrich_model.uuid, "task_id": task.id},
        {"enrich_detail_id": enrich_model.uuid, },
        status=HTTPStatus.OK,
    )
    # except Exception as e:
    #     # TODO: In future development, consider adding more detailed logging
    #     # and identifying specific exceptions that can occur.
    #     # Currently, it's a base fetching exception with an update to EnrichmentStatus.
    #     EnrichDetail.objects.filter(uuid=enrich_model.uuid).update(status=EnrichmentStatus.FAILED_FETCHING_RESPONSE)
    #     return JsonResponse(
    #         {"error": f"An error occurred while processing fetch external url: {str(e)}"},
    #         status=HTTPStatus.INTERNAL_SERVER_ERROR,
    #     )
