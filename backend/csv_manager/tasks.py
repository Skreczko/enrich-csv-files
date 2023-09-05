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


# TODO crontib to remove CSVFile instance and related EnrichDetail instance, where file does not exist.
# That means user provided selected source CSVFile, provided external url but didnt select columns to merge
