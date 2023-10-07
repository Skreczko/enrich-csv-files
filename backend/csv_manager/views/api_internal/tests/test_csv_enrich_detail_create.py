from http import HTTPStatus
from unittest import mock

import pytest
from django.test import Client

from csv_manager.models import CSVFile


@mock.patch(
    "csv_manager.views.api_internal.csv_enrich_detail_create.process_fetch_external_url.apply_async",
    return_value=mock.Mock(id="random_task_id"),
)
@pytest.mark.parametrize(
    "existing_uuid",
    [
        pytest.param(True, id="correct_uuid"),
        pytest.param(False, id="random_uuid"),
    ],
)
def test_csv_enrich_detail_create(
    mock_apply_async: mock.Mock,
    existing_uuid,
    client: Client,
    base_csv_file: CSVFile,
):
    uuid = (
        str(base_csv_file.uuid)
        if existing_uuid
        else "11111111-aaaa-2222-cccc-333333333333"
    )

    if existing_uuid:
        response = client.post(
            path=f"/api/_internal/csv_list/{uuid}/enrich_detail_create",
            data={"external_url": "http://google.com/", "json_root_path": ""},
        )
        assert response.status_code == HTTPStatus.OK
        assert response.json() == {
            "csv_file_uuid": str(CSVFile.objects.last().uuid),
            "task_id": "random_task_id",
        }

    else:
        with pytest.raises(CSVFile.DoesNotExist):
            client.post(
                path=f"/api/_internal/csv_list/{uuid}/enrich_detail_create",
                data={"external_url": "http://google.com/", "json_root_path": ""},
            )
