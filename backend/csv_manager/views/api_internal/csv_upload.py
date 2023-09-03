from http import HTTPStatus

from django.http import HttpRequest, JsonResponse
from django.views.decorators.http import require_POST

from csv_manager.forms import CSVUploadFileRequestForm
from csv_manager.models import CSVFile
from transformer.form_validator import validate_request_form


@require_POST
@validate_request_form(CSVUploadFileRequestForm)
def csv_upload(
    request: HttpRequest, request_form: CSVUploadFileRequestForm
) -> JsonResponse:
    """
    Endpoint to handle CSV file upload.
    This endpoint accepts only a CSV file, creates a new CSVFile instance, and saves it to the database.
    It returns a JsonResponse with the name of the uploaded file.

    :param request: HttpRequest object
    :param request_form: CSVUploadFileRequestForm object
    :return: JsonResponse object with the name of the uploaded file


    Note:
    - csrf missing as there is no user instance. For future development
    - OPTIMIZATION: refactor to get chunks of file, merge them and then create CSVFile object.
    """

    file = request_form.cleaned_data["file"]
    CSVFile.objects.create(
        file=file,
    )
    return JsonResponse({"name": file.name}, status=HTTPStatus.OK)
