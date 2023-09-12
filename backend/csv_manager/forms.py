from typing import Any

from django import forms

from csv_manager.enums import CsvListSortColumn, EnrichmentJoinType
from csv_manager.fields import CharListField


class CSVUploadRequestForm(forms.Form):
    """
    Note:
    - Additional logic may be required, ie. validation on max size of file.
    """

    file = forms.FileField()

    def clean_file(self) -> None:
        file = self.cleaned_data["file"]
        if not file.name.endswith(".csv"):
            raise forms.ValidationError(f"Incorrect file type ({file.content_type})")
        return file


class CSVListFileRequestForm(forms.Form):
    date_from = forms.DateField(required=False)
    date_to = forms.DateField(required=False)
    page = forms.IntegerField()
    page_size = forms.IntegerField(required=False)
    search = forms.CharField(required=False)
    sort = forms.ChoiceField(
        choices=[(e.value, e.name) for e in CsvListSortColumn],
    )

    def __init__(self, *args: Any, **kwargs: Any) -> None:
        super().__init__(*args, **kwargs)
        available_choices = ", ".join(
            [choice[1] for choice in self.fields["sort"].choices]
        )
        self.fields["sort"].error_messages[
            "invalid_choice"
        ] = f"Select a valid choice. Available choices are: {available_choices}."


class CSVLDetailFileRequestForm(forms.Form):
    chunk_number = forms.IntegerField(required=False)


class CSVEnrichDetailCreateRequestForm(forms.Form):
    external_url = forms.URLField()


class CSVEnrichFileRequestForm(forms.Form):
    enrich_detail_uuid = forms.CharField()
    selected_merge_key = forms.CharField()
    selected_merge_header = forms.CharField()
    join_type = forms.ChoiceField(
        required=False,
        choices=[(e.value, e.name) for e in EnrichmentJoinType],
    )
    is_flat = forms.BooleanField(required=False, initial=False)

    def __init__(self, *args: Any, **kwargs: Any) -> None:
        super().__init__(*args, **kwargs)
        available_choices = ", ".join(
            [choice[1] for choice in self.fields["join_type"].choices]
        )
        self.fields["join_type"].error_messages[
            "invalid_choice"
        ] = f"Select a valid choice. Available choices are: {available_choices}."


class FetchTaskResultsRequestForm(forms.Form):
    task_ids = CharListField()
