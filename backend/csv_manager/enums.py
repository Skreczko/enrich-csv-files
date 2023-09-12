from enum import Enum, StrEnum, auto


class CsvListSortColumn(str, Enum):
    CREATED_ASC = "created"
    CREATED_DESC = "-created"


class EnrichmentStatus(StrEnum):
    # initiation section
    INITIATED = auto()

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


class EnrichmentJoinType(StrEnum):
    """
    full join not included as does not meet task requirements
    """

    LEFT = auto()
    RIGHT = auto()
    INNER = auto()
