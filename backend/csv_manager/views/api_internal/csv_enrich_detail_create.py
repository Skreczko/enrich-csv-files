from http import HTTPStatus
from typing import cast

from celery import Task
from django.http import HttpRequest, JsonResponse
from django.views.decorators.http import require_POST

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

    This endpoint performs the following actions:
    1. Checks if the given CSV file (identified by its UUID) exists in the database.
    2. If the CSV file exists, creates a new enrichment detail for it.
    3. Schedules an asynchronous task to fetch data from the provided external URL.
    4. Once the data is fetched, it will be used to enrich the CSV file.

    :param request: HttpRequest object containing the request data.
    :param request_form: CSVEnrichDetailCreateRequestForm object containing the validated form data, including the external URL.
    :param uuid: The UUID of the CSVFile instance to be enriched.
    :return: JsonResponse object containing the ID of the scheduled task and the UUID of the CSV file.

    Note:
    - If the given CSV file does not exist, a CSVFile.DoesNotExist exception is raised.
    - The endpoint immediately returns after scheduling the asynchronous task and does not wait for the task to complete.
    - If the provided external URL does not return a valid JSON, the asynchronous task will handle the error and update the enrichment detail's status accordingly.
    - The function uses the Celery task system to manage the asynchronous fetching of data.
    - For security reasons, the JSON serializer is used for the Celery task instead of pickle.
    """

    if not CSVFile.objects.filter(uuid=uuid).exists():
        raise CSVFile.DoesNotExist

    csv_file_instance = CSVFile.objects.create(source_instance_id=uuid)

    enrich_model = EnrichDetail.objects.create(
        csv_file_id=csv_file_instance.uuid,
        external_url=request_form.cleaned_data["external_url"],
        json_root_path=request_form.cleaned_data["json_root_path"],
    )
    task = cast(Task, process_fetch_external_url).apply_async(
        args=(),
        kwargs={
            "enrich_detail_uuid": str(enrich_model.uuid),
            "csv_file_uuid": str(csv_file_instance.uuid),
        },
        serializer="json",  # didn't use pickle (which could reduce database requests) due to security concerns.
    )

    return JsonResponse(
        {"task_id": task.id, "csv_file_uuid": csv_file_instance.uuid},
        status=HTTPStatus.OK,
    )
