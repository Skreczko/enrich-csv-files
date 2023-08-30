import uuid
from django.db import models


class CSVFile(models.Model):
    """
    This model stores csv file and basic information about it.
    """

    # separated as we should load enrich_data on demand (to not attach to every model instance)
    enrich_details = models.OneToOneField(
        "EnrichDetails",
        null=True,
        blank=True,
        on_delete=models.CASCADE,
        related_name="source",
    )
    source_instance = models.ForeignKey(
        "self",
        null=True,
        blank=True,
        on_delete=models.CASCADE,
        related_name="enriched_instances",
    )

    created = models.DateTimeField(auto_now_add=True)
    file = models.FileField(upload_to="csvs/")
    updated = models.DateTimeField(auto_now=True, null=True)
    uuid = models.UUIDField(default=uuid.uuid4, editable=False, unique=True)

    def __str__(self) -> str:
        return f"id:{self.id} name:{self.file.name}"


class EnrichDetails(models.Model):
    """
    This model stores information about enrich process using CSVFile models and external API
    """

    api_url = models.URLField(
        help_text="The origin URL which was used to enrich",
    )
    api_response = models.JSONField()
    source_column = models.TextField(
        help_text="Merged column selected from CSVFile",
    )
    api_column = models.TextField(
        help_text="Merged column selected from external API",
    )
    # Contains information enrich deep level, ie.
    # 1. Create CSVFile instance (id=1) -> EnrichDetails instance does not exists
    # 2. Create CSVFile instance (id=2) using field "source_instance=1" -> enrich_level=1
    # 3. Create CSVFile instance (id=3) using field "source_instance=2" -> enrich_level=2
    enrich_level = models.IntegerField(default=1)
    created = models.DateTimeField(auto_now_add=True)

    def __str__(self) -> str:
        return f"{self.id}-{self.api_url}"
