from typing import Any

from django import forms

from csv_manager.enums import CsvListFileTypeFilter, CsvListSortColumn, CsvListStatusFilter, EnrichmentJoinType
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
    page = forms.IntegerField()
    page_size = forms.IntegerField(required=False)
    search = forms.CharField(required=False)
    sort = forms.ChoiceField(
        choices=[(e.value, e.name) for e in CsvListSortColumn],
    )
    filter_date_from = forms.DateTimeField(required=False)
    filter_date_to = forms.DateTimeField(required=False)
    filter_status = forms.ChoiceField(
        choices=[(e.value, e.name) for e in CsvListStatusFilter],
        required=False,
    )
    filter_file_type = forms.ChoiceField(
        choices=[(e.value, e.name) for e in CsvListFileTypeFilter],
        required=False,
    )


    def __init__(self, *args: Any, **kwargs: Any) -> None:
        super().__init__(*args, **kwargs)
        available_sort_choices = ", ".join(
            [choice[1] for choice in self.fields["sort"].choices]
        )
        self.fields["sort"].error_messages[
            "invalid_choice"
        ] = f"Select a valid choice. Available choices are: {available_sort_choices}."

        available_file_type_choices = ", ".join(
            [choice[1] for choice in self.fields["filter_file_type"].choices]
        )
        self.fields["filter_file_type"].error_messages[
            "invalid_choice"
        ] = f"Select a valid choice. Available choices are: {available_file_type_choices}."

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
