from http import HTTPStatus
from typing import Any, cast

from django.http import HttpRequest, JsonResponse
from django.views.decorators.http import require_POST

from csv_manager.forms import CSVUploadRequestForm
from csv_manager.models import CSVFile
from decorators.form_validator import validate_request_form
from transformer.serializers import serialize_instance


@require_POST
@validate_request_form(CSVUploadRequestForm)
def csv_upload(
    request: HttpRequest,
    request_form: CSVUploadRequestForm,
    *args: Any,  # args needed for mypy, because in some endpoints we pass args, ie uuid as url parameter.
) -> JsonResponse:
    """
    Handle the upload of a CSV file.

    This endpoint is designed to accept a CSV file, create a new CSVFile instance,
    save it to the database, and then asynchronously count the number of rows in the uploaded file.

    :param request: HttpRequest object containing all the details of the upload.
    :param request_form: Validated form containing the uploaded file.
    :return: JsonResponse object with the name of the uploaded file.

    Note:
    - Used TemporaryFileUploadHandler and FILE_UPLOAD_MAX_MEMORY_SIZE - chunks number can be checked with `list(file.chunks())`
      for more details check https://docs.djangoproject.com/en/3.2/ref/files/uploads/#uploaded-files
    - CSRF protection is currently missing as there is no user instance. This should be addressed in future development.
    - OPTIMIZATION: Consider refactoring to process chunks of the file, merge them, and then create the CSVFile object.
    """

    from csv_manager.tasks import process_csv_metadata
    from celery import Task

    file = request_form.cleaned_data["file"]
    instance = CSVFile.objects.create(file=file, original_file_name=file.name)

    celery_task = cast(
        Task, process_csv_metadata
    )  # mypy has problem because it does not recognize that process_csv_metadata as Task. TODO Fix to future development
    celery_task.apply_async(
        args=(),
        kwargs={
            "uuid": str(instance.uuid),
        },
        serializer="json",  # didn't use pickle (which could reduce database requests) due to security concerns.
    )

    return JsonResponse(
        data=serialize_instance(
            instance=instance, fields=["uuid", "original_file_name"]
        ),
        status=HTTPStatus.OK,
    )
