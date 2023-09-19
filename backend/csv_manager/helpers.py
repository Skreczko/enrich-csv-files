from http import HTTPStatus

from django.db import models
from django.db.models import Case, F, Value, When

from csv_manager.enums import EnrichmentStatus
from csv_manager.models import CSVFile
from csv_manager.types import (
    CSVDetailResult,
    EnrichDetailSerializerType,
    SourceInstanceSerializerType,
)
from transformer.exceptions import SerializationError
from transformer.serializers import serialize_queryset


def get_and_serialize_csv_detail(uuid: str) -> CSVDetailResult:
    """
    Retrieve and serialize details of a specific CSV file by UUID.

    This function fetches details of a CSV file using its UUID and serializes the data for response.
    It provides information such as the creation date, enrichment details, file headers, row count,
    original file name, and more. If the CSV file with the provided UUID does not exist, an error
    response is returned.

    The function relies on the queryset directly because the custom serializer does not handle `select_related` objects.

    :param uuid: UUID of the CSV file to retrieve details for
    :return: Dictionary containing detailed information about the specified CSVFile and a status.

    Note:
    - The function uses a custom serializer due to limitations with handling `select_related` objects.
    - If there's an error during serialization, it returns an error message and the corresponding HTTP status.
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
        return {"error": f"{uuid} does not exist", "status": HTTPStatus.BAD_REQUEST}

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
        return {
            "error": f"Could not serialize field {e.field} of instance {e.instance}",
            "status": HTTPStatus.INTERNAL_SERVER_ERROR,
        }

    return {"csv_detail": result[0], "status": HTTPStatus.OK}
