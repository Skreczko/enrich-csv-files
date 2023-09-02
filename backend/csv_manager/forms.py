from django import forms



class CSVUploadFileRequestForm(forms.Form):
    # Additional logic may be required, ie. validation on max size of file or something.
    def clean_file(self):
        file = self.cleaned_data["file"]
        if not file.name.endswith(".csv"):
            raise forms.ValidationError(f"Incorrect file type ({file.content_type})")
        return file

