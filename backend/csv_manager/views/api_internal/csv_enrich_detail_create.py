from http import HTTPStatus
from typing import cast

from celery import Task
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
    Endpoint to initiate the enrichment of a CSV file using data from an external URL.

    This endpoint creates a new enrichment detail for a given CSV file (identified by its UUID) and
    schedules an asynchronous task to fetch data from the provided external URL. Once the data
     is fetched, it will be used to enrich the CSV file.

    :param request: HttpRequest object containing the request data.
    :param request_form: CSVEnrichDetailCreateRequestForm object containing the validated form data, including the external URL.
    :param uuid: The UUID of the CSVFile instance to be enriched.
    :return: JsonResponse object containing the UUID of the created enrichment detail and the ID of the scheduled task.

    Note:
    - The endpoint immediately returns after scheduling the asynchronous task and does not wait for the task to complete.
    - If the provided external URL does not return a valid JSON, the asynchronous task will handle the error and
      update the enrichment detail's status accordingly.
    - The function uses the Celery task system to manage the asynchronous fetching of data.
    - For security reasons, the JSON serializer is used for the Celery task instead of pickle.
    """

    csvfile_instance = CSVFile.objects.create(source_instance_id=uuid)

    enrich_model = EnrichDetail.objects.create(
        csv_file_id=csvfile_instance.uuid,
        external_url=request_form.cleaned_data["external_url"],
        status=EnrichmentStatus.FETCHING_RESPONSE,
    )
    task = cast(Task, process_fetch_external_url).apply_async(
        args=(),
        kwargs={
            "enrich_detail_uuid": str(enrich_model.uuid),
        },
        serializer="json",  # didn't use pickle (which could reduce database requests) due to security concerns.
    )

    return JsonResponse(
        {"enrich_detail_uuid": enrich_model.uuid, "task_id": task.id},
        status=HTTPStatus.OK,
    )
