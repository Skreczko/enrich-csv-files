from http import HTTPStatus
from typing import Any

from django.http import HttpRequest, JsonResponse
from django.views.decorators.http import require_POST

from csv_manager.forms import (
    CSVDetailDeleteRequestForm,
)
from csv_manager.models import CSVFile
from decorators.form_validator import validate_request_form


@require_POST
@validate_request_form(CSVDetailDeleteRequestForm)
def csv_detail_delete(
    request: HttpRequest, request_form: CSVDetailDeleteRequestForm, *args: Any
) -> JsonResponse:
    """
    Endpoint to delete a CSV record.

    This endpoint deletes a CSV file record identified by its UUID from the database. The physical deletion of the CSV file
    is not yet implemented but should be handled asynchronously using Celery in future development to offload the system.

    :param request: HttpRequest object containing the request data.
    :param request_form: CSVDetailDeleteRequestForm object containing the validated form data, including the CSV file UUID.
    :return: JsonResponse object containing the UUID of the file record marked for deletion.

    Note:
    - Only the database record is deleted. Physical file deletion is pending for future development and should be
      handled asynchronously using Celery for system optimization.
    """
    instance_uuid = request_form.cleaned_data["uuid"]
    CSVFile.objects.filter(uuid=instance_uuid).delete()

    return JsonResponse(
        {"csvfile_uuid": instance_uuid},
        status=HTTPStatus.OK,
    )
