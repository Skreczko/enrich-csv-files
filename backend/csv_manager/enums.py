from enum import Enum, StrEnum, auto


class CsvListSortColumn(str, Enum):
    CREATED_ASC = "created"
    CREATED_DESC = "-created"
    ORIGINAL_FILE_NAME_ASC = "original_file_name"
    ORIGINAL_FILE_NAME_DESC = "-original_file_name"
    STATUS_ASC = 'status'
    STATUS_DESC = '-status'
    SOURCE_ORIGINAL_FILE_NAME_ASC = "source_original_file_name"
    SOURCE_ORIGINAL_FILE_NAME_DESC = "-source_original_file_name"
    ENRICH_URL_ASC = "enrich_url"
    ENRICH_URL_DESC = "-enrich_url"


class CsvListStatusFilter(StrEnum):
    COMPLETED = auto()
    FAILED = auto()
    IN_PROGRESS = auto()

class CsvListFileTypeFilter(StrEnum):
    SOURCE = auto()
    ENRICHED = auto()


class EnrichmentStatus(StrEnum):
    # fetching api response section
    FETCHING_RESPONSE = auto()
    FAILED_FETCHING_RESPONSE = auto()
    FAILED_FETCHING_RESPONSE_INCORRECT_URL_STATUS = auto()
    FAILED_FETCHING_RESPONSE_OTHER_REQUEST_EXCEPTION = auto()
    FAILED_FETCHING_RESPONSE_NOT_JSON = auto()
    FAILED_FETCHING_RESPONSE_EMPTY_JSON = auto()

    # user action section
    AWAITING_COLUMN_SELECTION = auto()
    FAILED_COLUMN_SELECTION = auto()

    # enriching section
    ENRICHING = auto()
    FAILED_ENRICHING = auto()

    # completed
    COMPLETED = auto()

    @classmethod
    def get_all_values(cls, reverse: bool = False) -> list[str]:
        value_list = [item.value for item in cls]
        return value_list[::-1] if reverse else value_list


class EnrichmentJoinType(StrEnum):
    """
    full join not included as does not meet task requirements
    """

    LEFT = auto()
    RIGHT = auto()
    INNER = auto()
