from typing import Any, TYPE_CHECKING, cast

from celery import Task, shared_task
from django.db.models import F

from csv_manager.models import CSVFile
from decorators.types import ProcessCsvEnrichmentResponse

if TYPE_CHECKING:
    from csv_manager.enums import EnrichmentJoinType  # noqa


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

    CSVFile.objects.get(uuid=uuid).update_csv_metadata()


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

    from csv_manager.enums import EnrichmentStatus

    check_date = F("enrich_detail__created") - timedelta(days=3)

    CSVFile.objects.filter(
        # check if file exists
        (Q(file="") | Q(file__isnull=True))
        # check status and date
        & Q(enrich_detail__status=EnrichmentStatus.INITIATED, created__lte=check_date)
    ).delete()


@shared_task(bind=True)
def process_csv_enrichment(
    self: Task,
    enrich_detail_id: int,
    *args: Any,
    **kwargs: Any,
) -> ProcessCsvEnrichmentResponse:
    from csv_manager.models import EnrichDetail
    from csv_manager.enums import EnrichmentStatus

    from csv_manager.enrich_table_joins import create_enrich_table_by_join_type

    enrich_detail_instance = EnrichDetail.objects.select_related(
        "csv_file",
        "csv_file__source_instance",
    ).get(id=enrich_detail_id)

    csvfile_instance = enrich_detail_instance.csv_file
    source_csvfile_instance = csvfile_instance.source_instance

    output_path = create_enrich_table_by_join_type(
        join_type=cast(
            "EnrichmentJoinType", enrich_detail_instance.join_type
        ),  # mypy has problem, as in database its null=True, blank=True, but that value will be assigned when it reach this place (CSVEnrichFileRequestForm)
        enriched_file_name=str(csvfile_instance.uuid),
        source_instance_file_path=source_csvfile_instance.file.path,  # type: ignore #same as above
        enrich_detail_instance=enrich_detail_instance,
    )

    csvfile_instance.file.name = output_path
    csvfile_instance.original_file_name = f"{source_csvfile_instance.original_file_name}_enriched.csv"  # type: ignore #same as above
    csvfile_instance.save()
    csvfile_instance.update_csv_metadata()

    enrich_detail_instance.status = EnrichmentStatus.FINISHED
    enrich_detail_instance.save(update_fields=("status",))

    return {
        "enrich_detail_id": enrich_detail_instance.id
        # todo serialize new csvfile + select_related on enrich detail?
    }
