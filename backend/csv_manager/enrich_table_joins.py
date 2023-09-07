from typing import Any, TYPE_CHECKING

from csv_manager.enums import EnrichmentJoinType
import petl as etl

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
    table1: Any,
    table2: Any,
    lkey: str,
    rkey: str,
    lprefix: str,
    rprefix: str,
    output_path: str,
) -> str:
    """
    Performs a left join operation between two tables and exports the merged data into a CSV file.

    :param table1: The left table for the join operation.
    :param table2: The right table for the join operation.
    :param lkey: The key column for the left table.
    :param rkey: The key column for the right table.
    :param lprefix: Prefix for columns from the left table.
    :param rprefix: Prefix for columns from the right table.
    :param output_path: Path where the resultant CSV after join will be stored.
    :return: The path to the created CSV file after the join operation.
    """

    merged_table = etl.leftjoin(
        table1, table2, lkey=lkey, rkey=rkey, lprefix=lprefix, rprefix=rprefix
    )
    return create_csv_from_table(merged_table, output_path)


def handle_table_right_join(
    table1: Any,
    table2: Any,
    lkey: str,
    rkey: str,
    lprefix: str,
    rprefix: str,
    output_path: str,
) -> str:
    """
    Performs a right join operation between two tables and exports the merged data into a CSV file.

    :param table1: The right table for the join operation.
    :param table2: The left table for the join operation.
    :param lkey: The key column for the right table.
    :param rkey: The key column for the left table.
    :param lprefix: Prefix for columns from the right table.
    :param rprefix: Prefix for columns from the left table.
    :param output_path: Path where the resultant CSV after join will be stored.
    :return: The path to the created CSV file after the join operation.
    """

    merged_table = etl.leftjoin(
        table2, table1, lkey=rkey, rkey=lkey, lprefix=rprefix, rprefix=lprefix
    )
    return create_csv_from_table(merged_table, output_path)


def handle_table_inner_join(
    table1: Any,
    table2: Any,
    lkey: str,
    rkey: str,
    lprefix: str,
    rprefix: str,
    output_path: str,
) -> str:
    """
    Performs an inner join operation between two tables and exports the merged data into a CSV file.

    :param table1: The left table for the join operation.
    :param table2: The right table for the join operation.
    :param lkey: The key column for the left table.
    :param rkey: The key column for the right table.
    :param lprefix: Prefix for columns from the left table.
    :param rprefix: Prefix for columns from the right table.
    :param output_path: Path where the resultant CSV after join will be stored.
    :return: The path to the created CSV file after the join operation.
    """

    merged_table = etl.join(
        table1, table2, lkey=lkey, rkey=rkey, lprefix=lprefix, rprefix=rprefix
    )
    return create_csv_from_table(merged_table, output_path)


def create_enrich_table_by_join_type(
    *,
    join_type: EnrichmentJoinType,
    enriched_file_name=str,
    source_instance_file_path: str,
    enrich_detail_instance: "EnrichDetail",
    csv_file_join_prefix: str = "",
    enrich_detail_join_prefix: str = "",
) -> str:
    """
    Creates an enriched table based on the specified join type.

    :param join_type: The type of join to be performed (e.g., LEFT, RIGHT, INNER).
    :param enriched_file_name: The name of the file after enrichment.
    :param source_instance_file_path: Path to the source CSV file.
    :param enrich_detail_instance: Instance containing details for enrichment.
    :param csv_file_join_prefix: Optional prefix for columns from the CSV file.
    :param enrich_detail_join_prefix: Optional prefix for columns from the enrichment details.
    :return: The path to the enriched CSV file.

    Note:
    - Only supported join types are allowed.
    - Invalid join type will return an error message.
    """

    join_switch = {
        EnrichmentJoinType.LEFT: handle_table_left_join,
        EnrichmentJoinType.RIGHT: handle_table_right_join,
        EnrichmentJoinType.INNER: handle_table_inner_join,
    }

    # set up output path with correct file naming
    output_path = (
        f"{source_instance_file_path.rsplit('/', 1)[0]}/{enriched_file_name}.csv"
    )

    # create table from csv file
    csv_file_table = etl.fromcsv(source_instance_file_path)

    # create table from external api response -
    if enrich_detail_instance.is_flat:
        # used flatdict library as this provides the best performance benchmark
        # https://www.freecodecamp.org/news/how-to-flatten-a-dictionary-in-python-in-4-different-ways/
        import flatdict

        flatten_dict = flatdict.FlatDict(enrich_detail_instance.external_response, delimiter='_')
        external_response_table = etl.fromdicts(flatten_dict)
    else:
        external_response_table = etl.fromdicts(enrich_detail_instance.external_response)


    handler = join_switch.get(join_type)

    if handler:
        return handler(
            csv_file_table,
            external_response_table,
            enrich_detail_instance.selected_header,
            enrich_detail_instance.selected_key,
            csv_file_join_prefix,
            enrich_detail_join_prefix,
            output_path,
        )
    else:
        # todo think what to return
        return "Invalid join type"
