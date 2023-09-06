import uuid
from django.db import models
from django.utils.functional import cached_property


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

    uuid = models.UUIDField(
        default=uuid.uuid4, editable=False, unique=True, primary_key=True
    )
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
    file = models.FileField(
        upload_to=csv_upload_path,
        null=True,
        blank=True,
    )

    # Filled in celery
    # optimization for keeping row_count instead count them - as file will not change
    # optimization for keeping file_headers - as file will not change and may help performance to not open file to get headers
    file_row_count = models.IntegerField(
        null=True,
        blank=True,
        help_text="Number of table rows excluding table header",
    )
    file_headers = models.JSONField(
        null=True,
        blank=True,
        help_text="List of headers from file. Use this field instead using file to get headers",
    )

    class Meta:
        ordering = ["created"]

    @cached_property
    def headers(self) -> list[str]:
        import json

        return json.loads(self.file_headers)


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
    # to keep "history", as response from external_url may change in time
    external_response = models.JSONField()

    created = models.DateTimeField(auto_now_add=True)

    # Filled in celery
    # optimization for keeping external_elements_count instead count them on every request- as external_response will not change
    # optimization for keeping external_elements_key_list - as file external_response not change and may help in performance to not load whole external_response to get keys
    external_elements_count = models.IntegerField(
        null=True,
        blank=True,
        help_text="Number of dict elements",
    )
    external_elements_key_list = models.JSONField(
        blank=True,
        null=True,
        help_text="List of main keys from external_response. Use this field instead using external_response to get keys",
    )
    selected_key = models.TextField(
        help_text="Selected json key to be used to merge with CSVFile",
    )
    # Contains information enrich deep level, ie.
    # 1. Create CSVFile instance (id=1) -> EnrichDetails instance does not exists
    # 2. Create CSVFile instance (id=2) using field "source_instance=1" -> enrich_level=1
    # 3. Create CSVFile instance (id=3) using field "source_instance=2" -> enrich_level=2
    enrich_level = models.IntegerField(default=1)

    @cached_property
    def external_keys(self) -> list[str]:
        import json

        return json.loads(self.external_elements_key_list)
