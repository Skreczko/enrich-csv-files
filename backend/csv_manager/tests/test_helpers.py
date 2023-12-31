from http import HTTPStatus
from typing import Any
from unittest import mock
from unittest.mock import ANY, Mock
from uuid import UUID

import pytest

from csv_manager.enums import CsvListStatusFilter
from csv_manager.helpers import get_and_serialize_csv_detail
from csv_manager.models import CSVFile
from transformer.exceptions import SerializationError
from transformer.serializers import serialize_queryset as original_serialize_queryset


@mock.patch("csv_manager.helpers.serialize_queryset")
@pytest.mark.parametrize(
    "existing_uuid",
    [
        pytest.param(True, id="correct_uuid"),
        pytest.param(False, id="random_uuid"),
    ],
)
@pytest.mark.parametrize(
    "raise_error",
    [
        pytest.param(True, id="error raised"),
        pytest.param(False, id=""),
    ],
)
def test_get_and_serialize_csv_detail(
    mock_serialize_queryset: Mock,
    raise_error: bool,
    existing_uuid: bool,
    base_csv_file: CSVFile,
) -> None:
    uuid = (
        str(base_csv_file.uuid)
        if existing_uuid
        else "11111111-aaaa-2222-cccc-333333333333"
    )

    def side_effect_func(*args: Any, **kwargs: Any) -> list[dict[str, Any]]:
        if raise_error:
            raise SerializationError(base_csv_file, "random_field")
        return original_serialize_queryset(*args, **kwargs)

    mock_serialize_queryset.side_effect = side_effect_func

    if existing_uuid:
        if raise_error:
            response = {
                "error": f"Could not serialize field random_field of instance {base_csv_file}",
                "status": HTTPStatus.INTERNAL_SERVER_ERROR,
            }
        else:
            response = {
                "csv_detail": {
                    "created": ANY,
                    "enrich_detail": None,
                    "file": {
                        "url": f"/media/files/no_user/{uuid}.csv",
                        "size": ANY,
                    },
                    "file_headers": ["csv_header1", "csv_header2"],
                    "file_row_count": 4,
                    "original_file_name": "temp.csv",
                    "source_original_file_name": None,
                    "source_uuid": None,
                    "status": CsvListStatusFilter.COMPLETED.value,
                    "uuid": UUID(uuid),
                    "source_instance": None,
                },
                "status": HTTPStatus.OK,
            }
    else:
        response = {"error": f"{uuid} does not exist", "status": HTTPStatus.BAD_REQUEST}

    serialized_instance = get_and_serialize_csv_detail(uuid=uuid)
    assert serialized_instance == response
