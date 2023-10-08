import os
from collections.abc import Callable
from datetime import datetime
from http import HTTPStatus
from unittest import mock
from unittest.mock import MagicMock

import pytest
from django.test import Client
from freezegun import freeze_time

from conftest import (
    _create_csvfile_instance,
)
from csv_manager.models import CSVFile


def get_path(uuid: str) -> str:
    return f"/api/_internal/csv_list/{uuid}/read_preview_chunk"


@pytest.fixture
def csv_file() -> CSVFile:
    """CSV file instance without enriching"""
    with freeze_time(datetime(2023, 6, 1)):
        csv_instance = _create_csvfile_instance(
            csv_data=[
                ["csv_header1", "csv_header2"],
            ]
            + list([f"row{index}_col1", f"row{index}_col2"] for index in range(1, 210)),
        )
    yield csv_instance
    os.remove(csv_instance.file.path)
    csv_instance.delete()


def mock_cache_view_response(timeout: int | None = None) -> Callable:
    def decorator(func: Callable) -> Callable:
        return func

    return decorator


@pytest.mark.parametrize(
    "existing_uuid",
    [
        pytest.param(True, id="correct_uuid"),
        pytest.param(False, id="random_uuid"),
    ],
)
@pytest.mark.parametrize(
    "provide_chunk_number",
    [
        pytest.param(True, id="provide chunk number"),
        pytest.param(False, id=""),
    ],
)
@mock.patch("decorators.cache_view.cache_view_response", mock_cache_view_response)
def test_csv_preview_chunks_get(
    provide_chunk_number: bool,
    existing_uuid: bool,
    client: Client,
    csv_file: CSVFile,
):
    uuid = (
        str(csv_file.uuid) if existing_uuid else "11111111-aaaa-2222-cccc-333333333333"
    )

    response = client.get(
        path=get_path(uuid),
        data={
            "chunk_number": 1,
        }
        if provide_chunk_number
        else {},
    )
    if not existing_uuid:
        assert response.status_code == HTTPStatus.NOT_FOUND
        assert response.json() == {"error": f"{uuid} does not exist or not completed."}
        return

    if provide_chunk_number:
        response_rows = list(
            [f"row{index}_col1", f"row{index}_col2"] for index in range(201, 210)
        )
    else:
        response_rows = list(
            [f"row{index}_col1", f"row{index}_col2"] for index in range(1, 201)
        )

    data = {
        "chunk_number": 1 if provide_chunk_number else 0,
        "chunk_size": 200,
        "headers": ["csv_header1", "csv_header2"],
        "rows": response_rows,
        "total_rows": 210,
        "uuid": str(csv_file.uuid),
    }

    assert response.status_code == HTTPStatus.OK
    assert response.json() == data


@mock.patch("decorators.cache_view.cache_view_response", mock_cache_view_response)
@mock.patch(
    "csv_manager.views.api_internal.csv_preview_chunks_get.etl.fromcsv",
    side_effect=Exception("random_exception_message"),
)
def test_csv_preview_chunks_get_sentry_error(
    mock_sentry_capture_exception: MagicMock, client: Client, csv_file: CSVFile
):
    response = client.get(path=get_path(str(csv_file.uuid)), data={})
    assert mock_sentry_capture_exception.called
    assert response.status_code == HTTPStatus.INTERNAL_SERVER_ERROR
    assert response.json() == {"error": "Error reading CSV file."}
