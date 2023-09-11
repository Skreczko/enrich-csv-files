from collections.abc import Iterable
from typing import Any, TYPE_CHECKING


from csv_manager.enums import EnrichmentJoinType
import petl as etl

from csv_manager.types import PetlTableJoinParams

if TYPE_CHECKING:
    from csv_manager.models import EnrichDetail  # noqa


def create_csv_from_table(merged_table: Any, output_path: str) -> str:
    """
    Converts a given table into a CSV file at a specified path.

    :param merged_table: Table data to be written to a CSV file.
    :param output_path: The path where the CSV file should be saved.
    :return: The path to the created CSV file.
    """

    etl.tocsv(merged_table, output_path)
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
    enriched_file_name: str,
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
    library to flatten the details for better performance.

    :param join_type: The type of join to be performed (e.g., LEFT, RIGHT, INNER).
    :param enriched_file_name: The name of the file after enrichment.
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
    """

    join_switch = {
        EnrichmentJoinType.LEFT: handle_table_left_join,
        EnrichmentJoinType.RIGHT: handle_table_right_join,
        EnrichmentJoinType.INNER: handle_table_inner_join,
    }

    # set up output path with correct file naming

    #todo

    # https://stackoverflow.com/questions/72418227/access-upload-to-of-a-models-filefield-in-django
    output_path = (
        f"{source_instance_file_path.rsplit('/', 1)[0]}/{enriched_file_name}.csv"
    )

    # create table from csv file
    csv_file_table = etl.fromcsv(source_instance_file_path)

    # create table from external api response
    if enrich_detail_instance.is_flat:
        # used flatdict library as this provides the best performance benchmark
        def flat_dict_generator(dicts: dict[str, Any]) -> Iterable:
            import flatdict

            for d in dicts:
                yield flatdict.FlatDict(d, delimiter="_")

        flatten_external_response = flat_dict_generator(
            enrich_detail_instance.external_response
        )
        external_response_table = etl.fromdicts(flatten_external_response)
    else:
        external_response_table = etl.fromdicts(
            enrich_detail_instance.external_response
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
