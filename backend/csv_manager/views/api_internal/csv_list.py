from datetime import date
from http import HTTPStatus
from typing import Any, TypedDict

from django.db import models
from django.db.models import Case, F, Value, When
from django.http import HttpRequest, JsonResponse
from django.views.decorators.http import require_GET

from csv_manager.enums import EnrichmentStatus
from csv_manager.forms import CSVListFileRequestForm
from csv_manager.models import CSVFile
from decorators.form_validator import validate_request_form
from transformer.paginator import CustomPaginator
from transformer.serializers import serialize_queryset
from transformer.exceptions import SerializationError


class EnrichDetailSerializerType(TypedDict):
    created: date
    external_elements_key_list: list[str]
    external_url: str
    uuid: str


@require_GET
@validate_request_form(CSVListFileRequestForm)
def csv_list(
    request: HttpRequest,
    request_form: CSVListFileRequestForm,
    *args: Any,  # args needed for mypy, because in some endpoints we pass args, ie uuid as url parameter.
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

    page = request_form.cleaned_data["page"] or 1
    page_size = request_form.cleaned_data["page_size"]
    sort = request_form.cleaned_data["sort"]
    search = request_form.cleaned_data["search"]
    date_from = request_form.cleaned_data["date_from"]
    date_to = request_form.cleaned_data["date_to"]

    queryset = CSVFile.objects.select_related("enrich_detail").annotate(
        source_uuid=F("source_instance__uuid"),
        source_original_file_name=F("source_instance__original_file_name"),
        # take status from "enrich_detail.status". If "enrich_detail" does not exist - that mean file has been created
        # in upload process. Return status "finished" by default.
        status=Case(
            When(enrich_detail__isnull=False, then=F("enrich_detail__status")),
            default=Value(EnrichmentStatus.COMPLETED),
            output_field=models.CharField(),
        ),
    )
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
    queryset = paginator.paginate_queryset(page)
    try:
        result = serialize_queryset(
            queryset=queryset,
            fields=[
                "created",
                "enrich_detail",
                "file",
                "file_headers",
                "file_row_count",
                "original_file_name",
                "source_original_file_name",
                "source_uuid",
                "status",
                "uuid",
            ],
            select_related_model_mapping={"enrich_detail": EnrichDetailSerializerType},
        )
    except SerializationError as e:
        return JsonResponse(
            {
                "error": f"Could not serialize field {e.field} of instance {e.instance}",
            },
            status=HTTPStatus.INTERNAL_SERVER_ERROR,
        )

    return JsonResponse(
        {
            "result": result,
            "paginator": paginator.get_paginator_details(),
        },
        status=HTTPStatus.OK,
    )
