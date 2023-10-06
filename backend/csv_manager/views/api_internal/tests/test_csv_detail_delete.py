from django.test import Client

from csv_manager.models import CSVFile

path = "/api/_internal/csv_delete"


def test_csv_detail_delete(
    client: Client,
    multiple_base_csv_files: list[CSVFile],
):
    uuid = str(multiple_base_csv_files[0].uuid)
    assert CSVFile.objects.filter(uuid=uuid).exists()
    assert CSVFile.objects.count() == 20

    response = client.post(
        path=path,
        data={"uuid": uuid},
    ).json()

    assert response == {'csvfile_uuid': uuid}

    assert not CSVFile.objects.filter(uuid=uuid).exists()
    assert CSVFile.objects.count() == 19

