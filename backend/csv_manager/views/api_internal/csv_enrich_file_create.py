from http import HTTPStatus
from typing import Any, cast

from django.http import HttpRequest, JsonResponse
from django.views.decorators.http import require_POST

from csv_manager.enums import EnrichmentStatus
from csv_manager.forms import CSVEnrichFileRequestForm
from csv_manager.models import CSVFile, EnrichDetail
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

    from csv_manager.tasks import process_csv_enrichment
    from celery import Task

    enrich_detail_id = request_form.cleaned_data["enrich_detail_id"]
    enrich_detail_queryset =EnrichDetail.objects.defer("external_response").select_related("csv_file__source_instance").filter(id=enrich_detail_id,status=EnrichmentStatus.INITIATED,)


    enrich_detail_instance = enrich_detail_queryset.first()
    if not enrich_detail_instance:
        return JsonResponse(
            {
                "error": f"EnrichDetail ({enrich_detail_id=}) matching query does not exist"
            },
            status=HTTPStatus.INTERNAL_SERVER_ERROR,
        )
    source_csvfile_instance: "CSVFile" = enrich_detail_instance.csv_file.source_instance

    user_selections = {
        "selected_key": request_form.cleaned_data["selected_merge_key"],
        "selected_header": request_form.cleaned_data["selected_merge_header"],
        "join_type": request_form.cleaned_data["join_type"],
        "is_flat": request_form.cleaned_data["is_flat"],
    }

    validation_response = validate_merge_params(
        external_keys_list=enrich_detail_instance.external_keys,
        headers_list=source_csvfile_instance.headers,
        user_selections=user_selections,
    )

    status = EnrichmentStatus.FAILED if validation_response else EnrichmentStatus.IN_PROGRESS
    enrich_detail_queryset.update(status=status, **user_selections)

    if status == EnrichmentStatus.FAILED:
        return validation_response


    celery_task = cast(
        Task, process_csv_enrichment
    )  # mypy has problem because it does not recognize that process_csv_metadata as Task. TODO Fix to future development
    # task = celery_task.apply_async(
    #     args=(),
    #     kwargs={
    #         "enrich_detail_id": enrich_detail_id,
    #     },
    #     serializer="json",  # didn't use pickle (which could reduce database requests) due to security concerns.
    # )
    aa = process_csv_enrichment(enrich_detail_id=enrich_detail_id)

    # return JsonResponse({"task_id": task.id}, status=HTTPStatus.OK)
    return JsonResponse({"file_id": aa}, status=HTTPStatus.OK)
