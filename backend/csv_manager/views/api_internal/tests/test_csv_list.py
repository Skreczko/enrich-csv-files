from http import HTTPStatus
from unittest.mock import ANY

import math
import pytest
from django.core.paginator import EmptyPage
from django.test import Client

from csv_manager.enums import (
    CsvListFileTypeFilter,
    CsvListSortColumn,
    CsvListStatusFilter,
    EnrichmentStatus,
)
from csv_manager.models import CSVFile, EnrichDetail

path = "/api/_internal/csv_list"


@pytest.mark.parametrize(
    "page",
    [
        pytest.param(2, id="page=2"),
        pytest.param(100, id="page=100"),
    ],
)
def test_csv_list_page(
    page: str | int,
    client: Client,
    multiple_enriched_csv_files: None,
):
    data = {"page": page, "page_size": 20, "sort": CsvListSortColumn.CREATED_DESC}

    if page == 2:
        response = client.get(
            path=path,
            data=data,
        )
        response_data = response.json()
        assert response.status_code == HTTPStatus.OK
        assert response_data["paginator"] == {
            "total_pages": math.ceil(CSVFile.objects.count() / 20),
            "page": 2,
            "page_size": 20,
        }

        instance = CSVFile.objects.get(original_file_name="temp_file_0.csv")
        assert response_data["result"][0] == {
            "created": "2023-06-01T00:00:00Z",
            "enrich_detail": None,
            "original_file_name": "temp_file_0.csv",
            "source_original_file_name": None,
            "source_uuid": None,
            "status": CsvListStatusFilter.COMPLETED.value,
            "uuid": str(instance.uuid),
        }

    elif page == 100:
        with pytest.raises(EmptyPage, match="That page contains no results"):
            client.get(
                path=path,
                data=data,
            )


@pytest.mark.parametrize(
    "page_size",
    [
        pytest.param(1, id="page_size=1"),
        pytest.param(20, id="page_size=20"),
    ],
)
def test_csv_list_page_size(
    page_size: str | int | None,
    client: Client,
    multiple_enriched_csv_files: None,
):
    response = client.get(
        path,
        data={
            "page": 1,
            "page_size": page_size,
            "sort": CsvListSortColumn.CREATED_DESC,
        },
    )
    response_data = response.json()
    assert response.status_code == HTTPStatus.OK
    assert response_data["paginator"] == {
        "total_pages": math.ceil(CSVFile.objects.count() / page_size),
        "page": 1,
        "page_size": page_size,
    }


@pytest.mark.parametrize(
    "filter_date_from",
    [
        pytest.param(
            "2023-06-03T00:00:00.000Z", id="filter_date_from=2023-06-03T00:00:00.000Z"
        ),
        pytest.param("", id=""),
    ],
)
@pytest.mark.parametrize(
    "filter_date_to",
    [
        pytest.param(
            "2023-06-04T00:00:00.000Z", id="filter_date_to=2023-06-04T00:00:00.000Z"
        ),
        pytest.param("", id=""),
    ],
)
def test_csv_list_filter_date(
    filter_date_from: str | None,
    filter_date_to: str | None,
    client: Client,
    multiple_enriched_csv_files: None,
):
    response = client.get(
        path,
        data={
            "page": 1,
            "page_size": 1000,
            "sort": CsvListSortColumn.CREATED_DESC,
            "filter_date_from": filter_date_from,
            "filter_date_to": filter_date_to,
        },
    )
    assert response.status_code == HTTPStatus.OK

    response_results = response.json()["result"]
    if filter_date_from and filter_date_to:
        results = [
            {
                "created": "2023-06-04T00:00:00Z",
                "enrich_detail": {"external_url": "https://random.com"},
                "original_file_name": "temp_file_3.enriched.csv",
                "source_original_file_name": "temp_file_3.csv",
                "source_uuid": ANY,
                "status": CsvListStatusFilter.COMPLETED.value,
                "uuid": ANY,
            },
            {
                "created": "2023-06-03T00:00:00Z",
                "enrich_detail": {"external_url": "https://random.com"},
                "original_file_name": "temp_file_2.enriched.csv",
                "source_original_file_name": "temp_file_2.csv",
                "source_uuid": ANY,
                "status": CsvListStatusFilter.COMPLETED.value,
                "uuid": ANY,
            },
        ]
        assert response_results == results

    elif filter_date_from:
        assert len(response_results) == 18
    elif filter_date_to:
        assert len(response_results) == 24


