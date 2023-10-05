from http import HTTPStatus

import pytest
from django.test import Client

from csv_manager.enums import (
    CsvListFileTypeFilter,
    CsvListSortColumn,
    CsvListStatusFilter,
)
from csv_manager.models import CSVFile, EnrichDetail


@pytest.mark.parametrize(
    "page",
    [
        pytest.param(1, id="page=1"),
        pytest.param(100, id="page=100"),
    ],
)
def test_csv_list_page(
    page: str | int | None,
    client: Client,
    multiple_base_csv_files: list[CSVFile],
    multiple_enriched_csv_files: None,
):
    response = client.get(
        "/api/_internal/csv_list",
        data={"page": page, "page_size": 20, "sort": CsvListSortColumn.CREATED_DESC},
    )
    response_data = response.json()
    response_code = response.status_code
    assert response_data == {
        "result": [
            {
                "created": "2023-10-05T23:22:26.263Z",
                "enrich_detail": {"external_url": "https://random.com"},
                "original_file_name": "temp_file_19.enriched.csv",
                "source_original_file_name": "temp_file_19.csv",
                "source_uuid": "e8599228-772d-4d5d-92cd-6916780f323d",
                "status": "completed",
                "uuid": "54967da5-2f23-462a-8344-ca657db7cbd3",
            },
            {
                "created": "2023-10-05T23:22:26.255Z",
                "enrich_detail": {"external_url": "https://random.com"},
                "original_file_name": "temp_file_18.enriched.csv",
                "source_original_file_name": "temp_file_18.csv",
                "source_uuid": "81bfd1c6-3136-4ebd-bb98-9277ad4ce6b2",
                "status": "completed",
                "uuid": "8a00da85-e237-428b-89ff-df484fa31dee",
            },
            {
                "created": "2023-10-05T23:22:26.246Z",
                "enrich_detail": {"external_url": "https://random.com"},
                "original_file_name": "temp_file_17.enriched.csv",
                "source_original_file_name": "temp_file_17.csv",
                "source_uuid": "d717856c-220b-4824-9617-1959e52fa28c",
                "status": "completed",
                "uuid": "76079526-a79b-4238-b440-74124740d84c",
            },
            {
                "created": "2023-10-05T23:22:26.237Z",
                "enrich_detail": {"external_url": "https://random.com"},
                "original_file_name": "temp_file_16.enriched.csv",
                "source_original_file_name": "temp_file_16.csv",
                "source_uuid": "2057d485-1aef-48ac-b849-41f7cc33d593",
                "status": "completed",
                "uuid": "71391beb-16a1-4e81-9ce3-9ce70df6156c",
            },
            {
                "created": "2023-10-05T23:22:26.228Z",
                "enrich_detail": {"external_url": "https://random.com"},
                "original_file_name": "temp_file_15.enriched.csv",
                "source_original_file_name": "temp_file_15.csv",
                "source_uuid": "5bcc8719-3168-4443-bd62-05000caa1e24",
                "status": "completed",
                "uuid": "b96142c4-b7a3-46ef-b734-88d9729e36c5",
            },
            {
                "created": "2023-10-05T23:22:26.219Z",
                "enrich_detail": {"external_url": "https://random.com"},
                "original_file_name": "temp_file_14.enriched.csv",
                "source_original_file_name": "temp_file_14.csv",
                "source_uuid": "6b0ab1ba-5b95-4d27-bede-f6809ff79d40",
                "status": "completed",
                "uuid": "5a823715-cb4d-4cef-a951-8b6f5e022626",
            },
            {
                "created": "2023-10-05T23:22:26.210Z",
                "enrich_detail": {"external_url": "https://random.com"},
                "original_file_name": "temp_file_13.enriched.csv",
                "source_original_file_name": "temp_file_13.csv",
                "source_uuid": "3a6a398f-ec06-4223-a7e7-eaa959838f15",
                "status": "completed",
                "uuid": "a327ab72-856d-45ed-ad22-156f7602f0d8",
            },
            {
                "created": "2023-10-05T23:22:26.201Z",
                "enrich_detail": {"external_url": "https://random.com"},
                "original_file_name": "temp_file_12.enriched.csv",
                "source_original_file_name": "temp_file_12.csv",
                "source_uuid": "7a69ea88-8f43-41d5-986a-8e478bcbf48d",
                "status": "completed",
                "uuid": "2af72b87-5ad4-471c-9060-0511095d2caa",
            },
            {
                "created": "2023-10-05T23:22:26.192Z",
                "enrich_detail": {"external_url": "https://random.com"},
                "original_file_name": "temp_file_11.enriched.csv",
                "source_original_file_name": "temp_file_11.csv",
                "source_uuid": "6f6ad529-65ab-4c24-a9a1-fce43a6f2d2d",
                "status": "completed",
                "uuid": "2e041d82-5218-488e-8c54-f8444b9d5c6b",
            },
            {
                "created": "2023-10-05T23:22:26.183Z",
                "enrich_detail": {"external_url": "https://random.com"},
                "original_file_name": "temp_file_10.enriched.csv",
                "source_original_file_name": "temp_file_10.csv",
                "source_uuid": "04763eba-8804-46ee-9bb9-f09a25fca2a7",
                "status": "completed",
                "uuid": "907f92ac-fccf-4a6e-bd53-6cb10485ee0c",
            },
            {
                "created": "2023-10-05T23:22:26.174Z",
                "enrich_detail": {"external_url": "https://random.com"},
                "original_file_name": "temp_file_9.enriched.csv",
                "source_original_file_name": "temp_file_9.csv",
                "source_uuid": "88234090-181e-4bb9-847c-59481be1d817",
                "status": "completed",
                "uuid": "0008a4c8-90d6-4a91-bfd0-af603a137012",
            },
            {
                "created": "2023-10-05T23:22:26.164Z",
                "enrich_detail": {"external_url": "https://random.com"},
                "original_file_name": "temp_file_8.enriched.csv",
                "source_original_file_name": "temp_file_8.csv",
                "source_uuid": "d81933e2-31d3-4071-8480-6b572533d8bd",
                "status": "completed",
                "uuid": "9e3b6036-09a4-467c-ad59-f605fb480cbe",
            },
            {
                "created": "2023-10-05T23:22:26.156Z",
                "enrich_detail": {"external_url": "https://random.com"},
                "original_file_name": "temp_file_7.enriched.csv",
                "source_original_file_name": "temp_file_7.csv",
                "source_uuid": "770b125e-5f2c-448f-87bc-b26310d50154",
                "status": "completed",
                "uuid": "5e3c568c-5131-4b0e-ac22-2aa4cd03b1b2",
            },
            {
                "created": "2023-10-05T23:22:26.146Z",
                "enrich_detail": {"external_url": "https://random.com"},
                "original_file_name": "temp_file_6.enriched.csv",
                "source_original_file_name": "temp_file_6.csv",
                "source_uuid": "0c61bf1e-295f-4df7-ba23-ae5f135b051a",
                "status": "completed",
                "uuid": "ee1743e9-54c6-4319-a95a-bc857803259c",
            },
            {
                "created": "2023-10-05T23:22:26.138Z",
                "enrich_detail": {"external_url": "https://random.com"},
                "original_file_name": "temp_file_5.enriched.csv",
                "source_original_file_name": "temp_file_5.csv",
                "source_uuid": "000ed1e4-571c-4b9a-a35d-ed1a3d231101",
                "status": "completed",
                "uuid": "9e08728f-aed9-4198-86f7-de4d21e57515",
            },
            {
                "created": "2023-10-05T23:22:26.129Z",
                "enrich_detail": {"external_url": "https://random.com"},
                "original_file_name": "temp_file_4.enriched.csv",
                "source_original_file_name": "temp_file_4.csv",
                "source_uuid": "0b8a752b-623c-40c7-89f9-091dff4da4c3",
                "status": "completed",
                "uuid": "7d272111-fe33-47bf-aaa7-f5c411c43dc0",
            },
            {
                "created": "2023-10-05T23:22:26.120Z",
                "enrich_detail": {"external_url": "https://random.com"},
                "original_file_name": "temp_file_3.enriched.csv",
                "source_original_file_name": "temp_file_3.csv",
                "source_uuid": "248a44dd-90d7-4710-8091-35a2d9a6bfdb",
                "status": "completed",
                "uuid": "4861ce87-c730-4a71-b8a7-249c48cc09e2",
            },
            {
                "created": "2023-10-05T23:22:26.110Z",
                "enrich_detail": {"external_url": "https://random.com"},
                "original_file_name": "temp_file_2.enriched.csv",
                "source_original_file_name": "temp_file_2.csv",
                "source_uuid": "dda6ace0-fd29-441e-83d5-9cd3d5681988",
                "status": "completed",
                "uuid": "0e710929-8fa0-4e79-8a13-4939470e55a7",
            },
            {
                "created": "2023-10-05T23:22:26.099Z",
                "enrich_detail": {"external_url": "https://random.com"},
                "original_file_name": "temp_file_1.enriched.csv",
                "source_original_file_name": "temp_file_1.csv",
                "source_uuid": "e0c256c3-dfb1-414d-9376-495f87886c8f",
                "status": "completed",
                "uuid": "03a0b442-a35e-4883-a903-3074ea750de0",
            },
            {
                "created": "2023-10-05T23:22:26.086Z",
                "enrich_detail": {"external_url": "https://random.com"},
                "original_file_name": "temp_file_0.enriched.csv",
                "source_original_file_name": "temp_file_0.csv",
                "source_uuid": "06b87971-f041-461e-aa24-9aa038191911",
                "status": "completed",
                "uuid": "b4cc75f5-5932-47c1-b5f7-ef6abe9a0485",
            },
        ],
        "paginator": {"total_pages": 2, "page": 1, "page_size": 20},
    }
    assert response_code == HTTPStatus.OK


