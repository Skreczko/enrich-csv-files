from enum import Enum, StrEnum, auto


class CsvListSortColumn(str, Enum):
    CREATED_ASC = "created"
    CREATED_DESC = "-created"


class EnrichmentStatus(StrEnum):
    INITIATED = auto()
    FETCHING_RESPONSE = auto()
    AWAITING_COLUMN_SELECTION = auto()
    MERGING = auto()
    COMPLETED = auto()
    FAILED_FETCHING_RESPONSE = auto()
    FAILED_COLUMN_SELECTION = auto()
    FAILED_MERGING = auto()
    FAILED = auto()




class EnrichmentJoinType(StrEnum):
    """
    full join not included as does not meet task requirements
    """

    LEFT = auto()
    RIGHT = auto()
    INNER = auto()