@pytest.mark.parametrize(
    "filter_file_type",
    [
        pytest.param(
            CsvListFileTypeFilter.ENRICHED.value, id="filter_file_type=source"
        ),
        pytest.param("", id=""),
    ],
)
def test_csv_list_filter_file_type(
    filter_file_type: str | None,
    client: Client,
    multiple_enriched_csv_files: None,
):
    response = client.get(
        path,
        data={
            "filter_file_type": filter_file_type,
            "page": 1,
            "page_size": 1000,
            "sort": CsvListSortColumn.CREATED_DESC,
        },
    )
    assert response.status_code == HTTPStatus.OK

    response_results = response.json()["result"]
    if filter_file_type:
        assert len(response_results) == 20
    else:
        assert len(response_results) == 40


@pytest.mark.parametrize(
    "sort",
    [
        pytest.param(CsvListSortColumn.CREATED_DESC.value, id="sort=created"),
        pytest.param(CsvListSortColumn.STATUS_DESC.value, id="sort=-status"),
        pytest.param(CsvListSortColumn.STATUS_ASC.value, id="sort=status"),
    ],
)
def test_csv_list_sort(
    sort: str | None,
    client: Client,
    multiple_base_csv_files: list[CSVFile],
    multiple_enriched_csv_files: None,
):
    enrich_detail_1 = EnrichDetail.objects.first()
    enrich_detail_1.status = EnrichmentStatus.FETCHING_RESPONSE.value
    enrich_detail_1.save()

    enrich_detail_2 = EnrichDetail.objects.last()
    enrich_detail_2.status = EnrichmentStatus.AWAITING_COLUMN_SELECTION.value
    enrich_detail_2.save()

    response = client.get(
        path,
        data={
            "sort": sort,
            "page": 1,
            "page_size": 1,
        },
    )
    response_results = response.json()["result"]
    assert response.status_code == HTTPStatus.OK

    if sort == CsvListSortColumn.CREATED_DESC:
        csv_file = enrich_detail_2.csv_file
        results = [
            {
                "created": "2023-06-20T00:00:00Z",
                "enrich_detail": {"external_url": "https://random.com"},
                "original_file_name": "temp_file_19.enriched.csv",
                "source_original_file_name": "temp_file_19.csv",
                "source_uuid": str(csv_file.source_instance.uuid),
                "status": EnrichmentStatus.AWAITING_COLUMN_SELECTION.value,
                "uuid": str(csv_file.uuid),
            }
        ]
    elif sort == CsvListSortColumn.STATUS_DESC:
        results = [
            {
                "created": "2023-06-01T00:00:00Z",
                "enrich_detail": None,
                "original_file_name": "temp_file_0.csv",
                "source_original_file_name": None,
                "source_uuid": None,
                "status": EnrichmentStatus.COMPLETED.value,
                "uuid": ANY,
            }
        ]
    elif sort == CsvListSortColumn.STATUS_ASC:
        csv_file = enrich_detail_1.csv_file

        results = [
            {
                "created": "2023-06-01T00:00:00Z",
                "enrich_detail": {"external_url": "https://random.com"},
                "original_file_name": "temp_file_0.enriched.csv",
                "source_original_file_name": "temp_file_0.csv",
                "source_uuid": str(csv_file.source_instance.uuid),
                "status": EnrichmentStatus.FETCHING_RESPONSE.value,
                "uuid": str(csv_file.uuid),
            }
        ]

    assert response_results == results


@pytest.mark.parametrize(
    "search",
    [
        pytest.param("file_13.enri", id="search=file_13.enri"),
        pytest.param("", id=""),
    ],
)
def test_csv_list_search(
    search: str | None,
    client: Client,
    multiple_base_csv_files: list[CSVFile],
    multiple_enriched_csv_files: None,
):
    response = client.get(
        path,
        data={
            "search": search,
            "sort": CsvListSortColumn.CREATED_DESC,
            "page": 1,
            "page_size": 1,
        },
    )
    response_results = response.json()["result"]
    assert response.status_code == HTTPStatus.OK

    results = [
        {
            "created": "2023-06-14T00:00:00Z",
            "enrich_detail": {"external_url": "https://random.com"},
            "original_file_name": "temp_file_13.enriched.csv",
            "source_original_file_name": "temp_file_13.csv",
            "source_uuid": ANY,
            "status": EnrichmentStatus.COMPLETED.value,
            "uuid": ANY,
        }
    ]

    if search:
        assert response_results == results
    else:
        assert response_results != results
