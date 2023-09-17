from datetime import date
from http import HTTPStatus
from typing import TypedDict

from django.db import models
from django.db.models import Case, F, Value, When
from django.db.models.fields.files import FieldFile
from django.http import HttpRequest, JsonResponse
from django.views.decorators.http import require_GET

from csv_manager.enums import (
    EnrichmentJoinType,
    EnrichmentStatus,
)
from csv_manager.models import CSVFile
from transformer.serializers import serialize_queryset
from transformer.exceptions import SerializationError


class EnrichDetailSerializerType(TypedDict):
    created: date
    external_elements_count: int
    external_elements_key_list: list[str]
    external_response: FieldFile
    external_url: str
    is_flat: bool
    join_type: EnrichmentJoinType
    selected_header: str
    selected_key: str
    uuid: str


class SourceInstanceSerializerType(TypedDict):
    created: date
    uuid: str
    original_file_name: str
    file: FieldFile
    file_row_count: int
    file_headers: list[str]


@require_GET
def csv_detail_get(
    request: HttpRequest,
    uuid: str,
) -> JsonResponse:
    """
    Endpoint to retrieve details of a specific CSV file by UUID.

    This endpoint fetches details of a CSV file using its UUID. It provides information such as the creation date,
    enrichment details, file headers, row count, original file name, and more. If the CSV file with the provided UUID
    does not exist, an error response is returned.

    The function relies on the queryset directly because the custom serializer does not handle `select_related` objects.

    :param request: HttpRequest object
    :param uuid: UUID of the CSV file to retrieve details for
    :return: JsonResponse object containing detailed information about the specified CSVFile.

    Note:
    - OPTIMIZATION: Use DRF. Avoid custom serialization, e.g., FileField, relations with other database tables, etc.
    - Missing csrf protection.
    """

    queryset = (
        CSVFile.objects.select_related("enrich_detail", "source_instance")
        .annotate(
            source_uuid=F("source_instance__uuid"),
            source_original_file_name=F("source_instance__original_file_name"),
            enrich_url=F("enrich_detail__external_url"),
            # take status from "enrich_detail.status". If "enrich_detail" does not exist - that mean file has been created
            # in upload process. Return status "finished" by default.
            status=Case(
                When(enrich_detail__isnull=False, then=F("enrich_detail__status")),
                default=Value(EnrichmentStatus.COMPLETED),
                output_field=models.CharField(),
            ),
        )
        .filter(uuid=uuid)
    )

    # need to base on queryset as my custom serializer does not handle select_related objects.
    if not queryset.exists():
        return JsonResponse(
            {"error": f"{uuid} does not exist"}, status=HTTPStatus.BAD_REQUEST
        )

    try:
        result = serialize_queryset(
            queryset=queryset,
            fields=[
                "created",
                "enrich_detail",
                "file",
                "file_headers",
                "file_row_count",
                "original_file_name",
                "source_original_file_name",
                "source_uuid",
                "status",
                "uuid",
                "source_instance",
            ],
            select_related_model_mapping={
                "enrich_detail": EnrichDetailSerializerType,
                "source_instance": SourceInstanceSerializerType,
            },
        )
    except SerializationError as e:
        return JsonResponse(
            {
                "error": f"Could not serialize field {e.field} of instance {e.instance}",
            },
            status=HTTPStatus.INTERNAL_SERVER_ERROR,
        )

    return JsonResponse(
        {
            "csv_detail": result[0],
        },
        status=HTTPStatus.OK,
    )
