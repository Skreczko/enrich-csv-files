from collections.abc import Callable
from typing import Any, TypedDict

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
    enrich_detail_id: int