@pytest.mark.parametrize(
    "page_size",
    [
        pytest.param(1, id="page_size=1"),
        pytest.param(20, id="page_size=20"),
    ],
)
@pytest.mark.transactional_db
def test_csv_list_page_size(
    page: str | int | None,
    page_size: str | int | None,
    client: Client,
    multiple_base_csv_files: list[CSVFile],
    multiple_enriched_csv_files: None,
):
    a = CSVFile.objects.count()
    b = EnrichDetail.objects.count()
    response = client.get(
        "/api/_internal/csv_list",
        data={
            "page": 1,
            "page_size": page_size,
            "sort": CsvListSortColumn.CREATED_DESC,
        },
    )
    response_data = response.json()
    response_code = response.status_code
    assert response_data == {"a": 1}
    assert response_code == HTTPStatus.OK


@pytest.mark.parametrize(
    "filter_date_from",
    [
        pytest.param("temp", id="filter_date_from=temp"),
        pytest.param(None, id=""),
    ],
)
@pytest.mark.parametrize(
    "filter_date_to",
    [
        pytest.param("temp", id="search=temp"),
        pytest.param(None, id=""),
    ],
)
def test_csv_list_filter_date(
    filter_date_from: str | None,
    filter_date_to: str | None,
    client: Client,
    multiple_base_csv_files: list[CSVFile],
    multiple_enriched_csv_files: None,
):
    a = CSVFile.objects.count()
    b = EnrichDetail.objects.count()
    response = client.get("/api/_internal/csv_list", data={"page": page, "sort": sort})
    response_data = response.json()
    response_code = response.status_code
    assert response_data == {"a": 1}
    assert response_code == HTTPStatus.OK


