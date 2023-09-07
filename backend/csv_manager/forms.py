from django import forms

from csv_manager.enums import CsvListSortColumn


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
    page_number = forms.IntegerField(required=False)
    page_size = forms.IntegerField(required=False)
    search = forms.CharField(required=False)
    sort = forms.ChoiceField(
        required=False,
        choices=[(e, e.value) for e in CsvListSortColumn],
        initial=CsvListSortColumn.CREATED_DESC.value,
    )


class CSVLDetailFileRequestForm(forms.Form):
    chunk_number = forms.IntegerField(required=False)


class CSVEnrichDetailCreateRequestForm(forms.Form):
    external_url = forms.URLField()


class CSVEnrichFileRequestForm(forms.Form):
    enrich_detail_id = forms.IntegerField()
    selected_merge_key = forms.CharField()
    selected_merge_header = forms.CharField()
