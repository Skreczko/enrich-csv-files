from http import HTTPStatus

from django.http import HttpRequest, JsonResponse
from django.views.decorators.http import require_GET

from csv_manager.forms import CSVListFileRequestForm
from csv_manager.models import CSVFile
from transformer.form_validator import validate_request_form
from transformer.paginator import CustomPaginator
from transformer.serializers import serialize_instance_list


@require_GET
@validate_request_form(CSVListFileRequestForm)
def csv_list(
    request: HttpRequest, request_form: CSVListFileRequestForm
) -> JsonResponse:
    """
    Endpoint to list CSV files.

    This endpoint allows to retrieve a list of uploaded CSV files.
    The results can be paginated, sorted, and filtered by a search query.

    :param request: HttpRequest object
    :param request_form: CSVListFileRequestForm object
    :return: JsonResponse object containing a list of serialized CSVFile and paginator details.

    Note:
    - OPTIMIZATION: Use DRF. Avoid custom serialize ie. FileField, relations with other database tables etc.
    - missing csrf
    """

    page_number = request_form.cleaned_data["page_number"] or 1
    page_size = request_form.cleaned_data["page_size"]
    sort = request_form.cleaned_data["sort"]
    search = request_form.cleaned_data["search"]
    date_from = request_form.cleaned_data["date_from"]
    date_to = request_form.cleaned_data["date_to"]

    queryset = CSVFile.objects.all()
    filter_kwargs: dict = {}

    if search:
        filter_kwargs.update(uuid__icontains=search)
    if date_from:
        filter_kwargs.update(created__gte=date_from)
    if date_to:
        filter_kwargs.update(created__lte=date_to)

    queryset = queryset.filter(**filter_kwargs)
    if sort:
        queryset = queryset.order_by(sort)

    paginator = CustomPaginator(queryset=queryset, page_size=page_size)
    instance_list: list[CSVFile] = paginator.paginate_queryset(page_number)
    result = serialize_instance_list(
        instance_list=instance_list, fields=["uuid", "created", "file"]
    )

    return JsonResponse(
        {
            "result": result,
            "paginator": paginator.get_paginator_details(),
        },
        status=HTTPStatus.OK,
    )
