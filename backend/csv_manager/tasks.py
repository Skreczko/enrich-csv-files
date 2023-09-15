from typing import Any, cast

from celery import shared_task
from django.db.models import F
from sentry_sdk import capture_exception  # type: ignore  #todo fix stubs

from csv_manager.enrich_table_joins import create_enrich_table_by_join_type
from csv_manager.enums import EnrichmentJoinType, EnrichmentStatus
from csv_manager.models import CSVFile, EnrichDetail
from csv_manager.types import ProcessCsvEnrichmentResponse


@shared_task()
def process_csv_metadata(uuid: str, *args: Any, **kwargs: Any) -> None:
    """
    Asynchronously count the number of rows in a given CSV file.

    This task retrieves a CSVFile instance based on the provided UUID, reads the file,
    counts the number of rows, and updates the instance's `file_row_count` field with the result.

    :param self: The current Task instance.
    :param uuid: The UUID of the CSVFile instance to be processed.
    :return: None

    Note:
    - This task will automatically retry once if any exception occurs during its execution.
    - The retry will happen after a 60-second countdown.
    """

    CSVFile.objects.get(uuid=uuid).update_csv_metadata()


@shared_task()
def process_fetch_external_url(
    enrich_detail_uuid: str, *args: Any, **kwargs: Any
) -> None:
    """
    Asynchronously fetch and process external JSON data to enrich a given CSV detail.

    This function performs the following steps:
    1. Fetches the external URL associated with the given enrich detail UUID.
    2. Streams the response content and saves it to a temporary file.
    3. Uses ijson[yajl2] to parse the JSON content without loading the entire file into memory.
    4. Extracts the keys from the first item in the JSON and counts the total number of items.
    5. Updates the EnrichDetail model with the extracted keys, item count, and sets the status to AWAITING_COLUMN_SELECTION.

    :param enrich_detail_uuid: The UUID of the EnrichDetail instance to be processed.
    :return: None

    Note:
    - If the external URL does not return a valid JSON or if the JSON is empty, the status of the EnrichDetail instance will be updated accordingly.
    - The function will raise exceptions for invalid enrich detail UUIDs or HTTP errors.
    - The function uses the yajl2 backend of ijson for efficient JSON parsing.
    - The approach prioritizes memory efficiency over speed. While the reading speed might be slower due to
      streaming and iterative parsing, this ensures minimal RAM usage. Given that this task runs asynchronously
      in Celery and doesn't block the main thread, the trade-off is considered acceptable to prevent potential memory issues.
    """

    import ijson.backends.yajl2 as ijson  # https://lpetr.org/2016/05/30/faster-json-parsing-python-ijson/
    import requests
    from django.core.files import File
    from tempfile import NamedTemporaryFile
    from itertools import islice

    enrich_detail = EnrichDetail.objects.filter(uuid=enrich_detail_uuid).first()
    if not enrich_detail:
        raise ValueError(f"Enrich detail ({enrich_detail_uuid=}) does not exist")

    try:
        response = requests.get(enrich_detail.external_url, stream=True, timeout=10)
        response.raise_for_status()
    except requests.HTTPError as e:
        capture_exception(e)
        EnrichDetail.objects.filter(uuid=enrich_detail_uuid).update(
            status=EnrichmentStatus.FAILED_FETCHING_RESPONSE_INCORRECT_URL_STATUS
        )
        raise e
    except requests.RequestException as e:
        capture_exception(e)
        EnrichDetail.objects.filter(uuid=enrich_detail_uuid).update(
            status=EnrichmentStatus.FAILED_FETCHING_RESPONSE_OTHER_REQUEST_EXCEPTION
        )
        raise ValueError(f"Other request exeption occurs: {e}")
    except Exception as e:
        capture_exception(e)
        EnrichDetail.objects.filter(uuid=enrich_detail_uuid).update(
            status=EnrichmentStatus.FAILED_FETCHING_RESPONSE
        )



    # Use a temporary file to stream the content
    with NamedTemporaryFile(delete=True) as temp_file:
        for chunk in response.iter_content(
            chunk_size=65536
        ):  # 64 KB - same as default chunk for django TemporaryFileUploadHandler
            temp_file.write(chunk)

        # Use ijson to process the JSON file piece by piece
        temp_file.seek(0)
        items = ijson.items(
            temp_file, "item"
        )  # 'item' is a placeholder, adjust if the JSON structure is different
        try:
            first_item = next(items, None)
        except ijson.common.IncompleteJSONError:  # type: ignore
            EnrichDetail.objects.filter(uuid=enrich_detail_uuid).update(
                status=EnrichmentStatus.FAILED_FETCHING_RESPONSE_NOT_JSON
            )
            raise ValueError("The response is not a valid JSON")

        if not first_item:
            EnrichDetail.objects.filter(uuid=enrich_detail_uuid).update(
                status=EnrichmentStatus.FAILED_FETCHING_RESPONSE_EMPTY_JSON
            )
            raise ValueError("The JSON response is empty")

        temp_file.seek(0)
        filename = f"{enrich_detail_uuid}.json"

        # Save the file to the model's FileField
        enrich_detail.external_response.save(filename, File(temp_file))

        enrich_detail.external_elements_key_list = list(first_item.keys())
        enrich_detail.external_elements_count = (
            sum(1 for _ in islice(items, 1, None)) + 1
        )  # 1 as first item has been already read as "first_item"

        enrich_detail.status = EnrichmentStatus.AWAITING_COLUMN_SELECTION
        enrich_detail.save()


