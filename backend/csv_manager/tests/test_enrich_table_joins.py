import os
from datetime import datetime

import pytest
from freezegun import freeze_time
from petl import FieldSelectionError

from conftest import _create_csvfile_in_enrich_process, create_csvfile_instance
from csv_manager.enrich_table_joins import create_enrich_table_by_join_type
from csv_manager.enums import EnrichmentJoinType
from csv_manager.models import CSVFile, EnrichDetail


@pytest.fixture
def new_base_csv_file() -> CSVFile:
    """CSV file instance without enriching"""
    with freeze_time(datetime(2023, 6, 1)):
        csv_instance = create_csvfile_instance(
            csv_data=[
                ["csv_header1", "csv_header2"],
                ["row1_col1", "csv_row1_col2"],
                ["row2_col1", "csv_row2_col2"],
                ["row3_col1", "csv_row3_col2"],
                ["row4_col1", "csv_row4_col2"],
                ["row5_col1", "csv_row5_col2"],
            ],
        )
    yield csv_instance
    if os.path.exists(csv_instance.file.path):
        os.remove(csv_instance.file.path)
    csv_instance.delete()


@pytest.fixture
def csvfile_with_json_root_path_without_nested_dicts(
    new_base_csv_file: CSVFile,
) -> CSVFile:
    """
    {
    "results": [
        {
            "json_header1": "row1_col1",
            "json_header2": "json_row1_col2",
            "json_header3": "json_row1_col3",
        },
        ...
        ]
    }
    """
    csvfile_instance = _create_csvfile_in_enrich_process(
        source_instance=new_base_csv_file
    )
    yield csvfile_instance
    enrich_detail_instance = csvfile_instance.enrich_detail
    if os.path.exists(enrich_detail_instance.external_response.path):
        os.remove(enrich_detail_instance.external_response.path)
    csvfile_instance.delete()


