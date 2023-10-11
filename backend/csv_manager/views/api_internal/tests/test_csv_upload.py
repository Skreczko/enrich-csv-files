import os
from http import HTTPStatus
from unittest import mock

import pytest
from django.test import Client

from conftest import JSON_RESPONSE_DATA, create_csvfile, create_json_file
from csv_manager.models import CSVFile

CSV_DATA = [
    [
        "csv_header1",
    ],
    [
        "row1_col1",
    ],
    [
        "row2_col1",
    ],
    [
        "row3_col1",
    ],
]


@mock.patch(
    "csv_manager.views.api_internal.csv_upload.process_csv_metadata.apply_async",
    return_value=mock.Mock(id="random_task_id"),
)
@pytest.mark.parametrize(
    "csv_file_type",
    [
        pytest.param(True, id="csv file"),
        pytest.param(False, id="not csv file"),
    ],
)
def test_upload_csv(
    mock_apply_async: mock.Mock,
    csv_file_type: bool,
    client: Client,
):
    if csv_file_type:
        file_name = create_csvfile(csv_data=CSV_DATA)
    else:
        file_name = create_json_file(json_data=JSON_RESPONSE_DATA)

    with open(file_name, "rb") as file:
        response = client.post(
            path=f"/api/_internal/csv_upload",
            data={"file": file},
        )

    # Validate if file is CSV file (only .csv are accepted)
    if csv_file_type:
        assert response.status_code == HTTPStatus.OK
        assert response.json() == {
            "original_file_name": file_name.rsplit("/", 1)[-1],
            "uuid": str(CSVFile.objects.last().uuid),
        }
    else:
        assert response.status_code == HTTPStatus.BAD_REQUEST

    os.remove(file_name)


@mock.patch(
    "csv_manager.views.api_internal.csv_upload.process_csv_metadata.apply_async",
    side_effect=Exception("random_exception_message"),
)
def test_upload_csv_raise_exception(
    mock_apply_async: mock.Mock,
    client: Client,
):
    file_name = create_csvfile(csv_data=CSV_DATA)

    with open(file_name, "rb") as file:
        response = client.post(
            path=f"/api/_internal/csv_upload",
            data={"file": file},
        )

    assert response.status_code == HTTPStatus.INTERNAL_SERVER_ERROR
    assert response.json() == {
        "error": f"An error occurred while uploading the file: random_exception_message"
    }

    os.remove(file_name)
