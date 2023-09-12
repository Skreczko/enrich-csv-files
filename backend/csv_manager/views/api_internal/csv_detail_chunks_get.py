from http import HTTPStatus

from django.http import HttpRequest, JsonResponse
from django.views.decorators.http import require_GET

from csv_manager.forms import CSVLDetailFileRequestForm
from csv_manager.models import CSVFile
from decorators.cache_view import cache_view_response
from decorators.form_validator import validate_request_form
import petl as etl


@require_GET
@validate_request_form(CSVLDetailFileRequestForm)
@cache_view_response()
def csv_detail_chunks_get(
    request: HttpRequest, request_form: CSVLDetailFileRequestForm, uuid: str
) -> JsonResponse:
    """
    Endpoint to retrieve a specific chunk of rows from a CSV file.

    This endpoint fetches a specified chunk of rows from a CSV file identified by its UUID.
    The chunk size is defined, and the chunk number is provided in the request.
    The response includes the headers, the rows for the specified chunk, and the UUID of the CSV file.

    Responses are cached to improve performance on subsequent requests for the same chunk.

    :param request: HttpRequest object containing the request data.
    :param request_form: CSVLDetailFileRequestForm object containing the validated form data.
    :param uuid: The UUID of the CSVFile instance to be processed.
    :return: JsonResponse object containing the headers, rows of the specified chunk, and the UUID.

    Note:
    - If the provided UUID does not correspond to any CSVFile instance, a 404 NOT FOUND response is returned.
    - The chunk size is currently set to 200 rows.
    - Cached responses are used to serve repeated requests, reducing the load on the server and improving response times.
    """

    instance = CSVFile.objects.only("uuid", "file").filter(uuid=uuid).first()

    if not instance:
        return JsonResponse(
            {"error": f"{uuid} does not exist."},
            status=HTTPStatus.NOT_FOUND,
        )

    chunk_number = request_form.cleaned_data["chunk_number"] or 0
    chunk_size = 200

    # chunk range without including table header
    start_row = chunk_number * chunk_size
    end_row = start_row + chunk_size

    try:
        table = etl.fromcsv(source=instance.file.path)
    except Exception:
        return JsonResponse(
            {"error": "Error reading CSV file."},
            status=HTTPStatus.INTERNAL_SERVER_ERROR,
        )

    return JsonResponse(
        {
            "chunk_number": chunk_number,
            "chunk_size": chunk_size,
            "headers": instance.file_headers,
            "rows": list(etl.data(etl.rowslice(table, start_row, end_row))),
            "uuid": str(uuid),
        },
        status=HTTPStatus.OK,
    )
