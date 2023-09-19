from collections.abc import Callable
from datetime import date
from http import HTTPStatus
from typing import Any, Literal, TypedDict

from django.http import HttpRequest, HttpResponse

from csv_manager.enums import EnrichmentJoinType

GenericFunc = Callable[[HttpRequest, Any, Any], HttpResponse]
WrapperFunc = Callable[[HttpRequest, Any, Any], HttpResponse]


class PetlTableJoinParams(TypedDict, total=False):
    left: Any
    right: Any
    lkey: str | None
    rkey: str | None
    lprefix: str | None
    rprefix: str | None


class ProcessCsvEnrichmentResponse(TypedDict):
    enrich_detail_uuid: str


class FetchTaskResultDictPending(TypedDict):
    status: Literal["PENDING"]
    results: None


class FetchTaskResultDictFailure(TypedDict):
    status: Literal["FAILURE"]
    results: None


class ErrorResultDict(TypedDict):
    error: str


FetchTaskResultDictSuccessResult = (
    ProcessCsvEnrichmentResponse | ErrorResultDict
)  # add success responses with |, ie ( SuccessResult1 | SuccessResult2)


class FetchTaskResultDictSuccess(TypedDict):
    status: Literal["SUCCESS"]
    results: FetchTaskResultDictSuccessResult


FetchTaskResultDict = (
    FetchTaskResultDictPending | FetchTaskResultDictFailure | FetchTaskResultDictSuccess
)


class CSVDetailResult(TypedDict, total=False):
    csv_detail: dict[str, Any]
    error: str
    status: HTTPStatus


class EnrichDetailSerializerType(TypedDict):
    created: date
    external_elements_count: int
    external_elements_key_list: list[str]
    external_response: Any  # this is FileField from django.db.models. Provided that, leads to fails in celery. To fix in future development
    external_url: str
    is_flat: bool
    join_type: EnrichmentJoinType
    json_root_path: str
    selected_header: str
    selected_key: str
    uuid: str


class SourceInstanceSerializerType(TypedDict):
    created: date
    uuid: str
    original_file_name: str
    file: Any  # this is FileField from django.db.models. Provided that, leads to fails in celery. To fix in future development
    file_row_count: int
    file_headers: list[str]
