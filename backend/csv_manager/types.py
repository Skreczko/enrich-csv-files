from collections.abc import Callable
from typing import Any, Literal, TypedDict

from django.http import HttpRequest, HttpResponse

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
