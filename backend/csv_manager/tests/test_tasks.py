import json
import os
import re
from http import HTTPStatus
from typing import Any
from unittest import mock

import pytest
import requests
from petl import FieldSelectionError
from requests import HTTPError, RequestException, Response

from conftest import JSON_RESPONSE_DATA, create_csvfile
from csv_manager.enums import EnrichmentStatus
from csv_manager.models import CSVFile, EnrichDetail
from csv_manager.tasks import (
    process_csv_enrichment,
    process_csv_metadata,
    process_fetch_external_url,
    remove_orphaned_csv_files,
)
from csv_manager.views.api_internal.tests.test_csv_upload import CSV_DATA


def mock_requests_get(*args: Any, **kwargs: Any) -> Response:
    response = mock.Mock()
    response.status_code = HTTPStatus.OK
    response.json.return_value = JSON_RESPONSE_DATA
    response.iter_content.side_effect = lambda *args, **kwargs: iter(
        [json.dumps(JSON_RESPONSE_DATA).encode()]
    )
    return response


def test_process_csv_metadata(
    enriched_csv_file: CSVFile,
):
    enriched_csv_file.file_row_count = None
    enriched_csv_file.file_headers = None
    enriched_csv_file.save()
    enriched_csv_file.refresh_from_db()
    assert not enriched_csv_file.file_row_count and not enriched_csv_file.file_headers

    process_csv_metadata(uuid=str(enriched_csv_file.uuid))

    enriched_csv_file.refresh_from_db()
    assert enriched_csv_file.file_row_count == 3
    assert enriched_csv_file.file_headers == [
        "csv_header1",
        "csv_header2",
        "json_header2",
        "json_header3",
    ]


@mock.patch(
    "csv_manager.tasks.get_and_serialize_csv_detail",
    return_value={"csv_detail": "mocked_csv_detail"},
)
@mock.patch("csv_manager.tasks.requests.get", side_effect=mock_requests_get)
def test_process_fetch_external_url(
    mock_requests_get: mock.Mock,
    mock_get_and_serialize_csv_detail: mock.Mock,
    base_csv_file: CSVFile,
):
    csvfile_instance = CSVFile.objects.create(source_instance=base_csv_file)
    enrich_detail_instance = EnrichDetail.objects.create(
        csv_file_id=csvfile_instance.uuid,
        external_url="https://random.com",
        json_root_path="results",
    )
    result = process_fetch_external_url(
        enrich_detail_uuid=str(enrich_detail_instance.uuid)
    )

    enrich_detail_instance.refresh_from_db()

    assert result == "mocked_csv_detail"

    if os.path.exists(enrich_detail_instance.external_response.path):
        os.remove(enrich_detail_instance.external_response.path)


def test_process_fetch_external_url_wrong_uuid():
    enrich_detail_uuid = "11111111-aaaa-2222-cccc-333333333333"
    with pytest.raises(
        ValueError,
        match=re.escape(
            f"Enrich detail (enrich_detail_uuid='{enrich_detail_uuid}') does not exist"
        ),
    ):
        process_fetch_external_url(enrich_detail_uuid=enrich_detail_uuid)


@mock.patch("csv_manager.tasks.requests.get", side_effect=mock_requests_get)
def test_process_fetch_external_url_response_exception_raise_for_status(
    mock_requests_get: mock.Mock, enriched_csv_file: CSVFile
):
    def side_effect_func(*args: Any, **kwargs: Any) -> Response:
        response = mock.Mock()
        response.status_code = HTTPStatus.NOT_FOUND
        response.raise_for_status.side_effect = HTTPError
        return response

    mock_requests_get.side_effect = side_effect_func

    with pytest.raises(requests.HTTPError):
        process_fetch_external_url(
            enrich_detail_uuid=str(enriched_csv_file.enrich_detail.uuid)
        )

    enriched_csv_file.enrich_detail.refresh_from_db()
    assert (
        enriched_csv_file.enrich_detail.status
        == EnrichmentStatus.FAILED_FETCHING_RESPONSE_INCORRECT_URL_STATUS.value
    )


@mock.patch("csv_manager.tasks.requests.get", side_effect=RequestException)
def test_process_fetch_external_url_response_exception_failed_fetching_response(
    mock_requests_get: mock.Mock, enriched_csv_file: CSVFile
):
    with pytest.raises(ValueError):
        process_fetch_external_url(
            enrich_detail_uuid=str(enriched_csv_file.enrich_detail.uuid)
        )

    enriched_csv_file.enrich_detail.refresh_from_db()
    assert (
        enriched_csv_file.enrich_detail.status
        == EnrichmentStatus.FAILED_FETCHING_RESPONSE_OTHER_REQUEST_EXCEPTION.value
    )


