from typing import Any

from celery import Task, shared_task


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
    Asynchronously delete CSVFile instances with empty or null file fields.

    This task is designed to periodically clean up CSVFile records that lack associated files.
    Such empty CSVFile instances are typically created when a user selects a CSVFile for enrichment,
    provides an external_url with a JSON response, but does not select columns to join between them.

    :return: None

    Notes:
    - It's recommended to schedule this task during off-peak hours to minimize potential database contention.
    """

    from csv_manager.models import CSVFile
    from django.db.models import Q

    CSVFile.objects.filter(Q(file="") | Q(file__isnull=True)).delete()

    return
