from http import HTTPStatus
from typing import Any, Literal, TypedDict, cast

from celery.result import AsyncResult
from django.http import HttpRequest, JsonResponse
from django.views.decorators.http import require_POST

from csv_manager.forms import FetchTaskResultsRequestForm
from decorators.form_validator import validate_request_form


FetchTaskResultDictSuccessResult = Any  # todo typeddict for success resposne


class FetchTaskResultDictPending(TypedDict):
    status: Literal["PENDING"]
    results: None


class FetchTaskResultDictFailure(TypedDict):
    status: Literal["FAILURE"]
    results: None


class FetchTaskResultDictSuccess(TypedDict):
    status: Literal["SUCCESS"]
    results: FetchTaskResultDictSuccessResult


class ErrorResultDict(TypedDict):
    error: str


FetchTaskResultDict = (
    FetchTaskResultDictPending | FetchTaskResultDictFailure | FetchTaskResultDictSuccess
)


def build_response_dict(async_result: AsyncResult) -> FetchTaskResultDict:
    result = async_result.result
    results: FetchTaskResultDictSuccessResult | None
    if isinstance(result, Exception):
        results = ErrorResultDict(error=str(result))
    else:
        results = cast(FetchTaskResultDictSuccessResult | None, result)
    return cast(
        FetchTaskResultDict,
        {
            "results": results,
            "status": async_result.status,
        },
    )


@require_POST
@validate_request_form(FetchTaskResultsRequestForm)
def fetch_task_results(
    request: HttpRequest, request_form: FetchTaskResultsRequestForm, *args: Any
) -> JsonResponse:
    task_ids_data = {}
    for task_id in request_form.cleaned_data["task_ids"]:
        async_result: AsyncResult = AsyncResult(task_id)
        task_ids_data[task_id] = build_response_dict(async_result)

    return JsonResponse(
        task_ids_data,
        status=HTTPStatus.OK,
    )
