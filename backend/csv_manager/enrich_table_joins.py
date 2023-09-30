from collections.abc import Iterable
from typing import Any

import flatdict
from petl import FieldSelectionError

from csv_manager.enums import EnrichmentJoinType
import petl as etl
import ijson.backends.yajl2 as ijson

from csv_manager.types import PetlTableJoinParams
from csv_manager.models import EnrichDetail


def create_csv_from_table(merged_table: Any, output_path: str) -> str:
    """
    Converts a given table into a CSV file at a specified path.

    :param merged_table: Table data to be written to a CSV file.
    :param output_path: The path where the CSV file should be saved.
    :return: The path to the created CSV file.
    """
    try:
        etl.tocsv(merged_table, output_path)
    except FieldSelectionError:
        raise FieldSelectionError(output_path.rsplit("/", 1)[-1])
    return output_path


def handle_table_left_join(
    output_path: str,
    table_create_params: PetlTableJoinParams,
) -> str:
    """
    Performs a left join operation between two tables and exports the merged data into a CSV file.

    :param output_path: Path where the resultant CSV after join will be stored.
    :param table_create_params: Parameters for the join operation including tables, keys, and prefixes.
    :return: The path to the created CSV file after the join operation.
    """

    merged_table = etl.leftjoin(**table_create_params)
    return create_csv_from_table(merged_table, output_path)


def handle_table_right_join(
    output_path: str,
    table_create_params: PetlTableJoinParams,
) -> str:
    """
    Performs a right join operation between two tables and exports the merged data into a CSV file.

    This function essentially performs a left join but with reversed table parameters.
    The left table becomes the right and vice versa. Similarly, the left key becomes the right key and vice versa.

    :param output_path: Path where the resultant CSV after join will be stored.
    :param table_create_params: Parameters for the join operation including tables, keys, and prefixes.
    :return: The path to the created CSV file after the join operation.
    """

    merged_table = etl.leftjoin(
        **{
            "left": table_create_params["right"],
            "right": table_create_params["left"],
            "lkey": table_create_params["rkey"],
            "rkey": table_create_params["lkey"],
            "lprefix": table_create_params["rprefix"],
            "rprefix": table_create_params["lprefix"],
        }
    )
    return create_csv_from_table(merged_table, output_path)


def handle_table_inner_join(
    output_path: str,
    table_create_params: PetlTableJoinParams,
) -> str:
    """
    Performs an inner join operation between two tables and exports the merged data into a CSV file.

    :param output_path: Path where the resultant CSV after join will be stored.
    :param table_create_params: Parameters for the join operation including tables, keys, and prefixes.
    :return: The path to the created CSV file after the join operation.
    """

    merged_table = etl.join(**table_create_params)
    return create_csv_from_table(merged_table, output_path)


def create_enrich_table_by_join_type(
    *,
    join_type: EnrichmentJoinType,
    enriched_csv_file_name: str,
    source_instance_file_path: str,
    enrich_detail_instance: "EnrichDetail",
    csv_file_join_prefix: str = "",
    enrich_detail_join_prefix: str = "",
) -> str:
    """
    Creates an enriched table based on the specified join type.

    This function takes a source CSV file and enrichment details to produce an enriched CSV file.
    The enrichment is based on the specified join type. The function supports LEFT, RIGHT, and INNER joins.
    The enrichment details can be either flat or nested. If they are flat, the function uses the flatdict
    library in conjunction with ijson to efficiently flatten the details on-the-fly without loading the entire
    JSON file into memory.

    :param join_type: The type of join to be performed (e.g., LEFT, RIGHT, INNER).
    :param enriched_csv_file_name: The name of the file after enrichment.
    :param source_instance_file_path: Path to the source CSV file.
    :param enrich_detail_instance: Instance containing details for enrichment.
    :param csv_file_join_prefix: Optional prefix for columns from the CSV file.
    :param enrich_detail_join_prefix: Optional prefix for columns from the enrichment details.
    :return: The path to the enriched CSV file.

    Note:
    - The function uses the flatdict library for flattening dictionaries when the enrichment details are flat.
      This library was chosen based on its performance benchmarks.
      More details can be found at:
      https://www.freecodecamp.org/news/how-to-flatten-a-dictionary-in-python-in-4-different-ways/
    - The function leverages ijson[yajl2] to parse the JSON file iteratively, allowing for efficient memory usage.
    - The petl library is used for data transformation and table operations.
    """

    join_switch = {
        EnrichmentJoinType.LEFT: handle_table_left_join,
        EnrichmentJoinType.RIGHT: handle_table_right_join,
        EnrichmentJoinType.INNER: handle_table_inner_join,
    }

    output_path = (
        f"{source_instance_file_path.rsplit('/', 1)[0]}/{enriched_csv_file_name}.csv"
    )

    # create table from csv file
    csv_file_table = etl.fromcsv(source_instance_file_path)

    # create table from external api response json file
    if enrich_detail_instance.is_flat:

        def flattened_data_generator() -> Iterable:
            """
            Generator function to yield flattened dictionaries from a JSON file.

            This function reads a JSON file iteratively using ijson[yajl2]. For each item in the JSON,
            it flattens the nested structures using the flatdict library and yields the flattened dictionary.

            :yield: A flattened dictionary for each item in the JSON file.
            """

            # Determine the root path in the JSON structure from which data should be extracted.
            # If a specific root path is provided in the `enrich_detail`, it's used as the base path and appended with ".item".
            # Otherwise, the default "item" is used as the root path.
            json_root_path = (
                f"{enrich_detail_instance.json_root_path}.item"
                if enrich_detail_instance.json_root_path
                else "item"
            )

            with open(enrich_detail_instance.external_response.path) as f:
                for item in ijson.items(f, json_root_path):
                    flattened_item = flatdict.FlatDict(item, delimiter="_")
                    yield dict(
                        flattened_item
                    )  # type: ignore # ignore mypy is asking to overload, but using
                    # flattened_item.as_dict() or dict(flattened_item.items())  make it work for mypy,
                    # but dict is not flatten. To fix in future development

        external_response_table = etl.fromdicts(flattened_data_generator())
    else:
        external_response_table = etl.fromjson(
            enrich_detail_instance.external_response.path
        )

    handler = join_switch.get(join_type)

    if not handler:
        raise ValueError("Invalid join type")

    return handler(
        output_path,
        table_create_params=PetlTableJoinParams(
            left=csv_file_table,
            right=external_response_table,
            lkey=enrich_detail_instance.selected_header,
            rkey=enrich_detail_instance.selected_key,
            lprefix=csv_file_join_prefix,
            rprefix=enrich_detail_join_prefix,
        ),
    )
