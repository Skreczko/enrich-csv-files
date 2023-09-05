import uuid
from django.db import models


def csv_upload_path(instance: "CSVFile", filename: str) -> str:
    import os

    # for future development: create folder per user
    folder_name = "no_user"

    file_extension = os.path.splitext(filename)[1]
    file_name = f"{instance.uuid}{file_extension}"
    return os.path.join("csv_files", folder_name, file_name)


class CSVFile(models.Model):
    """
    This model stores csv file and basic information about it.
    """
    uuid = models.UUIDField(default=uuid.uuid4, editable=False, unique=True, primary_key=True)

    source_instance = models.ForeignKey(
        "self",
        null=True,
        blank=True,
        on_delete=models.CASCADE,
        related_name="enriched_instances",
    )
    created = models.DateTimeField(auto_now_add=True)
    # Files and folders will not be deleted after instance deletion.
    # Depending on business needs, additional logic may be required
    # Ie signals, functions, bulk_delete, overriding def delete...
    file = models.FileField(upload_to=csv_upload_path)


class EnrichDetail(models.Model):
    """
    This model stores information about enrich process using CSVFile models and external API
    """
    csv_file = models.OneToOneField(
        "CSVFile",
        on_delete=models.CASCADE,
        related_name="enrich_detail",
    )
    external_url = models.URLField(
        help_text="The origin URL which was used to enrich",
    )
    external_response = models.JSONField()
    selected_key = models.TextField(
        help_text="Selected json key to be used to merge with CSVFile",
    )
    # Contains information enrich deep level, ie.
    # 1. Create CSVFile instance (id=1) -> EnrichDetails instance does not exists
    # 2. Create CSVFile instance (id=2) using field "source_instance=1" -> enrich_level=1
    # 3. Create CSVFile instance (id=3) using field "source_instance=2" -> enrich_level=2
    enrich_level = models.IntegerField(default=1)
    created = models.DateTimeField(auto_now_add=True)

