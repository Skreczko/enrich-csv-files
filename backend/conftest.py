########################
# Pytest configuration #
########################
import csv
import json
import os
from datetime import datetime
from tempfile import NamedTemporaryFile
from typing import Any

import pytest
from django.core.files import File
from django.db import transaction
from django.test import Client
from freezegun import freeze_time


from csv_manager.enums import EnrichmentJoinType, EnrichmentStatus
from csv_manager.models import CSVFile, EnrichDetail


class PytestTestRunner:
    """Runs pytest to discover and run tests."""

    def __init__(self, verbosity=1, failfast=False, keepdb=False, **kwargs):
        self.verbosity = verbosity
        self.failfast = failfast
        self.keepdb = keepdb

    def run_tests(self, test_labels, extra_tests=None, **kwargs):
        import pytest

        verbosity = kwargs.get("verbosity", self.verbosity)
        argv = []
        if verbosity == 0:
            argv.append("--quiet")
        if verbosity == 2:
            argv.append("--verbose")
        if verbosity == 3:
            argv.append("-vv")
        if self.failfast:
            argv.append("--exitfirst")
        if self.keepdb:
            argv.append("--reuse-db")

        argv.extend(test_labels)
        if extra_tests:
            argv.extend(extra_tests)
        return pytest.main(argv)


@pytest.fixture(autouse=True)
def enable_db_access(db) -> None:
    pass


@pytest.fixture(scope="module")
def module_transactional_db(django_db_setup, django_db_blocker):
    with django_db_blocker.unblock():
        transaction.set_autocommit(False)
        yield
        transaction.rollback()
        transaction.set_autocommit(True)


@pytest.fixture
def client() -> Client:
    return Client()

@freeze_time("2023-06-01")
def _create_csvfile_instance(
    csv_data: list[list[Any]],
    create_kwargs: dict[str, Any] = None,
    original_file_name: str = "temp.csv"
) -> CSVFile:
    if not create_kwargs:
        create_kwargs = {}
    with NamedTemporaryFile(mode="w", delete=False, suffix=".csv") as temp_file:
        writer = csv.writer(temp_file)
        writer.writerows(csv_data)
        temp_file_name = temp_file.name

        with open(temp_file_name, "rb") as f:
            csv_file_instance, _ = CSVFile.objects.get_or_create(
                file=File(f),
                original_file_name=original_file_name,
                file_row_count=len(csv_data),
                file_headers=csv_data[0],
                **create_kwargs,
            )
    return csv_file_instance

@freeze_time("2023-06-01")
def _create_enrich_detail_instace(
    json_data: list[dict[str, Any]] | dict[str, Any], create_kwargs: dict[str, Any]
) -> EnrichDetail:
    with NamedTemporaryFile(mode="w", delete=False, suffix=".json") as temp_file:
        json.dump(json_data, temp_file)
        temp_file_name = temp_file.name

        with open(temp_file_name, "rb") as f:
            enrich_detail_instance, _ = EnrichDetail.objects.get_or_create(
                external_response=File(f), **create_kwargs
            )
    return enrich_detail_instance

@freeze_time("2023-06-01")
def _create_enrich_detail(enriched_csv_file: CSVFile) -> EnrichDetail:
    enrich_detail_instance = _create_enrich_detail_instace(
        json_data={
            "results": [
                {
                    "json_header1": "row1_col1",
                    "json_header2": "json_row1_col2",
                    "json_header3": "json_row1_col3",
                },
                {
                    "json_header1": "row2_col1",
                    "json_header2": "json_row2_col2",
                    "json_header3": "json_row2_col3",
                },
                {
                    "json_header1": "no_match",
                    "json_header2": "no_match",
                    "json_header3": "no_match",
                },
            ],
            "other_random_key": "random_value",
            "other_random_key2": 1,
        },
        create_kwargs={
            "csv_file": enriched_csv_file,
            "external_elements_count": 3,
            "status": EnrichmentStatus.COMPLETED,
            "external_url": "https://random.com",
            "join_type": EnrichmentJoinType.LEFT.value,
            "is_flat": True,
            "json_root_path": "results",
            "external_elements_key_list": [
                "json_header1",
                "json_header2",
                "json_header3",
            ],
            "selected_key": "json_header1",
            "selected_header": "csv_header1",
        },
    )
    return enrich_detail_instance