@mock.patch("csv_manager.tasks.requests.get", side_effect=Exception("Unexpected error"))
def test_process_fetch_external_url_response_exception_request_generic(
    mock_requests_get: mock.Mock, enriched_csv_file: CSVFile
):
    with pytest.raises(Exception, match="Unexpected error"):
        process_fetch_external_url(
            enrich_detail_uuid=str(enriched_csv_file.enrich_detail.uuid)
        )

    enriched_csv_file.enrich_detail.refresh_from_db()
    assert (
        enriched_csv_file.enrich_detail.status
        == EnrichmentStatus.FAILED_FETCHING_RESPONSE
    )


@pytest.mark.parametrize(
    "json_value,match",
    [
        pytest.param(
            '{"key": "value"',
            "The response is not a valid JSON",
            id="The response is not a valid JSON",
        ),
        pytest.param(
            "{}",
            "The JSON response is empty or URL JSON root path is wrong",
            id="The JSON response is empty",
        ),
    ],
)
@mock.patch("csv_manager.tasks.requests.get", side_effect=mock_requests_get)
def test_process_fetch_external_url_response_exception_incorrect_json(
    mock_requests_get: mock.Mock,
    json_value: str,
    match: str,
    enriched_csv_file: CSVFile,
):
    def side_effect_func(*args: Any, **kwargs: Any) -> Response:
        response = mock.Mock()
        response.status_code = HTTPStatus.OK
        response.iter_content.side_effect = lambda *args, **kwargs: iter(
            [json_value.encode()]
        )
        return response

    mock_requests_get.side_effect = side_effect_func

    with pytest.raises(ValueError, match=match):
        process_fetch_external_url(
            enrich_detail_uuid=str(enriched_csv_file.enrich_detail.uuid)
        )


def test_remove_orphaned_csv_files(multiple_enriched_csv_files: None):
    deleted_uuid_list = list(
        CSVFile.objects.filter(enrich_detail__isnull=False).values(
            "uuid", "enrich_detail__uuid"
        )
    )[:5]
    CSVFile.objects.filter(
        uuid__in=[csvfile["uuid"] for csvfile in deleted_uuid_list]
    ).delete()

    result = remove_orphaned_csv_files()

    assert (
        result["orphaned_csv_files"].sort()
        == [f"{csvfile['uuid']}.csv" for csvfile in deleted_uuid_list].sort()
    )
    assert (
        result["orphaned_json_files"].sort()
        == [
            f"{csvfile['enrich_detail__uuid']}.json" for csvfile in deleted_uuid_list
        ].sort()
    )


@mock.patch(
    "csv_manager.tasks.get_and_serialize_csv_detail",
    return_value={"csv_detail": "mocked_csv_detail"},
)
@mock.patch("csv_manager.tasks.create_enrich_table_by_join_type")
def test_process_csv_enrichment_correct_uuid(
    mock_create_enrich_table_by_join_type: mock.Mock,
    mock_get_and_serialize_csv_detail: mock.Mock,
    csvfile_instance_in_enrich_process: CSVFile,
):
    def side_effect_func(
        source_instance_file_path: str,
        enriched_csv_file_name: str,
        *args: Any,
        **kwargs: Any,
    ) -> str:
        file_name = create_csvfile(
            csv_data=CSV_DATA, save_dir=source_instance_file_path.rsplit("/", 1)[0]
        )
        return file_name

    mock_create_enrich_table_by_join_type.side_effect = side_effect_func

    response = process_csv_enrichment(
        enrich_detail_uuid=str(csvfile_instance_in_enrich_process.enrich_detail.uuid)
    )

    assert response == "mocked_csv_detail"

    csvfile_instance_in_enrich_process.refresh_from_db()

    assert csvfile_instance_in_enrich_process.file.size
    assert csvfile_instance_in_enrich_process.file.path
    assert csvfile_instance_in_enrich_process.original_file_name
    assert csvfile_instance_in_enrich_process.file_headers == CSV_DATA[0]
    assert (
        csvfile_instance_in_enrich_process.file_row_count == len(CSV_DATA) - 1
    )  # as header should not be counted

    assert (
        csvfile_instance_in_enrich_process.enrich_detail.status
        == EnrichmentStatus.COMPLETED
    )


def test_process_csv_enrichment_incorrect_uuid(
    csvfile_instance_in_enrich_process: CSVFile,
):
    with pytest.raises(EnrichDetail.DoesNotExist):
        process_csv_enrichment(
            enrich_detail_uuid="11111111-aaaa-2222-cccc-333333333333"
        )


@mock.patch(
    "csv_manager.tasks.create_enrich_table_by_join_type",
    side_effect=FieldSelectionError("random_value"),
)
def test_process_csv_enrichment_exception_error(
    mock_create_enrich_table_by_join_type: mock.Mock,
    csvfile_instance_in_enrich_process: CSVFile,
):
    enrich_detail = csvfile_instance_in_enrich_process.enrich_detail
    with pytest.raises(FieldSelectionError):
        process_csv_enrichment(enrich_detail_uuid=str(enrich_detail.uuid))

    enrich_detail.refresh_from_db()

    assert enrich_detail.status == EnrichmentStatus.FAILED_ENRICHING
