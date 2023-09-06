from http import HTTPStatus
from typing import Any, cast

from django.http import HttpRequest, JsonResponse
from django.views.decorators.http import require_POST

from csv_manager.forms import CSVEnrichFileRequestForm
from csv_manager.models import CSVFile, EnrichDetail
from decorators.form_validator import validate_request_form


def validate_merge_params(
    external_keys_list: list[str],
    selected_merge_key: str,
    headers_list: list[str],
    selected_merge_header: str,
) -> JsonResponse | None:
    if selected_merge_key not in external_keys_list:
        return JsonResponse(
            {"error": f"'{selected_merge_key}' not in {external_keys_list}"},
            status=HTTPStatus.BAD_REQUEST,
        )
    if selected_merge_header not in headers_list:
        return JsonResponse(
            {"error": f"'{selected_merge_header}' not in {headers_list}"},
            status=HTTPStatus.BAD_REQUEST,
        )


@require_POST
@validate_request_form(CSVEnrichFileRequestForm)
def csv_enrich_file_create(
    request: HttpRequest,
    request_form: CSVEnrichFileRequestForm,
    *args: Any,  # args needed for mypy, because in some endpoints we pass args, ie uuid as url parameter.
) -> JsonResponse:
    """
    Endpoint to initiate enriched file creation. Mostly validate data if tables can be merged. Call async celery function to making marge, returning task id to track progress.

    For future development: Additional logic is needed to verify the types of the selected key from the external API and the selected key from the CSV headers before initiating a task in Celery. This will enable the frontend to compare types and disable specific options in the dropdown that don't match. When a user selects either a column or a key to merge, the other option will automatically adapt to match the type of the selected one.

    """

    try:
        enrich_detail_instance = (
            EnrichDetail.objects.select_related("csv_file__source_instance")
            .only(
                "external_elements_key_list", "csv_file__source_instance__file_headers"
            )
            .get(id=request_form.cleaned_data["enrich_detail_id"])
        )
    except EnrichDetail.DoesNotExist:
        return JsonResponse(
            {"error": f"EnrichDetail matching query does not exist"},
            status=HTTPStatus.INTERNAL_SERVER_ERROR,
        )
    source_csvfile_instance: "CSVFile" = enrich_detail_instance.csv_file.source_instance

    selected_merge_key = request_form.cleaned_data["selected_merge_key"]
    selected_merge_header = request_form.cleaned_data["selected_merge_header"]

    validation_response = validate_merge_params(
        external_keys_list=enrich_detail_instance.external_keys,
        selected_merge_key=selected_merge_key,
        headers_list=source_csvfile_instance.headers,
        selected_merge_header=selected_merge_header,
    )
    if validation_response:
        return validation_response

    # file = request_form.cleaned_data["file"]
    # instance = CSVFile.objects.create(
    #     file=file,
    # )
    #
    #
    # celery_task = cast(
    #     Task, process_csv_metadata
    # )  # mypy has problem because it does not recognize that process_csv_metadata as Task. TODO Fix to future development
    # celery_task.apply_async(
    #     args=(),
    #     kwargs={
    #         "uuid": str(instance.uuid),
    #     },
    #     serializer="json",
    # )

    return JsonResponse({"name": file.name}, status=HTTPStatus.OK)
