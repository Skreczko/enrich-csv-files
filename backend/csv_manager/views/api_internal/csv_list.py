from http import HTTPStatus

from django.http import HttpRequest, JsonResponse
from django.views.decorators.http import require_GET

from csv_manager.forms import CSVListFileRequestForm
from csv_manager.models import CSVFile
from transformer.form_validator import validate_request_form
from transformer.serializers import serialize_queryset


@require_GET
@validate_request_form(CSVListFileRequestForm)
def csv_list(
    request: HttpRequest, request_form: CSVListFileRequestForm
) -> JsonResponse:
    """
    Endpoint to upload CSV files
    """
    page_number = request_form.cleaned_data["page_number"]
    page_size = request_form.cleaned_data["page_size"]
    sort = request_form.cleaned_data["sort"]
    search = request_form.cleaned_data["search"]
    
    queryset = CSVFile.objects.all()
    
    if search:
        # todo created_from / created_to
        queryset = queryset.filter()
    
    if sort:
        queryset = queryset.order_by(search)

    data = serialize_queryset(queryset=CSVFile.objects.all())

    return JsonResponse(data, status=HTTPStatus.OK)
