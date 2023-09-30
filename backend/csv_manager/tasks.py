import os
from typing import Any, cast

from celery import shared_task
from django.conf import settings
from petl import FieldSelectionError
from sentry_sdk import capture_exception  # type: ignore  #todo fix stubs

from csv_manager.enrich_table_joins import create_enrich_table_by_join_type
from csv_manager.enums import EnrichmentJoinType, EnrichmentStatus
from csv_manager.helpers import get_and_serialize_csv_detail
from csv_manager.models import CSVFile, EnrichDetail

import ijson.backends.yajl2 as ijson  # https://lpetr.org/2016/05/30/faster-json-parsing-python-ijson/
import requests
from django.core.files import File
from tempfile import NamedTemporaryFile


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
    enrich_detail_uuid: str, csv_file_uuid: str, *args: Any, **kwargs: Any
) -> dict[str, Any] | str | None:
    """
    Asynchronously fetch and process external JSON data to enrich a specific CSV detail.

    Steps:
    1. Retrieve the external URL associated with the provided enrich detail UUID.
    2. Stream the response content and save it to a temporary file.
    3. Utilize ijson[yajl2] to parse the JSON content iteratively, avoiding loading the entire file into memory.
    4. Extract keys from the first JSON item and count the total number of items.
    5. Update the EnrichDetail model with the extracted keys, item count, and set the status to AWAITING_COLUMN_SELECTION.

    :param enrich_detail_uuid: UUID of the EnrichDetail instance to process.
    :param csv_file_uuid: UUID of the CSVFile instance associated with the enrichment detail.
    :return:
        - dict[str, Any]: In case of successful task completion. The key will be the Celery task number, and Any will be the data for updating.
        - str: Error message for Celery task status 'error'.
        - None: Celery task is pending.

    Notes:
    - If the external URL fails to return valid JSON or if the JSON is empty, the EnrichDetail instance's status will be updated.
    - Exceptions will be raised for invalid enrich detail UUIDs or HTTP errors.
    - The yajl2 backend of ijson is used for efficient JSON parsing.
    - This approach emphasizes memory efficiency over speed. While reading might be slower due to streaming and iterative parsing,
      it ensures minimal RAM usage. As this task runs asynchronously in Celery without blocking the main thread,
      this trade-off is deemed acceptable to mitigate potential memory issues.
    """

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

    # Determine the root path in the JSON structure from which data should be extracted.
    # If a specific root path is provided in the `enrich_detail`, it's used as the base path and appended with ".item".
    # Otherwise, the default "item" is used as the root path.
    json_root_path = (
        f"{enrich_detail.json_root_path}.item"
        if enrich_detail.json_root_path
        else "item"
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
            temp_file, json_root_path
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
            raise ValueError(
                "The JSON response is empty or URL JSON root path is wrong"
            )

        temp_file.seek(0)
        filename = f"{enrich_detail_uuid}.json"

        # Save the file to the model's FileField
        enrich_detail.external_response.save(filename, File(temp_file))

        enrich_detail.external_elements_key_list = list(first_item.keys())

        # After consuming the first item from the 'items' generator, it becomes exhausted for that item.
        # Hence, we create a new generator 'items_for_count' to count the total number of items.
        temp_file.seek(0)
        items_for_count = ijson.items(temp_file, json_root_path)
        enrich_detail.external_elements_count = sum(1 for _ in items_for_count)

        enrich_detail.status = EnrichmentStatus.AWAITING_COLUMN_SELECTION
        enrich_detail.save()

    serialized_csv_detail = get_and_serialize_csv_detail(uuid=csv_file_uuid)

    return serialized_csv_detail.get("csv_detail", serialized_csv_detail.get("error"))


@shared_task()
def remove_orphaned_csv_files() -> None:
    """
    Asynchronously identify and remove orphaned CSV and JSON files from user directories.

    This task is designed to maintain storage hygiene by scanning each user's upload directory for files
    that are not associated with any database instances. Orphaned files can accumulate due to various reasons,
    such as failed uploads or manual deletions of database instances without corresponding file removal.

    Steps:
    1. Retrieve all file paths associated with CSVFile and EnrichDetail instances.
    2. For each user directory, identify files that are not in the list of associated files.
    3. Delete each identified orphaned file.

    :return: None

    Notes:
    - The task not only checks for orphaned CSV files but also for orphaned JSON files.
    - It's recommended to schedule this task during off-peak hours to minimize potential I/O contention.
    - Always ensure backups are in place before running cleanup tasks to prevent accidental data loss.
    """

    users_upload_directory = os.path.join(settings.MEDIA_ROOT, "files")

    associated_csv_files = set(
        name.rsplit("/", 1)[-1]
        for name in CSVFile.objects.values_list("file", flat=True)
        if isinstance(name, str)
    )
    associated_json_files = set(
        name.rsplit("/", 1)[-1]
        for name in EnrichDetail.objects.values_list("external_response", flat=True)
        if isinstance(name, str)
    )

    for user_directory in os.listdir(users_upload_directory):
        user_files_directory = os.path.join(
            os.path.join(settings.MEDIA_ROOT, "files"), user_directory
        )

        # Remove CSV files
        user_csv_files = set(
            file_name
            for file_name in os.listdir(user_files_directory)
            if file_name.rsplit(".", 1)[-1] == "csv"
        )
        orphaned_csv_files = user_csv_files - associated_csv_files

        for csv_file_name in orphaned_csv_files:
            csv_file_path = os.path.join(user_files_directory, csv_file_name)
            os.remove(csv_file_path)

        # Remove JSON files
        user_json_files = set(
            file_name
            for file_name in os.listdir(user_files_directory)
            if file_name.rsplit(".", 1)[-1] == "json"
        )
        orphaned_json_files = user_json_files - associated_json_files

        for json_file_name in orphaned_json_files:
            json_file_path = os.path.join(user_files_directory, json_file_name)
            os.remove(json_file_path)


@shared_task()
def process_csv_enrichment(
    enrich_detail_uuid: str,
    *args: Any,
    **kwargs: Any,
) -> dict[str, Any] | str | None:
    """
    Asynchronously process the enrichment of a specific CSV detail.

    Steps:
    1. Retrieve the EnrichDetail and associated CSVFile instances based on the provided UUID.
    2. Perform the enrichment process based on the specified join type.
    3. Update the CSVFile instance with the enriched data.
    4. Update the status of the EnrichDetail instance to COMPLETED.

    :param enrich_detail_uuid: UUID of the EnrichDetail instance to process.
    :return:
        - dict[str, Any]: In case of successful task completion. The key will be the Celery task number, and Any will be the data for updating.
        - str: Error message for Celery task status 'error'.
        - None: Celery task is pending.

    Notes:
    - Exceptions will be raised for invalid enrich detail UUIDs or enrichment errors.
    - The function uses the `create_enrich_table_by_join_type` to perform the actual enrichment.
    - The status of the EnrichDetail instance will be updated at various stages to reflect the progress.
    - If an error occurs during the enrichment process, the EnrichDetail instance's status will be set to FAILED_ENRICHING.
    """

    enrich_detail_instance = EnrichDetail.objects.select_related(
        "csv_file",
        "csv_file__source_instance",
    ).get(uuid=enrich_detail_uuid)

    csvfile_instance = enrich_detail_instance.csv_file
    source_csvfile_instance = csvfile_instance.source_instance

    try:
        output_path = create_enrich_table_by_join_type(
            join_type=cast(
                EnrichmentJoinType, enrich_detail_instance.join_type
            ),  # mypy has problem, as in database its null=True, blank=True, but that value will be assigned when it reach this place (CSVEnrichFileRequestForm)
            enriched_csv_file_name=str(csvfile_instance.uuid),
            source_instance_file_path=source_csvfile_instance.file.path,  # type: ignore #same as above
            enrich_detail_instance=enrich_detail_instance,
        )
    except (ValueError, FieldSelectionError):
        enrich_detail_instance.status = EnrichmentStatus.FAILED_ENRICHING
        enrich_detail_instance.save(update_fields=("status",))
        raise

    # take into account potential SuspiciousFileOperation for future development when storing file in different path than project
    csvfile_instance.file.name = output_path
    csvfile_instance.original_file_name = f"{source_csvfile_instance.original_file_name}_enriched.csv"  # type: ignore #same as above
    csvfile_instance.save(update_fields=("file", "original_file_name"))

    enrich_detail_instance.status = EnrichmentStatus.COMPLETED
    enrich_detail_instance.save(update_fields=("status",))

    csvfile_instance.update_csv_metadata()

    serialized_csv_detail = get_and_serialize_csv_detail(
        uuid=str(csvfile_instance.uuid)
    )

    return serialized_csv_detail.get("csv_detail", serialized_csv_detail.get("error"))
