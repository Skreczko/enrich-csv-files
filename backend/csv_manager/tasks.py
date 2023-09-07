from typing import Any, cast

from celery import Task, shared_task
from django.db.models import F


@shared_task(
    bind=True,
    autoretry_for=(Exception,),
    retry_kwargs={"max_retries": 1, "countdown": 60},
)
def process_csv_metadata(self: Task, uuid: str, *args: Any, **kwargs: Any) -> None:
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

    Optimization:
    - Logger needed - ie. Datadog or django logging
    """

    from csv_manager.models import CSVFile
    import json
    import petl as etl

    instance = CSVFile.objects.get(uuid=uuid)
    table = etl.fromcsv(instance.file.path)

    instance.file_row_count = etl.nrows(table)
    instance.file_headers = json.dumps(etl.header(table))
    instance.save(update_fields=("file_row_count", "file_headers"))

    return


@shared_task()
def clear_csvfile() -> None:
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

    from csv_manager.models import CSVFile
    from django.db.models import Q
    from datetime import timedelta

    from csv_manager.enums import EnrichmentStatus

    check_date = F("enrich_detail__created") - timedelta(days=3)

    CSVFile.objects.only(
        "file", "enrich_detail__status", "enrich_detail__created"
    ).filter(
        # check if file exists
        (Q(file="") | Q(file__isnull=True))
        # check status and date
        & Q(enrich_detail__status=EnrichmentStatus.INITIATED, created__lte=check_date)
    ).delete()

    return


# @shared_task(bind=True)
def process_csv_enrichment(
    # self: Task,
    enrich_detail_id: int,
    *args: Any,
    **kwargs: Any,
) -> str:
    import petl as etl

    from csv_manager.models import EnrichDetail
    from csv_manager.models import CSVFile
    from django.core.files import File
    import os
    from io import BytesIO



    enrich_detail_instance = (
        EnrichDetail.objects.select_related(
            "csv_file",
            "csv_file__source_instance",
            "csv_file__source_instance__enrich_detail",
        )
        # .only(
        #     "external_elements_key_list", "csv_file__source_instance__file_headers"
        # )
        .get(id=enrich_detail_id)
    )

    csvfile_instance = enrich_detail_instance.csv_file

    source_csvfile_instance: "CSVFile" = csvfile_instance.source_instance
    source_enrich_detail_instance: "EnrichDetail" = (
        csvfile_instance.enrich_detail
    )

    source_instance_file_path = source_csvfile_instance.file.path

    table = etl.fromcsv(source_csvfile_instance.file.path)

    external_table = etl.fromdicts(enrich_detail_instance.external_response)

    merged_table = etl.leftjoin(table, external_table, lkey=enrich_detail_instance.selected_header, rkey=enrich_detail_instance.selected_key, lprefix='csv_', rprefix='api_')
    output_path = f"{source_instance_file_path.rsplit('/', 1)[0]}/{csvfile_instance.uuid}.csv"


    etl.tocsv(merged_table, output_path)
    #
    # csvfile_instance.file.save(f"{csvfile_instance.uuid}.csv", File(temp_output_path))
    # csvfile_instance.save()


    csvfile_instance.file.name = output_path
    csvfile_instance.original_file_name = f"{source_csvfile_instance.original_file_name}_enriched.csv"
    csvfile_instance.save()

    celery_task = cast(
        Task, process_csv_metadata
    )  # mypy has problem because it does not recognize that process_csv_metadata as Task. TODO Fix to future development
    celery_task.apply_async(
        args=(),
        kwargs={
            "uuid": str(csvfile_instance.uuid),
        },
        serializer="json",  # didn't use pickle (which could reduce database requests) due to security concerns.
    )


    #todo joins switch
    # todo enrich level
    return str(csvfile_instance.uuid)