@pytest.fixture
def csvfile_with_json_root_path_with_nested_dicts(
    new_base_csv_file: CSVFile,
) -> CSVFile:
    JSON_RESPONSE_DATA = {
        "results": [
            {
                "json_header1": "row1_col1",
                "json_header2": {"nested_json_header2": "json_row1_col2"},
                "json_header3": {"nested_json_header3": "json_row1_col3"},
            },
            {
                "json_header1": "row2_col1",
                "json_header2": {
                    "nested_json_header2": "json_row2_col2",
                    "nested_2": "random_value",
                },
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
    }
    csvfile_instance = _create_csvfile_in_enrich_process(
        source_instance=new_base_csv_file,
        create_details={
            "json_data": JSON_RESPONSE_DATA,
            "external_elements_count": 3,
            "external_elements_key_list": [
                "json_header1",
                "json_header2",
                "json_header3",
            ],
        },
    )
    yield csvfile_instance
    enrich_detail_instance = csvfile_instance.enrich_detail
    if os.path.exists(enrich_detail_instance.external_response.path):
        os.remove(enrich_detail_instance.external_response.path)
    csvfile_instance.delete()


@pytest.fixture
def csvfile_without_nested_dicts(
    new_base_csv_file: CSVFile,
) -> CSVFile:
    JSON_RESPONSE_DATA = [
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
    ]

    csvfile_instance = _create_csvfile_in_enrich_process(
        source_instance=new_base_csv_file,
        create_details={
            "json_data": JSON_RESPONSE_DATA,
            "external_elements_count": 3,
            "external_elements_key_list": [
                "json_header1",
                "json_header2",
                "json_header3",
            ],
        },
    )
    yield csvfile_instance
    enrich_detail_instance = csvfile_instance.enrich_detail
    if os.path.exists(enrich_detail_instance.external_response.path):
        os.remove(enrich_detail_instance.external_response.path)
    csvfile_instance.delete()


@pytest.fixture
def csvfile_with_number_in_column() -> CSVFile:
    JSON_RESPONSE_DATA = [
        {
            "json_header1": 1,
            "json_header2": "json_row1_col2",
            "json_header3": "json_row1_col3",
        },
        {
            "json_header1": 2,
            "json_header2": "json_row2_col2",
            "json_header3": "json_row2_col3",
        },
        {
            "json_header1": 100,
            "json_header2": "no_match",
            "json_header3": "no_match",
        },
    ]

    csv_instance = create_csvfile_instance(
        csv_data=[
            ["csv_header1", "csv_header2"],
            [1, "csv_row1_col2"],
            [2, "csv_row2_col2"],
            [3, "csv_row3_col2"],
            [4, "csv_row4_col2"],
            [5, "csv_row5_col2"],
        ],
    )

    csvfile_instance = _create_csvfile_in_enrich_process(
        source_instance=csv_instance,
        create_details={
            "json_data": JSON_RESPONSE_DATA,
            "external_elements_count": 3,
            "external_elements_key_list": [
                "json_header1",
                "json_header2",
                "json_header3",
            ],
        },
    )
    yield csvfile_instance
    enrich_detail_instance = csvfile_instance.enrich_detail
    if os.path.exists(enrich_detail_instance.external_response.path):
        os.remove(enrich_detail_instance.external_response.path)
    csvfile_instance.delete()
    if os.path.exists(csv_instance.file.path):
        os.remove(csv_instance.file.path)
    csv_instance.delete()


@pytest.mark.parametrize(
    "json_root_path_value",
    [
        pytest.param("results", id="json_root_path=results"),
        pytest.param("", id="json_root_path=''"),
    ],
)
@pytest.mark.parametrize(
    "is_flat",
    [
        pytest.param(True, id="is_flat=True"),
        pytest.param(False, id="is_flat=False"),
    ],
)
@pytest.mark.parametrize(
    "join_type",
    [
        pytest.param(EnrichmentJoinType.LEFT, id="join_type=LEFT"),
        pytest.param(EnrichmentJoinType.RIGHT, id="join_type=RIGHT"),
        pytest.param(EnrichmentJoinType.INNER, id="join_type=INNER"),
    ],
)
def test_create_enrich_table_with_json_root_path_without_nested_json(
    join_type: EnrichmentJoinType,
    is_flat: bool,
    json_root_path_value: str,
    csvfile_with_json_root_path_without_nested_dicts: CSVFile,
    csvfile_without_nested_dicts: CSVFile,
):
    if json_root_path_value:
        csvfile_instance = csvfile_with_json_root_path_without_nested_dicts
    else:
        csvfile_instance = csvfile_without_nested_dicts

    enrich_detail = csvfile_instance.enrich_detail
    EnrichDetail.objects.filter(uuid=enrich_detail.uuid).update(
        join_type=join_type,
        is_flat=is_flat,
        json_root_path=json_root_path_value,
        selected_key="json_header1",
        selected_header="csv_header1",
    )

    csvfile_instance.refresh_from_db()
    enrich_detail.refresh_from_db()

    output_path = create_enrich_table_by_join_type(
        join_type=join_type,
        enriched_csv_file_name=str(enrich_detail.uuid),
        source_instance_file_path=csvfile_instance.source_instance.file.path,
        enrich_detail_instance=enrich_detail,
    )

    if join_type == EnrichmentJoinType.LEFT:
        response = [
            "csv_header1,csv_header2,json_header2,json_header3\n",
            "row1_col1,csv_row1_col2,json_row1_col2,json_row1_col3\n",
            "row2_col1,csv_row2_col2,json_row2_col2,json_row2_col3\n",
            "row3_col1,csv_row3_col2,,\n",
            "row4_col1,csv_row4_col2,,\n",
            "row5_col1,csv_row5_col2,,\n",
        ]
    elif join_type == EnrichmentJoinType.RIGHT:
        response = [
            "json_header1,json_header2,json_header3,csv_header2\n",
            "no_match,no_match,no_match,\n",
            "row1_col1,json_row1_col2,json_row1_col3,csv_row1_col2\n",
            "row2_col1,json_row2_col2,json_row2_col3,csv_row2_col2\n",
        ]
    else:
        response = [
            "csv_header1,csv_header2,json_header2,json_header3\n",
            "row1_col1,csv_row1_col2,json_row1_col2,json_row1_col3\n",
            "row2_col1,csv_row2_col2,json_row2_col2,json_row2_col3\n",
        ]

    with open(output_path) as f:
        assert f.readlines() == response


@pytest.mark.parametrize(
    "is_flat",
    [
        pytest.param(True, id="is_flat=True"),
        pytest.param(False, id="is_flat=False"),
    ],
)
@pytest.mark.parametrize(
    "join_type",
    [
        pytest.param(EnrichmentJoinType.LEFT, id="join_type=LEFT"),
        pytest.param(EnrichmentJoinType.RIGHT, id="join_type=RIGHT"),
        pytest.param(EnrichmentJoinType.INNER, id="join_type=INNER"),
    ],
)
def test_create_enrich_table_with_json_root_path_with_nested_json(
    join_type: EnrichmentJoinType,
    is_flat: bool,
    csvfile_with_json_root_path_with_nested_dicts: CSVFile,
):
    enrich_detail = csvfile_with_json_root_path_with_nested_dicts.enrich_detail
    EnrichDetail.objects.filter(uuid=enrich_detail.uuid).update(
        join_type=join_type,
        is_flat=is_flat,
        json_root_path="results",
        selected_key="json_header1",
        selected_header="csv_header1",
    )

    csvfile_with_json_root_path_with_nested_dicts.refresh_from_db()
    enrich_detail.refresh_from_db()

    output_path = create_enrich_table_by_join_type(
        join_type=join_type,
        enriched_csv_file_name=str(enrich_detail.uuid),
        source_instance_file_path=csvfile_with_json_root_path_with_nested_dicts.source_instance.file.path,
        enrich_detail_instance=enrich_detail,
    )
    if is_flat:
        if join_type == EnrichmentJoinType.LEFT:
            response = [
                "csv_header1,csv_header2,json_header2_nested_json_header2,json_header3_nested_json_header3,json_header2_nested_2,json_header3,json_header2\n",
                "row1_col1,csv_row1_col2,json_row1_col2,json_row1_col3,,,\n",
                "row2_col1,csv_row2_col2,json_row2_col2,,random_value,json_row2_col3,\n",
                "row3_col1,csv_row3_col2,,,,,\n",
                "row4_col1,csv_row4_col2,,,,,\n",
                "row5_col1,csv_row5_col2,,,,,\n",
            ]
        elif join_type == EnrichmentJoinType.RIGHT:
            response = [
                "json_header1,json_header2_nested_json_header2,json_header3_nested_json_header3,json_header2_nested_2,json_header3,json_header2,csv_header2\n",
                "no_match,,,,no_match,no_match,\n",
                "row1_col1,json_row1_col2,json_row1_col3,,,,csv_row1_col2\n",
                "row2_col1,json_row2_col2,,random_value,json_row2_col3,,csv_row2_col2\n",
            ]
        else:
            response = [
                "csv_header1,csv_header2,json_header2_nested_json_header2,json_header3_nested_json_header3,json_header2_nested_2,json_header3,json_header2\n",
                "row1_col1,csv_row1_col2,json_row1_col2,json_row1_col3,,,\n",
                "row2_col1,csv_row2_col2,json_row2_col2,,random_value,json_row2_col3,\n",
            ]
    else:
        if join_type == EnrichmentJoinType.LEFT:
            response = [
                "csv_header1,csv_header2,json_header2,json_header3\n",
                "row1_col1,csv_row1_col2,{'nested_json_header2': "
                "'json_row1_col2'},{'nested_json_header3': 'json_row1_col3'}\n",
                "row2_col1,csv_row2_col2,\"{'nested_json_header2': 'json_row2_col2', "
                "'nested_2': 'random_value'}\",json_row2_col3\n",
                "row3_col1,csv_row3_col2,,\n",
                "row4_col1,csv_row4_col2,,\n",
                "row5_col1,csv_row5_col2,,\n",
            ]
        elif join_type == EnrichmentJoinType.RIGHT:
            response = [
                "json_header1,json_header2,json_header3,csv_header2\n",
                "no_match,no_match,no_match,\n",
                "row1_col1,{'nested_json_header2': 'json_row1_col2'},{'nested_json_header3': "
                "'json_row1_col3'},csv_row1_col2\n",
                "row2_col1,\"{'nested_json_header2': 'json_row2_col2', 'nested_2': "
                "'random_value'}\",json_row2_col3,csv_row2_col2\n",
            ]
        else:
            response = [
                "csv_header1,csv_header2,json_header2,json_header3\n",
                "row1_col1,csv_row1_col2,{'nested_json_header2': "
                "'json_row1_col2'},{'nested_json_header3': 'json_row1_col3'}\n",
                "row2_col1,csv_row2_col2,\"{'nested_json_header2': 'json_row2_col2', "
                "'nested_2': 'random_value'}\",json_row2_col3\n",
            ]

    with open(output_path) as f:
        assert f.readlines() == response


@pytest.mark.parametrize(
    "is_flat",
    [
        pytest.param(True, id="is_flat=True"),
        pytest.param(False, id="is_flat=False"),
    ],
)
@pytest.mark.parametrize(
    "join_type",
    [
        pytest.param(EnrichmentJoinType.LEFT, id="join_type=LEFT"),
        pytest.param(EnrichmentJoinType.RIGHT, id="join_type=RIGHT"),
        pytest.param(EnrichmentJoinType.INNER, id="join_type=INNER"),
    ],
)
def test_create_enrich_table_with_nested_json(
    join_type: EnrichmentJoinType, is_flat: bool, csvfile_without_nested_dicts: CSVFile
):
    enrich_detail = csvfile_without_nested_dicts.enrich_detail
    EnrichDetail.objects.filter(uuid=enrich_detail.uuid).update(
        join_type=join_type,
        is_flat=is_flat,
        json_root_path="",
        selected_key="json_header1",
        selected_header="csv_header1",
    )

    csvfile_without_nested_dicts.refresh_from_db()
    enrich_detail.refresh_from_db()

    output_path = create_enrich_table_by_join_type(
        join_type=join_type,
        enriched_csv_file_name=str(enrich_detail.uuid),
        source_instance_file_path=csvfile_without_nested_dicts.source_instance.file.path,
        enrich_detail_instance=enrich_detail,
    )
    if is_flat:
        if join_type == EnrichmentJoinType.LEFT:
            response = [
                "csv_header1,csv_header2,json_header2,json_header3\n",
                "row1_col1,csv_row1_col2,json_row1_col2,json_row1_col3\n",
                "row2_col1,csv_row2_col2,json_row2_col2,json_row2_col3\n",
                "row3_col1,csv_row3_col2,,\n",
                "row4_col1,csv_row4_col2,,\n",
                "row5_col1,csv_row5_col2,,\n",
            ]
        elif join_type == EnrichmentJoinType.RIGHT:
            response = [
                "json_header1,json_header2,json_header3,csv_header2\n",
                "no_match,no_match,no_match,\n",
                "row1_col1,json_row1_col2,json_row1_col3,csv_row1_col2\n",
                "row2_col1,json_row2_col2,json_row2_col3,csv_row2_col2\n",
            ]
        else:
            response = [
                "csv_header1,csv_header2,json_header2,json_header3\n",
                "row1_col1,csv_row1_col2,json_row1_col2,json_row1_col3\n",
                "row2_col1,csv_row2_col2,json_row2_col2,json_row2_col3\n",
            ]
    else:
        if join_type == EnrichmentJoinType.LEFT:
            response = [
                "csv_header1,csv_header2,json_header2,json_header3\n",
                "row1_col1,csv_row1_col2,json_row1_col2,json_row1_col3\n",
                "row2_col1,csv_row2_col2,json_row2_col2,json_row2_col3\n",
                "row3_col1,csv_row3_col2,,\n",
                "row4_col1,csv_row4_col2,,\n",
                "row5_col1,csv_row5_col2,,\n",
            ]
        elif join_type == EnrichmentJoinType.RIGHT:
            response = [
                "json_header1,json_header2,json_header3,csv_header2\n",
                "no_match,no_match,no_match,\n",
                "row1_col1,json_row1_col2,json_row1_col3,csv_row1_col2\n",
                "row2_col1,json_row2_col2,json_row2_col3,csv_row2_col2\n",
            ]
        else:
            response = [
                "csv_header1,csv_header2,json_header2,json_header3\n",
                "row1_col1,csv_row1_col2,json_row1_col2,json_row1_col3\n",
                "row2_col1,csv_row2_col2,json_row2_col2,json_row2_col3\n",
            ]

    with open(output_path) as f:
        assert f.readlines() == response


@pytest.mark.parametrize(
    "selected_key,selected_header",
    [
        pytest.param(
            "json_header1",
            "random_csv_header1",
            id="correct selected_key | incorrect selected_header",
        ),
        pytest.param(
            "random_json_header1",
            "csv_header1",
            id="incorrect selected_key | correct selected_header",
        ),
        pytest.param(
            "random_json_header1",
            "random_csv_header1",
            id="incorrect selected_key | incorrect selected_header",
        ),
    ],
)
def test_create_enrich_table_exception_fieldselectionerror(
    selected_key: str,
    selected_header: str,
    csvfile_without_nested_dicts: CSVFile,
):
    enrich_detail = csvfile_without_nested_dicts.enrich_detail
    EnrichDetail.objects.filter(uuid=enrich_detail.uuid).update(
        join_type=EnrichmentJoinType.LEFT,
        is_flat=False,
        json_root_path="",
        selected_key=selected_key,
        selected_header=selected_header,
    )

    csvfile_without_nested_dicts.refresh_from_db()
    enrich_detail.refresh_from_db()

    field_name = (
        selected_header if selected_header == "random_csv_header1" else selected_key
    )
    with pytest.raises(
        FieldSelectionError,
        match=f"selection is not a field or valid field index: '{field_name}'",
    ):
        create_enrich_table_by_join_type(
            join_type=EnrichmentJoinType.LEFT,
            enriched_csv_file_name=str(enrich_detail.uuid),
            source_instance_file_path=csvfile_without_nested_dicts.source_instance.file.path,
            enrich_detail_instance=enrich_detail,
        )


@pytest.mark.parametrize(
    "join_type",
    [
        pytest.param(EnrichmentJoinType.LEFT, id="join_type=LEFT"),
        pytest.param(EnrichmentJoinType.RIGHT, id="join_type=RIGHT"),
        pytest.param(EnrichmentJoinType.INNER, id="join_type=INNER"),
    ],
)
def test_create_enrich_table_transform_column_to_string_from_number(
    join_type: EnrichmentJoinType, csvfile_with_number_in_column: CSVFile
):
    enrich_detail = csvfile_with_number_in_column.enrich_detail
    EnrichDetail.objects.filter(uuid=enrich_detail.uuid).update(
        join_type=join_type,
        is_flat=False,
        json_root_path="",
        selected_key="json_header1",
        selected_header="csv_header1",
    )

    csvfile_with_number_in_column.refresh_from_db()
    enrich_detail.refresh_from_db()

    output_path = create_enrich_table_by_join_type(
        join_type=join_type,
        enriched_csv_file_name=str(enrich_detail.uuid),
        source_instance_file_path=csvfile_with_number_in_column.source_instance.file.path,
        enrich_detail_instance=enrich_detail,
    )
    if join_type == EnrichmentJoinType.LEFT:
        response = [
            "csv_header1,csv_header2,json_header2,json_header3\n",
            "1,csv_row1_col2,json_row1_col2,json_row1_col3\n",
            "2,csv_row2_col2,json_row2_col2,json_row2_col3\n",
            "3,csv_row3_col2,,\n",
            "4,csv_row4_col2,,\n",
            "5,csv_row5_col2,,\n",
        ]
    elif join_type == EnrichmentJoinType.RIGHT:
        response = [
            "json_header1,json_header2,json_header3,csv_header2\n",
            "1,json_row1_col2,json_row1_col3,csv_row1_col2\n",
            "100,no_match,no_match,\n",
            "2,json_row2_col2,json_row2_col3,csv_row2_col2\n",
        ]
    else:
        response = [
            "csv_header1,csv_header2,json_header2,json_header3\n",
            "1,csv_row1_col2,json_row1_col2,json_row1_col3\n",
            "2,csv_row2_col2,json_row2_col2,json_row2_col3\n",
        ]

    with open(output_path) as f:
        assert f.readlines() == response