@pytest.fixture
def base_csv_file() -> CSVFile:
    """CSV file instance without enriching"""
    csv_instance = _create_csvfile_instance(
        csv_data=[
            ["csv_header1", "csv_header2"],
            ["row1_col1", "csv_row1_col2"],
            ["row2_col1", "csv_row2_col2"],
            ["row3_col1", "csv_row3_col2"],
        ],
    )
    yield csv_instance
    os.remove(csv_instance.file.path)
    csv_instance.delete()

@pytest.fixture(scope="module")
def multiple_base_csv_files(module_transactional_db) -> list[CSVFile]:
    csv_files = []
    for index in range(20):
        with freeze_time(datetime(2023, 6, 1 + index)):
            csv_instance = _create_csvfile_instance(
                csv_data=[
                    ["csv_header1", "csv_header2"],
                    ["row1_col1", "csv_row1_col2"],
                    ["row2_col1", "csv_row2_col2"],
                    ["row3_col1", "csv_row3_col2"],
                ],
                original_file_name=f"temp_file_{index}.csv"
            )
            csv_files.append(csv_instance)
    yield csv_files
    for csv_instance in csv_files:
        os.remove(csv_instance.file.path)
        csv_instance.delete()


@pytest.fixture
@freeze_time("2023-06-01")
def enriched_csv_file(base_csv_file: CSVFile) -> CSVFile:
    """
    CSV file instance without enriching
    column csv_header1 has no preffix csv_/json_ as it was used to merge tables
    """
    csv_instance = _create_csvfile_instance(
        csv_data=[
            ["csv_header1", "csv_header2", "json_header2", "json_header3"],
            ["row1_col1", "csv_row1_col2", "json_row1_col2", "json_row1_col3"],
            ["row2_col1", "csv_row2_col2", "json_row2_col2", "json_row2_col3"],
            ["row3_col1", "csv_row3_col2", "", ""],
        ],
        create_kwargs={
            "source_instance": base_csv_file,
        },
    )
    enrich_detail_instance = _create_enrich_detail(csv_instance)
    yield csv_instance
    os.remove(enrich_detail_instance.external_response.path)
    os.remove(csv_instance.file.path)
    csv_instance.delete()


@pytest.fixture(scope="module")
def multiple_enriched_csv_files(multiple_base_csv_files: list[CSVFile]) -> None:
    enriched_csv_files: list[CSVFile] = []
    enrich_detail_instance_list: list[EnrichDetail] = []
    for index, base_csv_file in enumerate(multiple_base_csv_files):
        with freeze_time(datetime(2023, 6, 1 + index)):
            csv_instance = _create_csvfile_instance(
                csv_data=[
                    ["csv_header1", "csv_header2", "json_header2", "json_header3"],
                    ["row1_col1", "csv_row1_col2", "json_row1_col2", "json_row1_col3"],
                    ["row2_col1", "csv_row2_col2", "json_row2_col2", "json_row2_col3"],
                    ["row3_col1", "csv_row3_col2", "", ""],
                ],
                create_kwargs={
                    "source_instance": base_csv_file,
                },
                original_file_name=f"temp_file_{index}.enriched.csv"
            )
            enrich_detail_instance_list.append(_create_enrich_detail(csv_instance))
            enriched_csv_files.append(csv_instance)
    yield
    for enrich_detail_instance in enrich_detail_instance_list:
        os.remove(enrich_detail_instance.external_response.path)
        enrich_detail_instance.delete()
    for csv_instance in enriched_csv_files:
        os.remove(csv_instance.file.path)
        csv_instance.delete()

