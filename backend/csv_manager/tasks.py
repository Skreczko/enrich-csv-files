from typing import Any

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
    2. Have an associated enrichment detail with a status of "IN_PROGRESS" and were created more than 7 days ago.

    Such empty CSVFile instances can be created under various circumstances, including when a user initiates an enrichment process but does not complete it.

    :return: None

    Notes:
    - It's recommended to schedule this task during off-peak hours to minimize potential database contention.
    """

    from csv_manager.models import CSVFile
    from django.db.models import Q
    from datetime import timedelta


    from csv_manager.enums import EnrichmentStatus

    check_date = F("enrich_detail__created") - timedelta(days=7)

    CSVFile.objects.only(
        "file", "enrich_detail__status", "enrich_detail__created"
    ).filter(
        # check if file exists
        (Q(file="") | Q(file__isnull=True))
        # check status and date
        &
        Q(enrich_detail__status=EnrichmentStatus.IN_PROGRESS, created__lt=check_date)
    ).delete()

    return

@shared_task(bind=True)
def process_csv_enrichment(self: Task, enrich_detail_id: int, selected_merge_key: str, selected_merge_header:str, *args: Any, **kwargs: Any) -> None:
    import petl as etl

    from csv_manager.models import EnrichDetail
    from csv_manager.models import CSVFile

    enrich_detail_instance = (
        EnrichDetail.objects.select_related("csv_file", "csv_file__source_instance", "csv_file__source_instance__enrich_detail")
        # .only(
        #     "external_elements_key_list", "csv_file__source_instance__file_headers"
        # )
        .get(id=enrich_detail_id)
    )

    source_csvfile_instance: "CSVFile" = enrich_detail_instance.csv_file.source_instance
    source_enrich_detail_instance: "EnrichDetail" = enrich_detail_instance.csv_file.enrich_detail

    table = etl.fromcsv(csv_path)


    external_table = etl.fromdicts(external_response)


    merged_table = etl.leftjoin(
        table, external_table, key=selected_merge_header, lprefix="csv_", rprefix="api_"
    )

    output_path = "path_to_output_file.csv"
    etl.tocsv(merged_table, output_path)

    return output_path
