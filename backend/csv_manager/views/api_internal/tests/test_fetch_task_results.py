import json
from http import HTTPStatus
from typing import Any
from unittest import mock

import pytest
from django.test import Client

from csv_manager.models import CSVFile
from csv_manager.types import ErrorResultDict, FetchTaskResultDict

TASK_ID_MAPPING_REQUEST: dict[str, FetchTaskResultDict] = {
    "d2db41bc-fc09-43ca-9917-e8ec88c74774": {"status": "PENDING", "results": None},
    "c5517601-425e-4de1-8d3c-fa5e273ec267": {
        "status": "FAILURE",
        "results": Exception(
            "The JSON response is empty or URL JSON root path is wrong"
        ),
    },
    "4bf14e04-7470-40bd-a519-4c65e1270d4c": {
        "status": "SUCCESS",
        "results": {"random_key": "random_value"},
    },
}

# FAILURE STATUS
# For the task with a FAILURE status, we change the response.
# This is because the task raises an exception, and we convert that exception into an ErrorResultDict for the response.

# TODO: For some reason, pytest doesn't recognize that the Exception in
#  fetch_task_results.py:fetch_task_results::21 is covered. It reports only 95% coverage.
TASK_ID_MAPPING_RESPONSE: dict[str, FetchTaskResultDict] = TASK_ID_MAPPING_REQUEST
TASK_ID_MAPPING_RESPONSE["c5517601-425e-4de1-8d3c-fa5e273ec267"][
    "results"
] = ErrorResultDict(error="The JSON response is empty or URL JSON root path is wrong")


@mock.patch(
    "csv_manager.views.api_internal.fetch_task_results.AsyncResult",
)
@pytest.mark.parametrize(
    "task_id",
    [
        pytest.param("d2db41bc-fc09-43ca-9917-e8ec88c74774", id="PENDING"),
        pytest.param("c5517601-425e-4de1-8d3c-fa5e273ec267", id="FAILURE"),
        pytest.param("4bf14e04-7470-40bd-a519-4c65e1270d4c", id="SUCCESS"),
    ],
)
def test_fetch_task_results(
    mock_AsyncResult: mock.Mock,
    task_id: str,
    client: Client,
    base_csv_file: CSVFile,
):
    def side_effect_func(task_uuid: str, **kwargs: Any) -> mock.Mock:
        task = TASK_ID_MAPPING_REQUEST[task_uuid]

        return mock.Mock(result=task["results"], status=task["status"])

    mock_AsyncResult.side_effect = side_effect_func

    response = client.post(
        path=f"/api/_internal/fetch_task_results",
        data={
            "task_ids": json.dumps(
                [
                    task_id,
                ]
            )
        },
    )
    assert response.status_code == HTTPStatus.OK
    assert response.json() == {task_id: TASK_ID_MAPPING_RESPONSE[task_id]}
