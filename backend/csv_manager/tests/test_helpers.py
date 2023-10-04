from http import HTTPStatus
from typing import Any
from unittest import mock
from unittest.mock import ANY, Mock
from uuid import UUID

import pytest

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
    csv_file: CSVFile,
) -> None:
    uuid = (
        str(csv_file.uuid) if existing_uuid else "cb628d4c-53d0-484c-a87a-f04f7d93b6e6"
    )

    def side_effect_func(*args: Any, **kwargs: Any) -> list[dict[str, Any]]:
        if raise_error:
            raise SerializationError(csv_file, "random_field")
        return original_serialize_queryset(*args, **kwargs)

    mock_serialize_queryset.side_effect = side_effect_func

    if existing_uuid:
        if raise_error:
            response = {
                "error": f"Could not serialize field random_field of instance {csv_file}",
                "status": HTTPStatus.INTERNAL_SERVER_ERROR,
            }
        else:
            response = {
                "csv_detail": {
                    "created": ANY,
                    "enrich_detail": None,
                    "file": {
                        "url": f"/media/files/no_user/{uuid}.csv",
                        "size": 0,
                    },
                    "file_headers": None,
                    "file_row_count": None,
                    "original_file_name": "temp.csv",
                    "source_original_file_name": None,
                    "source_uuid": None,
                    "status": "completed",
                    "uuid": UUID(uuid),
                    "source_instance": None,
                },
                "status": HTTPStatus.OK,
            }
    else:
        response = {"error": f"{uuid} does not exist", "status": HTTPStatus.BAD_REQUEST}

    serialized_instance = get_and_serialize_csv_detail(uuid=uuid)
    assert serialized_instance == response
