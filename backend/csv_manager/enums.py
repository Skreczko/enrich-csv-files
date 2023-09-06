from enum import Enum, StrEnum, auto


class CsvListSortColumn(str, Enum):
    CREATED_ASC = "created"
    CREATED_DESC = "-created"


class EnrichmentStatus(StrEnum):
    IN_PROGRESS = auto()
    FINISHED = auto()
    FAILED = auto()
    INITIATED = auto()
