# from http import HTTPStatus
# from unittest import mock
#
# from django.test import Client, override_settings
#
# from csv_manager.models import CSVFile
#
# json_response = [{
#     "a": 1
# }]
#
# @override_settings(CELERY_TASK_ALWAYS_EAGER=True)
# @mock.patch('csv_manager.tasks.requests.get', return_value=mock.Mock(status_code=HTTPStatus.OK, json=lambda: json_response))
# def test_csv_enrich_detail_create(
#     mock_get: mock.Mock,
#     client: Client,
#     base_csv_file: CSVFile,
# ):
#
#     response = client.post(
#         path=f"/api/_internal/csv_list/{str(base_csv_file.uuid)}/enrich_detail_create",
#         data={"external_url": "http://google.com/", "json_root_path":""},
#     ).json()
#
#
#     a = 1
#
