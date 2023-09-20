from http import HTTPStatus
from typing import Any, cast

from celery import Task
from django.db.models import F
from django.http import HttpRequest, JsonResponse
from django.views.decorators.http import require_POST

from csv_manager.enums import EnrichmentStatus
from csv_manager.forms import CSVEnrichFileRequestForm
from csv_manager.models import EnrichDetail
from decorators.form_validator import validate_request_form


def validate_merge_params(
    external_keys_list: list[str],
    headers_list: list[str],
    user_selections: dict[str, str],
) -> JsonResponse | None:
    selected_key = user_selections["selected_key"]
    if selected_key not in external_keys_list:
        return JsonResponse(
            {"error": f"'{selected_key}' not in {external_keys_list}"},
            status=HTTPStatus.BAD_REQUEST,
        )

    selected_header = user_selections["selected_header"]
    if selected_header not in headers_list:
        return JsonResponse(
            {"error": f"'{selected_header}' not in {headers_list}"},
            status=HTTPStatus.BAD_REQUEST,
        )

    return None


@require_POST
@validate_request_form(CSVEnrichFileRequestForm)
def csv_enrich_file_create(
    request: HttpRequest,
    request_form: CSVEnrichFileRequestForm,
    *args: Any,  # args needed for mypy, because in some endpoints we pass args, ie uuid as url parameter.
) -> JsonResponse:
    """
    Endpoint to initiate the creation of an enriched file.

    This endpoint primarily validates if the tables can be merged based on user selections. If the validation is successful,
    it triggers an asynchronous Celery task to perform the merge operation and returns the task ID to track its progress.

    The endpoint performs the following steps:
    1. Validates the provided enrichment details against the database.
    2. Checks the compatibility of the selected merge key from the external API and the selected header from the CSV.
    3. If the validation is successful, updates the status of the enrichment detail and initiates the Celery task.
    4. Returns the task ID or an error message based on the outcome.

    :param request: HttpRequest object.
    :param request_form: CSVEnrichFileRequestForm object containing the user's selections.
    :return: JsonResponse object containing the Celery task ID or an error message.

    Note:
    - For future development: Additional logic is needed to verify the types of the selected key from the external API
      and the selected key from the CSV headers before initiating a task in Celery. This will enable the frontend to
      compare types and disable specific options in the dropdown that don't match. When a user selects either a column
      or a key to merge, the other option will automatically adapt to match the type of the selected one.
    - The function uses the `process_csv_enrichment` Celery task to perform the merge operation in the background.
    """

    from csv_manager.tasks import process_csv_enrichment

    enrich_detail_uuid = request_form.cleaned_data["enrich_detail_uuid"]
    enrich_detail_queryset = (
        EnrichDetail.objects.defer("external_response")
        .select_related("csv_file__source_instance")
        .annotate(csv_file_uuid=F("csv_file__uuid"))
        .filter(
            uuid=enrich_detail_uuid,
            status=EnrichmentStatus.AWAITING_COLUMN_SELECTION,
        )
    )

    enrich_detail_instance = enrich_detail_queryset.first()
    if not enrich_detail_instance:
        return JsonResponse(
            {
                "error": f"EnrichDetail ({enrich_detail_uuid=}) matching query does not exist"
            },
            status=HTTPStatus.INTERNAL_SERVER_ERROR,
        )
    source_csvfile_instance = enrich_detail_instance.csv_file.source_instance

    user_selections = {
        "selected_key": request_form.cleaned_data["selected_merge_key"],
        "selected_header": request_form.cleaned_data["selected_merge_header"],
        "join_type": request_form.cleaned_data["join_type"],
        "is_flat": request_form.cleaned_data["is_flat"],
    }

    validation_response = validate_merge_params(
        external_keys_list=enrich_detail_instance.external_elements_key_list,
        headers_list=source_csvfile_instance.file_headers,  # type: ignore  # mypy has problem, as in database its null=True, blank=True, but that value will be assigned when it reach this place (update_csv_metadata)
        user_selections=user_selections,
    )

    status = (
        EnrichmentStatus.FAILED_COLUMN_SELECTION
        if validation_response
        else EnrichmentStatus.ENRICHING
    )
    enrich_detail_queryset.update(status=status, **user_selections)

    if validation_response:
        return validation_response

    task = cast(Task, process_csv_enrichment).apply_async(
        args=(),
        kwargs={
            "enrich_detail_uuid": str(enrich_detail_uuid),
        },
        serializer="json",  # didn't use pickle (which could reduce database requests) due to security concerns.
    )
    # process_csv_enrichment(**{"enrich_detail_uuid": str(enrich_detail_uuid)})
    return JsonResponse({"task_id": task.id, "csv_file_uuid": enrich_detail_instance.csv_file_uuid}, status=HTTPStatus.OK)
