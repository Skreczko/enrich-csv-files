from datetime import date, timedelta
from http import HTTPStatus
from typing import Any, TypedDict

from django.db import models
from django.db.models import Case, F, IntegerField, Q, QuerySet, Value, When
from django.http import HttpRequest, JsonResponse
from django.views.decorators.http import require_GET

from csv_manager.enums import (
    CsvListFileTypeFilter,
    CsvListSortColumn,
    CsvListStatusFilter,
    EnrichmentStatus,
)
from csv_manager.forms import CSVListFileRequestForm
from csv_manager.models import CSVFile
from decorators.form_validator import validate_request_form
from transformer.paginator import CustomPaginator
from transformer.serializers import serialize_queryset
from transformer.exceptions import SerializationError


class EnrichDetailSerializerType(TypedDict):
    # created: date
    # external_elements_key_list: list[str]
    external_url: str
    # uuid: str


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

    filter_date_from = request_form.cleaned_data["filter_date_from"]
    filter_date_to = request_form.cleaned_data["filter_date_to"]
    filter_status = request_form.cleaned_data["filter_status"]
    filter_file_type = request_form.cleaned_data["filter_file_type"]

    queryset = CSVFile.objects.select_related("enrich_detail", "source_instance").only(
        "original_file_name",
        "created",
        "uuid",
        "source_instance__original_file_name",
        "source_instance__uuid",
        "enrich_detail__external_url",
        "enrich_detail__status",
    ).annotate(
        source_uuid=F("source_instance__uuid"),
        source_original_file_name=F("source_instance__original_file_name"),
        enrich_url=F("enrich_detail__external_url"),
        # take status from "enrich_detail.status". If "enrich_detail" does not exist - that mean file has been created
        # in upload process. Return status "finished" by default.
        status=Case(
            When(enrich_detail__isnull=False, then=F("enrich_detail__status")),
            default=Value(EnrichmentStatus.COMPLETED),
            output_field=models.CharField(),
        ),
    )
    query_filters = Q()

    if search:
        query_filters &= (
            Q(uuid__icontains=search)
            | Q(original_file_name__icontains=search)
            | Q(enrich_detail__external_url__icontains=search)
        )

    if filter_date_from:
        query_filters &= Q(created__gte=filter_date_from)

    if filter_date_to:
        # Adding one day to 'filter_date_to' to include the entire specified day in the filter.
        query_filters &= Q(created__lt=filter_date_to + timedelta(days=1))

    if filter_status:
        if filter_status == CsvListStatusFilter.COMPLETED:
            query_filters &= Q(status=EnrichmentStatus.COMPLETED)
        elif filter_status == CsvListStatusFilter.FAILED:
            query_filters &= ~Q(
                status__in=[
                    EnrichmentStatus.FETCHING_RESPONSE,
                    EnrichmentStatus.AWAITING_COLUMN_SELECTION,
                    EnrichmentStatus.ENRICHING,
                    EnrichmentStatus.COMPLETED,
                ]
            )
        elif filter_status == CsvListStatusFilter.IN_PROGRESS:
            query_filters &= Q(
                status__in=[
                    EnrichmentStatus.FETCHING_RESPONSE,
                    EnrichmentStatus.AWAITING_COLUMN_SELECTION,
                    EnrichmentStatus.ENRICHING,
                ]
            )

    if filter_file_type:
        query_filters &= Q(
            enrich_detail__isnull=filter_file_type == CsvListFileTypeFilter.SOURCE
        )

    queryset = queryset.filter(query_filters)

    if sort:
        if sort in [CsvListSortColumn.STATUS_ASC, CsvListSortColumn.STATUS_DESC]:

            def order_by_status(
                queryset: QuerySet[CSVFile], reverse: bool = False
            ) -> QuerySet[CSVFile]:
                ordering = [
                    When(status=value, then=Value(index))
                    for index, value in enumerate(
                        EnrichmentStatus.get_all_values(reverse=reverse)
                    )
                ]

                return queryset.annotate(
                    order_status=Case(*ordering, output_field=IntegerField())
                ).order_by("order_status")

            if sort == CsvListSortColumn.STATUS_ASC:
                queryset = order_by_status(queryset)
            if sort == CsvListSortColumn.STATUS_DESC:
                queryset = order_by_status(queryset, reverse=True)

        else:
            queryset = queryset.order_by(sort)

    paginator = CustomPaginator(queryset=queryset, page_size=page_size)
    queryset = paginator.paginate_queryset(page)
    try:
        result = serialize_queryset(
            queryset=queryset,
            fields=[
                "created",
                "enrich_detail",
                # "file",
                # "file_headers",
                # "file_row_count",
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
