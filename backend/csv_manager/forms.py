from django import forms

from transformer.constants import CsvListSortColumn


class CSVUploadFileRequestForm(forms.Form):
    file = forms.FileField()

    # Additional logic may be required, ie. validation on max size of file or something.
    def clean_file(self) -> None:
        file = self.cleaned_data["file"]
        if not file.name.endswith(".csv"):
            raise forms.ValidationError(f"Incorrect file type ({file.content_type})")
        return file

class CSVListFileRequestForm(forms.Form):
    page_number = forms.IntegerField(required=False, initial=1)
    page_size = forms.IntegerField(required=False, initial=100)
    sort = forms.ChoiceField(
        required=False,
        choices=[(e, e.value) for e in CsvListSortColumn],
        initial=CsvListSortColumn.CREATED_DESC.value,
    )
    search = forms.CharField(required=False)

