from http import HTTPStatus

from django.test import Client

from csv_manager.enums import CsvListStatusFilter
from csv_manager.models import CSVFile


def test_csv_detail_get(
    client: Client,
    enriched_csv_file: CSVFile,
):
    response = client.get(
        path=f"/api/_internal/csv_list/{enriched_csv_file.uuid}",
    )

    csv_instance = CSVFile.objects.select_related(
        "enrich_detail", "source_instance"
    ).get(uuid=enriched_csv_file.uuid)

    assert response.status_code == HTTPStatus.OK
    assert response.json() == {
        "created": "2023-06-01T00:00:00Z",
        "enrich_detail": {
            "created": "2023-06-01T00:00:00Z",
            "external_elements_count": 3,
            "external_elements_key_list": [
                "json_header1",
                "json_header2",
                "json_header3",
            ],
            "external_response": {
                "size": csv_instance.enrich_detail.external_response.size,
                "url": f"/media/files/no_user/{csv_instance.enrich_detail.uuid}.json",
            },
            "external_url": "https://random.com",
            "is_flat": True,
            "join_type": "left",
            "json_root_path": "results",
            "selected_header": "csv_header1",
            "selected_key": "json_header1",
            "uuid": str(csv_instance.enrich_detail.uuid),
        },
        "file": {
            "size": csv_instance.file.size,
            "url": f"/media/files/no_user/{csv_instance.uuid}.csv",
        },
        "file_headers": ["csv_header1", "csv_header2", "json_header2", "json_header3"],
        "file_row_count": 4,
        "original_file_name": "temp.csv",
        "source_instance": {
            "created": "2023-06-01T00:00:00Z",
            "file": {
                "size": csv_instance.source_instance.file.size,
                "url": f"/media/files/no_user/{csv_instance.source_instance.uuid}.csv",
            },
            "file_headers": ["csv_header1", "csv_header2"],
            "file_row_count": 4,
            "original_file_name": "temp.csv",
            "uuid": str(csv_instance.source_instance.uuid),
        },
        "source_original_file_name": "temp.csv",
        "source_uuid": str(csv_instance.source_instance.uuid),
        "status": CsvListStatusFilter.COMPLETED.value,
        "uuid": str(csv_instance.uuid),
    }
