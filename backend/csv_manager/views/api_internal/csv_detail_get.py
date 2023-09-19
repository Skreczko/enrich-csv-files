from django.http import HttpRequest, JsonResponse
from django.views.decorators.http import require_GET

from csv_manager.helpers import get_and_serialize_csv_detail


@require_GET
def csv_detail_get(
    request: HttpRequest,
    uuid: str,
) -> JsonResponse:
    """
    Endpoint to retrieve details of a specific CSV file by UUID.

    This endpoint uses the `get_and_serialize_csv_detail` function to fetch and serialize details
    of a CSV file using its UUID. It provides information such as the creation date, enrichment details,
    file headers, row count, original file name, and more. If the CSV file with the provided UUID
    does not exist, an error response is returned.

    :param request: HttpRequest object
    :param uuid: UUID of the CSV file to retrieve details for
    :return: JsonResponse object containing detailed information about the specified CSVFile.

    Note:
    - OPTIMIZATION: Consider using DRF for more standardized serialization.
    - Missing csrf protection.
    """

    serialized_csv_detail = get_and_serialize_csv_detail(uuid=uuid)
    status = serialized_csv_detail.pop("status")

    return JsonResponse(
        serialized_csv_detail.get("csv_detail", serialized_csv_detail.get("error")),
        status=status,
    )
