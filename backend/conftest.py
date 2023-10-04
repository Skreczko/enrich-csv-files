########################
# Pytest configuration #
########################
import csv
import json
import os
from tempfile import NamedTemporaryFile
from typing import Any

import pytest
from django.core.files import File

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


def _create_csv_file(
    csv_data: list[list[Any]],
    filename: str = "temp.csv",
    **create_kwargs: dict[str, Any],
) -> CSVFile:
    with NamedTemporaryFile(mode="w", delete=False, suffix=".csv") as temp_file:
        writer = csv.writer(temp_file)
        writer.writerows(csv_data)
        temp_file_name = temp_file.name

        with open(temp_file_name, "rb") as f:
            csv_file_instance, _ = CSVFile.objects.get_or_create(
                file=File(f),
                original_file_name=filename,
                file_row_count=len(csv_data),
                file_headers=csv_data[0],
                **create_kwargs,
            )
    return csv_file_instance


@pytest.fixture
def base_csv_file() -> CSVFile:
    """CSV file instance without enriching"""
    csv_instance = _create_csv_file(
        csv_data=[
            ["csv_header1", "csv_header2"],
            ["row1_col1", "csv_row1_col2"],
            ["row2_col1", "csv_row2_col2"],
            ["row3_col1", "csv_row3_col2"],
        ]
    )
    yield csv_instance
    os.remove(csv_instance.file.path)
    csv_instance.delete()


@pytest.fixture
def enriched_csv_file() -> CSVFile:
    """
    CSV file instance without enriching
    column csv_header1 has no preffix csv_/json_ as it was used to merge tables
    """
    csv_instance = _create_csv_file(
        # todo fill rest data
        csv_data=[
            ["csv_header1", "csv_header2", "json_header2", "json_header3"],
            ["row1_col1", "csv_row1_col2", "json_row1_col2", "json_row1_col3"],
            ["row2_col1", "csv_row2_col2", "json_row2_col2", "json_row2_col3"],
            ["row3_col1", "csv_row3_col2", None, None],
        ]
    )
    yield csv_instance
    os.remove(csv_instance.file.path)
    csv_instance.delete()


def _create_enrich_detail(
    json_data: list[dict[str, Any]] | dict[str, Any], **create_kwargs: dict[str, Any]
) -> EnrichDetail:
    with NamedTemporaryFile(mode="w", delete=False, suffix=".json") as temp_file:
        json.dump(json_data, temp_file)
        temp_file_name = temp_file.name

        with open(temp_file_name, "rb") as f:
            enrich_detail_instance, _ = EnrichDetail.objects.get_or_create(
                external_response=File(f), **create_kwargs
            )
    return enrich_detail_instance


@pytest.fixture
def enrich_detail(enriched_csv_file: CSVFile) -> EnrichDetail:
    enrich_detail_instance = _create_enrich_detail(
        json_data=[
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
                "json_header1": "row3_col1",
                "json_header2": "json_row3_col2",
                "json_header3": "json_row3_col3",
            },
            {
                "json_header1": "no_match",
                "json_header2": "no_match",
                "json_header3": "no_match",
            },
        ],
        **{
            "csv_file": enriched_csv_file,
            "status": EnrichmentStatus.COMPLETED,
            "external_url": "http://random.com",
            "join_type": EnrichmentJoinType.LEFT.value,
            "is_flat": False,
            "json_root_path": "",
            "external_elements_key_list": [
                "json_header1",
                "json_header2",
                "json_header3",
            ],
            "selected_key": "json_header1",
            "selected_header": "csv_header1",
        },
    )
    yield enrich_detail_instance
    os.remove(enrich_detail_instance.external_response.path)
    enrich_detail_instance.delete()
