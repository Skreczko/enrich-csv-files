import os
from http import HTTPStatus
from unittest import mock

import pytest
from django.test import Client

from conftest import JSON_RESPONSE_DATA, create_enrich_detail_instance
from csv_manager.enums import EnrichmentJoinType, EnrichmentStatus
from csv_manager.models import CSVFile


@pytest.fixture
def test_instances(base_csv_file: CSVFile):
    csvfile_instance = CSVFile.objects.create(
        file=None, file_row_count=None, file_headers=None, source_instance=base_csv_file
    )
    enrich_detail_instance = create_enrich_detail_instance(
        json_data=JSON_RESPONSE_DATA,
        create_kwargs={
            "csv_file": csvfile_instance,
            "external_elements_count": len(JSON_RESPONSE_DATA),
            "status": EnrichmentStatus.AWAITING_COLUMN_SELECTION,
            "external_url": "https://random.com",
            "external_elements_key_list": [
                "json_header1",
                "json_header2",
                "json_header3",
            ],
        },
    )
    yield csvfile_instance, enrich_detail_instance
    os.remove(enrich_detail_instance.external_response.path)
    enrich_detail_instance.delete()
    csvfile_instance.delete()


@mock.patch(
    "csv_manager.views.api_internal.csv_enrich_file_create.process_csv_enrichment.apply_async",
    return_value=mock.Mock(id="random_task_id"),
)
@pytest.mark.parametrize(
    "selected_merge_key,is_correct_selected_merge_key",
    [
        pytest.param("json_header1", True, id="correct selected_merge_key"),
        pytest.param("random_json_header", False, id="incorrect selected_merge_key"),
    ],
)
@pytest.mark.parametrize(
    "selected_merge_header,is_correct_selected_merge_header",
    [
        pytest.param("csv_header1", True, id="correct selected_merge_header"),
        pytest.param("random_csv_header", False, id="incorrect selected_merge_header"),
    ],
)
@pytest.mark.parametrize(
    "existing_uuid",
    [
        pytest.param(True, id="correct_uuid"),
        pytest.param(False, id="random_uuid"),
    ],
)
def test_csv_enrich_file_create(
    mock_apply_async: mock.Mock,
    existing_uuid: bool,
    selected_merge_header: str,
    is_correct_selected_merge_header: bool,
    selected_merge_key: str,
    is_correct_selected_merge_key: bool,
    client: Client,
    test_instances,
):
    if existing_uuid:
        csvfile_instance, enrich_detail_instance = test_instances
        enrich_detail_uuid = str(enrich_detail_instance.uuid)
    else:
        enrich_detail_uuid = "11111111-aaaa-2222-cccc-333333333333"

    response = client.post(
        path=f"/api/_internal/enrich_file_create",
        data={
            "enrich_detail_uuid": enrich_detail_uuid,
            "selected_merge_key": selected_merge_key,
            "selected_merge_header": selected_merge_header,
            "join_type": EnrichmentJoinType.LEFT.value,
            "is_flat": False,
        },
    )

    if not existing_uuid:
        assert response.status_code == HTTPStatus.INTERNAL_SERVER_ERROR
        assert response.json() == {
            "error": f"EnrichDetail ({enrich_detail_uuid=}) matching query does not exist"
        }
        return

    if is_correct_selected_merge_header and is_correct_selected_merge_key:
        assert response.status_code == HTTPStatus.OK
        assert response.json() == {
            "csv_file_uuid": str(csvfile_instance.uuid),
            "task_id": "random_task_id",
        }
    else:
        assert response.status_code == HTTPStatus.BAD_REQUEST

        if not is_correct_selected_merge_key:
            assert response.json() == {
                "error": f"'{selected_merge_key}' not in {enrich_detail_instance.external_elements_key_list}"
            }

        elif not is_correct_selected_merge_header:
            assert response.json() == {
                "error": f"'{selected_merge_header}' not in {csvfile_instance.source_instance.file_headers}"
            }
