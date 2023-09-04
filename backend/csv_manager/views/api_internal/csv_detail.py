from http import HTTPStatus

from django.http import HttpRequest, JsonResponse
from django.views.decorators.http import require_GET

from csv_manager.forms import CSVLDetailFileRequestForm
from csv_manager.models import CSVFile
from transformer.form_validator import validate_request_form
from transformer.paginator import CustomPaginator
from transformer.serializers import serialize_instance, serialize_instance_list


@require_GET
@validate_request_form(CSVLDetailFileRequestForm)
def csv_detail(
    request: HttpRequest, request_form: CSVLDetailFileRequestForm, uuid
) -> JsonResponse:
    """ """

    page_number = request_form.cleaned_data["page_number"] or 1

    instance = (
        CSVFile.objects.filter(uuid=uuid)
        .select_related("enrich_details", "source_instance")
        .first()
    )

    if not instance:
        return JsonResponse(
            {"error": f"{uuid} does not exist."},
            status=HTTPStatus.NOT_FOUND,
        )

    fields = ["uuid", "created", "file"]

    return JsonResponse(
        {
            "instance": serialize_instance(instance=instance, fields=fields),
            "result": {},
            "paginator": "",
        },
        status=HTTPStatus.OK,
    )
