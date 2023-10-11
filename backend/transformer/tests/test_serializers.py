import os
from typing import Any
from unittest import mock
from unittest.mock import ANY

import pytest

from csv_manager.models import CSVFile
from csv_manager.types import EnrichDetailSerializerType, SourceInstanceSerializerType
from transformer.exceptions import SerializationError
from transformer.serializers import serialize_instance, serialize_queryset


class TestSerializers:
    def _get_serialize_queryset_data(self) -> list[dict[str, Any]]:
        return serialize_queryset(
            queryset=CSVFile.objects.all(),
            fields=[
                "created",
                "enrich_detail",
                "file",
                "file_headers",
                "file_row_count",
                "original_file_name",
                "source_original_file_name",
                "source_uuid",
                "status",
                "uuid",
                "source_instance",
            ],
            select_related_model_mapping={
                "enrich_detail": EnrichDetailSerializerType,
                "source_instance": SourceInstanceSerializerType,
            },
        )

    def _get_serialize_instance_data(
        self, csv_file_instance: CSVFile, provide_fields: bool = True
    ) -> dict[str, Any]:
        return serialize_instance(
            instance=csv_file_instance,
            fields=[
                "created",
                "uuid",
                "original_file_name",
                "file",
                "file_row_count",
                "file_headers",
            ]
            if provide_fields
            else [],
        )

    def test_serialize_queryset(
        self, base_csv_file: CSVFile, enriched_csv_file: CSVFile
    ):
        assert self._get_serialize_queryset_data() == [
            {
                "created": ANY,
                "enrich_detail": None,
                "file": {
                    "size": 100,
                    "url": f"/media/files/no_user/{base_csv_file.uuid}.csv",
                },
                "file_headers": ["csv_header1", "csv_header2"],
                "file_row_count": 4,
                "original_file_name": "temp.csv",
                "source_instance": None,
                "source_original_file_name": None,
                "source_uuid": None,
                "status": None,
                "uuid": base_csv_file.uuid,
            },
            {
                "created": ANY,
                "enrich_detail": {
                    "created": ANY,
                    "external_elements_count": 3,
                    "external_elements_key_list": [
                        "json_header1",
                        "json_header2",
                        "json_header3",
                    ],
                    "external_response": {
                        "size": enriched_csv_file.enrich_detail.external_response.size,
                        "url": f"/media/files/no_user/{enriched_csv_file.enrich_detail.uuid}.json",
                    },
                    "external_url": "https://random.com",
                    "is_flat": True,
                    "join_type": "left",
                    "json_root_path": "results",
                    "selected_header": "csv_header1",
                    "selected_key": "json_header1",
                    "uuid": enriched_csv_file.enrich_detail.uuid,
                },
                "file": {
                    "size": enriched_csv_file.file.size,
                    "url": f"/media/files/no_user/{enriched_csv_file.uuid}.csv",
                },
                "file_headers": [
                    "csv_header1",
                    "csv_header2",
                    "json_header2",
                    "json_header3",
                ],
                "file_row_count": 4,
                "original_file_name": "temp.csv",
                "source_instance": {
                    "created": ANY,
                    "file": {
                        "size": enriched_csv_file.source_instance.file.size,
                        "url": f"/media/files/no_user/{enriched_csv_file.source_instance.uuid}.csv",
                    },
                    "file_headers": ["csv_header1", "csv_header2"],
                    "file_row_count": 4,
                    "original_file_name": "temp.csv",
                    "uuid": enriched_csv_file.source_instance.uuid,
                },
                "source_original_file_name": None,
                "source_uuid": None,
                "status": None,
                "uuid": enriched_csv_file.uuid,
            },
        ]

    def test_serialize_queryset_exception_value_error(
        self, csvfile_instance_in_enrich_process: CSVFile, base_csv_file: CSVFile
    ):
        assert self._get_serialize_queryset_data() == [
            {
                "created": ANY,
                "enrich_detail": None,
                "file": {
                    "size": 100,
                    "url": f"/media/files/no_user/{base_csv_file.uuid}.csv",
                },
                "file_headers": ["csv_header1", "csv_header2"],
                "file_row_count": 4,
                "original_file_name": "temp.csv",
                "source_instance": None,
                "source_original_file_name": None,
                "source_uuid": None,
                "status": None,
                "uuid": base_csv_file.uuid,
            },
            {
                "created": ANY,
                "enrich_detail": {
                    "created": ANY,
                    "external_elements_count": 3,
                    "external_elements_key_list": [
                        "json_header1",
                        "json_header2",
                        "json_header3",
                    ],
                    "external_response": {
                        "size": csvfile_instance_in_enrich_process.enrich_detail.external_response.size,
                        "url": f"/media/files/no_user/{csvfile_instance_in_enrich_process.enrich_detail.uuid}.json",
                    },
                    "external_url": "https://random.com",
                    "is_flat": False,
                    "join_type": None,
                    "json_root_path": "",
                    "selected_header": "",
                    "selected_key": "",
                    "uuid": csvfile_instance_in_enrich_process.enrich_detail.uuid,
                },
                "file": None,
                "file_headers": None,
                "file_row_count": None,
                "original_file_name": "",
                "source_instance": {
                    "created": ANY,
                    "file": {
                        "size": csvfile_instance_in_enrich_process.source_instance.file.size,
                        "url": f"/media/files/no_user/{csvfile_instance_in_enrich_process.source_instance.uuid}.csv",
                    },
                    "file_headers": ["csv_header1", "csv_header2"],
                    "file_row_count": 4,
                    "original_file_name": "temp.csv",
                    "uuid": csvfile_instance_in_enrich_process.source_instance.uuid,
                },
                "source_original_file_name": None,
                "source_uuid": None,
                "status": None,
                "uuid": csvfile_instance_in_enrich_process.uuid,
            },
        ]

    def test_serialize_queryset_exception_deleted_file(self, base_csv_file: CSVFile):
        os.remove(base_csv_file.file.path)
        assert self._get_serialize_queryset_data() == [
            {
                "created": ANY,
                "enrich_detail": None,
                "file": "Not found",
                "file_headers": ["csv_header1", "csv_header2"],
                "file_row_count": 4,
                "original_file_name": "temp.csv",
                "source_instance": None,
                "source_original_file_name": None,
                "source_uuid": None,
                "status": None,
                "uuid": base_csv_file.uuid,
            },
        ]

    @mock.patch("transformer.serializers.serialize_instance")
    def test_serialize_queryset_exception_attribute_error(
        self,
        mock_serialize_instance: mock.Mock,
        base_csv_file: CSVFile,
        enriched_csv_file: CSVFile,
    ):
        def side_effect_func(instance, *args, **kwargs):
            raise AttributeError(instance, "enrich_detail")

        mock_serialize_instance.side_effect = side_effect_func

        with pytest.raises(SerializationError):
            self._get_serialize_queryset_data()

    def test_serializer_instance_with_providing_fields(
        self, enriched_csv_file: CSVFile
    ):
        assert self._get_serialize_instance_data(enriched_csv_file) == {
            "created": ANY,
            "uuid": enriched_csv_file.uuid,
            "original_file_name": "temp.csv",
            "file": {
                "url": f"/media/files/no_user/{enriched_csv_file.uuid}.csv",
                "size": enriched_csv_file.file.size,
            },
            "file_row_count": 4,
            "file_headers": [
                "csv_header1",
                "csv_header2",
                "json_header2",
                "json_header3",
            ],
        }

    def test_serializer_instance_without_providing_fields(
        self, enriched_csv_file: CSVFile
    ):
        assert self._get_serialize_instance_data(
            enriched_csv_file, provide_fields=False
        ) == {
            "original_file_name": "temp.csv",
            "file": {
                "url": f"/media/files/no_user/{enriched_csv_file.uuid}.csv",
                "size": enriched_csv_file.file.size,
            },
            "file_row_count": 4,
            "file_headers": [
                "csv_header1",
                "csv_header2",
                "json_header2",
                "json_header3",
            ],
            "source_instance": enriched_csv_file.source_instance.uuid,
        }

    def test_serializer_instance_exception_attribute_error(
        self, enriched_csv_file: CSVFile
    ):
        with pytest.raises(SerializationError):
            serialize_instance(
                instance=enriched_csv_file,
                fields=["not_existed_field"],
            )

    def test_serializer_instance_exception_value_error(
        self, csvfile_instance_in_enrich_process: CSVFile
    ):
        assert self._get_serialize_instance_data(
            csvfile_instance_in_enrich_process
        ) == {
            "created": ANY,
            "uuid": csvfile_instance_in_enrich_process.uuid,
            "original_file_name": "",
            "file": None,
            "file_row_count": None,
            "file_headers": None,
        }

    def test_serializer_instance_exception_filenotfound_error(
        self, enriched_csv_file: CSVFile
    ):
        os.remove(enriched_csv_file.file.path)
        assert self._get_serialize_instance_data(enriched_csv_file) == {
            "created": ANY,
            "uuid": enriched_csv_file.uuid,
            "original_file_name": "temp.csv",
            "file": "Not found",
            "file_row_count": 4,
            "file_headers": [
                "csv_header1",
                "csv_header2",
                "json_header2",
                "json_header3",
            ],
        }