@pytest.mark.parametrize(
    "filter_file_type",
    [
        pytest.param(CsvListFileTypeFilter.SOURCE.value, id="filter_file_type=source"),
        pytest.param(None, id=""),
    ],
)
def test_csv_list_filter_file_type(
    filter_file_type: str | None,
    client: Client,
    multiple_base_csv_files: list[CSVFile],
    multiple_enriched_csv_files: None,
):
    a = CSVFile.objects.count()
    b = EnrichDetail.objects.count()
    response = client.get(
        "/api/_internal/csv_list",
        data={"page": page, "sort": CsvListSortColumn.CREATED_DESC},
    )
    response_data = response.json()
    response_code = response.status_code
    assert response_data == {"a": 1}
    assert response_code == HTTPStatus.OK


@pytest.mark.parametrize(
    "sort",
    [
        pytest.param(CsvListSortColumn.CREATED_DESC, id="sort=created"),
        pytest.param(None, id=""),
    ],
)
def test_csv_list_sort(
    sort: str | None,
    client: Client,
    multiple_base_csv_files: list[CSVFile],
    multiple_enriched_csv_files: None,
):
    a = CSVFile.objects.count()
    b = EnrichDetail.objects.count()
    response = client.get("/api/_internal/csv_list", data={"page": page, "sort": sort})
    response_data = response.json()
    response_code = response.status_code
    assert response_data == {"a": 1}
    assert response_code == HTTPStatus.OK


@pytest.mark.parametrize(
    "search",
    [
        pytest.param("temp", id="search=temp"),
        pytest.param(None, id=""),
    ],
)
def test_csv_list_search(
    search: str | None,
    client: Client,
    multiple_base_csv_files: list[CSVFile],
    multiple_enriched_csv_files: None,
):
    a = CSVFile.objects.count()
    b = EnrichDetail.objects.count()
    response = client.get("/api/_internal/csv_list", data={"page": page, "sort": sort})
    response_data = response.json()
    response_code = response.status_code
    assert response_data == {"a": 1}
    assert response_code == HTTPStatus.OK