@shared_task()
def clear_empty_csvfile() -> None:
    """
    Asynchronously delete CSVFile instances based on specific criteria.

    This task is designed to periodically clean up CSVFile records that:
    1. Lack associated files (i.e., the file field is empty or null).
    2. Have an associated enrichment detail with a status of "INITIATED" and were created more than 3 days ago. (same as for schedule)

    Such empty CSVFile instances can be created under various circumstances, including when a user initiates an enrichment process but does not complete it.

    :return: None

    Notes:
    - It's recommended to schedule this task during off-peak hours to minimize potential database contention.
    """

    from django.db.models import Q
    from datetime import timedelta

    check_date = F("enrich_detail__created") - timedelta(days=3)

    CSVFile.objects.filter(
        # check if file exists
        (Q(file="") | Q(file__isnull=True))
        # check status and date
        # TODO filter by correct status - to rethink
        & Q(enrich_detail__status=EnrichmentStatus.FETCHING_RESPONSE, created__lte=check_date)
    ).delete()


@shared_task()
def process_csv_enrichment(
    enrich_detail_uuid: str,
    *args: Any,
    **kwargs: Any,
) -> ProcessCsvEnrichmentResponse:
    enrich_detail_instance = (
        EnrichDetail.objects.select_related(
            "csv_file",
            "csv_file__source_instance",
        )
        .only(
            "status",
            "join_type",
            "csv_file__file",
            "csv_file__original_file_name",
            "csv_file__uuid",
            "csv_file__source_instance__file",
            "csv_file__source_instance__original_file_name",
        )
        .get(uuid=enrich_detail_uuid)
    )

    enrich_detail_instance.status = EnrichmentStatus.ENRICHING
    enrich_detail_instance.save(update_fields=("status",))

    csvfile_instance = enrich_detail_instance.csv_file
    source_csvfile_instance = csvfile_instance.source_instance

    output_path = create_enrich_table_by_join_type(
        join_type=cast(
            EnrichmentJoinType, enrich_detail_instance.join_type
        ),  # mypy has problem, as in database its null=True, blank=True, but that value will be assigned when it reach this place (CSVEnrichFileRequestForm)
        enriched_csv_file_name=str(csvfile_instance.uuid),
        source_instance_file_path=source_csvfile_instance.file.path,  # type: ignore #same as above
        enrich_detail_instance=enrich_detail_instance,
    )

    # take into account potential SuspiciousFileOperation for future development when storing file in different path than project
    csvfile_instance.file.name = output_path
    csvfile_instance.original_file_name = f"{source_csvfile_instance.original_file_name}_enriched.csv"  # type: ignore #same as above
    csvfile_instance.save(update_fields=("file", "original_file_name"))

    enrich_detail_instance.status = EnrichmentStatus.COMPLETED
    enrich_detail_instance.save(update_fields=("status",))

    csvfile_instance.update_csv_metadata()

    return {
        "enrich_detail_uuid": str(enrich_detail_instance.uuid)
        # todo serialize new csvfile + select_related on enrich detail?
    }
