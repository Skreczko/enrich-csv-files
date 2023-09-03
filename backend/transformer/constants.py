from enum import Enum


class CsvListSortColumn(str, Enum):
    CREATED_ASC = "created"
    CREATED_DESC = "-created"
