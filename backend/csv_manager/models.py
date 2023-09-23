import uuid
from typing import Union

from django.db import models

from csv_manager.enums import EnrichmentJoinType, EnrichmentStatus


def upload_path(instance: Union["CSVFile", "EnrichDetail"], filename: str) -> str:
    """
    Generate a unique upload path for CSV files.

    This function constructs a unique file path for uploaded CSV files based on the instance's UUID.
    The path is structured to place the file inside a directory per user (currently named "no_user"), which
    serves as a placeholder for potential future development where files might be organized into user-specific folders.

    :param instance: The instance of the CSVFile model for which the file is being uploaded.
    :param filename: The original name of the uploaded file.
    :return: A unique file path for the uploaded CSV file.
    """

    import os

    # for future development: create folder per user
    folder_name = "no_user"

    file_extension = os.path.splitext(filename)[1]
    file_name = f"{instance.uuid}{file_extension}"
    return os.path.join("files", folder_name, file_name)


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
        on_delete=models.SET_NULL,
        related_name="enriched_instances",
    )
    created = models.DateTimeField(auto_now_add=True)
    # Files and folders will not be deleted after instance deletion.
    # Depending on business needs, additional logic may be required
    # Ie signals, functions, bulk_delete, overriding def delete, scheduled task...
    file = models.FileField(
        upload_to=upload_path,
        null=True,
        blank=True,
    )
    original_file_name = models.TextField()

    # Filled in celery
    # optimization for keeping row_count instead count them - as file will not change
    # optimization for keeping file_headers - as file will not change and may help performance to not open file to get headers
    file_row_count = models.IntegerField(
        null=True,
        blank=True,
        help_text="Number of table rows excluding table header",
    )
    # For future development - that should include type of data related to column. check docstring for csv_enrich_file_create view for more details
    file_headers = models.JSONField(
        null=True,
        blank=True,
        help_text="List of headers from file. Use this field instead using file to get headers",
    )

    class Meta:
        ordering = ["created"]

    def update_csv_metadata(self) -> None:
        """
        Update the CSV file's metadata stored in the model.

        This method reads the associated CSV file to extract its metadata, including:
        - The number of rows (excluding the header), which is then stored in the `file_row_count` field.
        - The headers of the CSV, which are stored in the `file_headers` field.

        It's designed to be used whenever there's a need to refresh or initially set the metadata of the CSV file
        without manually parsing the file elsewhere.

        Note:
        - This method performs file I/O operations and might be time-consuming for large files.
        - For very large files, multiprocessing might be considered in future development to speed up row counting,
          although the current implementation is optimized for most use cases.
        - The current implementation, which directly reads the file, is more efficient than using libraries like
          `petl` or `pandas` for this specific use case because it avoids loading the entire file into memory.
        """

        with open(self.file.path) as f:
            headers = f.readline().strip().split(",")
            row_count = sum(1 for _ in f)

        self.file_row_count = row_count
        self.file_headers = headers
        self.save(update_fields=("file_row_count", "file_headers"))


class EnrichDetail(models.Model):
    """
    This model stores information about enrich process using CSVFile models and external API
    """

    uuid = models.UUIDField(
        default=uuid.uuid4, editable=False, unique=True, primary_key=True
    )
    csv_file = models.OneToOneField(
        "CSVFile",
        on_delete=models.CASCADE,
        related_name="enrich_detail",
    )
    status = models.CharField(
        max_length=50,
        choices=[(e.value, e.name) for e in EnrichmentStatus],
        default=EnrichmentStatus.FETCHING_RESPONSE,
        help_text="Status of process of enrichment csv file",
    )
    external_url = models.URLField(
        help_text="The origin URL which was used to enrich",
    )
    # json external response stored in file - to keep source of enrichment as API can change
    external_response = models.FileField(
        upload_to=upload_path,
        null=True,
        blank=True,
    )
    created = models.DateTimeField(auto_now_add=True)

    # Filled in celery
    # optimization for keeping external_elements_count instead count them on every request- as external_response will not change
    # optimization for keeping external_elements_key_list - as file external_response not change and may help in performance to not load whole external_response to get keys
    external_elements_count = models.IntegerField(
        null=True,
        blank=True,
        help_text="Number of dict elements",
    )
    join_type = models.CharField(
        null=True,
        blank=True,
        max_length=50,
        choices=[(e.value, e.name) for e in EnrichmentJoinType],
        help_text="Selected type of join",
    )
    is_flat = models.BooleanField(
        default=False,
        help_text="Indicates whether the dict should be flattened when stored in the table cell.",
    )
    json_root_path = models.TextField(
        default="",
        help_text="Path pointing to the root element in the JSON structure from which data should be extracted. Use this path if the data you want to process isn't directly at the top level of the JSON.",
    )
    # For future development - that should include type of data related to key. check docstring for csv_enrich_file_create view for more details
    external_elements_key_list = models.JSONField(
        blank=True,
        null=True,
        help_text="List of main keys from external_response. Use this field instead using external_response to get keys",
    )
    selected_key = models.TextField(
        help_text="Selected json key from 'external_elements_key_list' to be used to merge with 'CSVFile.file_headers'",
    )
    selected_header = models.TextField(
        help_text="Selected header from 'CSVFile.file_headers' to be used to merge with 'external_elements_key_list'",
    )

    class Meta:
        ordering = ["created"]
