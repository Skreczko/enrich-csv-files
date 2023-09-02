from http import HTTPStatus

from django.http import HttpRequest, JsonResponse
from django.views.decorators.http import require_POST

from csv_manager.forms import CSVUploadFileRequestForm
from csv_manager.models import CSVFile
from transformer.form_validator import validate_request_form


# csrf missing - no user. For future development
# For future development - refactor to get chunks of file, merge them and then create CSVFile object.
@require_POST
@validate_request_form(CSVUploadFileRequestForm)
def csv_upload(
    request: HttpRequest, request_form: CSVUploadFileRequestForm
) -> JsonResponse:
    """
    Endpoint to upload CSV files and return currently uploaded file.name
    """
    file = request_form.cleaned_data["file"]
    CSVFile.objects.create(
        file=file,
    )
    return JsonResponse({"name": file.name}, status=HTTPStatus.OK)
